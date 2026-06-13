import { existsSync } from "node:fs";
import { join } from "node:path";
import { getRecognizedAgentFiles } from "../../agents/agent-writer.js";
import { getGateStatus } from "../../gates/gate-state.js";
import { runGitSecurityCheck } from "../../git/git-checks.js";
import { getImplementReadiness } from "../../governance/blockers.js";
import { getDeliveryStatus } from "../../delivery/delivery-status.js";
import { getExtensionStatus } from "../../extensions/extension-state.js";
import { getAdvancedSecurityState } from "../../security/security-readiness.js";
import { getGovernanceStatus } from "../../governance/governance-state.js";
import { getAssistedImplementStatus, getImplementGuardStatus } from "../../implementation/implement-readiness.js";
import { getPluginStatus } from "../../plugins/plugin-registry.js";
import { getSkillStatus } from "../../skills/skill-registry.js";
import { getUiuxStatus } from "../../uiux/uiux-gates.js";
import { getUpdateStatus } from "../../update/update-state.js";
import { getWorkflowStatus } from "../../workflow/workflow-runner.js";
import { getPathSafetyState } from "../../filesystem/path-safety-state.js";
import { getOnboardingState } from "../../ux/onboarding.js";
import { getNextActions } from "../../ux/next-actions.js";

