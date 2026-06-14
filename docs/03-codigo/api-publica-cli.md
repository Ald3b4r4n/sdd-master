# API Pública CLI - SDD Master 1.0.0

## Status

A API pública do SDD Master está estável em `1.0.0`.

## Comandos estáveis

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

## Garantias

- `update` é funcional e estável.
- `--json` não imprime banner.
- `CI=1`, `NO_COLOR=1`, `SDD_MASTER_NO_BANNER=1`, `--plain` e `--no-banner` não exibem banner.
- `release`, `deploy` e `implement` continuam sem executar ações perigosas automaticamente.
- `plugins` e `skills` seguem sem execução automática.
- Path safety, redaction e bloqueio de `.env` continuam obrigatórios.

## Compatibilidade

Mudanças quebrando contrato pós-1.0 exigem versão major.
