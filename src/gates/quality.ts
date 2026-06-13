import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { safeWriteFile } from "../filesystem/safe-write.js";
import { getImplementReadiness } from "../governance/blockers.js";
import { ensureBlocker } from "./blockers.js";
import type { GateOptions, GateResult, GateWrite } from "./gate-types.js";
import { getGateStatus, nextGateId, updateGateProjectState } from "./gate-state.js";

export function runQuality(cwd: string, options: GateOptions): GateResult {
  const writes: GateWrite[] = [];
  const id = nextGateId(cwd, ".sdd-master/quality", "QUALITY-");
  writes.push(writeQuality(cwd, id, options));

  if ((options.status ?? "passed") === "failed") {
    writes.push(ensureBlocker(cwd, { ...options, title: options.title ?? "Quality failed" }, "quality"));
  }

  writes.push(writeQualityIndex(cwd));
  const status = getGateStatus(cwd);
  if (updateGateProjectState(cwd, status)) {
    writes.push({ path: ".sdd-master/project-state.md", status: "updated" });
  }

  const readiness = getImplementReadiness(cwd);
  return result("quality", id, writes, "Revisão de qualidade registrada.", readiness.ready, readiness.blockers);
}

function writeQuality(cwd: string, id: string, options: GateOptions): GateWrite {
  const path = `.sdd-master/quality/${id}.md`;
  const fullPath = join(cwd, path);
  safeWriteFile(cwd, path, qualityContent(id, options));
  return { path, status: "created" };
}

function writeQualityIndex(cwd: string): GateWrite {
  const path = ".sdd-master/quality/quality-index.md";
  const fullPath = join(cwd, path);
  const existed = existsSync(fullPath);
  const rows = readdirSync(dirname(fullPath))
    .filter((file) => file.startsWith("QUALITY-") && file.endsWith(".md"))
    .map((file) => {
      const content = readFileSync(join(dirname(fullPath), file), "utf8");
      const status = content.match(/^## Status\n(.+)$/m)?.[1] ?? "passed";
      return `- ${file.replace(".md", "")}: ${status}`;
    });
  safeWriteFile(cwd, path, `# Índice de qualidade\n\n${rows.join("\n")}\n`);
  return { path, status: existed ? "updated" : "created" };
}

function qualityContent(id: string, options: GateOptions): string {
  return `# ${id} — ${options.title ?? "Revisão de qualidade"}

## Tipo
Quality Review

## Fase
${options.phase}

## Target
${options.target ?? "tasks"}

## Status
${options.status ?? "passed"}

## Critérios avaliados
- Requisitos claros:
- Critérios de aceite:
- Testes previstos:
- Documentação impactada:
- Segurança:
- Rastreabilidade:
- Escopo:
- Aprovação humana:

## Achados
- ${options.reason ?? "Nenhum achado crítico registrado."}

## Ação obrigatória
- ${(options.status ?? "passed") === "failed" ? options.reason ?? "Corrigir falha de qualidade." : "Nenhuma ação obrigatória."}

## Aprovação humana
Pendente

## Relacionamentos
- Requisitos:
- Tarefas:
- Documentos:
- Auditorias:

## Histórico
| Data | Evento | Responsável |
|---|---|---|
| ${new Date().toISOString().slice(0, 10)} | Revisão registrada | SDD Master |
`;
}

function result(command: "quality", id: string, writes: GateWrite[], message: string, ready: boolean, blockers: string[]): GateResult {
  return {
    status: "created",
    command,
    id,
    createdFiles: pathsByStatus(writes, "created"),
    updatedFiles: pathsByStatus(writes, "updated"),
    preservedFiles: pathsByStatus(writes, "preserved"),
    message,
    implementReady: ready,
    blockers
  };
}

function pathsByStatus(writes: GateWrite[], status: GateWrite["status"]): string[] {
  return writes.filter((write) => write.status === status).map((write) => write.path);
}
