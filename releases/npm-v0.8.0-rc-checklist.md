# Checklist npm - v0.8.0-rc

## Status

Publicacao planejada para `sdd-master@0.8.0-rc` com dist-tag `rc`.

## Comando autorizado

```bash
npm publish --access public --tag rc
```

## Antes de publicar

- [ ] `npm whoami`
- [ ] `npm view sdd-master name version dist-tags --json`
- [ ] `npm view sdd-master@0.8.0-rc version --json` retorna E404 esperado
- [ ] `npm run check`
- [ ] `npm publish --dry-run --access public --tag rc`
- [ ] `node dist/cli/main.js master git --pre-push`
- [ ] Confirmar ausencia de `.env`
- [ ] Confirmar ausencia de `.sdd-master/` na raiz
- [ ] Confirmar que PDFs nao foram recriados
- [ ] Obter autorizacao humana exata

## Regras

- Não usar `latest`.
- Nao alterar `prototype`, `alpha` ou `beta` manualmente.
- Nao mover tags antigas.
- Nao publicar release estavel.
