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
import type { DoctorCheck, DoctorReport, DoctorStatus } from "./doctor-types.js";

export function runDoctor(cwd: string): DoctorReport {
  const internal = checkInternalStructure(cwd);
  const publicDocs = checkPublicDocs(cwd);
  const agents = checkAgents(cwd);
  const templates = checkTemplates(cwd);
  const gitignore = checkGitignore(cwd);
  const security = checkSensitiveFiles(cwd);
  const git = getGitInfo(cwd);
  const checks = [
    internal,
    publicDocs,
    agents,
    templates.check,
    gitignore,
    security.check,
    git.check
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
