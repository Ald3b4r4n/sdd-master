import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { SkillCategory, SkillRecord, SkillStatus, SkillStatusSummary } from "./skill-types.js";

export const suggestedSkillSource = "https://github.com/sickn33/antigravity-awesome-skills/";

export function getSkillStatus(cwd: string): SkillStatusSummary {
  const records = listSkillRecords(cwd);

  return {
    candidates: records.filter((record) => record.status === "Candidata").length,
    approved: records.filter((record) => record.status === "Aprovada").length,
    installedLocal: records.filter((record) => record.status === "Instalada localmente").length,
    used: records.filter((record) => record.status === "Usada").length,
    usageReports: countFiles(join(cwd, ".sdd-master", "skills", "usage"), "SKILL-USAGE-")
  };
}

export function listSkillRecords(cwd: string): SkillRecord[] {
  const directory = join(cwd, ".sdd-master", "skills");

  if (!existsSync(directory)) {
    return [];
  }

  return readdirSync(directory)
    .filter((file) => /^SKILL-\d{3}\.md$/.test(file))
    .sort()
    .map((file) => parseSkillRecord(file.replace(".md", ""), readFileSync(join(directory, file), "utf8")));
}

export function nextSkillId(cwd: string): string {
  const next =
    listSkillRecords(cwd)
      .map((record) => Number(record.id.replace("SKILL-", "")))
      .filter((value) => Number.isInteger(value))
      .reduce((max, value) => Math.max(max, value), 0) + 1;

  return `SKILL-${String(next).padStart(3, "0")}`;
}

export function getSkillRecord(cwd: string, id: string): SkillRecord | undefined {
  return listSkillRecords(cwd).find((record) => record.id === id);
}

export function normalizeSkillCategory(value: string | undefined): SkillCategory {
  const normalized = value?.trim().toLowerCase();
  const allowed: SkillCategory[] = [
    "uiux",
    "security",
    "architecture",
    "testing",
    "docs",
    "performance",
    "accessibility",
    "seo",
    "other"
  ];

  return allowed.includes(normalized as SkillCategory) ? (normalized as SkillCategory) : "other";
}

function parseSkillRecord(id: string, content: string): SkillRecord {
  return {
    id,
    title: content.match(/^# SKILL-\d{3} — (.+)$/m)?.[1]?.trim() ?? id,
    category: normalizeSkillCategory(section(content, "Categoria")),
    source: section(content, "Fonte") || "Não informada",
    status: normalizeStatus(section(content, "Status")),
    reason: section(content, "Motivo") || "-",
    permissions: section(content, "Permissões necessárias")
      .split("\n")
      .map((item) => item.replace(/^-\s*/, "").trim())
      .filter((item) => item && item !== "-")
  };
}

function normalizeStatus(value: string): SkillStatus {
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
