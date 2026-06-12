import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

type ProjectStatePatch = {
  currentPhase: string;
  lastCompleted?: string;
  nextCommand: string;
  maturity?: string;
  registry: string;
};

export function updateWorkflowProjectState(cwd: string, patch: ProjectStatePatch): boolean {
  const path = join(cwd, ".sdd-master", "project-state.md");

  if (!existsSync(path)) {
    return false;
  }

  let content = readFileSync(path, "utf8");
  content = replaceLine(content, "Fase atual", patch.currentPhase);
  content = replaceLine(content, "Próximo comando permitido", patch.nextCommand);

  if (patch.lastCompleted) {
    content = replaceLine(content, "Última fase concluída", patch.lastCompleted);
  }

  if (patch.maturity) {
    content = replaceLine(content, "Maturidade atual", patch.maturity);
  }

  content = upsertWorkflowRegistry(content, patch.registry);
  writeFileSync(path, content, "utf8");
  return true;
}

function replaceLine(content: string, label: string, value: string): string {
  const pattern = new RegExp(`^- ${escapeRegExp(label)}:.*$`, "m");
  const line = `- ${label}: ${value}`;

  if (pattern.test(content)) {
    return content.replace(pattern, line);
  }

  return `${content.trimEnd()}\n${line}\n`;
}

function upsertWorkflowRegistry(content: string, entry: string): string {
  const heading = "## Workflow inicial";

  if (!content.includes(heading)) {
    return `${content.trimEnd()}\n\n${heading}\n- ${entry}\n`;
  }

  if (content.includes(`- ${entry}`)) {
    return content;
  }

  return content.replace(heading, `${heading}\n- ${entry}`);
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
