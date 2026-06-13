import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import type { CliOutput, CliRuntime } from "../cli/output.js";
import { normalizeSafePatterns } from "../filesystem/safe-glob.js";
import { formatUnsafePathError, UnsafePathError } from "../filesystem/path-safety.js";
import { safeWriteFile } from "../filesystem/safe-write.js";
import { getNotInitializedMessage, isWorkflowInitialized } from "../workflow/workflow-guards.js";
import { formatUsedExtensions } from "../extensions/extension-state.js";
import { getImplementationReadiness } from "./implement-readiness.js";
import { formatSecurityHandoff } from "../security/security-readiness.js";
import { formatImplementJson, formatImplementText } from "./implement-report.js";
import type { ImplementOptions, ImplementResult } from "./implement-types.js";

const validAgents = new Set(["codex", "claude", "cursor", "gemini", "copilot", "windsurf", "cline", "roo", "aider", "continue", "generic"]);
const defaultAllowedFiles = ["src/**", "tests/**", "docs/**"];
const forcedForbiddenFiles = [".env", ".env.*", "secrets/**", "private/**", "credentials/**", ".sdd-master/**", "node_modules/**", "dist/**"];

export async function runImplementCommand(args: string[], output: CliOutput, runtime: CliRuntime): Promise<number> {
  if (args.includes("--help") || args.includes("-h")) {
    output.stdout(getImplementHelp());
    return 0;
  }

  let parsed: ReturnType<typeof parseImplementArgs>;
  try {
    parsed = parseImplementArgs(args);
  } catch (error) {
    if (error instanceof UnsafePathError) {
      output.stderr(formatUnsafePathError(error, args.includes("--json") || args.includes("--output=json")));
      return 1;
    }
    throw error;
  }
  if (!parsed.ok) {
    output.stderr(`${parsed.error}\n`);
    return 1;
  }

  if (!isWorkflowInitialized(runtime.cwd)) {
    output.stderr(getNotInitializedMessage());
    return 1;
  }

  let result: ImplementResult;
  try {
    result = executeImplementGuard(runtime.cwd, parsed.options);
  } catch (error) {
    if (error instanceof UnsafePathError) {
      output.stderr(formatUnsafePathError(error, parsed.options.json));
      return 1;
    }
    throw error;
  }
  output.stdout(parsed.options.json ? formatImplementJson(result) : formatImplementText(result));
  return result.ready ? 0 : 1;
}

function executeImplementGuard(cwd: string, options: ImplementOptions): ImplementResult {
  const readiness = getImplementationReadiness(cwd, options.task);
  const id = nextImplementId(cwd);
  const path = `.sdd-master/implementation/${id}.md`;
  safeWriteFile(cwd, path, implementationContent(id, options, readiness));
  safeWriteFile(cwd, ".sdd-master/implementation/implementation-index.md", implementationIndex(cwd, id));

  const status = readiness.ready ? "ready" : "blocked";
  const assisted = options.prepare || options.handoff || options.manifest || options.testContract;
  const assistedFiles = assisted ? writeAssistedPackage(cwd, options, readiness) : [];
  const createdFiles = [path, ...assistedFiles];

  return {
    status,
    mode: assisted ? "assisted-guard" : "guard",
    phase: options.phase,
    task: options.task,
    ready: readiness.ready,
    blockers: readiness.blockers,
    gates: readiness.gates,
    createdFiles,
    updatedFiles: [".sdd-master/implementation/implementation-index.md"],
    allowedFiles: options.allowedFiles,
    forbiddenFiles: options.forbiddenFiles,
    codeChanged: false,
    nextActions: readiness.ready
      ? ["Solicitar aprovação humana para implementação real."]
      : readiness.blockers.map(toAction)
  };
}

