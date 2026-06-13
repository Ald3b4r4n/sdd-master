import type { CliOutput, CliRuntime } from "../cli/output.js";
import { getNotInitializedMessage, isWorkflowInitialized } from "../workflow/workflow-guards.js";
import { getSkillRecord, getSkillStatus } from "./skill-registry.js";
import { reportExtensions, syncExtensionArtifacts } from "../plugins/plugin-writer.js";
import { formatSkillJson, formatSkillText } from "./skill-report.js";
import type { SkillCommandResult, SkillOptions } from "./skill-types.js";
import { createSkill, installSkillLocal, markSkillUsed, updateSkillStatus } from "./skill-writer.js";

export async function runSkillsCommand(args: string[], output: CliOutput, runtime: CliRuntime): Promise<number> {
  if (args.includes("--help") || args.includes("-h")) {
    output.stdout(getSkillsHelp());
    return 0;
  }

  const parsed = parseSkillArgs(args);
  if (!parsed.ok) {
    output.stderr(`${parsed.error}\n`);
    return 1;
  }

  if (!isWorkflowInitialized(runtime.cwd)) {
    output.stderr(getNotInitializedMessage());
    return 1;
  }

  try {
    const result = executeSkills(runtime.cwd, parsed.options);
    output.stdout(parsed.options.json ? formatSkillJson(result) : formatSkillText(result));
    return 0;
  } catch (error) {
    output.stderr(`${error instanceof Error ? error.message : String(error)}\n`);
    return 1;
  }
}

function executeSkills(cwd: string, options: SkillOptions): SkillCommandResult {
  if (options.report) {
    const report = reportExtensions(cwd);
    return {
      status: "reported",
      createdFiles: report.createdFiles,
      updatedFiles: report.updatedFiles,
      summary: getSkillStatus(cwd),
      message: "Relatório de skills gerado."
    };
  }

  if (!options.skill) {
    const created = createSkill(cwd, options);
    const registry = syncExtensionArtifacts(cwd);
    return {
      status: "created",
      skill: created.id,
      createdFiles: created.createdFiles,
      updatedFiles: [...created.updatedFiles, ...registry],
      summary: getSkillStatus(cwd),
      message: "Skill candidata registrada localmente."
    };
  }

  const record = getSkillRecord(cwd, options.skill);
  if (!record) {
    throw new Error(`Skill não encontrada: ${options.skill}`);
  }

  if (options.installLocal && record.status !== "Aprovada" && record.status !== "Instalada localmente" && record.status !== "Usada") {
    throw new Error("Skill precisa de aprovação humana antes de instalação local.");
  }

  if (options.approve) {
    const updated = updateSkillStatus(cwd, record, "Aprovada", options.reason ?? "Aprovada para uso local no projeto.");
    const registry = syncExtensionArtifacts(cwd);
    return {
      status: "updated",
      skill: record.id,
      createdFiles: updated.createdFiles,
      updatedFiles: [...updated.updatedFiles, ...registry],
      summary: getSkillStatus(cwd),
      message: "Skill aprovada para uso local."
    };
  }

  if (options.reject) {
    const updated = updateSkillStatus(cwd, record, "Rejeitada", options.reason ?? "Rejeitada por revisão humana.");
    const registry = syncExtensionArtifacts(cwd);
    return {
      status: "updated",
      skill: record.id,
      createdFiles: updated.createdFiles,
      updatedFiles: [...updated.updatedFiles, ...registry],
      summary: getSkillStatus(cwd),
      message: "Skill rejeitada."
    };
  }

  if (options.installLocal) {
    const installed = installSkillLocal(cwd, record);
    const registry = syncExtensionArtifacts(cwd);
    return {
      status: "updated",
      skill: record.id,
      createdFiles: installed.createdFiles,
      updatedFiles: [...installed.updatedFiles, ...registry],
      summary: getSkillStatus(cwd),
      message: "Skill instalada localmente como metadado."
    };
  }

  if (options.markUsed) {
    if (record.status === "Rejeitada") throw new Error("Skill rejeitada não pode ser usada.");
    if (record.status !== "Aprovada" && record.status !== "Instalada localmente" && record.status !== "Usada") {
      throw new Error("Skill precisa de aprovação humana antes de uso.");
    }
    const used = markSkillUsed(cwd, record, options);
    const registry = syncExtensionArtifacts(cwd);
    return {
      status: "updated",
      skill: record.id,
      createdFiles: used.createdFiles,
      updatedFiles: [...used.updatedFiles, ...registry],
      summary: getSkillStatus(cwd),
      message: "Uso de skill registrado."
    };
  }

  throw new Error("Informe uma ação: --approve, --install-local, --mark-used, --report ou registre uma skill com --title.");
}

function parseSkillArgs(args: string[]): { ok: true; options: SkillOptions } | { ok: false; error: string } {
  const options: SkillOptions = {
    yes: false,
    json: false,
    approve: false,
    reject: false,
    installLocal: false,
    markUsed: false,
    report: false,
    permissions: []
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

    if (arg === "--approve") {
      options.approve = true;
      continue;
    }

    if (arg === "--reject") {
      options.reject = true;
      continue;
    }

    if (arg === "--install-local") {
      options.installLocal = true;
      continue;
    }

    if (arg === "--mark-used") {
      options.markUsed = true;
      continue;
    }

    if (arg === "--report") {
      options.report = true;
      continue;
    }

    const name = ["title", "phase", "type", "status", "category", "source", "skill", "reason", "profile", "target", "permission"].find(
      (option) => arg === `--${option}` || arg.startsWith(`--${option}=`)
    );

    if (!name) {
      return { ok: false, error: `Opção desconhecida para skills: ${arg}` };
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

    if (name === "title") options.title = value;
    if (name === "phase") options.phase = value;
    if (name === "category" || name === "type") options.category = value;
    if (name === "source") options.source = value;
    if (name === "skill") options.skill = value;
    if (name === "reason") options.reason = value;
    if (name === "target") options.target = value;
    if (name === "permission") options.permissions.push(...value.split(",").map((item) => item.trim()).filter(Boolean));
  }

  return { ok: true, options };
}

export function getSkillsHelp(): string {
  return `sdd master skills

Status:
  Disponível no BLOCO 21.

Finalidade:
  Registrar, aprovar, instalar localmente como metadado em registry local e reportar uso de skills.

Uso:
  sdd master skills --yes --title="Antigravity UI polish" --category="uiux" --source="https://github.com/sickn33/antigravity-awesome-skills/"
  sdd master skills --yes --skill="SKILL-001" --approve --reason="Aprovada para uso local no projeto."
  sdd master skills --yes --skill="SKILL-001" --install-local
  sdd master skills --yes --skill="SKILL-001" --mark-used --phase="PHASE-01" --target="uiux-review"
  sdd master skills --json --report

Flags:
  --help
  --json
  --yes, -y
  --title
  --phase
  --type
  --status
  --category
  --source
  --skill
  --reason
  --profile
  --approve
  --reject
  --install-local
  --mark-used
  --report
  --target
  --permission

Regras:
  Instalação local cria apenas arquivos de metadados.
  Instalação global é proibida.
  Skills externas exigem aprovação humana antes de instalação local.
  Registry local fica em .agents/skills/registry.md.
  Registry consolidado e policy ficam em .sdd-master/extensions/.
  Skills rejeitadas não podem ser usadas.
  Origens remotas são riscos de supply chain.
  Toda skill usada deve aparecer em relatório.
  Skills alimentam os gates de UI/UX e implement readiness quando usadas.
`;
}
