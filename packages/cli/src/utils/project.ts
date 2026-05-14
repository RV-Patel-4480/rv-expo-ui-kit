import path from "path";
import fs from "fs-extra";
import { CONFIG_FILE_NAME } from "../config";

export function getProjectRoot() {
  return process.cwd();
}

export function getConfigPath() {
  return path.join(getProjectRoot(), CONFIG_FILE_NAME);
}

export async function hasConfig() {
  return fs.pathExists(getConfigPath());
}

export async function readConfig() {
  if (!(await hasConfig())) return null;
  return fs.readJSON(getConfigPath());
}

export async function writeConfig(config: any) {
  await fs.writeJSON(getConfigPath(), config, { spaces: 2 });
}
