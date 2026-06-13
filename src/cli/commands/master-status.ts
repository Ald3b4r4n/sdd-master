import { existsSync } from "node:fs";
import { join } from "node:path";
import { getRecognizedAgentFiles } from "../../agents/agent-writer.js";
import { getGateStatus } from "../../gates/gate-state.js";
import { runGitSecurityCheck } from "../../git/git-checks.js";
import { getImplementReadiness } from "../../governance/blockers.js";
import { getGovernanceStatus } from "../../governance/governance-state.js";
import { getImplementGuardStatus } from "../../implementation/implement-readiness.js";
import { getSkillStatus } from "../../skills/skill-registry.js";
import { getUiuxStatus } from "../../uiux/uiux-gates.js";
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
  const governance = getGovernanceStatus(cwd);
  const gates = getGateStatus(cwd);
  const implementReadiness = getImplementReadiness(cwd);
  const implementGuard = getImplementGuardStatus(cwd);
  const skills = getSkillStatus(cwd);
  const uiux = getUiuxStatus(cwd);

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

Governança:
  Clarificações abertas: ${governance.clarifications.open}
  Aprovações registradas: ${governance.approvals.total}
  Mudanças de escopo abertas: ${governance.scope.openChanges}
  Backlog registrado: ${governance.backlog.total}

Quality:
  Revisões registradas: ${gates.quality.total}
  Falhas abertas: ${gates.quality.failedOpen}

Audit:
  Auditorias registradas: ${gates.audit.total}
  BLOCKER abertos: ${gates.audit.blockerOpen}
  HIGH/CRITICAL abertos: ${gates.audit.highCriticalOpen}

Docs:
  Checks registrados: ${gates.docs.total}
  Pendências documentais: ${gates.docs.pending}

Blockers:
  Abertos: ${gates.blockers.open}
  Resolvidos: ${gates.blockers.resolved}

Skills:
  Candidatas: ${skills.candidates}
  Aprovadas: ${skills.approved}
  Instaladas localmente: ${skills.installedLocal}
  Usadas: ${skills.used}

UI/UX:
  Aplicável: ${uiux.applicable ? "Sim" : "Não"}
  Design system: ${formatMixedGate(uiux.designSystem)}
  Acessibilidade: ${formatMixedGate(uiux.accessibility)}
  SEO: ${formatMixedGate(uiux.seo)}
  Responsividade: ${formatMixedGate(uiux.responsiveness)}
  Performance: ${formatMixedGate(uiux.performance)}
  Bloqueios: ${uiux.blockers.length}

Implementação:
  Pronta: ${implementReadiness.ready ? "Sim" : "Não"}
  Bloqueios:
${formatBlockers(implementReadiness.blockers)}

Implement Guard:
  Status: ${formatImplementGuardStatus(implementGuard.latestStatus)}
  Test gates: ${implementGuard.testGates}
  Código alterado pelo implement: ${implementGuard.codeChanged ? "Sim" : "Não"}
  Próxima ação: ${implementGuard.nextAction}

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

function formatBlockers(blockers: string[]): string {
  return blockers.length > 0 ? blockers.map((blocker) => `    - ${blocker}`).join("\n") : "    - Nenhum";
}

function formatImplementGuardStatus(status: string): string {
  if (status === "not-started") return "Não iniciado";
  if (status === "ready") return "Pronto para autorização";
  return "Bloqueado";
}

function formatMixedGate(value: boolean | "not-applicable" | "recommended"): string {
  if (value === "not-applicable") return "not-applicable";
  if (value === "recommended") return "Recomendado";
  return value ? "OK" : "Pendente";
}
