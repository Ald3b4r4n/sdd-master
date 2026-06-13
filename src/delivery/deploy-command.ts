import { mkdirSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import type { CliOutput, CliRuntime } from "../cli/output.js";
import { getNotInitializedMessage, isWorkflowInitialized } from "../workflow/workflow-guards.js";
import type { DeployEnvironment, DeployOptions, DeployProvider, DeployResult, DeployStrategy } from "./delivery-types.js";
import { getDeployReadiness } from "./deploy-readiness.js";
import { formatDeployJson, formatDeployText } from "./deploy-report.js";
import { nextDeliveryId } from "./release-readiness.js";

const environments = new Set(["local", "dev", "staging", "production"]);
const providers = new Set(["manual", "github-actions", "vercel", "netlify", "locaweb", "other"]);
const strategies = new Set(["manual", "static", "server", "container", "serverless", "other"]);

export async function runDeployCommand(args: string[], output: CliOutput, runtime: CliRuntime): Promise<number> {
  if (args.includes("--help") || args.includes("-h")) {
    output.stdout(getDeployHelp());
    return 0;
  }

  const parsed = parseDeployArgs(args);
  if (!parsed.ok) {
    output.stderr(`${parsed.error}\n`);
    return 1;
  }

  if (!isWorkflowInitialized(runtime.cwd)) {
    output.stderr(getNotInitializedMessage());
    return 1;
  }

  const result = executeDeployGuard(runtime.cwd, parsed.options);
  output.stdout(parsed.options.json ? formatDeployJson(result) : formatDeployText(result));
  return result.ready ? 0 : 1;
}

function executeDeployGuard(cwd: string, options: DeployOptions): DeployResult {
  const readiness = getDeployReadiness(cwd, options);
  const id = nextDeliveryId(cwd, ".sdd-master/deliveries", "DEPLOY-");
  const checklistId = `DEPLOY-CHECKLIST-${id.replace("DEPLOY-", "")}`;
  const deployPath = `.sdd-master/deliveries/${id}.md`;
  const checklistPath = `.sdd-master/deliveries/checklists/${checklistId}.md`;
  const indexPath = ".sdd-master/deliveries/delivery-index.md";

  writeManaged(cwd, deployPath, deployContent(id, checklistId, options, readiness));
  writeManaged(cwd, checklistPath, deployChecklistContent(checklistId, id, options, readiness));
  writeManaged(cwd, indexPath, indexContent(cwd, ".sdd-master/deliveries", "DEPLOY-", "# Índice de deliveries"));

  return {
    ...readiness,
    id,
    checklistId,
    phase: options.phase,
    environment: options.environment,
    provider: options.provider,
    strategy: options.strategy,
    mode: "Dry-run / Guard",
    createdFiles: [deployPath, checklistPath],
    updatedFiles: [indexPath],
    deployed: false,
    serverAccessed: false,
    remoteScriptsExecuted: false
  };
}

function parseDeployArgs(args: string[]): { ok: true; options: DeployOptions } | { ok: false; error: string } {
  const options: DeployOptions = {
    yes: false,
    json: false,
    dryRun: true,
    checklist: false,
    phase: "PHASE-01",
    title: "Plano de Deploy",
    target: "deploy",
    environment: "local",
    provider: "manual",
    strategy: "manual"
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

    const name = ["phase", "title", "target", "environment", "provider", "strategy"].find(
      (option) => arg === `--${option}` || arg.startsWith(`--${option}=`)
    );
    if (!name) return { ok: false, error: `Opção desconhecida para deploy: ${arg}` };

    const value = readArgValue(args, arg, name, () => {
      index += 1;
      return args[index];
    });
    if (!value) return { ok: false, error: `Valor ausente para --${name}` };

    if (name === "phase") options.phase = value;
    if (name === "title") options.title = value;
    if (name === "target") options.target = value;
    if (name === "environment") {
      if (!environments.has(value)) return { ok: false, error: `Ambiente inválido para deploy: ${value}` };
      options.environment = value as DeployEnvironment;
    }
    if (name === "provider") {
      if (!providers.has(value)) return { ok: false, error: `Provider inválido para deploy: ${value}` };
      options.provider = value as DeployProvider;
    }
    if (name === "strategy") {
      if (!strategies.has(value)) return { ok: false, error: `Estratégia inválida para deploy: ${value}` };
      options.strategy = value as DeployStrategy;
    }
  }

  return { ok: true, options };
}

function deployContent(
  id: string,
  checklistId: string,
  options: DeployOptions,
  readiness: ReturnType<typeof getDeployReadiness>
): string {
  return `# ${id} — Plano de Deploy

## Ambiente
${options.environment}

## Provider
${options.provider}

## Estratégia
${options.strategy}

## Fase
${options.phase}

## Status
${readiness.ready ? "Pronto para autorização" : "Bloqueado"}

## Modo
Dry-run / Guard

## Escopo do deploy
- ${options.title}

## O que será entregue
-

## O que não será entregue
- Deploy real.
- Acesso a servidor.
- Execução de scripts remotos.

## Gates verificados

| Gate | Status | Evidência |
|---|---|---|
${readiness.gates.map((gate) => `| ${gate.gate} | ${gate.status} | ${gate.evidence} |`).join("\n")}

## Variáveis de ambiente necessárias
${readiness.envVars.map((name) => `- ${name}`).join("\n")}

## Secrets necessários
${readiness.secrets.map((name) => `- ${name}`).join("\n")}

## Rollback
- Plano de rollback deve ser aprovado antes de deploy real.

## Monitoramento/observabilidade
- Monitoramento deve ser definido antes de deploy real.

## Bloqueios encontrados
${readiness.blockers.length > 0 ? readiness.blockers.map((blocker) => `- ${blocker}`).join("\n") : "- Nenhum"}

## Ações obrigatórias
${readiness.actions.map((action) => `- ${action}`).join("\n")}

## Checklist
${checklistId}

## Aprovação humana para deploy real
Pendente

## Observação

Este comando não executa deploy real.
Ele não acessa servidor e não envia arquivos.
`;
}

function deployChecklistContent(
  checklistId: string,
  deployId: string,
  options: DeployOptions,
  readiness: ReturnType<typeof getDeployReadiness>
): string {
  return `# ${checklistId} — Checklist de Deploy

## Deploy
${deployId}

## Ambiente
${options.environment}

## Checklist

${readiness.gates.map((gate) => `- [ ] ${gate.gate}: ${gate.status} — ${gate.evidence}`).join("\n")}

## Segurança
- [ ] Variáveis de ambiente listadas apenas por nome.
- [ ] Secrets listados apenas por nome.
- [ ] Rollback revisado.
- [ ] Aprovação humana explícita antes de deploy real.
`;
}

function writeManaged(cwd: string, relativePath: string, content: string): void {
  const fullPath = join(cwd, relativePath);
  mkdirSync(dirname(fullPath), { recursive: true });
  writeFileSync(fullPath, content, "utf8");
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

function getDeployHelp(): string {
  return `sdd master deploy

Finalidade:
  Criar plano/checklist de deploy, validar riscos e registrar readiness.

Importante:
  Este comando não executa deploy real, não acessa servidor e não roda scripts remotos.
  O comportamento padrão é --dry-run e continua sendo guard mesmo sem --dry-run.

Uso:
  sdd master deploy --yes --phase="PHASE-01" --environment="staging" --provider="vercel" --strategy="serverless" --dry-run

Flags:
  --help
  --json
  --yes, -y
  --phase
  --title
  --target
  --environment=local|dev|staging|production
  --dry-run
  --provider=manual|github-actions|vercel|netlify|locaweb|other
  --strategy=manual|static|server|container|serverless|other
  --checklist

Gates:
  Release guard, security/git, advanced security, env vars, secrets, database, rollback,
  observability, backup, documentation e aprovação humana.

Segurança avançada:
  Relatório/auditoria blocked ou saída não redigida bloqueiam o deploy.
  Ferramentas externas ausentes não bloqueiam por padrão.

Risco:
  Deploy real exige autorização humana explícita fora deste comando.
`;
}
