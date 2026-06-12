import { appendFileSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { getImplementReadiness } from "./blockers.js";
import { getGovernanceStatus, nextGovernanceId, updateGovernanceProjectState } from "./governance-state.js";
import type { GovernanceOptions, GovernanceResult, GovernanceWrite } from "./governance-types.js";

export function runScope(cwd: string, options: GovernanceOptions): GovernanceResult {
  const writes: GovernanceWrite[] = [];
  const type = options.type ?? "approved";

  if (type === "approved") {
    writes.push(appendScopeLine(cwd, ".sdd-master/scope/approved-scope.md", options));
  } else if (type === "out-of-scope") {
    writes.push(appendScopeLine(cwd, ".sdd-master/scope/out-of-scope.md", options));
  } else {
    const id = nextGovernanceId(cwd, ".sdd-master/scope/changes", "CHANGE-");
    writes.push(writeScopeChange(cwd, id, options));
  }

  const status = getGovernanceStatus(cwd);
  if (updateGovernanceProjectState(cwd, status)) {
    writes.push({ path: ".sdd-master/project-state.md", status: "updated" });
  }

  const readiness = getImplementReadiness(cwd);

  return {
    status: "registered",
    command: "scope",
    createdFiles: pathsByStatus(writes, "created"),
    updatedFiles: pathsByStatus(writes, "updated"),
    preservedFiles: pathsByStatus(writes, "preserved"),
    message: "Registro de escopo atualizado.",
    implementReady: readiness.ready,
    blockers: readiness.blockers
  };
}

function appendScopeLine(cwd: string, relativePath: string, options: GovernanceOptions): GovernanceWrite {
  const fullPath = join(cwd, relativePath);
  const existed = existsSync(fullPath);
  mkdirSync(dirname(fullPath), { recursive: true });

  if (!existed) {
    writeFileSync(fullPath, `# ${relativePath.endsWith("approved-scope.md") ? "Escopo aprovado" : "Fora de escopo"}\n\n`, "utf8");
  }

  appendFileSync(
    fullPath,
    `- ${options.title ?? "Item de escopo"} | Fase: ${options.phase} | Motivo: ${options.reason ?? "Não informado."}\n`,
    "utf8"
  );
  return { path: relativePath, status: existed ? "updated" : "created" };
}

function writeScopeChange(cwd: string, id: string, options: GovernanceOptions): GovernanceWrite {
  const path = `.sdd-master/scope/changes/${id}.md`;
  const fullPath = join(cwd, path);
  mkdirSync(dirname(fullPath), { recursive: true });

  if (existsSync(fullPath)) {
    return { path, status: "preserved" };
  }

  writeFileSync(fullPath, scopeChangeContent(id, options), "utf8");
  return { path, status: "created" };
}

function scopeChangeContent(id: string, options: GovernanceOptions): string {
  return `# ${id} — ${options.title ?? "Mudança de escopo"}

## Tipo
${options.type ?? "Alteração"}

## Origem
Humano

## Fase
${options.phase}

## Descrição
${options.title ?? "Mudança de escopo registrada."}

## Motivo
${options.reason ?? "Motivo pendente."}

## Impacto em requisitos
-

## Impacto em arquitetura
-

## Impacto em tarefas
-

## Impacto em testes
-

## Impacto em documentação
-

## Riscos
-

## Recomendação
Transformar em backlog

## Aprovação humana
Pendente

## Status
Aberta
`;
}

function pathsByStatus(writes: GovernanceWrite[], status: GovernanceWrite["status"]): string[] {
  return writes.filter((write) => write.status === status).map((write) => write.path);
}
