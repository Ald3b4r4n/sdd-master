# Checklist de GitHub Release — SDD Master

## Status

Prerelease `v0.2.0-prototype` preparada.

A tag inicial `v0.1.0-prototype` e a tag `v0.1.0-prototype.1` devem ser preservadas sem reescrita. A versão corrente é `v0.2.0-prototype`.

## Antes de publicar a release final

- [ ] Confirmar tag remota `v0.2.0-prototype`.
- [ ] Confirmar que `v0.1.0-prototype` não foi movida ou reescrita.
- [ ] Confirmar que a release será criada como prerelease.
- [ ] Confirmar release notes seguras.
- [ ] Confirmar que não há `.env`.
- [ ] Confirmar que não há segredos.
- [ ] Confirmar que PDFs locais não entram na release.
- [ ] Executar `npm run check`.
- [ ] Executar `sdd master git --pre-push`.
- [ ] Obter aprovação humana explícita.

## Comando para criar prerelease

A prerelease deve ser criada apenas com aprovação humana explícita.

```bash
gh release create v0.2.0-prototype --prerelease --title "v0.2.0-prototype" --notes-file releases/github-v0.2.0-prototype-notes.md
```

## Regra

Não publicar release estável sem autorização humana explícita.
