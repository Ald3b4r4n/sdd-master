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
sdd master onboard --profile="web" --ai="codex"
```

O onboarding é recomendado antes do discovery, mas não substitui os gates do workflow.

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

Para preparar handoff assistido sem alterar código:

```bash
sdd master implement --yes --prepare --handoff --manifest --test-contract --agent="codex"
```

O pacote assistido fica em `.sdd-master/implementation/` e continua exigindo aprovação humana antes de qualquer execução real.

## Design antes de implementar

Para projetos com interface, rode os gates de design antes do implement:

```bash
sdd master uiux --yes --phase="PHASE-01" --profile="WEB" --title="Revisão UI/UX inicial" --status=approved
sdd master uiux --yes --type="design-system" --phase="PHASE-01" --profile="WEB"
sdd master uiux --yes --type="accessibility" --phase="PHASE-01" --profile="WEB"
sdd master uiux --yes --type="seo" --phase="PHASE-01" --profile="WEB"
sdd master uiux --yes --type="responsiveness" --phase="PHASE-01" --profile="WEB"
```

Skills externas podem ser propostas com `sdd master skills`, e plugins/extensoes com `sdd master plugins`, mas ambos só entram localmente como metadados após aprovação humana.

## Release e deploy guards

Depois de implementar no futuro e revalidar quality, audit e docs, prepare entrega com:

```bash
sdd master release --yes --version="0.3.0-alpha" --channel="alpha" --type="local" --dry-run
sdd master deploy --yes --environment="staging" --provider="manual" --strategy="manual" --dry-run
```

Esses comandos sao guards/checklists. Eles nao publicam pacote, nao criam tag, nao publicam GitHub Release e nao fazem deploy real.
