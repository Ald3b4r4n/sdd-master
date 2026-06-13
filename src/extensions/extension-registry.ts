import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { ensureExtensionPolicy } from "./extension-policy.js";
import type { ExtensionRegistryEntry } from "./extension-types.js";
import { calculateSupplyChainRisk, getExtensionHealth, isRemoteSource } from "./supply-chain.js";

export function ensureExtensionInfrastructure(cwd: string): string[] {
  const paths = [
    ".sdd-master/extensions/plugins",
    ".sdd-master/extensions/approvals",
    ".sdd-master/extensions/audits",
    ".sdd-master/extensions/usage",
    ".sdd-master/extensions/reports",
    ".agents/skills/installed",
    ".agents/skills/reports"
  ];
  for (const path of paths) mkdirSync(join(cwd, path), { recursive: true });
  ensureExtensionPolicy(cwd);
  return [".sdd-master/extensions/extension-policy.md"];
}

export function writeExtensionRegistry(cwd: string, entries: ExtensionRegistryEntry[]): string {
  ensureExtensionInfrastructure(cwd);
  const path = ".sdd-master/extensions/registry.md";
  write(
    cwd,
    path,
    `# Registry de Extensões — SDD Master

## Regras
- Nenhuma extensão executa código automaticamente.
- Nenhuma extensão instala dependência global.
- Aprovação humana é obrigatória antes de uso.

## Extensões
${entries.length > 0 ? entries.map((entry) => `- ${entry.id} | ${entry.kind} | ${entry.status} | ${entry.source}`).join("\n") : "- Nenhuma extensão registrada"}
`
  );
  return path;
}

export function writeExtensionApproval(
  cwd: string,
  entry: ExtensionRegistryEntry,
  decision: "approved" | "rejected",
  reason: string
): string {
  ensureExtensionInfrastructure(cwd);
  const id = nextId(cwd, "approvals", "EXTENSION-APPROVAL-");
  const path = `.sdd-master/extensions/approvals/${id}.md`;
  write(
    cwd,
    path,
    `# ${id} — Aprovação de Extensão

## Extensão
${entry.id}

## Decisão
${decision}

## Aprovador
Humano

## Justificativa
${reason || "-"}

## Permissões aprovadas
${bullets(entry.permissions)}

## Restrições
- Sem execução automática.
- Sem instalação global.

## Status
Registrado
`
  );
  return path;
}

export function writeExtensionAudit(cwd: string, entry: ExtensionRegistryEntry, type: string): string {
  ensureExtensionInfrastructure(cwd);
  const id = nextId(cwd, "audits", "EXTENSION-AUDIT-");
  const risk = calculateSupplyChainRisk(entry, type);
  const recommendation = risk === "BLOCKER" ? "Bloquear" : risk === "HIGH" ? "Revisar manualmente" : "Aprovar";
  const path = `.sdd-master/extensions/audits/${id}.md`;
  write(
    cwd,
    path,
    `# ${id} — Auditoria de Extensão

## Extensão
${entry.id}

## Origem
${entry.source || "-"}

## Tipo
${type || "local-metadata"}

## Risco de supply chain
${risk}

## Permissões
${bullets(entry.permissions)}

## Achados
${isRemoteSource(entry.source) ? "- Origem remota requer revisão humana." : "- Nenhum achado remoto."}

## Recomendação
${recommendation}

## Status
Aberta
`
  );
  return path;
}

export function writeExtensionUsage(cwd: string, entry: ExtensionRegistryEntry, phase: string, reason: string): string {
  ensureExtensionInfrastructure(cwd);
  const id = nextId(cwd, "usage", "EXTENSION-USAGE-");
  const path = `.sdd-master/extensions/usage/${id}.md`;
  write(
    cwd,
    path,
    `# ${id} — Uso de Extensão

## Extensão
${entry.id}

## Fase
${phase || "PHASE-01"}

## Uso declarado
${reason || "-"}

## Relatório obrigatório
Sim

## Status
Registrado
`
  );
  return path;
}

export function writeExtensionReport(cwd: string, entries: ExtensionRegistryEntry[]): string {
  ensureExtensionInfrastructure(cwd);
  const id = nextId(cwd, "reports", "extension-report-");
  const health = getExtensionHealth(cwd, entries);
  const plugins = entries.filter((entry) => entry.kind === "plugin");
  const skills = entries.filter((entry) => entry.kind === "skill");
  const path = `.sdd-master/extensions/reports/${id}.md`;
  write(
    cwd,
    path,
    `# Relatório de Extensões — SDD Master

## Plugins
- Candidatos: ${count(plugins, /Candidat/)}
- Aprovados: ${count(plugins, /Aprovad/)}
- Instalados localmente: ${count(plugins, /Instalad/)}
- Usados: ${count(plugins, /Usad/)}
- Bloqueados: ${count(plugins, /Bloquead|Rejeitad/)}

## Skills
- Candidatas: ${count(skills, /Candidat/)}
- Aprovadas: ${count(skills, /Aprovad/)}
- Instaladas localmente: ${count(skills, /Instalad/)}
- Usadas: ${count(skills, /Usad/)}
- Bloqueadas: ${count(skills, /Bloquead|Rejeitad/)}

## Riscos de supply chain
- ${health.supplyChainRisks}

## Extensões sem aprovação
- ${health.unapprovedUsed}

## Extensões com origem remota
- ${health.remoteSources}

## Extensões usadas
${bullets(entries.filter((entry) => /Usad/.test(entry.status)).map((entry) => entry.id))}

## Ações recomendadas
${bullets([...health.blockers, ...health.warnings])}
`
  );
  return path;
}

function count(entries: ExtensionRegistryEntry[], pattern: RegExp): number {
  return entries.filter((entry) => pattern.test(entry.status)).length;
}

function nextId(cwd: string, directoryName: string, prefix: string): string {
  const directory = join(cwd, ".sdd-master", "extensions", directoryName);
  const next = existsSync(directory)
    ? readdirSync(directory)
        .filter((file) => file.startsWith(prefix) && file.endsWith(".md"))
        .map((file) => Number(file.replace(prefix, "").replace(".md", "")))
        .filter(Number.isInteger)
        .reduce((max, value) => Math.max(max, value), 0) + 1
    : 1;
  return `${prefix}${String(next).padStart(3, "0")}`;
}

function write(cwd: string, relativePath: string, content: string): void {
  const path = join(cwd, relativePath);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content, "utf8");
}

function bullets(items: string[]): string {
  return items.length > 0 ? items.map((item) => `- ${item}`).join("\n") : "-";
}
