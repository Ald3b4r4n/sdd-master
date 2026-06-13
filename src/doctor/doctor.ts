import {
  checkAgents,
  checkGates,
  checkGitignore,
  checkGovernance,
  checkImplementGuard,
  checkImplementReadiness,
  checkDelivery,
  checkInternalStructure,
  checkPublicDocs,
  checkSkills,
  checkSensitiveFiles,
  checkTemplates,
  checkUiux,
  checkUpdate,
  checkWorkflow,
  getGitInfo,
  readProjectState
} from "./doctor-checks.js";
import { runGitSecurityCheck } from "../git/git-checks.js";
import type { DoctorCheck, DoctorReport, DoctorStatus } from "./doctor-types.js";

export function runDoctor(cwd: string): DoctorReport {
  const internal = checkInternalStructure(cwd);
  const publicDocs = checkPublicDocs(cwd);
  const agents = checkAgents(cwd);
  const templates = checkTemplates(cwd);
  const gitignore = checkGitignore(cwd);
  const workflow = checkWorkflow(cwd);
  const governance = checkGovernance(cwd);
  const gates = checkGates(cwd);
  const skills = checkSkills(cwd);
  const uiux = checkUiux(cwd);
  const update = checkUpdate(cwd);
  const implementReadiness = checkImplementReadiness(cwd);
  const implementGuard = checkImplementGuard(cwd);
  const delivery = checkDelivery(cwd);
  const security = checkSensitiveFiles(cwd);
  const git = getGitInfo(cwd);
  const gitSecurity = runGitSecurityCheck(cwd, "default");
  const gitSecurityCheck: DoctorCheck = {
    id: "git-security",
    label: "Git/Security",
    status: gitSecurity.status === "blocked" ? "fail" : gitSecurity.status === "warning" ? "warn" : "pass",
    details: [
      ...gitSecurity.security.forbiddenFiles.map((file) => `Arquivo sensível: ${file}`),
      ...gitSecurity.security.suspectedSecrets.map(
        (finding) => `Segredo suspeito: ${finding.file}:${finding.line} (${finding.type})`
      ),
      ...gitSecurity.security.gitignore.missingEntries.map((entry) => `.gitignore ausente: ${entry}`),
      ...gitSecurity.sddMaster.internalFilesStaged.map((file) => `.sdd-master staged: ${file}`)
    ]
  };
  const checks = [
    internal,
    publicDocs,
    agents.check,
    templates.check,
    workflow.check,
    governance.check,
    gates.check,
    skills.check,
    uiux.check,
    update.check,
    implementReadiness.check,
    implementGuard.check,
    delivery.check,
    gitignore,
    security.check,
    git.check,
    gitSecurityCheck
  ];
  const projectState = readProjectState(cwd);
  const status = getOverallStatus(checks);
  const recommendation = status === "broken" ? "sdd master init" : "/sdd-master-discovery";

  return {
    status,
    checks,
    projectState,
    git: git.info,
    security: security.info,
    templates: templates.info,
    agents: agents.info,
    workflow: workflow.info,
    governance: governance.info,
    gates: gates.info,
    skills: skills.info,
    uiux: uiux.info,
    update: update.info,
    implementReadiness: implementReadiness.info,
    implementGuard: implementGuard.info,
    delivery: delivery.info,
    gitSecurity: {
      status: gitSecurity.status,
      forbiddenFiles: gitSecurity.security.forbiddenFiles,
      suspectedSecrets: gitSecurity.security.suspectedSecrets.length,
      gitignoreMissingEntries: gitSecurity.security.gitignore.missingEntries,
      internalFilesStaged: gitSecurity.sddMaster.internalFilesStaged
    },
    recommendation
  };
}

function getOverallStatus(checks: DoctorCheck[]): DoctorStatus {
  if (checks.some((check) => check.status === "fail")) {
    return "broken";
  }

  if (checks.some((check) => check.status === "warn")) {
    return "warning";
  }

  return "healthy";
}
