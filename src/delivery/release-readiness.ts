import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { getGateStatus } from "../gates/gate-state.js";
import { runGitSecurityCheck } from "../git/git-checks.js";
import { getAdvancedSecurityState } from "../security/security-readiness.js";
import { getGovernanceStatus } from "../governance/governance-state.js";
import { getImplementGuardStatus, getImplementationReadiness } from "../implementation/implement-readiness.js";
import { getUiuxStatus } from "../uiux/uiux-gates.js";
import { getWorkflowStatus } from "../workflow/workflow-runner.js";
import type { DeliveryGate, ReleaseOptions, ReleaseReadiness } from "./delivery-types.js";

export function getReleaseReadiness(cwd: string, options: ReleaseOptions): ReleaseReadiness {
  const workflow = getWorkflowStatus(cwd);
  const governance = getGovernanceStatus(cwd);
  const gates = getGateStatus(cwd);
  const implement = getImplementationReadiness(cwd, "TASK-001");
  const implementGuard = getImplementGuardStatus(cwd);
  const uiux = getUiuxStatus(cwd);
  const git = runGitSecurityCheck(cwd, "pre-push");
  const security = getAdvancedSecurityState(cwd);
  const releaseNotesRequired = options.type !== "local";
  const hasReleaseNotes = existsSync(join(cwd, "releases", `github-v${options.version}-notes.md`));

  const gateRows: DeliveryGate[] = [
    gate("Workflow", workflow.discovery && workflow.requirements && workflow.spec && workflow.plan && workflow.tasks, "Discovery -> tasks"),
    gate("Approvals", governance.approvals.approvedTargets.length > 0, `${governance.approvals.total} aprovações registradas`),
    gate("Clarifications", governance.clarifications.open === 0, `${governance.clarifications.open} abertas`),
    gate("Scope", governance.scope.openChanges === 0, `${governance.scope.openChanges} mudanças abertas`),
    gate("Quality", gates.quality.failedOpen === 0 && gates.quality.total > 0, `${gates.quality.failedOpen} falhas abertas`),
    gate(
      "Audit",
      gates.audit.blockerOpen === 0 && gates.audit.highCriticalOpen === 0 && gates.audit.total > 0,
      `${gates.audit.blockerOpen} BLOCKER, ${gates.audit.highCriticalOpen} HIGH/CRITICAL`
    ),
    gate("Docs", gates.docs.pending === 0 && gates.docs.total > 0, `${gates.docs.pending} pendências`),
    gate("Blockers", gates.blockers.open === 0, `${gates.blockers.open} abertos`),
    gate("Implement Guard", implement.ready && implementGuard.latestStatus !== "blocked", implementGuard.latestStatus),
    gate("Test Gates", implementGuard.testGates === "OK", implementGuard.testGates),
    uiux.applicable ? gate("UI/UX", uiux.blockers.length === 0, `${uiux.blockers.length} bloqueios`) : naGate("UI/UX", "Perfil sem UI visual obrigatória"),
    gate("Security/Git", git.status !== "blocked", git.status),
    gate("Advanced Security", security.status !== "blocked", security.status),
    gate("Package Check", existsSync(join(cwd, "package.json")), "package.json presente"),
    options.type === "npm" || options.type === "full" ? pendingGate("npm Dry-run", "Dry-run npm deve ser executado manualmente") : naGate("npm Dry-run", "Não exigido para release local"),
    releaseNotesRequired ? gate("GitHub Release Notes", hasReleaseNotes, `releases/github-v${options.version}-notes.md`) : naGate("GitHub Release Notes", "Recomendado para release local")
  ];
  const blockers = [
    gates.blockers.open > 0 ? "Blocker ativo aberto." : "",
    gates.audit.blockerOpen > 0 || gates.audit.highCriticalOpen > 0 ? "Auditoria BLOCKER/CRITICAL/HIGH aberta." : "",
    gates.quality.failedOpen > 0 ? "Quality failed aberta." : "",
    gates.docs.pending > 0 ? "Docs missing/outdated aberto." : "",
    governance.clarifications.open > 0 ? "Clarificação aberta." : "",
    governance.scope.openChanges > 0 ? "Mudança de escopo aberta." : "",
    !implement.ready || implementGuard.latestStatus === "blocked" ? "Implement guard bloqueado." : "",
    implementGuard.testGates !== "OK" ? "Testes obrigatórios não definidos." : "",
    git.status === "blocked" ? "sdd master git --pre-push blocked." : "",
    security.status === "blocked" ? security.blockers.join(" ") : "",
    git.security.forbiddenFiles.some((file) => file === ".env" || file.startsWith(".env.")) ? ".env real detectado." : "",
    git.security.suspectedSecrets.length > 0 ? "Segredo detectado." : "",
    existsSync(join(cwd, ".sdd-master")) && isPackageRoot(cwd) ? ".sdd-master/ na raiz do pacote." : "",
    releaseNotesRequired && !hasReleaseNotes ? "Release notes ausentes para release real." : ""
  ].filter(Boolean);

  return {
    ready: blockers.length === 0,
    status: blockers.length === 0 ? "ready" : "blocked",
    gates: gateRows,
    blockers,
    actions: blockers.length === 0 ? ["Solicitar aprovação humana para release real."] : blockers.map(toAction)
  };
}

function gate(gateName: string, ok: boolean, evidence: string): DeliveryGate {
  return { gate: gateName, status: ok ? "OK" : "Pendente", evidence };
}

function pendingGate(gateName: string, evidence: string): DeliveryGate {
  return { gate: gateName, status: "Pendente", evidence };
}

function naGate(gateName: string, evidence: string): DeliveryGate {
  return { gate: gateName, status: "Não aplicável", evidence };
}

function isPackageRoot(cwd: string): boolean {
  const packagePath = join(cwd, "package.json");
  if (!existsSync(packagePath)) return false;

  try {
    return JSON.parse(readFileSync(packagePath, "utf8")).name === "sdd-master";
  } catch {
    return false;
  }
}

function toAction(blocker: string): string {
  return `Corrigir antes da release real: ${blocker}`;
}

export function nextDeliveryId(cwd: string, directory: string, prefix: string): string {
  const fullPath = join(cwd, directory);
  const next = existsSync(fullPath)
    ? readdirSync(fullPath)
        .filter((file) => file.startsWith(prefix) && file.endsWith(".md"))
        .map((file) => Number(file.replace(prefix, "").replace(".md", "")))
        .filter((value) => Number.isInteger(value))
        .reduce((max, value) => Math.max(max, value), 0) + 1
    : 1;

  return `${prefix}${String(next).padStart(3, "0")}`;
}
