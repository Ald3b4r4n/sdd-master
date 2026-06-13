# Checklist de GitHub Release — SDD Master

## Status

Prerelease `v0.3.0-alpha` publicada no GitHub.

A tag inicial `v0.1.0-prototype`, a tag `v0.1.0-prototype.1` e a tag `v0.2.0-prototype` devem ser preservadas sem reescrita.

## Antes de publicar a release final

- [x] Confirmar tag remota `v0.3.0-alpha` somente após autorização.
- [x] Confirmar que `v0.1.0-prototype` não foi movida ou reescrita.
- [x] Confirmar que a release foi criada como prerelease.
- [x] Confirmar release notes seguras.
- [x] Confirmar que não há `.env`.
- [x] Confirmar que não há segredos.
- [x] Confirmar que PDFs locais não entram na release.
- [x] Executar `npm run check`.
- [x] Executar `sdd master git --pre-push`.
- [x] Obter aprovação humana explícita.

## Comando para criar prerelease

A prerelease foi criada com aprovação humana explícita.

```bash
gh release create v0.3.0-alpha --prerelease --title "v0.3.0-alpha" --notes-file releases/github-v0.3.0-alpha-notes.md
```

## Regra

Não publicar release estável sem autorização humana explícita.
