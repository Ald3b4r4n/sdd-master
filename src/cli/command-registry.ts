import { parseArgs } from "./args.js";
import type { CliOutput, CliRuntime } from "./output.js";
import { runAgentsCommand } from "./commands/master-agents.js";
import { runDoctorCommand } from "./commands/master-doctor.js";
import { runMasterGitCommand } from "./commands/master-git.js";
import { runInitCommand } from "./commands/master-init.js";
import { runOnboardCommand } from "./commands/master-onboard.js";
import { getMasterCommandHelp } from "./commands/master-help.js";
import { getRootHelp } from "./commands/root-help.js";
import { getStatusOutput } from "./commands/master-status.js";
import { getVersionOutput } from "./commands/master-version.js";
import { runGateCommand } from "../gates/gate-runner.js";
import { runGovernanceCommand } from "../governance/governance-runner.js";
import { runImplementCommand } from "../implementation/implement-command.js";
import { runDeployCommand } from "../delivery/deploy-command.js";
import { runReleaseCommand } from "../delivery/release-command.js";
import { runPluginsCommand } from "../plugins/plugin-command.js";
import { runSecurityCommand } from "../security/security-command.js";
import { runSkillsCommand } from "../skills/skill-command.js";
import { runUiuxCommand } from "../uiux/uiux-command.js";
import { runUpdateCommand } from "../update/update-command.js";
import { runWorkflowCommand } from "../workflow/workflow-runner.js";
import { unknownCommandMessage } from "../ux/error-format.js";

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
      output.stdout(getStatusOutput(runtime.cwd, command.args.includes("--json")));
      return 0;
    case "master-init":
      return runInitCommand(command.args, output, runtime);
    case "master-onboard":
      return runOnboardCommand(command.args, output, runtime);
    case "master-doctor":
      return runDoctorCommand(command.args, output, runtime);
    case "master-agents":
      return runAgentsCommand(command.args, output, runtime);
    case "master-git":
      return runMasterGitCommand(command.args, output, runtime);
    case "master-security":
      return runSecurityCommand(command.args, output, runtime);
    case "master-skills":
      return runSkillsCommand(command.args, output, runtime);
    case "master-plugins":
      return runPluginsCommand(command.args, output, runtime);
    case "master-uiux":
      return runUiuxCommand(command.args, output, runtime);
    case "master-update":
      return runUpdateCommand(command.args, output, runtime);
    case "master-release":
      return runReleaseCommand(command.args, output, runtime);
    case "master-deploy":
      return runDeployCommand(command.args, output, runtime);
    case "master-workflow":
      return runWorkflowCommand(command.command, command.args, output, runtime);
    case "master-governance":
      return runGovernanceCommand(command.command, command.args, output, runtime);
    case "master-gate":
      return runGateCommand(command.command, command.args, output, runtime);
    case "master-implement":
      return runImplementCommand(command.args, output, runtime);
    case "unknown":
      output.stderr(unknownCommandMessage(command.command, command.scope));
      return 1;
  }
}
