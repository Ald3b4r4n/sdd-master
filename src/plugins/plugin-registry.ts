import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { PluginCategory, PluginRecord, PluginStatus, PluginStatusSummary } from "./plugin-types.js";

export const suggestedPluginSource = "Registry local controlado";

export function getPluginStatus(cwd: string): PluginStatusSummary {
  const records = listPluginRecords(cwd);

  return {
    candidates: records.filter((record) => record.status === "Candidata").length,
    approved: records.filter((record) => record.status === "Aprovada").length,
    installedLocal: records.filter((record) => record.status === "Instalada localmente").length,
    used: records.filter((record) => record.status === "Usada").length,
    usageReports: countFiles(join(cwd, ".sdd-master", "plugins", "usage"), "PLUGIN-USAGE-")
  };
}

export function listPluginRecords(cwd: string): PluginRecord[] {
  const directory = join(cwd, ".sdd-master", "plugins");

  if (!existsSync(directory)) {
    return [];
  }

  return readdirSync(directory)
    .filter((file) => /^PLUGIN-\d{3}\.md$/.test(file))
    .sort()
    .map((file) => parsePluginRecord(file.replace(".md", ""), readFileSync(join(directory, file), "utf8")));
}

export function nextPluginId(cwd: string): string {
  const next =
    listPluginRecords(cwd)
      .map((record) => Number(record.id.replace("PLUGIN-", "")))
      .filter((value) => Number.isInteger(value))
      .reduce((max, value) => Math.max(max, value), 0) + 1;

  return `PLUGIN-${String(next).padStart(3, "0")}`;
}

export function getPluginRecord(cwd: string, id: string): PluginRecord | undefined {
  return listPluginRecords(cwd).find((record) => record.id === id);
}

export function normalizePluginCategory(value: string | undefined): PluginCategory {
  const normalized = value?.trim().toLowerCase();
  const allowed: PluginCategory[] = ["uiux", "workflow", "security", "testing", "docs", "integration", "automation", "other"];

  return allowed.includes(normalized as PluginCategory) ? (normalized as PluginCategory) : "other";
}

function parsePluginRecord(id: string, content: string): PluginRecord {
  return {
    id,
    title: content.match(/^# PLUGIN-\d{3} — (.+)$/m)?.[1]?.trim() ?? id,
    category: normalizePluginCategory(section(content, "Categoria")),
    source: section(content, "Fonte") || "Não informada",
    status: normalizeStatus(section(content, "Status")),
    reason: section(content, "Motivo") || "-"
  };
}

function normalizeStatus(value: string): PluginStatus {
  const status = value.trim();
  if (status === "Aprovada") return "Aprovada";
  if (status === "Instalada localmente") return "Instalada localmente";
  if (status === "Usada") return "Usada";
  if (status === "Rejeitada") return "Rejeitada";
  return "Candidata";
}

function section(content: string, name: string): string {
  const pattern = new RegExp(`^## ${escapeRegExp(name)}\\n([\\s\\S]*?)(?=\\n## |$)`, "m");
  return content.match(pattern)?.[1]?.trim() ?? "";
}

function countFiles(directory: string, prefix: string): number {
  if (!existsSync(directory)) {
    return 0;
  }

  return readdirSync(directory).filter((file) => file.startsWith(prefix) && file.endsWith(".md")).length;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
