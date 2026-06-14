# Checklist npm - v1.0.0

## Status

Publicação estável concluída para `sdd-master@1.0.0` com dist-tag `latest`.

## Comando

```bash
npm publish --access public --tag latest
```

## Instalação

```bash
npm install -g sdd-master
```

## Checklist

- [x] Confirmar `package.json` em `1.0.0`.
- [x] Confirmar `publishConfig.tag = latest`.
- [x] Executar `npm run check`.
- [x] Executar `npm publish --dry-run --access public --tag latest`.
- [x] Confirmar aprovação humana explícita.
- [x] Confirmar ausência de `.env` e segredos.

## Resultado

`latest` aponta para `1.0.0` após a publicação estável.

Verificação pós-publicação:

```bash
npm view sdd-master@1.0.0 version --json
npm view sdd-master dist-tags --json
```
