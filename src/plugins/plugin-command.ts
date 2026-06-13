import type { CliOutput, CliRuntime } from "../cli/output.js";
import { getNotInitializedMessage, isWorkflowInitialized } from "../workflow/workflow-guards.js";
import { getPluginRecord, getPluginStatus, normalizePluginType } from "./plugin-registry.js";
import { formatPluginJson, formatPluginText } from "./plugin-report.js";
import type { PluginCommandResult, PluginOptions } from "./plugin-types.js";
import {
  auditPlugin,
  createPlugin,
  installPluginLocal,
  markPluginUsed,
  reportExtensions,
  updatePluginStatus
} from "./plugin-writer.js";

export async function runPluginsCommand(args: string[], output: CliOutput, runtime: CliRuntime): Promise<number> {
  if (args.includes("--help") || args.includes("-h")) {
    output.stdout(getPluginsHelp());
    return 0;
  }
  const parsed = parsePluginArgs(args);
  if (!parsed.ok) {
    output.stderr(`${parsed.error}\n`);
    return 1;
  }
  if (!isWorkflowInitialized(runtime.cwd)) {
    output.stderr(getNotInitializedMessage());
    return 1;
  }
  try {
    const result = executePlugins(runtime.cwd, parsed.options);
    output.stdout(parsed.options.json ? formatPluginJson(result) : formatPluginText(result));
    return 0;
  } catch (error) {
    output.stderr(`${error instanceof Error ? error.message : String(error)}\n`);
    return 1;
  }
}

function executePlugins(cwd: string, options: PluginOptions): PluginCommandResult {
  if (options.report) {
    const report = reportExtensions(cwd);
    return result("reported", undefined, report.createdFiles, report.updatedFiles, cwd, "Relatório consolidado de extensões gerado.");
  }

  if (!options.id) {
    if (!options.title) throw new Error("Informe --title para registrar um plugin ou --id para operar em um plugin existente.");
    const created = createPlugin(cwd, options);
    return result("created", created.id, created.createdFiles, created.updatedFiles, cwd, "Plugin candidato registrado localmente.");
  }

  const record = getPluginRecord(cwd, options.id);
  if (!record) throw new Error(`Plugin não encontrado: ${options.id}`);

  if (options.approve) {
    const updated = updatePluginStatus(cwd, record, "Aprovado", options.reason ?? "Aprovado para uso local como metadado.");
    return result("updated", record.id, updated.createdFiles, updated.updatedFiles, cwd, "Plugin aprovado por humano.");
  }
  if (options.reject) {
    const updated = updatePluginStatus(cwd, record, "Rejeitado", options.reason ?? "Rejeitado por revisão humana.");
    return result("updated", record.id, updated.createdFiles, updated.updatedFiles, cwd, "Plugin rejeitado.");
  }
  if (options.audit) {
    const audited = auditPlugin(cwd, record);
    return result("audited", record.id, audited.createdFiles, audited.updatedFiles, cwd, "Auditoria de supply chain criada.");
  }
  if (options.installLocal) {
    requireApproved(record.status, "instalação local");
    const installed = installPluginLocal(cwd, record);
    return result("updated", record.id, installed.createdFiles, installed.updatedFiles, cwd, "Plugin instalado localmente apenas como metadado.");
  }
  if (options.markUsed) {
    requireApproved(record.status, "uso");
    const used = markPluginUsed(cwd, record, options);
    return result("updated", record.id, used.createdFiles, used.updatedFiles, cwd, "Uso de plugin registrado.");
  }
  throw new Error("Informe uma ação: --approve, --reject, --audit, --install-local, --mark-used ou --report.");
}

function requireApproved(status: string, action: string): void {
  if (status === "Rejeitado" || status === "Bloqueado") throw new Error(`Plugin rejeitado/bloqueado não pode seguir para ${action}.`);
  if (status !== "Aprovado" && status !== "Instalado localmente" && status !== "Usado") {
    throw new Error(`Plugin precisa de aprovação humana antes de ${action}.`);
  }
}

function result(
  status: PluginCommandResult["status"],
  plugin: string | undefined,
  createdFiles: string[],
  updatedFiles: string[],
  cwd: string,
  message: string
): PluginCommandResult {
  return { status, plugin, createdFiles, updatedFiles, summary: getPluginStatus(cwd), message };
}

function parsePluginArgs(args: string[]): { ok: true; options: PluginOptions } | { ok: false; error: string } {
  const options: PluginOptions = {
    yes: false,
    json: false,
    type: "local-metadata",
    permissions: [],
    approve: false,
    reject: false,
    installLocal: false,
    markUsed: false,
    report: false,
    audit: false
  };

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--yes" || arg === "-y") { options.yes = true; continue; }
    if (arg === "--json") { options.json = true; continue; }
    if (arg === "--approve") { options.approve = true; continue; }
    if (arg === "--reject") { options.reject = true; continue; }
    if (arg === "--install-local") { options.installLocal = true; continue; }
    if (arg === "--mark-used") { options.markUsed = true; continue; }
    if (arg === "--report") { options.report = true; continue; }
    if (arg === "--audit") { options.audit = true; continue; }

    const name = ["title", "phase", "id", "plugin", "extension", "type", "category", "source", "version", "status", "reason", "permission", "target"].find(
      (option) => arg === `--${option}` || arg.startsWith(`--${option}=`)
    );
    if (!name) return { ok: false, error: `Opção desconhecida para plugins: ${arg}` };
    const value = arg === `--${name}` ? args[++index] : arg.slice(name.length + 3);
    if (!value) return { ok: false, error: `Valor ausente para --${name}` };
    if (name === "title") options.title = value;
    if (name === "phase") options.phase = value;
    if (name === "id" || name === "plugin" || name === "extension") options.id = value;
    if (name === "type") options.type = normalizePluginType(value);
    if (name === "category") options.category = value;
    if (name === "source") options.source = value;
    if (name === "version") options.version = value;
    if (name === "status") options.status = value;
    if (name === "reason") options.reason = value;
    if (name === "permission") options.permissions.push(...value.split(",").map((item) => item.trim()).filter(Boolean));
    if (name === "target") options.target = value;
  }
  return { ok: true, options };
}

export function getPluginsHelp(): string {
  return `sdd master plugins

Status:
  Corrigido e completo no BLOCO 27A.

Finalidade:
  Controlar plugins como metadados locais, com aprovação humana e auditoria de supply chain.

Uso:
  sdd master plugins --yes --title="Gerador C4" --category="architecture" --source="manual" --version="1.0" --permission="docs/**"
  sdd master plugins --yes --id="PLUGIN-001" --approve --reason="Aprovado para uso local."
  sdd master plugins --yes --id="PLUGIN-001" --audit
  sdd master plugins --yes --id="PLUGIN-001" --install-local
  sdd master plugins --yes --id="PLUGIN-001" --mark-used --phase="PHASE-01"
  sdd master plugins --json --report

Flags:
  --help, --json, --yes, -y, --title, --id, --type, --category, --source, --version,
  --status, --reason, --permission, --approve, --reject, --install-local, --mark-used,
  --report, --audit

Regras:
  Plugins não executam código e não baixam código remoto.
  Instalação global é proibida.
  Aprovação humana é obrigatória antes de instalação local ou uso.
  Registry e policy ficam em .sdd-master/extensions/.
  Todo uso gera relatório e toda origem remota é risco de supply chain.
`;
}
