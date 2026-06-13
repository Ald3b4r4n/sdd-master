# Contrato Público dos Comandos — SDD Master Beta

## Regra

Todos os comandos públicos abaixo são suportados na beta com compatibilidade evolutiva até `1.0.0`.

| Comando | Status beta | Entrada | Saída texto | JSON | Arquivos gerados | Riscos |
|---|---|---|---|---|---|---|
| init | público | flags de idioma, agente e preset | resumo de inicialização | sim | `.sdd-master/`, docs, agentes | criar estrutura fora de escopo, mitigado por path safety |
| onboard | público | perfil, IA e idioma | onboarding guiado | sim | `.sdd-master/onboarding/` | nenhum código alterado |
| doctor | público | flags de diagnóstico | relatório | sim | nenhum por padrão | exposição de path mitigada por redaction |
| status | público | flags de status | resumo | sim | nenhum | leitura local |
| update | público | dry-run/apply | plano | sim | backup e relatório | sobrescrita mitigada por backup |
| agents | público | lista de agentes | resumo | sim | arquivos de agentes | sobrescrita exige force |
| skills | público | metadados de skill | registro | sim | `.sdd-master/skills/`, `.agents/skills/` | execução externa proibida |
| plugins | público | metadados de plugin | registro | sim | `.sdd-master/extensions/` | execução externa proibida |
| security | público | scanner builtin/opt-in | relatório | sim | relatórios redigidos | scanners externos opt-in |
| discovery | público | produto e perfil | documentos | sim | discovery e visão | preserva existentes |
| requirements | público | requisitos | documentos | sim | requisitos | depende de discovery |
| clarify | público | dúvida/decisão | registro | sim | clarifications | bloqueios abertos |
| approve | público | decisão humana | registro | sim | approvals | aprovação não presumida |
| scope | público | escopo/mudança | registro | sim | scope | mudanças abertas bloqueiam |
| backlog | público | item futuro | registro | sim | backlog | não autoriza implementação |
| spec | público | fase/título | documento | sim | specs | depende de requirements |
| plan | público | fase/título | documento | sim | plans | depende de spec |
| tasks | público | fase/título | documento | sim | tasks | depende de plan |
| quality | público | revisão | registro | sim | quality | failed bloqueia |
| audit | público | auditoria | registro | sim | audits | crítico bloqueia |
| docs | público | validação docs | registro | sim | docs | missing bloqueia |
| blocker | público | blocker | registro/lista | sim | blockers | blocker aberto impede avanço |
| implement | público | prepare/dry-run | readiness | sim | implementation | não altera código consumidor |
| release | público | versão/canal | checklist | sim | releases | não publica |
| deploy | público | ambiente/provider | checklist | sim | deliveries | não faz deploy |
| git | público | pre-commit/pre-push | segurança Git | sim | nenhum | não faz push |
| version | público | nenhum | versão | não aplicável | nenhum | nenhum |
| help | público | comando opcional | ajuda | não aplicável | nenhum | nenhum |

## Breaking changes

Antes de `1.0.0`, mudanças de flags, arquivos e JSON são permitidas quando documentadas no CHANGELOG e acompanhadas por testes de regressão.
