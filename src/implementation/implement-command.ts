import { existsSync, mkdirSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import type { CliOutput, CliRuntime } from "../cli/output.js";
import { getNotInitializedMessage, isWorkflowInitialized } from "../workflow/workflow-guards.js";
import { getImplementationReadiness } from "./implement-readiness.js";
import { formatImplementJson, formatImplementText } from "./implement-report.js";
import type { ImplementOptions, ImplementResult } from "./implement-types.js";

export async function runImplementCommand(args: string[], output: CliOutput, runtime: CliRuntime): Promise<number> {
  if (args.includes("--help") || args.includes("-h")) {
    output.stdout(getImplementHelp());
    return 0;
  }

  const parsed = parseImplementArgs(args);
  if (!parsed.ok) {
    output.stderr(`${parsed.error}\n`);
    return 1;
  }

  if (!isWorkflowInitialized(runtime.cwd)) {
    output.stderr(getNotInitializedMessage());
    return 1;
  }

  const result = executeImplementGuard(runtime.cwd, parsed.options);
  output.stdout(parsed.options.json ? formatImplementJson(result) : formatImplementText(result));
  return result.ready ? 0 : 1;
}

function executeImplementGuard(cwd: string, options: ImplementOptions): ImplementResult {
  const readiness = getImplementationReadiness(cwd, options.task);
  const id = nextImplementId(cwd);
  const path = `.sdd-master/implementation/${id}.md`;
  const fullPath = join(cwd, path);
  mkdirSync(dirname(fullPath), { recursive: true });
  writeFileSync(fullPath, implementationContent(id, options, readiness), "utf8");
  writeFileSync(join(cwd, ".sdd-master", "implementation", "implementation-index.md"), implementationIndex(cwd, id), "utf8");

  const status = readiness.ready ? "ready" : "blocked";

  return {
    status,
    mode: "guard",
    phase: options.phase,
    task: options.task,
    ready: readiness.ready,
    blockers: readiness.blockers,
    gates: readiness.gates,
    createdFiles: [path],
    updatedFiles: [".sdd-master/implementation/implementation-index.md"],
    codeChanged: false,
    nextActions: readiness.ready
      ? ["Solicitar aprovação humana para implementação real."]
      : readiness.blockers.map(toAction)
  };
}

function parseImplementArgs(args: string[]): { ok: true; options: ImplementOptions } | { ok: false; error: string } {
  const options: ImplementOptions = {
    yes: false,
    json: false,
    phase: "PHASE-01",
    task: "TASK-001",
    dryRun: true
  };

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];

    if (arg === "--yes" || arg === "-y") {
      options.yes = true;
      continue;
    }

    if (arg === "--json") {
      options.json = true;
      continue;
    }

    if (arg === "--dry-run") {
      options.dryRun = true;
      continue;
    }

    const name = ["phase", "task", "target"].find((option) => arg === `--${option}` || arg.startsWith(`--${option}=`));

    if (!name) {
      return { ok: false, error: `Opção desconhecida para implement: ${arg}` };
    }

    let value: string | undefined;
    if (arg === `--${name}`) {
      index += 1;
      value = args[index];
    } else {
      value = arg.slice(name.length + 3);
    }

    if (!value) {
      return { ok: false, error: `Valor ausente para --${name}` };
    }

    if (name === "phase") options.phase = value;
    if (name === "task") options.task = value;
    if (name === "target") {
      options.target = value;
      options.task = value;
    }
  }

  return { ok: true, options };
}

function implementationContent(
  id: string,
  options: ImplementOptions,
  readiness: ReturnType<typeof getImplementationReadiness>
): string {
  const status = readiness.ready ? "Pronto para autorização" : "Bloqueado";

  return `# ${id} — Preparação de Implementação

## Fase
${options.phase}

## Tarefa alvo
${options.task}

## Status
${status}

## Modo
Dry-run / Guard

## Escopo autorizado
Pendente de aprovação humana final.

## O que pode ser implementado
-

## O que não pode ser implementado
- Qualquer item fora do escopo aprovado.
- Qualquer mudança sem aprovação humana.

## Testes/checks obrigatórios antes de implementar
- Verificar test gates em ${options.task}.

## Documentação impactada
-

## Gates verificados

| Gate | Status | Evidência |
|---|---|---|
${readiness.gates.map((gate) => `| ${gate.gate} | ${gate.status} | ${gate.evidence} |`).join("\n")}

## Bloqueios encontrados
${readiness.blockers.length > 0 ? readiness.blockers.map((blocker) => `- ${blocker}`).join("\n") : "- Nenhum"}

## Ação necessária
${readiness.ready ? "- Solicitar aprovação humana para implementação real." : readiness.blockers.map((blocker) => `- ${toAction(blocker)}`).join("\n")}

## Aprovação humana para implementação real
Pendente

## Observação

Este registro não executa implementação.
Ele apenas prepara e valida os gates para uma implementação futura.
`;
}

function implementationIndex(cwd: string, latest: string): string {
  const directory = join(cwd, ".sdd-master", "implementation");
  const records = existsSync(directory)
    ? readdirSync(directory)
        .filter((file) => file.startsWith("IMPLEMENT-") && file.endsWith(".md"))
        .map((file) => `- ${file.replace(".md", "")}`)
    : [`- ${latest}`];

  if (!records.includes(`- ${latest}`)) {
    records.push(`- ${latest}`);
  }

  return `# Índice de implementação

${records.join("\n")}
`;
}

function nextImplementId(cwd: string): string {
  const directory = join(cwd, ".sdd-master", "implementation");
  const next = existsSync(directory)
    ? readdirSync(directory)
        .filter((file) => file.startsWith("IMPLEMENT-") && file.endsWith(".md"))
        .map((file) => Number(file.replace("IMPLEMENT-", "").replace(".md", "")))
        .filter((value) => Number.isInteger(value))
        .reduce((max, value) => Math.max(max, value), 0) + 1
    : 1;

  return `IMPLEMENT-${String(next).padStart(3, "0")}`;
}

function toAction(blocker: string): string {
  if (blocker.includes("Aprovação")) return `Registrar aprovação humana relacionada a: ${blocker}.`;
  if (blocker.includes("Testes obrigatórios")) return "Definir testes obrigatórios em TASK-001.";
  if (blocker.includes("Blockers")) return "Resolver blockers ativos.";
  if (blocker.includes("Auditoria")) return "Resolver ou aceitar formalmente achados de auditoria.";
  if (blocker.includes("Documentação")) return "Atualizar documentação pendente.";
  return `Corrigir: ${blocker}.`;
}

function getImplementHelp(): string {
  return `sdd master implement

Status:
  Disponível no BLOCO 20 em modo guard/dry-run.

Finalidade:
  Verificar readiness completo e preparar manifesto de implementação autorizável.

Importante:
  Nesta versão prototype, implement não altera código do projeto consumidor.
  O comportamento padrão é --dry-run.

Pré-condições:
  Projeto inicializado com sdd master init.
  Workflow, governança, gates e test gates devem estar prontos.

Uso:
  sdd master implement --yes --phase="PHASE-01" --task="TASK-001" --dry-run

Flags:
  --help
  --json
  --yes, -y
  --phase
  --task
  --target
  --dry-run

Gates:
  Discovery, requirements, spec, plan, tasks, approvals, clarifications, scope, quality, audit, docs, blockers, test gates e security/git.

Próximo passo futuro:
  Uma implementação real só poderá acontecer após aprovação humana explícita e gates mínimos aprovados.
`;
}
