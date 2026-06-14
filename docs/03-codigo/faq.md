# FAQ

## A versao atual e estavel?

Sim. `1.0.0` e a versao estavel atual.

## Como instalar a versao atual?

```bash
npm install -g sdd-master
```

## Posso usar `npm install -g sdd-master`?

Sim. `latest` agora aponta para `1.0.0`.

## O SDD Master executa deploy?

Nao. `sdd master deploy` cria checklist e registro de readiness em dry-run/guard.

## O SDD Master publica npm?

Nao por comando da CLI. Publicacao real exige autorizacao humana separada e comando manual.

## Plugins rodam codigo?

Nao. O comando `plugins` registra metadados, policy, approval e auditoria local.
