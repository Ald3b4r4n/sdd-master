import { existsSync, mkdirSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import type { CliOutput, CliRuntime } from "../cli/output.js";
import { isWorkflowInitialized } from "../workflow/workflow-guards.js";
import { detectExternalTool, notRequestedTool, runExternalTool } from "./external-tools.js";
import { runBuiltinSecurity } from "./security-detectors.js";
import { formatSecurityJson, formatSecurityText } from "./security-report.js";
import { getAdvancedSecurityState } from "./security-readiness.js";
import type {
  ExternalToolName,
  ExternalToolStatus,
  SecurityCommandResult,
  SecurityMode,
  SecurityOptions,
  SecurityTool
} from "./security-types.js";

export async function runSecurityCommand(args: string[], output: CliOutput, runtime: CliRuntime): Promise<number> {
  if (args.includes("--help") || args.includes("-h")) {
    output.stdout(getSecurityHelp());
    return 0;
  }
  const parsed = parseSecurityArgs(args);
  if (!parsed.ok) {
    output.stderr(`${parsed.error}\n`);
    return 1;
  }
  const needsInit = parsed.options.report || parsed.options.audit;
  if (needsInit && !isWorkflowInitialized(runtime.cwd)) {
    output.stderr("SDD Master não inicializado. Execute: sdd master init\n");
    return 1;
  }

  const result = executeSecurity(runtime.cwd, parsed.options, isWorkflowInitialized(runtime.cwd));
  output.stdout(parsed.options.json ? formatSecurityJson(result) : formatSecurityText(result));
  return result.status === "blocked" ? 1 : 0;
}

function executeSecurity(cwd: string, options: SecurityOptions, initialized: boolean): SecurityCommandResult {
  const builtin = runBuiltinSecurity(cwd);
  const selected = selectedExternalTools(options.tool, options.detectTools);
  const shouldInspectTools = options.detectTools || options.runExternal;
  const toolStatuses = new Map<ExternalToolName, ExternalToolStatus>();

  for (const name of ["gitleaks", "trufflehog"] as const) {
    if (!shouldInspectTools || !selected.includes(name)) {
      toolStatuses.set(name, notRequestedTool(name));
      continue;
    }
    toolStatuses.set(name, options.runExternal ? runExternalTool(name, cwd) : detectExternalTool(name));
  }

  const tools = {
    builtin: builtin.status,
    gitleaks: toolStatuses.get("gitleaks") ?? notRequestedTool("gitleaks"),
    trufflehog: toolStatuses.get("trufflehog") ?? notRequestedTool("trufflehog")
  };
  const missingRequested = selected.filter((name) => shouldInspectTools && !tools[name].available);
  const externalBlocked = selected.some((name) => tools[name].result === "blocked");
  const externalErrors = selected.filter((name) => tools[name].result === "error");
  const previousState = options.prePush ? getAdvancedSecurityState(cwd) : undefined;
  const blockers = [
    ...builtin.blockers,
    ...(previousState?.blockers ?? []),
    ...(externalBlocked ? ["Scanner externo detectou risco real."] : []),
    ...(options.strict && missingRequested.length > 0 && !options.allowMissingTools
      ? [`Ferramenta(s) obrigatória(s) ausente(s): ${missingRequested.join(", ")}.`]
      : []),
    ...(options.strict && externalErrors.length > 0 ? [`Falha ao executar scanner(es): ${externalErrors.join(", ")}.`] : [])
  ];
  const warnings = [
    ...(previousState?.warnings ?? []),
    ...(missingRequested.length > 0 ? [`Ferramenta(s) externa(s) ausente(s): ${missingRequested.join(", ")}. Instale manualmente se desejar.`] : []),
    ...(externalErrors.length > 0 ? [`Scanner(es) retornaram erro sem saída sensível persistida: ${externalErrors.join(", ")}.`] : [])
  ];
  const status = blockers.length > 0 ? "blocked" : warnings.length > 0 ? "warning" : "clean";
  const createdFiles: string[] = [];
  const updatedFiles: string[] = [];
  const result: SecurityCommandResult = {
    mode: options.mode,
    tool: options.tool,
    status,
    externalExecution: options.runExternal,
    redaction: true,
    findings: builtin.findings,
    blockers,
    warnings,
    tools,
    createdFiles,
    updatedFiles
  };

  if (initialized && (options.report || options.audit)) {
    ensureSecurityInfrastructure(cwd);
    const policy = writeSecurityPolicy(cwd);
    updatedFiles.push(policy);
    createdFiles.push(writeExternalToolsReport(cwd, result));
    if (options.report) createdFiles.push(writeSecurityReport(cwd, result));
    if (options.audit) createdFiles.push(writeSecurityAudit(cwd, result));
  }
  return result;
}

function parseSecurityArgs(args: string[]): { ok: true; options: SecurityOptions } | { ok: false; error: string } {
  const options: SecurityOptions = {
    yes: false,
    json: false,
    mode: "basic",
    tool: "builtin",
    detectTools: false,
    runExternal: false,
    redact: true,
    report: false,
    audit: false,
    prePush: false,
    strict: false,
    allowMissingTools: false
  };
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--yes" || arg === "-y") { options.yes = true; continue; }
    if (arg === "--json") { options.json = true; continue; }
    if (arg === "--detect-tools") { options.detectTools = true; continue; }
    if (arg === "--run-external") { options.runExternal = true; options.mode = "advanced"; continue; }
    if (arg === "--redact") { options.redact = true; continue; }
    if (arg === "--report") { options.report = true; continue; }
    if (arg === "--audit") { options.audit = true; continue; }
    if (arg === "--pre-push") { options.prePush = true; continue; }
    if (arg === "--strict") { options.strict = true; continue; }
    if (arg === "--allow-missing-tools") { options.allowMissingTools = true; continue; }

    const name = ["mode", "tool"].find((option) => arg === `--${option}` || arg.startsWith(`--${option}=`));
    if (!name) return { ok: false, error: `Opção desconhecida para security: ${arg}` };
    const value = arg === `--${name}` ? args[++index] : arg.slice(name.length + 3);
    if (!value) return { ok: false, error: `Valor ausente para --${name}` };
    if (name === "mode") {
      if (value !== "basic" && value !== "advanced") return { ok: false, error: `Modo inválido: ${value}` };
      options.mode = value as SecurityMode;
    }
    if (name === "tool") {
      if (!["builtin", "gitleaks", "trufflehog", "all"].includes(value)) return { ok: false, error: `Ferramenta inválida: ${value}` };
      options.tool = value as SecurityTool;
    }
  }
  if (options.runExternal && options.tool === "builtin") {
    return { ok: false, error: "--run-external exige --tool=gitleaks, --tool=trufflehog ou --tool=all" };
  }
  return { ok: true, options };
}