function parseImplementArgs(args: string[]): { ok: true; options: ImplementOptions } | { ok: false; error: string } {
  const options: ImplementOptions = {
    yes: false,
    json: false,
    phase: "PHASE-01",
    task: "TASK-001",
    dryRun: true,
    prepare: false,
    handoff: false,
    manifest: false,
    testContract: false,
    agent: "codex",
    allowedFiles: defaultAllowedFiles,
    forbiddenFiles: forcedForbiddenFiles
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

    if (arg === "--prepare") {
      options.prepare = true;
      continue;
    }

    if (arg === "--handoff") {
      options.handoff = true;
      continue;
    }

    if (arg === "--manifest") {
      options.manifest = true;
      continue;
    }

    if (arg === "--test-contract") {
      options.testContract = true;
      continue;
    }

    const name = ["phase", "task", "target", "agent", "allowed-files", "forbidden-files", "output"].find(
      (option) => arg === `--${option}` || arg.startsWith(`--${option}=`)
    );

    if (!name) {
      return { ok: false, error: `Opção desconhecida para implement: ${arg}` };
    }

    let value: string | undefined;
    if (arg === `--${name}`) {
      index += 1;
      value = args[index];
    } else {
      value = arg.slice(name.length + 3);
    }

    if (!value && name !== "forbidden-files") {
      return { ok: false, error: `Valor ausente para --${name}` };
    }

    if (name === "phase") options.phase = value;
    if (name === "task") options.task = value;
    if (name === "target") {
      options.target = value;
      options.task = value;
    }
    if (name === "agent") {
      if (!validAgents.has(value)) {
        return { ok: false, error: `Agente inválido para implement: ${value}` };
      }
      options.agent = value;
    }
    if (name === "allowed-files") {
      options.allowedFiles = parsePatternList(value);
    }
    if (name === "forbidden-files") {
      options.forbiddenFiles = normalizeForbidden(parsePatternList(value ?? ""));
    }
    if (name === "output") {
      if (value !== "text" && value !== "json") {
        return { ok: false, error: `Formato inválido para --output: ${value}` };
      }
      options.json = value === "json";
    }
  }

  options.forbiddenFiles = normalizeForbidden(options.forbiddenFiles);
  options.allowedFiles = options.allowedFiles.filter((pattern) => !options.forbiddenFiles.includes(pattern));

  return { ok: true, options };
}

function implementationContent(
  id: string,
  options: ImplementOptions,
  readiness: ReturnType<typeof getImplementationReadiness>
): string {
  const status = readiness.ready ? "Pronto para autorização" : "Bloqueado";

  return `# ${id} — Preparação de Implementação

## Fase
${options.phase}

## Tarefa alvo
${options.task}

## Status
${status}

## Modo
Dry-run / Guard

## Escopo autorizado
Pendente de aprovação humana final.

## O que pode ser implementado
-

## O que não pode ser implementado
- Qualquer item fora do escopo aprovado.
- Qualquer mudança sem aprovação humana.

## Testes/checks obrigatórios antes de implementar
- Verificar test gates em ${options.task}.

## Documentação impactada
-

## Gates verificados

| Gate | Status | Evidência |
|---|---|---|
${readiness.gates.map((gate) => `| ${gate.gate} | ${gate.status} | ${gate.evidence} |`).join("\n")}

## Bloqueios encontrados
${readiness.blockers.length > 0 ? readiness.blockers.map((blocker) => `- ${blocker}`).join("\n") : "- Nenhum"}

## Ação necessária
${readiness.ready ? "- Solicitar aprovação humana para implementação real." : readiness.blockers.map((blocker) => `- ${toAction(blocker)}`).join("\n")}

## Aprovação humana para implementação real
Pendente

## Observação

Este registro não executa implementação.
Ele apenas prepara e valida os gates para uma implementação futura.
`;
}

