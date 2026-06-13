# Onboarding Guiado

O comando `sdd master onboard` registra perfil, IA principal, idioma e próximos passos sem alterar código do projeto consumidor.

## Uso

```bash
sdd master init --yes --language="pt-BR" --agent="codex"
sdd master onboard --yes --profile="web" --ai="codex" --language="pt-BR"
sdd master doctor
```

## Perfis

`web`, `api`, `cli`, `mobile`, `desktop`, `library` e `generic`.

## Arquivos

- `.sdd-master/onboarding/ONBOARDING-001.md`
- `.sdd-master/onboarding/next-steps.md`

## Dry-run

```bash
sdd master onboard --dry-run --profile="api"
```

O dry-run mostra a saída planejada e não cria arquivos.
