export type PluginCategory =
  | "architecture"
  | "testing"
  | "uiux"
  | "security"
  | "docs"
  | "release"
  | "deploy"
  | "database"
  | "ai-agent"
  | "other";

export type PluginType = "local-metadata" | "local-script" | "external-package" | "remote-source" | "manual-process";
export type PluginStatus = "Candidato" | "Aprovado" | "Rejeitado" | "Instalado localmente" | "Usado" | "Bloqueado";

export type PluginOptions = {
  yes: boolean;
  json: boolean;
  title?: string;
  phase?: string;
  id?: string;
  type: PluginType;
  category?: string;
  source?: string;
  version?: string;
  status?: string;
  reason?: string;
  permissions: string[];
  approve: boolean;
  reject: boolean;
  installLocal: boolean;
  markUsed: boolean;
  report: boolean;
  audit: boolean;
  target?: string;
};

export type PluginRecord = {
  id: string;
  title: string;
  category: PluginCategory;
  type: PluginType;
  source: string;
  version: string;
  status: PluginStatus;
  reason: string;
  permissions: string[];
};

export type PluginStatusSummary = {
  candidates: number;
  approved: number;
  installedLocal: number;
  used: number;
  blocked: number;
  remoteSources: number;
  supplyChainRisks: number;
  usageReports: number;
  audits: number;
};

export type PluginCommandResult = {
  status: "created" | "updated" | "reported" | "audited";
  plugin?: string;
  createdFiles: string[];
  updatedFiles: string[];
  summary: PluginStatusSummary;
  message: string;
};
