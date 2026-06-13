import type { PluginCommandResult, PluginStatusSummary } from "./plugin-types.js";

export function formatPluginJson(result: PluginCommandResult): string {
  return `${JSON.stringify(result, null, 2)}\n`;
}

export function formatPluginText(result: PluginCommandResult): string {
  return `SDD Master — Plugins

Status:
  ${result.status}

Mensagem:
  ${result.message}

Plugin:
  ${result.plugin ?? "não aplicável"}

Resumo:
${formatSummary(result.summary)}

Arquivos criados:
${formatList(result.createdFiles)}

Arquivos atualizados:
${formatList(result.updatedFiles)}

Segurança:
  Instalação global: Proibida
  Código remoto executado: Não
  .env criado: Não
  Registry local: Sim
`;
}

export function formatPluginSummary(summary: PluginStatusSummary): string {
  return formatSummary(summary);
}

function formatSummary(summary: PluginStatusSummary): string {
  return `  Candidatas: ${summary.candidates}
  Aprovadas: ${summary.approved}
  Instaladas localmente: ${summary.installedLocal}
  Usadas: ${summary.used}
  Bloqueadas/rejeitadas: ${summary.blocked}
  Origens remotas: ${summary.remoteSources}
  Riscos supply chain: ${summary.supplyChainRisks}
  Relatórios de uso: ${summary.usageReports}
  Auditorias: ${summary.audits}`;
}

function formatList(items: string[]): string {
  return items.length > 0 ? items.map((item) => `  - ${item}`).join("\n") : "  - Nenhum";
}
