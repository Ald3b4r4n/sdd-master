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

## Smoke test

```bash
npm run smoke
```

Executa o CLI buildado em `dist/cli/main.js` e valida comandos essenciais como ajuda, versão, doctor JSON e Git JSON.

## Validação de pacote

```bash
npm run package:check
```

Confirma metadados do `package.json`, arquivos públicos, assets, docs e binário buildado.

## Dry-run de empacotamento

```bash
npm run pack:dry-run
```

Executa `npm pack --dry-run` e bloqueia arquivos proibidos, como artefatos locais, segredos, PDFs e diretórios sensíveis.

## Check completo

```bash
npm run check
```

Executa build, testes, lint, formatação, smoke test, package check e dry-run de empacotamento.

## Simulando o CI localmente

O workflow público executa a mesma sequência básica esperada antes de revisão:

```bash
npm run build
npm test
npm run smoke
npm run package:check
npm run pack:dry-run
npm run check
```

## Executar CLI local

```bash
node dist/cli/main.js master help
node dist/cli/main.js master onboard --help
```

## Testar update seguro

Use diretórios temporários ou projetos consumidores de teste. Não execute `init` ou `update` real na raiz do pacote.

```bash
node dist/cli/main.js master update --dry-run
node dist/cli/main.js master update --apply --yes
```

O update deve criar backup apenas dos arquivos alterados, registrar relatório em `.sdd-master/reports/` e preservar documentos preenchidos ou sem marcador `Managed by: SDD Master`.

## Fluxo recomendado

1. Editar código TypeScript em `src/`.
2. Adicionar ou ajustar testes em `tests/`.
3. Rodar `npm run build`.
4. Rodar `npm test`.
5. Rodar `npm run smoke`.
6. Rodar `npm run package:check`.
7. Rodar `npm run pack:dry-run`.
8. Rodar `npm run check`.
9. Criar commit local apenas depois dos checks.

Use diretórios temporários nos testes de onboarding. Nunca execute `init` ou `onboard` na raiz do pacote.
