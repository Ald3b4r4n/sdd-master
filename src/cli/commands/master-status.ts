import { existsSync } from "node:fs";
import { join } from "node:path";
import { getRecognizedAgentFiles } from "../../agents/agent-writer.js";
import { runGitSecurityCheck } from "../../git/git-checks.js";
import { getWorkflowStatus } from "../../workflow/workflow-runner.js";

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
  const gitSecurity = runGitSecurityCheck(cwd, "default");
  const workflow = getWorkflowStatus(cwd);

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

Git/Security:
  .env real detectado: ${gitSecurity.security.forbiddenFiles.some((file) => file === ".env" || file.startsWith(".env.")) ? "Sim" : "Não"}
  Segredos suspeitos: ${gitSecurity.security.suspectedSecrets.length > 0 ? "Sim" : "Não"}
  .gitignore: ${gitSecurity.security.gitignore.missingEntries.length === 0 ? "OK" : "Atenção"}

Workflow inicial:
  Discovery: ${formatStatus(workflow.discovery)}
  Requirements: ${formatStatus(workflow.requirements)}
  Spec: ${formatStatus(workflow.spec)}
  Plan: ${formatStatus(workflow.plan)}
  Tasks: ${formatStatus(workflow.tasks)}

Próximo comando recomendado:
  ${workflow.nextCommand}
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
