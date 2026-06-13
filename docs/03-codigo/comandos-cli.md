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

## Governança SDD

```bash
sdd master clarify --yes --title="Dúvida sobre escopo" --phase="PHASE-01"
sdd master approve --yes --target="tasks" --phase="PHASE-01" --decision="approved" --reason="Tarefas aprovadas."
sdd master scope --yes --type="change" --title="Nova solicitação" --phase="PHASE-01"
sdd master backlog --yes --type="improvement" --title="Melhoria futura" --priority="COULD"
```

Comandos:

1. `clarify` registra dúvidas e respostas humanas.
2. `approve` registra aprovação ou rejeição humana formal.
3. `scope` registra escopo aprovado, fora de escopo e mudanças.
4. `backlog` registra itens futuros sem liberar implementação.

Todos exigem projeto inicializado. Clarificações abertas, mudanças de escopo abertas, rejeições e aprovações pendentes aparecem em `status` e `doctor`.

## Quality, audit, docs e blockers

```bash
sdd master quality --yes --phase="PHASE-01" --target="tasks" --title="Revisão de qualidade"
sdd master audit --yes --phase="PHASE-01" --type="self-audit" --title="Auditoria da fase"
sdd master docs --yes --phase="PHASE-01" --target="workflow" --title="Validação documental"
sdd master blocker --yes --title="Bloqueio formal" --phase="PHASE-01" --severity="BLOCKER"
```

Comandos:

1. `quality` registra revisão de qualidade.
2. `audit` registra auditoria e severidade.
3. `docs` registra estado documental.
4. `blocker` cria, lista ou resolve bloqueios formais.

`failed`, `BLOCKER`, `HIGH`, `CRITICAL`, `missing` e `outdated` alimentam `status`, `doctor` e readiness de implementação.

## Skills locais

```bash
sdd master skills --yes --title="Antigravity UI polish" --category="uiux" --source="https://github.com/sickn33/antigravity-awesome-skills/"
sdd master skills --yes --skill="SKILL-001" --approve
sdd master skills --yes --skill="SKILL-001" --install-local
sdd master skills --yes --skill="SKILL-001" --mark-used --phase="PHASE-01" --target="uiux-review"
sdd master skills --json --report
```

`skills` registra candidatas, aprovação humana, instalação local como metadado e uso em relatório. O comando não instala globalmente, não baixa código remoto, não executa skill externa e não cria `.env`.

## UI/UX e design gates

```bash
sdd master uiux --yes --phase="PHASE-01" --profile="WEB" --title="Revisão UI/UX inicial"
sdd master uiux --yes --type="design-system" --phase="PHASE-01" --profile="WEB"
sdd master uiux --yes --type="accessibility" --phase="PHASE-01" --profile="WEB"
sdd master uiux --yes --type="seo" --phase="PHASE-01" --profile="WEB"
sdd master uiux --yes --type="responsiveness" --phase="PHASE-01" --profile="WEB"
```

`uiux` cria registros de interface, design system, acessibilidade, SEO, responsividade e performance. Perfis `WEB`, `MOBILE`, `DESKTOP`, `SAAS` e `E-COMMERCE` são tratados como aplicáveis; `API` aparece como `not-applicable` para SEO visual.

## Implement Guard

```bash
sdd master implement --yes --phase="PHASE-01" --task="TASK-001" --dry-run
sdd master implement --json --yes --phase="PHASE-01" --target="TASK-001"
```

`implement` não altera código nesta versão prototype. Ele cria apenas registros internos em `.sdd-master/implementation/`, verifica readiness, valida test gates e informa bloqueios antes de qualquer implementação real futura.

## Update

```bash
sdd master update
sdd master update --dry-run
sdd master update --apply --yes
sdd master update --dry-run --json
```

Atualiza uma instalação SDD Master em projeto consumidor com plano, backup, relatório e detecção de conflitos.

Regras:

- `--dry-run` mostra o plano sem alterar arquivos;
- `--apply --yes` aplica apenas mudanças seguras;
- backup local é criado antes de alterações em arquivos existentes;
- templates sem marcador gerenciado ou modificados localmente são preservados;
- nenhum histórico é apagado.

## Release e deploy guards

```bash
sdd master release --yes --version="0.3.0-alpha" --channel="alpha" --type="local" --dry-run
sdd master deploy --yes --environment="staging" --provider="vercel" --strategy="serverless" --dry-run
```

`release` cria plano/checklist em `.sdd-master/releases/`, valida gates e registra readiness. Ele não cria tag, não publica npm e não publica GitHub Release.

`deploy` cria plano/checklist em `.sdd-master/deliveries/`, valida riscos de ambiente, rollback, observability, env vars e secrets por nome. Ele não acessa servidor, não envia arquivos e não executa scripts remotos.
