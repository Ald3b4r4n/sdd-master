# Compatibilidade Multi-IA

## Objetivo

O SDD Master evita prender o projeto a um único agente. As regras de governança ficam no repositório e podem ser retomadas por diferentes ferramentas.

## Agentes suportados

- Codex: `AGENTS.md`
- Claude: `CLAUDE.md`
- Cursor: `.cursor/rules/sdd-master.mdc`
- Gemini: `GEMINI.md`
- Copilot: `.github/copilot-instructions.md`
- Windsurf, Cline, Roo, Aider, Continue e genéricos

## Arquivos gerados

Cada arquivo reforça leitura da constituição, project-state, docs, auditorias, rastreabilidade e regras de segurança antes de qualquer mudança.

## Retomada universal

Antes de agir, qualquer IA deve entender estado atual, fase permitida, tarefa, testes esperados, documentação impactada e necessidade de aprovação humana.

## Por que importa

Times podem trocar de agente sem perder contexto, reduzir decisões implícitas e manter as mesmas regras de segurança e rastreabilidade.
