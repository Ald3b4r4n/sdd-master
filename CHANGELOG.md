# Changelog

## [Unreleased]

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
