export type SecurityMode = "basic" | "advanced";
export type SecurityTool = "builtin" | "gitleaks" | "trufflehog" | "all";
export type SecurityResultStatus = "clean" | "warning" | "blocked";
export type ExternalToolName = "gitleaks" | "trufflehog";

export type SecurityOptions = {
  yes: boolean;
  json: boolean;
  mode: SecurityMode;
  tool: SecurityTool;
  detectTools: boolean;
  runExternal: boolean;
  redact: boolean;
  report: boolean;
  audit: boolean;
  prePush: boolean;
  strict: boolean;
  allowMissingTools: boolean;
};

export type ExternalToolStatus = {
  name: ExternalToolName;
  available: boolean;
  version: string;
  executed: boolean;
  result: "not-requested" | "missing" | "clean" | "blocked" | "error";
  findings: number;
};

export type SecurityFinding = {
  type: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  file: string;
  value: "[REDACTED]";
};

export type SecurityState = {
  status: "not-started" | SecurityResultStatus;
  policy: "not-started" | "OK" | "missing";
  builtin: "not-started" | "clean" | "blocked";
  externalTools: "not-started" | "available" | "partial" | "missing";
  gitleaks: ExternalToolStatus;
  trufflehog: ExternalToolStatus;
  lastReport: string;
  lastAudit: string;
  redaction: "not-started" | "enabled" | "broken";
  unredactedOutput: boolean;
  blockers: string[];
  warnings: string[];
};

export type SecurityCommandResult = {
  mode: SecurityMode;
  tool: SecurityTool;
  status: SecurityResultStatus;
  externalExecution: boolean;
  redaction: true;
  findings: SecurityFinding[];
  blockers: string[];
  warnings: string[];
  tools: {
    builtin: "clean" | "blocked";
    gitleaks: ExternalToolStatus;
    trufflehog: ExternalToolStatus;
  };
  createdFiles: string[];
  updatedFiles: string[];
};
