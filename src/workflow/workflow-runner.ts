import { existsSync } from "node:fs";
import { join } from "node:path";
import type { CliOutput, CliRuntime } from "../cli/output.js";
import { discoveryStep } from "./commands/discovery.js";
import { planStep } from "./commands/plan.js";
import { requirementsStep } from "./commands/requirements.js";
import { specStep } from "./commands/spec.js";
import { tasksStep } from "./commands/tasks.js";
import { writeWorkflowFile } from "./workflow-files.js";
import {
  getMissingPrerequisiteMessage,
  getNotInitializedMessage,
  isWorkflowInitialized,
  missingPrerequisite
} from "./workflow-guards.js";
import { formatWorkflowJson, formatWorkflowText } from "./workflow-report.js";
import { updateWorkflowProjectState } from "./workflow-state.js";
import type { WorkflowCommandName, WorkflowOptions, WorkflowResult, WorkflowStep } from "./workflow-types.js";

const workflowSteps: Record<WorkflowCommandName, WorkflowStep> = {
  discovery: discoveryStep,
  requirements: requirementsStep,
  spec: specStep,
  plan: planStep,
  tasks: tasksStep
};

export async function runWorkflowCommand(
  command: WorkflowCommandName,
  args: string[],
  output: CliOutput,
  runtime: CliRuntime
): Promise<number> {
  const step = workflowSteps[command];

  if (args.includes("--help") || args.includes("-h")) {
    output.stdout(getWorkflowHelp(step));
    return 0;
  }

  const parsed = parseWorkflowArgs(args);

  if (!parsed.ok) {
    output.stderr(`${parsed.error}\n`);
    return 1;
  }

  if (!isWorkflowInitialized(runtime.cwd)) {
    output.stderr(getNotInitializedMessage());
    return 1;
  }

  const missing = missingPrerequisite(runtime.cwd, step.requiredPath);

  if (missing) {
    output.stderr(getMissingPrerequisiteMessage(missing));
    return 1;
  }

  const result = executeWorkflowStep(runtime.cwd, step, parsed.options);

  if (parsed.options.json) {
    output.stdout(formatWorkflowJson(result));
    return 0;
  }

  output.stdout(formatWorkflowText(step.heading, result));
  return 0;
}

function executeWorkflowStep(cwd: string, step: WorkflowStep, options: WorkflowOptions): WorkflowResult {
  const writes = step.files.map((file) => writeWorkflowFile(cwd, file.path, file.content(options)));
  const updatedFiles: string[] = [];

  if (
    updateWorkflowProjectState(cwd, {
      currentPhase: step.projectState.currentPhase,
      lastCompleted: step.projectState.lastCompleted,
      nextCommand: step.projectState.nextCommand,
      maturity: step.projectState.maturity,
      registry: `${step.title}: criado`
    })
  ) {
    updatedFiles.push(".sdd-master/project-state.md");
  }

  return {
    status: "created",
    command: step.command,
    createdFiles: writes.filter((write) => write.status === "created").map((write) => write.path),
    preservedFiles: writes.filter((write) => write.status === "preserved").map((write) => write.path),
    updatedFiles,
    nextCommand: step.nextCommand,
    approval: "pending",
    message:
      step.command === "tasks"
        ? "O próximo comando lógico é /sdd-master-implement, mas ele ainda não está implementado nesta versão prototype."
        : undefined
  };
}

function parseWorkflowArgs(args: string[]): { ok: true; options: WorkflowOptions } | { ok: false; error: string } {
  const options: WorkflowOptions = {
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

    if (arg === "--title") {
      index += 1;
      options.title = args[index];
      continue;
    }

    if (arg.startsWith("--title=")) {
      options.title = arg.slice("--title=".length);
      continue;
    }

    if (arg === "--phase") {
      index += 1;
      options.phase = normalizePhase(args[index]);
      continue;
    }

    if (arg.startsWith("--phase=")) {
      options.phase = normalizePhase(arg.slice("--phase=".length));
      continue;
    }

    if (arg === "--project-type") {
      index += 1;
      options.projectType = args[index];
      continue;
    }

    if (arg.startsWith("--project-type=")) {
      options.projectType = arg.slice("--project-type=".length);
      continue;
    }

    if (arg === "--profiles") {
      index += 1;
      options.profiles = args[index];
      continue;
    }

    if (arg.startsWith("--profiles=")) {
      options.profiles = arg.slice("--profiles=".length);
      continue;
    }

    if (arg === "--maturity") {
      index += 1;
      options.maturity = args[index];
      continue;
    }

    if (arg.startsWith("--maturity=")) {
      options.maturity = arg.slice("--maturity=".length);
      continue;
    }

    return { ok: false, error: `Opção desconhecida para workflow: ${arg}` };
  }

  return { ok: true, options };
}

function normalizePhase(value: string | undefined): string {
  const trimmed = value?.trim();
  return trimmed ? trimmed : "PHASE-01";
}

function getWorkflowHelp(step: WorkflowStep): string {
  return `sdd master ${step.command}

Status:
  Disponível no BLOCO 17.

Finalidade:
  Criar documentos iniciais de ${step.heading} no workflow SDD.

Pré-condições:
  Projeto inicializado com sdd master init.
  ${step.requiredPath ? `Arquivo obrigatório: ${step.requiredPath}.` : "Discovery pode rodar após init."}

Arquivos criados:
${step.files.map((file) => `  ${file.path}`).join("\n")}

Uso:
  sdd master ${step.command} --yes --title="${step.heading} inicial" --phase="PHASE-01"

Flags:
  --help
  --json
  --yes, -y
  --title
  --phase
  --project-type
  --profiles
  --maturity

Próximo comando:
  ${step.nextCommand}

Aprovação humana:
  Pendente. Este documento precisa de aprovação humana antes de avançar para a próxima fase.
`;
}

export function isWorkflowCommand(value: string): value is WorkflowCommandName {
  return ["discovery", "requirements", "spec", "plan", "tasks"].includes(value);
}

export function getWorkflowStatus(cwd: string): {
  discovery: boolean;
  requirements: boolean;
  spec: boolean;
  plan: boolean;
  tasks: boolean;
  nextCommand: string;
} {
  const exists = (path: string): boolean => existsSync(join(cwd, path));
  const discovery = exists(".sdd-master/discovery/initial-discovery.md");
  const requirements = exists(".sdd-master/requirements/requirements-index.md");
  const spec = exists(".sdd-master/specs/phase-01-spec.md");
  const plan = exists(".sdd-master/plans/phase-01-plan.md");
  const tasks = exists(".sdd-master/tasks/phase-01-tasks.md");

  return {
    discovery,
    requirements,
    spec,
    plan,
    tasks,
    nextCommand: tasks
      ? "/sdd-master-implement"
      : plan
        ? "/sdd-master-tasks"
        : spec
          ? "/sdd-master-plan"
          : requirements
            ? "/sdd-master-spec"
            : discovery
              ? "/sdd-master-requirements"
              : "/sdd-master-discovery"
  };
}
