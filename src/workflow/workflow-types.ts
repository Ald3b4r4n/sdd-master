export type WorkflowCommandName = "discovery" | "requirements" | "spec" | "plan" | "tasks";

export type WorkflowOptions = {
  yes: boolean;
  json: boolean;
  title?: string;
  phase: string;
  projectType?: string;
  profiles?: string;
  maturity?: string;
};

export type WorkflowFileWrite = {
  path: string;
  status: "created" | "preserved" | "updated";
};

export type WorkflowResult = {
  status: "created";
  command: WorkflowCommandName;
  createdFiles: string[];
  preservedFiles: string[];
  updatedFiles: string[];
  nextCommand: string;
  approval: "pending";
  message?: string;
};

export type WorkflowStep = {
  command: WorkflowCommandName;
  title: string;
  heading: string;
  phaseLabel: string;
  requiredPath?: string;
  nextCommand: string;
  projectState: {
    currentPhase: string;
    lastCompleted?: string;
    nextCommand: string;
    maturity?: string;
  };
  files: Array<{
    path: string;
    content: (options: WorkflowOptions) => string;
  }>;
};
