import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { safeWriteFile } from "../filesystem/safe-write.js";
import { getImplementReadiness } from "./blockers.js";
import { getGovernanceStatus, nextGovernanceId, updateGovernanceProjectState } from "./governance-state.js";
import type { GovernanceOptions, GovernanceResult, GovernanceWrite } from "./governance-types.js";

export function runApprove(cwd: string, options: GovernanceOptions): GovernanceResult {
  if (!options.decision) {
    throw new Error("approve exige --decision=\"approved|rejected|pending\".");
  }

  const writes: GovernanceWrite[] = [];
  const id = nextGovernanceId(cwd, ".sdd-master/approvals", "APPROVAL-");
  writes.push(writeApproval(cwd, id, options));
  writes.push(writeApprovalsIndex(cwd));

  const status = getGovernanceStatus(cwd);
  if (updateGovernanceProjectState(cwd, status)) {
    writes.push({ path: ".sdd-master/project-state.md", status: "updated" });
  }

  const readiness = getImplementReadiness(cwd);

  return {
    status: "created",
    command: "approve",
    id,
    createdFiles: pathsByStatus(writes, "created"),
    updatedFiles: pathsByStatus(writes, "updated"),
    preservedFiles: pathsByStatus(writes, "preserved"),
    message: "Aprovação humana registrada.",
    implementReady: readiness.ready,
    blockers: readiness.blockers
  };
}

function writeApproval(cwd: string, id: string, options: GovernanceOptions): GovernanceWrite {
  const path = `.sdd-master/approvals/${id}.md`;
  const fullPath = join(cwd, path);
  safeWriteFile(cwd, path, approvalContent(id, options));
  return { path, status: "created" };
}

function writeApprovalsIndex(cwd: string): GovernanceWrite {
  const path = ".sdd-master/approvals/approvals-index.md";
  const fullPath = join(cwd, path);
  const existed = existsSync(fullPath);
  const rows = existsSync(dirname(fullPath))
    ? readdirSync(dirname(fullPath))
        .filter((file) => file.startsWith("APPROVAL-") && file.endsWith(".md"))
        .map((file) => {
          const content = readFileSync(join(dirname(fullPath), file), "utf8");
          const target = content.match(/^## Target\n(.+)$/m)?.[1] ?? "não informado";
          const decision = content.match(/^## Decisão\n(.+)$/m)?.[1] ?? "pending";
          return `- ${file.replace(".md", "")}: ${target} — ${decision}`;
        })
    : [];

  safeWriteFile(cwd, path, `# Índice de aprovações\n\n${rows.join("\n")}\n`);
  return { path, status: existed ? "updated" : "created" };
}

function approvalContent(id: string, options: GovernanceOptions): string {
  const target = options.target ?? "não informado";
  const phase = options.phase;
  const reason = options.reason ?? "Motivo informado pelo humano.";
  const decision = options.decision ?? "pending";

  return `# ${id} — ${target}

## Target
${target}

## Fase
${phase}

## Decisão
${decision}

## Justificativa
${reason}

## Aprovador
Humano

## Data
${new Date().toISOString().slice(0, 10)}

## Impacto
${impactForDecision(decision, target)}

## Relacionamentos
- Documentos:
- Requisitos:
- Tarefas:
- Riscos:

## Status
Registrado
`;
}

function impactForDecision(decision: string, target: string): string {
  if (decision === "approved") {
    return `Libera ${target} como etapa aprovada para cálculo futuro de prontidão.`;
  }

  if (decision === "rejected") {
    return `Bloqueia o próximo passo relacionado a ${target}.`;
  }

  return `Mantém ${target} pendente de decisão humana.`;
}

function pathsByStatus(writes: GovernanceWrite[], status: GovernanceWrite["status"]): string[] {
  return writes.filter((write) => write.status === status).map((write) => write.path);
}
