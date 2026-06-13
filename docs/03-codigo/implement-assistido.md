# Implement Assistido Controlado

## Visao geral

`sdd master implement` prepara uma implementacao assistida sem alterar codigo automaticamente.

Nesta fase, ele gera artefatos de handoff para humano/agente executar depois, com aprovacao humana explicita.

## Guard versus execucao real

O guard valida readiness, blockers, testes, documentacao e seguranca.

A execucao real de codigo continua fora deste comando. O implement assistido nao roda scripts, nao instala dependencias, nao publica npm, nao faz deploy e nao faz push.

## Uso

```bash
sdd master implement --yes --prepare --handoff --manifest --test-contract --agent="codex" --allowed-files="src/**,tests/**,docs/**"
```

## Artefatos

O pacote assistido fica em `.sdd-master/implementation/`:

- `sessions/IMPLEMENT-SESSION-001.md`
- `manifests/CHANGE-MANIFEST-001.md`
- `test-contracts/TEST-CONTRACT-001.md`
- `handoffs/AGENT-HANDOFF-001.md`
- `approvals/IMPLEMENT-APPROVAL-001.md`
- `risks/IMPLEMENT-RISK-001.md`

## Allowed/forbidden files

`--allowed-files` lista candidatos a alteracao.

`--forbidden-files` lista arquivos proibidos.

Padroes sempre proibidos:

- `.env`
- `.env.*`
- `secrets/**`
- `private/**`
- `credentials/**`
- `.sdd-master/**`
- `node_modules/**`
- `dist/**`

Se o mesmo padrao aparecer em allowed e forbidden, forbidden vence.

## Test contract

O contrato de testes registra que nenhuma implementacao deve ocorrer antes de definir testes/checks e evidencias esperadas.

## Handoff para agente

O handoff instrui o agente a ler constituicao, estado do projeto, sessao, manifesto, contrato de testes, task e docs antes de qualquer alteracao.

## Aprovacao humana

Os artefatos registram aprovacao humana como pendente. Eles nao autorizam alteracao automatica de codigo.

## Preparacao para 0.3.0-alpha

Este fluxo prepara a fase `0.3.0-alpha` ao separar planejamento, seguranca, testes e handoff antes da execucao real.
# Extensões e skills

Sessões e handoffs incluem a seção `Extensões/skills usadas`.
O readiness bloqueia extensão usada sem aprovação e alerta para origem remota usada sem auditoria.
O implement assistido continua com `codeChanged: false`.

## Segurança avançada opt-in

O handoff inclui último relatório de segurança, uso de scanner externo, estado de redaction e pendências.
Relatório/auditoria `blocked` ou saída não redigida entram no readiness como bloqueio.
O implement não executa scanners externos.
