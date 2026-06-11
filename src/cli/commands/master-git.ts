import { runGitCommand } from "../../git/git.js";
import type { CliOutput, CliRuntime } from "../output.js";

export function runMasterGitCommand(args: string[], output: CliOutput, runtime: CliRuntime): number {
  const result = runGitCommand(runtime.cwd, args);

  if (result.error) output.stderr(result.error);
  if (result.output) output.stdout(result.output);

  return result.exitCode;
}
