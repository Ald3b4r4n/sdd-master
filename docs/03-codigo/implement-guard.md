# Implement Guard

`sdd master implement` existe como guardião de implementação.

Nesta versão prototype, ele não executa código, não altera arquivos de produto e não roda comandos arbitrários. O comportamento padrão é dry-run.

## Por que não executa código ainda

O SDD Master evita que uma IA comece a codar sem escopo aprovado, tarefas revisadas, documentação rastreável e aprovação humana. O comando `implement` deste bloco apenas verifica gates e gera um manifesto em `.sdd-master/implementation/`.

## Gates verificados

O guard verifica:

- discovery;
- requirements;
- spec;
- plan;
- tasks;
- aprovações humanas;
- clarificações abertas;
- mudanças de escopo;
- quality;
- audit;
- docs;
- blockers;
- test gates;
- segurança/Git.

## Test gates

Antes de implementação futura, a tarefa alvo deve declarar testes obrigatórios.

Critérios mínimos:

- `.sdd-master/tasks/phase-01-tasks.md` existe;
- `.sdd-master/tasks/TASK-001.md` existe;
- `TASK-001.md` contém `## Testes obrigatórios antes da implementação`;
- a seção contém pelo menos um item real.

## Implementação real futura

Uma implementação real deverá usar o manifesto `IMPLEMENT-XXX.md`, respeitar escopo aprovado e exigir autorização humana explícita.

## Redução de risco

O guard reduz o risco de IA codar sem autorização porque transforma readiness em checklist explícito, auditável e bloqueante.
