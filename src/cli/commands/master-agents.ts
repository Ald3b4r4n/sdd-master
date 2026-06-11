import { existsSync } from "node:fs";
import { join } from "node:path";
import { createInterface } from "node:readline/promises";
import { supportedAgents, supportedLanguages, parseAgents, parseLanguage } from "../../agents/agent-registry.js";
import { updateProjectStateAgentsBlock, writeAgentFiles } from "../../agents/agent-writer.js";
import type { AgentLanguage, SupportedAgent } from "../../agents/agent-types.js";
import type { CliOutput, CliRuntime } from "../output.js";

type AgentsOptions = {
  yes: boolean;
  force: boolean;
  agents?: SupportedAgent[];
  language?: AgentLanguage;
};

export async function runAgentsCommand(
  args: string[],
  output: CliOutput,
  runtime: CliRuntime
): Promise<number> {
  if (args.includes("--help") || args.includes("-h")) {
    output.stdout(getAgentsHelp());
    return 0;
  }

  if (args.includes("--list")) {
    output.stdout(`${supportedAgents.join("\n")}\n`);
    return 0;
  }

  if (!existsSync(join(runtime.cwd, ".sdd-master"))) {
    output.stderr(`SDD Master não inicializado neste diretório.

Execute primeiro:
  sdd master init
`);
    return 1;
  }

  const parsed = parseAgentsArgs(args);

  if (!parsed.ok) {
    output.stderr(`${parsed.error}\n`);
    return 1;
  }

  const completed = parsed.options.yes
    ? completeNonInteractiveOptions(parsed.options)
    : await promptForOptions(parsed.options, runtime);

  if (!completed.ok) {
    output.stderr(`${completed.error}\n`);
    return 1;
  }

  const result = writeAgentFiles(runtime.cwd, completed.options);
  updateProjectStateAgentsBlock(
    runtime.cwd,
    completed.options.agents[0],
    completed.options.agents.slice(1),
    result.files.map((file) => file.path)
  );

  output.stdout(`SDD Master — Agentes configurados

Idioma:
  ${completed.options.language}

Agentes:
  ${completed.options.agents.join(", ")}

Arquivos criados:
${formatList(result.created)}

Arquivos sobrescritos:
${formatList(result.overwritten)}

Arquivos preservados:
${formatList(result.preserved)}

Skills:
  .agents/skills/: OK
`);
  return 0;
}

function parseAgentsArgs(args: string[]): { ok: true; options: AgentsOptions } | { ok: false; error: string } {
  const options: AgentsOptions = { yes: false, force: false };

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];

    if (arg === "--yes" || arg === "-y") {
      options.yes = true;
      continue;
    }

    if (arg === "--force") {
      options.force = true;
      continue;
    }

    if (arg === "--agents") {
      index += 1;
      const agents = parseAgents(args[index]);
      if (!agents) return { ok: false, error: getInvalidAgentsMessage(args[index]) };
      options.agents = agents;
      continue;
    }

    if (arg.startsWith("--agents=")) {
      const value = arg.slice("--agents=".length);
      const agents = parseAgents(value);
      if (!agents) return { ok: false, error: getInvalidAgentsMessage(value) };
      options.agents = agents;
      continue;
    }

    if (arg === "--language") {
      index += 1;
      const language = parseLanguage(args[index]);
      if (!language) return { ok: false, error: getInvalidLanguageMessage(args[index]) };
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

    return { ok: false, error: `Opção desconhecida para agents: ${arg}` };
  }

  return { ok: true, options };
}

function completeNonInteractiveOptions(
  options: AgentsOptions
): { ok: true; options: Required<AgentsOptions> } | { ok: false; error: string } {
  if (!options.agents) {
    return { ok: false, error: "Agentes obrigatórios no modo não interativo: --agents=codex" };
  }

  if (!options.language) {
    return { ok: false, error: "Idioma obrigatório no modo não interativo: --language=pt-BR" };
  }

  return {
    ok: true,
    options: {
      yes: options.yes,
      force: options.force,
      agents: options.agents,
      language: options.language
    }
  };
}

async function promptForOptions(
  options: AgentsOptions,
  runtime: CliRuntime
): Promise<{ ok: true; options: Required<AgentsOptions> } | { ok: false; error: string }> {
  const readline = createInterface({ input: runtime.stdin, output: runtime.stdoutStream });

  try {
    const agents =
      options.agents ??
      parseAgents(await readline.question("Quais agentes deseja configurar? (codex,claude,cursor): "));
    const language =
      options.language ?? parseLanguage(await readline.question("Idioma dos arquivos (pt-BR/en/es): "));
    const confirmation = await readline.question("Confirmar geração? (Sim/Não): ");

    if (!agents) return { ok: false, error: getInvalidAgentsMessage("") };
    if (!language) return { ok: false, error: getInvalidLanguageMessage("") };
    if (!isYes(confirmation)) return { ok: false, error: "Geração cancelada. Nenhuma alteração foi feita." };

    return { ok: true, options: { yes: options.yes, force: options.force, agents, language } };
  } finally {
    readline.close();
  }
}

function getAgentsHelp(): string {
  return `sdd master agents

Status:
  Disponível no BLOCO 06.

Finalidade:
  Gerar arquivos de instrução para múltiplas IAs/agentes de codificação.

Uso:
  sdd master agents --yes --agents=codex,claude,cursor --language=pt-BR
  sdd master agents -y --agents=gemini,copilot --language=en
  sdd master agents --list

Flags:
  --agents    Lista separada por vírgula.
  --language  pt-BR, en ou es.
  --yes, -y   Modo não interativo.
  --force     Sobrescreve arquivos existentes.

Agentes suportados:
  ${supportedAgents.join(", ")}

Segurança:
  Exige projeto inicializado com sdd master init.
  Não cria .env real.
  Não instala skills externas.
  Reforça leitura da constituição, project-state e regras SDD Master.
`;
}

function getInvalidAgentsMessage(value: string | undefined): string {
  return `Agente inválido: ${value ?? ""}

Valores aceitos:
  ${supportedAgents.join("\n  ")}`;
}

function getInvalidLanguageMessage(value: string | undefined): string {
  return `Idioma inválido: ${value ?? ""}

Valores aceitos:
  ${supportedLanguages.join("\n  ")}`;
}

function formatList(items: string[]): string {
  return items.length > 0 ? items.map((item) => `  - ${item}`).join("\n") : "  - Nenhum";
}

function isYes(value: string): boolean {
  const normalized = value.trim().toLowerCase();
  return normalized === "sim" || normalized === "s" || normalized === "yes" || normalized === "y";
}
