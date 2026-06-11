import { existsSync } from "node:fs";
import { join } from "node:path";
import { getRecognizedAgentFiles } from "../../agents/agent-writer.js";

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
  const agentFiles = getRecognizedAgentFiles(cwd);

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

Templates:
  .sdd-master/templates/: ${formatStatus(existsSync(join(cwd, ".sdd-master", "templates")))}

Agentes / IAs:
${formatAgentFiles(agentFiles)}
  .agents/skills/: ${formatStatus(existsSync(join(cwd, ".agents", "skills")))}

Próximo comando recomendado:
  /sdd-master-discovery
`;
}

function formatStatus(isPresent: boolean): string {
  return isPresent ? "OK" : "Ausente";
}

function formatAgentFiles(files: string[]): string {
  if (files.length === 0) {
    return "  Nenhum arquivo de agente reconhecido: Ausente\n";
  }

  return `${files.map((file) => `  ${file}: OK`).join("\n")}\n`;
}
