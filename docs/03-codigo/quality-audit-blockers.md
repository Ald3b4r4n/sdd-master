# Quality, audit, docs e blockers

O BLOCO 19 adiciona portões formais antes da futura implementação.

## Quality

`sdd master quality` registra revisões de qualidade em `.sdd-master/quality/`.

Status aceitos neste bloco:

- `passed`;
- `warning`;
- `failed`.

Uma revisão `failed` cria ou aciona blocker e impede readiness de implementação.

## Audit

`sdd master audit` registra auditorias em `.sdd-master/audits/`.

Severidades:

- `INFO`;
- `LOW`;
- `MEDIUM`;
- `HIGH`;
- `CRITICAL`;
- `BLOCKER`.

Achados `BLOCKER` criam blocker ativo. Achados `HIGH` e `CRITICAL` aparecem em `status` e `doctor` e também impedem readiness enquanto estiverem abertos.

## Docs

`sdd master docs` registra estado documental em `.sdd-master/docs/`.

O comando verifica se existem os três eixos públicos:

- `docs/01-negocio-requisitos/`;
- `docs/02-tecnica-arquitetura/`;
- `docs/03-codigo/`.

Status `missing` e `outdated` bloqueiam readiness de implementação.

## Blocker

`sdd master blocker` cria, lista, consulta e resolve blockers formais em `.sdd-master/blockers/`.

Blocker aberto impede avanço porque representa um impedimento formal ainda não resolvido. Resolver um blocker atualiza o índice, `status`, `doctor` e o cálculo de readiness.

## Relação com aprovação humana

Os portões não substituem aprovação humana. Eles apenas registram evidências e bloqueios.

A futura implementação continuará exigindo:

- aprovações humanas para discovery, requirements, spec, plan e tasks;
- dúvidas resolvidas;
- escopo controlado;
- quality sem falhas abertas;
- auditorias sem achados graves abertos;
- documentação sem pendências bloqueantes;
- nenhum blocker ativo.
