export type GovernanceCommandName = "clarify" | "approve" | "scope" | "backlog";

export type GovernanceDecision = "approved" | "rejected" | "pending";
export type GovernancePriority = "MUST" | "SHOULD" | "COULD" | "WONT";

export type GovernanceOptions = {
  yes: boolean;
  json: boolean;
  id?: string;
  title?: string;
  type?: string;
  status?: string;
  reason?: string;
  phase: string;
  target?: string;
  decision?: GovernanceDecision;
  priority?: GovernancePriority;
};

export type GovernanceWrite = {
  path: string;
  status: "created" | "updated" | "preserved";
};

export type GovernanceResult = {
  status: "created" | "updated" | "registered";
  command: GovernanceCommandName;
  id?: string;
  createdFiles: string[];
  updatedFiles: string[];
  preservedFiles: string[];
  message: string;
  implementReady: boolean;
  blockers: string[];
};

export type GovernanceStatus = {
  clarifications: {
    total: number;
    open: number;
    resolved: number;
  };
  approvals: {
    total: number;
    approvedTargets: string[];
    rejectedTargets: string[];
    pendingTargets: string[];
  };
  scope: {
    approvedItems: number;
    outOfScopeItems: number;
    openChanges: number;
  };
  backlog: {
    total: number;
  };
};

export type ImplementReadiness = {
  ready: boolean;
  blockers: string[];
};
