import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { getImplementReadiness } from "../governance/blockers.js";
import type { GateOptions, GateResult, GateWrite } from "./gate-types.js";
import { getGateStatus, nextGateId, updateGateProjectState } from "./gate-state.js";

export function runDocs(cwd: string, options: GateOptions): GateResult {
  const writes: GateWrite[] = [];
  const id = nextGateId(cwd, ".sdd-master/docs", "DOCS-");
  writes.push(writeDocs(cwd, id, options));
  writes.push(writeDocsIndex(cwd));
  const status = getGateStatus(cwd);
  if (updateGateProjectState(cwd, status)) {
    writes.push({ path: ".sdd-master/project-state.md", status: "updated" });
  }

  const readiness = getImplementReadiness(cwd);
  return {
    status: "created",
    command: "docs",
    id,
    createdFiles: pathsByStatus(writes, "created"),
    updatedFiles: pathsByStatus(writes, "updated"),
    preservedFiles: pathsByStatus(writes, "preserved"),
    message: "Check documental registrado.",
    implementReady: readiness.ready,
    blockers: readiness.blockers
  };
}

function writeDocs(cwd: string, id: string, options: GateOptions): GateWrite {
  const path = `.sdd-master/docs/${id}.md`;
  const fullPath = join(cwd, path);
  mkdirSync(dirname(fullPath), { recursive: true });
  writeFileSync(fullPath, docsContent(cwd, id, options), "utf8");
  return { path, status: "created" };
}

function writeDocsIndex(cwd: string): GateWrite {
  const path = ".sdd-master/docs/docs-index.md";
  const fullPath = join(cwd, path);
  mkdirSync(dirname(fullPath), { recursive: true });
  const existed = existsSync(fullPath);
  const rows = readdirSync(dirname(fullPath))
    .filter((file) => file.startsWith("DOCS-") && file.endsWith(".md"))
    .map((file) => {
      const content = readFileSync(join(dirname(fullPath), file), "utf8");
      const status = content.match(/^## Status\n(.+)$/m)?.[1] ?? "needs-review";
      return `- ${file.replace(".md", "")}: ${status}`;
    });
  writeFileSync(fullPath, `# Índice de docs\n\n${rows.join("\n")}\n`, "utf8");
  return { path, status: existed ? "updated" : "created" };
}

function docsContent(cwd: string, id: string, options: GateOptions): string {
  const axes = [
    "docs/01-negocio-requisitos",
    "docs/02-tecnica-arquitetura",
    "docs/03-codigo"
  ];
  const evaluated = axes.map((axis) => `- ${axis}: ${existsSync(join(cwd, axis)) ? "OK" : "Ausente"}`).join("\n");

  return `# ${id} — ${options.title ?? "Validação documental"}

## Fase
${options.phase}

## Target
${options.target ?? options.file ?? "workflow"}

## Status
${options.status ?? "updated"}

## Documentos avaliados
${evaluated}

## Pendências documentais
- ${options.reason ?? "Nenhuma pendência registrada."}

## Impacto
Documentação missing ou outdated bloqueia readiness de implementação.

## Ação obrigatória
- ${(options.status === "missing" || options.status === "outdated") ? options.reason ?? "Atualizar documentação." : "Nenhuma ação obrigatória."}

## Aprovação humana
Pendente quando aplicável

## Relacionamentos
- Requisitos:
- Tarefas:
- Auditorias:
- Quality:
`;
}

function pathsByStatus(writes: GateWrite[], status: GateWrite["status"]): string[] {
  return writes.filter((write) => write.status === status).map((write) => write.path);
}
