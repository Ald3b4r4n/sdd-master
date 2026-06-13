export type StandardOutput = {
  command: string;
  status: string;
  summary: string[];
  files: string[];
  blockers: string[];
  warnings: string[];
  nextActions: string[];
};

export function formatStandardText(value: StandardOutput): string {
  return `SDD Master — ${title(value.command)}

Status:
  ${value.status}

Resumo:
${bullets(value.summary)}

Arquivos:
${bullets(value.files)}

Bloqueios:
${bullets(value.blockers)}

Próximos passos:
${value.nextActions.map((action, index) => `  ${index + 1}. ${action}`).join("\n") || "  1. Nenhuma ação pendente"}
`;
}

function bullets(items: string[]): string {
  return items.length > 0 ? items.map((item) => `  - ${item}`).join("\n") : "  - Nenhum";
}

function title(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
