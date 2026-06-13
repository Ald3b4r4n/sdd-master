export type OfficialTemplate = {
  path: string;
  content: string;
};

export const templateVersion = "0.1.0";
export const templateCompatibility = ">=0.1.0-prototype.1";

type TemplateDefinition = {
  path: string;
  title: string;
  phase: string;
  specificContent: string;
};

const commonMetadata = `## Metadados
- ID:
- Versão:
- Status:
- Fase de origem:
- Última atualização:
- Responsável:
- Público-alvo:

## Objetivo
[Explique a finalidade deste documento.]

## Conteúdo
[Campos específicos do template.]
`;

const commonTraceability = `## Rastreabilidade
- Requisitos relacionados:
- Tarefas relacionadas:
- Testes relacionados:
- Documentação relacionada:
- Auditorias relacionadas:

## Histórico de alterações

| Versão | Data | Alteração | Responsável | Fase |
|---|---|---|---|---|
| 0.1 | AAAA-MM-DD | Criação inicial | SDD Master | PHASE-XX |
`;

const templateReadme: OfficialTemplate = {
  path: "README.md",
  content: withTemplateMetadata(
    "templates-readme",
    `# SDD Master — Templates

## O que são
Esta pasta contém a biblioteca local de templates oficiais do SDD Master.

## Aviso importante
Templates não são documentação aprovada. Eles são pontos de partida para criar documentos reais, que devem passar pelo fluxo de especificação, revisão, aprovação, qualidade e auditoria.

## Estrutura de categorias
- requirements: requisitos, regras e critérios.
- product: visão, público, jornadas e stakeholders.
- architecture: arquitetura, decisões, integrações, ambientes e dependências.
- code: documentação técnica, referências, erros e troubleshooting.
- workflow: discovery, fases, tarefas, testes, qualidade, auditoria, entrega e release.
- governance: estado, constituição, aprovações, rastreabilidade, riscos e escopo.
- security: segredos, privacidade, dependências e revisão de segurança.
- uiux: design system, UI/UX, acessibilidade, responsividade, SEO e performance.
- operations: CI, deploy, banco de dados, rollback e observabilidade.
- agents: instruções para agentes de IA e registro de skills.

## Regra de uso
Crie documentos reais copiando o template adequado para a área de trabalho do projeto. Não edite o template oficial como se fosse documento aprovado.

## Regra de versionamento
Templates oficiais podem ser versionados localmente como parte da governança SDD Master. Mudanças nos templates devem ser rastreáveis.

## Aprovação
Documentos reais criados a partir destes templates precisam ser revisados e aprovados pelo fluxo SDD Master antes de guiar implementação.
`
  )
};

