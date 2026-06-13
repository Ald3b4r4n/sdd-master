# Release e Deploy Guards

## Visao geral

O SDD Master inclui dois comandos de preparacao:

- `sdd master release`
- `sdd master deploy`

Eles criam planos, checklists, riscos e aprovacoes pendentes. Eles nao executam publicacao nem deploy real.

## Release guard

`sdd master release` valida readiness para uma release futura.

Ele registra:

- plano de release em `.sdd-master/releases/`;
- checklist em `.sdd-master/releases/checklists/`;
- gates de workflow, governanca, quality, audit, docs, blockers, implement guard, test gates, UI/UX, security/git, package check, npm dry-run e release notes.
- gate de segurança avançada para relatório/auditoria `blocked` e saída não redigida.

O comando nao cria tag, nao publica npm e nao cria GitHub Release.

## Deploy guard

`sdd master deploy` valida readiness para uma entrega futura.

Ele registra:

- plano de deploy em `.sdd-master/deliveries/`;
- checklist em `.sdd-master/deliveries/checklists/`;
- ambiente, provider, estrategia, rollback, observability, env vars e secrets por nome.

O comando nao acessa servidor, nao envia arquivos, nao usa SSH/SFTP/FTP/rsync/scp e nao executa scripts remotos.

## Segurança avançada

Release e deploy são bloqueados quando o último relatório de segurança está `blocked`, a auditoria decide `Bloqueado` ou um artefato contém valor suspeito não redigido.

A ausência de `gitleaks` ou `trufflehog` não bloqueia por padrão. Esses scanners continuam opcionais e não são executados pelos guards.

## Plano versus execucao real

Um plano documenta intencao, riscos, gates e aprovacoes pendentes.

Execucao real de release ou deploy e uma etapa separada, fora destes guards, e exige autorizacao humana explicita.

## Por que deploy real e perigoso

Deploy real pode alterar ambiente publico, dados, infraestrutura, custos e disponibilidade. Por isso, o SDD Master exige checklist, rollback e aprovacao humana antes de qualquer execucao.

## Env vars sem valores

Os planos devem listar apenas nomes:

```text
NODE_ENV
APP_ENV
DEPLOY_TOKEN
```

Valores reais nao devem ser escritos em arquivos, commits, logs ou documentacao.

## Rollback

Todo deploy real futuro deve ter plano de rollback revisado antes da execucao. O guard bloqueia ou recomenda correcao quando rollback esta ausente.

## Observability

Todo deploy real futuro deve definir monitoramento, sinais de falha e pontos de verificacao pos-deploy.

## Aprovacao humana

Release e deploy reais dependem de autorizacao humana explicita. Os guards registram essa aprovacao como pendente.

## Preparacao para 0.3.0-alpha

Estes comandos criam a base operacional para `0.3.0-alpha`, onde o SDD Master sera validado em projetos reais sem automatizar publicacao ou deploy perigoso.
