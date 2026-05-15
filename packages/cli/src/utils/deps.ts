import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs-extra";
import path from "path";
import inquirer from "inquirer";
import chalk from "chalk";
import { getProjectRoot } from "./project";

const execAsync = promisify(exec);

// ─── Semver helpers ──────────────────────────────────────────────────────────
// We intentionally avoid pulling in the full `semver` package to keep the CLI
// dependency-light.  These helpers cover the subset of range syntax that
// appears in real Expo / React-Native package.json files.

/** Strip leading range characters (~, ^, >=, <=, >, <, =) and whitespace. */
function stripRange(v: string): string {
  return v.replace(/^[\^~>=<\s]+/, "").trim();
}

/** Parse "MAJOR.MINOR.PATCH[-prerelease]" into numeric parts. */
function parseParts(v: string): [number, number, number] {
  const [major = 0, minor = 0, patch = 0] = stripRange(v)
    .split(/[-+]/)[0]          // drop pre-release / build metadata
    .split(".")
    .map(Number);
  return [major, minor, patch];
}

/**
 * Returns true when `installed` satisfies the `required` range.
 * Supports: exact, ^, ~, >=, <=, >, <.
 * Falls back to a loose major-version equality check for anything exotic.
 */
function satisfies(installed: string, required: string): boolean {
  const raw = required.trim();

  // Wildcards / "any"
  if (raw === "*" || raw === "latest" || raw === "") return true;

  const [iMaj, iMin, iPat] = parseParts(installed);
  const [rMaj, rMin, rPat] = parseParts(required);

  if (raw.startsWith("^")) {
    // Compatible with same major
    if (iMaj !== rMaj) return false;
    if (iMin !== rMin) return iMin > rMin;
    return iMin > rMin || iPat >= rPat;
  }
  if (raw.startsWith("~")) {
    // Compatible with same major.minor
    if (iMaj !== rMaj || iMin !== rMin) return false;
    return iPat >= rPat;
  }
  if (raw.startsWith(">=")) return compare(installed, required) >= 0;
  if (raw.startsWith("<=")) return compare(installed, required) <= 0;
  if (raw.startsWith(">"))  return compare(installed, required) > 0;
  if (raw.startsWith("<"))  return compare(installed, required) < 0;

  // Exact match
  return stripRange(installed) === stripRange(required);
}

/** -1 | 0 | 1 comparison between two version strings. */
function compare(a: string, b: string): number {
  const [aMaj, aMin, aPat] = parseParts(a);
  const [bMaj, bMin, bPat] = parseParts(b);
  if (aMaj !== bMaj) return aMaj > bMaj ? 1 : -1;
  if (aMin !== bMin) return aMin > bMin ? 1 : -1;
  if (aPat !== bPat) return aPat > bPat ? 1 : -1;
  return 0;
}

// ─── Public API ──────────────────────────────────────────────────────────────

export interface DepCheckResult {
  /** Packages that need to be passed to `expo install`. */
  toInstall: string[];
  /** Packages that were skipped because the user already has a compatible version. */
  skipped: string[];
  /** Packages where the user chose to skip an incompatible upgrade. */
  declined: string[];
}

/**
 * Reads the user's package.json, compares each required dependency against
 * what is already installed, and returns three buckets:
 *   - toInstall   → not present OR user confirmed upgrade of incompatible version
 *   - skipped     → already present and compatible
 *   - declined    → incompatible but user chose NOT to upgrade
 *
 * @param deps  Package names (optionally with `@version` suffix) required by the component.
 */
export async function checkDependencies(deps: string[]): Promise<DepCheckResult> {
  const root = getProjectRoot();
  const pkgPath = path.join(root, "package.json");

  let userPkg: Record<string, any> = {};
  if (await fs.pathExists(pkgPath)) {
    userPkg = await fs.readJson(pkgPath);
  }

  const allInstalled: Record<string, string> = {
    ...(userPkg.dependencies ?? {}),
    ...(userPkg.devDependencies ?? {}),
    ...(userPkg.peerDependencies ?? {}),
  };

  const toInstall: string[] = [];
  const skipped: string[] = [];
  const declined: string[] = [];

  for (const dep of deps) {
    // dep can be "react-native-safe-area-context" or "some-pkg@^3.0.0"
    const atIdx = dep.lastIndexOf("@", dep.length - 1);
    const hasVersion = atIdx > 0; // atIdx > 0 guards against scoped "@scope/pkg"
    const pkgName    = hasVersion ? dep.slice(0, atIdx) : dep;
    const reqVersion = hasVersion ? dep.slice(atIdx + 1) : "";

    const installedVersion = allInstalled[pkgName];

    // ── Case 1: Not installed at all → always install ─────────────────────
    if (!installedVersion) {
      toInstall.push(dep);
      continue;
    }

    // ── Case 2: No version pinned in registry → already present, skip ─────
    if (!reqVersion) {
      console.log(
        chalk.green(`  ✓ ${pkgName}`) +
        chalk.dim(` ${installedVersion} (already installed)`)
      );
      skipped.push(pkgName);
      continue;
    }

    // ── Case 3: Installed version satisfies the requirement → skip ─────────
    if (satisfies(installedVersion, reqVersion)) {
      console.log(
        chalk.green(`  ✓ ${pkgName}`) +
        chalk.dim(` ${installedVersion} satisfies ${reqVersion}`)
      );
      skipped.push(pkgName);
      continue;
    }

    // ── Case 4: Incompatible version → warn and ask ────────────────────────
    const isDowngrade = compare(installedVersion, reqVersion) > 0;
    const severity    = isDowngrade ? chalk.yellow("⚠  Downgrade") : chalk.red("✕ Incompatible");

    console.log(`\n  ${severity}: ${chalk.bold(pkgName)}`);
    console.log(
      `    Installed : ${chalk.yellow(installedVersion)}\n` +
      `    Required  : ${chalk.cyan(reqVersion)}`
    );
    if (isDowngrade) {
      console.log(chalk.dim("    Your version is newer — this is usually fine."));
    }

    const { action } = await inquirer.prompt([
      {
        type: "list",
        name: "action",
        message: `What would you like to do with ${chalk.bold(pkgName)}?`,
        choices: [
          { name: `Install required version (${reqVersion})`, value: "install" },
          { name: "Keep current version (may cause issues)", value: "skip" },
        ],
      },
    ]);

    if (action === "install") {
      toInstall.push(dep);
    } else {
      declined.push(pkgName);
    }
  }

  return { toInstall, skipped, declined };
}

/**
 * Runs `expo install` for all packages in `deps`.
 */
export async function installDependencies(deps: string[]): Promise<void> {
  if (deps.length === 0) return;
  const root = getProjectRoot();
  const cmd = `npx expo install ${deps.join(" ")}`;
  await execAsync(cmd, { cwd: root });
}
