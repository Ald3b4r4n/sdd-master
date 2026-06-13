import { readdirSync } from "node:fs";
import { join } from "node:path";
import type { CliOutput, CliRuntime } from "../cli/output.js";
import { safeWriteFile } from "../filesystem/safe-write.js";
import { getNotInitializedMessage, isWorkflowInitialized } from "../workflow/workflow-guards.js";
import type { ReleaseChannel, ReleaseOptions, ReleaseResult, ReleaseType } from "./delivery-types.js";
import { nextDeliveryId, getReleaseReadiness } from "./release-readiness.js";
import { formatReleaseJson, formatReleaseText } from "./release-report.js";

const channels = new Set(["prototype", "alpha", "beta", "rc", "stable"]);
const types = new Set(["local", "github", "npm", "full"]);

export async function runReleaseCommand(args: string[], output: CliOutput, runtime: CliRuntime): Promise<number> {
  if (args.includes("--help") || args.includes("-h")) {
    output.stdout(getReleaseHelp());
    return 0;
  }

  const parsed = parseReleaseArgs(args);
  if (!parsed.ok) {
    output.stderr(`${parsed.error}\n`);
    return 1;
  }

  if (!isWorkflowInitialized(runtime.cwd)) {
    output.stderr(getNotInitializedMessage());
    return 1;
  }

  const result = executeReleaseGuard(runtime.cwd, parsed.options);
  output.stdout(parsed.options.json ? formatReleaseJson(result) : formatReleaseText(result));
  return result.ready ? 0 : 1;
}

function executeReleaseGuard(cwd: string, options: ReleaseOptions): ReleaseResult {
  const readiness = getReleaseReadiness(cwd, options);
  const id = nextDeliveryId(cwd, ".sdd-master/releases", "RELEASE-");
  const checklistId = `RELEASE-CHECKLIST-${id.replace("RELEASE-", "")}`;
  const releasePath = `.sdd-master/releases/${id}.md`;
  const checklistPath = `.sdd-master/releases/checklists/${checklistId}.md`;
  const indexPath = ".sdd-master/releases/release-index.md";

  writeManaged(cwd, releasePath, releaseContent(id, checklistId, options, readiness));
  writeManaged(cwd, checklistPath, releaseChecklistContent(checklistId, id, options, readiness));
  writeManaged(cwd, indexPath, indexContent(cwd, ".sdd-master/releases", "RELEASE-", "# Índice de releases"));

  return {
    ...readiness,
    id,
    checklistId,
    phase: options.phase,
    version: options.version,
    channel: options.channel,
    type: options.type,
    mode: "Dry-run / Guard",
    createdFiles: [releasePath, checklistPath],
    updatedFiles: [indexPath],
    published: false,
    tagCreated: false,
    githubReleaseCreated: false
  };
}

function parseReleaseArgs(args: string[]): { ok: true; options: ReleaseOptions } | { ok: false; error: string } {
  const options: ReleaseOptions = {
    yes: false,
    json: false,
    dryRun: true,
    checklist: false,
    phase: "PHASE-01",
    title: "Plano de Release",
    target: "release",
    environment: "local",
    version: "0.3.0-alpha",
    channel: "alpha",
    type: "local"
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
    if (arg === "--checklist") {
      options.checklist = true;
      continue;
    }

    const name = ["phase", "title", "target", "environment", "version", "channel", "type"].find(
      (option) => arg === `--${option}` || arg.startsWith(`--${option}=`)
    );
    if (!name) return { ok: false, error: `Opção desconhecida para release: ${arg}` };

    const value = readArgValue(args, arg, name, () => {
      index += 1;
      return args[index];
    });
    if (!value) return { ok: false, error: `Valor ausente para --${name}` };

    if (name === "phase") options.phase = value;
    if (name === "title") options.title = value;
    if (name === "target") options.target = value;
    if (name === "environment") options.environment = value;
    if (name === "version") options.version = value;
    if (name === "channel") {
      if (!channels.has(value)) return { ok: false, error: `Canal inválido para release: ${value}` };
      options.channel = value as ReleaseChannel;
    }
    if (name === "type") {
      if (!types.has(value)) return { ok: false, error: `Tipo inválido para release: ${value}` };
      options.type = value as ReleaseType;
    }
  }

  return { ok: true, options };
}