const definitions: TemplateDefinition[] = [
  {
    path: "requirements/functional-requirement-template.md",
    title: "RF-XXX — [Título do Requisito Funcional]",
    phase: "PHASE-02",
    specificContent: `## Descrição
[O que o sistema deve fazer.]

## Prioridade
- MoSCoW:
- Simples:
- Justificativa:
- Impacto se não for entregue:

## Critérios de aceite
-

## Critérios de não aceite
-

## Regras de negócio relacionadas
-

## RNFs relacionados
-

## Testes esperados
-
`
  },
  {
    path: "requirements/non-functional-requirement-template.md",
    title: "RNF-XXX — [Título do Requisito Não Funcional]",
    phase: "PHASE-02",
    specificContent: `## Categorias
- Segurança:
- Performance:
- Acessibilidade:
- SEO, quando aplicável:
- Responsividade, quando aplicável:
- Observabilidade:
- Manutenibilidade:
- Compatibilidade:
- Usabilidade:
- Escalabilidade:

## Métrica verificável
-

## Limite mínimo aceitável
-
`
  },
  {
    path: "requirements/business-rule-template.md",
    title: "RN-XXX — [Título da Regra de Negócio]",
    phase: "PHASE-02",
    specificContent: `## Regra
[Declare a regra de forma objetiva.]

## Condições
-

## Exceções
-

## Exemplos
-
`
  },
  {
    path: "requirements/acceptance-criteria-template.md",
    title: "CA-XXX — [Critérios de Aceite]",
    phase: "PHASE-02",
    specificContent: `## Cenários
- Dado:
- Quando:
- Então:

## Critérios de aceite
-

## Critérios de rejeição
-
`
  },
  {
    path: "product/product-vision-template.md",
    title: "Visão de Produto",
    phase: "PHASE-01",
    specificContent: `## Problema
-

## Proposta de valor
-

## Objetivos de negócio
-

## Métricas de sucesso
-
`
  },
  {
    path: "product/target-audience-template.md",
    title: "Público-Alvo",
    phase: "PHASE-01",
    specificContent: `## Segmentos
-

## Perfis de usuário
-

## Necessidades
-

## Restrições de uso
-
`
  },
  {
    path: "product/user-journey-template.md",
    title: "Jornada do Usuário",
    phase: "PHASE-01",
    specificContent: `## Persona
-

## Etapas da jornada
-

## Dores
-

## Oportunidades
-
`
  },
  {
    path: "product/stakeholder-guide-template.md",
    title: "Guia de Stakeholders",
    phase: "PHASE-01",
    specificContent: `## Stakeholders
-

## Responsabilidades
-

## Decisões esperadas
-

## Canais de aprovação
-
`
  },
  {
    path: "architecture/architecture-template.md",
    title: "Arquitetura Técnica",
    phase: "PHASE-03",
    specificContent: `## Visão geral
-

## Componentes
-

## Fluxos principais
-

## Restrições técnicas
-
`
  },
  {
    path: "architecture/adr-template.md",
    title: "ADR-XXX — [Decisão de Arquitetura]",
    phase: "PHASE-03",
    specificContent: `## Status
-

## Contexto
-

## Decisão
-

## Alternativas consideradas
-

## Consequências positivas
-

## Consequências negativas/riscos
-

## Impacto na arquitetura
-

## Impacto na documentação
-

## Requisitos relacionados
-

## Aprovação
-
`
  },
  {
    path: "architecture/api-integration-template.md",
    title: "Integração de API",
    phase: "PHASE-03",
    specificContent: `## Serviço externo
-

## Contratos
-

## Autenticação
-

## Tratamento de erro
-

## Limites e retries
-
`
  },
  {
    path: "architecture/diagram-template.md",
    title: "Diagrama Técnico",
    phase: "PHASE-03",
    specificContent: `## Tipo de diagrama
-

## Elementos
-

## Relações
-

## Fonte editável
-
`
  },
  {
    path: "architecture/environment-template.md",
    title: "Ambientes e Configuração",
    phase: "PHASE-03",
    specificContent: `## Ambientes
-

## Variáveis esperadas
-

## Placeholders seguros
-

## Restrições de segurança
-
`
  },
  {
    path: "architecture/dependency-template.md",
    title: "Dependência Técnica",
    phase: "PHASE-03",
    specificContent: `## Dependência
-

## Justificativa
-

## Licença
-

## Riscos
-

## Plano de atualização
-
`
  },
  {
    path: "code/readme-template.md",
    title: "README Técnico",
    phase: "PHASE-04",
    specificContent: `## Instalação
-

## Execução
-

## Scripts
-

## Estrutura do código
-
`
  },
  {
    path: "code/code-documentation-template.md",
    title: "Documentação de Código",
    phase: "PHASE-04",
    specificContent: `## Módulo
-

## Responsabilidades
-

## Contratos públicos
-

## Pontos de extensão
-
`
  },
  {
    path: "code/api-reference-template.md",
    title: "Referência de API",
    phase: "PHASE-04",
    specificContent: `## Endpoint ou método
-

## Entrada
-

## Saída
-

## Erros
-
`
  },
  {
    path: "code/error-handling-template.md",
    title: "Tratamento de Erros",
    phase: "PHASE-04",
    specificContent: `## Erro
-

## Causa provável
-

## Comportamento esperado
-

## Observabilidade
-
`
  },
  {
    path: "code/troubleshooting-template.md",
    title: "Troubleshooting",
    phase: "PHASE-04",
    specificContent: `## Sintoma
-

## Diagnóstico
-

## Solução
-

## Prevenção
-
`
  },
  {
    path: "workflow/discovery-template.md",
    title: "Discovery",
    phase: "PHASE-01",
    specificContent: `## Objetivo do produto
-

## Perfis envolvidos
-

## Riscos iniciais
-

## Perguntas abertas
-
`
  },
  {
    path: "workflow/phase-spec-template.md",
    title: "Especificação de Fase",
    phase: "PHASE-02",
    specificContent: `## Escopo
-

## Fora de escopo
-

## Critérios de aprovação
-

## Dependências
-
`
  },
  {
    path: "workflow/phase-plan-template.md",
    title: "Plano de Fase",
    phase: "PHASE-03",
    specificContent: `## Estratégia
-

## Sequência
-

## Validações
-

## Pontos de decisão
-
`
  },
  {
    path: "workflow/task-template.md",
    title: "TASK-XXX — [Título da Tarefa]",
    phase: "PHASE-04",
    specificContent: `## TASK-XXX
-

## Origem
-

## Requisito relacionado
-

## Critérios de aceite
-

## Testes obrigatórios
-

## Documentação impactada
-

## Arquivos/áreas prováveis
-

## Dependências
-

## Riscos
-

## Status
-
`
  },
  {
    path: "workflow/test-plan-template.md",
    title: "Plano de Testes",
    phase: "PHASE-04",
    specificContent: `## Estratégia de teste
-

## Casos obrigatórios
-

## Dados de teste
-

## Critério de conclusão
-
`
  },
  {
    path: "workflow/test-result-template.md",
    title: "Resultado de Testes",
    phase: "PHASE-04",
    specificContent: `## Comandos executados
-

## Resultado
-

## Falhas
-

## Evidências
-
`
  },
  {
    path: "workflow/quality-review-template.md",
    title: "Revisão de Qualidade",
    phase: "PHASE-05",
    specificContent: `## Checklist
-

## Achados
-

## Correções obrigatórias
-

## Aprovação
-
`
  },
  {
    path: "workflow/audit-template.md",
    title: "AUDIT-XXX — [Título da Auditoria]",
    phase: "PHASE-06",
    specificContent: `## AUDIT-XXX
-

## Tipo
Autoauditoria | Auditoria crítica separada

## Severidade
-

## Categoria
-

## Evidência
-

## Impacto
-

## Ação obrigatória
-

## Status
-

## Relação com requisito/tarefa/documento/teste/commit
-
`
  },
  {
    path: "workflow/final-report-template.md",
    title: "Relatório Final",
    phase: "PHASE-06",
    specificContent: `## Resumo
-

## Entregas
-

## Evidências
-

## Pendências
-
`
  },
  {
    path: "workflow/delivery-template.md",
    title: "Entrega",
    phase: "PHASE-07",
    specificContent: `## Pacote de entrega
-

## Destino
-

## Instruções
-

## Validação pós-entrega
-
`
  },
  {
    path: "workflow/release-template.md",
    title: "Release",
    phase: "PHASE-07",
    specificContent: `## Versão
-

## Estágio
-

## Maturidade
-

## Tipo
-

## Changelog
-

## Testes
-

## Auditoria
-

## Secret scanning
-

## Dependências
-

## Riscos aceitos
-

## Aprovação humana
-

## Tag Git
-
`
  },
  {
    path: "governance/project-state-template.md",
    title: "Estado do Projeto",
    phase: "PHASE-01",
    specificContent: `## Identificação
-

## Fase atual
-

## Próximo comando permitido
-

## Restrições
-
`
  },
  {
    path: "governance/constitution-template.md",
    title: "Constituição do Projeto",
    phase: "PHASE-01",
    specificContent: `## Regras invioláveis
-

## Consequência de violação
-

## Aprovação
-
`
  },
  {
    path: "governance/approval-template.md",
    title: "Aprovação Humana",
    phase: "PHASE-XX",
    specificContent: `## Item aprovado
-

## Critérios
-

## Aprovador
-

## Condições
-
`
  },
  {
    path: "governance/traceability-template.md",
    title: "Rastreabilidade",
    phase: "PHASE-XX",
    specificContent: `## Origem
-

## Cadeia requisito-tarefa-teste
-

## Evidências
-

## Lacunas
-
`
  },
  {
    path: "governance/risk-template.md",
    title: "Risco",
    phase: "PHASE-XX",
    specificContent: `## Risco
-

## Probabilidade
-

## Impacto
-

## Mitigação
-
`
  },
  {
    path: "governance/pending-template.md",
    title: "Pendência",
    phase: "PHASE-XX",
    specificContent: `## Pendência
-

## Bloqueia avanço?
-

## Responsável
-

## Prazo
-
`
  },
  {
    path: "governance/blocker-template.md",
    title: "BLOCKER",
    phase: "PHASE-XX",
    specificContent: `## Bloqueio
-

## Motivo
-

## Ação obrigatória
-

## Critério de desbloqueio
-
`
  },
  {
    path: "governance/backlog-template.md",
    title: "Backlog",
    phase: "PHASE-XX",
    specificContent: `## Item
-

## Valor esperado
-

## Prioridade
-

## Critério de entrada
-
`
  },
  {
    path: "governance/scope-change-template.md",
    title: "Mudança de Escopo",
    phase: "PHASE-XX",
    specificContent: `## Mudança solicitada
-

## Justificativa
-

## Impacto
-

## Aprovação formal
-
`
  },
  {
    path: "security/secret-scan-template.md",
    title: "Secret Scan",
    phase: "PHASE-05",
    specificContent: `## Ferramenta usada
-

## Comando executado
-

## Escopo
-

## Resultado
-

## Achados sem expor valores sensíveis
-

## Revisão manual
-

## Evidência
-

## Decisão
-
`
  },
  {
    path: "security/privacy-template.md",
    title: "Privacidade",
    phase: "PHASE-03",
    specificContent: `## Dados tratados
-

## Base de tratamento
-

## Retenção
-

## Minimização
-
`
  },
  {
    path: "security/dependency-audit-template.md",
    title: "Auditoria de Dependências",
    phase: "PHASE-05",
    specificContent: `## Dependências analisadas
-

## Vulnerabilidades
-

## Licenças
-

## Decisão
-
`
  },
  {
    path: "security/security-review-template.md",
    title: "Revisão de Segurança",
    phase: "PHASE-05",
    specificContent: `## Superfície de ataque
-

## Controles
-

## Achados
-

## Aprovação
-
`
  },
  {
    path: "uiux/design-system-template.md",
    title: "Design System",
    phase: "PHASE-03",
    specificContent: `## Identidade visual
-

## Paleta de cores
-

## Tipografia
-

## Espaçamentos
-

## Radius
-

## Sombras
-

## Botões
-

## Inputs
-

## Cards
-

## Estados visuais
-

## Responsividade
-

## Acessibilidade
-

## Componentes base
-

## Ícones
-

## Microcopy
-
`
  },
  {
    path: "uiux/uiux-review-template.md",
    title: "Revisão UI/UX",
    phase: "PHASE-05",
    specificContent: `## Fluxo revisado
-

## Heurísticas
-

## Problemas
-

## Recomendações
-
`
  },
  {
    path: "uiux/accessibility-template.md",
    title: "Acessibilidade",
    phase: "PHASE-05",
    specificContent: `## Critérios WCAG
-

## Navegação por teclado
-

## Contraste
-

## Leitores de tela
-
`
  },
  {
    path: "uiux/responsiveness-template.md",
    title: "Responsividade",
    phase: "PHASE-05",
    specificContent: `## Breakpoints
-

## Layouts testados
-

## Problemas
-

## Evidências
-
`
  },
  {
    path: "uiux/seo-template.md",
    title: "SEO",
    phase: "PHASE-05",
    specificContent: `## Páginas
-

## Metadados
-

## Conteúdo indexável
-

## Riscos
-
`
  },
  {
    path: "uiux/performance-template.md",
    title: "Performance",
    phase: "PHASE-05",
    specificContent: `## Métricas
-

## Orçamento
-

## Gargalos
-

## Correções
-
`
  },
  {
    path: "operations/ci-template.md",
    title: "Integração Contínua",
    phase: "PHASE-05",
    specificContent: `## Pipeline
-

## Checks
-

## Gatilhos
-

## Falhas bloqueantes
-
`
  },
  {
    path: "operations/deploy-template.md",
    title: "Deploy",
    phase: "PHASE-07",
    specificContent: `## Ambiente
-

## Passos
-

## Validação
-

## Rollback
-
`
  },
  {
    path: "operations/database-change-template.md",
    title: "Mudança de Banco de Dados",
    phase: "PHASE-04",
    specificContent: `## Alteração
-

## Migração
-

## Compatibilidade
-

## Plano de rollback
-
`
  },
  {
    path: "operations/backup-rollback-template.md",
    title: "Backup e Rollback",
    phase: "PHASE-07",
    specificContent: `## Backup
-

## Restauração
-

## Tempo esperado
-

## Responsável
-
`
  },
  {
    path: "operations/observability-template.md",
    title: "Observabilidade",
    phase: "PHASE-05",
    specificContent: `## Logs
-

## Métricas
-

## Alertas
-

## Dashboards
-
`
  },
  {
    path: "agents/agents-md-template.md",
    title: "AGENTS.md",
    phase: "PHASE-03",
    specificContent: `## Instruções gerais
-

## Limites
-

## Comandos permitidos
-

## Segurança
-
`
  },
  {
    path: "agents/codex-template.md",
    title: "Codex",
    phase: "PHASE-03",
    specificContent: `## Papel
-

## Fluxo recomendado
-

## Restrições
-

## Evidências esperadas
-
`
  },
  {
    path: "agents/claude-template.md",
    title: "Claude",
    phase: "PHASE-03",
    specificContent: `## Papel
-

## Fluxo recomendado
-

## Restrições
-

## Evidências esperadas
-
`
  },
  {
    path: "agents/cursor-template.md",
    title: "Cursor",
    phase: "PHASE-03",
    specificContent: `## Papel
-

## Fluxo recomendado
-

## Restrições
-

## Evidências esperadas
-
`
  },
  {
    path: "agents/gemini-template.md",
    title: "Gemini",
    phase: "PHASE-03",
    specificContent: `## Papel
-

## Fluxo recomendado
-

## Restrições
-

## Evidências esperadas
-
`
  },
  {
    path: "agents/skills-registry-template.md",
    title: "Registro de Skills",
    phase: "PHASE-03",
    specificContent: `## Skill
-

## Origem
-

## Aprovação
-

## Riscos
-
`
  }
];

export const officialTemplates: OfficialTemplate[] = [
  templateReadme,
  ...definitions.map((definition) => ({
    path: definition.path,
    content: createTemplateContent(definition)
  }))
];

function createTemplateContent(definition: TemplateDefinition): string {
  return withTemplateMetadata(
    definition.path,
    `# ${definition.title}

${commonMetadata}
${definition.specificContent}
${commonTraceability}`.replace("| 0.1 | AAAA-MM-DD | Criação inicial | SDD Master | PHASE-XX |", `| 0.1 | AAAA-MM-DD | Criação inicial | SDD Master | ${definition.phase} |`)
  );
}

export function withTemplateMetadata(templateId: string, content: string): string {
  if (content.includes("## Template metadata")) {
    return content;
  }

  const lines = content.split("\n");
  const title = lines.shift() ?? "";
  const body = lines.join("\n").replace(/^\n/, "");

  return `${title}

## Template metadata
- Template ID: ${templateId}
- Template version: ${templateVersion}
- SDD Master compatibility: ${templateCompatibility}
- Managed by: SDD Master

${body}`;
}