function writeAssistedPackage(
  cwd: string,
  options: ImplementOptions,
  readiness: ReturnType<typeof getImplementationReadiness>
): string[] {
  const created: string[] = [];
  const sessionId = nextNestedImplementId(cwd, "sessions", "IMPLEMENT-SESSION-");
  const manifestId = nextNestedImplementId(cwd, "manifests", "CHANGE-MANIFEST-");
  const testContractId = nextNestedImplementId(cwd, "test-contracts", "TEST-CONTRACT-");
  const handoffId = nextNestedImplementId(cwd, "handoffs", "AGENT-HANDOFF-");
  const approvalId = nextNestedImplementId(cwd, "approvals", "IMPLEMENT-APPROVAL-");
  const riskId = nextNestedImplementId(cwd, "risks", "IMPLEMENT-RISK-");

  created.push(writeImplementationFile(cwd, `sessions/${sessionId}.md`, assistedSessionContent(cwd, sessionId, options, readiness)));

  if (options.prepare || options.manifest) {
    created.push(writeImplementationFile(cwd, `manifests/${manifestId}.md`, changeManifestContent(manifestId, options)));
  }

  if (options.prepare || options.testContract) {
    created.push(writeImplementationFile(cwd, `test-contracts/${testContractId}.md`, testContractContent(testContractId, options)));
  }

  if (options.prepare || options.handoff) {
    created.push(writeImplementationFile(cwd, `handoffs/${handoffId}.md`, handoffContent(handoffId, sessionId, manifestId, testContractId, options, cwd)));
  }

  created.push(writeImplementationFile(cwd, `approvals/${approvalId}.md`, approvalContent(approvalId, options)));
  created.push(writeImplementationFile(cwd, `risks/${riskId}.md`, riskContent(riskId)));
  return created;
}

function assistedSessionContent(
  cwd: string,
  id: string,
  options: ImplementOptions,
  readiness: ReturnType<typeof getImplementationReadiness>
): string {
  return `# ${id} — Sessão de Implementação Assistida

## Status
${readiness.ready ? "Preparada" : "Bloqueada"}

## Modo
Assistido / Dry-run / Sem alteração de código

## Fase
${options.phase}

## Tarefa alvo
${options.task}

## Agente sugerido
${options.agent}

## Escopo autorizado
-

## Arquivos permitidos
${formatBullets(options.allowedFiles)}

## Arquivos proibidos
${formatBullets(options.forbiddenFiles)}

## Testes obrigatórios antes de implementação
- Verificar contrato de testes antes de qualquer mudança.

## Documentação que deve ser atualizada
- docs/

## Extensões/skills usadas
${formatUsedExtensions(cwd)}

## Segurança
${formatSecurityHandoff(cwd)}

## Gates avaliados
${readiness.gates.map((gate) => `- ${gate.gate}: ${gate.status} (${gate.evidence})`).join("\n")}

## Bloqueios encontrados
${readiness.blockers.length > 0 ? readiness.blockers.map((blocker) => `- ${blocker}`).join("\n") : "- Nenhum"}

## Riscos
- Alterar arquivos fora do escopo.
- Implementar sem testes.
- Expor segredos por engano.

## Aprovação humana para executar implementação real
Pendente

## Observação
Este arquivo não autoriza alteração automática de código.
Ele prepara uma implementação assistida para revisão humana.
`;
}

function changeManifestContent(id: string, options: ImplementOptions): string {
  return `# ${id} — Manifesto de Mudanças Planejadas

## Fase
${options.phase}

## Tarefa alvo
${options.task}

## Objetivo
[Descrever objetivo da mudança.]

## Arquivos candidatos a alteração
${formatBullets(options.allowedFiles)}

## Arquivos explicitamente proibidos
${formatBullets(options.forbiddenFiles)}

## Mudanças permitidas
-

## Mudanças proibidas
- Alterar arquivos proibidos.
- Executar scripts do projeto consumidor.
- Publicar npm, criar tag, fazer push ou deploy.

## Contrato de segurança
- Não expor segredos.
- Não alterar \`.env\`.
- Não commitar \`.sdd-master/\`.
- Não executar deploy.
- Não publicar npm.
- Não fazer push sem autorização humana.

## Estratégia de rollback
-

## Aprovação humana
Pendente
`;
}