function releaseContent(
  id: string,
  checklistId: string,
  options: ReleaseOptions,
  readiness: ReturnType<typeof getReleaseReadiness>
): string {
  return `# ${id} — Plano de Release

## Versão alvo
${options.version}

## Canal
${options.channel}

## Tipo
${options.type}

## Fase
${options.phase}

## Status
${readiness.ready ? "Pronto para autorização" : "Bloqueado"}

## Modo
Dry-run / Guard

## Escopo da release
- ${options.title}

## Itens incluídos
-

## Itens fora da release
- Publicação npm automática.
- Criação automática de tag.
- Publicação automática de GitHub Release.

## Gates verificados

| Gate | Status | Evidência |
|---|---|---|
${readiness.gates.map((gate) => `| ${gate.gate} | ${gate.status} | ${gate.evidence} |`).join("\n")}

## Bloqueios encontrados
${readiness.blockers.length > 0 ? readiness.blockers.map((blocker) => `- ${blocker}`).join("\n") : "- Nenhum"}

## Ações obrigatórias
${readiness.actions.map((action) => `- ${action}`).join("\n")}

## Checklist
${checklistId}

## Aprovação humana para release real
Pendente

## Observação

Este comando não cria tag, não publica npm e não publica GitHub Release.
Ele apenas registra readiness e plano de release.
`;
}

function releaseChecklistContent(
  checklistId: string,
  releaseId: string,
  options: ReleaseOptions,
  readiness: ReturnType<typeof getReleaseReadiness>
): string {
  return `# ${checklistId} — Checklist de Release

## Release
${releaseId}

## Versão alvo
${options.version}

## Checklist

${readiness.gates.map((gate) => `- [ ] ${gate.gate}: ${gate.status} — ${gate.evidence}`).join("\n")}

## Aprovação humana
- [ ] Aprovação humana explícita antes de qualquer release real.

## Segurança
- [ ] Não criar tag automaticamente.
- [ ] Não publicar npm automaticamente.
- [ ] Não publicar GitHub Release automaticamente.
`;
}

function writeManaged(cwd: string, relativePath: string, content: string): void {
  safeWriteFile(cwd, relativePath, content);
}

function indexContent(cwd: string, directory: string, prefix: string, heading: string): string {
  const fullPath = join(cwd, directory);
  const records = readdirSync(fullPath)
    .filter((file) => file.startsWith(prefix) && file.endsWith(".md"))
    .map((file) => `- ${file.replace(".md", "")}`);
  return `${heading}\n\n${records.join("\n")}\n`;
}

function readArgValue(args: string[], arg: string, name: string, next: () => string | undefined): string | undefined {
  if (arg === `--${name}`) return next();
  return arg.slice(name.length + 3);
}

function getReleaseHelp(): string {
  return `sdd master release

Finalidade:
  Criar plano/checklist de release, validar gates e registrar readiness.

Importante:
  Este comando não cria tag, não publica npm e não publica GitHub Release.
  O comportamento padrão é --dry-run e continua sendo guard mesmo sem --dry-run.

Uso:
  sdd master release --yes --phase="PHASE-01" --version="0.3.0-alpha" --channel="alpha" --type="local" --dry-run

Flags:
  --help
  --json
  --yes, -y
  --phase
  --title
  --target
  --environment
  --dry-run
  --version
  --channel=prototype|alpha|beta|rc|stable
  --type=local|github|npm|full
  --checklist

Gates:
  Workflow, approvals, clarifications, scope, quality, audit, docs, blockers, implement guard,
  test gates, UI/UX, security/git, advanced security, package check, npm dry-run e release notes.

Segurança avançada:
  Relatório/auditoria blocked ou saída não redigida bloqueiam a release.
  gitleaks/trufflehog ausentes não bloqueiam por padrão.

Risco:
  Release real exige autorização humana explícita fora deste comando.

Próximos passos:
  1. Resolver bloqueios.
  2. Rodar sdd master release novamente.
  3. Solicitar aprovação humana antes de publicar ou criar tag.
`;
}
