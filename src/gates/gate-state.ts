import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { GateStatus } from "./gate-types.js";

export function getGateStatus(cwd: string): GateStatus {
  const qualityFiles = listFiles(cwd, ".sdd-master/quality", "QUALITY-");
  const auditFiles = listFiles(cwd, ".sdd-master/audits", "AUDIT-");
  const docsFiles = listFiles(cwd, ".sdd-master/docs", "DOCS-");
  const blockerFiles = listFiles(cwd, ".sdd-master/blockers", "BLOCKER-");
  const quality = qualityFiles.map((file) => readFileSync(join(cwd, ".sdd-master/quality", file), "utf8"));
  const audits = auditFiles.map((file) => readFileSync(join(cwd, ".sdd-master/audits", file), "utf8"));
  const docs = docsFiles.map((file) => readFileSync(join(cwd, ".sdd-master/docs", file), "utf8"));
  const blockers = blockerFiles.map((file) => readFileSync(join(cwd, ".sdd-master/blockers", file), "utf8"));

  return {
    quality: {
      total: quality.length,
      failedOpen: quality.filter((content) => hasStatus(content, "failed")).length,
      warnings: quality.filter((content) => hasStatus(content, "warning")).length
    },
    audit: {
      total: audits.length,
      blockerOpen: audits.filter((content) => hasSeverity(content, "BLOCKER") && isOpen(content)).length,
      highCriticalOpen: audits.filter((content) =>
        (hasSeverity(content, "HIGH") || hasSeverity(content, "CRITICAL")) && isOpen(content)
      ).length
    },
    docs: {
      total: docs.length,
      pending: docs.filter((content) => hasStatus(content, "missing") || hasStatus(content, "outdated")).length,
      publicAxesPresent:
        existsSync(join(cwd, "docs", "01-negocio-requisitos")) &&
        existsSync(join(cwd, "docs", "02-tecnica-arquitetura")) &&
        existsSync(join(cwd, "docs", "03-codigo"))
    },
    blockers: {
      total: blockers.length,
      open: blockers.filter(isOpen).length,
      resolved: blockers.filter((content) => content.includes("## Status\nResolvido")).length
    }
  };
}

export function nextGateId(cwd: string, directory: string, prefix: string): string {
  const next = listFiles(cwd, directory, prefix)
    .map((file) => Number(file.replace(prefix, "").replace(".md", "")))
    .filter((value) => Number.isInteger(value))
    .reduce((max, value) => Math.max(max, value), 0) + 1;

  return `${prefix}${String(next).padStart(3, "0")}`;
}

export function listGateRecords(cwd: string, directory: string, prefix: string): string[] {
  return listFiles(cwd, directory, prefix).map((file) => file.replace(".md", ""));
}

export function updateGateProjectState(cwd: string, status: GateStatus): boolean {
  const path = join(cwd, ".sdd-master", "project-state.md");

  if (!existsSync(path)) {
    return false;
  }

  const block = `## Gates
- Quality reviews registradas: ${status.quality.total}
- Quality failures abertas: ${status.quality.failedOpen}
- Auditorias registradas: ${status.audit.total}
- Auditorias BLOCKER abertas: ${status.audit.blockerOpen}
- Docs checks registrados: ${status.docs.total}
- Pendências documentais: ${status.docs.pending}
- Blockers abertos: ${status.blockers.open}
`;
  const content = readFileSync(path, "utf8");
  writeFileSync(path, upsertBlock(content, "## Gates", block), "utf8");
  return true;
}

function listFiles(cwd: string, directory: string, prefix: string): string[] {
  const fullPath = join(cwd, directory);

  if (!existsSync(fullPath)) {
    return [];
  }

  return readdirSync(fullPath).filter((file) => file.startsWith(prefix) && file.endsWith(".md"));
}

function hasStatus(content: string, status: string): boolean {
  return new RegExp(`^## Status\\n${escapeRegExp(status)}$`, "m").test(content);
}

function hasSeverity(content: string, severity: string): boolean {
  return new RegExp(`^## Severidade\\n${escapeRegExp(severity)}$`, "m").test(content);
}

function isOpen(content: string): boolean {
  return content.includes("## Status\nAberto") || content.includes("## Status\nfailed") || content.includes("## Status\noutdated") || content.includes("## Status\nmissing");
}

function upsertBlock(content: string, heading: string, block: string): string {
  if (!content.includes(heading)) {
    return `${content.trimEnd()}\n\n${block}`;
  }

  const pattern = new RegExp(`${escapeRegExp(heading)}[\\s\\S]*?(?=\\n## |$)`);
  return content.replace(pattern, block.trimEnd());
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
