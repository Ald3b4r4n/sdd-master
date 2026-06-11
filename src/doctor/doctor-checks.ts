import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { getRecognizedAgentFiles } from "../agents/agent-writer.js";
import { officialTemplates } from "../templates/official-templates.js";
import type {
  DoctorAgentInfo,
  DoctorCheck,
  DoctorGitInfo,
  DoctorProjectState,
  DoctorSecurityInfo,
  DoctorTemplateInfo
} from "./doctor-types.js";

const internalPaths = [
  ".sdd-master",
  ".sdd-master/constitution.md",
  ".sdd-master/project-state.md",
  ".sdd-master/templates",
  ".sdd-master/discovery",
  ".sdd-master/requirements",
  ".sdd-master/specs",
  ".sdd-master/plans",
  ".sdd-master/tasks",
  ".sdd-master/tests",
  ".sdd-master/audits",
  ".sdd-master/quality",
  ".sdd-master/reports",
  ".sdd-master/traceability",
  ".sdd-master/approvals",
  ".sdd-master/risks",
  ".sdd-master/pendings",
  ".sdd-master/blockers",
  ".sdd-master/backlog",
  ".sdd-master/scope",
  ".sdd-master/skills",
  ".sdd-master/releases",
  ".sdd-master/deliveries",
  ".sdd-master/db",
  ".sdd-master/privacy",
  ".sdd-master/rollback"
];

const publicDocs = [
  "docs/01-negocio-requisitos",
  "docs/02-tecnica-arquitetura",
  "docs/03-codigo"
];

const agentPaths = [".agents", ".agents/skills"];

const minimumTemplates = [
  "README.md",
  "requirements/functional-requirement-template.md",
  "requirements/non-functional-requirement-template.md",
  "architecture/adr-template.md",
  "workflow/task-template.md",
  "workflow/audit-template.md",
  "uiux/design-system-template.md",
  "security/secret-scan-template.md",
  "workflow/release-template.md"
];

const requiredGitignoreEntries = [
  ".env",
  ".env.*",
  "!.env.example",
  "node_modules/",
  "dist/",
  "coverage/",
  "secrets/",
  "private/",
  "credentials/",
  "*.pem",
  "*.key"
];

const ignoredScanDirectories = new Set(["node_modules", "dist", ".git"]);
const sensitiveFileNames = new Set([
  ".env",
  ".env.local",
  ".env.production",
  ".env.development",
  ".env.staging",
  ".env.test"
]);
const sensitiveDirectoryNames = new Set(["secrets", "private", "credentials"]);

export function checkInternalStructure(cwd: string): DoctorCheck {
  return checkRequiredPaths("internal-structure", "Estrutura interna .sdd-master", cwd, internalPaths);
}

export function checkPublicDocs(cwd: string): DoctorCheck {
  return checkRequiredPaths("public-docs", "Documentação pública", cwd, publicDocs);
}

export function checkAgents(cwd: string): { check: DoctorCheck; info: DoctorAgentInfo } {
  const base = checkRequiredPaths("agents", "Agents/skills", cwd, agentPaths, "warn");
  const files = getRecognizedAgentFiles(cwd);
  const hasProjectStateBlock = hasAgentsProjectStateBlock(cwd);
  const details = [...base.details];

  if (files.length === 0) {
    details.push("Nenhum arquivo de agente reconhecido.");
  }

  if (!hasProjectStateBlock) {
    details.push("Bloco de agentes ausente em .sdd-master/project-state.md.");
  }

  return {
    check: {
      id: "agents",
      label: "Agents/skills",
      status: details.length === 0 ? "pass" : "warn",
      details
    },
    info: {
      files,
      hasSkillsDirectory: existsSync(join(cwd, ".agents", "skills")),
      hasProjectStateBlock
    }
  };
}

export function checkTemplates(cwd: string): { check: DoctorCheck; info: DoctorTemplateInfo } {
  const templatesRoot = join(cwd, ".sdd-master", "templates");
  const missing = minimumTemplates.filter((path) => !existsSync(join(templatesRoot, path)));
  const count = existsSync(templatesRoot) ? countMarkdownFiles(templatesRoot) : 0;
  const details = [...missing.map((path) => `Ausente: .sdd-master/templates/${path}`)];

  if (count < 40) {
    details.push(`Templates encontrados abaixo do mínimo: ${count}/40`);
  }

  return {
    check: {
      id: "official-templates",
      label: "Templates oficiais",
      status: missing.length === 0 && count >= 40 ? "pass" : "fail",
      details
    },
    info: {
      count,
      hasMinimumTemplates: missing.length === 0 && count >= 40
    }
  };
}

