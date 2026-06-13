# API Pública CLI — SDD Master Beta

## Status

Esta API é pública para a fase beta `0.5.0-beta`. Breaking changes ainda são permitidos antes de `1.0.0`, mas devem ser documentados.

## Comandos públicos

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

## Contrato geral

Cada comando público deve declarar status beta, entrada, flags principais, saída texto, saída JSON quando aplicável, arquivos gerados, riscos, compatibilidade esperada e limites de breaking changes antes de `1.0.0`.

## Garantias beta

- `--json` não imprime banner.
- `CI=1` não imprime banner.
- Erros devem apontar próximos passos quando possível.
- Comandos de release/deploy não publicam nem fazem deploy.
- Segurança e path safety continuam obrigatórios.
