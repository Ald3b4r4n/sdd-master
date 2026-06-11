export type ParsedCommand =
  | { kind: "root-help" }
  | { kind: "version" }
  | { kind: "master-help" }
  | { kind: "master-command-help"; command: string }
  | { kind: "master-status" }
  | { kind: "planned-command"; command: "init" | "doctor" | "update" }
  | { kind: "unknown"; command: string; scope: "root" | "master" };

const rootHelpFlags = new Set(["--help", "-h"]);
const versionFlags = new Set(["--version", "-v"]);
const plannedCommands = new Set(["init", "doctor", "update"]);

export function parseArgs(args: string[]): ParsedCommand {
  const [first, second, third] = args;

  if (args.length === 0 || rootHelpFlags.has(first)) {
    return { kind: "root-help" };
  }

  if (versionFlags.has(first)) {
    return { kind: "version" };
  }

  if (first !== "master") {
    return { kind: "unknown", command: first, scope: "root" };
  }

  if (args.length === 1 || rootHelpFlags.has(second) || second === "help") {
    if (second === "help" && third) {
      return { kind: "master-command-help", command: third };
    }

    return { kind: "master-help" };
  }

  if (second === "version") {
    return { kind: "version" };
  }

  if (second === "status") {
    return { kind: "master-status" };
  }

  if (plannedCommands.has(second)) {
    return { kind: "planned-command", command: second as "init" | "doctor" | "update" };
  }

  return { kind: "unknown", command: second, scope: "master" };
}
