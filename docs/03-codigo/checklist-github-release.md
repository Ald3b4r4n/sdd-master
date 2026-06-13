# Checklist de GitHub Release — SDD Master

## Status

Prerelease `v0.5.0-beta` preparada para publicação no GitHub.

A tag inicial `v0.1.0-prototype`, a tag `v0.1.0-prototype.1`, a tag `v0.2.0-prototype` e a tag `v0.3.0-alpha` devem ser preservadas sem reescrita.

## Antes de publicar a release final

- [ ] Confirmar tag remota `v0.5.0-beta` somente após autorização.
- [x] Confirmar que `v0.1.0-prototype` não foi movida ou reescrita.
- [x] Confirmar que `v0.3.0-alpha` não foi movida ou reescrita.
- [ ] Confirmar que a release será criada como prerelease.
- [ ] Confirmar release notes seguras.
- [ ] Confirmar que não há `.env`.
- [ ] Confirmar que não há segredos.
- [ ] Confirmar que PDFs locais não entram na release.
- [ ] Executar `npm run check`.
- [ ] Executar `sdd master git --pre-push`.
- [ ] Obter aprovação humana explícita.

## Comando para criar prerelease

A prerelease beta deve ser criada apenas com aprovação humana explícita.

```bash
gh release create v0.5.0-beta --prerelease --title "v0.5.0-beta" --notes-file releases/github-v0.5.0-beta-notes.md
```

## Regra

Não publicar release estável sem autorização humana explícita.
