# Migracao para 1.0

## De 0.8.0-rc para 1.0.0

1. Instalar o RC com `npm install -g sdd-master@rc`.
2. Rodar `sdd master doctor`.
3. Rodar `sdd master status --json`.
4. Validar contratos em `api-publica-cli.md` e `contrato-comandos.md`.
5. Corrigir blockers antes de adotar `1.0.0`.

## O que deve permanecer igual

- Namespace `sdd master`.
- Comandos publicos RC.
- Guards de release, deploy e implement.
- Bloqueios de `.env`, secrets e paths inseguros.

## O que pode mudar antes de 1.0

- Mensagens textuais.
- Novos campos JSON.
- Novos templates.
- Checks mais restritivos.
