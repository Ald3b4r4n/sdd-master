export type DoctorStatus = "healthy" | "warning" | "broken";
export type DoctorCheckStatus = "pass" | "warn" | "fail";

export type DoctorCheck = {
  id: string;
  label: string;
  status: DoctorCheckStatus;
  details: string[];
};

export type DoctorProjectState = {
  projectName?: string;
  language?: string;
  agent?: string;
  currentPhase?: string;
  nextCommand?: string;
  maturity?: string;
  stage?: string;
};

export type DoctorGitInfo = {
  isRepository: boolean;
  branch?: string;
  hasRemote: boolean;
};

export type DoctorSecurityInfo = {
  hasRealEnv: boolean;
  sensitiveFiles: string[];
};

export type DoctorTemplateInfo = {
  count: number;
  hasMinimumTemplates: boolean;
};

export type DoctorAgentInfo = {
  files: string[];
  hasSkillsDirectory: boolean;
  hasProjectStateBlock: boolean;
};

export type DoctorWorkflowInfo = {
  discovery: boolean;
  requirements: boolean;
  spec: boolean;
  plan: boolean;
  tasks: boolean;
  nextCommand: string;
};

export type DoctorGovernanceInfo = {
  clarifications: {
    total: number;
    open: number;
    resolved: number;
  };
  approvals: {
    total: number;
    approvedTargets: string[];
    rejectedTargets: string[];
    pendingTargets: string[];
  };
  scope: {
    approvedItems: number;
    outOfScopeItems: number;
    openChanges: number;
  };
  backlog: {
    total: number;
  };
};

export type DoctorImplementReadinessInfo = {
  ready: boolean;
  blockers: string[];
};

export type DoctorSkillInfo = {
  candidates: number;
  approved: number;
  installedLocal: number;
  used: number;
  usageReports: number;
};

export type DoctorUiuxInfo = {
  applicable: boolean;
  profile: string;
  uiuxApproved: boolean;
  designSystem: boolean;
  accessibility: boolean;
  seo: boolean | "not-applicable";
  responsiveness: boolean | "not-applicable";
  performance: boolean | "recommended";
  blockers: string[];
};

export type DoctorUpdateInfo = {
  installedVersion: string;
  templateVersion: string;
  lastUpdate: string;
  latestBackup: string;
  conflicts: number;
  missingMetadata: boolean;
};

export type DoctorGateInfo = {
  quality: {
    total: number;
    failedOpen: number;
    warnings: number;
  };
  audit: {
    total: number;
    blockerOpen: number;
    highCriticalOpen: number;
  };
  docs: {
    total: number;
    pending: number;
    publicAxesPresent: boolean;
  };
  blockers: {
    total: number;
    open: number;
    resolved: number;
  };
};

export type DoctorImplementGuardInfo = {
  hasRecords: boolean;
  latestStatus: "not-started" | "blocked" | "ready";
  testGates: "not-started" | "OK" | "Pendente";
  codeChanged: false;
  nextAction: string;
};

export type DoctorReport = {
  status: DoctorStatus;
  checks: DoctorCheck[];
  projectState: DoctorProjectState;
  git: DoctorGitInfo;
  security: DoctorSecurityInfo;
  templates: DoctorTemplateInfo;
  agents: DoctorAgentInfo;
  workflow: DoctorWorkflowInfo;
  governance: DoctorGovernanceInfo;
  gates: DoctorGateInfo;
  skills: DoctorSkillInfo;
  uiux: DoctorUiuxInfo;
  update: DoctorUpdateInfo;
  implementReadiness: DoctorImplementReadinessInfo;
  implementGuard: DoctorImplementGuardInfo;
  gitSecurity: {
    status: "clean" | "warning" | "blocked";
    forbiddenFiles: string[];
    suspectedSecrets: number;
    gitignoreMissingEntries: string[];
    internalFilesStaged: string[];
  };
  recommendation: string;
};
