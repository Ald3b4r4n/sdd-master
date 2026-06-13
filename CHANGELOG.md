# Changelog

## [Unreleased]

## [0.8.0-rc] - 2026-06-13

### Adicionado

- Banner CLI com crédito público do idealizador/desenvolvedor.
- Documentação de compatibilidade RC.
- Contrato de comandos candidato a estável.
- Auditoria final RC.
- Guia rápido, guia completo, FAQ e troubleshooting.
- Documentação de migração para 1.0.
- Teste E2E RC cobrindo o fluxo completo.

### Melhorado

- README como página principal de produto.
- Help e onboarding.
- Documentação de comandos.
- Segurança, path safety, release/deploy e implement assistido.
- Regressão multiambiente.

### Segurança

- Banner não aparece em JSON/CI.
- Nenhum fluxo RC executa deploy/publish/plugin automaticamente.
- Path safety, redaction e supply chain permanecem obrigatórios.

### Observação

- Esta versão é release candidate, não estável.
- Instalação após publicação: `npm install -g sdd-master@rc`.

## [0.5.0-beta] - 2026-06-13

### Adicionado

- Banner próprio do SDD Master na CLI.
- Presets oficiais de projeto.
- Preset `ecommerce`.
- Comando `init --preset`.
- API pública da CLI documentada.
- Contrato público dos comandos.
- Fluxo E2E beta/happy path.
- Documentação beta de presets e comandos.

### Melhorado

- Help global e por comando.
- Onboarding guiado.
- Saídas JSON.
- Mensagens de erro e próximos passos.
- Integração entre doctor, status, release, deploy, implement, security e plugins.
- Compatibilidade multiambiente e path safety.

### Segurança

- Banner não aparece em JSON/CI.
- Presets não criam `.env`.
- Happy path não executa deploy/publish.
- Plugins/skills continuam sem execução automática.
- Scanners externos continuam opt-in.

### Observação

- Esta versão é beta, não estável.
- npm publish real foi executado com a dist-tag `beta`.
- GitHub prerelease `v0.5.0-beta` foi publicada como prerelease.
- Instalação recomendada: `npm install -g sdd-master@beta`.
- A dist-tag `latest` permanece em `0.1.0-prototype.1`.

## [0.3.0-alpha] - 2026-06-13

### Adicionado

- `sdd master release` como guard/checklist.
- `sdd master deploy` como guard/checklist.
- Implement assistido controlado em `sdd master implement`.
- Handoff seguro para agentes de IA.
- Manifesto de mudanças planejadas.
- Contrato de testes antes da implementação.
- `sdd master plugins`.
- Registry local seguro para plugins/extensões.
- Política de extensão e auditoria de supply chain.
- `sdd master security`.
- Segurança avançada opt-in com `gitleaks` e `trufflehog`, sem instalação automática.
- Relatórios e auditorias de segurança com redaction.
- Camada central de path safety.
- Hardening multiambiente para Windows, Linux e macOS.
- Proteção contra path traversal e escrita fora do projeto.
- Comando `sdd master onboard`.
- Onboarding guiado com próximos passos.
- Documentação de exemplos práticos.
- Padronização progressiva de mensagens, erros, help e JSON.

### Melhorado

- `doctor` com categorias, próximos passos e checks ampliados.
- `status` com onboarding, path safety, extensões e segurança.
- `git --pre-push` com integrações adicionais de segurança.
- `release`, `deploy` e `implement` com gates mais robustos.
- `skills` integrado ao registry seguro de extensões.
- Help global e help por comando.
- Documentação de desenvolvimento, comandos e fluxo SDD.

### Segurança

- Release/deploy continuam sem execução perigosa automática.
- Implement continua sem alterar código do consumidor.
- Plugins/skills não executam código automaticamente.
- Scanners externos só rodam com opt-in explícito.
- Valores sensíveis são redigidos em relatórios.
- Escritas em `.sdd-master/` e `.agents/` passam por validação de caminho.
- `.env`, segredos, `.sdd-master/` na raiz e publish/deploy sem aprovação continuam bloqueados.

### Observação

- Esta versão marca a transição de prototype para alpha.
- npm publish real foi executado com a dist-tag `alpha`.
- GitHub prerelease `v0.3.0-alpha` foi publicada como prerelease.
- A instalação recomendada é `npm install -g sdd-master@alpha`.
- A dist-tag `latest` permanece em `0.1.0-prototype.1`.

## [0.2.0-prototype] - 2026-06-13

### Adicionado

- Comandos iniciais de workflow SDD:
  - `sdd master discovery`
  - `sdd master requirements`
  - `sdd master spec`
  - `sdd master plan`
  - `sdd master tasks`
- Geração inicial de documentos em `.sdd-master/`.
- Atualização de documentação pública em `docs/`.
- Guardas simples de ordem do fluxo SDD.
- Comandos de governança:
  - `sdd master clarify`
  - `sdd master approve`
  - `sdd master scope`
  - `sdd master backlog`
- Bloqueios formais antes da futura implementação.
- Cálculo inicial de prontidão para implementação.
- Comandos de quality/audit/docs/blockers:
  - `sdd master quality`
  - `sdd master audit`
  - `sdd master docs`
  - `sdd master blocker`
