import type { GovernanceResult } from "./governance-types.js";

export function formatGovernanceJson(result: GovernanceResult): string {
  return `${JSON.stringify(result, null, 2)}\n`;
}

export function formatGovernanceText(title: string, result: GovernanceResult): string {
  return `SDD Master — ${title}

Status:
  ${result.status}

Mensagem:
  ${result.message}

Arquivos criados:
${formatList(result.createdFiles)}

Arquivos atualizados:
${formatList(result.updatedFiles)}

Arquivos preservados:
${formatList(result.preservedFiles)}

Implementação:
  Pronta: ${result.implementReady ? "Sim" : "Não"}
  Bloqueios:
${formatList(result.blockers)}
`;
}

function formatList(items: string[]): string {
  return items.length > 0 ? items.map((item) => `  - ${item}`).join("\n") : "  - Nenhum";
}
