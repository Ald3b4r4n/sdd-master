import type { CliOutput, CliRuntime } from "../output.js";
import { isWorkflowInitialized } from "../../workflow/workflow-guards.js";
import { notInitializedMessage } from "../../ux/messages.js";
import { formatStandardText } from "../../ux/output-format.js";
import {
  writeOnboarding,
  type OnboardingAi,
  type OnboardingLanguage,
  type OnboardingProfile
} from "../../ux/onboarding.js";
import { getNextActions } from "../../ux/next-actions.js";

const profiles = new Set(["web", "api", "cli", "mobile", "desktop", "library", "generic"]);
const ais = new Set(["codex", "claude", "cursor", "gemini", "copilot", "windsurf", "cline", "roo", "aider", "continue", "generic"]);
const languages = new Set(["pt-BR", "en", "es"]);

export function runOnboardCommand(args: string[], output: CliOutput, runtime: CliRuntime): number {
  if (args.includes("--help") || args.includes("-h")) {
    output.stdout(getOnboardHelp());
    return 0;
  }
  const parsed = parseArgs(args);
  if (!parsed.ok) {
    output.stderr(`${parsed.error}\n`);
    return 1;
  }
  if (!isWorkflowInitialized(runtime.cwd)) {
    output.stderr(notInitializedMessage());
    return 1;
  }

  const nextActions = getNextActions("onboard");
  const result = parsed.options.dryRun
    ? { id: "ONBOARDING-DRY-RUN", files: [] as string[], nextActions }
    : writeOnboarding(runtime.cwd, parsed.options);
  const json = {
    command: "onboard",
    status: parsed.options.dryRun ? "dry-run" : "ok",
    summary: [`Perfil: ${parsed.options.profile}`, `IA: ${parsed.options.ai}`, `Idioma: ${parsed.options.language}`],
    files: result.files,
    blockers: [],
    warnings: [],
    nextActions: result.nextActions,
    id: result.id,
    profile: parsed.options.profile,
    ai: parsed.options.ai,
    language: parsed.options.language,
    codeChanged: false
  };
  output.stdout(parsed.options.json ? `${JSON.stringify(json, null, 2)}\n` : formatStandardText(json));
  return 0;
}

function parseArgs(args: string[]): {
  ok: true;
  options: { yes: boolean; json: boolean; dryRun: boolean; profile: OnboardingProfile; ai: OnboardingAi; language: OnboardingLanguage };
} | { ok: false; error: string } {
  const options = {
    yes: false,
    json: false,
    dryRun: false,
    profile: "generic" as OnboardingProfile,
    ai: "generic" as OnboardingAi,
    language: "pt-BR" as OnboardingLanguage
  };
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--yes" || arg === "-y") { options.yes = true; continue; }
    if (arg === "--json") { options.json = true; continue; }
    if (arg === "--dry-run") { options.dryRun = true; continue; }
    const name = ["profile", "ai", "language"].find((value) => arg === `--${value}` || arg.startsWith(`--${value}=`));
    if (!name) return { ok: false, error: `Opção desconhecida para onboard: ${arg}` };
    const value = arg === `--${name}` ? args[++index] : arg.slice(name.length + 3);
    if (!value) return { ok: false, error: `Valor ausente para --${name}` };
    if (name === "profile" && !profiles.has(value)) return { ok: false, error: `Perfil inválido: ${value}` };
    if (name === "ai" && !ais.has(value)) return { ok: false, error: `IA inválida: ${value}` };
    if (name === "language" && !languages.has(value)) return { ok: false, error: `Idioma inválido: ${value}` };
    if (name === "profile") options.profile = value as OnboardingProfile;
    if (name === "ai") options.ai = value as OnboardingAi;
    if (name === "language") options.language = value as OnboardingLanguage;
  }
  return { ok: true, options };
}

export function getOnboardHelp(): string {
  return `sdd master onboard

Finalidade:
  Guiar os primeiros passos após a inicialização do projeto.

Quando usar:
  Após sdd master init e antes do discovery.

Pré-condições:
  Projeto inicializado com sdd master init.

Exemplo:
  sdd master onboard --yes --profile="web" --ai="codex" --language="pt-BR"

Arquivos gerados:
  .sdd-master/onboarding/ONBOARDING-001.md
  .sdd-master/onboarding/next-steps.md

Flags importantes:
  --help, --json, --yes, -y, --profile, --ai, --language, --dry-run

Riscos:
  Nenhum código do projeto consumidor é alterado.

Próximos passos:
  sdd master doctor
  sdd master discovery
`;
}
