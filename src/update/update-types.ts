export type UpdateMode = "dry-run" | "applied" | "partial" | "blocked";

export type UpdateOptions = {
  yes: boolean;
  json: boolean;
  dryRun: boolean;
  apply: boolean;
  force: boolean;
  templates: boolean;
  agents: boolean;
  docs: boolean;
  projectState: boolean;
  backup: boolean;
};

export type UpdateConflict = {
  path: string;
  reason: string;
  action: "preserved";
};

export type UpdatePlanItem = {
  path: string;
  action: "create" | "update" | "preserve" | "conflict";
  reason: string;
  content?: string;
};

export type UpdatePlan = {
  installedVersion: string;
  targetVersion: string;
  installedTemplateVersion: string;
  targetTemplateVersion: string;
  templateItems: UpdatePlanItem[];
  projectStateItem?: UpdatePlanItem;
  conflicts: UpdateConflict[];
};

export type UpdateResult = {
  status: UpdateMode;
  mode: "dry-run" | "applied";
  installedVersion: string;
  targetVersion: string;
  installedTemplateVersion: string;
  targetTemplateVersion: string;
  created: string[];
  updated: string[];
  preserved: string[];
  conflicts: UpdateConflict[];
  reportPath?: string;
  backupPath?: string;
  backupCreated: boolean;
  projectStateUpdated: boolean;
};
