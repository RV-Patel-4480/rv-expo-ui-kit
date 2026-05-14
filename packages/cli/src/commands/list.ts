import { Command } from "commander";
import chalk from "chalk";
import ora from "ora";
import { getRegistry } from "../utils/registry";

export const listCommand = new Command("list")
  .description("List all available components")
  .action(async () => {
    const spinner = ora("Fetching registry...").start();
    try {
      const registry = await getRegistry();
      spinner.succeed("Available components:");
      
      registry.components.forEach((c: any) => {
        console.log(`\n  ${chalk.bold.cyan(c.name)} ${chalk.dim(`(v${c.version})`)}`);
        console.log(`  ${c.description}`);
        if (c.dependencies?.length) {
          console.log(`  ${chalk.dim("Deps:")} ${c.dependencies.join(", ")}`);
        }
      });
      console.log();
    } catch (error: any) {
      spinner.fail("Failed to fetch registry");
      console.error(chalk.red(error.message));
    }
  });