function testContractContent(id: string, options: ImplementOptions): string {
  return `# ${id} — Contrato de Testes Antes da Implementação

## Regra
Nenhuma implementação deve ocorrer antes de definir testes/checks.

## Tarefa alvo
${options.task}

## Testes obrigatórios
-

## Checks obrigatórios
-

## Falhas esperadas antes da implementação
-

## Critérios para considerar testes suficientes
-

## Evidências exigidas
-

## Status
Pendente

## Aprovação humana
Pendente
`;
}

function handoffContent(
  id: string,
  sessionId: string,
  manifestId: string,
  testContractId: string,
  options: ImplementOptions,
  cwd?: string
): string {
  return `# ${id} — Handoff para Agente de IA

## Instruções obrigatórias

Antes de qualquer alteração, leia:

1. \`.sdd-master/constitution.md\`
2. \`.sdd-master/project-state.md\`
3. \`.sdd-master/implementation/sessions/${sessionId}.md\`
4. \`.sdd-master/implementation/manifests/${manifestId}.md\`
5. \`.sdd-master/implementation/test-contracts/${testContractId}.md\`
6. \`.sdd-master/tasks/${options.task}.md\`
7. \`docs/\`

## Regras não negociáveis

- Não implemente fora do escopo aprovado.
- Não altere arquivos proibidos.
- Não crie \`.env\`.
- Não exponha segredos.
- Não faça push.
- Não publique npm.
- Não execute deploy.
- Não execute scripts do projeto consumidor sem autorização humana.
- Crie ou confirme testes antes da implementação.
- Atualize documentação impactada.
- Registre evidências.
- Pare se encontrar bloqueio.

## Objetivo da implementação
[Descrever objetivo.]

## Arquivos permitidos
${formatBullets(options.allowedFiles)}

## Arquivos proibidos
${formatBullets(options.forbiddenFiles)}

## Extensões/skills usadas
${cwd ? formatUsedExtensions(cwd) : "- Nenhuma extensão/skill usada."}

## Segurança
${cwd ? formatSecurityHandoff(cwd) : "- Último relatório de segurança: não iniciado\n- Scanner externo usado: Não\n- Redaction: not-started\n- Pendências: Nenhuma"}

## Saída esperada do agente
- Resumo do que foi alterado.
- Testes criados.
- Testes executados.
- Documentação atualizada.
- Riscos encontrados.
- Pendências.
`;
}

function approvalContent(id: string, options: ImplementOptions): string {
  return `# ${id} — Aprovação para Implementação Real

## Status
Pendente

## Aprovador
Humano

## Escopo aprovado
-

## Arquivos aprovados
${formatBullets(options.allowedFiles)}

## Arquivos proibidos
${formatBullets(options.forbiddenFiles)}

## Testes aprovados
-

## Restrições
- Nenhuma alteração automática de código autorizada por este documento.

## Observação
Este documento deve ser aprovado antes de qualquer implementação real.
`;
}

function riskContent(id: string): string {
  return `# ${id} — Riscos de Implementação

## Riscos identificados
-

## Impacto
-

## Mitigação
-

## Riscos aceitos
-

## Riscos não aceitos
-

## Aprovação humana para riscos aceitos
Pendente
`;
}

function implementationIndex(cwd: string, latest: string): string {
  const directory = join(cwd, ".sdd-master", "implementation");
  const records = existsSync(directory)
    ? readdirSync(directory)
        .filter((file) => file.startsWith("IMPLEMENT-") && file.endsWith(".md"))
        .map((file) => `- ${file.replace(".md", "")}`)
    : [`- ${latest}`];

  if (!records.includes(`- ${latest}`)) {
    records.push(`- ${latest}`);
  }

  return `# Índice de implementação

${records.join("\n")}
`;
}

function nextImplementId(cwd: string): string {
  const directory = join(cwd, ".sdd-master", "implementation");
  const next = existsSync(directory)
    ? readdirSync(directory)
        .filter((file) => file.startsWith("IMPLEMENT-") && file.endsWith(".md"))
        .map((file) => Number(file.replace("IMPLEMENT-", "").replace(".md", "")))
        .filter((value) => Number.isInteger(value))
        .reduce((max, value) => Math.max(max, value), 0) + 1
    : 1;

  return `IMPLEMENT-${String(next).padStart(3, "0")}`;
}

