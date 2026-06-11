# SDD Master

![Status](https://img.shields.io/badge/status-0.1.0--prototype-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Runtime](https://img.shields.io/badge/runtime-Node.js%20%2B%20TypeScript-3178c6)

**SDD Master** é um framework de desenvolvimento orientado por especificação para projetos de software assistidos por IA.

Ele nasce para ajudar equipes a criarem software com fases claras, documentação obrigatória, TDD, auditoria, rastreabilidade, segurança forte e governança técnica desde o primeiro dia.

## Status Atual

Versão: `0.1.0-prototype`

Este projeto está em fundação inicial. A base do pacote npm, o CLI mínimo e a documentação pública inicial já existem, mas os comandos operacionais do framework ainda serão implementados em blocos futuros.

## Para Que Serve

O SDD Master será usado para conduzir projetos por fases controladas:

- especificação antes da implementação;
- documentação como parte obrigatória do trabalho;
- testes antes ou junto do código;
- auditoria e rastreabilidade das decisões;
- compatibilidade com múltiplas IAs e agentes;
- proteção contra vazamento de segredos e mudanças sem controle.

## Instalação Futura Via npm

Quando o pacote estiver pronto para distribuição, a instalação pretendida será:

```bash
npm install -g sdd-master
```

Publicação no npm ainda não faz parte deste estágio.

## Uso Atual Local

Neste estágio, use o projeto localmente:

```bash
npm install
npm run build
node dist/cli/main.js --help
node dist/cli/main.js --version
node dist/cli/main.js master --help
node dist/cli/main.js master help
node dist/cli/main.js master status
```

## Comandos disponíveis no prototype atual

```bash
sdd --help
sdd --version
sdd master --help
sdd master help
sdd master help init
sdd master status
```

Neste prototype, `sdd master init` inicializa a estrutura SDD Master em um projeto consumidor, e `sdd master status` detecta a instalação básica.

O comando `init` pode ser usado em modo não interativo:

```bash
sdd master init --yes --language=pt-BR --agent=codex --project-name="Projeto Teste"
```

Ele cria `.sdd-master/`, `docs/`, `.agents/skills/`, atualiza `.gitignore` de forma segura e cria ou complementa o README do projeto consumidor.

Os comandos `doctor` e `update` ainda existem apenas como stubs seguros:

```bash
sdd master doctor
sdd master update
```

## Templates oficiais

O SDD Master instala templates locais em `.sdd-master/templates/`.

Esses templates cobrem:

- requisitos;
- produto;
- arquitetura;
- código;
- workflow;
- governança;
- segurança;
- UI/UX;
- operações;
- agentes/IA.

Os templates são instalados localmente no projeto consumidor para permitir retomada por qualquer IA/agente sem depender de estado externo. Eles são pontos de partida: documentos reais devem ser criados a partir dos templates, revisados e aprovados pelo fluxo SDD Master.

## Scripts do Projeto

```bash
npm run build
npm test
npm run lint
npm run format
npm run check
```

## Roadmap Resumido

- Fundação do pacote npm.
- CLI mínimo expandido.
- Comando de inicialização em projetos consumidores.
- Governança por fases SDD.
- Templates de documentação e arquitetura.
- Integração com agentes de IA.
- Auditoria, segurança e rastreabilidade.
- Preparação para repositório público e publicação.

## Princípios do SDD Master

- Especificar antes de implementar.
- Documentar decisões relevantes.
- Validar com testes objetivos.
- Manter rastreabilidade entre requisito, arquitetura, código e auditoria.
- Tratar segurança como requisito do produto, não como etapa opcional.
- Preservar compatibilidade com equipes humanas e agentes de IA.

## Compatibilidade Futura Multi-IA

O framework será desenhado para funcionar com diferentes assistentes e agentes de IA, evitando dependência rígida de um único fornecedor. A meta é que cada agente respeite as mesmas fases, artefatos, contratos de segurança e critérios de conclusão.

## Segurança

Não envie `.env` real, tokens, senhas, chaves privadas, certificados, credenciais ou qualquer dado sensível para o repositório.

Use arquivos de exemplo apenas com placeholders seguros, como:

```text
EXAMPLE_API_KEY=replace-me
```

Consulte [SECURITY.md](SECURITY.md) antes de reportar vulnerabilidades ou compartilhar qualquer evidência sensível.

## Licença

Distribuído sob a licença MIT. Consulte [LICENSE](LICENSE).
