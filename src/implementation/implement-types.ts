export type ImplementOptions = {
  yes: boolean;
  json: boolean;
  phase: string;
  task: string;
  target?: string;
  dryRun: boolean;
};

export type ImplementGate = {
  gate: string;
  status: "OK" | "Pendente";
  evidence: string;
};

export type TestGateStatus = {
  ok: boolean;
  reasons: string[];
  evidence: string;
};

export type ImplementResult = {
  status: "blocked" | "ready";
  mode: "guard";
  phase: string;
  task: string;
  ready: boolean;
  blockers: string[];
  gates: ImplementGate[];
  createdFiles: string[];
  updatedFiles: string[];
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
