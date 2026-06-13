export type ImplementOptions = {
  yes: boolean;
  json: boolean;
  phase: string;
  task: string;
  target?: string;
  dryRun: boolean;
  prepare: boolean;
  handoff: boolean;
  manifest: boolean;
  testContract: boolean;
  agent: string;
  allowedFiles: string[];
  forbiddenFiles: string[];
};

export type ImplementGate = {
  gate: string;
  status: "OK" | "Pendente" | "not-applicable" | "Recomendado";
  evidence: string;
};

export type TestGateStatus = {
  ok: boolean;
  reasons: string[];
  evidence: string;
};

export type ImplementResult = {
  status: "blocked" | "ready";
  mode: "guard" | "assisted-guard";
  phase: string;
  task: string;
  ready: boolean;
  blockers: string[];
  gates: ImplementGate[];
  createdFiles: string[];
  updatedFiles: string[];
  allowedFiles: string[];
  forbiddenFiles: string[];
  codeChanged: false;
  nextActions: string[];
};

export type ImplementStatus = {
  hasRecords: boolean;
  latestStatus: "not-started" | "blocked" | "ready";
  testGates: "not-started" | "OK" | "Pendente";
  codeChanged: false;
  nextAction: string;
};

export type AssistedImplementStatus = {
  latestSession: string;
  status: "not-started" | "blocked" | "prepared";
  handoff: "not-started" | "created" | "missing";
  testContract: "not-started" | "created" | "missing";
  manifest: "not-started" | "created" | "missing";
  codeChanged: false;
  humanApproval: "not-started" | "Pendente";
  forbiddenPolicy: "not-started" | "OK" | "missing";
};
