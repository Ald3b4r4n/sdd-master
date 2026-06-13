export type PluginCategory =
  | "uiux"
  | "workflow"
  | "security"
  | "testing"
  | "docs"
  | "integration"
  | "automation"
  | "other";

export type PluginStatus = "Candidata" | "Aprovada" | "Instalada localmente" | "Usada" | "Rejeitada";

export type PluginOptions = {
  yes: boolean;
  json: boolean;
  title?: string;
  phase?: string;
  category?: string;
  source?: string;
  plugin?: string;
  reason?: string;
  approve: boolean;
  installLocal: boolean;
  markUsed: boolean;
  report: boolean;
  target?: string;
};

export type PluginRecord = {
  id: string;
  title: string;
  category: PluginCategory;
  source: string;
  status: PluginStatus;
  reason: string;
};

export type PluginStatusSummary = {
  candidates: number;
  approved: number;
  installedLocal: number;
  used: number;
  usageReports: number;
};

export type PluginCommandResult = {
  status: "created" | "updated" | "reported";
  plugin?: string;
  createdFiles: string[];
  updatedFiles: string[];
  summary: PluginStatusSummary;
  message: string;
};
