import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { safeWriteFile } from "../filesystem/safe-write.js";
import { getNextActions } from "./next-actions.js";

export type OnboardingProfile = "web" | "api" | "cli" | "mobile" | "desktop" | "library" | "generic";
export type OnboardingAi = "codex" | "claude" | "cursor" | "gemini" | "copilot" | "windsurf" | "cline" | "roo" | "aider" | "continue" | "generic";
export type OnboardingLanguage = "pt-BR" | "en" | "es";

export type OnboardingState = {
  status: "not-started" | "completed";
  profile: OnboardingProfile | "not-defined";
  ai: OnboardingAi | "not-defined";
  language: OnboardingLanguage | "not-defined";
  latest: string;
  nextStep: string;
};

export function getOnboardingState(cwd: string): OnboardingState {
  const directory = join(cwd, ".sdd-master", "onboarding");
  if (!existsSync(directory)) {
    return {
      status: "not-started",
      profile: "not-defined",
      ai: "not-defined",
      language: "not-defined",
      latest: "not-started",
      nextStep: 'sdd master onboard --profile="web"'
    };
  }
  const latest = readdirSync(directory)
    .filter((file) => /^ONBOARDING-\d+\.md$/.test(file))
    .sort()
    .at(-1);
  if (!latest) {
    return {
      status: "not-started",
      profile: "not-defined",
      ai: "not-defined",
      language: "not-defined",
      latest: "not-started",
      nextStep: "sdd master onboard"
    };
  }
  const content = readFileSync(join(directory, latest), "utf8");
  return {
    status: "completed",
    profile: extract(content, "Perfil do projeto") as OnboardingProfile,
    ai: extract(content, "IA principal") as OnboardingAi,
    language: extract(content, "Idioma") as OnboardingLanguage,
    latest: latest.replace(".md", ""),
    nextStep: "sdd master doctor"
  };
}

export function writeOnboarding(
  cwd: string,
  options: { profile: OnboardingProfile; ai: OnboardingAi; language: OnboardingLanguage }
): { id: string; files: string[]; nextActions: string[] } {
  const id = nextId(cwd);
  const nextActions = getNextActions("onboard");
  const record = `.sdd-master/onboarding/${id}.md`;
  const nextSteps = ".sdd-master/onboarding/next-steps.md";
  safeWriteFile(cwd, record, onboardingContent(id, options, nextActions));
  safeWriteFile(cwd, nextSteps, nextStepsContent(nextActions));
  return { id, files: [record, nextSteps], nextActions };
}

function nextId(cwd: string): string {
  const directory = join(cwd, ".sdd-master", "onboarding");
  const next = existsSync(directory)
    ? readdirSync(directory)
        .filter((file) => /^ONBOARDING-\d+\.md$/.test(file))
        .map((file) => Number(file.replace("ONBOARDING-", "").replace(".md", "")))
        .reduce((max, value) => Math.max(max, value), 0) + 1
    : 1;
  return `ONBOARDING-${String(next).padStart(3, "0")}`;
}

function onboardingContent(
  id: string,
  options: { profile: OnboardingProfile; ai: OnboardingAi; language: OnboardingLanguage },
  actions: string[]
): string {
  return `# ${id} — Onboarding SDD Master

## Perfil do projeto
${options.profile}

## IA principal
${options.ai}

## Idioma
${options.language}

## Estado atual
- Projeto inicializado.
- Onboarding registrado.

## Próximos passos recomendados

${actions.map((action, index) => `${index + 1}. \`${action}\``).join("\n")}

## Observações
Este onboarding não altera código do projeto consumidor.
`;
}

function nextStepsContent(actions: string[]): string {
  return `# Próximos passos — SDD Master

${actions.map((action, index) => `${index + 1}. \`${action}\``).join("\n")}
`;
}

function extract(content: string, heading: string): string {
  return content.match(new RegExp(`^## ${heading}\\n(.+)$`, "m"))?.[1]?.trim() ?? "not-defined";
}
