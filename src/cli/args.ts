export type ParsedCommand =
  | { kind: "root-help" }
  | { kind: "version" }
  | { kind: "master-help" }
  | { kind: "master-command-help"; command: string }
  | { kind: "master-status" }
  | { kind: "master-init"; args: string[] }
  | { kind: "master-agents"; args: string[] }
  | { kind: "master-doctor"; args: string[] }
  | { kind: "master-git"; args: string[] }
  | { kind: "master-skills"; args: string[] }
  | { kind: "master-uiux"; args: string[] }
  | { kind: "master-workflow"; command: "discovery" | "requirements" | "spec" | "plan" | "tasks"; args: string[] }
  | { kind: "master-governance"; command: "clarify" | "approve" | "scope" | "backlog"; args: string[] }
  | { kind: "master-gate"; command: "quality" | "audit" | "docs" | "blocker"; args: string[] }
  | { kind: "master-implement"; args: string[] }
  | { kind: "planned-command"; command: "update" }
  | { kind: "unknown"; command: string; scope: "root" | "master" };

const rootHelpFlags = new Set(["--help", "-h"]);
const versionFlags = new Set(["--version", "-v"]);
const plannedCommands = new Set(["update"]);
const workflowCommands = new Set(["discovery", "requirements", "spec", "plan", "tasks"]);
const governanceCommands = new Set(["clarify", "approve", "scope", "backlog"]);
const gateCommands = new Set(["quality", "audit", "docs", "blocker"]);

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

  if (second === "init") {
    return { kind: "master-init", args: args.slice(2) };
  }

  if (second === "doctor") {
    return { kind: "master-doctor", args: args.slice(2) };
  }

  if (second === "agents") {
    return { kind: "master-agents", args: args.slice(2) };
  }

  if (second === "git") {
    return { kind: "master-git", args: args.slice(2) };
  }

  if (second === "skills") {
    return { kind: "master-skills", args: args.slice(2) };
  }

  if (second === "uiux") {
    return { kind: "master-uiux", args: args.slice(2) };
  }

  if (second === "implement") {
    return { kind: "master-implement", args: args.slice(2) };
  }

  if (workflowCommands.has(second)) {
    return {
      kind: "master-workflow",
      command: second as "discovery" | "requirements" | "spec" | "plan" | "tasks",
      args: args.slice(2)
    };
  }

  if (governanceCommands.has(second)) {
    return {
      kind: "master-governance",
      command: second as "clarify" | "approve" | "scope" | "backlog",
      args: args.slice(2)
    };
  }

  if (gateCommands.has(second)) {
    return {
      kind: "master-gate",
      command: second as "quality" | "audit" | "docs" | "blocker",
      args: args.slice(2)
    };
  }

  if (plannedCommands.has(second)) {
    return { kind: "planned-command", command: second as "update" };
  }

  return { kind: "unknown", command: second, scope: "master" };
}
