# Checklist de Publicação npm — SDD Master

## Status

Publicação real concluída para `sdd-master@0.3.0-alpha`.

Versão prerelease publicada: `0.3.0-alpha`.

## npm

Publicado no npm:

```bash
npm install -g sdd-master@alpha
```

Versão publicada:

```text
sdd-master@0.3.0-alpha
```

Dist-tag:

```text
alpha
```

Observação: a publicação foi feita com `npm publish --access public --tag alpha`. A instalação pública recomendada para este estágio é `sdd-master@alpha`.

Dist-tags verificadas:

- `alpha`: `0.3.0-alpha`
- `prototype`: `0.2.0-prototype`
- `latest`: `0.1.0-prototype.1`

Evite usar:

```bash
npm install -g sdd-master
```

até existir uma release estável.

## Antes de publicar

- [ ] Confirmar nome do pacote no npm.
- [ ] Confirmar login npm.
- [ ] Confirmar versão em `package.json`.
- [x] Confirmar tag Git correspondente `v0.3.0-alpha` somente após autorização.
- [x] Confirmar GitHub prerelease.
- [x] Executar `npm run check`.
- [x] Executar `npm publish --dry-run --access public --tag alpha`.
- [x] Confirmar no output do dry-run que a tag npm planejada é `alpha`.
- [x] Registrar que `latest` permanece em `0.1.0-prototype.1`.
- [x] Executar `sdd master git --pre-push`.
- [x] Confirmar ausência de `.env`.
- [x] Confirmar ausência de segredos.
- [x] Confirmar ausência de `.sdd-master/` na raiz.
- [x] Confirmar que PDFs locais não entram no pacote.
- [x] Confirmar aprovação humana explícita.

## Comando de publicação real

```bash
npm publish --access public --tag alpha
```

## Regra

Não executar nova publicação real sem autorização humana explícita.
