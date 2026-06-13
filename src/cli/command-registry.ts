import { parseArgs } from "./args.js";
import type { CliOutput, CliRuntime } from "./output.js";
import { runAgentsCommand } from "./commands/master-agents.js";
import { runDoctorCommand } from "./commands/master-doctor.js";
import { runMasterGitCommand } from "./commands/master-git.js";
import { runInitCommand } from "./commands/master-init.js";
import { getMasterCommandHelp } from "./commands/master-help.js";
import { getPlannedCommandOutput } from "./commands/planned-command.js";
import { getRootHelp } from "./commands/root-help.js";
import { getStatusOutput } from "./commands/master-status.js";
import { getVersionOutput } from "./commands/master-version.js";
import { runGateCommand } from "../gates/gate-runner.js";
import { runGovernanceCommand } from "../governance/governance-runner.js";
import { runImplementCommand } from "../implementation/implement-command.js";
import { runSkillsCommand } from "../skills/skill-command.js";
import { runUiuxCommand } from "../uiux/uiux-command.js";
import { runWorkflowCommand } from "../workflow/workflow-runner.js";

export async function runCommand(
  args: string[],
  output: CliOutput,
  runtime: CliRuntime
): Promise<number> {
  const command = parseArgs(args);

  switch (command.kind) {
    case "root-help":
      output.stdout(getRootHelp());
      return 0;
    case "version":
      output.stdout(getVersionOutput());
      return 0;
    case "master-help":
      output.stdout(getMasterCommandHelp());
      return 0;
    case "master-command-help":
      output.stdout(getMasterCommandHelp(command.command));
      return 0;
    case "master-status":
      output.stdout(getStatusOutput(runtime.cwd));
      return 0;
    case "master-init":
      return runInitCommand(command.args, output, runtime);
    case "master-doctor":
      return runDoctorCommand(command.args, output, runtime);
    case "master-agents":
      return runAgentsCommand(command.args, output, runtime);
    case "master-git":
      return runMasterGitCommand(command.args, output, runtime);
    case "master-skills":
      return runSkillsCommand(command.args, output, runtime);
    case "master-uiux":
      return runUiuxCommand(command.args, output, runtime);
    case "master-workflow":
      return runWorkflowCommand(command.command, command.args, output, runtime);
    case "master-governance":
      return runGovernanceCommand(command.command, command.args, output, runtime);
    case "master-gate":
      return runGateCommand(command.command, command.args, output, runtime);
    case "master-implement":
      return runImplementCommand(command.args, output, runtime);
    case "planned-command":
      output.stdout(getPlannedCommandOutput(command.command));
      return 0;
    case "unknown":
      output.stderr(getUnknownCommandOutput(command.command, command.scope));
      return 1;
  }
}

function getUnknownCommandOutput(command: string, scope: "root" | "master"): string {
  if (scope === "master") {
    return `Comando desconhecido: ${command}

Use:
  sdd master help
`;
  }

  return `Comando desconhecido: ${command}

Use:
  sdd --help
`;
}
