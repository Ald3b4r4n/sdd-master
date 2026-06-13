export type GateStatusLabel = "OK" | "Pendente" | "Não aplicável";

export type DeliveryGate = {
  gate: string;
  status: GateStatusLabel;
  evidence: string;
};

export type DeliveryStatus = "blocked" | "ready" | "registered";

export type ReleaseChannel = "prototype" | "alpha" | "beta" | "rc" | "stable";
export type ReleaseType = "local" | "github" | "npm" | "full";

export type ReleaseOptions = {
  yes: boolean;
  json: boolean;
  dryRun: boolean;
  checklist: boolean;
  phase: string;
  title: string;
  target: string;
  environment: string;
  version: string;
  channel: ReleaseChannel;
  type: ReleaseType;
};

export type ReleaseReadiness = {
  ready: boolean;
  status: DeliveryStatus;
  gates: DeliveryGate[];
  blockers: string[];
  actions: string[];
};

export type ReleaseResult = ReleaseReadiness & {
  id: string;
  checklistId: string;
  phase: string;
  version: string;
  channel: ReleaseChannel;
  type: ReleaseType;
  mode: "Dry-run / Guard";
  createdFiles: string[];
  updatedFiles: string[];
  published: false;
  tagCreated: false;
  githubReleaseCreated: false;
};

export type DeployEnvironment = "local" | "dev" | "staging" | "production";
export type DeployProvider = "manual" | "github-actions" | "vercel" | "netlify" | "locaweb" | "other";
export type DeployStrategy = "manual" | "static" | "server" | "container" | "serverless" | "other";

export type DeployOptions = {
  yes: boolean;
  json: boolean;
  dryRun: boolean;
  checklist: boolean;
  phase: string;
  title: string;
  target: string;
  environment: DeployEnvironment;
  provider: DeployProvider;
  strategy: DeployStrategy;
};

export type DeployReadiness = {
  ready: boolean;
  status: DeliveryStatus;
  gates: DeliveryGate[];
  blockers: string[];
  actions: string[];
  envVars: string[];
  secrets: string[];
};

export type DeployResult = DeployReadiness & {
  id: string;
  checklistId: string;
  phase: string;
  environment: DeployEnvironment;
  provider: DeployProvider;
  strategy: DeployStrategy;
  mode: "Dry-run / Guard";
  createdFiles: string[];
  updatedFiles: string[];
  deployed: false;
  serverAccessed: false;
  remoteScriptsExecuted: false;
};

export type DeliveryStatusSummary = {
  release: {
    latestPlan: string;
    status: "not-started" | DeliveryStatus;
    blockers: number;
  };
  deploy: {
    latestPlan: string;
    environment: string;
    status: "not-started" | DeliveryStatus;
    blockers: number;
  };
};
