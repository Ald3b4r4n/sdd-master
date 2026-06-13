# SDD Master

<p align="center">
  <img src="./assets/readme/sdd-master-hero.svg" alt="SDD Master — Specification-driven development framework" />
</p>

<p align="center">
  <strong>Framework rígido para desenvolvimento de software com especificação, TDD, documentação, auditoria, rastreabilidade, segurança e agentes de IA.</strong>
</p>

![Version](https://img.shields.io/badge/version-0.8.0--rc-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Node.js](https://img.shields.io/badge/Node.js-20%2B-43853d)
![TypeScript](https://img.shields.io/badge/TypeScript-ready-blue)
![Status](https://img.shields.io/badge/status-rc-orange)
![Security](https://img.shields.io/badge/security-first-critical)
![AI Agents](https://img.shields.io/badge/AI%20agents-ready-6f42c1)

## O que é o SDD Master?

O SDD Master é um framework que guia a criação de software passo a passo.

Ele impede que uma IA ou desenvolvedor saia codando sem antes definir:

- o que será feito;
- por que será feito;
- quais testes validam;
- quais documentos precisam ser atualizados;
- quais riscos existem;
- o que pode ou não ir para o GitHub.

Em linguagem simples: o SDD Master coloca trilhos, freios e evidências no processo de desenvolvimento assistido por IA.

## Como funciona tecnicamente?

O SDD Master combina:

- CLI npm;
- estrutura `.sdd-master/`;
- documentação pública em `docs/`;
- templates oficiais;
- comandos de diagnóstico;
- arquivos de instrução para agentes;
- validações de segurança/Git;
- governança por fase;
- TDD obrigatório;
- auditoria e rastreabilidade.

## Instalação via npm

```bash
npm install -g sdd-master@rc
sdd master help
```

A versão pretendida para publicação deste bloco é `0.8.0-rc`. Ela ainda não é estável. Após publicação, use a dist-tag `rc` para instalar esta versão.

```text
sdd-master@0.8.0-rc
```

O registry mantém `latest` apontando para `0.1.0-prototype.1`. A dist-tag `prototype` aponta para `0.2.0-prototype`, a dist-tag `alpha` aponta para `0.3.0-alpha`, a dist-tag `beta` aponta para `0.5.0-beta`, e após publicação a instalação recomendada para este estágio será `sdd-master@rc`.

Evite usar:

```bash
npm install -g sdd-master
```

até existir uma release estável.

## Estado atual

A versão pública atual recomendada continua sendo:

```bash
npm install -g sdd-master@rc
```

Versão:

```text
0.8.0-rc
```

Status:

- npm publicado;
- GitHub prerelease publicada;
- release candidate, não estável;
- dist-tag `rc` planejada.

## Banner e crédito

O banner da CLI é próprio do SDD Master e inclui:

```text
SDD MASTER

Spec-Driven Development Framework
Governance • Tests • Security • Multi-AI • Delivery

Idealizado e desenvolvido por Antonio Rafael Souza Cruz de Noronha
AR Software Development
https://www.antoniorafael.com.br/
https://www.arsoftwaredevelopment.com.br/
```

O banner não aparece com `--json`, `CI=1`, `NO_COLOR=1`, `SDD_MASTER_NO_BANNER=1`, `--plain` ou `--no-banner`.

## Release candidate 0.8.0-rc

`0.8.0-rc` congela a API pública de comandos como candidata a estável, finaliza a documentação de uso e prepara o caminho para `1.0.0`.

Instalação após publicação:

```bash
npm install -g sdd-master@rc
```

Regras do RC:

- não usar `latest` manualmente;
- `beta`, `alpha` e `prototype` continuam disponíveis;
- `release` e `deploy` continuam guards sem publicação ou deploy real;
- plugins e skills continuam sem execução automática;
- a versão ainda não é estável.

## Prerelease beta

A versão beta publicada é:

```text
0.5.0-beta
```

Ela consolida:

- banner próprio da CLI;
- presets oficiais de projeto;
- preset `ecommerce`;
- API pública de comandos;
- contrato de comandos;
- fluxo E2E beta;
- documentação beta.

A publicação foi feita com:

```bash
npm publish --access public --tag beta
```

A instalação recomendada é:

```bash
npm install -g sdd-master@beta
```

A dist-tag `alpha` continua disponível para `0.3.0-alpha`. Não use `latest` manualmente enquanto não houver release estável.

## O que mudou em 0.2.0-prototype

Esta versão adiciona o primeiro fluxo SDD funcional:

- discovery;
- requirements;
- spec;
- plan;
- tasks;
- governance;
- quality/audit/docs/blockers;
- implement guard;
- skills/UIUX;
- plugins/extensoes locais;
- update seguro.

## Release e deploy guards

O SDD Master possui comandos de preparação para release e deploy.

Eles não publicam e não fazem deploy automaticamente.

```bash
sdd master release --yes --version="0.3.0-alpha" --channel="alpha" --type="local" --dry-run
sdd master deploy --yes --environment="staging" --provider="vercel" --strategy="serverless" --dry-run
```

Regras:

- release não cria tag automaticamente;
- release não publica npm;
- release não publica GitHub Release;
- deploy não acessa servidor;
- deploy não executa scripts remotos;
- ambos registram plano, checklist, riscos e aprovações pendentes.

## Implement assistido controlado

O `sdd master implement` prepara implementação assistida sem alterar código automaticamente.

```bash
sdd master implement --yes --prepare --handoff --manifest --test-contract --agent="codex" --allowed-files="src/**,tests/**,docs/**"
```

Ele gera:

- sessão de implementação;
- manifesto de mudanças;
- contrato de testes;
- handoff para agente;
- aprovação humana pendente;
- riscos.

Nesta fase, `implement` continua sem modificar código do projeto consumidor.

## Uso local durante desenvolvimento

```bash
npm install
npm run build
node dist/cli/main.js master help
```

## Onboarding guiado

O SDD Master pode guiar os primeiros passos de um projeto.

```bash
sdd master init
sdd master init --preset="ecommerce"
sdd master onboard --profile="web" --ai="codex"
sdd master doctor
```

O onboarding gera uma lista de próximos passos dentro de `.sdd-master/onboarding/` sem alterar código do projeto consumidor.

## Presets oficiais

Presets disponíveis:

- `web`
- `api`
- `cli`
- `mobile`
- `desktop`
- `library`
- `ecommerce`
- `generic`

O preset `ecommerce` inclui atenção inicial a SEO, UI/UX, catálogo, checkout, frete, pagamento, segurança, LGPD, acessibilidade, performance, admin, deploy guard e rollback.

## Comandos atuais

| Comando | Status | O que faz |
|---|---|---|
| `sdd master help` | Disponível | Mostra ajuda |
| `sdd master init` | Disponível | Inicializa estrutura SDD Master |
| `sdd master onboard` | Disponível | Guia os primeiros passos do projeto |
| `sdd master doctor` | Disponível | Diagnostica instalação |
| `sdd master agents` | Disponível | Gera instruções multi-IA |
| `sdd master git` | Disponível | Valida Git e segurança |
| `sdd master skills` | Disponível | Gerencia skills locais e relatórios |
| `sdd master plugins` | Disponível | Gerencia plugins locais e supply chain |
| `sdd master uiux` | Disponível | Cria gates de design e interface |
| `sdd master update` | Disponível | Atualiza instalação local com backup |
| `sdd master discovery` | Disponível | Cria discovery inicial |
| `sdd master requirements` | Disponível | Cria requisitos iniciais |
| `sdd master spec` | Disponível | Cria especificação inicial |
| `sdd master plan` | Disponível | Cria plano técnico inicial |
| `sdd master tasks` | Disponível | Cria tarefas iniciais |
| `sdd master update` | Planejado | Atualizará templates/estrutura |

## Fluxo visual

![Fluxo SDD Master](./assets/readme/workflow-overview.svg)

```mermaid
flowchart TD
  A[Discovery] --> B[Requirements]
  B --> C[Architecture]
  C --> D[Specification]
  D --> E[Plan]
  E --> F[Tasks]
  F --> G[Tests first]
  G --> H[Implementation]
  H --> I[Documentation]
  I --> J[Quality]
  J --> K[Audit]
  K --> L[Commit]
  L --> M[Delivery]
```

## Compatibilidade multi-IA

![Multi-IA](./assets/readme/multi-ai-support.svg)

O SDD Master pode gerar arquivos de instrução para diferentes agentes de codificação:

- Codex: `AGENTS.md`
- Claude: `CLAUDE.md`
- Cursor: `.cursor/rules/sdd-master.mdc`
- Gemini: `GEMINI.md`
- Copilot: `.github/copilot-instructions.md`
- Windsurf, Cline, Roo, Aider, Continue e genéricos

Exemplo:

```bash
sdd master agents --yes --agents=codex,claude,cursor --language=pt-BR
```

Esses arquivos orientam cada IA a ler a constituição, respeitar o estado do projeto, não pular fases, não fazer push sem autorização humana e não expor `.env`, segredos, tokens ou credenciais.

## Segurança

![Safety Gates](./assets/readme/safety-gates.svg)

Regras fortes do SDD Master:

- não commitar `.env`;
- não expor segredo;
- não fazer push sem autorização humana;
- não enviar `.sdd-master/` ao remoto do produto;
- não ler ou escrever fora da raiz do projeto consumidor;
- bloquear traversal, caminhos absolutos externos e symlinks perigosos;
- testar antes de implementar;
- documentar e auditar antes de avançar.

Use:

```bash
sdd master git
sdd master git --pre-commit
sdd master git --pre-push
sdd master doctor --path-safety
```

O comando verifica arquivos sensíveis, possíveis segredos, `.gitignore`, risco de envio de `.sdd-master/` e status básico do Git. O SDD Master nunca executa push automaticamente.

## Estrutura gerada no projeto consumidor

```text
.sdd-master/
  constitution.md
  project-state.md
  plugins/
  templates/
  audits/
  traceability/
  approvals/

docs/
  01-negocio-requisitos/
  02-tecnica-arquitetura/
  03-codigo/

.agents/
  plugins/
  skills/
```

## Exemplos de saída

```bash
sdd master doctor
```

```text
SDD Master — Doctor

Status geral:
  healthy

Próximo passo recomendado:
  /sdd-master-discovery
```

```bash
sdd master git --pre-push
```

```text
SDD Master — Git/Security Check

Status geral:
  clean

Decisão:
  Nenhum bloqueio crítico encontrado.
```

```bash
sdd master agents --yes --agents=codex,claude,cursor --language=pt-BR
```

```text
SDD Master — Agentes configurados

Agentes:
  codex, claude, cursor
```

## Templates oficiais

O SDD Master instala templates locais em `.sdd-master/templates/` para requisitos, produto, arquitetura, código, workflow, governança, segurança, UI/UX, operações e agentes/IA.

Templates são pontos de partida. Documentos reais devem ser criados a partir deles, revisados e aprovados pelo fluxo SDD Master.

## Workflow SDD inicial

Comandos iniciais:

```bash
sdd master discovery --yes --title="Meu Projeto" --project-type="web" --profiles="WEB" --maturity="M0"
sdd master requirements --yes --title="Requisitos iniciais"
sdd master spec --yes --phase="PHASE-01" --title="Especificação inicial"
sdd master plan --yes --phase="PHASE-01" --title="Plano técnico inicial"
sdd master tasks --yes --phase="PHASE-01" --title="Tarefas iniciais"
```

Esses comandos criam documentos locais em `.sdd-master/` e documentação pública em `docs/`. Cada etapa registra `Aprovação humana: Pendente` e preserva arquivos existentes por padrão.

## Governança antes da implementação

Antes de implementar, o SDD Master exige:

- dúvidas resolvidas;
- escopo controlado;
- backlog separado do escopo atual;
- aprovações humanas registradas;
- bloqueios formais verificados.

Comandos:

```bash
sdd master clarify --yes --title="Dúvida sobre escopo" --phase="PHASE-01"
sdd master approve --yes --target="tasks" --phase="PHASE-01" --decision="approved" --reason="Tarefas aprovadas."
sdd master scope --yes --type="change" --title="Nova solicitação" --phase="PHASE-01"
sdd master backlog --yes --type="improvement" --title="Melhoria futura" --priority="COULD"
```

## Quality, audit, docs e blockers

Antes de implementar, o SDD Master exige portões formais de qualidade, auditoria e documentação.

Comandos:

```bash
sdd master quality --yes --phase="PHASE-01" --target="tasks" --title="Revisão de qualidade"
sdd master audit --yes --phase="PHASE-01" --type="self-audit" --title="Auditoria da fase"
sdd master docs --yes --phase="PHASE-01" --target="workflow" --title="Validação documental"
sdd master blocker --yes --title="Bloqueio formal" --phase="PHASE-01" --severity="BLOCKER"
```

Blockers abertos impedem a futura implementação.

## Skills locais e UI/UX

O SDD Master trata design como diferencial do framework.

Comandos:

```bash
sdd master skills --yes --title="Skill de UI/UX" --category="uiux" --source="https://github.com/sickn33/antigravity-awesome-skills/"
sdd master skills --yes --skill="SKILL-001" --approve
sdd master skills --yes --skill="SKILL-001" --install-local
sdd master uiux --yes --phase="PHASE-01" --profile="WEB" --title="Revisão UI/UX inicial"
```

Regras:

- skills são locais;
- nada é instalado globalmente por padrão;
- skills externas exigem aprovação humana;
- registry local fica em `.agents/skills/registry.md`;
- toda skill usada aparece em relatório;
- UI/UX, acessibilidade, SEO e responsividade bloqueiam implementação quando aplicável.

## Plugins e extensoes seguras

O SDD Master também controla plugins/extensoes locais com política de supply chain segura.

Comandos:

```bash
sdd master plugins --yes --title="Plugin de integração" --category="other" --source="Registry local controlado" --version="1.0.0" --permission="docs/**"
sdd master plugins --yes --id="PLUGIN-001" --audit
sdd master plugins --yes --id="PLUGIN-001" --approve
sdd master plugins --yes --id="PLUGIN-001" --install-local
sdd master plugins --yes --id="PLUGIN-001" --mark-used --phase="PHASE-01"
sdd master plugins --json --report
```

Regras:

- plugins são locais;
- nada é instalado globalmente por padrão;
- plugins externos exigem aprovação humana;
- policy e registry consolidado ficam em `.sdd-master/extensions/`;
- plugins ficam em `.sdd-master/extensions/plugins/`;
- approvals, audits, usage e reports ficam em `.sdd-master/extensions/`;
- instalação local cria somente metadados em `.agents/skills/installed/`;
- nenhum código remoto é baixado ou executado;
- plugins candidatos, rejeitados ou bloqueados não podem ser usados;
- todo plugin usado aparece em relatório.

## Segurança avançada opt-in

O SDD Master possui segurança builtin e pode integrar scanners externos de forma opcional.

```bash
sdd master security
sdd master security --detect-tools
sdd master security --run-external --tool="gitleaks" --report
sdd master security --run-external --tool="trufflehog" --report
```

Regras:

- ferramentas externas não são instaladas automaticamente;
- execução externa exige opt-in explícito com `--run-external`;
- somente modos locais/filesystem compatíveis são aceitos;
- valores sensíveis são redigidos e nunca persistidos em saída bruta;
- ausência de ferramenta externa não bloqueia por padrão;
- relatório ou auditoria `blocked` bloqueia pre-push, release e deploy.

## Update seguro

O comando `sdd master update` atualiza uma instalação local do SDD Master sem apagar histórico.

Exemplos:

```bash
sdd master update --dry-run
sdd master update --apply --yes
```

Regras:

- cria backup antes de aplicar mudanças;
- não sobrescreve documentos preenchidos sem segurança;
- preserva decisões humanas;
- registra relatório em `.sdd-master/reports/`;
- nunca cria `.env`;
- nunca apaga rastreabilidade.

## Implement Guard

O comando `sdd master implement` existe como guardião de implementação.

Nesta versão prototype, ele não altera código do projeto consumidor.

Ele verifica:

- requisitos;
- especificação;
- plano;
- tarefas;
- aprovações humanas;
- dúvidas abertas;
- escopo;
- qualidade;
- auditoria;
- documentação;
- blockers;
- UI/UX, design system, acessibilidade, SEO e responsividade quando aplicável;
- relatório de skills e plugins usados;
- testes obrigatórios antes da implementação;
- segurança/Git.

Exemplo:

```bash
sdd master implement --yes --phase="PHASE-01" --task="TASK-001" --dry-run
```

## Qualidade e validação local

Antes de qualquer release ou publicação, execute:

```bash
npm run check
```

O check executa:

- build;
- testes;
- lint;
- formatação;
- smoke test do CLI;
- validação de pacote;
- dry-run do npm pack.

Para o RC, valide também:

```bash
npm publish --dry-run --access public --tag rc
node dist/cli/main.js master git --pre-push
```

## Validação de pacote

```bash
npm run package:check
npm run pack:dry-run
```

Esses scripts verificam se o pacote contém os arquivos necessários para uso via CLI e se arquivos proibidos ficam fora do empacotamento npm.

## Release local alpha

A versão local preparada é:

```text
0.3.0-alpha
```

Esta versão consolida os blocos 25 a 30, sem reescrever histórico Git nem mover tags já publicadas.

Antes de qualquer publicação:

```bash
npm run check
npm run release:check
npm publish --dry-run --access public --tag alpha
```

Esta versão alpha usa a tag npm `alpha`, não `latest`. Use `--tag alpha` explicitamente em dry-runs e em qualquer publicação futura aprovada.

Publicação real de `0.3.0-alpha` realizada com autorização humana explícita usando `npm publish --access public --tag alpha`.

## GitHub Release

A prerelease publicada é:

```text
v0.3.0-alpha
```

Status:

- Tag inicial `v0.1.0-prototype` preservada sem reescrita.
- Tag `v0.1.0-prototype.1` preservada sem reescrita.
- Tag `v0.2.0-prototype` preservada sem reescrita.
- GitHub prerelease `v0.3.0-alpha` publicada como prerelease.
- npm publish real de `0.3.0-alpha` executado com a dist-tag `alpha`.
- npm `latest` permanece em `0.1.0-prototype.1`.
- npm `prototype` aponta para `0.2.0-prototype`.
- npm `alpha` aponta para `0.3.0-alpha`.

A release atual é alpha e não representa versão final estável.

## Publicação

O SDD Master possui:

- GitHub prerelease;
- publicação npm prototype;
- publicação npm alpha;
- publicação npm beta com `npm publish --access public --tag beta`;
- publicação npm RC planejada com `npm publish --access public --tag rc`.

A publicação final da GitHub Release exige aprovação humana explícita.

## Contribuição e GitHub

Contribuições devem usar os templates de issue e Pull Request do repositório. Antes de enviar uma mudança para revisão, execute `npm run check` e registre os checks relevantes no Pull Request.

Nunca publique `.env`, tokens, credenciais, chaves privadas, certificados, dados pessoais, logs sensíveis ou conteúdo interno de `.sdd-master/` de projetos consumidores. Issues públicas devem descrever problemas sem expor valores ou arquivos privados.

## Documentação pública

- [Visão do produto](docs/01-negocio-requisitos/visao-do-produto.md)
- [Arquitetura do framework](docs/02-tecnica-arquitetura/arquitetura-do-framework.md)
- [Compatibilidade multi-IA](docs/02-tecnica-arquitetura/compatibilidade-multi-ia.md)
- [Segurança e governança](docs/02-tecnica-arquitetura/seguranca-e-governanca.md)
- [Path safety multiplataforma](docs/02-tecnica-arquitetura/path-safety-multiplataforma.md)
- [Comandos CLI](docs/03-codigo/comandos-cli.md)
- [API pública CLI](docs/03-codigo/api-publica-cli.md)
- [Contrato de comandos](docs/03-codigo/contrato-comandos.md)
- [Compatibilidade RC](docs/03-codigo/compatibilidade-rc.md)
- [Breaking changes](docs/03-codigo/breaking-changes.md)
- [Guia rápido](docs/03-codigo/guia-rapido.md)
- [Guia completo](docs/03-codigo/guia-completo.md)
- [FAQ](docs/03-codigo/faq.md)
- [Troubleshooting](docs/03-codigo/troubleshooting.md)
- [Migração para 1.0](docs/03-codigo/migracao-para-1.0.md)
- [Suporte e política de versão](docs/03-codigo/suporte-e-politica-de-versao.md)
- [Presets](docs/03-codigo/presets.md)
- [Onboarding guiado](docs/03-codigo/onboarding-guiado.md)
- [Exemplos práticos](docs/03-codigo/exemplos-praticos.md)
- [Desenvolvimento local](docs/03-codigo/desenvolvimento-local.md)
- [Workflow SDD](docs/03-codigo/workflow-sdd.md)
- [Skills locais e UI/UX](docs/03-codigo/skills-uiux.md)
- [Plugins e extensoes seguras](docs/03-codigo/plugins-extensoes-seguras.md)
- [Update seguro](docs/03-codigo/update-seguro.md)

## Roadmap

- Fundação npm
- CLI base
- Init
- Templates
- Doctor
- Multi-IA
- Git/Security
- README premium
- Testes/qualidade
- GitHub público
- Release prototype
- npm package

## Licença

Distribuído sob a licença MIT. Consulte [LICENSE](LICENSE).
