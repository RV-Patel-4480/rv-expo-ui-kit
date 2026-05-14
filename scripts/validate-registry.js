#!/usr/bin/env node
/**
 * Validates registry.json — run in CI or locally with: node scripts/validate-registry.js
 */
const fs = require("fs");
const path = require("path");

const REGISTRY_PATH = path.join(__dirname, "../registry/registry.json");

const REQUIRED_COMPONENT_FIELDS = [
  "name",
  "description",
  "version",
  "files",
  "dependencies",
  "peerDependencies",
  "tags",
];

let errors = 0;

function error(msg) {
  console.error(`  ✕  ${msg}`);
  errors++;
}

function ok(msg) {
  console.log(`  ✓  ${msg}`);
}

console.log("\nValidating registry.json...\n");

if (!fs.existsSync(REGISTRY_PATH)) {
  error("registry.json not found");
  process.exit(1);
}

let registry;
try {
  registry = JSON.parse(fs.readFileSync(REGISTRY_PATH, "utf8"));
} catch (e) {
  error(`Invalid JSON: ${e.message}`);
  process.exit(1);
}

if (!registry.version) error("Missing top-level 'version' field");
if (!Array.isArray(registry.components)) {
  error("Missing or invalid 'components' array");
  process.exit(1);
}

ok(`Registry version: ${registry.version}`);
ok(`${registry.components.length} components found`);

const names = new Set();

for (const component of registry.components) {
  const prefix = `[${component.name || "unknown"}]`;

  for (const field of REQUIRED_COMPONENT_FIELDS) {
    if (component[field] === undefined) {
      error(`${prefix} Missing required field: ${field}`);
    }
  }

  if (component.name) {
    if (names.has(component.name)) {
      error(`${prefix} Duplicate component name`);
    }
    names.add(component.name);

    if (!/^[a-z][a-z0-9-]*$/.test(component.name)) {
      error(`${prefix} Name must be lowercase kebab-case`);
    }
  }

  if (!Array.isArray(component.files) || component.files.length === 0) {
    error(`${prefix} 'files' must be a non-empty array`);
  }

  if (component.version && !/^\d+\.\d+\.\d+$/.test(component.version)) {
    error(`${prefix} Version must be semver (e.g. 1.0.0)`);
  }
}

console.log();

if (errors > 0) {
  console.error(`  ${errors} error(s) found. Fix them before pushing.\n`);
  process.exit(1);
} else {
  console.log("  All checks passed.\n");
}
