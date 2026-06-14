# Checklist npm - v0.8.0-rc

## Status

Publicacao concluida para `sdd-master@0.8.0-rc` com dist-tag `rc`.

## Comando autorizado

```bash
npm publish --access public --tag rc
```

## Antes de publicar

- [x] `npm whoami`
- [x] `npm view sdd-master name version dist-tags --json`
- [x] `npm view sdd-master@0.8.0-rc version --json`
- [x] `npm run check`
- [x] `npm publish --dry-run --access public --tag rc`
- [x] `node dist/cli/main.js master git --pre-push`
- [x] Confirmar ausencia de `.env`
- [x] Confirmar ausencia de `.sdd-master/` na raiz
- [x] Confirmar que PDFs nao foram recriados
- [x] Obter autorizacao humana exata

## Regras

- Não usar `latest`.
- Nao alterar `prototype`, `alpha` ou `beta` manualmente.
- Nao mover tags antigas.
- Nao publicar release estavel.

## Resultado

- `npm publish --access public --tag rc`: executado.
- `rc`: `0.8.0-rc`.
- `latest`: preservada em `0.1.0-prototype.1`.
