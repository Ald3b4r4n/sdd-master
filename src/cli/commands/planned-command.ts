const plannedBlocks: Record<"init" | "doctor" | "update", string> = {
  init: "BLOCO 03",
  doctor: "um bloco futuro",
  update: "um bloco futuro"
};

export function getPlannedCommandOutput(command: "init" | "doctor" | "update"): string {
  return `Comando planejado: sdd master ${command}

Este comando será implementado no ${plannedBlocks[command]}.
Nenhuma alteração foi feita no projeto.
`;
}
