import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { GovernanceStatus } from "./governance-types.js";

export function getGovernanceStatus(cwd: string): GovernanceStatus {
  const clarificationFiles = listMarkdownFiles(cwd, ".sdd-master/clarifications", "CLARIFY-");
  const approvalFiles = listMarkdownFiles(cwd, ".sdd-master/approvals", "APPROVAL-");
  const changeFiles = listMarkdownFiles(cwd, ".sdd-master/scope/changes", "CHANGE-");
  const backlogFiles = listMarkdownFiles(cwd, ".sdd-master/backlog", "BACKLOG-");
  const approvedScope = readOptional(cwd, ".sdd-master/scope/approved-scope.md");
  const outOfScope = readOptional(cwd, ".sdd-master/scope/out-of-scope.md");
  const approvals = approvalFiles.map((file) => readFileSync(join(cwd, ".sdd-master/approvals", file), "utf8"));

  return {
    clarifications: {
      total: clarificationFiles.length,
      open: clarificationFiles.filter((file) =>
        isOpenStatus(readFileSync(join(cwd, ".sdd-master/clarifications", file), "utf8"))
      ).length,
      resolved: clarificationFiles.filter((file) =>
        readFileSync(join(cwd, ".sdd-master/clarifications", file), "utf8").includes("## Status\nResolvida")
      ).length
    },
    approvals: {
      total: approvalFiles.length,
      approvedTargets: targetsByDecision(approvals, "approved"),
      rejectedTargets: targetsByDecision(approvals, "rejected"),
      pendingTargets: targetsByDecision(approvals, "pending")
    },
    scope: {
      approvedItems: countBullets(approvedScope),
      outOfScopeItems: countBullets(outOfScope),
      openChanges: changeFiles.filter((file) =>
        isOpenStatus(readFileSync(join(cwd, ".sdd-master/scope/changes", file), "utf8"))
      ).length
    },
    backlog: {
      total: backlogFiles.length
    }
  };
}

export function nextGovernanceId(cwd: string, directory: string, prefix: string): string {
  const files = listMarkdownFiles(cwd, directory, prefix);
  const next = files
    .map((file) => Number(file.replace(prefix, "").replace(".md", "")))
    .filter((value) => Number.isInteger(value))
    .reduce((max, value) => Math.max(max, value), 0) + 1;

  return `${prefix}${String(next).padStart(3, "0")}`;
}

export function updateGovernanceProjectState(cwd: string, status: GovernanceStatus): boolean {
  const path = join(cwd, ".sdd-master", "project-state.md");

  if (!existsSync(path)) {
    return false;
  }

  const block = `## Governança
- Clarificações abertas: ${status.clarifications.open}
- Aprovações registradas: ${status.approvals.total}
- Mudanças de escopo abertas: ${status.scope.openChanges}
- Backlog registrado: ${status.backlog.total}
`;
  const content = readFileSync(path, "utf8");
  const next = upsertBlock(content, "## Governança", block);
  writeFileSync(path, next, "utf8");
  return true;
}

function listMarkdownFiles(cwd: string, directory: string, prefix: string): string[] {
  const fullPath = join(cwd, directory);

  if (!existsSync(fullPath)) {
    return [];
  }

  return readdirSync(fullPath).filter((file) => file.startsWith(prefix) && file.endsWith(".md"));
}

function readOptional(cwd: string, relativePath: string): string {
  const path = join(cwd, relativePath);
  return existsSync(path) ? readFileSync(path, "utf8") : "";
}

function countBullets(content: string): number {
  return content.split("\n").filter((line) => line.startsWith("- ")).length;
}

function targetsByDecision(approvals: string[], decision: string): string[] {
  const targets = approvals
    .filter((content) => content.includes(`## Decisão\n${decision}`))
    .map((content) => content.match(/^## Target\n(.+)$/m)?.[1]?.trim())
    .filter((value): value is string => Boolean(value));

  return Array.from(new Set(targets)).sort();
}

function isOpenStatus(content: string): boolean {
  return content.includes("## Status\nAberta") || content.includes("## Status\nAberto");
}

function upsertBlock(content: string, heading: string, block: string): string {
  if (!content.includes(heading)) {
    return `${content.trimEnd()}\n\n${block}`;
  }

  const pattern = new RegExp(`${escapeRegExp(heading)}[\\s\\S]*?(?=\\n## |$)`);
  return content.replace(pattern, block.trimEnd());
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
