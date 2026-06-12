import type { GateResult } from "./gate-types.js";

export function formatGateJson(result: GateResult): string {
  return `${JSON.stringify(result, null, 2)}\n`;
}

export function formatGateText(title: string, result: GateResult): string {
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

Registros:
${formatList(result.records ?? [])}

Implementação:
  Pronta: ${result.implementReady ? "Sim" : "Não"}
  Bloqueios:
${formatList(result.blockers)}
`;
}

function formatList(items: string[]): string {
  return items.length > 0 ? items.map((item) => `  - ${item}`).join("\n") : "  - Nenhum";
}
