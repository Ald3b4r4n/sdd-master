import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { ExtensionHealth, ExtensionRegistryEntry, ExtensionRisk } from "./extension-types.js";

export function isRemoteSource(source: string): boolean {
  return /^https?:\/\//i.test(source.trim());
}

export function calculateSupplyChainRisk(entry: ExtensionRegistryEntry, type = ""): ExtensionRisk {
  if (!entry.source || entry.source === "-" || entry.source === "Não informada") return "BLOCKER";
  if (type === "remote-source" || type === "external-package") return "HIGH";
  if (isRemoteSource(entry.source)) return "HIGH";
  if (entry.permissions.some((permission) => /all|admin|global|filesystem|network|shell/i.test(permission))) return "HIGH";
  if (entry.permissions.length === 0) return "MEDIUM";
  return "LOW";
}

export function getExtensionHealth(cwd: string, entries: ExtensionRegistryEntry[]): ExtensionHealth {
  const base = join(cwd, ".sdd-master", "extensions");
  const started = existsSync(base) || entries.length > 0;
  if (!started) {
    return {
      policy: "not-started",
      registry: "not-started",
      pluginRegistry: "not-started",
      skillsRegistry: existsSync(join(cwd, ".agents", "skills", "registry.md")) ? "OK" : "not-started",
      supplyChainRisks: 0,
      unapprovedUsed: 0,
      blockedOrRejected: 0,
      remoteSources: 0,
      unauditedRemoteUsed: 0,
      status: "not-started",
      blockers: [],
      warnings: []
    };
  }

  const used = entries.filter((entry) => entry.status === "Usado" || entry.status === "Usada");
  const unapprovedUsed = used.filter((entry) => !hasApproval(cwd, entry.id)).length;
  const blockedOrRejected = entries.filter((entry) => /Rejeitad|Bloquead/.test(entry.status)).length;
  const remoteSources = entries.filter((entry) => isRemoteSource(entry.source)).length;
  const unauditedRemoteUsed = used.filter((entry) => isRemoteSource(entry.source) && !hasAudit(cwd, entry.id)).length;
  const missingSources = entries.filter((entry) => !entry.source || entry.source === "-" || entry.source === "Não informada").length;
  const supplyChainRisks = entries.filter((entry) => calculateSupplyChainRisk(entry) !== "LOW").length;
  const blockers = [
    ...(unapprovedUsed > 0 ? [`${unapprovedUsed} extensão(ões) usada(s) sem aprovação humana`] : []),
    ...(missingSources > 0 ? [`${missingSources} extensão(ões) sem origem declarada`] : []),
    ...(used.some((entry) => /Rejeitad|Bloquead/.test(entry.status)) ? ["Extensão rejeitada/bloqueada marcada como usada"] : [])
  ];
  const warnings = [
    ...(remoteSources > 0 ? [`${remoteSources} extensão(ões) com origem remota`] : []),
    ...(unauditedRemoteUsed > 0 ? [`${unauditedRemoteUsed} extensão(ões) remota(s) usada(s) sem auditoria`] : [])
  ];

  return {
    policy: existsSync(join(base, "extension-policy.md")) ? "OK" : "missing",
    registry: existsSync(join(base, "registry.md")) ? "OK" : "missing",
    pluginRegistry: existsSync(join(base, "plugins")) ? "OK" : "missing",
    skillsRegistry: existsSync(join(cwd, ".agents", "skills", "registry.md")) ? "OK" : "missing",
    supplyChainRisks,
    unapprovedUsed,
    blockedOrRejected,
    remoteSources,
    unauditedRemoteUsed,
    status: blockers.length > 0 ? "broken" : warnings.length > 0 ? "warning" : "healthy",
    blockers,
    warnings
  };
}

function hasApproval(cwd: string, id: string): boolean {
  return filesContain(join(cwd, ".sdd-master", "extensions", "approvals"), id, "## Decisão\napproved");
}

function hasAudit(cwd: string, id: string): boolean {
  return filesContain(join(cwd, ".sdd-master", "extensions", "audits"), id);
}

function filesContain(directory: string, ...patterns: string[]): boolean {
  if (!existsSync(directory)) return false;
  return readdirSync(directory)
    .filter((file) => file.endsWith(".md"))
    .some((file) => {
      const content = readFileSync(join(directory, file), "utf8");
      return patterns.every((pattern) => content.includes(pattern));
    });
}
