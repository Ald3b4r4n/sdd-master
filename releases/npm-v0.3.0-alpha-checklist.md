# Checklist npm — v0.3.0-alpha

## Antes de publicar

- [ ] `npm run build`
- [ ] `npm test`
- [ ] `npm run smoke`
- [ ] `npm run package:check`
- [ ] `npm run pack:dry-run`
- [ ] `npm run release:check`
- [ ] `npm run check`
- [ ] `npm publish --dry-run --access public --tag alpha`
- [ ] `sdd master git --pre-push`
- [ ] tag `v0.3.0-alpha` criada somente após autorização
- [ ] npm publish real somente após autorização
- [ ] GitHub prerelease somente após autorização

## Comando futuro

```bash
npm publish --access public --tag alpha
```

## Proibido

- publicar como stable;
- mover tags antigas;
- usar `latest` manualmente;
- publicar sem autorização humana;
- commitar segredos;
- commitar `.env`;
- criar deploy automático.
