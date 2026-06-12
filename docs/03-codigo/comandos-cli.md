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

## Workflow SDD inicial

```bash
sdd master discovery --yes --title="Meu Projeto" --project-type="web" --profiles="WEB" --maturity="M0"
sdd master requirements --yes --title="Requisitos iniciais"
sdd master spec --yes --phase="PHASE-01" --title="Especificação inicial"
sdd master plan --yes --phase="PHASE-01" --title="Plano técnico inicial"
sdd master tasks --yes --phase="PHASE-01" --title="Tarefas iniciais"
```

Ordem mínima:

1. `discovery`
2. `requirements`
3. `spec`
4. `plan`
5. `tasks`

Todos exigem projeto inicializado com `sdd master init`, preservam arquivos existentes por padrão e registram aprovação humana pendente.

## Update

```bash
sdd master update
```

Planejado para atualizar templates e estrutura em bloco futuro.
