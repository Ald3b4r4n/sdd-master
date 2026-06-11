# Desenvolvimento Local

## Instalação

```bash
npm install
```

## Build

```bash
npm run build
```

## Testes

```bash
npm test
```

## Check completo

```bash
npm run check
```

## Executar CLI local

```bash
node dist/cli/main.js master help
```

## Fluxo recomendado

1. Editar código TypeScript em `src/`.
2. Adicionar ou ajustar testes em `tests/`.
3. Rodar `npm run build`.
4. Rodar `npm test`.
5. Rodar `npm run check`.
6. Criar commit local apenas depois dos checks.
