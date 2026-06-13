import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { safeWriteFile } from "../filesystem/safe-write.js";
import { getImplementReadiness } from "./blockers.js";
import { getGovernanceStatus, nextGovernanceId, updateGovernanceProjectState } from "./governance-state.js";
import type { GovernanceOptions, GovernanceResult, GovernanceWrite } from "./governance-types.js";

const allowedTypes = new Set([
  "future-requirement",
  "improvement",
  "technical-debt",
  "future-risk",
  "idea",
  "audit-suggestion",
  "uiux-suggestion",
  "security-suggestion",
  "performance-suggestion",
  "documentation-suggestion",
  "wont-requirement",
  "refactor",
  "integration",
  "optimization"
]);

export function runBacklog(cwd: string, options: GovernanceOptions): GovernanceResult {
  const type = options.type ?? "idea";

  if (!allowedTypes.has(type)) {
    throw new Error(`Tipo inválido para backlog: ${type}`);
  }

  const writes: GovernanceWrite[] = [];
  const id = nextGovernanceId(cwd, ".sdd-master/backlog", "BACKLOG-");
  writes.push(writeBacklogItem(cwd, id, options));
  writes.push(writeBacklogIndex(cwd));

  const status = getGovernanceStatus(cwd);
  if (updateGovernanceProjectState(cwd, status)) {
    writes.push({ path: ".sdd-master/project-state.md", status: "updated" });
  }

  const readiness = getImplementReadiness(cwd);

  return {
    status: "created",
    command: "backlog",
    id,
    createdFiles: pathsByStatus(writes, "created"),
    updatedFiles: pathsByStatus(writes, "updated"),
    preservedFiles: pathsByStatus(writes, "preserved"),
    message: "Item de backlog registrado. Backlog não autoriza implementação.",
    implementReady: readiness.ready,
    blockers: readiness.blockers
  };
}

function writeBacklogItem(cwd: string, id: string, options: GovernanceOptions): GovernanceWrite {
  const path = `.sdd-master/backlog/${id}.md`;
  const fullPath = join(cwd, path);
  if (existsSync(fullPath)) {
    return { path, status: "preserved" };
  }

  safeWriteFile(cwd, path, backlogContent(id, options));
  return { path, status: "created" };
}

function writeBacklogIndex(cwd: string): GovernanceWrite {
  const path = ".sdd-master/backlog/backlog-index.md";
  const fullPath = join(cwd, path);
  const existed = existsSync(fullPath);
  const rows = readdirSync(dirname(fullPath))
    .filter((file) => file.startsWith("BACKLOG-") && file.endsWith(".md"))
    .map((file) => {
      const content = readFileSync(join(dirname(fullPath), file), "utf8");
      const type = content.match(/^## Tipo\n(.+)$/m)?.[1] ?? "idea";
      const title = content.match(/^# BACKLOG-\d+ — (.+)$/m)?.[1] ?? "Sem título";
      return `- ${file.replace(".md", "")}: ${title} — ${type}`;
    });

  safeWriteFile(cwd, path, `# Índice de backlog\n\n${rows.join("\n")}\n`);
  return { path, status: existed ? "updated" : "created" };
}

function backlogContent(id: string, options: GovernanceOptions): string {
  return `# ${id} — ${options.title ?? "Item futuro"}

## Tipo
${options.type ?? "idea"}

## Origem
Humano

## Descrição
${options.title ?? "Item futuro registrado."}

## Motivo para não entrar agora
${options.reason ?? "Fora do escopo da fase atual, depende de decisão futura ou não é prioridade."}

## Prioridade sugerida
${options.priority ?? "COULD"}

## Impacto esperado
Benefício ou risco a reavaliar futuramente.

## Fase de reavaliação
${options.phase}

## Relação
RF-XXX | RNF-XXX | TASK-XXX | AUDIT-XXX | RISK-XXX

## Status
Registrado
`;
}

function pathsByStatus(writes: GovernanceWrite[], status: GovernanceWrite["status"]): string[] {
  return writes.filter((write) => write.status === status).map((write) => write.path);
}
