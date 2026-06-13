export type UiuxProfile = "WEB" | "MOBILE" | "DESKTOP" | "CLI" | "API" | "SAAS" | "E-COMMERCE" | "AI-AGENT" | "OTHER";

export type UiuxType = "uiux-review" | "design-system" | "accessibility" | "seo" | "responsiveness" | "performance";

export type UiuxStatus = "Rascunho" | "Em revisão" | "Aprovado" | "Reprovado";

export type UiuxOptions = {
  yes: boolean;
  json: boolean;
  phase: string;
  title?: string;
  type: UiuxType;
  status?: string;
  profile: UiuxProfile;
};

export type UiuxSummary = {
  applicable: boolean;
  profile: UiuxProfile;
  uiuxApproved: boolean;
  designSystem: boolean;
  accessibility: boolean;
  seo: boolean | "not-applicable";
  responsiveness: boolean | "not-applicable";
  performance: boolean | "recommended";
  blockers: string[];
};

export type UiuxCommandResult = {
  status: "created";
  type: UiuxType;
  profile: UiuxProfile;
  createdFiles: string[];
  updatedFiles: string[];
  summary: UiuxSummary;
};
