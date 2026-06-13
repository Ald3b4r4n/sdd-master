# Checklist npm — v0.5.0-beta

## Publicação executada

```bash
npm publish --access public --tag beta
```

## Checks obrigatórios

- [x] `npm run build`
- [x] `npm test`
- [x] `npm run smoke`
- [x] `npm run package:check`
- [x] `npm run pack:dry-run`
- [x] `npm run release:check`
- [x] `npm run check`
- [x] `npm publish --dry-run --access public --tag beta`
- [x] `sdd master git --pre-push`

## Regras

- Não usar `latest`.
- Não alterar `prototype` manualmente.
- Não alterar `alpha` manualmente.
- Publicar somente após autorização humana explícita.

## Resultado

- Publicado: `sdd-master@0.5.0-beta`.
- Dist-tag: `beta`.
- `latest`: preservada em `0.1.0-prototype.1`.
- Fallback TLS usado: `NODE_OPTIONS=--use-system-ca`.
