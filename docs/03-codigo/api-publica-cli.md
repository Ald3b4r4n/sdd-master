# API Publica CLI - SDD Master RC

## Status

A partir de `0.8.0-rc`, a CLI entra em congelamento de release candidate. Os comandos abaixo sao candidatos a estaveis para `1.0.0`.

Breaking changes ainda podem ocorrer ate `1.0.0`, desde que documentados no CHANGELOG, cobertos por teste e justificados em `docs/03-codigo/breaking-changes.md`.

## Comandos publicos candidatos a estaveis

- `init`
- `onboard`
- `doctor`
- `status`
- `update`
- `agents`
- `skills`
- `plugins`
- `security`
- `discovery`
- `requirements`
- `clarify`
- `approve`
- `scope`
- `backlog`
- `spec`
- `plan`
- `tasks`
- `quality`
- `audit`
- `docs`
- `blocker`
- `implement`
- `release`
- `deploy`
- `git`
- `version`
- `help`

## Garantias RC

- O banner proprio do SDD Master aparece apenas em saida textual interativa.
- O banner nao aparece com `--json`, `CI=1`, `NO_COLOR=1`, `SDD_MASTER_NO_BANNER=1`, `--plain` ou `--no-banner`.
- Saidas JSON devem ser parseaveis e livres de banner.
- Comandos de release/deploy/implement nao publicam, nao fazem deploy e nao executam codigo externo.
- Plugins e skills criam apenas metadados locais, sem instalacao global e sem execucao remota.
- Path safety, redaction e bloqueio de `.env` permanecem obrigatorios.

## Contrato geral

Cada comando publico deve manter:

- status `RC`;
- flags publicas documentadas;
- saida texto para humanos;
- saida JSON quando aplicavel;
- arquivos gerados previstos;
- garantias e limitacoes;
- comportamento proibido;
- breaking changes permitidos ate `1.0.0`;
- breaking changes proibidos apos `1.0.0`.

Detalhamento operacional: `docs/03-codigo/contrato-comandos.md`.
