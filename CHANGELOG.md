# Changelog

## [Unreleased]

### Corrigido

- Completa implementação do registry seguro de plugins/extensões iniciado no BLOCO 27.
- Adicionada política de extensão, auditoria de supply chain e relatórios consolidados.
- Corrigida integração de plugins/skills com `implement`, `status` e `doctor`.

### Adicionado

- Camada central de path safety para Windows, Linux e macOS.
- Escritas confinadas à raiz do projeto consumidor.
- Diagnóstico `doctor --path-safety` e resumo no `status`.
- Validação segura de `--allowed-files` e `--forbidden-files`.
- Bloqueio de caminhos absolutos externos, traversal e symlinks perigosos.
- Comando `sdd master security`.
- Segurança avançada opcional com detecção de `gitleaks` e `trufflehog`.
- Relatórios e auditorias de segurança redigidos.
- Integração de segurança com `doctor`, `status`, `git --pre-push`, `release`, `deploy` e `implement`.
- Implement assistido controlado em `sdd master implement`.
- Comando `sdd master plugins`.
- Sessões de implementação em `.sdd-master/implementation/sessions/`.
- Manifestos de mudança planejada.
- Contratos de testes antes da implementação.
- Handoff seguro para agentes de IA.
- Política de arquivos permitidos/proibidos para implementação.
- Registry local de plugins e skills com política de supply chain.
- Comando `sdd master release` como guard/checklist.
- Comando `sdd master deploy` como guard/checklist.
- Planos estruturados em `.sdd-master/releases/` e `.sdd-master/deliveries/`.
- Checks de release/deploy em `status` e `doctor`.
- Bloqueios contra publicação/deploy sem aprovação humana.
- Auditoria final da fase `0.2.0-prototype`.
- Inventário dos comandos implementados.
- Matriz de maturidade do SDD Master.
- Roadmap para `0.3.0-alpha`.
- Auditoria de segurança da fase publicada.

### Segurança

- Erros de caminho estruturados e redigidos, sem exposição de paths locais.
- `git --pre-push` bloqueia path safety inseguro e `.sdd-master/` na raiz do pacote.
- Ferramentas externas não são instaladas automaticamente.
- Scanners externos só rodam com opt-in explícito.
- Valores sensíveis são redigidos em relatórios.

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
