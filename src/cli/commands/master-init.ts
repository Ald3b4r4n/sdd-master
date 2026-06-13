import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, join } from "node:path";
import { createInterface } from "node:readline/promises";
import { parseAgent as parseSupportedAgent, parseLanguage as parseSupportedLanguage } from "../../agents/agent-registry.js";
import { updateProjectStateAgentsBlock, writeAgentFiles } from "../../agents/agent-writer.js";
import type { AgentLanguage, SupportedAgent } from "../../agents/agent-types.js";
import { version } from "../../index.js";
import { templateVersion } from "../../templates/official-templates.js";
import { writeOfficialTemplates } from "../../templates/template-writer.js";
import type { CliOutput, CliRuntime } from "../output.js";

type Language = AgentLanguage;
type Agent = SupportedAgent | "other";

type InitOptions = {
  yes: boolean;
  language?: Language;
  agent?: Agent;
  projectName?: string;
};

const initAgents = new Set<Agent>([
  "codex",
  "claude",
  "cursor",
  "gemini",
  "copilot",
  "windsurf",
  "cline",
  "roo",
  "aider",
  "continue",
  "generic",
  "other"
]);

const sddDirectories = [
  ".sdd-master/templates",
  ".sdd-master/discovery",
  ".sdd-master/requirements",
  ".sdd-master/specs",
  ".sdd-master/plans",
  ".sdd-master/tasks",
  ".sdd-master/tests",
  ".sdd-master/audits",
  ".sdd-master/quality",
  ".sdd-master/reports",
  ".sdd-master/traceability",
  ".sdd-master/approvals",
  ".sdd-master/risks",
  ".sdd-master/pendings",
  ".sdd-master/blockers",
  ".sdd-master/backlog",
  ".sdd-master/scope",
  ".sdd-master/skills",
  ".sdd-master/plugins",
  ".sdd-master/releases",
  ".sdd-master/deliveries",
  ".sdd-master/db",
  ".sdd-master/privacy",
  ".sdd-master/rollback",
  "docs/01-negocio-requisitos",
  "docs/02-tecnica-arquitetura",
  "docs/03-codigo",
  ".agents/skills",
  ".agents/plugins"
];

const gitignoreEntries = [
  "node_modules/",
  "dist/",
  "coverage/",
  "",
  ".env",
  ".env.*",
  "!.env.example",
  "",
  "*.pem",
  "*.key",
  "*.p12",
  "*.pfx",
  "*.crt",
  "*.cert",
  "*.jks",
  "*.keystore",
  "",
  "secrets/",
  "private/",
  "credentials/",
  "*.secret",
  "*.secrets",
  "",
  "# SDD Master internal governance can be versioned locally,",
  "# but must never be pushed to product remotes without explicit policy."
];

export async function runInitCommand(
  args: string[],
  output: CliOutput,
  runtime: CliRuntime
): Promise<number> {
  const parsed = parseInitArgs(args);

  if (!parsed.ok) {
    output.stderr(`${parsed.error}\n`);
    return 1;
  }

  const options = parsed.options.yes
    ? completeNonInteractiveOptions(parsed.options, runtime.cwd)
    : await promptForOptions(parsed.options, runtime);

  if (!options.ok) {
    output.stderr(`${options.error}\n`);
    return 1;
  }

  const result = initializeSddMaster(runtime.cwd, options.options);
  output.stdout(result);
  return 0;
}

function parseInitArgs(args: string[]):
  | { ok: true; options: InitOptions }
  | { ok: false; error: string } {
  const options: InitOptions = { yes: false };

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];

    if (arg === "--yes" || arg === "-y") {
      options.yes = true;
      continue;
    }

    if (arg === "--language") {
      index += 1;
      const value = args[index];
      const language = parseLanguage(value);
      if (!language) return { ok: false, error: getInvalidLanguageMessage(value) };
      options.language = language;
      continue;
    }

    if (arg.startsWith("--language=")) {
      const value = arg.slice("--language=".length);
      const language = parseLanguage(value);
      if (!language) return { ok: false, error: getInvalidLanguageMessage(value) };
      options.language = language;
      continue;
    }

    if (arg === "--agent") {
      index += 1;
      const value = args[index];
      const agent = parseAgent(value);
      if (!agent) return { ok: false, error: getInvalidAgentMessage(value) };
      options.agent = agent;
      continue;
    }

    if (arg.startsWith("--agent=")) {
      const value = arg.slice("--agent=".length);
      const agent = parseAgent(value);
      if (!agent) return { ok: false, error: getInvalidAgentMessage(value) };
      options.agent = agent;
      continue;
    }

    if (arg === "--project-name") {
      index += 1;
      options.projectName = args[index];
      continue;
    }

    if (arg.startsWith("--project-name=")) {
      options.projectName = arg.slice("--project-name=".length);
      continue;
    }

    return { ok: false, error: `Opção desconhecida para init: ${arg}` };
  }

  return { ok: true, options };
}

