import { appendFileSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { resolveInsideProject } from "./path-safety.js";

export function safeMkdir(projectRoot: string, relativePath: string): string {
  const target = resolveInsideProject(projectRoot, relativePath);
  mkdirSync(target, { recursive: true });
  return target;
}

export function safeWriteFile(projectRoot: string, relativePath: string, content: string): string {
  const target = resolveInsideProject(projectRoot, relativePath);
  const parent = resolveInsideProject(projectRoot, dirname(relativePath));
  mkdirSync(parent, { recursive: true });
  writeFileSync(target, content, "utf8");
  return target;
}

export function safeAppendFile(projectRoot: string, relativePath: string, content: string): string {
  const target = resolveInsideProject(projectRoot, relativePath);
  const parent = resolveInsideProject(projectRoot, dirname(relativePath));
  mkdirSync(parent, { recursive: true });
  appendFileSync(target, content, "utf8");
  return target;
}