function nextNestedImplementId(cwd: string, directoryName: string, prefix: string): string {
  const directory = join(cwd, ".sdd-master", "implementation", directoryName);
  const next = existsSync(directory)
    ? readdirSync(directory)
        .filter((file) => file.startsWith(prefix) && file.endsWith(".md"))
        .map((file) => Number(file.replace(prefix, "").replace(".md", "")))
        .filter((value) => Number.isInteger(value))
        .reduce((max, value) => Math.max(max, value), 0) + 1
    : 1;

  return `${prefix}${String(next).padStart(3, "0")}`;
}

function writeImplementationFile(cwd: string, relativeImplementationPath: string, content: string): string {
  const relativePath = `.sdd-master/implementation/${relativeImplementationPath}`;
  safeWriteFile(cwd, relativePath, content);
  return relativePath;
}

function parsePatternList(value: string): string[] {
  return normalizeSafePatterns(
    value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean)
  );
}

function normalizeForbidden(patterns: string[]): string[] {
  return Array.from(new Set([...patterns, ...forcedForbiddenFiles]));
}

function formatBullets(items: string[]): string {
  return items.length > 0 ? items.map((item) => `- ${item}`).join("\n") : "-";
}

function toAction(blocker: string): string {
  if (blocker.includes("Aprovação")) return `Registrar aprovação humana relacionada a: ${blocker}.`;
  if (blocker.includes("Testes obrigatórios")) return "Definir testes obrigatórios em TASK-001.";
  if (blocker.includes("Blockers")) return "Resolver blockers ativos.";
  if (blocker.includes("Auditoria")) return "Resolver ou aceitar formalmente achados de auditoria.";
  if (blocker.includes("Documentação")) return "Atualizar documentação pendente.";
  return `Corrigir: ${blocker}.`;
}

function getImplementHelp(): string {
  return `sdd master implement

Status:
  Disponível como guard/dry-run e preparador assistido controlado.

Finalidade:
  Verificar readiness completo e preparar manifesto de implementação autorizável.
  Com --prepare, gerar pacote de implementação assistida sem alterar código.

Importante:
  Nesta versão prototype, implement não altera código do projeto consumidor.
  O comportamento padrão é --dry-run.
  Não executa scripts, não publica npm, não faz deploy e não faz push.

Pré-condições:
  Projeto inicializado com sdd master init.
  Workflow, governança, gates e test gates devem estar prontos.

Uso:
  sdd master implement --yes --phase="PHASE-01" --task="TASK-001" --dry-run
  sdd master implement --yes --prepare --handoff --manifest --test-contract --agent="codex" --allowed-files="src/**,tests/**,docs/**"

Flags:
  --help
  --json
  --yes, -y
  --phase
  --task
  --target
  --dry-run
  --prepare
  --handoff
  --manifest
  --test-contract
  --agent
  --allowed-files
  --forbidden-files
  --output=text|json

Gates:
  Discovery, requirements, spec, plan, tasks, approvals, clarifications, scope, quality, audit,
  docs, blockers, test gates, security/git e advanced security.

Arquivos permitidos/proibidos:
  --allowed-files define padrões candidatos.
  --forbidden-files define padrões proibidos.
  .env, .env.*, secrets/**, private/**, credentials/**, .sdd-master/**, node_modules/** e dist/** são sempre proibidos.

Próximo passo futuro:
  Uma implementação real só poderá acontecer após aprovação humana explícita e gates mínimos aprovados.
  Após implementação real futura, execute:
    sdd master quality
    sdd master audit
    sdd master docs
    sdd master release
    sdd master deploy

Próximos passos:
  1. Revisar manifesto.
  2. Aprovar contrato de testes.
  3. Entregar handoff ao agente escolhido.
`;
}
