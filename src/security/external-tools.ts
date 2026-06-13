import { execFileSync } from "node:child_process";
import { resolveInsideProject } from "../filesystem/path-safety.js";
import { redactSensitiveText } from "./redaction.js";
import type { ExternalToolName, ExternalToolStatus } from "./security-types.js";

export function detectExternalTool(name: ExternalToolName): ExternalToolStatus {
  try {
    const version = execFileSync(name, ["--version"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"]
    }).trim();
    return {
      name,
      available: true,
      version: summarizeVersion(version),
      executed: false,
      result: "not-requested",
      findings: 0
    };
  } catch {
    return missingTool(name);
  }
}

export function runExternalTool(name: ExternalToolName, cwd: string): ExternalToolStatus {
  const detected = detectExternalTool(name);
  if (!detected.available) return detected;

  try {
    const safeCwd = resolveInsideProject(cwd, ".");
    const args = getLocalScanArgs(name, safeCwd);
    const output = execFileSync(name, args, {
      cwd: safeCwd,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"]
    });
    const findings = approximateFindingCount(output);
    return { ...detected, executed: true, result: findings > 0 ? "blocked" : "clean", findings };
  } catch (error) {
    const output = getCapturedOutput(error);
    const findings = approximateFindingCount(output);
    return {
      ...detected,
      executed: true,
      result: findings > 0 ? "blocked" : "error",
      findings
    };
  }
}

export function notRequestedTool(name: ExternalToolName): ExternalToolStatus {
  return {
    name,
    available: false,
    version: "not-checked",
    executed: false,
    result: "not-requested",
    findings: 0
  };
}

function getLocalScanArgs(name: ExternalToolName, cwd: string): string[] {
  if (name === "gitleaks") {
    const help = execFileSync(name, ["detect", "--help"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"]
    });
    if (!help.includes("--source") || !help.includes("--redact")) {
      throw new Error("Versão do gitleaks sem modo local/redigido compatível.");
    }
    return ["detect", "--source", cwd, "--no-banner", "--redact", "--report-format", "json", "--report-path", "-"];
  }
  const help = execFileSync(name, ["--help"], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"]
  });
  if (!/\bfilesystem\b/i.test(help)) {
    throw new Error("Versão do trufflehog sem modo filesystem compatível.");
  }
  return ["filesystem", cwd, "--json", "--no-update"];
}

function approximateFindingCount(output: string): number {
  if (!output.trim()) return 0;
  const lines = output.split(/\r?\n/).filter((line) => line.trim());
  return Math.max(1, lines.length);
}

function getCapturedOutput(error: unknown): string {
  if (!error || typeof error !== "object") return "";
  const candidate = error as { stdout?: string | { toString(): string }; stderr?: string | { toString(): string } };
  return `${stringify(candidate.stdout)}\n${stringify(candidate.stderr)}`.trim();
}

function stringify(value: string | { toString(): string } | undefined): string {
  if (!value) return "";
  return typeof value === "string" ? value : value.toString();
}

function summarizeVersion(value: string): string {
  const firstLine = value.split(/\r?\n/).find((line) => line.trim())?.trim() ?? "available";
  return redactSensitiveText(firstLine.slice(0, 120));
}

function missingTool(name: ExternalToolName): ExternalToolStatus {
  return {
    name,
    available: false,
    version: "missing",
    executed: false,
    result: "missing",
    findings: 0
  };
}
