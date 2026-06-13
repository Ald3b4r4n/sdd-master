import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { getPlatform } from "./platform.js";
import { isDangerousSymlink, isPathTraversal } from "./path-safety.js";

export type PathSafetyState = {
  platform: string;
  projectRoot: "[REDACTED]";
  unsafePaths: number;
  dangerousSymlinks: number;
  status: "clean" | "warning" | "blocked";
  details: string[];
};

export function getPathSafetyState(cwd: string): PathSafetyState {
  const critical = [".sdd-master", ".agents"];
  const dangerous = critical.filter((path) => existsSync(join(cwd, path)) && isDangerousSymlink(cwd, path));
  const unsafeReports = scanManagedMarkdown(cwd).filter((content) =>
    content.split(/\r?\n/).some((line) => /^(Caminho|Path|Arquivo|Backup|Report).*:\s*/i.test(line) && isPathTraversal(line))
  );
  const details = [
    ...dangerous.map((path) => `Symlink perigoso: ${path}`),
    ...unsafeReports.map(() => "Path traversal detectado em artefato gerenciado.")
  ];
  return {
    platform: getPlatform(),
    projectRoot: "[REDACTED]",
    unsafePaths: unsafeReports.length,
    dangerousSymlinks: dangerous.length,
    status: dangerous.length > 0 || unsafeReports.length > 0 ? "blocked" : "clean",
    details
  };
}

function scanManagedMarkdown(cwd: string): string[] {
  const root = join(resolve(cwd), ".sdd-master");
  if (!existsSync(root) || isDangerousSymlink(cwd, ".sdd-master")) return [];
  return collect(root);
}

function collect(directory: string): string[] {
  const contents: string[] = [];
  for (const name of readdirSync(directory)) {
    const path = join(directory, name);
    if (existsSync(path) && name.endsWith(".md")) {
      contents.push(readFileSync(path, "utf8"));
      continue;
    }
    try {
      contents.push(...collect(path));
    } catch {
      // Non-directory and inaccessible entries are ignored by this diagnostic scan.
    }
  }
  return contents;
}
