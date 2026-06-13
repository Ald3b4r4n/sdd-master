import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

export type UpdateStatusSummary = {
  installedVersion: string;
  templateVersion: string;
  lastUpdate: string;
  latestBackup: string;
  conflicts: number;
  missingMetadata: boolean;
};

export function getUpdateStatus(cwd: string): UpdateStatusSummary {
  const statePath = join(cwd, ".sdd-master", "project-state.md");
  const state = existsSync(statePath) ? readFileSync(statePath, "utf8") : "";
  const latestReport = latestFile(join(cwd, ".sdd-master", "reports"), "update-", ".md");

  return {
    installedVersion: extractValue(state, "Versão instalada") ?? extractValue(state, "Versão do SDD Master") ?? "não detectada",
    templateVersion: extractValue(state, "Versão dos templates") ?? "não detectada",
    lastUpdate: extractValue(state, "Último update") ?? "não detectado",
    latestBackup: latestDirectory(join(cwd, ".sdd-master", "backups"), "update-") ?? "não detectado",
    conflicts: latestReport ? countConflicts(join(cwd, ".sdd-master", "reports", latestReport)) : 0,
    missingMetadata: !state.includes("## SDD Master") || !state.includes("Versão dos templates")
  };
}

function latestDirectory(directory: string, prefix: string): string | undefined {
  if (!existsSync(directory)) {
    return undefined;
  }

  const latest = readdirSync(directory)
    .filter((entry) => entry.startsWith(prefix))
    .sort()
    .at(-1);

  return latest ? `.sdd-master/backups/${latest}` : undefined;
}

function latestFile(directory: string, prefix: string, suffix: string): string | undefined {
  if (!existsSync(directory)) {
    return undefined;
  }

  return readdirSync(directory)
    .filter((entry) => entry.startsWith(prefix) && entry.endsWith(suffix))
    .sort()
    .at(-1);
}

function countConflicts(path: string): number {
  const content = readFileSync(path, "utf8");
  const value = content.match(/- Conflitos:\s*(\d+)/)?.[1];
  return value ? Number(value) : 0;
}

function extractValue(content: string, label: string): string | undefined {
  const pattern = new RegExp(`^- ${escapeRegExp(label)}:\\s*(.*)$`, "m");
  const value = content.match(pattern)?.[1]?.trim();
  return value || undefined;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
