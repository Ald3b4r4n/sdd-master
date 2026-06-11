# Checklist de Publicação npm — SDD Master

## Status

Publicação real executada para `sdd-master@0.1.0-prototype.1`.

Versão prerelease atual: `0.1.0-prototype.1`.

## npm

Publicado no npm:

```bash
npm install -g sdd-master@prototype
```

Versão publicada:

```text
sdd-master@0.1.0-prototype.1
```

Dist-tag:

```text
prototype
```

Observação: por ser a primeira versão publicada, o npm também manteve `latest` apontando para `0.1.0-prototype.1`. A instalação recomendada neste estágio permanece `sdd-master@prototype`.

## Antes de publicar

- [ ] Confirmar nome do pacote no npm.
- [ ] Confirmar login npm.
- [ ] Confirmar versão em `package.json`.
- [ ] Confirmar tag Git correspondente `v0.1.0-prototype.1`.
- [ ] Confirmar GitHub Release draft.
- [ ] Executar `npm run check`.
- [ ] Executar `npm publish --dry-run --access public --tag prototype`.
- [ ] Confirmar no output do dry-run que a tag npm é `prototype`, não `latest`.
- [ ] Executar `sdd master git --pre-push`.
- [ ] Confirmar ausência de `.env`.
- [ ] Confirmar ausência de segredos.
- [ ] Confirmar ausência de `.sdd-master/` na raiz.
- [ ] Confirmar que PDFs locais não entram no pacote.
- [ ] Confirmar aprovação humana explícita.

## Comando de publicação real

```bash
npm publish --access public --tag prototype
```

## Regra

Não executar publicação real sem autorização humana explícita.
