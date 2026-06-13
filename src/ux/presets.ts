import { safeWriteFile } from "../filesystem/safe-write.js";

export type ProjectPreset = "web" | "api" | "cli" | "mobile" | "desktop" | "library" | "ecommerce" | "generic";

export type PresetDefinition = {
  id: ProjectPreset;
  label: string;
  profile: string;
  summary: string;
  recommendations: string[];
  uiux: "required" | "optional";
  seo: "required" | "optional" | "not-applicable";
};

export const officialPresets: Record<ProjectPreset, PresetDefinition> = {
  web: {
    id: "web",
    label: "Web",
    profile: "web",
    summary: "Aplicação web com UI, SEO quando aplicável, acessibilidade e performance.",
    recommendations: ["Validar UX", "Criar SEO checklist", "Medir performance", "Preparar release guard"],
    uiux: "required",
    seo: "required"
  },
  api: {
    id: "api",
    label: "API",
    profile: "api",
    summary: "API com contratos, segurança, versionamento e documentação técnica.",
    recommendations: ["Definir contratos", "Validar autenticação", "Documentar endpoints", "Criar testes de contrato"],
    uiux: "optional",
    seo: "not-applicable"
  },
  cli: {
    id: "cli",
    label: "CLI",
    profile: "cli",
    summary: "Ferramenta de linha de comando com UX textual, help robusto e JSON para automação.",
    recommendations: ["Validar help", "Padronizar erros", "Testar JSON", "Garantir compatibilidade de terminal"],
    uiux: "optional",
    seo: "not-applicable"
  },
  mobile: {
    id: "mobile",
    label: "Mobile",
    profile: "mobile",
    summary: "Aplicativo mobile com acessibilidade, navegação, offline e publicação controlada.",
    recommendations: ["Validar fluxos nativos", "Testar acessibilidade", "Planejar distribuição", "Preparar rollback"],
    uiux: "required",
    seo: "not-applicable"
  },
  desktop: {
    id: "desktop",
    label: "Desktop",
    profile: "desktop",
    summary: "Aplicação desktop com empacotamento, atualizações e UX de produtividade.",
    recommendations: ["Validar instalador", "Planejar updates", "Testar atalhos", "Documentar rollback"],
    uiux: "required",
    seo: "not-applicable"
  },
  library: {
    id: "library",
    label: "Library",
    profile: "library",
    summary: "Biblioteca com API pública, semver, exemplos, migração e compatibilidade.",
    recommendations: ["Definir API pública", "Criar testes de contrato", "Documentar migração", "Evitar breaking changes"],
    uiux: "optional",
    seo: "not-applicable"
  },
  ecommerce: {
    id: "ecommerce",
    label: "E-commerce",
    profile: "ecommerce",
    summary: "Loja com catálogo, checkout, frete, pagamento, admin, LGPD, SEO, acessibilidade e performance.",
    recommendations: [
      "Modelar catálogo e busca",
      "Validar checkout, frete e pagamento",
      "Planejar admin e segurança",
      "Criar LGPD, acessibilidade e SEO gates",
      "Preparar deploy guard e rollback"
    ],
    uiux: "required",
    seo: "required"
  },
  generic: {
    id: "generic",
    label: "Generic",
    profile: "generic",
    summary: "Projeto genérico com governança SDD e recomendações mínimas.",
    recommendations: ["Executar discovery", "Definir requisitos", "Criar spec", "Planejar tarefas"],
    uiux: "optional",
    seo: "optional"
  }
};

export function parsePreset(value: string | undefined): ProjectPreset | undefined {
  if (!value) return undefined;
  return Object.keys(officialPresets).includes(value) ? (value as ProjectPreset) : undefined;
}

export function writePresetFiles(cwd: string, preset: ProjectPreset): string[] {
  const definition = officialPresets[preset];
  const files = [
    ".sdd-master/onboarding/preset.md",
    "docs/01-negocio-requisitos/preset-produto.md",
    "docs/03-codigo/preset-operacional.md"
  ];
  safeWriteFile(cwd, files[0], presetContent(definition));
  safeWriteFile(cwd, files[1], productPresetContent(definition));
  safeWriteFile(cwd, files[2], operationalPresetContent(definition));
  return files;
}

function presetContent(definition: PresetDefinition): string {
  return `# Preset SDD Master — ${definition.label}

## Preset
${definition.id}

## Perfil
${definition.profile}

## Resumo
${definition.summary}

## UI/UX
${definition.uiux}

## SEO
${definition.seo}

## Recomendações
${definition.recommendations.map((item) => `- ${item}`).join("\n")}
`;
}

function productPresetContent(definition: PresetDefinition): string {
  return `# Preset de Produto — ${definition.label}

## Objetivo
${definition.summary}

## Atenções de produto
${definition.recommendations.map((item) => `- ${item}`).join("\n")}
`;
}

function operationalPresetContent(definition: PresetDefinition): string {
  return `# Preset Operacional — ${definition.label}

## Gates recomendados
- UI/UX: ${definition.uiux}
- SEO: ${definition.seo}
- Segurança: required
- Release guard: required
- Deploy guard: required
- Rollback: required
`;
}
