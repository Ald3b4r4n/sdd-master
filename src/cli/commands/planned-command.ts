const plannedBlocks: Record<"update", string> = {
  update: "um bloco futuro"
};

export function getPlannedCommandOutput(command: "update"): string {
  return `Comando planejado: sdd master ${command}

Este comando será implementado no ${plannedBlocks[command]}.
Nenhuma alteração foi feita no projeto.
`;
}
