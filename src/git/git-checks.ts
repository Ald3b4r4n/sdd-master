import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { findForbiddenFiles, requiredGitignoreEntries } from "../security/sensitive-files.js";
import { scanForSecrets } from "../security/secret-scan.js";
import { getAdvancedSecurityState } from "../security/security-readiness.js";
import type { EnvExampleInfo, GitInfo, GitMode, GitSecurityReport, GitignoreInfo } from "./git-types.js";

export function runGitSecurityCheck(cwd: string, mode: GitMode): GitSecurityReport {
  const git = getGitInfo(cwd);
  const forbiddenFiles = findForbiddenFiles(cwd);
  const suspectedSecrets = scanForSecrets(cwd);
  const gitignore = getGitignoreInfo(cwd);
  const envExample = getEnvExampleInfo(cwd);
  const advancedSecurity = getAdvancedSecurityState(cwd);
  const internalFilesStaged = git.stagedFiles.filter((file) => file.startsWith(".sdd-master/"));
  const internalFilesPending = [...git.stagedFiles, ...git.modifiedFiles, ...git.untrackedFiles].filter((file) =>
    file.startsWith(".sdd-master/")
  );
  const blockers: string[] = [];
  const warnings: string[] = [];

  if (!git.isRepository) warnings.push("Git não detectado.");
  if (git.isRepository && git.remotes.length === 0) warnings.push("Remoto não configurado.");
  if (git.untrackedFiles.length > 0) warnings.push("Arquivos untracked não perigosos podem existir.");
  if (gitignore.missingEntries.length > 0) warnings.push(".gitignore incompleto.");
  if (envExample.status === "suspect") blockers.push(".env.example contém valor suspeito.");

  if (forbiddenFiles.length > 0) blockers.push("Arquivo sensível/proibido detectado.");
  if (suspectedSecrets.length > 0) blockers.push("Possível segredo detectado.");
  if (mode === "pre-push" && internalFilesPending.length > 0) {
    blockers.push(".sdd-master/ pendente para push remoto.");
  }
  if (mode === "pre-push" && internalFilesStaged.length > 0) {
    blockers.push(".sdd-master/ staged para push remoto.");
  }
  if (mode === "pre-push" && advancedSecurity.status === "blocked") {
    blockers.push(...advancedSecurity.blockers);
  }

  return {
    status: blockers.length > 0 ? "blocked" : warnings.length > 0 ? "warning" : "clean",
    mode,
    git,
    security: { forbiddenFiles, suspectedSecrets, gitignore, envExample },
    sddMaster: { internalFilesStaged, internalFilesPending },
    blockers,
    warnings,
    recommendation:
      blockers.length > 0 ? "Remove secrets and forbidden files before commit/push." : "No critical blockers found."
  };
}

function getGitInfo(cwd: string): GitInfo {
  const isRepository = runGit(cwd, ["rev-parse", "--is-inside-work-tree"]) === "true";
  const statusLines = isRepository ? runGit(cwd, ["status", "--short"])?.split(/\r?\n/).filter(Boolean) ?? [] : [];

  return {
    isRepository,
    branch: isRepository ? runGit(cwd, ["branch", "--show-current"]) || undefined : undefined,
    remotes: isRepository ? runGit(cwd, ["remote"])?.split(/\r?\n/).filter(Boolean) ?? [] : [],
    stagedFiles: isRepository ? runGit(cwd, ["diff", "--cached", "--name-only"])?.split(/\r?\n/).filter(Boolean) ?? [] : [],
    modifiedFiles: statusLines.filter((line) => line[0] !== "?" && line.slice(0, 2) !== "??").map((line) => line.slice(3)),
    untrackedFiles: statusLines.filter((line) => line.startsWith("?? ")).map((line) => line.slice(3))
  };
}

function getGitignoreInfo(cwd: string): GitignoreInfo {
  const path = join(cwd, ".gitignore");

  if (!existsSync(path)) {
    return { exists: false, missingEntries: requiredGitignoreEntries };
  }

  const content = readFileSync(path, "utf8");
  return {
    exists: true,
    missingEntries: requiredGitignoreEntries.filter((entry) => !content.includes(entry))
  };
}

function getEnvExampleInfo(cwd: string): EnvExampleInfo {
  const path = join(cwd, ".env.example");

  if (!existsSync(path)) {
    return { exists: false, status: "not-found" };
  }

  return {
    exists: true,
    status: scanForSecrets(cwd).some((finding) => finding.file === ".env.example") ? "suspect" : "safe"
  };
}

function runGit(cwd: string, args: string[]): string | undefined {
  try {
    return execFileSync("git", args, {
      cwd,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"]
    }).trim();
  } catch {
    return undefined;
  }
}
