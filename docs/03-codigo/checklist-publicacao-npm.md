# Checklist de Publicação npm — SDD Master

## Status

Preparação de publicação beta para `sdd-master@0.5.0-beta`.

Versão prerelease preparada: `0.5.0-beta`.

## npm

Publicado no npm:

```bash
npm install -g sdd-master@beta
```

Versão publicada:

```text
sdd-master@0.5.0-beta
```

Dist-tag:

```text
beta
```

Observação: a publicação beta deve ser feita com `npm publish --access public --tag beta`. A instalação pública pretendida para este estágio é `sdd-master@beta`.

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
- [ ] Confirmar tag Git correspondente `v0.5.0-beta` somente após autorização.
- [ ] Confirmar GitHub prerelease.
- [ ] Executar `npm run check`.
- [ ] Executar `npm publish --dry-run --access public --tag beta`.
- [ ] Confirmar no output do dry-run que a tag npm planejada é `beta`.
- [ ] Registrar que `latest` permanece em `0.1.0-prototype.1`.
- [ ] Executar `sdd master git --pre-push`.
- [ ] Confirmar ausência de `.env`.
- [ ] Confirmar ausência de segredos.
- [ ] Confirmar ausência de `.sdd-master/` na raiz.
- [ ] Confirmar que PDFs locais não entram no pacote.
- [ ] Confirmar aprovação humana explícita.

## Comando de publicação real

```bash
npm publish --access public --tag beta
```

## Regra

Não executar nova publicação real sem autorização humana explícita.
