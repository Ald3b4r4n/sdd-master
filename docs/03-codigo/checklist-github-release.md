# Checklist de GitHub Release — SDD Master

## Status

Prerelease `v0.3.0-alpha` preparada localmente. Ainda não publicada.

A tag inicial `v0.1.0-prototype`, a tag `v0.1.0-prototype.1` e a tag `v0.2.0-prototype` devem ser preservadas sem reescrita.

## Antes de publicar a release final

- [ ] Confirmar tag remota `v0.3.0-alpha` somente após autorização.
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
gh release create v0.3.0-alpha --prerelease --title "v0.3.0-alpha" --notes-file releases/github-v0.3.0-alpha-notes.md
```

## Regra

Não publicar release estável sem autorização humana explícita.
