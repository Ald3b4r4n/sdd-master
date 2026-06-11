# Checklist de Publicação npm — SDD Master

## Status

Publicação real ainda não executada.

Versão prerelease atual: `0.1.0-prototype.1`.

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
