import type { WorkflowOptions, WorkflowStep } from "../workflow-types.js";

export const discoveryStep: WorkflowStep = {
  command: "discovery",
  title: "Discovery",
  heading: "Discovery",
  phaseLabel: "PHASE-01",
  nextCommand: "/sdd-master-requirements",
  projectState: {
    currentPhase: "PHASE-01 — Discovery",
    lastCompleted: "Nenhuma",
    nextCommand: "/sdd-master-requirements",
    maturity: "M0 — Ideia"
  },
  files: [
    {
      path: ".sdd-master/discovery/initial-discovery.md",
      content: (options) => `# Discovery Inicial — SDD Master

## Metadados
- Projeto: ${value(options.title, "Projeto sem título")}
- Tipo de software: ${value(options.projectType, "other")}
- Perfis aprovados: ${value(options.profiles, "Não informado")}
- Maturidade inicial: ${value(options.maturity, "M0")}
- Status: Rascunho
- Aprovação humana: Pendente

## Objetivo do projeto
[Preencher]

## Problema a resolver
[Preencher]

## Público-alvo
[Preencher]

## Usuários principais
[Preencher]

## Stakeholders
[Preencher]

## Restrições
[Preencher]

## Riscos iniciais
[Preencher]

## Próximo comando recomendado
/sdd-master-requirements`
    },
    {
      path: ".sdd-master/discovery/project-profiles.md",
      content: (options) => `# Perfis do Projeto

## Perfis aprovados
- ${value(options.profiles, "Não informado")}

## Tipo de software
- ${value(options.projectType, "other")}

## Status
Rascunho

## Aprovação humana
Pendente`
    },
    {
      path: ".sdd-master/discovery/initial-risks.md",
      content: () => `# Riscos Iniciais

## Riscos
-

## Mitigações
-

## Aprovação humana
Pendente`
    },
    {
      path: ".sdd-master/discovery/constraints.md",
      content: () => `# Restrições

## Restrições conhecidas
-

## Aprovação humana
Pendente`
    },
    {
      path: "docs/01-negocio-requisitos/visao-do-produto.md",
      content: (options) => publicDoc("Visão do Produto", options)
    },
    {
      path: "docs/01-negocio-requisitos/publico-alvo.md",
      content: () => publicSimpleDoc("Público-alvo")
    },
    {
      path: "docs/01-negocio-requisitos/requisitos-iniciais.md",
      content: () => publicSimpleDoc("Requisitos Iniciais")
    }
  ]
};

function publicDoc(title: string, options: WorkflowOptions): string {
  return `# ${title}

## Projeto
${value(options.title, "Projeto sem título")}

## Tipo de software
${value(options.projectType, "other")}

## Status
Rascunho

## Aprovação humana
Pendente`;
}

function publicSimpleDoc(title: string): string {
  return `# ${title}

## Conteúdo
[Preencher]

## Status
Rascunho

## Aprovação humana
Pendente`;
}

function value(input: string | undefined, fallback: string): string {
  const trimmed = input?.trim();
  return trimmed ? trimmed : fallback;
}
