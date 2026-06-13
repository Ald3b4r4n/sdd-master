import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { runGitSecurityCheck } from "../git/git-checks.js";
import { getExtensionStatus } from "../extensions/extension-state.js";
import { getAdvancedSecurityState } from "../security/security-readiness.js";
import { getImplementReadiness } from "../governance/blockers.js";
import { getGovernanceStatus } from "../governance/governance-state.js";
import { getPluginStatus } from "../plugins/plugin-registry.js";
import { getSkillStatus } from "../skills/skill-registry.js";
import { getUiuxStatus } from "../uiux/uiux-gates.js";
import { getWorkflowStatus } from "../workflow/workflow-runner.js";
import type { AssistedImplementStatus, ImplementGate, ImplementStatus } from "./implement-types.js";
import { getTestGateStatus } from "./test-gates.js";

export function getImplementationReadiness(cwd: string, task = "TASK-001"): {
  ready: boolean;
  blockers: string[];
  gates: ImplementGate[];
} {
  const base = getImplementReadiness(cwd);
  const workflow = getWorkflowStatus(cwd);
  const governance = getGovernanceStatus(cwd);
  const testGates = getTestGateStatus(cwd, task);
  const gitSecurity = runGitSecurityCheck(cwd, "default");
  const uiux = getUiuxStatus(cwd);
  const skills = getSkillStatus(cwd);
  const plugins = getPluginStatus(cwd);
  const extensions = getExtensionStatus(cwd);
  const security = getAdvancedSecurityState(cwd);
  const blockers = [...base.blockers, ...testGates.reasons, ...uiux.blockers];

  if (gitSecurity.status === "blocked") {
    blockers.push("Git/Security bloqueado");
  }
  blockers.push(...extensions.blockers);
  blockers.push(...security.blockers);

  const gates: ImplementGate[] = [
    gate("Discovery", workflow.discovery, ".sdd-master/discovery/initial-discovery.md"),
    gate("Requirements", workflow.requirements, ".sdd-master/requirements/requirements-index.md"),
    gate("Spec", workflow.spec, ".sdd-master/specs/phase-01-spec.md"),
    gate("Plan", workflow.plan, ".sdd-master/plans/phase-01-plan.md"),
    gate("Tasks", workflow.tasks, ".sdd-master/tasks/phase-01-tasks.md"),
    gate("Approvals", allApprovalsPresent(governance.approvals.approvedTargets), "Aprovações discovery/requirements/spec/plan/tasks"),
    gate("Clarifications", governance.clarifications.open === 0, `${governance.clarifications.open} aberta(s)`),
    gate("Scope changes", governance.scope.openChanges === 0, `${governance.scope.openChanges} aberta(s)`),
    gate("Quality", !base.blockers.includes("Quality review failed aberta"), "Sem quality failed aberta"),
    gate("Audit", !base.blockers.some((item) => item.startsWith("Auditoria")), "Sem auditoria HIGH/CRITICAL/BLOCKER aberta"),
    gate("Docs", !base.blockers.includes("Documentação desatualizada"), "Sem docs missing/outdated"),
    gate("Blockers", !base.blockers.includes("Blockers ativos"), "Nenhum blocker ativo"),
    gate("UI/UX", uiux.applicable ? uiux.uiuxApproved : true, uiux.applicable ? `Perfil ${uiux.profile}` : "not-applicable"),
    gate("Design system", uiux.applicable ? uiux.designSystem : true, uiux.applicable ? ".sdd-master/uiux/design-system.md" : "not-applicable"),
    gate("Accessibility", uiux.applicable ? uiux.accessibility : true, uiux.applicable ? ".sdd-master/uiux/accessibility-checklist.md" : "not-applicable"),
    mixedGate("SEO", uiux.seo, ".sdd-master/uiux/seo-checklist.md"),
    mixedGate("Responsiveness", uiux.responsiveness, ".sdd-master/uiux/responsiveness-checklist.md"),
    mixedGate("Performance", uiux.performance, ".sdd-master/uiux/performance-checklist.md"),
    gate("Skills usage report", skills.used === 0 || skills.usageReports > 0, `${skills.usageReports} relatório(s) para ${skills.used} skill(s) usada(s)`),
    gate("Plugins usage report", plugins.used === 0 || plugins.usageReports > 0, `${plugins.usageReports} relatório(s) para ${plugins.used} plugin(s) usado(s)`),
    gate("Extension policy", extensions.policy === "OK" || extensions.status === "not-started", extensions.policy),
    gate("Extension approvals", extensions.unapprovedUsed === 0, `${extensions.unapprovedUsed} extensão(ões) usada(s) sem aprovação`),
    gate("Extension supply chain", extensions.unauditedRemoteUsed === 0, `${extensions.unauditedRemoteUsed} origem(ns) remota(s) usada(s) sem auditoria`),
    gate("Advanced security", security.status !== "blocked", security.status),
    gate("Test gates", testGates.ok, testGates.evidence),
    gate("Security/Git", gitSecurity.status !== "blocked", gitSecurity.recommendation)
  ];

  return {
    ready: blockers.length === 0,
    blockers: Array.from(new Set(blockers)),
    gates
  };
}

