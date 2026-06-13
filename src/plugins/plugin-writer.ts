import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import {
  ensureExtensionInfrastructure,
  writeExtensionApproval,
  writeExtensionAudit,
  writeExtensionRegistry,
  writeExtensionReport,
  writeExtensionUsage
} from "../extensions/extension-registry.js";
import type { ExtensionRegistryEntry } from "../extensions/extension-types.js";
import { listSkillRecords } from "../skills/skill-registry.js";
import type { PluginOptions, PluginRecord, PluginStatus } from "./plugin-types.js";
import { listPluginRecords, nextPluginId, normalizePluginCategory, pluginPath, toExtensionEntry } from "./plugin-registry.js";

export function createPlugin(cwd: string, options: PluginOptions): { id: string; createdFiles: string[]; updatedFiles: string[] } {
  ensureExtensionInfrastructure(cwd);
  const id = nextPluginId(cwd);
  const path = `.sdd-master/extensions/plugins/${id}.md`;
  write(cwd, path, pluginContent(id, options));
  return { id, createdFiles: [path], updatedFiles: syncExtensionArtifacts(cwd) };
}

export function updatePluginStatus(
  cwd: string,
  record: PluginRecord,
  status: PluginStatus,
  reason = record.reason
): { createdFiles: string[]; updatedFiles: string[] } {
  const path = pluginPath(cwd, record.id);
  const current = readFileSync(path, "utf8");
  const migratedPath = `.sdd-master/extensions/plugins/${record.id}.md`;
  const content = current
    .replace(/^## Status\n[\s\S]*?(?=\n## )/m, `## Status\n${status}`)
    .replace(/^## (Benefício esperado|Motivo)\n[\s\S]*?(?=\n## )/m, `## Benefício esperado\n${reason || "-"}`)
    .replace(/^## Aprovação humana\n[\s\S]*?(?=\n## )/m, `## Aprovação humana\n${status === "Aprovado" ? "Aprovada" : status === "Rejeitado" ? "Rejeitada" : "Pendente"}`);
  write(cwd, migratedPath, content.endsWith("\n") ? content : `${content}\n`);
  const approval = status === "Aprovado" || status === "Rejeitado"
    ? writeExtensionApproval(cwd, { ...toExtensionEntry(record), status }, status === "Aprovado" ? "approved" : "rejected", reason)
    : undefined;
  return {
    createdFiles: [migratedPath, ...(approval ? [approval] : [])],
    updatedFiles: syncExtensionArtifacts(cwd)
  };
}

export function installPluginLocal(cwd: string, record: PluginRecord): { createdFiles: string[]; updatedFiles: string[] } {
  const path = `.agents/skills/installed/${record.id}.md`;
  write(
    cwd,
    path,
    `# Plugin local instalado — ${record.id}

Este plugin foi instalado localmente apenas como metadado.

Ele não executa código.
Ele não baixa código remoto.
Ele não instala dependências.
Ele não altera arquivos do projeto consumidor.
`
  );
  const updated = updatePluginStatus(cwd, record, "Instalado localmente");
  return { createdFiles: [path, ...updated.createdFiles], updatedFiles: updated.updatedFiles };
}

export function markPluginUsed(cwd: string, record: PluginRecord, options: PluginOptions): { createdFiles: string[]; updatedFiles: string[] } {
  const usage = writeExtensionUsage(cwd, toExtensionEntry(record), options.phase ?? "PHASE-01", options.reason ?? record.reason);
  const updated = updatePluginStatus(cwd, record, "Usado");
  return { createdFiles: [usage, ...updated.createdFiles], updatedFiles: updated.updatedFiles };
}

export function auditPlugin(cwd: string, record: PluginRecord): { createdFiles: string[]; updatedFiles: string[] } {
  const audit = writeExtensionAudit(cwd, toExtensionEntry(record), record.type);
  return { createdFiles: [audit], updatedFiles: syncExtensionArtifacts(cwd) };
}

export function reportExtensions(cwd: string): { createdFiles: string[]; updatedFiles: string[] } {
  const report = writeExtensionReport(cwd, allEntries(cwd));
  return { createdFiles: [report], updatedFiles: syncExtensionArtifacts(cwd) };
}

export function syncExtensionArtifacts(cwd: string): string[] {
  const entries = allEntries(cwd);
  return [writeExtensionRegistry(cwd, entries)];
}

function allEntries(cwd: string): ExtensionRegistryEntry[] {
  const plugins = listPluginRecords(cwd).map(toExtensionEntry);
  const skills: ExtensionRegistryEntry[] = listSkillRecords(cwd).map((skill) => ({
    id: skill.id,
    kind: "skill",
    title: skill.title,
    source: skill.source,
    status: skill.status,
    permissions: skill.permissions
  }));
  return [...plugins, ...skills];
}

function pluginContent(id: string, options: PluginOptions): string {
  return `# ${id} — ${options.title ?? "Plugin sem título"}

## Categoria
${normalizePluginCategory(options.category)}

## Tipo
${options.type}

## Fonte
${options.source ?? ""}

## Versão declarada
${options.version ?? "-"}

## Status
Candidato

## Execução automática
Proibida nesta versão

## Instalação global
Proibida

## Instalação local
Apenas metadados neste bloco

## Permissões solicitadas
${bullets(options.permissions)}

## Arquivos que poderia afetar
-

## Riscos de supply chain
- Avaliação obrigatória antes de uso.

## Riscos de segurança
- Nenhuma execução automática permitida.

## Benefício esperado
${options.reason ?? "-"}

## Aprovação humana
Pendente

## Uso em relatórios
Todo uso deve ser registrado.

## Histórico
| Data | Evento | Responsável |
|---|---|---|
| ${new Date().toISOString().slice(0, 10)} | Plugin registrado | SDD Master |
`;
}

function write(cwd: string, relativePath: string, content: string): void {
  const path = join(cwd, relativePath);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content, "utf8");
}

function bullets(items: string[]): string {
  return items.length > 0 ? items.map((item) => `- ${item}`).join("\n") : "-";
}
