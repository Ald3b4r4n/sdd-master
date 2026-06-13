import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { getGateStatus } from "../gates/gate-state.js";
import { runGitSecurityCheck } from "../git/git-checks.js";
import type { DeliveryGate, DeployOptions, DeployReadiness } from "./delivery-types.js";

export function getDeployReadiness(cwd: string, options: DeployOptions): DeployReadiness {
  const gates = getGateStatus(cwd);
  const git = runGitSecurityCheck(cwd, "pre-push");
  const releaseBlocked = latestReleaseBlocked(cwd);
  const rollbackDocumented = existsSync(join(cwd, ".sdd-master", "rollback")) || existsSync(join(cwd, "docs", "03-codigo", "release-deploy-guards.md"));
  const deployDocs = existsSync(join(cwd, "docs", "03-codigo"));
  const envVars = ["NODE_ENV", "APP_ENV"];
  const secrets = ["DEPLOY_TOKEN"];
  const envValuesDetected = hasEnvValueLeak(cwd);

  const gateRows: DeliveryGate[] = [
    gate("Release Guard", !releaseBlocked, releaseBlocked ? "Último release guard bloqueado" : "Sem release guard bloqueado"),
    gate("Security/Git", git.status !== "blocked", git.status),
    gate("Env Vars", !envValuesDetected, "Nomes registrados sem valores"),
    gate("Secrets", git.security.suspectedSecrets.length === 0, `${git.security.suspectedSecrets.length} suspeitos`),
    naGate("Database", "Não declarado neste guard"),
    gate("Rollback", rollbackDocumented, rollbackDocumented ? "Documentado" : "Ausente"),
    gate("Observability", deployDocs, deployDocs ? "Documentação técnica presente" : "Ausente"),
    naGate("Backup", "Não declarado neste guard"),
    gate("Documentation", deployDocs, deployDocs ? "docs/03-codigo presente" : "Ausente"),
    pendingGate("Human Approval", "Pendente")
  ];
  const blockers = [
    options.environment === "production" ? "Deploy production exige aprovação humana explícita." : "",
    gates.blockers.open > 0 ? "Blocker ativo aberto." : "",
    releaseBlocked ? "Release guard bloqueado." : "",
    !rollbackDocumented ? "Rollback não documentado." : "",
    envValuesDetected ? "Env vars com valores reais detectadas." : "",
    git.security.suspectedSecrets.length > 0 ? "Segredos detectados." : "",
    git.security.forbiddenFiles.some((file) => file === ".env" || file.startsWith(".env.")) ? ".env real detectado." : "",
    !deployDocs ? "Documentação de deploy ausente." : "",
    git.status === "blocked" ? "sdd master git --pre-push blocked." : ""
  ].filter(Boolean);

  return {
    ready: blockers.length === 0,
    status: blockers.length === 0 ? "ready" : "blocked",
    gates: gateRows,
    blockers,
    actions: blockers.length === 0 ? ["Solicitar aprovação humana para deploy real."] : blockers.map(toAction),
    envVars,
    secrets
  };
}

function latestReleaseBlocked(cwd: string): boolean {
  const path = join(cwd, ".sdd-master", "releases", "release-index.md");
  if (!existsSync(path)) return false;

  return readFileSync(path, "utf8").includes("Bloqueado");
}

function hasEnvValueLeak(cwd: string): boolean {
  const path = join(cwd, ".sdd-master", "deliveries", "env-vars.md");
  if (!existsSync(path)) return false;

  return readFileSync(path, "utf8")
    .split(/\r?\n/)
    .some((line) => /^[A-Z0-9_]+\s*=.+/.test(line.trim()));
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

function toAction(blocker: string): string {
  return `Corrigir antes do deploy real: ${blocker}`;
}
