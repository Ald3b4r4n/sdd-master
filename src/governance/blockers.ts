import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { getGateStatus } from "../gates/gate-state.js";
import { getWorkflowStatus } from "../workflow/workflow-runner.js";
import { getGovernanceStatus } from "./governance-state.js";
import type { ImplementReadiness } from "./governance-types.js";

const requiredApprovals = ["discovery", "requirements", "spec", "plan", "tasks"];

export function getImplementReadiness(cwd: string): ImplementReadiness {
  const workflow = getWorkflowStatus(cwd);
  const governance = getGovernanceStatus(cwd);
  const gates = getGateStatus(cwd);
  const blockers: string[] = [];

  if (!workflow.discovery) blockers.push("Discovery não criado");
  if (!workflow.requirements) blockers.push("Requirements não criados");
  if (!workflow.spec) blockers.push("Spec não criada");
  if (!workflow.plan) blockers.push("Plan não criado");
  if (!workflow.tasks) blockers.push("Tasks não criadas");
  if (governance.clarifications.open > 0) blockers.push("Clarificações abertas");
  if (governance.scope.openChanges > 0) blockers.push("Mudanças de escopo abertas");

  for (const target of requiredApprovals) {
    if (!governance.approvals.approvedTargets.includes(target)) {
      blockers.push(`Aprovação de ${target} pendente`);
    }
  }

  if (governance.approvals.rejectedTargets.length > 0) {
    blockers.push(`Aprovação rejeitada: ${governance.approvals.rejectedTargets.join(", ")}`);
  }

  if (gates.blockers.open > 0) blockers.push("Blockers ativos");
  if (gates.audit.blockerOpen > 0) blockers.push("Auditoria BLOCKER aberta");
  if (gates.audit.highCriticalOpen > 0) blockers.push("Auditoria HIGH/CRITICAL aberta");
  if (gates.quality.failedOpen > 0) blockers.push("Quality review failed aberta");
  if (gates.docs.pending > 0) blockers.push("Documentação desatualizada");

  return {
    ready: blockers.length === 0,
    blockers
  };
}

function countActiveBlockers(cwd: string): number {
  const directory = join(cwd, ".sdd-master", "blockers");

  if (!existsSync(directory)) {
    return 0;
  }

  return readdirSync(directory).filter((file) => {
    if (!file.startsWith("BLOCKER-") || !file.endsWith(".md")) return false;
    const content = readFileSync(join(directory, file), "utf8");
    return !content.includes("## Status\nResolvido") && !content.includes("## Status\nAceito");
  }).length;
}
