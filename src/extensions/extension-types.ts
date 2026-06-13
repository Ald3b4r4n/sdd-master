export type ExtensionKind = "plugin" | "skill";
export type ExtensionRisk = "LOW" | "MEDIUM" | "HIGH" | "BLOCKER";

export type ExtensionHealth = {
  policy: "not-started" | "OK" | "missing";
  registry: "not-started" | "OK" | "missing";
  pluginRegistry: "not-started" | "OK" | "missing";
  skillsRegistry: "not-started" | "OK" | "missing";
  supplyChainRisks: number;
  unapprovedUsed: number;
  blockedOrRejected: number;
  remoteSources: number;
  unauditedRemoteUsed: number;
  status: "not-started" | "healthy" | "warning" | "broken";
  blockers: string[];
  warnings: string[];
};

export type ExtensionRegistryEntry = {
  id: string;
  kind: ExtensionKind;
  title: string;
  source: string;
  status: string;
  permissions: string[];
};
