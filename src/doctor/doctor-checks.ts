import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { getRecognizedAgentFiles } from "../agents/agent-writer.js";
import { getGateStatus } from "../gates/gate-state.js";
import { getImplementReadiness } from "../governance/blockers.js";
import { getGovernanceStatus } from "../governance/governance-state.js";
import { getAssistedImplementStatus, getImplementGuardStatus } from "../implementation/implement-readiness.js";
import { getDeliveryStatus } from "../delivery/delivery-status.js";
import { getPluginStatus } from "../plugins/plugin-registry.js";
import { getSkillStatus } from "../skills/skill-registry.js";
import { officialTemplates } from "../templates/official-templates.js";
import { getUiuxStatus } from "../uiux/uiux-gates.js";
import { getUpdateStatus } from "../update/update-state.js";
import type {
  DoctorAgentInfo,
  DoctorCheck,
  DoctorGateInfo,
  DoctorGitInfo,
  DoctorGovernanceInfo,
  DoctorAssistedImplementInfo,
  DoctorImplementGuardInfo,
  DoctorImplementReadinessInfo,
  DoctorDeliveryInfo,
  DoctorPluginInfo,
  DoctorSkillInfo,
  DoctorProjectState,
  DoctorSecurityInfo,
  DoctorTemplateInfo,
  DoctorUiuxInfo,
  DoctorUpdateInfo
} from "./doctor-types.js";
import { getWorkflowStatus } from "../workflow/workflow-runner.js";

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
  ".sdd-master/plugins",
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

const agentPaths = [".agents", ".agents/skills", ".agents/plugins"];

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

export function checkWorkflow(cwd: string): {
  check: DoctorCheck;
  info: ReturnType<typeof getWorkflowStatus>;
} {
  const workflow = getWorkflowStatus(cwd);
  const details = [
    workflow.discovery ? "" : "Discovery não iniciado.",
    workflow.requirements ? "" : "Requirements não iniciado.",
    workflow.spec ? "" : "Spec não iniciada.",
    workflow.plan ? "" : "Plan não iniciado.",
    workflow.tasks ? "" : "Tasks não iniciadas."
  ].filter(Boolean);

  return {
    check: {
      id: "workflow-initial",
      label: "Workflow inicial",
      status: details.length === 0 ? "pass" : "warn",
      details
    },
    info: workflow
  };
}

export function checkGovernance(cwd: string): {
  check: DoctorCheck;
  info: DoctorGovernanceInfo;
} {
  const governance = getGovernanceStatus(cwd);
  const details = [
    governance.clarifications.total === 0 ? "Clarifications não iniciadas." : "",
    governance.approvals.total === 0 ? "Approvals não iniciadas." : "",
    governance.scope.approvedItems === 0 && governance.scope.outOfScopeItems === 0 && governance.scope.openChanges === 0
      ? "Scope não iniciado."
      : "",
    governance.backlog.total === 0 ? "Backlog não iniciado." : ""
  ].filter(Boolean);

  return {
    check: {
      id: "governance",
      label: "Governança SDD",
      status: details.length === 0 ? "pass" : "warn",
      details
    },
    info: governance
  };
}

export function checkImplementReadiness(cwd: string): {
  check: DoctorCheck;
  info: DoctorImplementReadinessInfo;
} {
  const readiness = getImplementReadiness(cwd);

  return {
    check: {
      id: "implement-readiness",
      label: "Prontidão para implementação",
      status: readiness.ready ? "pass" : "warn",
      details: readiness.blockers
    },
    info: readiness
  };
}

export function checkGates(cwd: string): {
  check: DoctorCheck;
  info: DoctorGateInfo;
} {
  const gates = getGateStatus(cwd);
  const details = [
    gates.quality.total === 0 ? "Quality não iniciada." : "",
    gates.audit.total === 0 ? "Audit não iniciada." : "",
    gates.docs.total === 0 ? "Docs gate não iniciado." : "",
    gates.blockers.total === 0 ? "Blockers não iniciados." : "",
    gates.quality.failedOpen > 0 ? "Quality failed aberta." : "",
    gates.audit.blockerOpen > 0 ? "Auditoria BLOCKER aberta." : "",
    gates.audit.highCriticalOpen > 0 ? "Auditoria HIGH/CRITICAL aberta." : "",
    gates.docs.pending > 0 ? "Pendência documental aberta." : "",
    gates.blockers.open > 0 ? "Blocker aberto." : ""
  ].filter(Boolean);

  const hasCriticalBlock = gates.blockers.open > 0 || gates.audit.blockerOpen > 0;

  return {
    check: {
      id: "gates",
      label: "Quality/Audit/Docs/Blockers",
      status: hasCriticalBlock ? "fail" : details.length === 0 ? "pass" : "warn",
      details
    },
    info: gates
  };
}

