import type { AgentFile, AgentLanguage, SupportedAgent } from "./agent-types.js";

export const supportedAgents: SupportedAgent[] = [
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
  "generic"
];

export const supportedLanguages: AgentLanguage[] = ["pt-BR", "en", "es"];

export const agentFiles: Record<SupportedAgent, AgentFile> = {
  codex: { agent: "codex", path: "AGENTS.md" },
  claude: { agent: "claude", path: "CLAUDE.md" },
  cursor: { agent: "cursor", path: ".cursor/rules/sdd-master.mdc" },
  gemini: { agent: "gemini", path: "GEMINI.md" },
  copilot: { agent: "copilot", path: ".github/copilot-instructions.md" },
  windsurf: { agent: "windsurf", path: ".windsurf/rules/sdd-master.md" },
  cline: { agent: "cline", path: ".cline/rules/sdd-master.md" },
  roo: { agent: "roo", path: ".roo/rules/sdd-master.md" },
  aider: { agent: "aider", path: ".aider.conf.yml" },
  continue: { agent: "continue", path: ".continue/sdd-master.md" },
  generic: { agent: "generic", path: "AGENTS.md" }
};

export function parseAgent(value: string | undefined): SupportedAgent | undefined {
  return value && supportedAgents.includes(value as SupportedAgent)
    ? (value as SupportedAgent)
    : undefined;
}

export function parseAgents(value: string | undefined): SupportedAgent[] | undefined {
  if (!value) {
    return undefined;
  }

  const agents = value
    .split(",")
    .map((agent) => agent.trim())
    .filter(Boolean);

  if (agents.length === 0) {
    return undefined;
  }

  const parsed = agents.map(parseAgent);

  if (parsed.some((agent) => !agent)) {
    return undefined;
  }

  return [...new Set(parsed as SupportedAgent[])];
}

export function parseLanguage(value: string | undefined): AgentLanguage | undefined {
  return value && supportedLanguages.includes(value as AgentLanguage)
    ? (value as AgentLanguage)
    : undefined;
}
