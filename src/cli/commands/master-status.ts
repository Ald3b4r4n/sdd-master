import { existsSync } from "node:fs";
import { join } from "node:path";

export function getStatusOutput(cwd: string): string {
  const hasSddMaster = existsSync(join(cwd, ".sdd-master"));

  if (hasSddMaster) {
    return getInstalledStatus(cwd);
  }

  return `SDD Master — Status

Instalação SDD Master no projeto consumidor:
  Não detectada

Motivo:
  A pasta .sdd-master/ não existe neste diretório.

Próximo passo recomendado:
  sdd master init

Observação:
  Use init em modo não interativo para automações ou em modo interativo para configuração guiada.
`;
}

function getInstalledStatus(cwd: string): string {
  return `SDD Master — Status

Instalação SDD Master:
  Detectada

Arquivos principais:
  .sdd-master/constitution.md: ${formatStatus(existsSync(join(cwd, ".sdd-master", "constitution.md")))}
  .sdd-master/project-state.md: ${formatStatus(existsSync(join(cwd, ".sdd-master", "project-state.md")))}

Documentação:
  docs/01-negocio-requisitos/: ${formatStatus(existsSync(join(cwd, "docs", "01-negocio-requisitos")))}
  docs/02-tecnica-arquitetura/: ${formatStatus(existsSync(join(cwd, "docs", "02-tecnica-arquitetura")))}
  docs/03-codigo/: ${formatStatus(existsSync(join(cwd, "docs", "03-codigo")))}

Próximo comando recomendado:
  /sdd-master-discovery
`;
}

function formatStatus(isPresent: boolean): string {
  return isPresent ? "OK" : "Ausente";
}
