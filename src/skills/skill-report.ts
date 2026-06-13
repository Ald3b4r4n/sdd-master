import type { SkillCommandResult, SkillStatusSummary } from "./skill-types.js";

export function formatSkillJson(result: SkillCommandResult): string {
  return `${JSON.stringify(result, null, 2)}\n`;
}

export function formatSkillText(result: SkillCommandResult): string {
  return `SDD Master — Skills

Status:
  ${result.status}

Mensagem:
  ${result.message}

Skill:
  ${result.skill ?? "não aplicável"}

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
`;
}

export function formatSkillSummary(summary: SkillStatusSummary): string {
  return formatSummary(summary);
}

function formatSummary(summary: SkillStatusSummary): string {
  return `  Candidatas: ${summary.candidates}
  Aprovadas: ${summary.approved}
  Instaladas localmente: ${summary.installedLocal}
  Usadas: ${summary.used}
  Relatórios de uso: ${summary.usageReports}`;
}

function formatList(items: string[]): string {
  return items.length > 0 ? items.map((item) => `  - ${item}`).join("\n") : "  - Nenhum";
}
