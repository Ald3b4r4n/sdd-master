# Arquitetura do Framework

## Visão geral

O SDD Master é um pacote npm em Node.js e TypeScript. O pacote expõe o binário `sdd`, que executa comandos de inicialização, diagnóstico, geração de instruções para agentes e validações de segurança.

## CLI

O entrypoint fica em `src/cli/main.ts`. A CLI usa parser simples, registry de comandos e módulos separados para cada domínio.

## Init

`sdd master init` cria a estrutura inicial no projeto consumidor, incluindo `.sdd-master/`, `docs/`, `.agents/skills/`, `.agents/plugins/`, templates oficiais e arquivos de agente.

## Templates

Os templates ficam versionados como dados TypeScript em `src/templates/official-templates.ts`. Isso mantém os arquivos disponíveis após o build para `dist/`.

## Doctor

`sdd master doctor` diagnostica estrutura, docs, templates, agentes, Git básico e segurança local.

`sdd master plugins` registra plugins/extensoes locais com politica de supply chain segura.

## Agents

`sdd master agents` gera arquivos como `AGENTS.md`, `CLAUDE.md`, `.cursor/rules/sdd-master.mdc` e outros, sem instalar ferramentas externas.

## Git/Security

`sdd master git` executa checks locais para `.env`, arquivos sensíveis, padrões suspeitos de segredo, `.gitignore` e risco de `.sdd-master/` em push.

## Estrutura do pacote

```text
src/
  cli/
  templates/
  doctor/
  agents/
  git/
  security/
```

## Estrutura do projeto consumidor

```text
.sdd-master/
docs/
.agents/
  plugins/
  skills/
```
