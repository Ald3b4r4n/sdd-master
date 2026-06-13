type CommandHelp = {
  command: string;
  status: string;
  purpose: string;
  whenUsed: string;
  example: string;
  details?: string[];
  security?: string[];
  creates?: string[];
};

const commandHelps: Record<string, CommandHelp> = {
  init: {
    command: "init",
    status: "Disponível no BLOCO 03.",
    purpose: "Inicializar a estrutura SDD Master dentro de um projeto.",
    whenUsed: "Será usado no início da adoção do SDD Master em um projeto consumidor.",
    example: "sdd master init",
    creates: [
      ".sdd-master/",
      ".sdd-master/templates/",
      "docs/01-negocio-requisitos/",
      "docs/02-tecnica-arquitetura/",
      "docs/03-codigo/",
      ".agents/skills/"
    ],
    security: [
      "Instala templates oficiais em .sdd-master/templates/.",
      "Gera automaticamente o arquivo do agente principal escolhido.",
      "Não deve criar .env real.",
      "Não deve enviar .sdd-master/ para remoto."
    ]
  },
  doctor: {
    command: "doctor",
    status: "Disponível no BLOCO 05.",
    purpose: "Diagnosticar a instalação, estrutura, templates, segurança básica e estado do SDD Master.",
    whenUsed: "Será usado antes de implementar ou auditar um projeto.",
    example: "sdd master doctor",
    security: [
      "Suporta saída JSON com sdd master doctor --json.",
      "Verifica .sdd-master/, docs, templates oficiais, .gitignore, arquivos sensíveis, Git e relatórios avançados.",
      "Ferramentas externas ausentes não quebram o doctor por padrão.",
      "Não deve expor segredos em logs.",
      "Deve relatar problemas sem alterar arquivos."
    ]
  },
  update: {
    command: "update",
    status: "Disponível no BLOCO 22.",
    purpose: "Atualizar uma instalação local do SDD Master com plano, backup e relatório.",
    whenUsed: "Use quando o pacote evoluir e um projeto consumidor precisar sincronizar templates e metadados.",
    example: "sdd master update --dry-run",
    details: [
      "Flags: --help, --json, --yes, -y, --dry-run, --apply, --force, --templates, --agents, --docs, --project-state, --backup.",
      "Dry-run mostra o plano sem alterar arquivos.",
      "Apply cria backup antes de alterações seguras.",
      "Conflitos são preservados e registrados."
    ],
    security: [
      "Nunca apaga histórico.",
      "Nunca sobrescreve decisão humana.",
      "Não cria .env real.",
      "Não executa release, deploy ou publicação npm."
    ]
  },
  status: {
    command: "status",
    status: "Disponível neste prototype.",
    purpose: "Mostrar um status básico da instalação SDD Master no diretório atual.",
    whenUsed: "Use para verificar rapidamente se a estrutura operacional já existe.",
    example: "sdd master status",
    security: ["Neste bloco não lê segredos nem cria .sdd-master/."]
  },
  discovery: {
    command: "discovery",
    status: "Disponível no BLOCO 17.",
    purpose: "Guiar descoberta inicial do produto, negócio e contexto de uso.",
    whenUsed: "Use após sdd master init e antes de requirements.",
    example: "sdd master discovery --yes --title=\"Meu Projeto\" --project-type=\"web\" --profiles=\"WEB\" --maturity=\"M0\"",
    creates: [
      ".sdd-master/discovery/initial-discovery.md",
      ".sdd-master/discovery/project-profiles.md",
      ".sdd-master/discovery/initial-risks.md",
      ".sdd-master/discovery/constraints.md",
      "docs/01-negocio-requisitos/visao-do-produto.md"
    ],
    details: [
      "Flags: --help, --json, --yes, -y, --title, --phase, --project-type, --profiles, --maturity.",
      "Próximo comando: /sdd-master-requirements.",
      "Aprovação humana pendente antes de avançar."
    ],
    security: ["Exige projeto inicializado.", "Não cria .env real.", "Preserva arquivos existentes."]
  },
  requirements: {
    command: "requirements",
    status: "Disponível no BLOCO 17.",
    purpose: "Organizar requisitos funcionais, não funcionais e critérios de aceite.",
    whenUsed: "Use após discovery e antes de spec.",
    example: "sdd master requirements --yes --title=\"Requisitos iniciais\"",
    creates: [
      ".sdd-master/requirements/requirements-index.md",
      ".sdd-master/requirements/rf/RF-001.md",
      ".sdd-master/requirements/rnf/RNF-001.md",
      ".sdd-master/requirements/business-rules/BR-001.md"
    ],
    details: [
      "Pré-condição: .sdd-master/discovery/initial-discovery.md.",
      "Próximo comando: /sdd-master-spec.",
      "Aprovação humana pendente antes de avançar."
    ],
    security: ["Exige projeto inicializado.", "Não cria .env real.", "Preserva arquivos existentes."]
  },
  clarify: {
    command: "clarify",
    status: "Disponível no BLOCO 18.",
    purpose: "Registrar perguntas, ambiguidades e decisões antes da implementação.",
    whenUsed: "Use quando uma especificação ainda tiver lacunas ou depender de resposta humana.",
    example: "sdd master clarify --yes --title=\"Dúvida sobre escopo\" --phase=\"PHASE-01\"",
    creates: [".sdd-master/clarifications/clarifications-index.md", ".sdd-master/clarifications/CLARIFY-001.md"],
    details: [
      "Flags: --help, --json, --yes, -y, --title, --id, --type, --status, --reason, --phase.",
      "Clarificações abertas bloqueiam a futura implementação.",
      "Resolução exige registro humano explícito."
    ],
    security: ["Não deve inferir segredos nem solicitar credenciais reais.", "Não cria .env real."]
  },
  approve: {
    command: "approve",
    status: "Disponível no BLOCO 18.",
    purpose: "Registrar aprovação humana formal de documentos, fases ou transições.",
    whenUsed: "Use antes de liberar etapas do fluxo SDD para implementação futura.",
    example:
      "sdd master approve --yes --target=\"tasks\" --phase=\"PHASE-01\" --decision=\"approved\" --reason=\"Tarefas aprovadas.\"",
    creates: [".sdd-master/approvals/approvals-index.md", ".sdd-master/approvals/APPROVAL-001.md"],
    details: [
      "Flags: --help, --json, --yes, -y, --target, --phase, --decision, --reason.",
      "Aprovação nunca é presumida.",
      "Rejeições bloqueiam o próximo passo relacionado."
    ],
    security: ["Registra Aprovador: Humano.", "Não cria .env real."]
  },
  scope: {
    command: "scope",
    status: "Disponível no BLOCO 18.",
    purpose: "Controlar escopo aprovado, fora de escopo e mudanças de escopo.",
    whenUsed: "Use quando o escopo precisar ser registrado ou quando houver solicitação de mudança.",
    example: "sdd master scope --yes --type=\"change\" --title=\"Nova solicitação\" --phase=\"PHASE-01\"",
    creates: [
      ".sdd-master/scope/approved-scope.md",
      ".sdd-master/scope/out-of-scope.md",
      ".sdd-master/scope/changes/CHANGE-001.md"
    ],
    details: [
      "Flags: --help, --json, --yes, -y, --title, --type, --reason, --phase.",
      "Mudança de escopo aberta bloqueia a futura implementação.",
      "Escopo aprovado deve ser rastreável."
    ],
    security: ["Não autoriza implementação automaticamente.", "Não cria .env real."]
  },
  backlog: {
    command: "backlog",
    status: "Disponível no BLOCO 18.",
    purpose: "Registrar itens futuros, melhorias, dívida técnica, riscos futuros e ideias fora do escopo atual.",
    whenUsed: "Use para separar ideias futuras do escopo aprovado.",
    example: "sdd master backlog --yes --type=\"improvement\" --title=\"Melhoria futura\" --priority=\"COULD\"",
    creates: [".sdd-master/backlog/backlog-index.md", ".sdd-master/backlog/BACKLOG-001.md"],
    details: [
      "Flags: --help, --json, --yes, -y, --title, --type, --reason, --phase, --priority.",
      "Backlog não autoriza implementação.",
      "Promoção de backlog exigirá fluxo formal futuro."
    ],
    security: ["Não implementa itens registrados.", "Não cria .env real."]
  },
  spec: {
    command: "spec",
    status: "Disponível no BLOCO 17.",
    purpose: "Criar ou validar especificações de funcionalidades.",
    whenUsed: "Use após requirements e antes de plan.",
    example: "sdd master spec --yes --phase=\"PHASE-01\" --title=\"Especificação inicial\"",
    creates: [".sdd-master/specs/phase-01-spec.md"],
    details: [
      "Pré-condição: .sdd-master/requirements/requirements-index.md.",
      "Próximo comando: /sdd-master-plan.",
      "Aprovação humana pendente antes de avançar."
    ],
    security: ["Exige projeto inicializado.", "Não cria .env real.", "Preserva arquivos existentes."]
  },
  plan: {
    command: "plan",
    status: "Disponível no BLOCO 17.",
    purpose: "Planejar arquitetura, etapas técnicas e impactos antes do código.",
    whenUsed: "Use após spec e antes de tasks.",
    example: "sdd master plan --yes --phase=\"PHASE-01\" --title=\"Plano técnico inicial\"",
    creates: [".sdd-master/plans/phase-01-plan.md", "docs/02-tecnica-arquitetura/plano-tecnico-inicial.md"],
    details: [
      "Pré-condição: .sdd-master/specs/phase-01-spec.md.",
      "Próximo comando: /sdd-master-tasks.",
      "Aprovação humana pendente antes de avançar."
    ],
    security: ["Exige projeto inicializado.", "Não cria .env real.", "Preserva arquivos existentes."]
  },
  tasks: {
    command: "tasks",
    status: "Disponível no BLOCO 17.",
    purpose: "Quebrar o plano aprovado em tarefas rastreáveis.",
    whenUsed: "Use após plan e antes de implement.",
    example: "sdd master tasks --yes --phase=\"PHASE-01\" --title=\"Tarefas iniciais\"",
    creates: [".sdd-master/tasks/phase-01-tasks.md", ".sdd-master/tasks/TASK-001.md"],
    details: [
      "Pré-condição: .sdd-master/plans/phase-01-plan.md.",
      "Próximo comando lógico: /sdd-master-implement, ainda não implementado.",
      "Aprovação humana pendente antes de avançar."
    ],
    security: ["Exige projeto inicializado.", "Não cria .env real.", "Preserva arquivos existentes."]
  },
  implement: {
    command: "implement",
    status: "Disponível no BLOCO 20 em modo guard/dry-run.",
    purpose: "Verificar readiness completo e preparar manifesto de implementação autorizável.",
    whenUsed: "Use após workflow, governança, gates e test gates para validar se a implementação futura pode ser autorizada.",
    example: "sdd master implement --yes --phase=\"PHASE-01\" --task=\"TASK-001\" --dry-run",
    creates: [".sdd-master/implementation/implementation-index.md", ".sdd-master/implementation/IMPLEMENT-001.md"],
    details: [
      "Nesta versão prototype, não altera código do projeto consumidor.",
      "Dry-run é o comportamento padrão.",
      "Verifica discovery, requirements, spec, plan, tasks, approvals, clarifications, scope, quality, audit, docs, blockers, test gates, security/git e segurança avançada."
    ],
    security: ["Não executa comandos arbitrários.", "Não roda scripts fornecidos pelo usuário.", "codeChanged sempre é false neste bloco."]
  },
  quality: {
    command: "quality",
    status: "Disponível no BLOCO 19.",
    purpose: "Executar verificações de qualidade, testes e critérios técnicos.",
    whenUsed: "Use antes da futura implementação para registrar qualidade de fase, documento, requisito ou tarefa.",
    example: "sdd master quality --yes --phase=\"PHASE-01\" --target=\"tasks\" --title=\"Revisão de qualidade\"",
    creates: [".sdd-master/quality/quality-index.md", ".sdd-master/quality/QUALITY-001.md"],
    details: [
      "Flags: --help, --json, --yes, -y, --title, --phase, --target, --status, --reason.",
      "Status failed cria blocker e bloqueia readiness.",
      "Status warning aparece em status/doctor."
    ],
    security: ["Não executa implementação.", "Não cria .env real.", "Não expõe segredos em achados."]
  },
  audit: {
    command: "audit",
    status: "Disponível no BLOCO 19.",
    purpose: "Auditar rastreabilidade, conformidade e riscos do projeto.",
    whenUsed: "Use para registrar auditoria formal e achados por severidade.",
    example: "sdd master audit --yes --phase=\"PHASE-01\" --type=\"self-audit\" --title=\"Auditoria da fase\"",
    creates: [".sdd-master/audits/audit-index.md", ".sdd-master/audits/AUDIT-001.md"],
    details: [
      "Severidades: INFO, LOW, MEDIUM, HIGH, CRITICAL, BLOCKER.",
      "Severidade BLOCKER cria blocker ativo.",
      "HIGH e CRITICAL aparecem em status/doctor e afetam readiness."
    ],
    security: ["Evidências devem ser descritas sem expor segredos.", "Não publica release ou pacote."]
  },
  docs: {
    command: "docs",
    status: "Disponível no BLOCO 19.",
    purpose: "Validar e manter documentação obrigatória do SDD Master.",
    whenUsed: "Use para registrar atualização ou pendência documental.",
    example: "sdd master docs --yes --phase=\"PHASE-01\" --target=\"workflow\" --title=\"Validação documental\"",
    creates: [".sdd-master/docs/docs-index.md", ".sdd-master/docs/DOCS-001.md"],
    details: [
      "Detecta os três eixos públicos de docs.",
      "Status missing ou outdated bloqueia readiness.",
      "Registro documental não autoriza implementação."
    ],
    security: ["Deve evitar registrar tokens, senhas ou chaves em documentação."]
  },
  blocker: {
    command: "blocker",
    status: "Disponível no BLOCO 19.",
    purpose: "Criar, listar, resolver e consultar blockers formais.",
    whenUsed: "Use quando houver impedimento formal para avanço.",
    example: "sdd master blocker --yes --title=\"Bloqueio formal\" --phase=\"PHASE-01\" --severity=\"BLOCKER\"",
    creates: [".sdd-master/blockers/blockers-index.md", ".sdd-master/blockers/BLOCKER-001.md"],
    details: [
      "Use --json para listar blockers.",
      "Use --id e --status=resolved para resolver.",
      "Blocker aberto impede futura implementação."
    ],
    security: ["Aceite formal ainda depende de aprovação humana.", "Não executa implementação."]
  },
  git: {
    command: "git",
    status: "Disponível no BLOCO 07.",
    purpose: "Diagnosticar Git e segurança local sem executar commit, push, tag ou release.",
    whenUsed: "Use antes de commit ou push para detectar .env, segredos e risco de .sdd-master/ remoto.",
    example: "sdd master git",
    details: [
      "Suporta --json, --pre-commit e --pre-push.",
      "Bloqueia .env real, arquivos sensíveis, segredos suspeitos, security report blocked e .sdd-master/ pendente em pre-push.",
      "Não executa git add, commit, push, tag ou release."
    ],
    security: ["Não faz commit automaticamente.", "Não faz push automaticamente.", "Push exige autorização humana explícita."]
  },
  security: {
    command: "security",
    status: "Disponível no BLOCO 28.",
    purpose: "Executar segurança builtin e integrar gitleaks/trufflehog de forma local, opcional e redigida.",
    whenUsed: "Use para criar relatórios de segurança ou consultar scanners externos instalados manualmente.",
    example: 'sdd master security --detect-tools --json',
    creates: [
      ".sdd-master/security/security-policy.md",
      ".sdd-master/security/reports/SECURITY-REPORT-001.md",
      ".sdd-master/security/audits/SECURITY-AUDIT-001.md",
      ".sdd-master/security/external-tools/EXTERNAL-TOOLS-001.md"
    ],
    details: [
      "Builtin é o modo padrão.",
      "gitleaks e trufflehog são opcionais e só executam com --run-external.",
      "Ferramentas ausentes não bloqueiam por padrão; --strict pode exigir disponibilidade.",
      "Relatórios persistem apenas achados redigidos."
    ],
    security: [
      "Não instala ou baixa scanners.",
      "Não envia código a serviços externos.",
      "Não imprime nem salva segredos reais.",
      "Achados críticos bloqueiam pre-push, release e deploy."
    ]
  },
  release: {
    command: "release",
    status: "Disponível no BLOCO 25 como guard/checklist.",
    purpose: "Criar plano/checklist de release, validar gates e registrar readiness sem publicar.",
    whenUsed: "Use depois de quality, audit, docs, blockers e implement guard para preparar uma release autorizável.",
    example: 'sdd master release --yes --version="0.3.0-alpha" --channel="alpha" --type="local" --dry-run',
    creates: [
      ".sdd-master/releases/release-index.md",
      ".sdd-master/releases/RELEASE-001.md",
      ".sdd-master/releases/checklists/RELEASE-CHECKLIST-001.md"
    ],
    details: [
      "Flags: --help, --json, --yes, -y, --phase, --title, --target, --environment, --dry-run, --version, --channel, --type, --checklist.",
      "Dry-run é o comportamento padrão.",
      "Mesmo sem --dry-run, este bloco continua sendo apenas guard/checklist.",
      "Valida workflow, aprovações, clarificações, escopo, quality, audit, docs, blockers, implement guard, test gates, UI/UX, security/git, segurança avançada, package check, npm dry-run e release notes."
    ],
    security: [
      "Não cria tag automaticamente.",
      "Não publica npm.",
      "Não publica GitHub Release.",
      "Release real exige autorização humana explícita fora deste comando."
    ]
  },
  deploy: {
    command: "deploy",
    status: "Disponível no BLOCO 25 como guard/checklist.",
    purpose: "Criar plano/checklist de deploy, validar riscos e registrar readiness sem executar deploy.",
    whenUsed: "Use depois de preparar release guard e antes de qualquer entrega real.",
    example: 'sdd master deploy --yes --environment="staging" --provider="vercel" --strategy="serverless" --dry-run',
    creates: [
      ".sdd-master/deliveries/delivery-index.md",
      ".sdd-master/deliveries/DEPLOY-001.md",
      ".sdd-master/deliveries/checklists/DEPLOY-CHECKLIST-001.md"
    ],
    details: [
      "Flags: --help, --json, --yes, -y, --phase, --title, --target, --environment, --dry-run, --provider, --strategy, --checklist.",
      "Dry-run é o comportamento padrão.",
      "Mesmo sem --dry-run, este bloco continua sendo apenas guard/checklist.",
      "Valida release guard, security/git, segurança avançada, env vars sem valores, secrets, database, rollback, observability, backup, documentation e aprovação humana."
    ],
    security: [
      "Não acessa servidor.",
      "Não executa scripts remotos.",
      "Não usa SSH/SFTP/FTP/rsync/scp.",
      "Não armazena credenciais ou valores de secrets.",
      "Deploy real exige autorização humana explícita fora deste comando."
    ]
  },
  agents: {
    command: "agents",
    status: "Disponível no BLOCO 06.",
    purpose: "Gerar arquivos de instrução para múltiplas IAs/agentes de codificação.",
    whenUsed: "Use após sdd master init para configurar agentes adicionais.",
    example: "sdd master agents --yes --agents=codex,claude,cursor --language=pt-BR",
    details: [
      "Agentes suportados: codex, claude, cursor, gemini, copilot, windsurf, cline, roo, aider, continue, generic.",
      "Flags: --agents, --language, --yes, -y, --force.",
      "Use --force somente quando quiser sobrescrever arquivos de agente existentes.",
      "Use sdd master agents --list para listar agentes."
    ],
    security: [
      "Exige projeto inicializado com sdd master init.",
      "Não cria .env real.",
      "Não instala skills externas.",
      "Reforça constituição, project-state e aprovação humana antes de push."
    ]
  },
  skills: {
    command: "skills",
    status: "Disponível no BLOCO 21.",
    purpose: "Registrar, aprovar, instalar localmente como metadado em registry local e reportar uso de skills.",
    whenUsed: "Use quando o projeto precisar propor skills externas ou registrar skills usadas por agentes.",
    example: 'sdd master skills --yes --title="Skill de UI/UX" --category="uiux"',
    creates: [".sdd-master/skills/SKILL-001.md", ".agents/skills/registry.md", ".agents/skills/installed/"],
    details: [
      "Flags: --help, --json, --yes, -y, --title, --phase, --type, --status, --category, --source, --skill, --reason, --permission, --approve, --reject, --install-local, --mark-used, --report, --target.",
      "Instalação local cria apenas metadados.",
      "Toda skill usada deve aparecer em relatório.",
      "Registry local fica em .agents/skills/registry.md.",
      "Registry consolidado e policy ficam em .sdd-master/extensions/.",
      "Skills alimentam UI/UX e implement readiness quando usadas."
    ],
    security: [
      "Instalação global é proibida.",
      "Skills externas exigem aprovação humana.",
      "Não baixa nem executa código remoto.",
      "Não cria .env real."
    ]
  },
  plugins: {
    command: "plugins",
    status: "Corrigido e completo no BLOCO 27A.",
    purpose: "Registrar, aprovar, instalar localmente como metadado e reportar uso de plugins/extensões seguras.",
    whenUsed: "Use quando o projeto precisar controlar plugins locais com política de supply chain segura.",
    example: 'sdd master plugins --yes --title="Plugin de integração" --category="integration"',
    creates: [".sdd-master/extensions/plugins/PLUGIN-001.md", ".sdd-master/extensions/registry.md", ".agents/skills/installed/"],
    details: [
      "Flags: --help, --json, --yes, -y, --title, --phase, --id, --type, --status, --category, --source, --version, --reason, --permission, --approve, --reject, --audit, --install-local, --mark-used, --report, --target.",
      "Instalação local cria apenas metadados.",
      "Nenhum código remoto é baixado ou executado.",
      "Registry, approvals, audits, usage e reports ficam em .sdd-master/extensions/.",
      "Todo plugin usado deve aparecer em relatório."
    ],
    security: [
      "Instalação global é proibida.",
      "Plugins externos exigem aprovação humana.",
      "Não baixa nem executa código remoto.",
      "Não cria .env real."
    ]
  },
  uiux: {
    command: "uiux",
    status: "Disponível no BLOCO 21.",
    purpose: "Criar registros e gates de UI/UX, design system, acessibilidade, SEO, responsividade e performance.",
    whenUsed: "Use antes de implementar interfaces ou presença web pública.",
    example: 'sdd master uiux --yes --phase="PHASE-01" --profile="WEB" --title="Revisão UI/UX inicial"',
    creates: [
      ".sdd-master/uiux/UIUX-001.md",
      ".sdd-master/uiux/design-system.md",
      ".sdd-master/uiux/accessibility-checklist.md",
      ".sdd-master/uiux/seo-checklist.md",
      ".sdd-master/uiux/responsiveness-checklist.md"
    ],
    details: [
      "Flags: --help, --json, --yes, -y, --title, --phase, --type, --status, --category, --source, --skill, --reason, --profile, --target.",
      "Perfis WEB, MOBILE, DESKTOP, SAAS e E-COMMERCE exigem UI/UX aprovado, design system, acessibilidade e responsividade.",
      "WEB, SAAS e E-COMMERCE exigem SEO.",
      "Perfil API aparece como not-applicable."
    ],
    security: ["Não executa implementação.", "Não instala dependências.", "Integra readiness do implement."]
  }
};