export function getStatusOutput(cwd: string, json = false): string {
  const hasSddMaster = existsSync(join(cwd, ".sdd-master"));

  if (hasSddMaster) {
    return getInstalledStatus(cwd, json);
  }

  if (json) {
    return `${JSON.stringify({
      command: "status",
      status: "not-started",
      summary: ["SDD Master não inicializado."],
      files: [],
      blockers: ["Estrutura .sdd-master ausente."],
      warnings: [],
      nextActions: getNextActions("status", { initialized: false }),
      onboarding: getOnboardingState(cwd)
    }, null, 2)}\n`;
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

function getInstalledStatus(cwd: string, json: boolean): string {
  const agentFiles = getRecognizedAgentFiles(cwd);
  const gitSecurity = runGitSecurityCheck(cwd, "default");
  const workflow = getWorkflowStatus(cwd);
  const governance = getGovernanceStatus(cwd);
  const gates = getGateStatus(cwd);
  const implementReadiness = getImplementReadiness(cwd);
  const implementGuard = getImplementGuardStatus(cwd);
  const assistedImplement = getAssistedImplementStatus(cwd);
  const plugins = getPluginStatus(cwd);
  const extensions = getExtensionStatus(cwd);
  const skills = getSkillStatus(cwd);
  const uiux = getUiuxStatus(cwd);
  const update = getUpdateStatus(cwd);
  const delivery = getDeliveryStatus(cwd);
  const advancedSecurity = getAdvancedSecurityState(cwd);
  const pathSafety = getPathSafetyState(cwd);
  const onboarding = getOnboardingState(cwd);
  const nextActions = onboarding.status === "not-started"
    ? [onboarding.nextStep, workflow.nextCommand.replace("/sdd-master-", "sdd master ")]
    : [workflow.nextCommand.replace("/sdd-master-", "sdd master ")];

  if (json) {
    return `${JSON.stringify({
      command: "status",
      status: implementReadiness.ready ? "ok" : "warning",
      summary: [
        `Workflow: ${workflow.nextCommand}`,
        `Implementação pronta: ${implementReadiness.ready ? "Sim" : "Não"}`
      ],
      files: [],
      blockers: implementReadiness.blockers,
      warnings: [],
      nextActions,
      onboarding,
      workflow,
      readiness: {
        discovery: !workflow.discovery,
        requirements: workflow.discovery && !workflow.requirements,
        tasks: workflow.plan && !workflow.tasks,
        implement: implementReadiness.ready,
        release: delivery.release.status === "ready"
      },
      pathSafety,
      gitSecurity,
      delivery
    }, null, 2)}\n`;
  }

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

Segurança:
  Builtin: ${advancedSecurity.builtin}
  Ferramentas externas: ${advancedSecurity.externalTools}
  Último relatório: ${advancedSecurity.lastReport}
  Última auditoria: ${advancedSecurity.lastAudit}
  Resultado: ${advancedSecurity.status}
  Redaction: ${advancedSecurity.redaction}

Path Safety:
  Plataforma: ${pathSafety.platform}
  Raiz do projeto: ${pathSafety.projectRoot}
  Caminhos inseguros: ${pathSafety.unsafePaths}
  Symlinks perigosos: ${pathSafety.dangerousSymlinks}
  Status: ${pathSafety.status}

Onboarding:
  Status: ${onboarding.status}
  Perfil: ${onboarding.profile}
  IA principal: ${onboarding.ai}
  Idioma: ${onboarding.language}
  Próximo passo: ${onboarding.nextStep}

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
  Skills usadas: ${skills.used}
  Skills sem aprovação: ${extensions.unapprovedUsed}
  Skills com origem remota: ${extensions.remoteSources}

Extensões:
  Plugins candidatos: ${plugins.candidates}
  Plugins aprovados: ${plugins.approved}
  Plugins instalados localmente: ${plugins.installedLocal}
  Plugins usados: ${plugins.used}
  Plugins bloqueados: ${plugins.blocked}
  Riscos supply chain: ${extensions.supplyChainRisks}
  Policy: ${extensions.policy}
  Registry: ${extensions.registry}

UI/UX:
  Aplicável: ${uiux.applicable ? "Sim" : "Não"}
  Design system: ${formatMixedGate(uiux.designSystem)}
  Acessibilidade: ${formatMixedGate(uiux.accessibility)}
  SEO: ${formatMixedGate(uiux.seo)}
  Responsividade: ${formatMixedGate(uiux.responsiveness)}
  Performance: ${formatMixedGate(uiux.performance)}
  Bloqueios: ${uiux.blockers.length}

Update:
  Versão instalada: ${update.installedVersion}
  Versão dos templates: ${update.templateVersion}
  Último update: ${update.lastUpdate}
  Backup mais recente: ${update.latestBackup}
  Conflitos de update: ${update.conflicts}

Release:
  Último plano: ${delivery.release.latestPlan}
  Status: ${formatDeliveryStatus(delivery.release.status)}
  Bloqueios: ${delivery.release.blockers}

Deploy:
  Último plano: ${delivery.deploy.latestPlan}
  Ambiente: ${delivery.deploy.environment}
  Status: ${formatDeliveryStatus(delivery.deploy.status)}
  Bloqueios: ${delivery.deploy.blockers}

Implementação:
  Pronta: ${implementReadiness.ready ? "Sim" : "Não"}
  Bloqueios:
${formatBlockers(implementReadiness.blockers)}

Implement Guard:
  Status: ${formatImplementGuardStatus(implementGuard.latestStatus)}
  Test gates: ${implementGuard.testGates}
  Código alterado pelo implement: ${implementGuard.codeChanged ? "Sim" : "Não"}
  Próxima ação: ${implementGuard.nextAction}

Implement Assistido:
  Última sessão: ${assistedImplement.latestSession}
  Status: ${formatAssistedImplementStatus(assistedImplement.status)}
  Handoff: ${assistedImplement.handoff}
  Test contract: ${assistedImplement.testContract}
  Manifest: ${assistedImplement.manifest}
  Código alterado: ${assistedImplement.codeChanged ? "Sim" : "Não"}
  Aprovação humana: ${assistedImplement.humanApproval}
  Política forbidden: ${assistedImplement.forbiddenPolicy}

Próximo comando recomendado:
  ${workflow.nextCommand}

Próximos passos:
${nextActions.map((action, index) => `  ${index + 1}. ${action}`).join("\n")}
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

function formatDeliveryStatus(status: string): string {
  if (status === "not-started") return "Não iniciado";
  if (status === "ready") return "Pronto para autorização";
  if (status === "blocked") return "Bloqueado";
  return "Registrado";
}

function formatAssistedImplementStatus(status: string): string {
  if (status === "not-started") return "Não iniciado";
  if (status === "blocked") return "Bloqueado";
  return "Preparada";
}