function ensureSecurityInfrastructure(cwd: string): void {
  for (const path of ["reports", "audits", "external-tools"]) {
    mkdirSync(join(cwd, ".sdd-master", "security", path), { recursive: true });
  }
}

function writeSecurityPolicy(cwd: string): string {
  const relative = ".sdd-master/security/security-policy.md";
  write(
    cwd,
    relative,
    `# Política de Segurança — SDD Master

## Regras obrigatórias

- Nenhum segredo deve ser exposto em relatório.
- Nenhum scanner externo deve rodar sem opt-in explícito.
- Nenhuma ferramenta externa deve ser instalada automaticamente.
- Nenhum código deve ser enviado para serviço externo.
- \`.env\` real é proibido.
- \`.env.example\` é permitido apenas sem valores reais.
- Tokens, chaves privadas, certificados privados e credenciais são proibidos.
- Relatórios devem redigir achados sensíveis.
- Falha crítica de segurança bloqueia release/deploy.
- Ausência de ferramenta externa não bloqueia por padrão.

## Ferramentas externas

- gitleaks: opcional.
- trufflehog: opcional.

## Redação de achados

Qualquer valor sensível deve aparecer como:

\`[REDACTED]\`
`
  );
  return relative;
}

function writeExternalToolsReport(cwd: string, result: SecurityCommandResult): string {
  const id = nextSecurityId(cwd, "external-tools", "EXTERNAL-TOOLS-");
  const relative = `.sdd-master/security/external-tools/${id}.md`;
  write(
    cwd,
    relative,
    `# ${id} — Ferramentas Externas de Segurança

${toolSection("gitleaks", result.tools.gitleaks)}

${toolSection("trufflehog", result.tools.trufflehog)}

## Política
Ferramentas externas são opt-in e nunca são instaladas automaticamente.
`
  );
  return relative;
}

