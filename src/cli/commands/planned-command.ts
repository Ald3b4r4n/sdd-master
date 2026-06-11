const plannedBlocks: Record<"doctor" | "update", string> = {
  doctor: "um bloco futuro",
  update: "um bloco futuro"
};

export function getPlannedCommandOutput(command: "doctor" | "update"): string {
  return `Comando planejado: sdd master ${command}

Este comando será implementado no ${plannedBlocks[command]}.
Nenhuma alteração foi feita no projeto.
`;
}
