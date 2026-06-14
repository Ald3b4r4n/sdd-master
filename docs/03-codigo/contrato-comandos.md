# Contrato Público dos Comandos - SDD Master 1.0.0

## Regra

Os comandos públicos abaixo são estáveis em `1.0.0`.

| Comando | Status | Flags públicas | Saída texto | Saída JSON | Arquivos gerados | Comportamento proibido | Quebra pós-1.0 |
|---|---|---|---|---|---|---|---|
| `init` | estável | `--yes`, `-y`, `--json`, `--preset`, `--ai`, `--agent`, `--language`, `--project-name`, `--no-banner`, `--plain` | inicialização | sim | `.sdd-master/`, docs, agentes | criar `.env` ou escrever fora do projeto | major |
| `onboard` | estável | `--yes`, `--json`, `--dry-run`, `--profile`, `--ai`, `--language` | próximos passos | sim | `.sdd-master/onboarding/` | alterar código consumidor | major |
| `doctor` | estável | `--json`, `--path-safety`, `--strict` | diagnóstico | sim | nenhum por padrão | expor segredos | major |
| `status` | estável | `--json` | estado | sim | nenhum | criar arquivos | major |
| `update` | estável | `--help`, `--json`, `--yes`, `-y`, `--dry-run`, `--apply`, `--force`, `--templates`, `--agents`, `--docs`, `--project-state`, `--backup` | plano/resultado | sim | backup e relatório | apagar histórico ou sobrescrever sem segurança | major |
| `agents` | estável | `--help`, `--json`, `--yes`, `-y`, `--agents`, `--language`, `--force`, `--list` | agentes | sim | arquivos de agentes | instalar globalmente | major |
| `skills` | estável | `--help`, `--json`, `--yes`, `-y`, `--title`, `--phase`, `--type`, `--status`, `--category`, `--source`, `--skill`, `--reason`, `--permission`, `--approve`, `--reject`, `--install-local`, `--mark-used`, `--report`, `--target` | registro/relatório | sim | `.sdd-master/skills/`, `.agents/skills/` | executar código remoto | major |
| `plugins` | estável | `--help`, `--json`, `--yes`, `-y`, `--title`, `--phase`, `--id`, `--type`, `--status`, `--category`, `--source`, `--version`, `--reason`, `--permission`, `--approve`, `--reject`, `--audit`, `--install-local`, `--mark-used`, `--report`, `--target` | registro/relatório | sim | `.sdd-master/extensions/` | executar plugin externo | major |
| `security` | estável | `--help`, `--json`, `--detect-tools`, `--run-external`, `--tool`, `--strict`, `--report` | relatório | sim | relatórios redigidos | imprimir segredo bruto | major |
| `discovery` | estável | `--help`, `--json`, `--yes`, `-y`, `--title`, `--phase`, `--project-type`, `--profiles`, `--maturity` | discovery | sim | discovery e visão | pular governança | major |
| `requirements` | estável | `--help`, `--json`, `--yes`, `-y`, `--title`, `--phase` | requisitos | sim | requirements | sobrescrever aprovado | major |
| `clarify` | estável | `--help`, `--json`, `--yes`, `-y`, `--title`, `--id`, `--type`, `--status`, `--reason`, `--phase` | dúvidas/decisões | sim | clarifications | inferir resposta humana | major |
| `approve` | estável | `--help`, `--json`, `--yes`, `-y`, `--target`, `--phase`, `--decision`, `--reason` | aprovação | sim | approvals | presumir aprovação | major |
| `scope` | estável | `--help`, `--json`, `--yes`, `-y`, `--title`, `--type`, `--reason`, `--phase` | escopo | sim | scope | autorizar código | major |
| `backlog` | estável | `--help`, `--json`, `--yes`, `-y`, `--title`, `--type`, `--reason`, `--phase`, `--priority` | backlog | sim | backlog | promover sem fluxo | major |
| `spec` | estável | `--help`, `--json`, `--yes`, `-y`, `--phase`, `--title` | especificação | sim | specs | pular requisitos | major |
| `plan` | estável | `--help`, `--json`, `--yes`, `-y`, `--phase`, `--title` | plano | sim | plans | executar código | major |
| `tasks` | estável | `--help`, `--json`, `--yes`, `-y`, `--phase`, `--title` | tarefas | sim | tasks | implementar automaticamente | major |
| `quality` | estável | `--help`, `--json`, `--yes`, `-y`, `--title`, `--phase`, `--target`, `--status`, `--reason` | gate | sim | quality | ocultar falha | major |
| `audit` | estável | `--help`, `--json`, `--yes`, `-y`, `--phase`, `--type`, `--title`, `--severity`, `--reason` | auditoria | sim | audits | remover bloqueios críticos | major |
| `docs` | estável | `--help`, `--json`, `--yes`, `-y`, `--phase`, `--target`, `--title`, `--status`, `--reason` | gate documental | sim | docs | ignorar docs faltantes | major |
| `blocker` | estável | `--help`, `--json`, `--yes`, `-y`, `--title`, `--phase`, `--severity`, `--id`, `--status`, `--reason` | blockers | sim | blockers | ignorar blocker aberto | major |
| `implement` | estável | `--help`, `--json`, `--yes`, `-y`, `--phase`, `--task`, `--dry-run`, `--prepare`, `--handoff`, `--manifest`, `--test-contract`, `--agent`, `--allowed-files` | readiness/handoff | sim | implementation | alterar código automaticamente | major |
| `release` | estável | `--help`, `--json`, `--yes`, `-y`, `--phase`, `--title`, `--target`, `--environment`, `--dry-run`, `--version`, `--channel`, `--type`, `--checklist` | checklist | sim | releases | publicar sem autorização | major |
| `deploy` | estável | `--help`, `--json`, `--yes`, `-y`, `--phase`, `--title`, `--target`, `--environment`, `--dry-run`, `--provider`, `--strategy`, `--checklist` | checklist | sim | deliveries | executar deploy | major |
| `git` | estável | `--json`, `--pre-commit`, `--pre-push` | check Git/security | sim | nenhum | fazer push/commit automático | major |
| `version` | estável | `--version`, `-v`, `master version` | versão | não | nenhum | banner | major |
| `help` | estável | `--help`, `-h`, `master help`, `master help <command>` | ajuda | não | nenhum | criar arquivos | major |

## Política

Após `1.0.0`, breaking changes exigem versão major.
