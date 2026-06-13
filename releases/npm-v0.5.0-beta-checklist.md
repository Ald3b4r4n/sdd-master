# Checklist npm — v0.5.0-beta

## Publicação planejada

```bash
npm publish --access public --tag beta
```

## Checks obrigatórios

- [ ] `npm run build`
- [ ] `npm test`
- [ ] `npm run smoke`
- [ ] `npm run package:check`
- [ ] `npm run pack:dry-run`
- [ ] `npm run release:check`
- [ ] `npm run check`
- [ ] `npm publish --dry-run --access public --tag beta`
- [ ] `sdd master git --pre-push`

## Regras

- Não usar `latest`.
- Não alterar `prototype` manualmente.
- Não alterar `alpha` manualmente.
- Publicar somente após autorização humana explícita.
