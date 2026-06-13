import { safeWriteFile } from "../filesystem/safe-write.js";
import type { UpdateResult } from "./update-types.js";

export function writeUpdateReport(cwd: string, result: UpdateResult, timestampSlug: string): string {
  const path = `.sdd-master/reports/update-${timestampSlug}.md`;
  safeWriteFile(cwd, path, updateReportContent(result));
  return path;
}

export function formatUpdateJson(result: UpdateResult): string {
  return `${JSON.stringify(result, null, 2)}\n`;
}

export function formatUpdateText(result: UpdateResult): string {
  if (result.mode === "dry-run") {
    return `SDD Master — Update

Modo:
  dry-run

Versão instalada:
  ${result.installedVersion}

Versão alvo:
  ${result.targetVersion}

Plano:
  Templates ausentes: ${result.created.length}
  Templates preservados: ${result.preserved.length}
  Conflitos: ${result.conflicts.length}
  Project-state: ${result.projectStateUpdated ? "será atualizado com metadados de versão" : "preservado"}

Nenhuma alteração foi feita.
`;
  }

  return `SDD Master — Update

Modo:
  ${result.status}

Backup:
  ${result.backupPath ?? "não necessário"}

Alterações:
  Templates criados: ${result.created.length}
  Templates atualizados: ${result.updated.filter((file) => file.includes(".sdd-master/templates/")).length}
  Preservados: ${result.preserved.length}
  Conflitos: ${result.conflicts.length}

Relatório:
  ${result.reportPath ?? "não criado"}
`;
}

function updateReportContent(result: UpdateResult): string {
  return `# Relatório de Update — SDD Master

## Status
${result.status}

## Versão instalada anterior
${result.installedVersion}

## Versão alvo
${result.targetVersion}

## Templates
- Criados: ${result.created.length}
- Atualizados: ${result.updated.filter((file) => file.includes(".sdd-master/templates/")).length}
- Preservados: ${result.preserved.length}
- Conflitos: ${result.conflicts.length}

## Project-state
- Atualizado: ${result.projectStateUpdated ? "Sim" : "Não"}
- Preservado: ${result.projectStateUpdated ? "Não" : "Sim"}
- Conflitos: 0

## Agents
- Atualizados: 0
- Preservados: 0
- Conflitos: 0

## Backup
- Criado: ${result.backupCreated ? "Sim" : "Não"}
- Caminho: ${result.backupPath ?? "-"}

## Segurança
- \`.env\` criado: Não
- Segredos adicionados: Não
- Arquivos apagados: Não

## Conflitos
${result.conflicts.length > 0 ? result.conflicts.map((conflict) => `- ${conflict.path}: ${conflict.reason}`).join("\n") : "- Nenhum"}

## Próximos passos
- Revisar conflitos manualmente quando existirem.
- Executar sdd master doctor.
`;
}
