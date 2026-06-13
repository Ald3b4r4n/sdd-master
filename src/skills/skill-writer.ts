import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { ensureExtensionInfrastructure, writeExtensionApproval, writeExtensionUsage } from "../extensions/extension-registry.js";
import type { SkillOptions, SkillRecord, SkillStatus } from "./skill-types.js";
import { nextSkillId, normalizeSkillCategory, suggestedSkillSource } from "./skill-registry.js";

export function createSkill(cwd: string, options: SkillOptions): { id: string; createdFiles: string[]; updatedFiles: string[] } {
  ensureExtensionInfrastructure(cwd);
  const id = nextSkillId(cwd);
  const path = `.sdd-master/skills/${id}.md`;
  write(cwd, path, skillContent(id, options));
  const updatedFiles = updateSkillIndexes(cwd);

  return { id, createdFiles: [path], updatedFiles };
}

export function updateSkillStatus(
  cwd: string,
  record: SkillRecord,
  status: SkillStatus,
  reason = record.reason
): { createdFiles: string[]; updatedFiles: string[] } {
  const path = join(cwd, ".sdd-master", "skills", `${record.id}.md`);
  const content = readFileSync(path, "utf8")
    .replace(/^## Status\n[\s\S]*?(?=\n## )/m, `## Status\n${status}`)
    .replace(/^## Motivo\n[\s\S]*?(?=\n## )/m, `## Motivo\n${reason || "-"}`)
    .replace(
      /^## Histórico\n\| Data \| Evento \| Responsável \|\n\|---\|---\|---\|([\s\S]*)$/m,
      `## Histórico\n| Data | Evento | Responsável |\n|---|---|---|$1\n| ${today()} | ${eventForStatus(status)} | SDD Master |`
    );
  writeFileSync(path, content.endsWith("\n") ? content : `${content}\n`, "utf8");

  const approval = status === "Aprovada" || status === "Rejeitada"
    ? writeExtensionApproval(
        cwd,
        { id: record.id, kind: "skill", title: record.title, source: record.source, status, permissions: record.permissions },
        status === "Aprovada" ? "approved" : "rejected",
        reason
      )
    : undefined;
  return {
    createdFiles: approval ? [approval] : [],
    updatedFiles: [`.sdd-master/skills/${record.id}.md`, ...updateSkillIndexes(cwd)]
  };
}

export function installSkillLocal(cwd: string, record: SkillRecord): { createdFiles: string[]; updatedFiles: string[] } {
  const path = `.agents/skills/installed/${record.id}.md`;
  write(
    cwd,
    path,
    `# Skill local instalada — ${record.id}

Esta skill foi instalada localmente como metadado/controlador do SDD Master.

Ela não executa código automaticamente.
Ela não foi instalada globalmente.
Ela não baixou código remoto.
O uso real deve ser aprovado e registrado.

## Skill
${record.title}

## Fonte
${record.source}
`
  );
  const updated = updateSkillStatus(cwd, record, "Instalada localmente", record.reason);

  return { createdFiles: [path, ...updated.createdFiles], updatedFiles: updated.updatedFiles };
}

export function markSkillUsed(
  cwd: string,
  record: SkillRecord,
  options: SkillOptions
): { createdFiles: string[]; updatedFiles: string[] } {
  const id = nextUsageId(cwd);
  const path = `.sdd-master/skills/usage/${id}.md`;
  write(
    cwd,
    path,
    `# ${id} — Uso de ${record.id}

## Skill
${record.id} — ${record.title}

## Fase
${options.phase ?? "PHASE-01"}

## Target
${options.target ?? "não informado"}

## Motivo
${options.reason ?? record.reason}

## Relatório do agente
Toda skill usada deve aparecer no relatório do agente.

## Segurança
- Não executou código remoto.
- Não instalou dependência global.
- Não criou .env.
`
  );
  const extensionUsage = writeExtensionUsage(
    cwd,
    { id: record.id, kind: "skill", title: record.title, source: record.source, status: record.status, permissions: record.permissions },
    options.phase ?? "PHASE-01",
    options.reason ?? record.reason
  );
  const updated = updateSkillStatus(cwd, record, "Usada", record.reason);

  return { createdFiles: [path, extensionUsage, ...updated.createdFiles], updatedFiles: updated.updatedFiles };
}

function skillContent(id: string, options: SkillOptions): string {
  return `# ${id} — ${options.title ?? "Skill sem título"}

## Categoria
${normalizeSkillCategory(options.category)}

## Fonte
${options.source ?? suggestedSkillSource}

## Status
Candidata

## Instalação
Local somente

## Instalação global
Proibida

## Motivo
${options.reason ?? "-"}

## Riscos
- Supply chain até aprovação humana.

## Permissões necessárias
${options.permissions.length > 0 ? options.permissions.map((permission) => `- ${permission}`).join("\n") : "-"}

## Compatibilidade
- Codex:
- Claude:
- Cursor:
- Gemini:
- Copilot:
- Windsurf:
- Cline:
- Roo:
- Aider:
- Continue:

## Aprovação humana
Pendente

## Uso em relatórios
Toda vez que esta skill for usada, ela deve aparecer no relatório do agente.

## Histórico
| Data | Evento | Responsável |
|---|---|---|
| ${today()} | Skill registrada | SDD Master |
`;
}

function updateSkillIndexes(cwd: string): string[] {
  const records = existsSync(join(cwd, ".sdd-master", "skills"))
    ? readdirSync(join(cwd, ".sdd-master", "skills"))
        .filter((file) => /^SKILL-\d{3}\.md$/.test(file))
        .sort()
        .map((file) => `- ${file.replace(".md", "")}`)
    : [];
  const content = `# Índice de skills

## Fonte sugerida
${suggestedSkillSource}

## Regras
- Skills externas são risco de supply chain até aprovação.
- Instalação global é proibida.
- Instalação local cria apenas metadados.
- Toda skill usada deve aparecer em relatório.

## Skills
${records.length > 0 ? records.join("\n") : "- Nenhuma skill registrada"}
`;
  write(cwd, ".sdd-master/skills/skills-index.md", content);
  write(
    cwd,
    ".agents/skills/registry.md",
    `# Registry de skills locais

Este registry é controlado pelo SDD Master.
Nenhuma skill é instalada globalmente ou executada automaticamente.

${records.length > 0 ? records.join("\n") : "- Nenhuma skill registrada"}
`
  );
  mkdirSync(join(cwd, ".agents", "skills", "approved"), { recursive: true });
  mkdirSync(join(cwd, ".agents", "skills", "installed"), { recursive: true });
  mkdirSync(join(cwd, ".agents", "skills", "reports"), { recursive: true });

  return [".sdd-master/skills/skills-index.md", ".agents/skills/registry.md"];
}

function nextUsageId(cwd: string): string {
  const directory = join(cwd, ".sdd-master", "skills", "usage");
  const next = existsSync(directory)
    ? readdirSync(directory)
        .filter((file) => file.startsWith("SKILL-USAGE-") && file.endsWith(".md"))
        .map((file) => Number(file.replace("SKILL-USAGE-", "").replace(".md", "")))
        .filter((value) => Number.isInteger(value))
        .reduce((max, value) => Math.max(max, value), 0) + 1
    : 1;

  return `SKILL-USAGE-${String(next).padStart(3, "0")}`;
}

function write(cwd: string, relativePath: string, content: string): void {
  const path = join(cwd, relativePath);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content, "utf8");
}

function eventForStatus(status: SkillStatus): string {
  if (status === "Aprovada") return "Skill aprovada";
  if (status === "Instalada localmente") return "Skill instalada localmente";
  if (status === "Usada") return "Skill marcada como usada";
  if (status === "Rejeitada") return "Skill rejeitada";
  return "Skill registrada";
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}
