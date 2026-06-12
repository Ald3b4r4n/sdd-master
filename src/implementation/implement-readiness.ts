import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { runGitSecurityCheck } from "../git/git-checks.js";
import { getImplementReadiness } from "../governance/blockers.js";
import { getGovernanceStatus } from "../governance/governance-state.js";
import { getWorkflowStatus } from "../workflow/workflow-runner.js";
import type { ImplementGate, ImplementStatus } from "./implement-types.js";
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
  const blockers = [...base.blockers, ...testGates.reasons];

  if (gitSecurity.status === "blocked") {
    blockers.push("Git/Security bloqueado");
  }

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

function gate(name: string, ok: boolean, evidence: string): ImplementGate {
  return {
    gate: name,
    status: ok ? "OK" : "Pendente",
    evidence
  };
}

function allApprovalsPresent(approvedTargets: string[]): boolean {
  return ["discovery", "requirements", "spec", "plan", "tasks"].every((target) => approvedTargets.includes(target));
}
