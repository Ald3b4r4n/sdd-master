# Checklist de GitHub Release — SDD Master

## Status

Release draft criada.
Release final ainda não publicada.

A tag inicial `v0.1.0-prototype` foi preservada sem reescrita. A versão corrente para alinhamento antes da publicação npm futura é `v0.1.0-prototype.1`.

## Antes de publicar a release final

- [ ] Confirmar tag remota `v0.1.0-prototype.1`.
- [ ] Confirmar que `v0.1.0-prototype` não foi movida ou reescrita.
- [ ] Confirmar release draft vinculada à tag correta.
- [ ] Confirmar `isDraft: true` antes da publicação.
- [ ] Confirmar `publishedAt` vazio antes da publicação.
- [ ] Confirmar release notes seguras.
- [ ] Confirmar que não há `.env`.
- [ ] Confirmar que não há segredos.
- [ ] Confirmar que PDFs locais não entram na release.
- [ ] Executar `npm run check`.
- [ ] Executar `sdd master git --pre-push`.
- [ ] Obter aprovação humana explícita.

## Comando para publicar draft futuramente

A publicação final deve ser feita apenas com aprovação humana explícita.

Exemplo futuro:

```bash
gh release edit v0.1.0-prototype.1 --draft=false
```

## Regra

Não publicar release final sem autorização humana explícita.
