import { suggestCommand } from "./command-examples.js";

export function unknownCommandMessage(command: string, scope: "root" | "master"): string {
  const suggestion = suggestCommand(command);
  const use = scope === "master" ? "sdd master help" : "sdd --help";
  return `Comando não reconhecido: ${command}

Use:
  ${use}

Comandos próximos:
  ${suggestion ? `sdd master ${suggestion}` : "Consulte a lista de comandos disponíveis."}
`;
}
