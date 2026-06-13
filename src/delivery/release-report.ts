import type { ReleaseResult } from "./delivery-types.js";

export function formatReleaseJson(result: ReleaseResult): string {
  return `${JSON.stringify(result, null, 2)}\n`;
}

export function formatReleaseText(result: ReleaseResult): string {
  return `SDD Master — Release Guard

Status:
  ${result.status}

Versão alvo:
  ${result.version}

Canal:
  ${result.channel}

Tipo:
  ${result.type}

Modo:
  ${result.mode}

Registros:
${result.createdFiles.map((file) => `  ${file}`).join("\n")}

Bloqueios:
${result.blockers.length > 0 ? result.blockers.map((blocker) => `  - ${blocker}`).join("\n") : "  - Nenhum"}

Observação:
  Este comando não cria tag, não publica npm e não publica GitHub Release.
`;
}
