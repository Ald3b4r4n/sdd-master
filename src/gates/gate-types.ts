export type GateCommandName = "quality" | "audit" | "docs" | "blocker";

export type GateOptions = {
  yes: boolean;
  json: boolean;
  title?: string;
  id?: string;
  phase: string;
  status?: string;
  severity?: string;
  category?: string;
  reason?: string;
  type?: string;
  target?: string;
  decision?: string;
  file?: string;
};

export type GateWrite = {
  path: string;
  status: "created" | "updated" | "preserved";
};

export type GateResult = {
  status: "created" | "updated" | "listed";
  command: GateCommandName;
  id?: string;
  createdFiles: string[];
  updatedFiles: string[];
  preservedFiles: string[];
  message: string;
  implementReady: boolean;
  blockers: string[];
  records?: string[];
};

export type GateStatus = {
  quality: {
    total: number;
    failedOpen: number;
    warnings: number;
  };
  audit: {
    total: number;
    blockerOpen: number;
    highCriticalOpen: number;
  };
  docs: {
    total: number;
    pending: number;
    publicAxesPresent: boolean;
  };
  blockers: {
    total: number;
    open: number;
    resolved: number;
  };
};