function completeNonInteractiveOptions(
  options: InitOptions,
  cwd: string
): { ok: true; options: Required<Pick<InitOptions, "language" | "agent" | "projectName">> } | {
  ok: false;
  error: string;
} {
  if (!options.language) {
    return { ok: false, error: "Idioma obrigatório no modo não interativo: --language=pt-BR" };
  }

  if (!options.agent) {
    return { ok: false, error: "Agente obrigatório no modo não interativo: --agent=codex" };
  }

  return {
    ok: true,
    options: {
      language: options.language,
      agent: options.agent,
      projectName: normalizeProjectName(options.projectName, cwd)
    }
  };
}

async function promptForOptions(
  options: InitOptions,
  runtime: CliRuntime
): Promise<
  | { ok: true; options: Required<Pick<InitOptions, "language" | "agent" | "projectName">> }
  | { ok: false; error: string }
> {
  const readline = createInterface({
    input: runtime.stdin,
    output: runtime.stdoutStream
  });

  try {
    const suggestedName = normalizeProjectName(options.projectName, runtime.cwd);
    const languageInput =
      options.language ?? parseLanguage(await readline.question("Idioma operacional (pt-BR/en/es): "));
    const agentInput =
      options.agent ??
      parseAgent(
        await readline.question(
          "IA/agente principal (codex/claude/cursor/gemini/copilot/windsurf/cline/roo/aider/continue/other): "
        )
      );
    const projectNameInput =
      options.projectName ??
      normalizeProjectName(
        await readline.question(`Nome do projeto (${suggestedName}): `),
        runtime.cwd
      );
    const confirmation = await readline.question("Confirmar criação da estrutura? (Sim/Não): ");

    if (!languageInput) return { ok: false, error: getInvalidLanguageMessage("") };
    if (!agentInput) return { ok: false, error: getInvalidAgentMessage("") };

    if (!isYes(confirmation)) {
      return { ok: false, error: "Inicialização cancelada. Nenhuma alteração foi feita." };
    }

    return {
      ok: true,
      options: {
        language: languageInput,
        agent: agentInput,
        projectName: projectNameInput
      }
    };
  } finally {
    readline.close();
  }
}

function initializeSddMaster(
  cwd: string,
  options: Required<Pick<InitOptions, "language" | "agent" | "projectName">>
): string {
  if (existsSync(join(cwd, ".sdd-master"))) {
    const templates = writeOfficialTemplates(cwd);

    return `Projeto já parece inicializado com SDD Master.

A pasta .sdd-master/ já existe.

Templates oficiais:
  Criados: ${templates.created}
  Já existentes: ${templates.existing}

Nenhuma estrutura existente foi sobrescrita.

Recomendação:
  sdd master status
  sdd master doctor
`;
  }

  for (const directory of sddDirectories) {
    mkdirSync(join(cwd, directory), { recursive: true });
  }

  writeFileIfMissing(join(cwd, ".sdd-master", "constitution.md"), getConstitutionContent());
  writeFileIfMissing(
    join(cwd, ".sdd-master", "project-state.md"),
    getProjectStateContent(cwd, options)
  );
  const templates = writeOfficialTemplates(cwd);
  ensureGitignore(cwd);
  ensureReadme(cwd, options.projectName);
  const agent = normalizeInitAgent(options.agent);
  const agents = writeAgentFiles(cwd, {
    agents: [agent],
    language: options.language,
    force: false
  });
  updateProjectStateAgentsBlock(
    cwd,
    agent,
    [],
    agents.files.map((file) => file.path)
  );

  return `SDD Master inicializado com sucesso.

Projeto:
  ${options.projectName}

Idioma operacional:
  ${options.language}

IA/agente principal:
  ${options.agent}

Estruturas criadas:
  .sdd-master/
  docs/01-negocio-requisitos/
  docs/02-tecnica-arquitetura/
  docs/03-codigo/
  .agents/skills/

Templates oficiais:
  Criados: ${templates.created}
  Já existentes: ${templates.existing}

Agentes / IAs:
  Arquivos criados: ${agents.created.length}
  Arquivos preservados: ${agents.preserved.length}

Próximo comando recomendado:
  /sdd-master-discovery
`;
}

function ensureGitignore(cwd: string): void {
  const path = join(cwd, ".gitignore");
  const existing = existsSync(path) ? readFileSync(path, "utf8") : "";
  const existingLines = new Set(existing.split(/\r?\n/));
  const missing = gitignoreEntries.filter((entry) => entry !== "" && !existingLines.has(entry));

  if (missing.length === 0 && existing) {
    return;
  }

  const block = gitignoreEntries.filter((entry) => entry === "" || !existingLines.has(entry)).join("\n");
  const separator = existing && !existing.endsWith("\n") ? "\n" : "";
  writeFileSync(path, `${existing}${separator}${existing ? "\n" : ""}${block}\n`, "utf8");
}

