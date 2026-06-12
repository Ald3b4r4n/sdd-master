import type { WorkflowStep } from "../workflow-types.js";

export const specStep: WorkflowStep = {
  command: "spec",
  title: "Spec",
  heading: "Spec",
  phaseLabel: "PHASE-03",
  requiredPath: ".sdd-master/requirements/requirements-index.md",
  nextCommand: "/sdd-master-plan",
  projectState: {
    currentPhase: "PHASE-03 — Specification",
    lastCompleted: "PHASE-02 — Requirements",
    nextCommand: "/sdd-master-plan"
  },
  files: [
    {
      path: ".sdd-master/specs/phase-01-spec.md",
      content: (options) => `# Especificação da Fase — ${options.phase}

## Metadados
- ID: ${options.phase}-SPEC
- Fase: ${options.phase}
- Status: Rascunho
- Aprovação humana: Pendente

## Objetivo
[Descrever objetivo da fase.]

## Contexto
[Descrever contexto.]

## Escopo incluído
-

## Fora de escopo
-

## Requisitos relacionados
- RF-001
- RNF-001

## Critérios de aceite
-

## Critérios de não aceite
-

## Dúvidas abertas
Nenhuma registrada ainda.

## Decisões necessárias
-

## Próximo comando recomendado
/sdd-master-plan`
    }
  ]
};
