# Suporte e Politica de Versao

## Canais npm

- `prototype`: linha historica de prototipos.
- `alpha`: linha alpha.
- `beta`: linha beta.
- `rc`: release candidate `0.8.0-rc`.
- `latest`: reservado para release estavel.

## Regras

- Nao mover `latest` manualmente durante RC.
- Nao alterar `prototype`, `alpha` ou `beta` manualmente neste bloco.
- Publicar RC somente com `npm publish --access public --tag rc`.
- Criar GitHub Release do RC como prerelease.

## Suporte

Durante o RC, bugs de seguranca, path safety, redaction, release/deploy guards e quebra de JSON publico tem prioridade maxima.