function writeSecurityReport(cwd: string, result: SecurityCommandResult): string {
  const id = nextSecurityId(cwd, "reports", "SECURITY-REPORT-");
  const relative = `.sdd-master/security/reports/${id}.md`;
  const findings = result.findings.length > 0
    ? result.findings.map((finding) => `- Tipo: ${finding.type}\n  Severidade: ${finding.severity}\n  Arquivo: ${finding.file}\n  Valor: ${finding.value}`).join("\n")
    : "- Nenhum";
  write(
    cwd,
    relative,
    `# ${id} — Relatório de Segurança

## Modo
${result.mode}

## Ferramentas
- builtin: ${result.tools.builtin}
- gitleaks: ${result.tools.gitleaks.result}
- trufflehog: ${result.tools.trufflehog.result}

## Execução externa
${result.externalExecution ? "Sim" : "Não"}

## Resultado
${result.status}

## Achados
${findings}

## Bloqueios
${bullets(result.blockers)}

## Recomendações
${bullets(result.warnings)}

## Observação
Relatório redigido. Valores sensíveis não são armazenados.
`
  );
  return relative;
}

function writeSecurityAudit(cwd: string, result: SecurityCommandResult): string {
  const id = nextSecurityId(cwd, "audits", "SECURITY-AUDIT-");
  const relative = `.sdd-master/security/audits/${id}.md`;
  const decision = result.status === "blocked" ? "Bloqueado" : result.status === "warning" ? "Aprovado com ressalvas" : "Aprovado";
  write(
    cwd,
    relative,
    `# ${id} — Auditoria de Segurança

## Escopo
- Scanner builtin e integrações externas opt-in.

## Ferramentas usadas
- builtin
${result.externalExecution ? "- Scanners externos solicitados explicitamente." : "- Nenhum scanner externo executado."}

## Achados críticos
${result.findings.filter((finding) => finding.severity === "CRITICAL").length}

## Achados altos
${result.findings.filter((finding) => finding.severity === "HIGH").length}

## Achados médios
${result.findings.filter((finding) => finding.severity === "MEDIUM").length}

## Achados baixos
${result.findings.filter((finding) => finding.severity === "LOW").length}

## Decisão
${decision}

## Ações obrigatórias
${bullets(result.blockers)}

## Aprovação humana
Pendente
`
  );
  return relative;
}

function selectedExternalTools(tool: SecurityTool, detectTools = false): ExternalToolName[] {
  if (detectTools && tool === "builtin") return ["gitleaks", "trufflehog"];
  if (tool === "all") return ["gitleaks", "trufflehog"];
  if (tool === "gitleaks" || tool === "trufflehog") return [tool];
  return [];
}

function toolSection(title: string, tool: ExternalToolStatus): string {
  return `## ${title}
- Disponível: ${tool.available ? "Sim" : "Não"}
- Versão: ${tool.version}
- Executado: ${tool.executed ? "Sim" : "Não"}
- Resultado: ${tool.result}`;
}

function nextSecurityId(cwd: string, directoryName: string, prefix: string): string {
  const directory = join(cwd, ".sdd-master", "security", directoryName);
  const next = existsSync(directory)
    ? readdirSync(directory)
        .filter((file) => file.startsWith(prefix) && file.endsWith(".md"))
        .map((file) => Number(file.replace(prefix, "").replace(".md", "")))
        .filter(Number.isInteger)
        .reduce((max, value) => Math.max(max, value), 0) + 1
    : 1;
  return `${prefix}${String(next).padStart(3, "0")}`;
}

function write(cwd: string, relativePath: string, content: string): void {
  const path = join(cwd, relativePath);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content, "utf8");
}

function bullets(items: string[]): string {
  return items.length > 0 ? items.map((item) => `- ${item}`).join("\n") : "-";
}

export function getSecurityHelp(): string {
  return `sdd master security

Finalidade:
  Executar segurança builtin e integrar scanners externos opcionais de forma local e redigida.

Uso:
  sdd master security
  sdd master security --detect-tools --json
  sdd master security --run-external --tool="gitleaks" --report
  sdd master security --run-external --tool="trufflehog" --report

Flags:
  --help, --json, --yes, -y
  --mode=basic|advanced
  --tool=builtin|gitleaks|trufflehog|all
  --detect-tools, --run-external, --redact, --report, --audit, --pre-push
  --strict, --allow-missing-tools

Segurança:
  Scanners externos só rodam com --run-external.
  Ferramentas ausentes não bloqueiam por padrão.
  Nenhuma ferramenta é instalada ou baixada.
  Nenhum código é enviado para serviço externo.
  Saídas e relatórios nunca armazenam valores sensíveis.
`;
}
