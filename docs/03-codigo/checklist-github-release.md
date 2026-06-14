# Checklist de GitHub Release — SDD Master

## RC 0.8.0

Prerelease publicada: `v0.8.0-rc`.

Comando executado após autorização humana:

```bash
gh release create v0.8.0-rc --prerelease --title "v0.8.0-rc" --notes-file releases/github-v0.8.0-rc-notes.md
```

Resultado: https://github.com/Ald3b4r4n/sdd-master/releases/tag/v0.8.0-rc

Nao foi criada release estavel neste bloco.

## Status

Prerelease `v0.5.0-beta` publicada no GitHub.

A tag inicial `v0.1.0-prototype`, a tag `v0.1.0-prototype.1`, a tag `v0.2.0-prototype` e a tag `v0.3.0-alpha` devem ser preservadas sem reescrita.

## Publicação da prerelease

- [x] Confirmar tag remota `v0.5.0-beta` somente após autorização.
- [x] Confirmar que `v0.1.0-prototype` não foi movida ou reescrita.
- [x] Confirmar que `v0.3.0-alpha` não foi movida ou reescrita.
- [x] Confirmar que a release será criada como prerelease.
- [x] Confirmar release notes seguras.
- [x] Confirmar que não há `.env`.
- [x] Confirmar que não há segredos.
- [x] Confirmar que PDFs locais não entram na release.
- [x] Executar `npm run check`.
- [x] Executar `sdd master git --pre-push`.
- [x] Obter aprovação humana explícita.

## Comando para criar prerelease

A prerelease beta deve ser criada apenas com aprovação humana explícita.

```bash
gh release create v0.5.0-beta --prerelease --title "v0.5.0-beta" --notes-file releases/github-v0.5.0-beta-notes.md
```

## Regra

Não publicar release estável sem autorização humana explícita.

## Resultado

Prerelease publicada em:

```text
https://github.com/Ald3b4r4n/sdd-master/releases/tag/v0.5.0-beta
```
