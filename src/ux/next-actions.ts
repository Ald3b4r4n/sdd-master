export type ActionContext = {
  status?: string;
  initialized?: boolean;
  prepared?: boolean;
};

export function getNextActions(command: string, context: ActionContext = {}): string[] {
  if (context.initialized === false) return ["sdd master init", "sdd master doctor"];

  if (command === "init") {
    return ['sdd master doctor', 'sdd master onboard --profile="web"', "sdd master discovery"];
  }
  if (command === "doctor") {
    return context.status === "healthy"
      ? ["sdd master onboard", "sdd master discovery"]
      : ["Resolver warnings e bloqueios listados", "Rodar sdd master doctor novamente"];
  }
  if (command === "implement" && context.prepared) {
    return ["Revisar manifesto", "Aprovar contrato de testes", "Entregar handoff ao agente escolhido"];
  }
  if (command === "release") {
    return [
      "Resolver bloqueios",
      "Rodar sdd master release novamente",
      "Solicitar aprovação humana antes de publicar ou criar tag"
    ];
  }
  if (command === "deploy") {
    return ["Resolver bloqueios", "Rodar sdd master deploy novamente", "Solicitar aprovação humana antes do deploy"];
  }
  if (command === "onboard") {
    return [
      "sdd master doctor",
      "sdd master discovery",
      "sdd master requirements",
      "sdd master spec",
      "sdd master plan",
      "sdd master tasks",
      "sdd master quality",
      "sdd master audit"
    ];
  }
  return [];
}

export function formatNextActions(actions: string[]): string {
  return actions.length > 0 ? actions.map((action, index) => `  ${index + 1}. ${action}`).join("\n") : "  1. Nenhuma ação pendente";
}
