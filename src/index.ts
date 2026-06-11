export const name = "SDD Master";
export const version = "0.1.0-prototype";

export const helpText = `SDD Master

Framework rígido para desenvolvimento de software orientado por especificação, documentação, TDD, auditoria e agentes de IA.

Comandos disponíveis nesta versão inicial:
  sdd master help     Mostra ajuda inicial do SDD Master

Próximos comandos planejados:
  sdd master init
  sdd master doctor
  sdd master update
`;

export function getHelpText(): string {
  return helpText;
}
