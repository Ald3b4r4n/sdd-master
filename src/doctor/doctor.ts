import {
  checkAgents,
  checkGitignore,
  checkInternalStructure,
  checkPublicDocs,
  checkSensitiveFiles,
  checkTemplates,
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
