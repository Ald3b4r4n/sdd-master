import { parseArgs } from "./args.js";
import type { CliOutput } from "./output.js";
import { getMasterCommandHelp } from "./commands/master-help.js";
import { getPlannedCommandOutput } from "./commands/planned-command.js";
import { getRootHelp } from "./commands/root-help.js";
import { getStatusOutput } from "./commands/master-status.js";
import { getVersionOutput } from "./commands/master-version.js";

export function runCommand(args: string[], output: CliOutput): number {
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
      output.stdout(getStatusOutput());
      return 0;
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
