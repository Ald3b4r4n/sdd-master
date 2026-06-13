import type { ImplementResult } from "./implement-types.js";

export function formatImplementJson(result: ImplementResult): string {
  return `${JSON.stringify(result, null, 2)}\n`;
}

export function formatImplementText(result: ImplementResult): string {
  if (result.mode === "assisted-guard") {
    return `SDD Master — Implement Assistido

Status:
  ${result.status === "ready" ? "Preparado para autorização humana" : "Bloqueado"}

Nenhum código foi alterado.

Artefatos criados:
${formatList(result.createdFiles)}

Bloqueios:
${formatList(result.blockers)}

Próxima ação:
  ${
    result.status === "ready"
      ? "Revisar artefatos e registrar aprovação humana antes de qualquer implementação real."
      : "Resolver bloqueios antes de gerar handoff final para agente."
  }

Aprovação humana:
  Pendente
`;
  }

  if (result.status === "ready") {
    return `SDD Master — Implement Guard

Status:
  Pronto para autorização

Fase:
  ${result.phase}

Tarefa:
  ${result.task}

Gates:
  Todos os gates mínimos passaram.

Aprovação humana para implementação real:
  Pendente

Nenhum código foi alterado.
`;
  }

  return `SDD Master — Implement Guard

Status:
  Bloqueado

Motivos:
${formatList(result.blockers)}

Ação necessária:
${result.nextActions.map((action, index) => `  ${index + 1}. ${action}`).join("\n")}

Nenhum código foi alterado.
`;
}

function formatList(items: string[]): string {
  return items.length > 0 ? items.map((item) => `  - ${item}`).join("\n") : "  - Nenhum";
}
