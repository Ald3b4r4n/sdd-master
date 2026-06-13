import { existsSync, readFileSync } from "node:fs";
import { resolveInsideProject } from "./path-safety.js";

export function safeExists(projectRoot: string, relativePath: string): boolean {
  return existsSync(resolveInsideProject(projectRoot, relativePath));
}

export function safeReadFile(projectRoot: string, relativePath: string): string {
  return readFileSync(resolveInsideProject(projectRoot, relativePath), "utf8");
}
