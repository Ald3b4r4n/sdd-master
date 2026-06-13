# Exemplos Práticos — SDD Master

## Projeto web

```bash
sdd master init --yes --language="pt-BR" --agent="codex" --project-name="Minha Loja" --project-type="web"
sdd master onboard --yes --profile="web" --ai="codex"
sdd master discovery --yes
sdd master requirements --yes
sdd master spec --yes
sdd master plan --yes
sdd master tasks --yes
sdd master uiux --yes
sdd master quality --yes
sdd master audit --yes
sdd master implement --yes --prepare --handoff --manifest --test-contract
```

## Projeto API

```bash
sdd master init --yes --language="pt-BR" --agent="codex" --project-name="Minha API" --project-type="api"
sdd master onboard --yes --profile="api"
sdd master discovery --yes
sdd master requirements --yes
sdd master plan --yes
sdd master tasks --yes
```

## Release seguro

```bash
sdd master release --yes --version="0.3.0-alpha" --channel="alpha" --type="local" --dry-run
```

## Deploy guard

```bash
sdd master deploy --yes --environment="staging" --provider="vercel" --strategy="serverless" --dry-run
```
