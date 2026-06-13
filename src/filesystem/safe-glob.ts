import { isAbsolute } from "node:path";
import { isPathTraversal, normalizeProjectPath, UnsafePathError } from "./path-safety.js";

export function normalizeSafePattern(pattern: string): string {
  const normalized = normalizeProjectPath(pattern).replace(/\\/g, "/");
  if (
    isPathTraversal(pattern) ||
    isAbsolute(normalized) ||
    /^[A-Za-z]:[\\/]/.test(pattern) ||
    /^\\\\/.test(pattern) ||
    /^\/\//.test(pattern)
  ) {
    throw new UnsafePathError("PATH_TRAVERSAL");
  }
  return normalized.replace(/^\.\//, "");
}

export function normalizeSafePatterns(patterns: string[]): string[] {
  return Array.from(new Set(patterns.map(normalizeSafePattern)));
}
