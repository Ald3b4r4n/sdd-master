# Governança SDD

Este documento descreve os comandos de governança adicionados antes da futura implementação.

## Clarifications

`sdd master clarify` registra dúvidas, ambiguidades e respostas humanas em `.sdd-master/clarifications/`.

Clarificações abertas bloqueiam a futura implementação porque indicam que o agente ainda não tem contexto suficiente para executar tarefas com segurança.

## Approvals

`sdd master approve` registra decisões humanas formais em `.sdd-master/approvals/`.

Aprovação nunca é presumida. Todo registro de aprovação usa `Aprovador: Humano` e pode aprovar, rejeitar ou manter pendente um target como `discovery`, `requirements`, `spec`, `plan` ou `tasks`.

## Scope

`sdd master scope` controla:

- escopo aprovado;
- itens fora de escopo;
- mudanças de escopo.

Mudança de escopo aberta bloqueia a futura implementação até que uma decisão humana resolva o impacto em requisitos, arquitetura, tarefas, testes e documentação.

## Backlog

`sdd master backlog` registra itens futuros, melhorias, dívida técnica, riscos futuros e ideias fora do escopo atual.

Backlog não autoriza implementação. Um item de backlog só pode virar trabalho executável depois de promoção por fluxo formal futuro, com escopo e aprovação humana.

## Blockers

O SDD Master calcula bloqueios formais para impedir avanço indevido. Neste bloco, os bloqueios aparecem em `sdd master status` e `sdd master doctor`.

## Implement readiness

Para a futura implementação ser considerada pronta, o projeto deve ter:

1. discovery criado;
2. requirements criados;
3. spec criada;
4. plan criado;
5. tasks criadas;
6. nenhuma clarificação aberta;
7. nenhuma mudança de escopo aberta;
8. aprovação humana para discovery, requirements, spec, plan e tasks;
9. nenhum blocker ativo;
10. nenhum risco obrigatório sem aceite.
11. test gates obrigatórios definidos na tarefa alvo.
12. Implement Guard sem bloqueios.

Enquanto esses critérios não forem atendidos, o status deve indicar:

```text
Implementação:
  Pronta: Não
  Bloqueios:
    - Aprovação de tasks pendente
    - Clarificações abertas
```

## Regra central

Sem aprovação humana, sem implementação.
Sem dúvidas resolvidas, sem implementação.
Sem escopo aprovado, sem implementação.
Sem tarefas aprovadas, sem implementação.
Sem test gates definidos, sem implementação.
