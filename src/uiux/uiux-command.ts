import type { CliOutput, CliRuntime } from "../cli/output.js";
import { safeWriteFile } from "../filesystem/safe-write.js";
import { getNotInitializedMessage, isWorkflowInitialized } from "../workflow/workflow-guards.js";
import { designSystemContent, checklistContent } from "./design-system.js";
import { getUiuxStatus, normalizeUiuxProfile } from "./uiux-gates.js";
import { formatUiuxJson, formatUiuxText } from "./uiux-report.js";
import type { UiuxCommandResult, UiuxOptions, UiuxType } from "./uiux-types.js";

export async function runUiuxCommand(args: string[], output: CliOutput, runtime: CliRuntime): Promise<number> {
  if (args.includes("--help") || args.includes("-h")) {
    output.stdout(getUiuxHelp());
    return 0;
  }

  const parsed = parseUiuxArgs(args);
  if (!parsed.ok) {
    output.stderr(`${parsed.error}\n`);
    return 1;
  }

  if (!isWorkflowInitialized(runtime.cwd)) {
    output.stderr(getNotInitializedMessage());
    return 1;
  }

  const result = executeUiux(runtime.cwd, parsed.options);
  output.stdout(parsed.options.json ? formatUiuxJson(result) : formatUiuxText(result));
  return 0;
}

function executeUiux(cwd: string, options: UiuxOptions): UiuxCommandResult {
  const createdFiles: string[] = [];
  const updatedFiles: string[] = [];

  write(cwd, ".sdd-master/uiux/uiux-index.md", uiuxIndexContent(options));
  updatedFiles.push(".sdd-master/uiux/uiux-index.md");

  if (options.type === "uiux-review") {
    write(cwd, ".sdd-master/uiux/UIUX-001.md", uiuxReviewContent(options));
    createdFiles.push(".sdd-master/uiux/UIUX-001.md");
  }

  if (options.type === "design-system") {
    write(cwd, ".sdd-master/uiux/design-system.md", designSystemContent());
    write(cwd, "docs/02-tecnica-arquitetura/design-system.md", designSystemContent());
    createdFiles.push(".sdd-master/uiux/design-system.md", "docs/02-tecnica-arquitetura/design-system.md");
  }

  if (options.type === "accessibility") {
    const content = checklistContent("Checklist de Acessibilidade", [
      "Contraste",
      "Navegação por teclado",
      "Foco visível",
      "Labels",
      "Semântica",
      "Texto alternativo",
      "Feedback não apenas por cor"
    ]);
    write(cwd, ".sdd-master/uiux/accessibility-checklist.md", content);
    write(cwd, "docs/02-tecnica-arquitetura/acessibilidade.md", content);
    createdFiles.push(".sdd-master/uiux/accessibility-checklist.md", "docs/02-tecnica-arquitetura/acessibilidade.md");
  }

  if (options.type === "seo") {
    const content = checklistContent("Checklist de SEO", [
      "Title",
      "Description",
      "Headings",
      "URLs",
      "Conteúdo indexável",
      "Schema/structured data",
      "Performance",
      "Open Graph"
    ]);
    write(cwd, ".sdd-master/uiux/seo-checklist.md", content);
    write(cwd, "docs/02-tecnica-arquitetura/seo.md", content);
    createdFiles.push(".sdd-master/uiux/seo-checklist.md", "docs/02-tecnica-arquitetura/seo.md");
  }

  if (options.type === "responsiveness") {
    const content = checklistContent("Checklist de Responsividade", [
      "Mobile",
      "Tablet",
      "Desktop",
      "Breakpoints",
      "Orientação",
      "Componentes adaptáveis"
    ]);
    write(cwd, ".sdd-master/uiux/responsiveness-checklist.md", content);
    write(cwd, "docs/02-tecnica-arquitetura/responsividade.md", content);
    createdFiles.push(".sdd-master/uiux/responsiveness-checklist.md", "docs/02-tecnica-arquitetura/responsividade.md");
  }

  if (options.type === "performance") {
    const content = checklistContent("Checklist de Performance Web", [
      "Bundle",
      "Imagens",
      "Lazy loading",
      "Core Web Vitals",
      "Carregamento inicial"
    ]);
    write(cwd, ".sdd-master/uiux/performance-checklist.md", content);
    write(cwd, "docs/02-tecnica-arquitetura/performance-web.md", content);
    createdFiles.push(".sdd-master/uiux/performance-checklist.md", "docs/02-tecnica-arquitetura/performance-web.md");
  }

  return {
    status: "created",
    type: options.type,
    profile: options.profile,
    createdFiles,
    updatedFiles,
    summary: getUiuxStatus(cwd, options.profile)
  };
}

