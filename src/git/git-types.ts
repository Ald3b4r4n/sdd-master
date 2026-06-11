import type { SecretFinding } from "../security/secret-scan.js";

export type GitSecurityStatus = "clean" | "warning" | "blocked";
export type GitMode = "default" | "pre-commit" | "pre-push";

export type GitInfo = {
  isRepository: boolean;
  branch?: string;
  remotes: string[];
  stagedFiles: string[];
  modifiedFiles: string[];
  untrackedFiles: string[];
};

export type GitignoreInfo = {
  exists: boolean;
  missingEntries: string[];
};

export type EnvExampleInfo = {
  exists: boolean;
  status: "safe" | "suspect" | "not-found";
};

export type GitSecurityReport = {
  status: GitSecurityStatus;
  mode: GitMode;
  git: GitInfo;
  security: {
    forbiddenFiles: string[];
    suspectedSecrets: SecretFinding[];
    gitignore: GitignoreInfo;
    envExample: EnvExampleInfo;
  };
  sddMaster: {
    internalFilesStaged: string[];
    internalFilesPending: string[];
  };
  blockers: string[];
  warnings: string[];
  recommendation: string;
};
