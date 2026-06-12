import type { CliOutput, CliRuntime } from "../cli/output.js";
import { getNotInitializedMessage, isWorkflowInitialized } from "../workflow/workflow-guards.js";
import { runAudit } from "./audit.js";
import { runBlocker } from "./blockers.js";
import { runDocs } from "./docs.js";
import { formatGateJson, formatGateText } from "./gate-report.js";
import type { GateCommandName, GateOptions } from "./gate-types.js";
import { runQuality } from "./quality.js";

export async function runGateCommand(
  command: GateCommandName,
  args: string[],
  output: CliOutput,
  runtime: CliRuntime
): Promise<number> {
  if (args.includes("--help") || args.includes("-h")) {
    output.stdout(getGateHelp(command));
    return 0;
  }

  const parsed = parseGateArgs(args);
  if (!parsed.ok) {
    output.stderr(`${parsed.error}\n`);
    return 1;
  }

  if (!isWorkflowInitialized(runtime.cwd)) {
    output.stderr(getNotInitializedMessage());
    return 1;
  }

  try {
    const result =
      command === "quality"
        ? runQuality(runtime.cwd, parsed.options)
        : command === "audit"
          ? runAudit(runtime.cwd, parsed.options)
          : command === "docs"
            ? runDocs(runtime.cwd, parsed.options)
            : runBlocker(runtime.cwd, parsed.options);

    output.stdout(parsed.options.json ? formatGateJson(result) : formatGateText(title(command), result));
    return 0;
  } catch (error) {
    output.stderr(`${error instanceof Error ? error.message : String(error)}\n`);
    return 1;
  }
}

function parseGateArgs(args: string[]): { ok: true; options: GateOptions } | { ok: false; error: string } {
  const options: GateOptions = {
    yes: false,
    json: false,
    phase: "PHASE-01"
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

    const name = [
      "title",
      "id",
      "phase",
      "status",
      "severity",
      "category",
      "reason",
      "type",
      "target",
      "decision",
      "file"
    ].find((option) => arg === `--${option}` || arg.startsWith(`--${option}=`));

    if (!name) {
      return { ok: false, error: `Opção desconhecida para gate: ${arg}` };
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

    options[name as keyof Omit<GateOptions, "yes" | "json">] = value;
  }

  return { ok: true, options };
}

function getGateHelp(command: GateCommandName): string {
  const examples = {
    quality: 'sdd master quality --yes --phase="PHASE-01" --target="tasks" --title="Revisão de qualidade"',
    audit: 'sdd master audit --yes --phase="PHASE-01" --type="self-audit" --title="Auditoria da fase"',
    docs: 'sdd master docs --yes --phase="PHASE-01" --target="workflow" --title="Validação documental"',
    blocker: 'sdd master blocker --yes --title="Bloqueio formal" --phase="PHASE-01" --severity="BLOCKER"'
  };

  return `sdd master ${command}

Status:
  Disponível no BLOCO 19.

Finalidade:
  ${purpose(command)}

Uso:
  ${examples[command]}

Flags:
  --help
  --json
  --yes, -y
  --title
  --id
  --phase
  --status
  --severity
  --category
  --reason
  --type
  --target
  --decision
  --file

Arquivos criados:
  .sdd-master/${command === "docs" ? "docs" : command === "audit" ? "audits" : command === "blocker" ? "blockers" : "quality"}/

Impactos no fluxo:
  Alimenta status, doctor e readiness de implementação.

Bloqueios:
  BLOCKER aberto, auditoria crítica, docs pendente ou quality failed impedem futura implementação.

Relação com implementação:
  Este comando prepara portões formais. Não executa implementação.
`;
}

function purpose(command: GateCommandName): string {
  return {
    quality: "Registrar revisão de qualidade de uma fase, documento, requisito ou tarefa.",
    audit: "Registrar auditoria formal, incluindo achados de severidade.",
    docs: "Validar e registrar atualização ou estado documental.",
    blocker: "Criar, listar, resolver e consultar blockers formais."
  }[command];
}

function title(command: GateCommandName): string {
  return {
    quality: "Quality",
    audit: "Audit",
    docs: "Docs",
    blocker: "Blocker"
  }[command];
}
