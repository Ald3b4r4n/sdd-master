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

export type DoctorReport = {
  status: DoctorStatus;
  checks: DoctorCheck[];
  projectState: DoctorProjectState;
  git: DoctorGitInfo;
  security: DoctorSecurityInfo;
  templates: DoctorTemplateInfo;
  agents: DoctorAgentInfo;
  workflow: DoctorWorkflowInfo;
  gitSecurity: {
    status: "clean" | "warning" | "blocked";
    forbiddenFiles: string[];
    suspectedSecrets: number;
    gitignoreMissingEntries: string[];
    internalFilesStaged: string[];
  };
  recommendation: string;
};
