# Checklist npm - v1.0.0

## Status

Publicação estável preparada para `sdd-master@1.0.0`.

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