export function getMasterCommandHelp(command?: string): string {
  if (!command) {
    return `SDD Master — Namespace master

Comandos disponíveis:
  sdd master help       Mostra esta ajuda
  sdd master version    Mostra a versão instalada
  sdd master status     Mostra status básico do projeto
  sdd master init       Inicializa estrutura SDD Master no projeto
  sdd master doctor     Diagnostica a instalação SDD Master
  sdd master agents     Gera arquivos de instrução para IAs/agentes
  sdd master git        Diagnostica Git e segurança local
  sdd master security   Executa segurança avançada opcional e redigida
  sdd master skills     Gerencia skills locais e relatórios de uso
  sdd master plugins    Gerencia plugins locais e política de supply chain
  sdd master uiux       Cria gates de design, accessibility, SEO e responsividade
  sdd master discovery  Cria discovery inicial
  sdd master requirements Cria requisitos iniciais
  sdd master spec       Cria especificação inicial
  sdd master plan       Cria plano técnico inicial
  sdd master tasks      Cria tarefas iniciais
  sdd master clarify    Registra dúvidas e respostas humanas
  sdd master approve    Registra aprovações humanas formais
  sdd master scope      Controla escopo e mudanças
  sdd master backlog    Registra itens futuros fora do escopo atual
  sdd master quality    Registra revisão de qualidade
  sdd master audit      Registra auditoria formal
  sdd master docs       Registra estado documental
  sdd master blocker    Gerencia blockers formais
  sdd master implement  Verifica readiness em modo guard/dry-run
  sdd master release
  sdd master deploy

Use:
  sdd master help <command>
`;
  }

  const help = commandHelps[command];

  if (!help) {
    return `Ajuda não encontrada para: ${command}

Use:
  sdd master help
`;
  }

  return formatCommandHelp(help);
}

function formatCommandHelp(help: CommandHelp): string {
  const creates = help.creates
    ? `
Criará futuramente:
${help.creates.map((item) => `  ${item}`).join("\n")}
`
    : "";

  const security = help.security
    ? `
Segurança:
${help.security.map((item) => `  ${item}`).join("\n")}
`
    : "";
  const details = help.details
    ? `
Detalhes:
${help.details.map((item) => `  ${item}`).join("\n")}
`
    : "";

  return `sdd master ${help.command}

Status:
  ${help.status}

Finalidade:
  ${help.purpose}

Quando será usado:
  ${help.whenUsed}

Uso futuro:
  ${help.example}
${creates}${details}${security}`;
}
