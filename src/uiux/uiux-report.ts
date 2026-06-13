import type { UiuxCommandResult, UiuxSummary } from "./uiux-types.js";

export function formatUiuxJson(result: UiuxCommandResult): string {
  return `${JSON.stringify(result, null, 2)}\n`;
}

export function formatUiuxText(result: UiuxCommandResult): string {
  return `SDD Master — UI/UX

Status:
  ${result.status}

Tipo:
  ${result.type}

Perfil:
  ${result.profile}

Resumo:
${formatUiuxSummary(result.summary)}

Arquivos criados:
${formatList(result.createdFiles)}

Arquivos atualizados:
${formatList(result.updatedFiles)}
`;
}

export function formatUiuxSummary(summary: UiuxSummary): string {
  return `  Aplicável: ${summary.applicable ? "Sim" : "Não"}
  Design system: ${summary.designSystem ? "OK" : "Pendente"}
  Acessibilidade: ${summary.accessibility ? "OK" : "Pendente"}
  SEO: ${formatGate(summary.seo)}
  Responsividade: ${formatGate(summary.responsiveness)}
  Performance: ${formatGate(summary.performance)}
  Bloqueios: ${summary.blockers.length}`;
}

function formatGate(value: boolean | "not-applicable" | "recommended"): string {
  if (value === "not-applicable") return "not-applicable";
  if (value === "recommended") return "Recomendado";
  return value ? "OK" : "Pendente";
}

function formatList(items: string[]): string {
  return items.length > 0 ? items.map((item) => `  - ${item}`).join("\n") : "  - Nenhum";
}
