# Checklist de Publicação npm — SDD Master

## Stable 1.0.0

Publicação concluída: `sdd-master@1.0.0`.

Comando permitido:

```bash
npm publish --access public --tag latest
```

Instalação:

```bash
npm install -g sdd-master
```

Resultado: `npm publish --access public --tag latest` executado após autorização humana explícita. A dist-tag `latest` aponta para `1.0.0`; `prototype`, `alpha`, `beta` e `rc` foram preservadas como histórico.

## RC 0.8.0

Publicação concluída: `sdd-master@0.8.0-rc`.

Comando permitido:

```bash
npm publish --access public --tag rc
```

Instalação:

```bash
npm install -g sdd-master@rc
```

Resultado: `npm publish --access public --tag rc` executado após autorização humana explícita. A dist-tag `rc` aponta para `0.8.0-rc`; `latest`, `prototype`, `alpha` e `beta` foram preservadas.

## Status

Publicação beta concluída para `sdd-master@0.5.0-beta`.

Versão prerelease publicada: `0.5.0-beta`.

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

Observação: a publicação beta foi feita com `npm publish --access public --tag beta`. A instalação pública para este estágio é `sdd-master@beta`.

Dist-tags verificadas:

- `alpha`: `0.3.0-alpha`
- `beta`: `0.5.0-beta`
- `prototype`: `0.2.0-prototype`
- `latest`: `0.1.0-prototype.1`

Evite usar:

```bash
npm install -g sdd-master
```

até existir uma release estável.

## Antes de publicar

- [x] Confirmar nome do pacote no npm.
- [x] Confirmar login npm.
- [x] Confirmar versão em `package.json`.
- [x] Confirmar tag Git correspondente `v0.5.0-beta` somente após autorização.
- [x] Confirmar GitHub prerelease.
- [x] Executar `npm run check`.
- [x] Executar `npm publish --dry-run --access public --tag beta`.
- [x] Confirmar no output do dry-run que a tag npm planejada é `beta`.
- [x] Registrar que `latest` permanece em `0.1.0-prototype.1`.
- [x] Executar `sdd master git --pre-push`.
- [x] Confirmar ausência de `.env`.
- [x] Confirmar ausência de segredos.
- [x] Confirmar ausência de `.sdd-master/` na raiz.
- [x] Confirmar que PDFs locais não entram no pacote.
- [x] Confirmar aprovação humana explícita.

## Comando de publicação real

```bash
npm publish --access public --tag beta
```

## Regra

Não executar nova publicação real sem autorização humana explícita.

## Resultado

- `npm publish --access public --tag beta`: executado.
- Primeira tentativa: bloqueada por TLS local (`UNABLE_TO_VERIFY_LEAF_SIGNATURE`).
- Repetição autorizada: executada com `NODE_OPTIONS=--use-system-ca`.
- `strict-ssl=false`: não usado.
