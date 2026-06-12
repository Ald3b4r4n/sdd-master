import { existsSync } from "node:fs";
import { join } from "node:path";

export function getNotInitializedMessage(): string {
  return `SDD Master não inicializado neste diretório.

Execute primeiro:
  sdd master init
`;
}

export function isWorkflowInitialized(cwd: string): boolean {
  return (
    existsSync(join(cwd, ".sdd-master")) &&
    existsSync(join(cwd, ".sdd-master", "constitution.md")) &&
    existsSync(join(cwd, ".sdd-master", "project-state.md"))
  );
}

export function missingPrerequisite(cwd: string, relativePath: string | undefined): string | undefined {
  if (!relativePath) {
    return undefined;
  }

  return existsSync(join(cwd, relativePath)) ? undefined : relativePath;
}

export function getMissingPrerequisiteMessage(relativePath: string): string {
  return `Fluxo SDD fora de ordem.

Pré-condição ausente:
  ${relativePath}

Execute o comando anterior do workflow antes de continuar.
`;
}
