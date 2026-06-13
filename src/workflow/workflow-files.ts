import { existsSync } from "node:fs";
import { resolveInsideProject } from "../filesystem/path-safety.js";
import { safeWriteFile } from "../filesystem/safe-write.js";
import type { WorkflowFileWrite } from "./workflow-types.js";

export function writeWorkflowFile(cwd: string, relativePath: string, content: string): WorkflowFileWrite {
  const path = resolveInsideProject(cwd, relativePath);

  if (existsSync(path)) {
    return { path: relativePath, status: "preserved" };
  }

  safeWriteFile(cwd, relativePath, ensureTrailingNewline(content));
  return { path: relativePath, status: "created" };
}

export function ensureTrailingNewline(content: string): string {
  return content.endsWith("\n") ? content : `${content}\n`;
}
