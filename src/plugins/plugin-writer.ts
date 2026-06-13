import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import type { PluginOptions, PluginRecord, PluginStatus } from "./plugin-types.js";
import { nextPluginId, normalizePluginCategory, suggestedPluginSource } from "./plugin-registry.js";

export function createPlugin(cwd: string, options: PluginOptions): { id: string; createdFiles: string[]; updatedFiles: string[] } {
  const id = nextPluginId(cwd);
  const path = `.sdd-master/plugins/${id}.md`;
  write(cwd, path, pluginContent(id, options));
  const updatedFiles = updatePluginIndexes(cwd);

  return { id, createdFiles: [path], updatedFiles };
}

export function updatePluginStatus(
  cwd: string,
  record: PluginRecord,
  status: PluginStatus,
  reason = record.reason
): { updatedFiles: string[] } {
  const path = join(cwd, ".sdd-master", "plugins", `${record.id}.md`);
  const content = readFileSync(path, "utf8")
    .replace(/^## Status\n[\s\S]*?(?=\n## )/m, `## Status\n${status}`)
    .replace(/^## Motivo\n[\s\S]*?(?=\n## )/m, `## Motivo\n${reason || "-"}`)
    .replace(
      /^## Histórico\n\| Data \| Evento \| Responsável \|\n\|---\|---\|---\|([\s\S]*)$/m,
      `## Histórico\n| Data | Evento | Responsável |\n|---|---|---|$1\n| ${today()} | ${eventForStatus(status)} | SDD Master |`
    );
  writeFileSync(path, content.endsWith("\n") ? content : `${content}\n`, "utf8");

  return { updatedFiles: [`.sdd-master/plugins/${record.id}.md`, ...updatePluginIndexes(cwd)] };
}

export function installPluginLocal(cwd: string, record: PluginRecord): { createdFiles: string[]; updatedFiles: string[] } {
  const path = `.agents/plugins/installed/${record.id}.md`;
  write(
    cwd,
    path,
    `# Plugin local instalado — ${record.id}

Este plugin foi instalado localmente como metadado/controlador do SDD Master.

Ele não executa código automaticamente.
Ele não foi instalado globalmente.
Ele não baixou código remoto.
O uso real deve ser aprovado e registrado.

## Plugin
${record.title}

## Fonte
${record.source}
`
  );
  const updated = updatePluginStatus(cwd, record, "Instalada localmente", record.reason);

  return { createdFiles: [path], updatedFiles: updated.updatedFiles };
}

export function markPluginUsed(
  cwd: string,
  record: PluginRecord,
  options: PluginOptions
): { createdFiles: string[]; updatedFiles: string[] } {
  const id = nextUsageId(cwd);
  const path = `.sdd-master/plugins/usage/${id}.md`;
  write(
    cwd,
    path,
    `# ${id} — Uso de ${record.id}

## Plugin
${record.id} — ${record.title}

## Fase
${options.phase ?? "PHASE-01"}

## Target
${options.target ?? "não informado"}

## Motivo
${options.reason ?? record.reason}

## Relatório do agente
Toda vez que este plugin for usado, ele deve aparecer no relatório do agente.

## Segurança
- Não executou código remoto.
- Não instalou dependência global.
- Não criou .env.
`
  );
  const updated = updatePluginStatus(cwd, record, "Usada", record.reason);

  return { createdFiles: [path], updatedFiles: updated.updatedFiles };
}

function pluginContent(id: string, options: PluginOptions): string {
  return `# ${id} — ${options.title ?? "Plugin sem título"}

## Categoria
${normalizePluginCategory(options.category)}

## Fonte
${options.source ?? suggestedPluginSource}

## Status
Candidata

## Instalação
Local somente

## Instalação global
Proibida

## Execução remota
Proibida

## Motivo
${options.reason ?? "-"}

## Riscos
- Supply chain até aprovação humana.
- Plugins não executam código automaticamente.

## Permissões necessárias
-

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
Toda vez que este plugin for usado, ele deve aparecer no relatório do agente.

## Histórico
| Data | Evento | Responsável |
|---|---|---|
| ${today()} | Plugin registrado | SDD Master |
`;
}

function updatePluginIndexes(cwd: string): string[] {
  const records = existsSync(join(cwd, ".sdd-master", "plugins"))
    ? readdirSync(join(cwd, ".sdd-master", "plugins"))
        .filter((file) => /^PLUGIN-\d{3}\.md$/.test(file))
        .sort()
        .map((file) => `- ${file.replace(".md", "")}`)
    : [];
  const content = `# Índice de plugins

## Fonte sugerida
${suggestedPluginSource}

## Regras
- Plugins externos são risco de supply chain até aprovação.
- Instalação global é proibida.
- Instalação local cria apenas metadados.
- Plugins não executam código remoto.

## Plugins
${records.length > 0 ? records.join("\n") : "- Nenhum plugin registrado"}
`;
  write(cwd, ".sdd-master/plugins/plugins-index.md", content);
  write(
    cwd,
    ".agents/plugins/registry.md",
    `# Registry de plugins locais

Este registry é controlado pelo SDD Master.
Nenhum plugin é instalado globalmente ou executado automaticamente.
Nenhum código remoto é baixado ou executado.

${records.length > 0 ? records.join("\n") : "- Nenhum plugin registrado"}
`
  );
  mkdirSync(join(cwd, ".agents", "plugins", "approved"), { recursive: true });
  mkdirSync(join(cwd, ".agents", "plugins", "installed"), { recursive: true });
  mkdirSync(join(cwd, ".agents", "plugins", "reports"), { recursive: true });

  return [".sdd-master/plugins/plugins-index.md", ".agents/plugins/registry.md"];
}

function nextUsageId(cwd: string): string {
  const directory = join(cwd, ".sdd-master", "plugins", "usage");
  const next = existsSync(directory)
    ? readdirSync(directory)
        .filter((file) => file.startsWith("PLUGIN-USAGE-") && file.endsWith(".md"))
        .map((file) => Number(file.replace("PLUGIN-USAGE-", "").replace(".md", "")))
        .filter((value) => Number.isInteger(value))
        .reduce((max, value) => Math.max(max, value), 0) + 1
    : 1;

  return `PLUGIN-USAGE-${String(next).padStart(3, "0")}`;
}

function write(cwd: string, relativePath: string, content: string): void {
  const path = join(cwd, relativePath);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content, "utf8");
}

function eventForStatus(status: PluginStatus): string {
  if (status === "Aprovada") return "Plugin aprovado";
  if (status === "Instalada localmente") return "Plugin instalado localmente";
  if (status === "Usada") return "Plugin marcado como usado";
  if (status === "Rejeitada") return "Plugin rejeitado";
  return "Plugin registrado";
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}
