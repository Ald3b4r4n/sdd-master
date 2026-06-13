import type { ExtensionRegistryEntry } from "./extension-types.js";
import { getExtensionHealth } from "./supply-chain.js";
import { listPluginRecords, toExtensionEntry } from "../plugins/plugin-registry.js";
import { listSkillRecords } from "../skills/skill-registry.js";

export function listExtensionEntries(cwd: string): ExtensionRegistryEntry[] {
  return [
    ...listPluginRecords(cwd).map(toExtensionEntry),
    ...listSkillRecords(cwd).map((skill) => ({
      id: skill.id,
      kind: "skill" as const,
      title: skill.title,
      source: skill.source,
      status: skill.status,
      permissions: skill.permissions
    }))
  ];
}

export function getExtensionStatus(cwd: string) {
  return getExtensionHealth(cwd, listExtensionEntries(cwd));
}

export function formatUsedExtensions(cwd: string): string {
  const used = listExtensionEntries(cwd).filter((entry) => /Usad/.test(entry.status));
  return used.length > 0
    ? used.map((entry) => `- ${entry.id} (${entry.kind}) — ${entry.title}`).join("\n")
    : "- Nenhuma extensão/skill usada.";
}
