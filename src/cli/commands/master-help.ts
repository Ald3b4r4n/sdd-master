type CommandHelp = {
  command: string;
  status: string;
  purpose: string;
  whenUsed: string;
  example: string;
  security?: string[];
  creates?: string[];
};

const commandHelps: Record<string, CommandHelp> = {
  init: {
    command: "init",
    status: "Planejado para BLOCO 03.",
    purpose: "Inicializar a estrutura SDD Master dentro de um projeto.",
    whenUsed: "Será usado no início da adoção do SDD Master em um projeto consumidor.",
    example: "sdd master init",
    creates: [
      ".sdd-master/",
      "docs/01-negocio-requisitos/",
      "docs/02-tecnica-arquitetura/",
      "docs/03-codigo/",
      ".agents/skills/"
    ],
    security: ["Não deve criar .env real.", "Não deve enviar .sdd-master/ para remoto."]
  },
  doctor: {
    command: "doctor",
    status: "Planejado.",
    purpose: "Diagnosticar a instalação, estrutura e requisitos mínimos do SDD Master.",
    whenUsed: "Será usado antes de implementar ou auditar um projeto.",
    example: "sdd master doctor",
    security: ["Não deve expor segredos em logs.", "Deve relatar problemas sem alterar arquivos."]
  },
  update: {
    command: "update",
    status: "Planejado.",
    purpose: "Atualizar templates, documentação base e estrutura controlada do framework.",
    whenUsed: "Será usado quando o pacote evoluir e um projeto consumidor precisar sincronizar padrões.",
    example: "sdd master update",
    security: ["Deve preservar arquivos do usuário.", "Deve evitar sobrescrever segredos ou .env real."]
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
    status: "Planejado.",
    purpose: "Guiar descoberta inicial do produto, negócio e contexto de uso.",
    whenUsed: "Será usado antes de requisitos detalhados e planejamento técnico.",
    example: "sdd master discovery",
    security: ["Não deve registrar dados sensíveis sem consentimento explícito."]
  },
  requirements: {
    command: "requirements",
    status: "Planejado.",
    purpose: "Organizar requisitos funcionais, não funcionais e critérios de aceite.",
    whenUsed: "Será usado após discovery e antes de especificação técnica.",
    example: "sdd master requirements",
    security: ["Deve separar requisitos públicos de informações sensíveis."]
  },
  clarify: {
    command: "clarify",
    status: "Planejado.",
    purpose: "Registrar perguntas, ambiguidades e decisões antes da implementação.",
    whenUsed: "Será usado quando uma especificação ainda tiver lacunas.",
    example: "sdd master clarify",
    security: ["Não deve inferir segredos nem solicitar credenciais reais."]
  },
  spec: {
    command: "spec",
    status: "Planejado.",
    purpose: "Criar ou validar especificações de funcionalidades.",
    whenUsed: "Será usado para transformar requisitos em escopo implementável.",
    example: "sdd master spec",
    security: ["Deve documentar limites de dados sensíveis."]
  },
  plan: {
    command: "plan",
    status: "Planejado.",
    purpose: "Planejar arquitetura, etapas técnicas e impactos antes do código.",
    whenUsed: "Será usado depois da especificação aprovada.",
    example: "sdd master plan",
    security: ["Deve registrar riscos de segurança no plano técnico."]
  },
  tasks: {
    command: "tasks",
    status: "Planejado.",
    purpose: "Quebrar o plano aprovado em tarefas rastreáveis.",
    whenUsed: "Será usado antes da implementação orientada por TDD.",
    example: "sdd master tasks",
    security: ["Deve incluir tarefas de validação de segurança quando aplicável."]
  },
  implement: {
    command: "implement",
    status: "Planejado.",
    purpose: "Conduzir implementação baseada em tarefas aprovadas.",
    whenUsed: "Será usado quando especificação, plano e tarefas estiverem prontos.",
    example: "sdd master implement",
    security: ["Não deve implementar fora do escopo aprovado."]
  },
  quality: {
    command: "quality",
    status: "Planejado.",
    purpose: "Executar verificações de qualidade, testes e critérios técnicos.",
    whenUsed: "Será usado antes de auditoria, release ou deploy.",
    example: "sdd master quality",
    security: ["Deve falhar se encontrar exposição de segredos."]
  },
  audit: {
    command: "audit",
    status: "Planejado.",
    purpose: "Auditar rastreabilidade, conformidade e riscos do projeto.",
    whenUsed: "Será usado ao fechar fases ou investigar divergências.",
    example: "sdd master audit",
    security: ["Não deve publicar evidências sensíveis."]
  },
  docs: {
    command: "docs",
    status: "Planejado.",
    purpose: "Validar e manter documentação obrigatória do SDD Master.",
    whenUsed: "Será usado quando requisitos, arquitetura ou código mudarem.",
    example: "sdd master docs",
    security: ["Deve evitar registrar tokens, senhas ou chaves em documentação."]
  },
  git: {
    command: "git",
    status: "Planejado.",
    purpose: "Apoiar fluxos locais de versionamento com governança SDD.",
    whenUsed: "Será usado para validar escopo antes de commits e branches.",
    example: "sdd master git",
    security: ["Não deve fazer push sem comando explícito.", "Não deve configurar remoto automaticamente."]
  },
  release: {
    command: "release",
    status: "Planejado.",
    purpose: "Preparar releases com checks, changelog e evidências.",
    whenUsed: "Será usado depois de qualidade e auditoria passarem.",
    example: "sdd master release",
    security: ["Não deve publicar pacote sem confirmação explícita."]
  },
  deploy: {
    command: "deploy",
    status: "Planejado.",
    purpose: "Preparar fluxos de entrega e implantação com segurança.",
    whenUsed: "Será usado quando o projeto tiver destino de deploy definido.",
    example: "sdd master deploy",
    security: ["Não deve armazenar credenciais de deploy no repositório."]
  },
  agents: {
    command: "agents",
    status: "Planejado.",
    purpose: "Organizar compatibilidade futura com agentes de IA.",
    whenUsed: "Será usado para padronizar instruções e responsabilidades entre agentes.",
    example: "sdd master agents",
    security: ["Agentes não devem receber segredos sem controle explícito."]
  },
  skills: {
    command: "skills",
    status: "Planejado.",
    purpose: "Gerenciar instruções e habilidades reutilizáveis para agentes.",
    whenUsed: "Será usado quando o projeto precisar de fluxos especializados.",
    example: "sdd master skills",
    security: ["Skills externas devem ser revisadas antes do uso."]
  }
};

export function getMasterCommandHelp(command?: string): string {
  if (!command) {
    return `SDD Master — Namespace master

Comandos disponíveis:
  sdd master help       Mostra esta ajuda
  sdd master version    Mostra a versão instalada
  sdd master status     Mostra status básico do projeto

Comandos planejados:
  sdd master init
  sdd master doctor
  sdd master update
  sdd master discovery
  sdd master requirements
  sdd master clarify
  sdd master spec
  sdd master plan
  sdd master tasks
  sdd master implement
  sdd master quality
  sdd master audit
  sdd master docs
  sdd master git
  sdd master release
  sdd master deploy
  sdd master agents
  sdd master skills

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

  return `sdd master ${help.command}

Status:
  ${help.status}

Finalidade:
  ${help.purpose}

Quando será usado:
  ${help.whenUsed}

Uso futuro:
  ${help.example}
${creates}${security}`;
}
