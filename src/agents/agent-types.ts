export type AgentLanguage = "pt-BR" | "en" | "es";

export type SupportedAgent =
  | "codex"
  | "claude"
  | "cursor"
  | "gemini"
  | "copilot"
  | "windsurf"
  | "cline"
  | "roo"
  | "aider"
  | "continue"
  | "generic";

export type AgentFile = {
  agent: SupportedAgent;
  path: string;
};

export type AgentWriteOptions = {
  agents: SupportedAgent[];
  language: AgentLanguage;
  force: boolean;
};

export type AgentWriteResult = {
  created: string[];
  overwritten: string[];
  preserved: string[];
  files: AgentFile[];
};
