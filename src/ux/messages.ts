export function notInitializedMessage(): string {
  return `SDD Master não inicializado neste diretório.

Execute primeiro:
  sdd master init

Depois:
  sdd master doctor
`;
}

export function dangerousActionBlockedMessage(): string {
  return `Ação bloqueada por segurança.

Motivo:
  Esta ação exige aprovação humana explícita.

Próxima ação:
  Revise o relatório gerado e aprove manualmente se desejar continuar.
`;
}
