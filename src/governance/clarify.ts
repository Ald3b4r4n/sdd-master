import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { safeWriteFile } from "../filesystem/safe-write.js";
import type { GovernanceOptions, GovernanceResult, GovernanceWrite } from "./governance-types.js";
import { getGovernanceStatus, nextGovernanceId, updateGovernanceProjectState } from "./governance-state.js";
import { getImplementReadiness } from "./blockers.js";

export function runClarify(cwd: string, options: GovernanceOptions): GovernanceResult {
  const writes: GovernanceWrite[] = [];
  const id = options.id ?? nextGovernanceId(cwd, ".sdd-master/clarifications", "CLARIFY-");

  if (options.id && options.status === "resolved") {
    writes.push(updateClarification(cwd, id, options.reason ?? "Resolvida pelo humano."));
  } else {
    writes.push(writeClarification(cwd, id, options));
  }

  writes.push(writeClarificationIndex(cwd));
  const status = getGovernanceStatus(cwd);

  if (updateGovernanceProjectState(cwd, status)) {
    writes.push({ path: ".sdd-master/project-state.md", status: "updated" });
  }

  const readiness = getImplementReadiness(cwd);

  return {
    status: options.id && options.status === "resolved" ? "updated" : "created",
    command: "clarify",
    id,
    createdFiles: pathsByStatus(writes, "created"),
    updatedFiles: pathsByStatus(writes, "updated"),
    preservedFiles: pathsByStatus(writes, "preserved"),
    message: options.id && options.status === "resolved" ? "Clarificação resolvida." : "Clarificação registrada.",
    implementReady: readiness.ready,
    blockers: readiness.blockers
  };
}

function writeClarification(cwd: string, id: string, options: GovernanceOptions): GovernanceWrite {
  const path = `.sdd-master/clarifications/${id}.md`;
  const fullPath = join(cwd, path);
  if (existsSync(fullPath)) {
    return { path, status: "preserved" };
  }

  safeWriteFile(cwd, path, clarificationContent(id, options));
  return { path, status: "created" };
}

function updateClarification(cwd: string, id: string, reason: string): GovernanceWrite {
  const path = `.sdd-master/clarifications/${id}.md`;
  const fullPath = join(cwd, path);
  if (!existsSync(fullPath)) {
    safeWriteFile(
      cwd,
      path,
      clarificationContent(id, {
        yes: true,
        json: false,
        title: "Clarificação resolvida",
        type: "question",
        status: "resolved",
        reason,
        phase: "PHASE-01"
      })
    );
    return { path, status: "created" };
  }

  const content = readFileSync(fullPath, "utf8")
    .replace("## Status\nAberta", "## Status\nResolvida")
    .replace("## Resposta humana\nPendente", `## Resposta humana\n${reason}`);
  safeWriteFile(cwd, path, appendHistory(content, "Dúvida resolvida"));
  return { path, status: "updated" };
}

function writeClarificationIndex(cwd: string): GovernanceWrite {
  const path = ".sdd-master/clarifications/clarifications-index.md";
  const fullPath = join(cwd, path);
  const existed = existsSync(fullPath);
  const status = getGovernanceStatus(cwd);
  safeWriteFile(
    cwd,
    path,
    `# Índice de clarificações

- Total: ${status.clarifications.total}
- Abertas: ${status.clarifications.open}
- Resolvidas: ${status.clarifications.resolved}
`
  );
  return { path, status: existed ? "updated" : "created" };
}

function clarificationContent(id: string, options: GovernanceOptions): string {
  const title = options.title ?? "Clarificação";
  const type = options.type ?? "question";
  const phase = options.phase;
  const status = options.status === "resolved" ? "Resolvida" : "Aberta";
  const answer = options.status === "resolved" ? (options.reason ?? "Resolvida pelo humano.") : "Pendente";
  const date = today();

  return `# ${id} — ${title}

## Tipo
${type}

## Fase
${phase}

## Status
${status}

## Pergunta
${title}

## Resposta humana
${answer}

## Impacto se não resolver
Pode bloquear especificação, planejamento ou implementação.

## Relacionamentos
- Requisitos:
- Especificações:
- Tarefas:
- Documentos:

## Histórico
| Data | Evento | Responsável |
|---|---|---|
| ${date} | Dúvida registrada | SDD Master |
`;
}

function appendHistory(content: string, event: string): string {
  return `${content.trimEnd()}\n| ${today()} | ${event} | Humano |\n`;
}

function pathsByStatus(writes: GovernanceWrite[], status: GovernanceWrite["status"]): string[] {
  return writes.filter((write) => write.status === status).map((write) => write.path);
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}
