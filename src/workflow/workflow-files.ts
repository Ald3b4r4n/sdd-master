import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import type { WorkflowFileWrite } from "./workflow-types.js";

export function writeWorkflowFile(cwd: string, relativePath: string, content: string): WorkflowFileWrite {
  const path = join(cwd, relativePath);
  mkdirSync(dirname(path), { recursive: true });

  if (existsSync(path)) {
    return { path: relativePath, status: "preserved" };
  }

  writeFileSync(path, ensureTrailingNewline(content), "utf8");
  return { path: relativePath, status: "created" };
}

export function ensureTrailingNewline(content: string): string {
  return content.endsWith("\n") ? content : `${content}\n`;
}
