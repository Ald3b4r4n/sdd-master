import type { WorkflowStep } from "../workflow-types.js";

export const planStep: WorkflowStep = {
  command: "plan",
  title: "Plan",
  heading: "Plan",
  phaseLabel: "PHASE-04",
  requiredPath: ".sdd-master/specs/phase-01-spec.md",
  nextCommand: "/sdd-master-tasks",
  projectState: {
    currentPhase: "PHASE-04 — Planning",
    lastCompleted: "PHASE-03 — Specification",
    nextCommand: "/sdd-master-tasks"
  },
  files: [
    {
      path: ".sdd-master/plans/phase-01-plan.md",
      content: (options) => `# Plano Técnico — ${options.phase}

## Metadados
- ID: ${options.phase}-PLAN
- Fase: ${options.phase}
- Status: Rascunho
- Aprovação humana: Pendente

## Objetivo técnico
[Descrever objetivo técnico.]

## Escopo aprovado
-

## Fora de escopo
-

## Arquitetura impactada
-

## Estratégia de TDD
- Testes a criar antes:
- Falhas esperadas:
- Evidências esperadas:

## Estratégia de implementação
-

## Documentação impactada
-

## Riscos
-

## Rollback
- Aplicável:
- Estratégia:

## Critérios de aceite técnico
-

## Próximo comando recomendado
/sdd-master-tasks`
    },
    {
      path: "docs/02-tecnica-arquitetura/plano-tecnico-inicial.md",
      content: () => `# Plano Técnico Inicial

## Conteúdo
[Preencher]

## Status
Rascunho

## Aprovação humana
Pendente`
    }
  ]
};