function ensureReadme(cwd: string, projectName: string): void {
  const path = join(cwd, "README.md");
  const governanceSection = `## Governança SDD Master

Este projeto usa SDD Master para desenvolvimento orientado por especificação, documentação, TDD, auditoria e rastreabilidade.
`;

  if (!existsSync(path)) {
    writeFileSync(path, getInitialReadmeContent(projectName), "utf8");
    return;
  }

  const existing = readFileSync(path, "utf8");

  if (existing.includes("## Governança SDD Master")) {
    return;
  }

  const separator = existing.endsWith("\n") ? "\n" : "\n\n";
  writeFileSync(path, `${existing}${separator}${governanceSection}`, "utf8");
}

function writeFileIfMissing(path: string, content: string): void {
  if (!existsSync(path)) {
    writeFileSync(path, content, "utf8");
  }
}

function getConstitutionContent(): string {
  return `# SDD Master — Constituição

## Status
Aprovado

## Regras invioláveis

1. Não implementar sem especificação aprovada.
2. Não implementar sem testes/checks criados antes.
3. Não avançar fase sem aprovação humana.
4. Não pular qualidade.
5. Não pular auditoria.
6. Não pular documentação.
7. Não aprovar especificação com dúvida aberta.
8. Não alterar escopo sem autorização formal.
9. Não aceitar risco sem aprovação humana.
10. Não enviar .sdd-master/ para GitHub.
11. Não enviar .env real.
12. Não enviar segredo, token, credencial ou dado sensível.
13. Não misturar commit de produto com commit interno.
14. Não fazer push sem autorização humana.
15. Não adicionar dependência sem auditoria e aprovação.
16. Não criar UI sem validação UI/UX quando aplicável.
17. Não ignorar acessibilidade em projetos com interface.
18. Não ignorar segurança desde o início.
19. Não usar skill externa sem aprovação e registro.
20. Não apagar rastreabilidade.

## Violação constitucional

Qualquer violação desta constituição deve gerar achado BLOCKER.
`;
}

function getProjectStateContent(
  cwd: string,
  options: Required<Pick<InitOptions, "language" | "agent" | "projectName">>
): string {
  return `# SDD Master — Estado do Projeto

## Identificação
- Nome do projeto: ${options.projectName}
- Idioma operacional: ${options.language}
- IA/agente principal: ${options.agent}
- Versão do SDD Master: ${version}
- Data de inicialização: ${new Date().toISOString()}

## SDD Master

- Versão instalada: ${version}
- Versão dos templates: ${templateVersion}
- Data da instalação: ${new Date().toISOString()}
- Último update:
- Canal recomendado: prototype

## Estado atual
- Fase atual: PHASE-01 — Discovery
- Última fase concluída: Nenhuma
- Próximo comando permitido: /sdd-master-discovery
- Maturidade atual: M0 — Ideia
- Maturidade alvo: M1 — Discovery
- Estágio atual: Prototype
- Versão interna atual: ${version}

## Documentação
- docs/01-negocio-requisitos/: Criado
- docs/02-tecnica-arquitetura/: Criado
- docs/03-codigo/: Criado

## Git
- Repositório Git detectado: ${existsSync(join(cwd, ".git")) ? "Sim" : "Não"}
- Remoto configurado: Não
- Push permitido: Não sem autorização humana

## Segurança
- .env real permitido: Não
- Segredos permitidos no repositório: Não
- .sdd-master/ permitido no remoto: Não

## Próximos passos
1. Executar /sdd-master-discovery.
2. Levantar objetivo, tipo de software, perfis, riscos e restrições.
3. Aprovar discovery antes de requisitos.
`;
}

function getInitialReadmeContent(projectName: string): string {
  return `# ${projectName}

## Status
Rascunho — Projeto inicializado com SDD Master.

## Governança
Este projeto usa SDD Master para desenvolvimento orientado por especificação, documentação, TDD, auditoria e rastreabilidade.

## Documentação
- docs/01-negocio-requisitos/
- docs/02-tecnica-arquitetura/
- docs/03-codigo/

## Próximo passo
Executar discovery do projeto.
`;
}

function parseLanguage(value: string | undefined): Language | undefined {
  return parseSupportedLanguage(value);
}

function parseAgent(value: string | undefined): Agent | undefined {
  if (!value) {
    return undefined;
  }

  if (value === "other") {
    return "other";
  }

  const agent = parseSupportedAgent(value);
  return agent && initAgents.has(agent) ? agent : undefined;
}

function normalizeInitAgent(agent: Agent): SupportedAgent {
  return agent === "other" ? "generic" : agent;
}

function normalizeProjectName(value: string | undefined, cwd: string): string {
  const trimmed = value?.trim();
  return trimmed ? trimmed : basename(cwd);
}

function isYes(value: string): boolean {
  const normalized = value.trim().toLowerCase();
  return normalized === "sim" || normalized === "s" || normalized === "yes" || normalized === "y";
}

function getInvalidLanguageMessage(value: string | undefined): string {
  return `Idioma inválido: ${value ?? ""}

Valores aceitos:
  pt-BR
  en
  es`;
}

function getInvalidAgentMessage(value: string | undefined): string {
  return `Agente inválido: ${value ?? ""}

Valores aceitos:
  codex
  claude
  cursor
  gemini
  copilot
  windsurf
  cline
  roo
  aider
  continue
  generic
  other`;
}
