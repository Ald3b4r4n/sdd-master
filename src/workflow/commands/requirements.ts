import type { WorkflowStep } from "../workflow-types.js";

export const requirementsStep: WorkflowStep = {
  command: "requirements",
  title: "Requirements",
  heading: "Requirements",
  phaseLabel: "PHASE-02",
  requiredPath: ".sdd-master/discovery/initial-discovery.md",
  nextCommand: "/sdd-master-spec",
  projectState: {
    currentPhase: "PHASE-02 — Requirements",
    lastCompleted: "PHASE-01 — Discovery",
    nextCommand: "/sdd-master-spec"
  },
  files: [
    {
      path: ".sdd-master/requirements/requirements-index.md",
      content: () => `# Índice de Requisitos

## Requisitos funcionais
- RF-001

## Requisitos não funcionais
- RNF-001

## Regras de negócio
- BR-001

## Aprovação humana
Pendente

## Próximo comando recomendado
/sdd-master-spec`
    },
    {
      path: ".sdd-master/requirements/rf/RF-001.md",
      content: (options) => `# RF-001 — ${options.title ?? "[Título]"}

## Descrição
[Descrever requisito funcional inicial.]

## Prioridade
- MoSCoW: MUST
- Simples: Obrigatório
- Justificativa:
- Impacto se não for entregue:

## Critérios de aceite
-

## Critérios de não aceite
-

## Regras de negócio relacionadas
- BR-001

## RNFs relacionados
- RNF-001

## Testes esperados
-

## Status
Rascunho

## Aprovação humana
Pendente`
    },
    {
      path: ".sdd-master/requirements/rnf/RNF-001.md",
      content: () => simpleRequirement("RNF-001", "Requisito Não Funcional Inicial")
    },
    {
      path: ".sdd-master/requirements/business-rules/BR-001.md",
      content: () => simpleRequirement("BR-001", "Regra de Negócio Inicial")
    },
    {
      path: "docs/01-negocio-requisitos/requisitos-funcionais.md",
      content: () => publicDoc("Requisitos Funcionais")
    },
    {
      path: "docs/01-negocio-requisitos/requisitos-nao-funcionais.md",
      content: () => publicDoc("Requisitos Não Funcionais")
    },
    {
      path: "docs/01-negocio-requisitos/regras-de-negocio.md",
      content: () => publicDoc("Regras de Negócio")
    },
    {
      path: "docs/01-negocio-requisitos/criterios-de-aceite.md",
      content: () => publicDoc("Critérios de Aceite")
    }
  ]
};

function simpleRequirement(id: string, title: string): string {
  return `# ${id} — ${title}

## Descrição
[Preencher]

## Status
Rascunho

## Aprovação humana
Pendente`;
}

function publicDoc(title: string): string {
  return `# ${title}

## Conteúdo
[Preencher]

## Status
Rascunho

## Aprovação humana
Pendente`;
}
