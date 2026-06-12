import type { CliOutput, CliRuntime } from "../cli/output.js";
import { getNotInitializedMessage, isWorkflowInitialized } from "../workflow/workflow-guards.js";
import { runApprove } from "./approval.js";
import { runBacklog } from "./backlog.js";
import { runClarify } from "./clarify.js";
import { formatGovernanceJson, formatGovernanceText } from "./governance-report.js";
import type { GovernanceCommandName, GovernanceDecision, GovernanceOptions, GovernancePriority } from "./governance-types.js";
import { runScope } from "./scope.js";

export async function runGovernanceCommand(
  command: GovernanceCommandName,
  args: string[],
  output: CliOutput,
  runtime: CliRuntime
): Promise<number> {
  if (args.includes("--help") || args.includes("-h")) {
    output.stdout(getGovernanceHelp(command));
    return 0;
  }

  const parsed = parseGovernanceArgs(args);
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
      command === "clarify"
        ? runClarify(runtime.cwd, parsed.options)
        : command === "approve"
          ? runApprove(runtime.cwd, parsed.options)
          : command === "scope"
            ? runScope(runtime.cwd, parsed.options)
            : runBacklog(runtime.cwd, parsed.options);

    output.stdout(
      parsed.options.json ? formatGovernanceJson(result) : formatGovernanceText(commandTitle(command), result)
    );
    return 0;
  } catch (error) {
    output.stderr(`${error instanceof Error ? error.message : String(error)}\n`);
    return 1;
  }
}

function parseGovernanceArgs(args: string[]): { ok: true; options: GovernanceOptions } | { ok: false; error: string } {
  const options: GovernanceOptions = {
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

    const readValue = (name: string): string | undefined => {
      if (arg === `--${name}`) {
        index += 1;
        return args[index];
      }

      if (arg.startsWith(`--${name}=`)) {
        return arg.slice(name.length + 3);
      }

      return undefined;
    };

    const valueName = ["title", "id", "type", "status", "reason", "phase", "target", "decision", "priority"].find(
      (name) => arg === `--${name}` || arg.startsWith(`--${name}=`)
    );

    if (!valueName) {
      return { ok: false, error: `Opção desconhecida para governança: ${arg}` };
    }

    const value = readValue(valueName);
    if (!value) {
      return { ok: false, error: `Valor ausente para --${valueName}` };
    }

    if (valueName === "decision") {
      if (!["approved", "rejected", "pending"].includes(value)) {
        return { ok: false, error: `Decisão inválida: ${value}` };
      }
      options.decision = value as GovernanceDecision;
      continue;
    }

    if (valueName === "priority") {
      if (!["MUST", "SHOULD", "COULD", "WONT"].includes(value)) {
        return { ok: false, error: `Prioridade inválida: ${value}` };
      }
      options.priority = value as GovernancePriority;
      continue;
    }

    options[valueName as "title" | "id" | "type" | "status" | "reason" | "phase" | "target"] = value;
  }

  return { ok: true, options };
}

function getGovernanceHelp(command: GovernanceCommandName): string {
  const examples = {
    clarify:
      'sdd master clarify --yes --title="Definir público-alvo principal" --phase="PHASE-01" --type="question"',
    approve:
      'sdd master approve --yes --target="tasks" --phase="PHASE-01" --decision="approved" --reason="Tarefas aprovadas."',
    scope: 'sdd master scope --yes --type="change" --title="Nova solicitação" --phase="PHASE-01"',
    backlog: 'sdd master backlog --yes --type="improvement" --title="Melhoria futura" --priority="COULD"'
  };

  const files = {
    clarify: ".sdd-master/clarifications/",
    approve: ".sdd-master/approvals/",
    scope: ".sdd-master/scope/",
    backlog: ".sdd-master/backlog/"
  };

  return `sdd master ${command}

Status:
  Disponível no BLOCO 18.

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
  --type
  --status
  --reason
  --phase
  --target
  --decision
  --priority

Arquivos criados:
  ${files[command]}

Impactos no fluxo:
  Atualiza governança, project-state e cálculo de prontidão para implementação.

Bloqueios:
  Clarificações abertas, mudanças de escopo abertas e rejeições impedem futura implementação.

Aprovação humana:
  Nunca é presumida. Registros de approve usam Aprovador: Humano.
`;
}

function purpose(command: GovernanceCommandName): string {
  const purposes = {
    clarify: "Registrar dúvidas, pendências de clarificação e respostas humanas.",
    approve: "Registrar aprovação humana formal de documentos, fases ou transições.",
    scope: "Controlar escopo aprovado, fora de escopo e mudanças de escopo.",
    backlog: "Registrar itens futuros sem autorizar implementação."
  };
  return purposes[command];
}

function commandTitle(command: GovernanceCommandName): string {
  const titles = {
    clarify: "Clarify",
    approve: "Approve",
    scope: "Scope",
    backlog: "Backlog"
  };
  return titles[command];
}
