# Checklist de Publicação npm — SDD Master

## Status

Preparação local/dry-run para publicação futura de `sdd-master@0.3.0-alpha`.

Versão prerelease preparada localmente: `0.3.0-alpha`.

## npm

Publicado no npm:

```bash
npm install -g sdd-master@prototype
```

Versão publicada:

```text
sdd-master@0.2.0-prototype
```

Dist-tag:

```text
prototype
```

Observação: a publicação futura deve usar `npm publish --access public --tag alpha`. A instalação pública atual permanece `sdd-master@prototype` até publicação real.

Evite usar:

```bash
npm install -g sdd-master
```

até existir uma release estável.

## Antes de publicar

- [ ] Confirmar nome do pacote no npm.
- [ ] Confirmar login npm.
- [ ] Confirmar versão em `package.json`.
- [ ] Confirmar tag Git correspondente `v0.3.0-alpha` somente após autorização.
- [ ] Confirmar GitHub Release draft.
- [ ] Executar `npm run check`.
- [ ] Executar `npm publish --dry-run --access public --tag alpha`.
- [ ] Confirmar no output do dry-run que a tag npm planejada é `alpha`.
- [ ] Se `latest` apontar para prototype por ser a única versão publicada, registrar o risco e a mitigação.
- [ ] Executar `sdd master git --pre-push`.
- [ ] Confirmar ausência de `.env`.
- [ ] Confirmar ausência de segredos.
- [ ] Confirmar ausência de `.sdd-master/` na raiz.
- [ ] Confirmar que PDFs locais não entram no pacote.
- [ ] Confirmar aprovação humana explícita.

## Comando de publicação real

```bash
npm publish --access public --tag alpha
```

## Regra

Não executar publicação real sem autorização humana explícita.
