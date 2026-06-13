# FAQ

## O RC e estavel?

Nao. `0.8.0-rc` e candidato a release estavel, mas ainda nao e `1.0.0`.

## Como instalar o RC?

```bash
npm install -g sdd-master@rc
```

## Posso usar `npm install -g sdd-master`?

Evite ate `1.0.0`, porque `latest` nao deve ser movida manualmente durante o RC.

## O SDD Master executa deploy?

Nao. `sdd master deploy` cria checklist e registro de readiness em dry-run/guard.

## O SDD Master publica npm?

Nao por comando da CLI. Publicacao real exige autorizacao humana separada e comando manual.

## Plugins rodam codigo?

Nao. O comando `plugins` registra metadados, policy, approval e auditoria local.