function parseUiuxArgs(args: string[]): { ok: true; options: UiuxOptions } | { ok: false; error: string } {
  const options: UiuxOptions = {
    yes: false,
    json: false,
    phase: "PHASE-01",
    type: "uiux-review",
    profile: "OTHER"
  };

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];

    if (arg === "--yes" || arg === "-y") {
      options.yes = true;
      continue;
    }

    if (arg === "--json") {
      options.json = true;
      continue;
    }

    const name = ["title", "phase", "type", "status", "profile", "category", "source", "skill", "reason", "target"].find(
      (option) => arg === `--${option}` || arg.startsWith(`--${option}=`)
    );

    if (!name) {
      return { ok: false, error: `Opção desconhecida para uiux: ${arg}` };
    }

    let value: string | undefined;
    if (arg === `--${name}`) {
      index += 1;
      value = args[index];
    } else {
      value = arg.slice(name.length + 3);
    }

    if (!value) {
      return { ok: false, error: `Valor ausente para --${name}` };
    }

    if (name === "title") options.title = value;
    if (name === "phase") options.phase = value;
    if (name === "type") options.type = normalizeUiuxType(value);
    if (name === "status") options.status = value;
    if (name === "profile") options.profile = normalizeUiuxProfile(value);
  }

  return { ok: true, options };
}

function normalizeUiuxType(value: string): UiuxType {
  const normalized = value.trim().toLowerCase();
  const allowed: UiuxType[] = ["uiux-review", "design-system", "accessibility", "seo", "responsiveness", "performance"];
  return allowed.includes(normalized as UiuxType) ? (normalized as UiuxType) : "uiux-review";
}

function uiuxReviewContent(options: UiuxOptions): string {
  return `# UIUX-001 — ${options.title ?? "Revisão UI/UX"}

## Fase
${options.phase}

## Perfil
${options.profile}

## Tipo
${options.type}

## Status
${normalizeUiuxStatus(options.status)}

## Objetivo
${options.title ?? "Descrever objetivo."}

## Critérios avaliados

### UI/UX
- Hierarquia visual:
- Clareza:
- Consistência:
- Estados de loading:
- Estados vazios:
- Estados de erro:
- Estados de sucesso:
- Microcopy:
- CTA:
- Navegação:

### Design System
- Cores:
- Tipografia:
- Espaçamento:
- Radius:
- Sombras:
- Botões:
- Inputs:
- Cards:
- Ícones:
- Componentes base:

### Acessibilidade
- Contraste:
- Navegação por teclado:
- Foco visível:
- Labels:
- Semântica:
- Texto alternativo:
- Feedback não apenas por cor:

### Responsividade
- Mobile:
- Tablet:
- Desktop:
- Breakpoints:
- Orientação:
- Componentes adaptáveis:

### SEO, quando aplicável
- Title:
- Description:
- Headings:
- URLs:
- Conteúdo indexável:
- Schema/structured data:
- Performance:
- Open Graph:

### Performance
- Bundle:
- Imagens:
- Lazy loading:
- Core Web Vitals:
- Carregamento inicial:

## Skills consideradas
-

## Skills usadas
-

## Achados
-

## Ação obrigatória
-

## Aprovação humana
Pendente

## Impacto em implementação
Interface não deve ser implementada sem UI/UX aprovado quando aplicável.
`;
}

function uiuxIndexContent(options: UiuxOptions): string {
  return `# Índice UI/UX

## Perfil
${options.profile}

## Regra central
Design deve ser o carro-chefe do SDD Master.

## Gates
- UI/UX
- Design system
- Acessibilidade
- SEO
- Responsividade
- Performance
`;
}

function normalizeUiuxStatus(value: string | undefined): string {
  if (value === "approved" || value === "aprovado" || value === "Aprovado") return "Aprovado";
  if (value === "failed" || value === "reprovado" || value === "Reprovado") return "Reprovado";
  if (value === "review" || value === "Em revisão") return "Em revisão";
  return "Rascunho";
}

function write(cwd: string, relativePath: string, content: string): void {
  safeWriteFile(cwd, relativePath, content);
}

export function getUiuxHelp(): string {
  return `sdd master uiux

Status:
  Disponível no BLOCO 21.

Finalidade:
  Criar registros e gates de UI/UX, design system, acessibilidade, SEO, responsividade e performance.

Uso:
  sdd master uiux --yes --phase="PHASE-01" --profile="WEB" --title="Revisão UI/UX inicial"
  sdd master uiux --yes --type="design-system" --phase="PHASE-01" --profile="WEB"
  sdd master uiux --yes --type="accessibility" --phase="PHASE-01" --profile="WEB"
  sdd master uiux --yes --type="seo" --phase="PHASE-01" --profile="WEB"
  sdd master uiux --yes --type="responsiveness" --phase="PHASE-01" --profile="WEB"

Flags:
  --help
  --json
  --yes, -y
  --title
  --phase
  --type
  --status
  --category
  --source
  --skill
  --reason
  --profile
  --target

Relação com skills:
  Skills de UI/UX podem ser registradas com sdd master skills e devem aparecer em relatório quando usadas.

Relação com implement readiness:
  Perfis WEB, MOBILE, DESKTOP, SAAS e E-COMMERCE exigem UI/UX aprovado, design system, acessibilidade e responsividade.
  Perfis WEB, SAAS e E-COMMERCE exigem SEO.
  Perfil API marca UI/UX como not-applicable.
`;
}