export function checkImplementGuard(cwd: string): {
  check: DoctorCheck;
  info: DoctorImplementGuardInfo;
} {
  const guard = getImplementGuardStatus(cwd);
  const details = [
    guard.hasRecords ? "" : "Implement guard não iniciado.",
    guard.testGates === "Pendente" ? "Test gates pendentes." : "",
    guard.codeChanged ? "Código alterado pelo implement." : ""
  ].filter(Boolean);

  return {
    check: {
      id: "implement-guard",
      label: "Implement Guard",
      status: guard.codeChanged ? "fail" : details.length === 0 ? "pass" : "warn",
      details
    },
    info: guard
  };
}

export function checkAssistedImplement(cwd: string): {
  check: DoctorCheck;
  info: DoctorAssistedImplementInfo;
} {
  const info = getAssistedImplementStatus(cwd);
  const details = [
    info.status === "not-started" ? "Implement assistido não iniciado." : "",
    info.handoff === "missing" ? "Handoff ausente." : "",
    info.testContract === "missing" ? "Test contract ausente." : "",
    info.manifest === "missing" ? "Manifest ausente." : "",
    info.forbiddenPolicy === "missing" ? "Política de arquivos proibidos ausente." : "",
    info.codeChanged ? "Código alterado pelo implement assistido." : ""
  ].filter(Boolean);

  return {
    check: {
      id: "assisted-implement",
      label: "Implement assistido",
      status: info.codeChanged ? "fail" : info.status === "not-started" ? "warn" : details.length === 0 ? "pass" : "warn",
      details
    },
    info
  };
}

export function checkSkills(cwd: string): {
  check: DoctorCheck;
  info: DoctorSkillInfo;
} {
  const info = getSkillStatus(cwd);
  const details = [
    info.candidates === 0 && info.approved === 0 && info.installedLocal === 0 && info.used === 0
      ? "Skills não iniciadas."
      : "",
    info.used > 0 && info.usageReports === 0 ? "Skills usadas sem relatório." : ""
  ].filter(Boolean);

  return {
    check: {
      id: "skills",
      label: "Skills locais",
      status: info.used > 0 && info.usageReports === 0 ? "fail" : details.length === 0 ? "pass" : "warn",
      details
    },
    info
  };
}

export function checkPlugins(cwd: string): {
  check: DoctorCheck;
  info: DoctorPluginInfo;
} {
  const info = getPluginStatus(cwd);
  const details = [
    info.candidates === 0 && info.approved === 0 && info.installedLocal === 0 && info.used === 0
      ? "Plugins não iniciados."
      : "",
    info.used > 0 && info.usageReports === 0 ? "Plugins usados sem relatório." : ""
  ].filter(Boolean);

  return {
    check: {
      id: "plugins",
      label: "Plugins locais",
      status: info.used > 0 && info.usageReports === 0 ? "fail" : details.length === 0 ? "pass" : "warn",
      details
    },
    info
  };
}

export function checkUiux(cwd: string): {
  check: DoctorCheck;
  info: DoctorUiuxInfo;
} {
  const info = getUiuxStatus(cwd);
  const details = info.applicable
    ? info.blockers.length > 0
      ? info.blockers
      : []
    : ["UI/UX visual not-applicable para este perfil."];

  return {
    check: {
      id: "uiux",
      label: "UI/UX e design gates",
      status: info.applicable && info.blockers.length > 0 ? "warn" : "pass",
      details
    },
    info
  };
}

export function checkUpdate(cwd: string): {
  check: DoctorCheck;
  info: DoctorUpdateInfo;
} {
  const info = getUpdateStatus(cwd);
  const details = [
    info.missingMetadata ? "Metadados de versão ausentes. Recomenda-se: sdd master update --dry-run" : "",
    info.conflicts > 0 ? `Conflitos de update registrados: ${info.conflicts}` : "",
    info.latestBackup === "não detectado" ? "Nenhum backup de update detectado." : "",
    info.lastUpdate === "não detectado" ? "Último update não registrado." : ""
  ].filter(Boolean);

  return {
    check: {
      id: "update",
      label: "Update seguro",
      status: info.missingMetadata || info.conflicts > 0 ? "warn" : "pass",
      details
    },
    info
  };
}

export function checkDelivery(cwd: string): {
  check: DoctorCheck;
  info: DoctorDeliveryInfo;
} {
  const info = getDeliveryStatus(cwd);
  const details = [
    info.release.status === "not-started" ? "Release guard não iniciado." : "",
    info.release.status === "blocked" ? `Release guard bloqueado: ${info.release.blockers} bloqueio(s).` : "",
    info.deploy.status === "not-started" ? "Deploy guard não iniciado." : "",
    info.deploy.status === "blocked" ? `Deploy guard bloqueado: ${info.deploy.blockers} bloqueio(s).` : "",
    info.deploy.environment === "production" && info.deploy.status !== "ready"
      ? "Plano de production deploy sem aprovação final."
      : ""
  ].filter(Boolean);

  const hasBrokenProduction = info.deploy.environment === "production" && info.deploy.status === "blocked";

  return {
    check: {
      id: "release-deploy",
      label: "Release/Deploy guards",
      status: hasBrokenProduction ? "fail" : details.length === 0 ? "pass" : "warn",
      details
    },
    info
  };
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
