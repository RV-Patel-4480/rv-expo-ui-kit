import { Command } from "commander";
import chalk from "chalk";
import ora from "ora";
import fs from "fs-extra";
import path from "path";
import inquirer from "inquirer";
import { getRegistry, getComponentFileContent } from "../utils/registry";
import { readConfig, getProjectRoot, writeConfig } from "../utils/project";
import { checkDependencies, installDependencies } from "../utils/deps";

export const addCommand = new Command("add")
  .description("Install components into your project")
  .argument("[components...]", "Names of components to install")
  .option("--dir <path>", "Override output directory")
  .option("--no-install", "Skip dependency installation")
  .option("--overwrite", "Overwrite existing files without prompting")
  .action(async (components: string[], options: any) => {
    if (components.length === 0) {
      console.error(chalk.red("Please specify at least one component to add."));
      return;
    }

    const config = await readConfig();
    if (!config) {
      console.error(chalk.red("Configuration file not found. Please run 'npx rv-expo-ui init' first."));
      return;
    }

    const outDir = options.dir || config.outputDir;
    const fullOutDir = path.join(getProjectRoot(), outDir);

    const spinner = ora("Fetching registry...").start();
    let registry;
    try {
      registry = await getRegistry();
      spinner.succeed("Registry fetched.");
    } catch (error: any) {
      spinner.fail("Failed to fetch registry");
      console.error(chalk.red(error.message));
      return;
    }

    const depsToInstall = new Set<string>();

    for (const componentName of components) {
      console.log(`\nInstalling ${chalk.cyan(componentName)}...`);
      const component = registry.components.find((c: any) => c.name === componentName);
      
      if (!component) {
        console.log(chalk.red(`✕ Component "${componentName}" not found.`));
        continue;
      }

      await fs.ensureDir(fullOutDir);

      let allFilesWritten = true;

      for (const file of component.files) {
        const fileSpinner = ora(`Fetching ${file}...`).start();
        try {
          const content = await getComponentFileContent(componentName, file);
          
          const filePath = path.join(fullOutDir, file);
          
          if (await fs.pathExists(filePath) && !options.overwrite) {
            fileSpinner.stop();
            const { overwrite } = await inquirer.prompt([
              {
                type: "confirm",
                name: "overwrite",
                message: `File ${file} already exists. Overwrite?`,
                default: false,
              },
            ]);
            if (!overwrite) {
              console.log(chalk.yellow(`- Skipped ${file}`));
              continue;
            }
            fileSpinner.start(`Overwriting ${file}...`);
          }

          await fs.writeFile(filePath, content);
          fileSpinner.succeed(`Saved ${file}`);
        } catch (error: any) {
          fileSpinner.fail(`Failed to fetch ${file}`);
          console.error(chalk.red(error.message));
          allFilesWritten = false;
        }
      }

      if (allFilesWritten) {
        if (!config.installedComponents.includes(componentName)) {
          config.installedComponents.push(componentName);
          await writeConfig(config);
        }
        
        if (component.dependencies) {
          component.dependencies.forEach((d: string) => depsToInstall.add(d));
        }
      }
    }

    if (depsToInstall.size > 0 && options.install !== false) {
      const depsArray = Array.from(depsToInstall);
      console.log(`\nChecking dependencies: ${chalk.cyan(depsArray.join(", "))}`);

      const { toInstall, skipped, declined } = await checkDependencies(depsArray);

      if (declined.length > 0) {
        console.log(
          chalk.yellow(`\n  ⚠  Kept incompatible versions: ${declined.join(", ")}`) +
          chalk.dim(" — things may not work correctly.")
        );
      }

      if (toInstall.length > 0) {
        const installSpinner = ora(`Running expo install ${toInstall.join(" ")}...`).start();
        try {
          await installDependencies(toInstall);
          installSpinner.succeed(`Installed: ${toInstall.join(", ")}`);
        } catch (error: any) {
          installSpinner.fail("Failed to install dependencies.");
          console.error(chalk.red(error.message));
        }
      } else if (skipped.length > 0 && declined.length === 0) {
        console.log(chalk.green("  ✓ All dependencies already satisfied — nothing to install."));
      }
    }

    console.log(chalk.green("\n✓ Done!"));
  });