- Integração desses portões com `status`, `doctor` e readiness de implementação.
- Bloqueios formais para achados BLOCKER, auditorias críticas, documentação pendente e qualidade reprovada.
- Comando `sdd master implement` em modo guard/dry-run.
- Test gates para validar testes obrigatórios antes da implementação.
- Registro `.sdd-master/implementation/`.
- Bloqueio explícito contra implementação sem gates mínimos aprovados.
- Comando `sdd master skills`.
- Comando `sdd master uiux`.
- Registro de skills candidatas, aprovadas, instaladas localmente e usadas.
- Gates de UI/UX, design system, acessibilidade, SEO, responsividade e performance.
- Integração dos gates de design com `status`, `doctor` e `implement`.
- Comando `sdd master update` real e seguro.
- Modo `--dry-run` para plano de atualização.
- Modo `--apply` com backup local.
- Versionamento inicial de templates oficiais.
- Relatórios de update em `.sdd-master/reports/`.
- Detecção de conflitos e preservação de arquivos locais.

### Segurança

- `implement` não altera código do consumidor nesta versão.
- `skills` não instala globalmente.
- `skills` não executa código remoto.
- `update` não apaga histórico.
- `update` não sobrescreve decisões humanas.
- `.env`, segredos e `.sdd-master/` na raiz continuam bloqueados.

### Observação

- Esta versão continua sendo prototype.
- A instalação recomendada é `npm install -g sdd-master@prototype`.

## [0.1.0-prototype.1] - 2026-06-11

### Alterado

- Atualizada versão prerelease para consolidar os ajustes finais após `v0.1.0-prototype`.
- Alinhada documentação pública de release, GitHub Release e publicação npm futura para `v0.1.0-prototype.1`.
- Documentada a publicação npm prototype de `sdd-master@0.1.0-prototype.1`.

### Corrigido

- Mantida a tag `v0.1.0-prototype` sem reescrita.
- Preparada nova tag `v0.1.0-prototype.1` para refletir o estado atual do projeto.

### Segurança

- Nenhum segredo, `.env` real, credencial ou dado sensível foi incluído.
- npm publish real foi executado com a dist-tag `prototype`.
- A dist-tag `latest` também aponta para `0.1.0-prototype.1` por comportamento automático da primeira publicação npm.
- Registrado que o npm bloqueou a remoção de `latest` enquanto `0.1.0-prototype.1` é a única versão publicada; a mitigação é instalar com `sdd-master@prototype`.

## [0.1.0-prototype] - 2026-06-11

### Adicionado

- Fundação inicial do pacote npm.
- Estrutura base TypeScript.
- CLI mínimo.
- Registro inicial de comandos do CLI.
- Ajuda contextual para comandos planejados.
- Status básico do projeto.
- Stubs seguros para doctor e update.
- Comando funcional `sdd master init`.
- Criação segura da estrutura inicial `.sdd-master/`.
- Biblioteca inicial de templates oficiais do SDD Master.
- Instalação local dos templates pelo comando `sdd master init`.
- Estrutura de templates para requisitos, arquitetura, workflow, governança, segurança, UI/UX, operações e agentes.
- Comando `sdd master doctor`.
- Diagnóstico estrutural da instalação SDD Master.
- Saída legível e JSON para automação.
- Verificações básicas de segurança para `.env` e arquivos sensíveis.
- Comando `sdd master agents`.
- Geração de arquivos de instrução para múltiplas IAs/agentes.
- Integração do agente principal no `sdd master init`.
- Registro de agentes no `project-state.md`.
- Checks de agentes no `status` e `doctor`.
- Comando `sdd master git`.
- Diagnóstico inicial de Git e segurança.
- Detecção heurística de segredos.
- Validação de arquivos `.env` e arquivos sensíveis.
- Modos `--pre-commit`, `--pre-push` e `--json`.
- README premium com assets visuais.
- Assets SVG próprios para apresentação do SDD Master.
- Documentação pública inicial em `docs/`.
- Exemplos de uso, fluxo visual, segurança e compatibilidade multi-IA.
- Smoke test do CLI buildado.
- Validação local de pacote npm.
- Dry-run de empacotamento com bloqueio de arquivos sensíveis.
- Checks adicionais para documentação e assets.
- Hardening do script `npm run check`.
- Estrutura inicial `.github/` para repositório público.
- Workflow de CI sem deploy/publicação.
- Templates de issue e Pull Request.
- Reforço na documentação de contribuição e segurança.
- Atualização segura de README e `.gitignore` em projetos consumidores.
- Detecção básica de instalação pelo `sdd master status`.
- Documentação pública inicial.
- Licença MIT.
- Release notes públicas para `v0.1.0-prototype`.
- Preparação de GitHub Release draft.
- Metadados públicos de repositório, bugs, homepage e keywords no `package.json`.
- Documentação complementar para futura publicação npm.
- Checklist final para publicação npm futura.
- Checklist final para publicação da GitHub Release.
- Auditoria da release draft `v0.1.0-prototype`.

### Release local

- Preparada release local `v0.1.0-prototype`.
- Adicionado `release:check`.
- Adicionada documentação de release local e publicação npm futura.
- Preparação para tag local sem push remoto.

### Corrigido

- Ajustado secret scanning heurístico para evitar falsos positivos em padrões internos e fixtures controladas, sem reduzir bloqueios para segredos reais.