export function getImplementGuardStatus(cwd: string): ImplementStatus {
  const directory = join(cwd, ".sdd-master", "implementation");

  if (!existsSync(directory)) {
    return {
      hasRecords: false,
      latestStatus: "not-started",
      testGates: "not-started",
      codeChanged: false,
      nextAction: "sdd master implement --dry-run"
    };
  }

  const files = readdirSync(directory).filter((file) => file.startsWith("IMPLEMENT-") && file.endsWith(".md"));
  const latest = files.sort().at(-1);

  if (!latest) {
    return {
      hasRecords: false,
      latestStatus: "not-started",
      testGates: "not-started",
      codeChanged: false,
      nextAction: "sdd master implement --dry-run"
    };
  }

  const content = readFileSync(join(directory, latest), "utf8");
  const blocked = content.includes("## Status\nBloqueado");
  const testsOk = content.includes("| Test gates | OK |");

  return {
    hasRecords: true,
    latestStatus: blocked ? "blocked" : "ready",
    testGates: testsOk ? "OK" : "Pendente",
    codeChanged: false,
    nextAction: blocked ? "Resolver bloqueios listados em implementation." : "Solicitar aprovação humana para implementação real."
  };
}

export function getAssistedImplementStatus(cwd: string): AssistedImplementStatus {
  const implementationDir = join(cwd, ".sdd-master", "implementation");
  const sessionsDir = join(implementationDir, "sessions");
  const manifestsDir = join(implementationDir, "manifests");
  const contractsDir = join(implementationDir, "test-contracts");
  const handoffsDir = join(implementationDir, "handoffs");

  if (!existsSync(sessionsDir)) {
    return {
      latestSession: "não iniciado",
      status: "not-started",
      handoff: "not-started",
      testContract: "not-started",
      manifest: "not-started",
      codeChanged: false,
      humanApproval: "not-started",
      forbiddenPolicy: "not-started"
    };
  }

  const latestSession = latestFile(sessionsDir, "IMPLEMENT-SESSION-");
  if (!latestSession) {
    return {
      latestSession: "não iniciado",
      status: "not-started",
      handoff: "not-started",
      testContract: "not-started",
      manifest: "not-started",
      codeChanged: false,
      humanApproval: "not-started",
      forbiddenPolicy: "not-started"
    };
  }

  const content = readFileSync(join(sessionsDir, latestSession), "utf8");
  const status = content.includes("## Status\nBloqueada") ? "blocked" : "prepared";
  const forbiddenPolicy =
    content.includes(".env") && content.includes(".sdd-master/**") ? "OK" : "missing";

  return {
    latestSession: latestSession.replace(".md", ""),
    status,
    handoff: latestFile(handoffsDir, "AGENT-HANDOFF-") ? "created" : "missing",
    testContract: latestFile(contractsDir, "TEST-CONTRACT-") ? "created" : "missing",
    manifest: latestFile(manifestsDir, "CHANGE-MANIFEST-") ? "created" : "missing",
    codeChanged: false,
    humanApproval: "Pendente",
    forbiddenPolicy
  };
}

function gate(name: string, ok: boolean, evidence: string): ImplementGate {
  return {
    gate: name,
    status: ok ? "OK" : "Pendente",
    evidence
  };
}

function mixedGate(name: string, value: boolean | "not-applicable" | "recommended", evidence: string): ImplementGate {
  if (value === "not-applicable") {
    return { gate: name, status: "not-applicable", evidence: "not-applicable" };
  }

  if (value === "recommended") {
    return { gate: name, status: "Recomendado", evidence };
  }

  return gate(name, value, evidence);
}

function allApprovalsPresent(approvedTargets: string[]): boolean {
  return ["discovery", "requirements", "spec", "plan", "tasks"].every((target) => approvedTargets.includes(target));
}

function latestFile(directory: string, prefix: string): string | undefined {
  if (!existsSync(directory)) return undefined;
  return readdirSync(directory)
    .filter((file) => file.startsWith(prefix) && file.endsWith(".md"))
    .sort()
    .at(-1);
}
