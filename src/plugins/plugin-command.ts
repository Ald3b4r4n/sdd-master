import type { CliOutput, CliRuntime } from "../cli/output.js";
import { getNotInitializedMessage, isWorkflowInitialized } from "../workflow/workflow-guards.js";
import { getPluginRecord, getPluginStatus } from "./plugin-registry.js";
import { formatPluginJson, formatPluginText } from "./plugin-report.js";
import type { PluginCommandResult, PluginOptions } from "./plugin-types.js";
import { createPlugin, installPluginLocal, markPluginUsed, updatePluginStatus } from "./plugin-writer.js";

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
    return {
      status: "reported",
      createdFiles: [],
      updatedFiles: [],
      summary: getPluginStatus(cwd),
      message: "Relatório de plugins gerado."
    };
  }

  if (!options.plugin) {
    const created = createPlugin(cwd, options);
    return {
      status: "created",
      plugin: created.id,
      createdFiles: created.createdFiles,
      updatedFiles: created.updatedFiles,
      summary: getPluginStatus(cwd),
      message: "Plugin candidato registrado localmente."
    };
  }

  const record = getPluginRecord(cwd, options.plugin);
  if (!record) {
    throw new Error(`Plugin não encontrado: ${options.plugin}`);
  }

  if (options.installLocal && record.status !== "Aprovada" && record.status !== "Instalada localmente" && record.status !== "Usada") {
    throw new Error("Plugin precisa de aprovação humana antes de instalação local.");
  }

  if (options.approve) {
    const updated = updatePluginStatus(cwd, record, "Aprovada", options.reason ?? "Aprovada para uso local no projeto.");
    return {
      status: "updated",
      plugin: record.id,
      createdFiles: [],
      updatedFiles: updated.updatedFiles,
      summary: getPluginStatus(cwd),
      message: "Plugin aprovado para uso local."
    };
  }

  if (options.installLocal) {
    const installed = installPluginLocal(cwd, record);
    return {
      status: "updated",
      plugin: record.id,
      createdFiles: installed.createdFiles,
      updatedFiles: installed.updatedFiles,
      summary: getPluginStatus(cwd),
      message: "Plugin instalado localmente como metadado."
    };
  }

  if (options.markUsed) {
    const used = markPluginUsed(cwd, record, options);
    return {
      status: "updated",
      plugin: record.id,
      createdFiles: used.createdFiles,
      updatedFiles: used.updatedFiles,
      summary: getPluginStatus(cwd),
      message: "Uso de plugin registrado."
    };
  }

  throw new Error("Informe uma ação: --approve, --install-local, --mark-used, --report ou registre um plugin com --title.");
}

function parsePluginArgs(args: string[]): { ok: true; options: PluginOptions } | { ok: false; error: string } {
  const options: PluginOptions = {
    yes: false,
    json: false,
    approve: false,
    installLocal: false,
    markUsed: false,
    report: false
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

    const name = ["title", "phase", "type", "status", "category", "source", "plugin", "extension", "reason", "target"].find(
      (option) => arg === `--${option}` || arg.startsWith(`--${option}=`)
    );

    if (!name) {
      return { ok: false, error: `Opção desconhecida para plugins: ${arg}` };
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
    if (name === "plugin" || name === "extension") options.plugin = value;
    if (name === "reason") options.reason = value;
    if (name === "target") options.target = value;
  }

  return { ok: true, options };
}

export function getPluginsHelp(): string {
  return `sdd master plugins

Status:
  Disponível no BLOCO 27.

Finalidade:
  Registrar plugins/extensões locais, aprovar uso humano, instalar metadados localmente e reportar uso seguro.

Uso:
  sdd master plugins --yes --title="Plugin de integração" --category="integration" --source="Registry local controlado"
  sdd master plugins --yes --plugin="PLUGIN-001" --approve --reason="Aprovado para uso local."
  sdd master plugins --yes --plugin="PLUGIN-001" --install-local
  sdd master plugins --yes --plugin="PLUGIN-001" --mark-used --phase="PHASE-01" --target="plugin-review"
  sdd master plugins --json --report

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
  --plugin
  --extension
  --reason
  --approve
  --install-local
  --mark-used
  --report
  --target

Regras:
  Instalação local cria apenas metadados.
  Instalação global é proibida.
  Plugins externos exigem aprovação humana.
  Nenhum código remoto é baixado ou executado.
  Todo plugin usado deve aparecer em relatório.
  Registry local fica sob .sdd-master/plugins/ e .agents/plugins/.
`;
}
