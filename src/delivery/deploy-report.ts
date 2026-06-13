import type { DeployResult } from "./delivery-types.js";

export function formatDeployJson(result: DeployResult): string {
  return `${JSON.stringify(result, null, 2)}\n`;
}

export function formatDeployText(result: DeployResult): string {
  return `SDD Master — Deploy Guard

Status:
  ${result.status}

Ambiente:
  ${result.environment}

Provider:
  ${result.provider}

Estratégia:
  ${result.strategy}

Modo:
  ${result.mode}

Registros:
${result.createdFiles.map((file) => `  ${file}`).join("\n")}

Bloqueios:
${result.blockers.length > 0 ? result.blockers.map((blocker) => `  - ${blocker}`).join("\n") : "  - Nenhum"}

Observação:
  Este comando não executa deploy real, não acessa servidor e não envia arquivos.
`;
}
