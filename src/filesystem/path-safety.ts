import { existsSync, lstatSync, realpathSync } from "node:fs";
import { dirname, isAbsolute, relative, resolve, sep } from "node:path";
import { isCaseInsensitivePlatform } from "./platform.js";

export type PathSafetyCode =
  | "PATH_OUTSIDE_PROJECT"
  | "PATH_TRAVERSAL"
  | "ABSOLUTE_PATH_OUTSIDE_PROJECT"
  | "DANGEROUS_SYMLINK";

export class UnsafePathError extends Error {
  readonly status = "blocked";
  readonly reason = "unsafe-path";

  constructor(readonly code: PathSafetyCode) {
    super("SDD Master bloqueou uma operação de arquivo insegura. Use apenas caminhos dentro do projeto.");
    this.name = "UnsafePathError";
  }

  toJSON(): Record<string, string> {
    return {
      status: this.status,
      reason: this.reason,
      code: this.code,
      requestedPath: "[REDACTED]",
      projectRoot: "[REDACTED]",
      message: "Path outside project root blocked."
    };
  }
}

export function normalizeProjectPath(requestedPath: string): string {
  return requestedPath.replace(/[\\/]+/g, sep);
}

export function isPathTraversal(requestedPath: string): boolean {
  const normalized = requestedPath.replace(/\\/g, "/");
  return normalized.split("/").some((part) => part === "..");
}

export function resolveInsideProject(projectRoot: string, requestedPath: string): string {
  const root = resolve(projectRoot);
  const normalized = normalizeProjectPath(requestedPath);
  const foreignAbsolute = isForeignAbsolutePath(requestedPath);
  if (foreignAbsolute && !isAbsolute(normalized)) {
    throw new UnsafePathError("ABSOLUTE_PATH_OUTSIDE_PROJECT");
  }

  const target = isAbsolute(normalized) ? resolve(normalized) : resolve(root, normalized);
  const code = isAbsolute(normalized) || foreignAbsolute
    ? "ABSOLUTE_PATH_OUTSIDE_PROJECT"
    : isPathTraversal(requestedPath)
      ? "PATH_TRAVERSAL"
      : "PATH_OUTSIDE_PROJECT";
  assertInsideProject(root, target, code);
  assertSafeSymlinkPath(root, target);
  return target;
}

export function assertInsideProject(
  projectRoot: string,
  targetPath: string,
  code: PathSafetyCode = "PATH_OUTSIDE_PROJECT"
): void {
  const root = comparable(resolve(projectRoot));
  const target = comparable(resolve(targetPath));
  const relation = relative(root, target);
  if (relation === "") return;
  if (relation === ".." || relation.startsWith(`..${sep}`) || isAbsolute(relation)) {
    throw new UnsafePathError(code);
  }
}

export function safeJoin(projectRoot: string, ...parts: string[]): string {
  return resolveInsideProject(projectRoot, parts.join(sep));
}

export function safeRelative(projectRoot: string, targetPath: string): string {
  assertInsideProject(projectRoot, targetPath);
  return relative(resolve(projectRoot), resolve(targetPath)).replace(/\\/g, "/");
}

export function isDangerousSymlink(projectRoot: string, requestedPath: string): boolean {
  try {
    const target = resolveInsideProjectWithoutSymlinkCheck(projectRoot, requestedPath);
    const rootReal = realpathSync(resolve(projectRoot));
    let current = target;
    while (!existsSync(current)) {
      const parent = dirname(current);
      if (parent === current) break;
      current = parent;
    }
    if (!existsSync(current)) return false;
    const real = realpathSync(current);
    assertInsideProject(rootReal, real, "DANGEROUS_SYMLINK");
    return false;
  } catch (error) {
    return error instanceof UnsafePathError && error.code === "DANGEROUS_SYMLINK";
  }
}

export function formatUnsafePathError(error: UnsafePathError, json: boolean): string {
  if (json) return `${JSON.stringify(error.toJSON(), null, 2)}\n`;
  return `SDD Master bloqueou uma operação de arquivo insegura.

Motivo:
  Caminho fora do projeto consumidor.

Caminho solicitado:
  [REDACTED]

Ação:
  Use apenas caminhos relativos dentro do projeto.

Próxima ação:
  Revise o caminho informado e execute o comando novamente.
`;
}

function assertSafeSymlinkPath(projectRoot: string, targetPath: string): void {
  const rootReal = realpathSync(resolve(projectRoot));
  let current = targetPath;
  while (!existsSync(current)) {
    const parent = dirname(current);
    if (parent === current) break;
    current = parent;
  }
  if (!existsSync(current)) return;
  const real = realpathSync(current);
  assertInsideProject(rootReal, real, "DANGEROUS_SYMLINK");

  if (existsSync(targetPath) && lstatSync(targetPath).isSymbolicLink()) {
    assertInsideProject(rootReal, realpathSync(targetPath), "DANGEROUS_SYMLINK");
  }
}

function resolveInsideProjectWithoutSymlinkCheck(projectRoot: string, requestedPath: string): string {
  const root = resolve(projectRoot);
  const normalized = normalizeProjectPath(requestedPath);
  if (isForeignAbsolutePath(requestedPath) && !isAbsolute(normalized)) {
    throw new UnsafePathError("ABSOLUTE_PATH_OUTSIDE_PROJECT");
  }
  const target = isAbsolute(normalized) ? resolve(normalized) : resolve(root, normalized);
  assertInsideProject(root, target);
  return target;
}

function isForeignAbsolutePath(value: string): boolean {
  return /^[A-Za-z]:[\\/]/.test(value) || /^\\\\[^\\]+\\[^\\]+/.test(value) || /^\/\/[^/]+\/[^/]+/.test(value);
}

function comparable(value: string): string {
  return isCaseInsensitivePlatform() ? value.toLowerCase() : value;
}