export function checkGitignore(cwd: string): DoctorCheck {
  const path = join(cwd, ".gitignore");

  if (!existsSync(path)) {
    return {
      id: "gitignore",
      label: ".gitignore",
      status: "fail",
      details: ["Ausente: .gitignore"]
    };
  }

  const content = readFileSync(path, "utf8");
  const missing = requiredGitignoreEntries.filter((entry) => !content.includes(entry));

  return {
    id: "gitignore",
    label: ".gitignore",
    status: missing.length === 0 ? "pass" : "warn",
    details: missing.map((entry) => `Entrada ausente: ${entry}`)
  };
}

export function checkSensitiveFiles(cwd: string): {
  check: DoctorCheck;
  info: DoctorSecurityInfo;
} {
  const sensitiveFiles = findSensitiveFiles(cwd);
  const hasRealEnv = sensitiveFiles.some((file) => file === ".env" || file.startsWith(".env."));

  return {
    check: {
      id: "sensitive-files",
      label: "Arquivos sensíveis",
      status: sensitiveFiles.length === 0 ? "pass" : "fail",
      details: sensitiveFiles
    },
    info: {
      hasRealEnv,
      sensitiveFiles
    }
  };
}

export function getGitInfo(cwd: string): { check: DoctorCheck; info: DoctorGitInfo } {
  const isRepository = runGit(cwd, ["rev-parse", "--is-inside-work-tree"]) === "true";
  const branch = isRepository ? runGit(cwd, ["branch", "--show-current"]) : undefined;
  const remote = isRepository ? runGit(cwd, ["remote"]) : undefined;
  const hasRemote = Boolean(remote);
  const details: string[] = [];

  if (!isRepository) details.push("Git não detectado.");
  if (isRepository && !hasRemote) details.push("Remoto não configurado.");

  return {
    check: {
      id: "git-basic",
      label: "Git básico",
      status: isRepository && hasRemote ? "pass" : "warn",
      details
    },
    info: {
      isRepository,
      branch: branch || undefined,
      hasRemote
    }
  };
}

export function readProjectState(cwd: string): DoctorProjectState {
  const path = join(cwd, ".sdd-master", "project-state.md");

  if (!existsSync(path)) {
    return {};
  }

  const content = readFileSync(path, "utf8");

  return {
    projectName: extractValue(content, "Nome do projeto"),
    language: extractValue(content, "Idioma operacional"),
    agent: extractValue(content, "IA/agente principal"),
    currentPhase: extractValue(content, "Fase atual"),
    nextCommand: extractValue(content, "Próximo comando permitido"),
    maturity: extractValue(content, "Maturidade atual"),
    stage: extractValue(content, "Estágio atual")
  };
}

export function getOfficialTemplateCount(): number {
  return officialTemplates.length;
}

function hasAgentsProjectStateBlock(cwd: string): boolean {
  const path = join(cwd, ".sdd-master", "project-state.md");

  if (!existsSync(path)) {
    return false;
  }

  return readFileSync(path, "utf8").includes("## Agentes / IAs configuradas");
}

function checkRequiredPaths(
  id: string,
  label: string,
  cwd: string,
  paths: string[],
  missingStatus: "warn" | "fail" = "fail"
): DoctorCheck {
  const missing = paths.filter((path) => !existsSync(join(cwd, path)));

  return {
    id,
    label,
    status: missing.length === 0 ? "pass" : missingStatus,
    details: missing.map((path) => `Ausente: ${path}`)
  };
}

function countMarkdownFiles(directory: string): number {
  let count = 0;

  for (const name of readdirSync(directory)) {
    const path = join(directory, name);
    const stat = statSync(path);

    if (stat.isDirectory()) {
      count += countMarkdownFiles(path);
      continue;
    }

    if (name.endsWith(".md")) {
      count += 1;
    }
  }

  return count;
}

function findSensitiveFiles(cwd: string, relative = ""): string[] {
  const directory = join(cwd, relative);
  const found: string[] = [];

  if (!existsSync(directory)) {
    return found;
  }

  for (const name of readdirSync(directory)) {
    if (relative === "" && ignoredScanDirectories.has(name)) {
      continue;
    }

    const relativePath = relative ? `${relative}/${name}` : name;
    const fullPath = join(cwd, relativePath);
    const stat = statSync(fullPath);

    if (stat.isDirectory()) {
      if (sensitiveDirectoryNames.has(name)) {
        found.push(`${relativePath}/`);
        continue;
      }

      found.push(...findSensitiveFiles(cwd, relativePath));
      continue;
    }

    if (name === ".env.example") {
      continue;
    }

    if (sensitiveFileNames.has(name) || name.endsWith(".pem") || name.endsWith(".key")) {
      found.push(relativePath);
    }
  }

  return found;
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

function extractValue(content: string, label: string): string | undefined {
  const pattern = new RegExp(`^- ${escapeRegExp(label)}:\\s*(.+)$`, "m");
  return content.match(pattern)?.[1]?.trim();
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
