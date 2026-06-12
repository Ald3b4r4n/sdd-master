# Workflow SDD

O workflow SDD inicial organiza descoberta, requisitos, especificação, plano e tarefas antes de qualquer implementação.

## Ordem dos comandos

```bash
sdd master discovery --yes --title="Meu Projeto" --project-type="web" --profiles="WEB" --maturity="M0"
sdd master requirements --yes --title="Requisitos iniciais"
sdd master spec --yes --phase="PHASE-01" --title="Especificação inicial"
sdd master plan --yes --phase="PHASE-01" --title="Plano técnico inicial"
sdd master tasks --yes --phase="PHASE-01" --title="Tarefas iniciais"
```

## Pré-condições

Todos os comandos exigem projeto inicializado:

```bash
sdd master init
```

O fluxo tem guarda simples de ordem:

- `requirements` exige discovery.
- `spec` exige requirements.
- `plan` exige spec.
- `tasks` exige plan.

## Arquivos criados

Discovery cria documentos em `.sdd-master/discovery/` e `docs/01-negocio-requisitos/`.

Requirements cria índice, RF, RNF, regra de negócio e documentos públicos de requisitos.

Spec cria `.sdd-master/specs/phase-01-spec.md`.

Plan cria `.sdd-master/plans/phase-01-plan.md` e documentação técnica inicial.

Tasks cria `.sdd-master/tasks/phase-01-tasks.md`, `.sdd-master/tasks/TASK-001.md` e documentação pública de tarefas.

## Aprovação humana

Todos os documentos gerados registram:

```text
Aprovação humana: Pendente
```

Essa aprovação ainda não é aplicada como comando formal neste prototype, mas deve ser tratada como requisito operacional antes de avançar.

## Por que não implementar antes de tasks/testes

O SDD Master separa intenção, requisitos, especificação, plano e tarefas para evitar implementação sem escopo aprovado. A implementação deve vir depois de tarefas rastreáveis e testes obrigatórios definidos.

## Implement Guard

Depois de `tasks`, o próximo comando é:

```bash
sdd master implement --yes --phase="PHASE-01" --task="TASK-001" --dry-run
```

Neste prototype, `implement` não altera código. Ele valida readiness, test gates e segurança antes de uma futura implementação real.

## Comandos ainda pendentes

- `sdd master release`
- `sdd master deploy`
