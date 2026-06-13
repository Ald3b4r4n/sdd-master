import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { safeWriteFile } from "../filesystem/safe-write.js";
import { getImplementReadiness } from "../governance/blockers.js";
import type { GateOptions, GateResult, GateWrite } from "./gate-types.js";
import { getGateStatus, listGateRecords, nextGateId, updateGateProjectState } from "./gate-state.js";

export function runBlocker(cwd: string, options: GateOptions): GateResult {
  const writes: GateWrite[] = [];

  if (!options.yes && !options.id && !options.title) {
    const readiness = getImplementReadiness(cwd);
    return {
      status: "listed",
      command: "blocker",
      createdFiles: [],
      updatedFiles: [],
      preservedFiles: [],
      message: "Blockers listados.",
      implementReady: readiness.ready,
      blockers: readiness.blockers,
      records: listGateRecords(cwd, ".sdd-master/blockers", "BLOCKER-")
    };
  }

  const id = options.id ?? nextGateId(cwd, ".sdd-master/blockers", "BLOCKER-");

  if (options.id && options.status === "resolved") {
    writes.push(resolveBlocker(cwd, id, options.reason ?? "Blocker resolvido pelo humano."));
  } else {
    writes.push(writeBlocker(cwd, id, options, options.type ?? "manual"));
  }

  writes.push(writeBlockerIndex(cwd));
  const status = getGateStatus(cwd);
  if (updateGateProjectState(cwd, status)) {
    writes.push({ path: ".sdd-master/project-state.md", status: "updated" });
  }

  const readiness = getImplementReadiness(cwd);

  return {
    status: options.id && options.status === "resolved" ? "updated" : "created",
    command: "blocker",
    id,
    createdFiles: pathsByStatus(writes, "created"),
    updatedFiles: pathsByStatus(writes, "updated"),
    preservedFiles: pathsByStatus(writes, "preserved"),
    message: options.id && options.status === "resolved" ? "Blocker resolvido." : "Blocker registrado.",
    implementReady: readiness.ready,
    blockers: readiness.blockers,
    records: listGateRecords(cwd, ".sdd-master/blockers", "BLOCKER-")
  };
}

export function ensureBlocker(cwd: string, options: GateOptions, origin: string): GateWrite {
  const id = nextGateId(cwd, ".sdd-master/blockers", "BLOCKER-");
  return writeBlocker(cwd, id, options, origin);
}

function writeBlocker(cwd: string, id: string, options: GateOptions, origin: string): GateWrite {
  const path = `.sdd-master/blockers/${id}.md`;
  const fullPath = join(cwd, path);
  if (existsSync(fullPath)) {
    return { path, status: "preserved" };
  }

  safeWriteFile(cwd, path, blockerContent(id, options, origin));
  return { path, status: "created" };
}

function resolveBlocker(cwd: string, id: string, reason: string): GateWrite {
  const path = `.sdd-master/blockers/${id}.md`;
  const fullPath = join(cwd, path);
  if (!existsSync(fullPath)) {
    safeWriteFile(
      cwd,
      path,
      blockerContent(id, { yes: true, json: false, phase: "PHASE-01", title: id, reason, status: "resolved" }, "manual")
    );
    return { path, status: "created" };
  }

  const content = readFileSync(fullPath, "utf8").replace("## Status\nAberto", "## Status\nResolvido");
  safeWriteFile(cwd, path, `${content.trimEnd()}\n| ${today()} | Blocker resolvido | Humano |\n`);
  return { path, status: "updated" };
}

function writeBlockerIndex(cwd: string): GateWrite {
  const path = ".sdd-master/blockers/blockers-index.md";
  const fullPath = join(cwd, path);
  const existed = existsSync(fullPath);
  const rows = existsSync(dirname(fullPath))
    ? readdirSync(dirname(fullPath))
        .filter((file) => file.startsWith("BLOCKER-") && file.endsWith(".md"))
        .map((file) => {
          const content = readFileSync(join(dirname(fullPath), file), "utf8");
          const status = content.match(/^## Status\n(.+)$/m)?.[1] ?? "Aberto";
          return `- ${file.replace(".md", "")}: ${status}`;
        })
    : [];

  safeWriteFile(cwd, path, `# Índice de blockers\n\n${rows.join("\n")}\n`);
  return { path, status: existed ? "updated" : "created" };
}

function blockerContent(id: string, options: GateOptions, origin: string): string {
  return `# ${id} — ${options.title ?? "Bloqueio formal"}

## Fase
${options.phase}

## Severidade
${options.severity ?? "BLOCKER"}

## Status
${options.status === "resolved" ? "Resolvido" : "Aberto"}

## Motivo
${options.reason ?? "Implementação não pode começar."}

## Impacto
Impede avanço para implementação futura até resolução formal.

## Ação obrigatória
${options.decision ?? "Resolver causa do bloqueio e registrar aprovação humana quando aplicável."}

## Origem
${origin}

## Relacionamentos
- Auditorias:
- Quality:
- Docs:
- Requisitos:
- Tarefas:

## Aprovação humana
Pendente quando aplicável

## Histórico
| Data | Evento | Responsável |
|---|---|---|
| ${today()} | Blocker registrado | SDD Master |
`;
}

function pathsByStatus(writes: GateWrite[], status: GateWrite["status"]): string[] {
  return writes.filter((write) => write.status === status).map((write) => write.path);
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}
