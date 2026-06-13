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
- UI/UX aprovado quando o perfil exige interface;
- design system quando o perfil exige interface;
- acessibilidade quando o perfil exige interface;
- SEO para `WEB`, `SAAS` e `E-COMMERCE`;
- responsividade para perfis com tela;
- relatório de skills usadas;
- test gates;
- segurança/Git.

## Gates de design

Design deve ser o carro-chefe do SDD Master. Para perfis com interface, `implement` bloqueia quando UI/UX, design system, acessibilidade ou responsividade estão pendentes. Para presença web pública, SEO também bloqueia.

Perfis `API` e `AI-AGENT` aparecem como `not-applicable` para UI/UX visual. Perfil `CLI` mantém UX textual aplicável e não exige SEO visual.

## Test gates

Antes de implementação futura, a tarefa alvo deve declarar testes obrigatórios.

Critérios mínimos:

- `.sdd-master/tasks/phase-01-tasks.md` existe;
- `.sdd-master/tasks/TASK-001.md` existe;
- `TASK-001.md` contém `## Testes obrigatórios antes da implementação`;
- a seção contém pelo menos um item real.

## Implementação real futura

Uma implementação real deverá usar o manifesto `IMPLEMENT-XXX.md`, respeitar escopo aprovado e exigir autorização humana explícita.

## Implement assistido controlado

O comando também pode preparar um pacote assistido:

```bash
sdd master implement --yes --prepare --handoff --manifest --test-contract --agent="codex" --allowed-files="src/**,tests/**,docs/**"
```

Esse pacote cria sessão, manifesto, contrato de testes, handoff, aprovação pendente e riscos em `.sdd-master/implementation/`.

Mesmo nesse modo, nenhum código do consumidor é alterado automaticamente.

Depois de uma implementação real futura, execute:

```bash
sdd master quality
sdd master audit
sdd master docs
sdd master release
sdd master deploy
```

`release` e `deploy` continuam sendo guards/checklists: não publicam e não implantam automaticamente.

## Redução de risco

O guard reduz o risco de IA codar sem autorização porque transforma readiness em checklist explícito, auditável e bloqueante.
