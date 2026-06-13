import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { safeWriteFile } from "../filesystem/safe-write.js";
import { version } from "../index.js";
import { templateVersion } from "../templates/official-templates.js";

export type ProjectStateUpdateInfo = {
  installedVersion: string;
  templateVersion: string;
  lastUpdate: string;
  needsUpdate: boolean;
  content: string;
};

export function getProjectStateUpdate(cwd: string, timestamp: string): ProjectStateUpdateInfo {
  const path = join(cwd, ".sdd-master", "project-state.md");
  const existing = existsSync(path) ? readFileSync(path, "utf8") : "";
  const installedVersion = extractValue(existing, "Versão instalada") ?? extractValue(existing, "Versão do SDD Master") ?? version;
  const installedTemplateVersion = extractValue(existing, "Versão dos templates") ?? "não informada";
  const block = sddMasterBlock(timestamp);

  if (existing.includes("## SDD Master")) {
    const content = existing.replace(/^## SDD Master\n[\s\S]*?(?=\n## |$)/m, block.trimEnd());
    return {
      installedVersion,
      templateVersion: installedTemplateVersion,
      lastUpdate: timestamp,
      needsUpdate: content !== existing,
      content: ensureTrailingNewline(content)
    };
  }

  const separator = existing.endsWith("\n") ? "\n" : "\n\n";
  return {
    installedVersion,
    templateVersion: installedTemplateVersion,
    lastUpdate: timestamp,
    needsUpdate: true,
    content: `${existing}${separator}${block}`
  };
}

export function writeProjectStateUpdate(cwd: string, content: string): void {
  safeWriteFile(cwd, ".sdd-master/project-state.md", content);
}

function sddMasterBlock(timestamp: string): string {
  return `## SDD Master

- Versão instalada: ${version}
- Versão dos templates: ${templateVersion}
- Data da instalação:
- Último update: ${timestamp}
- Canal recomendado: prototype
`;
}

function extractValue(content: string, label: string): string | undefined {
  const pattern = new RegExp(`^- ${escapeRegExp(label)}:\\s*(.+)$`, "m");
  return content.match(pattern)?.[1]?.trim();
}

function ensureTrailingNewline(content: string): string {
  return content.endsWith("\n") ? content : `${content}\n`;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
