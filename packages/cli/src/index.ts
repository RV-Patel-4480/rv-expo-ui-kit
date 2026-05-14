#!/usr/bin/env node

import { Command } from "commander";
import { initCommand } from "./commands/init";
import { listCommand } from "./commands/list";
import { addCommand } from "./commands/add";
import { infoCommand } from "./commands/info";
import { CLI_NAME } from "./config";
import packageJson from "../package.json";

const program = new Command();

program
  .name(CLI_NAME)
  .description("CLI to add production-ready Expo components to your project")
  .version(packageJson.version);

program.addCommand(initCommand);
program.addCommand(listCommand);
program.addCommand(addCommand);
program.addCommand(infoCommand);

program.parse(process.argv);
