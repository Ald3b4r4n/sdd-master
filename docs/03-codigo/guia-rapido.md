# Guia Rapido

## Instalar

```bash
npm install -g sdd-master@rc
```

`0.8.0-rc` e release candidate, nao estavel.

## Comecar um projeto

```bash
sdd master init --yes --preset="ecommerce" --ai="codex"
sdd master onboard --yes --profile="web" --ai="codex"
sdd master doctor
```

## Fluxo principal

```bash
sdd master discovery --yes
sdd master requirements --yes
sdd master clarify --yes
sdd master approve --yes
sdd master scope --yes
sdd master backlog --yes
sdd master spec --yes
sdd master plan --yes
sdd master tasks --yes
```

## Gates antes de implementar

```bash
sdd master uiux --yes
sdd master skills --yes
sdd master plugins --yes --title="Plugin Manual Seguro" --source="manual" --permission="read-docs"
sdd master security --json
sdd master quality --yes
sdd master audit --yes
sdd master docs --yes
sdd master implement --yes --prepare --handoff --manifest --test-contract
```

## Release e deploy seguros

```bash
sdd master release --yes --version="0.8.0-rc" --channel="rc" --type="local" --dry-run
sdd master deploy --yes --environment="staging" --provider="manual" --strategy="manual" --dry-run
```

Esses comandos nao publicam e nao fazem deploy.
