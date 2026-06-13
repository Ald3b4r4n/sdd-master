# Guia Completo

## O que e

SDD Master e um framework CLI para desenvolvimento guiado por especificacao, testes, seguranca, documentacao, auditoria e agentes de IA.

## Banner

O banner textual do RC exibe `SDD MASTER`, a tagline do framework e o credito:

```text
Idealizado e desenvolvido por Antonio Rafael Souza Cruz de Noronha
AR Software Development
https://www.antoniorafael.com.br/
https://www.arsoftwaredevelopment.com.br/
```

O banner nao aparece em `--json`, `CI=1`, `NO_COLOR=1`, `SDD_MASTER_NO_BANNER=1`, `--plain` ou `--no-banner`.

## Presets

Presets publicos: `web`, `api`, `cli`, `mobile`, `desktop`, `library`, `ecommerce`, `generic`.

## Comandos principais

Use `init`, `onboard`, `doctor`, `status`, `discovery`, `requirements`, `clarify`, `approve`, `scope`, `backlog`, `spec`, `plan`, `tasks`, `quality`, `audit`, `docs`, `blocker`, `implement`, `release`, `deploy`, `security`, `skills`, `plugins`, `agents`, `update`, `git`, `version` e `help`.

## Seguranca

- Nunca criar `.env` real.
- Nunca publicar ou executar deploy automaticamente.
- Nunca executar plugin externo.
- Nunca escrever fora da raiz do projeto consumidor.
- Sempre redigir secrets e paths sensiveis.

## Publicacao

O RC deve ser publicado somente com:

```bash
npm publish --access public --tag rc
```

Nao usar `latest` manualmente.
