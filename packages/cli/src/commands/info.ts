import { Command } from "commander";
import chalk from "chalk";
import ora from "ora";
import { getRegistry } from "../utils/registry";

export const infoCommand = new Command("info")
  .description("Show details for a component")
  .argument("<component>", "Name of the component")
  .action(async (componentName: string) => {
    const spinner = ora(`Fetching info for ${componentName}...`).start();
    try {
      const registry = await getRegistry();
      const component = registry.components.find((c: any) => c.name === componentName);
      
      if (!component) {
        spinner.fail(`Component "${componentName}" not found in registry.`);
        return;
      }
      
      spinner.stop();
      
      console.log(`\n${chalk.bold.cyan(component.name)} ${chalk.dim(`(v${component.version})`)}`);
      console.log(`${component.description}\n`);
      
      console.log(chalk.bold("Files:"));
      component.files.forEach((f: string) => console.log(`  - ${f}`));
      
      if (component.dependencies?.length) {
        console.log(`\n${chalk.bold("Dependencies:")}`);
        component.dependencies.forEach((d: string) => console.log(`  - ${d}`));
      }
      
      if (component.preview) {
        console.log(`\n${chalk.bold("Preview:")}`);
        console.log(chalk.dim("----------------------------------------"));
        console.log(component.preview);
        console.log(chalk.dim("----------------------------------------\n"));
      }
    } catch (error: any) {
      spinner.fail("Failed to fetch info");
      console.error(chalk.red(error.message));
    }
  });
