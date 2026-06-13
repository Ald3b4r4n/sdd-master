import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { safeMkdir, safeWriteFile } from "../filesystem/safe-write.js";
import { resolveInsideProject } from "../filesystem/path-safety.js";
import { agentFiles } from "./agent-registry.js";
import { createAgentInstruction } from "./agent-instructions.js";
import type { AgentWriteOptions, AgentWriteResult, SupportedAgent } from "./agent-types.js";

export function writeAgentFiles(cwd: string, options: AgentWriteOptions): AgentWriteResult {
  const result: AgentWriteResult = {
    created: [],
    overwritten: [],
    preserved: [],
    files: []
  };

  safeMkdir(cwd, ".agents/skills");

  for (const agent of options.agents) {
    const file = agentFiles[agent];
    const targetPath = resolveInsideProject(cwd, file.path);
    const alreadyExists = existsSync(targetPath);
    result.files.push(file);

    if (alreadyExists && !options.force) {
      result.preserved.push(file.path);
      continue;
    }

    safeWriteFile(cwd, file.path, createAgentInstruction(agent, options.language));

    if (alreadyExists && options.force) {
      result.overwritten.push(file.path);
    } else {
      result.created.push(file.path);
    }
  }

  return result;
}

export function updateProjectStateAgentsBlock(
  cwd: string,
  primaryAgent: SupportedAgent,
  additionalAgents: SupportedAgent[],
  files: string[]
): void {
  const path = join(cwd, ".sdd-master", "project-state.md");

  if (!existsSync(path)) {
    return;
  }

  const existing = readFileSync(path, "utf8");
  const block = createProjectStateAgentsBlock(primaryAgent, additionalAgents, files);
  const pattern = /## Agentes \/ IAs configuradas[\s\S]*?(?=\n## |\s*$)/;
  const next = pattern.test(existing)
    ? existing.replace(pattern, block.trimEnd())
    : `${existing.trimEnd()}\n\n${block}`;

  safeWriteFile(cwd, ".sdd-master/project-state.md", `${next.trimEnd()}\n`);
}

export function getRecognizedAgentFiles(cwd: string): string[] {
  const uniquePaths = [...new Set(Object.values(agentFiles).map((file) => file.path))];
  return uniquePaths.filter((path) => existsSync(join(cwd, path)));
}

function createProjectStateAgentsBlock(
  primaryAgent: SupportedAgent,
  additionalAgents: SupportedAgent[],
  files: string[]
): string {
  const additional = additionalAgents.length > 0 ? additionalAgents.join(", ") : "Nenhuma";
  const fileLines = files.length > 0 ? files.map((file) => `  - ${file}`).join("\n") : "  - Nenhum";

  return `## Agentes / IAs configuradas

- IA principal: ${primaryAgent}
- IAs adicionais: ${additional}
- Arquivos de agente criados:
${fileLines}
- Última atualização: ${new Date().toISOString()}
- Status: Configurado
`;
}
