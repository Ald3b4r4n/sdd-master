export function getRootHelp(): string {
  return `SDD Master

Uso:
  sdd master <comando> [opções]
  sdd master <command>

Primeiros passos:
  sdd master init
  sdd master onboard
  sdd master doctor
  sdd master discovery
  sdd master requirements
  sdd master plan
  sdd master tasks

Comandos principais:
  init          Inicializa o SDD Master em um projeto
  onboard       Guia os primeiros passos do projeto
  doctor        Diagnostica estrutura, segurança e readiness
  status        Mostra estado atual do projeto
  discovery     Registra descoberta do produto
  requirements  Registra requisitos
  spec          Cria especificação de fase
  plan          Cria plano
  tasks         Cria tarefas
  implement     Prepara implementação assistida
  quality       Executa gate de qualidade
  audit         Executa auditoria
  release       Prepara release como guard
  deploy        Prepara deploy como guard
  security      Executa segurança builtin/opt-in
  plugins       Gerencia extensões seguras
  update        Atualiza estrutura SDD com segurança

Dica:
  Rode \`sdd master init\` dentro do projeto consumidor.
  Use \`sdd master help\` para ver todos os comandos.
`;
}
