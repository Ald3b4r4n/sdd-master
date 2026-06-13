import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { UiuxProfile, UiuxSummary } from "./uiux-types.js";

const interfaceProfiles: UiuxProfile[] = ["WEB", "MOBILE", "DESKTOP", "SAAS", "E-COMMERCE"];
const screenProfiles: UiuxProfile[] = ["WEB", "MOBILE", "DESKTOP", "SAAS", "E-COMMERCE", "CLI"];
const publicWebProfiles: UiuxProfile[] = ["WEB", "SAAS", "E-COMMERCE"];

export function getUiuxStatus(cwd: string, explicitProfile?: string): UiuxSummary {
  const profile = normalizeUiuxProfile(explicitProfile ?? discoverProfile(cwd));
  const applicable = profile !== "API" && profile !== "AI-AGENT";
  const requiresInterface = interfaceProfiles.includes(profile);
  const requiresScreen = screenProfiles.includes(profile);
  const requiresSeo = publicWebProfiles.includes(profile);
  const hasUiuxApproved = hasApprovedUiux(cwd);
  const designSystem = existsSync(join(cwd, ".sdd-master", "uiux", "design-system.md"));
  const accessibility = existsSync(join(cwd, ".sdd-master", "uiux", "accessibility-checklist.md"));
  const seo = requiresSeo ? existsSync(join(cwd, ".sdd-master", "uiux", "seo-checklist.md")) : "not-applicable";
  const responsiveness = requiresScreen
    ? existsSync(join(cwd, ".sdd-master", "uiux", "responsiveness-checklist.md"))
    : "not-applicable";
  const performanceFile = existsSync(join(cwd, ".sdd-master", "uiux", "performance-checklist.md"));
  const blockers: string[] = [];

  if (requiresInterface && !hasUiuxApproved) blockers.push("UI/UX aprovado pendente");
  if (requiresInterface && !designSystem) blockers.push("Design system pendente");
  if (requiresInterface && !accessibility) blockers.push("Acessibilidade pendente");
  if (seo !== "not-applicable" && !seo) blockers.push("SEO pendente");
  if (responsiveness !== "not-applicable" && !responsiveness) blockers.push("Responsividade pendente");

  return {
    applicable,
    profile,
    uiuxApproved: hasUiuxApproved,
    designSystem,
    accessibility,
    seo,
    responsiveness,
    performance: performanceFile || "recommended",
    blockers
  };
}

export function normalizeUiuxProfile(value: string | undefined): UiuxProfile {
  const normalized = value?.trim().toUpperCase();
  const allowed: UiuxProfile[] = ["WEB", "MOBILE", "DESKTOP", "CLI", "API", "SAAS", "E-COMMERCE", "AI-AGENT", "OTHER"];

  return allowed.includes(normalized as UiuxProfile) ? (normalized as UiuxProfile) : "OTHER";
}

function hasApprovedUiux(cwd: string): boolean {
  const path = join(cwd, ".sdd-master", "uiux", "UIUX-001.md");

  if (!existsSync(path)) {
    return false;
  }

  const content = readFileSync(path, "utf8");
  return content.includes("## Status\nAprovado");
}

function discoverProfile(cwd: string): string | undefined {
  const discoveryProfile = join(cwd, ".sdd-master", "discovery", "project-profiles.md");
  if (existsSync(discoveryProfile)) {
    const content = readFileSync(discoveryProfile, "utf8");
    const profile = content.match(/- (WEB|MOBILE|DESKTOP|CLI|API|SAAS|E-COMMERCE|AI-AGENT|OTHER)/i)?.[1];
    if (profile) return profile;
  }

  const state = join(cwd, ".sdd-master", "project-state.md");
  if (!existsSync(state)) {
    return undefined;
  }

  const content = readFileSync(state, "utf8");
  return content.match(/\b(WEB|MOBILE|DESKTOP|CLI|API|SAAS|E-COMMERCE|AI-AGENT|OTHER)\b/i)?.[1];
}
