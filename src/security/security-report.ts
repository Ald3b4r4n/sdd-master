import type { SecurityCommandResult } from "./security-types.js";

export function formatSecurityJson(result: SecurityCommandResult): string {
  return `${JSON.stringify(result, null, 2)}\n`;
}

export function formatSecurityText(result: SecurityCommandResult): string {
  return `SDD Master — Segurança

Modo:
  ${result.mode}

Resultado:
  ${result.status}

Builtin:
  ${result.tools.builtin}

Ferramentas externas:
  gitleaks: ${formatTool(result.tools.gitleaks)}
  trufflehog: ${formatTool(result.tools.trufflehog)}

Execução externa:
  ${result.externalExecution ? "Sim, por opt-in explícito" : "Não"}

Redaction:
  Ativa

Achados:
  ${result.findings.length}

Observação:
  Valores sensíveis nunca são exibidos ou armazenados.
`;
}

function formatTool(tool: SecurityCommandResult["tools"]["gitleaks"]): string {
  if (tool.result === "not-requested") return "não consultado";
  if (!tool.available) return "ausente";
  return `${tool.result} (${tool.version})`;
}
