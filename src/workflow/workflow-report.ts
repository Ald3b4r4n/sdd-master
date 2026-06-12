import type { WorkflowResult } from "./workflow-types.js";

export function formatWorkflowJson(result: WorkflowResult): string {
  return `${JSON.stringify(result, null, 2)}\n`;
}

export function formatWorkflowText(heading: string, result: WorkflowResult): string {
  return `SDD Master — ${heading}

Status:
  criado

Arquivos criados:
${formatList(result.createdFiles)}

Arquivos preservados:
${formatList(result.preservedFiles)}

Arquivos atualizados:
${formatList(result.updatedFiles)}

Próximo comando recomendado:
  ${result.nextCommand}

Aprovação humana:
  Pendente

Aviso:
  Este documento precisa de aprovação humana antes de avançar para a próxima fase.
${result.message ? `\n${result.message}\n` : ""}`;
}

function formatList(items: string[]): string {
  return items.length > 0 ? items.map((item) => `  ${item}`).join("\n") : "  Nenhum";
}
