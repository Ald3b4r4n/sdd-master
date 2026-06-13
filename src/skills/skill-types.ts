export type SkillCategory =
  | "uiux"
  | "security"
  | "architecture"
  | "testing"
  | "docs"
  | "performance"
  | "accessibility"
  | "seo"
  | "other";

export type SkillStatus = "Candidata" | "Aprovada" | "Instalada localmente" | "Usada" | "Rejeitada";

export type SkillOptions = {
  yes: boolean;
  json: boolean;
  title?: string;
  phase?: string;
  category?: string;
  source?: string;
  skill?: string;
  reason?: string;
  approve: boolean;
  installLocal: boolean;
  markUsed: boolean;
  report: boolean;
  target?: string;
};

export type SkillRecord = {
  id: string;
  title: string;
  category: SkillCategory;
  source: string;
  status: SkillStatus;
  reason: string;
};

export type SkillStatusSummary = {
  candidates: number;
  approved: number;
  installedLocal: number;
  used: number;
  usageReports: number;
};

export type SkillCommandResult = {
  status: "created" | "updated" | "reported";
  skill?: string;
  createdFiles: string[];
  updatedFiles: string[];
  summary: SkillStatusSummary;
  message: string;
};
