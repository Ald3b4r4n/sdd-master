import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import type { CliOutput, CliRuntime } from "../cli/output.js";
import { getNotInitializedMessage, isWorkflowInitialized } from "../workflow/workflow-guards.js";
import { createUpdateBackup } from "./update-backup.js";
import { createUpdatePlan } from "./update-plan.js";
import { formatUpdateJson, formatUpdateText, writeUpdateReport } from "./update-report.js";
import type { UpdateOptions, UpdatePlan, UpdateResult } from "./update-types.js";

export async function runUpdateCommand(args: string[], output: CliOutput, runtime: CliRuntime): Promise<number> {
  if (args.includes("--help") || args.includes("-h")) {
    output.stdout(getUpdateHelp());
    return 0;
  }

  const parsed = parseUpdateArgs(args);
  if (!parsed.ok) {
    output.stderr(`${parsed.error}\n`);
    return 1;
  }

  if (!isWorkflowInitialized(runtime.cwd)) {
    output.stderr(getNotInitializedMessage());
    return 1;
  }

  const result = executeUpdate(runtime.cwd, parsed.options);
  output.stdout(parsed.options.json ? formatUpdateJson(result) : formatUpdateText(result));
  return result.status === "blocked" ? 1 : 0;
}

function executeUpdate(cwd: string, options: UpdateOptions): UpdateResult {
  const timestamp = new Date().toISOString();
  const timestampSlug = timestamp.replace(/[-:]/g, "").replace(/\..+$/, "").replace("T", "-");
  const plan = createUpdatePlan(cwd, options, timestamp);

  if (!options.apply || options.dryRun) {
    return planToResult(plan, "dry-run", "dry-run", undefined, undefined);
  }

  const backupPath = options.backup ? createUpdateBackup(cwd, plan, timestampSlug, timestamp) : undefined;
  const created: string[] = [];
  const updated: string[] = [];
  const preserved: string[] = [];

  for (const item of plan.templateItems) {
    if (item.action === "create" && item.content) {
      write(cwd, item.path, item.content);
      created.push(item.path);
      continue;
    }

    if (item.action === "update" && item.content) {
      write(cwd, item.path, item.content);
      updated.push(item.path);
      continue;
    }

    preserved.push(item.path);
  }

  let projectStateUpdated = false;
  if (plan.projectStateItem?.action === "update" && plan.projectStateItem.content) {
    write(cwd, plan.projectStateItem.path, plan.projectStateItem.content);
    updated.push(plan.projectStateItem.path);
    projectStateUpdated = true;
  }

  if (plan.projectStateItem?.action === "preserve") {
    preserved.push(plan.projectStateItem.path);
  }

  const status = plan.conflicts.length > 0 ? "partial" : "applied";
  const result: UpdateResult = {
    status,
    mode: "applied",
    installedVersion: plan.installedVersion,
    targetVersion: plan.targetVersion,
    installedTemplateVersion: plan.installedTemplateVersion,
    targetTemplateVersion: plan.targetTemplateVersion,
    created,
    updated,
    preserved,
    conflicts: plan.conflicts,
    backupPath,
    backupCreated: Boolean(backupPath),
    projectStateUpdated
  };
  result.reportPath = writeUpdateReport(cwd, result, timestampSlug);
  return result;
}

function planToResult(
  plan: UpdatePlan,
  status: UpdateResult["status"],
  mode: UpdateResult["mode"],
  reportPath: string | undefined,
  backupPath: string | undefined
): UpdateResult {
  return {
    status,
    mode,
    installedVersion: plan.installedVersion,
    targetVersion: plan.targetVersion,
    installedTemplateVersion: plan.installedTemplateVersion,
    targetTemplateVersion: plan.targetTemplateVersion,
    created: plan.templateItems.filter((item) => item.action === "create").map((item) => item.path),
    updated: [
      ...plan.templateItems.filter((item) => item.action === "update").map((item) => item.path),
      ...(plan.projectStateItem?.action === "update" ? [plan.projectStateItem.path] : [])
    ],
    preserved: [
      ...plan.templateItems.filter((item) => item.action === "preserve" || item.action === "conflict").map((item) => item.path),
      ...(plan.projectStateItem?.action === "preserve" ? [plan.projectStateItem.path] : [])
    ],
    conflicts: plan.conflicts,
    reportPath,
    backupPath,
    backupCreated: Boolean(backupPath),
    projectStateUpdated: plan.projectStateItem?.action === "update"
  };
}

function parseUpdateArgs(args: string[]): { ok: true; options: UpdateOptions } | { ok: false; error: string } {
  const options: UpdateOptions = {
    yes: false,
    json: false,
    dryRun: false,
    apply: false,
    force: false,
    templates: false,
    agents: false,
    docs: false,
    projectState: false,
    backup: true
  };

  for (const arg of args) {
    if (arg === "--yes" || arg === "-y") options.yes = true;
    else if (arg === "--json") options.json = true;
    else if (arg === "--dry-run") options.dryRun = true;
    else if (arg === "--apply") options.apply = true;
    else if (arg === "--force") options.force = true;
    else if (arg === "--templates") options.templates = true;
    else if (arg === "--agents") options.agents = true;
    else if (arg === "--docs") options.docs = true;
    else if (arg === "--project-state") options.projectState = true;
    else if (arg === "--backup") options.backup = true;
    else return { ok: false, error: `Opção desconhecida para update: ${arg}` };
  }

  if (!options.templates && !options.agents && !options.docs && !options.projectState) {
    options.templates = true;
    options.projectState = true;
  }

  if (!options.apply) {
    options.dryRun = true;
  }

  return { ok: true, options };
}

function write(cwd: string, relativePath: string, content: string): void {
  const path = join(cwd, relativePath);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content, "utf8");
}

export function getUpdateHelp(): string {
  return `sdd master update

Status:
  Disponível no BLOCO 22.

Finalidade:
  Atualizar uma instalação local do SDD Master sem apagar histórico, decisões humanas ou documentos preenchidos.

Uso:
  sdd master update --dry-run
  sdd master update --dry-run --json
  sdd master update --apply --yes

Flags:
  --help
  --json
  --yes, -y
  --dry-run
  --apply
  --force
  --templates
  --agents
  --docs
  --project-state
  --backup

Dry-run:
  Mostra o plano e não altera arquivos.

Apply:
  Aplica apenas mudanças seguras. Cria backup local antes de alterar arquivos existentes.

Backup:
  Criado em .sdd-master/backups/update-YYYYMMDD-HHMMSS/ quando --apply altera arquivos existentes.

Conflitos:
  Arquivos sem marcador gerenciado ou com modificação local são preservados e reportados.

Regras:
  Update nunca apaga histórico.
  Update nunca sobrescreve decisão humana.
  Update nunca sobrescreve documento preenchido sem segurança.
`;
}
