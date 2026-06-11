# Comandos CLI

## Ajuda

```bash
sdd master help
```

Mostra comandos disponíveis e planejados.

## Init

```bash
sdd master init --yes --language=pt-BR --agent=codex --project-name="Projeto Teste"
```

Inicializa `.sdd-master/`, docs, templates oficiais, agentes e `.gitignore` seguro.

## Doctor

```bash
sdd master doctor
sdd master doctor --json
```

Diagnostica a instalação SDD Master, estrutura, templates, agentes, segurança e Git básico.

## Agents

```bash
sdd master agents --yes --agents=codex,claude,cursor --language=pt-BR
```

Gera arquivos de instrução para múltiplas IAs/agentes.

## Git/Security

```bash
sdd master git
sdd master git --pre-commit
sdd master git --pre-push
sdd master git --json
```

Valida Git local, `.gitignore`, arquivos sensíveis e possíveis segredos. Não executa commit nem push.

## Update

```bash
sdd master update
```

Planejado para atualizar templates e estrutura em bloco futuro.
