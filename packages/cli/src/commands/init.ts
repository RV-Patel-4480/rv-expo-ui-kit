import { Command } from "commander";
import inquirer from "inquirer";
import chalk from "chalk";
import path from "path";
import { hasConfig, writeConfig, getProjectRoot } from "../utils/project";

export const initCommand = new Command("init")
  .description("Initialize rv-expo-ui configuration")
  .action(async () => {
    if (await hasConfig()) {
      console.log(chalk.yellow("Configuration file already exists."));
      const { overwrite } = await inquirer.prompt([
        {
          type: "confirm",
          name: "overwrite",
          message: "Do you want to overwrite it?",
          default: false,
        },
      ]);
      if (!overwrite) return;
    }

    const { outputDir } = await inquirer.prompt([
      {
        type: "input",
        name: "outputDir",
        message: "Where should components be installed?",
        default: "components/ui",
      },
    ]);

    const defaultConfig = {
      outputDir,
      theme: {
        colors: {
          primary: "#6366F1",
          background: "#FFFFFF",
          foreground: "#18181B",
          border: "#E4E4E7",
          destructive: "#EF4444",
          muted: "#F4F4F5",
          mutedForeground: "#71717A",
          popover: "#FFFFFF",
          popoverForeground: "#18181B",
          card: "#FFFFFF",
        },
        borderRadius: {
          sm: 4,
          md: 8,
          lg: 12,
        },
        spacing: {
          xs: 4,
          sm: 8,
          md: 12,
          lg: 16,
          xl: 24,
        },
        fontSize: {
          xs: 11,
          sm: 13,
          md: 15,
          lg: 17,
        },
      },
      installedComponents: [],
    };

    await writeConfig(defaultConfig);
    console.log(chalk.green(`\n✓ Initialized rv-expo-ui configuration at ${path.join(getProjectRoot(), "rv-expo-ui.json")}`));
    console.log(`\nYou can now run ${chalk.cyan("npx rv-expo-ui add <component>")} to install components.\n`);
  });
