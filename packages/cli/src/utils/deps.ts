import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs-extra";
import path from "path";
import { getProjectRoot } from "./project";

const execAsync = promisify(exec);

export async function installDependencies(deps: string[]) {
  if (deps.length === 0) return;
  
  const root = getProjectRoot();
  const cmd = `npx expo install ${deps.join(" ")}`;
  
  await execAsync(cmd, { cwd: root });
}
