import type { DoctorReport } from "./doctor-types.js";

export function formatDoctorJson(report: DoctorReport): string {
  return `${JSON.stringify(report, null, 2)}\n`;
}

export function formatDoctorText(report: DoctorReport): string {
  if (report.security.hasRealEnv) {
    return formatEnvFailure(report);
  }

  if (report.status === "broken" && hasMissingSddMaster(report)) {
    return `SDD Master — Doctor

Status geral:
  broken

Problema principal:
  Estrutura .sdd-master/ não encontrada.

Próximo passo recomendado:
  sdd master init
`;
  }

  return `SDD Master — Doctor

Status geral:
  ${report.status}

Instalação:
  .sdd-master/: ${formatPathStatus(report, ".sdd-master")}
  constitution.md: ${formatPathStatus(report, ".sdd-master/constitution.md")}
  project-state.md: ${formatPathStatus(report, ".sdd-master/project-state.md")}

Documentação pública:
  docs/01-negocio-requisitos/: ${formatPathStatus(report, "docs/01-negocio-requisitos")}
  docs/02-tecnica-arquitetura/: ${formatPathStatus(report, "docs/02-tecnica-arquitetura")}
  docs/03-codigo/: ${formatPathStatus(report, "docs/03-codigo")}

Templates:
  .sdd-master/templates/: ${formatPathStatus(report, ".sdd-master/templates")}
  Templates encontrados: ${report.templates.count}
  Templates mínimos: ${report.templates.hasMinimumTemplates ? "OK" : "Falha"}

Segurança:
  .env real detectado: ${report.security.hasRealEnv ? "Sim" : "Não"}
  Arquivos sensíveis detectados: ${report.security.sensitiveFiles.length > 0 ? "Sim" : "Não"}
  .gitignore: ${getCheckStatus(report, "gitignore") === "pass" ? "OK" : "Atenção"}

Git:
  Repositório Git: ${report.git.isRepository ? "Sim" : "Não"}
  Branch atual: ${report.git.branch ?? "não detectado"}
  Remoto configurado: ${report.git.hasRemote ? "Sim" : "Não"}

Workflow inicial:
  Discovery: ${report.workflow.discovery ? "OK" : "Não iniciado"}
  Requirements: ${report.workflow.requirements ? "OK" : "Não iniciado"}
  Spec: ${report.workflow.spec ? "OK" : "Não iniciado"}
  Plan: ${report.workflow.plan ? "OK" : "Não iniciado"}
  Tasks: ${report.workflow.tasks ? "OK" : "Não iniciado"}

Governança:
  Clarificações abertas: ${report.governance.clarifications.open}
  Aprovações registradas: ${report.governance.approvals.total}
  Mudanças de escopo abertas: ${report.governance.scope.openChanges}
  Backlog registrado: ${report.governance.backlog.total}

Quality:
  Revisões registradas: ${report.gates.quality.total}
  Falhas abertas: ${report.gates.quality.failedOpen}

Audit:
  Auditorias registradas: ${report.gates.audit.total}
  BLOCKER abertos: ${report.gates.audit.blockerOpen}
  HIGH/CRITICAL abertos: ${report.gates.audit.highCriticalOpen}

Docs:
  Checks registrados: ${report.gates.docs.total}
  Pendências documentais: ${report.gates.docs.pending}

Blockers:
  Abertos: ${report.gates.blockers.open}
  Resolvidos: ${report.gates.blockers.resolved}

Skills:
  Candidatas: ${report.skills.candidates}
  Aprovadas: ${report.skills.approved}
  Instaladas localmente: ${report.skills.installedLocal}
  Usadas: ${report.skills.used}

Plugins:
  Candidatas: ${report.plugins.candidates}
  Aprovadas: ${report.plugins.approved}
  Instaladas localmente: ${report.plugins.installedLocal}
  Usadas: ${report.plugins.used}

UI/UX:
  Aplicável: ${report.uiux.applicable ? "Sim" : "Não"}
  Design system: ${report.uiux.designSystem ? "OK" : "Pendente"}
  Acessibilidade: ${report.uiux.accessibility ? "OK" : "Pendente"}
  SEO: ${formatMixedGate(report.uiux.seo)}
  Responsividade: ${formatMixedGate(report.uiux.responsiveness)}
  Performance: ${formatMixedGate(report.uiux.performance)}

Update:
  Versão instalada: ${report.update.installedVersion}
  Versão dos templates: ${report.update.templateVersion}
  Último update: ${report.update.lastUpdate}
  Backup mais recente: ${report.update.latestBackup}
  Conflitos de update: ${report.update.conflicts}

Release Guard:
  Último plano: ${report.delivery.release.latestPlan}
  Status: ${formatDeliveryStatus(report.delivery.release.status)}
  Bloqueios: ${report.delivery.release.blockers}

Deploy Guard:
  Último plano: ${report.delivery.deploy.latestPlan}
  Ambiente: ${report.delivery.deploy.environment}
  Status: ${formatDeliveryStatus(report.delivery.deploy.status)}
  Bloqueios: ${report.delivery.deploy.blockers}

Implementação:
  Pronta: ${report.implementReadiness.ready ? "Sim" : "Não"}
  Bloqueios:
${formatBlockers(report.implementReadiness.blockers)}

Implement Guard:
  Status: ${formatImplementGuardStatus(report.implementGuard.latestStatus)}
  Test gates: ${report.implementGuard.testGates}
  Código alterado pelo implement: ${report.implementGuard.codeChanged ? "Sim" : "Não"}
  Próxima ação: ${report.implementGuard.nextAction}

Implement Assistido:
  Última sessão: ${report.assistedImplement.latestSession}
  Status: ${formatAssistedImplementStatus(report.assistedImplement.status)}
  Handoff: ${report.assistedImplement.handoff}
  Test contract: ${report.assistedImplement.testContract}
  Manifest: ${report.assistedImplement.manifest}
  Código alterado: ${report.assistedImplement.codeChanged ? "Sim" : "Não"}
  Aprovação humana: ${report.assistedImplement.humanApproval}
  Política forbidden: ${report.assistedImplement.forbiddenPolicy}

Estado do projeto:
  Fase atual: ${report.projectState.currentPhase ?? "não detectado"}
  Próximo comando permitido: ${report.projectState.nextCommand ?? "não detectado"}
  Maturidade atual: ${report.projectState.maturity ?? "não detectado"}
  Estágio atual: ${report.projectState.stage ?? "não detectado"}

Próximo passo recomendado:
  ${report.recommendation}
`;
}

function formatEnvFailure(report: DoctorReport): string {
  return `SDD Master — Doctor

Status geral:
  broken

Falha crítica:
  Arquivo de ambiente real detectado.

Arquivos afetados:
${report.security.sensitiveFiles.map((file) => `  ${file}`).join("\n")}

Ação obrigatória:
  Remover o arquivo sensível do versionamento e manter apenas .env.example seguro.
`;
}

function hasMissingSddMaster(report: DoctorReport): boolean {
  return report.checks
    .find((check) => check.id === "internal-structure")
    ?.details.includes("Ausente: .sdd-master") === true;
}

function formatPathStatus(report: DoctorReport, path: string): string {
  return report.checks.some((check) => check.details.includes(`Ausente: ${path}`)) ? "Ausente" : "OK";
}

function getCheckStatus(report: DoctorReport, id: string): string {
  return report.checks.find((check) => check.id === id)?.status ?? "fail";
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
