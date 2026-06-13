import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { ExtensionRegistryEntry } from "../extensions/extension-types.js";
import { calculateSupplyChainRisk, isRemoteSource } from "../extensions/supply-chain.js";
import type { PluginCategory, PluginRecord, PluginStatus, PluginStatusSummary, PluginType } from "./plugin-types.js";

export function getPluginStatus(cwd: string): PluginStatusSummary {
  const records = listPluginRecords(cwd);
  return {
    candidates: records.filter((record) => record.status === "Candidato").length,
    approved: records.filter((record) => record.status === "Aprovado").length,
    installedLocal: records.filter((record) => record.status === "Instalado localmente").length,
    used: records.filter((record) => record.status === "Usado").length,
    blocked: records.filter((record) => record.status === "Bloqueado" || record.status === "Rejeitado").length,
    remoteSources: records.filter((record) => isRemoteSource(record.source) || record.type === "remote-source").length,
    supplyChainRisks: records.filter((record) => calculateSupplyChainRisk(toExtensionEntry(record), record.type) !== "LOW").length,
    usageReports: countFiles(join(cwd, ".sdd-master", "extensions", "usage"), "EXTENSION-USAGE-"),
    audits: countFiles(join(cwd, ".sdd-master", "extensions", "audits"), "EXTENSION-AUDIT-")
  };
}

export function listPluginRecords(cwd: string): PluginRecord[] {
  const current = readDirectory(join(cwd, ".sdd-master", "extensions", "plugins"));
  const legacy = readDirectory(join(cwd, ".sdd-master", "plugins"));
  const records = [...current, ...legacy];
  return Array.from(new Map(records.map((record) => [record.id, record])).values()).sort((a, b) => a.id.localeCompare(b.id));
}

export function nextPluginId(cwd: string): string {
  const next =
    listPluginRecords(cwd)
      .map((record) => Number(record.id.replace("PLUGIN-", "")))
      .filter(Number.isInteger)
      .reduce((max, value) => Math.max(max, value), 0) + 1;
  return `PLUGIN-${String(next).padStart(3, "0")}`;
}

export function getPluginRecord(cwd: string, id: string): PluginRecord | undefined {
  return listPluginRecords(cwd).find((record) => record.id === id);
}

export function pluginPath(cwd: string, id: string): string {
  const current = join(cwd, ".sdd-master", "extensions", "plugins", `${id}.md`);
  if (existsSync(current)) return current;
  return join(cwd, ".sdd-master", "plugins", `${id}.md`);
}

export function normalizePluginCategory(value: string | undefined): PluginCategory {
  const normalized = value?.trim().toLowerCase();
  const allowed: PluginCategory[] = ["architecture", "testing", "uiux", "security", "docs", "release", "deploy", "database", "ai-agent", "other"];
  return allowed.includes(normalized as PluginCategory) ? (normalized as PluginCategory) : "other";
}

export function normalizePluginType(value: string | undefined): PluginType {
  const normalized = value?.trim().toLowerCase();
  const allowed: PluginType[] = ["local-metadata", "local-script", "external-package", "remote-source", "manual-process"];
  return allowed.includes(normalized as PluginType) ? (normalized as PluginType) : "local-metadata";
}

export function toExtensionEntry(record: PluginRecord): ExtensionRegistryEntry {
  return {
    id: record.id,
    kind: "plugin",
    title: record.title,
    source: record.source,
    status: record.status,
    permissions: record.permissions
  };
}

function readDirectory(directory: string): PluginRecord[] {
  if (!existsSync(directory)) return [];
  return readdirSync(directory)
    .filter((file) => /^PLUGIN-\d{3}\.md$/.test(file))
    .map((file) => parsePluginRecord(file.replace(".md", ""), readFileSync(join(directory, file), "utf8")));
}

function parsePluginRecord(id: string, content: string): PluginRecord {
  return {
    id,
    title: content.match(/^# PLUGIN-\d{3} — (.+)$/m)?.[1]?.trim() ?? id,
    category: normalizePluginCategory(section(content, "Categoria")),
    type: normalizePluginType(section(content, "Tipo")),
    source: section(content, "Fonte") || "",
    version: section(content, "Versão declarada") || "-",
    status: normalizeStatus(section(content, "Status")),
    reason: section(content, "Benefício esperado") || section(content, "Motivo") || "-",
    permissions: bullets(section(content, "Permissões solicitadas") || section(content, "Permissões necessárias"))
  };
}

function normalizeStatus(value: string): PluginStatus {
  if (/^Aprovad/.test(value)) return "Aprovado";
  if (/^Instalad/.test(value)) return "Instalado localmente";
  if (/^Usad/.test(value)) return "Usado";
  if (/^Rejeitad/.test(value)) return "Rejeitado";
  if (/^Bloquead/.test(value)) return "Bloqueado";
  return "Candidato";
}

function section(content: string, name: string): string {
  const pattern = new RegExp(`^## ${escapeRegExp(name)}\\n([\\s\\S]*?)(?=\\n## |$)`, "m");
  return content.match(pattern)?.[1]?.trim() ?? "";
}

function bullets(value: string): string[] {
  return value.split("\n").map((item) => item.replace(/^-\s*/, "").trim()).filter((item) => item && item !== "-");
}

function countFiles(directory: string, prefix: string): number {
  if (!existsSync(directory)) return 0;
  return readdirSync(directory).filter((file) => file.startsWith(prefix) && file.endsWith(".md")).length;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
