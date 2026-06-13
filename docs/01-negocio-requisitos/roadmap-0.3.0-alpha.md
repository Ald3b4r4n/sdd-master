# Roadmap — SDD Master 0.3.0-alpha

## Objetivo

Transformar o SDD Master de prototype publicado em alpha operacional validado em projetos reais.

## Prioridades

### 1. Uso real em projeto consumidor

- Aplicar em projeto real.
- Medir friccoes.
- Ajustar comandos.
- Validar documentacao.

### 2. Implement assistido controlado

- Evoluir contrato do implement assistido.
- Continuar sem executar comandos perigosos.
- Exigir escopo, testes, approval, audit e security gates.
- Criar manifesto antes de alteracoes de codigo.
- Validar handoff seguro para agentes em projeto real.

### 3. Release/deploy internos

- Evoluir comando `sdd master release` como checklist/guard.
- Evoluir comando `sdd master deploy` apenas como checklist/guard.
- Nao automatizar deploy perigoso.

### 4. Plugins/skills

- Evoluir skills locais.
- Avaliar busca online segura.
- Avaliar registry de skills aprovado.
- Manter instalacao local.

### 5. Seguranca

- Avaliar integracao opcional com gitleaks/trufflehog.
- Melhorar allowlist segura.
- Melhorar auditoria de dependencias.

### 6. Experiencia de uso

- Melhorar mensagens.
- Melhorar help.
- Reduzir atrito de setup.
- Validar em Windows, Linux e macOS.

## Fora de escopo para 0.3.0-alpha

- 1.0.0 estavel.
- Deploy automatico real.
- Execucao remota de skills.
- Publicacao npm automatizada.
