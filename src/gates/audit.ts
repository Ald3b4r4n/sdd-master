import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { getImplementReadiness } from "../governance/blockers.js";
import { ensureBlocker } from "./blockers.js";
import type { GateOptions, GateResult, GateWrite } from "./gate-types.js";
import { getGateStatus, nextGateId, updateGateProjectState } from "./gate-state.js";

const severities = new Set(["INFO", "LOW", "MEDIUM", "HIGH", "CRITICAL", "BLOCKER"]);

export function runAudit(cwd: string, options: GateOptions): GateResult {
  const severity = options.severity ?? "INFO";

  if (!severities.has(severity)) {
    throw new Error(`Severidade inválida: ${severity}`);
  }

  const writes: GateWrite[] = [];
  const id = nextGateId(cwd, ".sdd-master/audits", "AUDIT-");
  writes.push(writeAudit(cwd, id, options));

  if (severity === "BLOCKER") {
    writes.push(ensureBlocker(cwd, { ...options, title: options.title ?? "Auditoria BLOCKER" }, "audit"));
  }

  writes.push(writeAuditIndex(cwd));
  const status = getGateStatus(cwd);
  if (updateGateProjectState(cwd, status)) {
    writes.push({ path: ".sdd-master/project-state.md", status: "updated" });
  }

  const readiness = getImplementReadiness(cwd);
  return {
    status: "created",
    command: "audit",
    id,
    createdFiles: pathsByStatus(writes, "created"),
    updatedFiles: pathsByStatus(writes, "updated"),
    preservedFiles: pathsByStatus(writes, "preserved"),
    message: "Auditoria registrada.",
    implementReady: readiness.ready,
    blockers: readiness.blockers
  };
}

function writeAudit(cwd: string, id: string, options: GateOptions): GateWrite {
  const path = `.sdd-master/audits/${id}.md`;
  const fullPath = join(cwd, path);
  mkdirSync(dirname(fullPath), { recursive: true });
  writeFileSync(fullPath, auditContent(id, options), "utf8");
  return { path, status: "created" };
}

function writeAuditIndex(cwd: string): GateWrite {
  const path = ".sdd-master/audits/audit-index.md";
  const fullPath = join(cwd, path);
  mkdirSync(dirname(fullPath), { recursive: true });
  const existed = existsSync(fullPath);
  const rows = readdirSync(dirname(fullPath))
    .filter((file) => file.startsWith("AUDIT-") && file.endsWith(".md"))
    .map((file) => {
      const content = readFileSync(join(dirname(fullPath), file), "utf8");
      const severity = content.match(/^## Severidade\n(.+)$/m)?.[1] ?? "INFO";
      return `- ${file.replace(".md", "")}: ${severity}`;
    });
  writeFileSync(fullPath, `# Índice de auditorias\n\n${rows.join("\n")}\n`, "utf8");
  return { path, status: existed ? "updated" : "created" };
}

function auditContent(id: string, options: GateOptions): string {
  return `# ${id} — ${options.title ?? "Auditoria"}

## Tipo
${options.type ?? "self-audit"}

## Fase
${options.phase}

## Severidade
${options.severity ?? "INFO"}

## Categoria
${options.category ?? "workflow"}

## Evidência
${options.reason ?? "Evidência registrada sem expor segredo."}

## Impacto
Pode afetar readiness de implementação conforme severidade.

## Ação obrigatória
${options.reason ?? "Avaliar achado e registrar decisão humana."}

## Status
Aberto

## Relacionamentos
- Requisitos:
- Tarefas:
- Documentos:
- Commits:
- Blockers:

## Aprovação humana
Pendente quando aplicável
`;
}

function pathsByStatus(writes: GateWrite[], status: GateWrite["status"]): string[] {
  return writes.filter((write) => write.status === status).map((write) => write.path);
}
