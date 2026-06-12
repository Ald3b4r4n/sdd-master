import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { TestGateStatus } from "./implement-types.js";

export function getTestGateStatus(cwd: string, task = "TASK-001"): TestGateStatus {
  const phaseTasks = join(cwd, ".sdd-master", "tasks", "phase-01-tasks.md");
  const taskFile = join(cwd, ".sdd-master", "tasks", `${task}.md`);
  const reasons: string[] = [];

  if (!existsSync(phaseTasks)) {
    reasons.push(".sdd-master/tasks/phase-01-tasks.md ausente");
  }

  if (!existsSync(taskFile)) {
    reasons.push(`.sdd-master/tasks/${task}.md ausente`);
  }

  if (reasons.length > 0) {
    return {
      ok: false,
      reasons,
      evidence: "Arquivos de tarefas ausentes."
    };
  }

  const content = readFileSync(taskFile, "utf8");
  const section = extractSection(content, "## Testes obrigatórios antes da implementação");

  if (!section) {
    return {
      ok: false,
      reasons: ["Seção de testes obrigatórios antes da implementação ausente"],
      evidence: `${task}.md sem seção obrigatória.`
    };
  }

  const items = section
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && line !== "-" && line !== "- [ ]" && line !== "- []");

  if (items.length === 0) {
    return {
      ok: false,
      reasons: ["Testes obrigatórios antes da implementação não definidos"],
      evidence: `${task}.md contém seção de testes vazia.`
    };
  }

  return {
    ok: true,
    reasons: [],
    evidence: `${items.length} item(ns) de teste obrigatório encontrados em ${task}.md.`
  };
}

function extractSection(content: string, heading: string): string | undefined {
  const start = content.indexOf(heading);

  if (start === -1) {
    return undefined;
  }

  const afterHeading = content.slice(start + heading.length);
  const nextHeading = afterHeading.search(/\n## /);
  return nextHeading === -1 ? afterHeading : afterHeading.slice(0, nextHeading);
}
