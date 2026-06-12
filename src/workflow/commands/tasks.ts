import type { WorkflowStep } from "../workflow-types.js";

export const tasksStep: WorkflowStep = {
  command: "tasks",
  title: "Tasks",
  heading: "Tasks",
  phaseLabel: "PHASE-05",
  requiredPath: ".sdd-master/plans/phase-01-plan.md",
  nextCommand: "/sdd-master-implement",
  projectState: {
    currentPhase: "PHASE-05 — Tasks",
    lastCompleted: "PHASE-04 — Planning",
    nextCommand: "/sdd-master-implement"
  },
  files: [
    {
      path: ".sdd-master/tasks/phase-01-tasks.md",
      content: (options) => `# Tarefas da Fase — ${options.phase}

## Tarefas
- TASK-001

## Status
Rascunho

## Aprovação humana
Pendente

## Próximo comando recomendado
/sdd-master-implement`
    },
    {
      path: ".sdd-master/tasks/TASK-001.md",
      content: (options) => `# TASK-001 — ${options.title ?? "[Título]"}

## Origem
${options.phase}

## Requisito relacionado
- RF-001

## Descrição
[Descrever tarefa.]

## Critérios de aceite
-

## Testes obrigatórios antes da implementação
-

## Documentação impactada
-

## Arquivos/áreas prováveis
-

## Dependências
-

## Riscos
-

## Status
Rascunho

## Aprovação humana
Pendente`
    },
    {
      path: "docs/03-codigo/tarefas-iniciais.md",
      content: () => `# Tarefas Iniciais

## Conteúdo
[Preencher]

## Status
Rascunho

## Aprovação humana
Pendente`
    }
  ]
};
