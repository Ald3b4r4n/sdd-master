import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const rootDir = process.cwd();
const requiredFiles = [
  "README.md",
  "CHANGELOG.md",
  ".github/ISSUE_TEMPLATE/bug_report.md",
  ".github/ISSUE_TEMPLATE/documentation_request.md",
  ".github/ISSUE_TEMPLATE/feature_request.md",
  ".github/ISSUE_TEMPLATE/security_notice.md",
  ".github/ISSUE_TEMPLATE/skill_request.md",
  ".github/pull_request_template.md",
  ".github/workflows/ci.yml",
  "docs/01-negocio-requisitos/visao-do-produto.md",
  "docs/01-negocio-requisitos/maturidade-sdd-master.md",
  "docs/01-negocio-requisitos/roadmap-0.3.0-alpha.md",
  "docs/02-tecnica-arquitetura/auditoria-seguranca-0.2.0.md",
  "docs/02-tecnica-arquitetura/arquitetura-do-framework.md",
  "docs/02-tecnica-arquitetura/compatibilidade-multi-ia.md",
  "docs/02-tecnica-arquitetura/seguranca-e-governanca.md",
  "docs/03-codigo/checklist-github-release.md",
  "docs/03-codigo/checklist-publicacao-npm.md",
  "docs/03-codigo/comandos-cli.md",
  "docs/03-codigo/desenvolvimento-local.md",
  "docs/03-codigo/governanca-sdd.md",
  "docs/03-codigo/implement-guard.md",
  "docs/03-codigo/inventario-comandos-0.2.0.md",
  "docs/03-codigo/publicacao-npm.md",
  "docs/03-codigo/quality-audit-blockers.md",
  "docs/03-codigo/release-local.md",
  "docs/03-codigo/release-deploy-guards.md",
  "docs/03-codigo/workflow-sdd.md",
  "releases/github-v0.1.0-prototype.md",
  "releases/github-v0.1.0-prototype-notes.md",
  "releases/github-v0.1.0-prototype.1.md",
  "releases/github-v0.1.0-prototype.1-notes.md",
  "releases/github-v0.2.0-prototype.md",
  "releases/github-v0.2.0-prototype-notes.md",
  "releases/v0.1.0-prototype-audit.md",
  "releases/v0.1.0-prototype.1.md",
  "releases/v0.1.0-prototype.md",
  "releases/v0.2.0-prototype.md",
  "releases/v0.2.0-prototype-final-audit.md",
  "assets/readme/sdd-master-hero.svg",
  "assets/readme/workflow-overview.svg",
  "assets/readme/multi-ai-support.svg",
  "assets/readme/safety-gates.svg",
  "LICENSE",
  "CONTRIBUTING.md",
  "SECURITY.md",
  "CODE_OF_CONDUCT.md",
  "src/index.ts",
  "src/cli/main.ts",
  "src/cli/args.ts",
  "src/cli/output.ts",
  "src/cli/command-registry.ts",
  "src/cli/commands/master-agents.ts",
  "src/cli/commands/master-doctor.ts",
  "src/cli/commands/master-git.ts",
  "src/cli/commands/master-init.ts",
  "src/cli/commands/root-help.ts",
  "src/cli/commands/master-help.ts",
  "src/cli/commands/master-version.ts",
  "src/cli/commands/master-status.ts",
  "src/cli/commands/planned-command.ts",
  "src/templates/official-templates.ts",
  "src/templates/template-writer.ts",
  "src/agents/agent-types.ts",
  "src/agents/agent-registry.ts",
  "src/agents/agent-instructions.ts",
  "src/agents/agent-writer.ts",
  "src/doctor/doctor-types.ts",
  "src/doctor/doctor-checks.ts",
  "src/doctor/doctor.ts",
  "src/doctor/doctor-report.ts",
  "src/security/sensitive-files.ts",
  "src/security/secret-patterns.ts",
  "src/security/secret-scan.ts",
  "src/git/git-types.ts",
  "src/git/git-checks.ts",
  "src/git/git-report.ts",
  "src/git/git.ts",
  "src/delivery/delivery-status.ts",
  "src/delivery/delivery-types.ts",
  "src/delivery/deploy-command.ts",
  "src/delivery/deploy-readiness.ts",
  "src/delivery/deploy-report.ts",
  "src/delivery/release-command.ts",
  "src/delivery/release-readiness.ts",
  "src/delivery/release-report.ts",
  "src/gates/audit.ts",
  "src/gates/blockers.ts",
  "src/gates/docs.ts",
  "src/gates/gate-report.ts",
  "src/gates/gate-runner.ts",
  "src/gates/gate-state.ts",
  "src/gates/gate-types.ts",
  "src/gates/quality.ts",
  "src/governance/approval.ts",
  "src/governance/backlog.ts",
  "src/governance/blockers.ts",
  "src/governance/clarify.ts",
  "src/governance/governance-report.ts",
  "src/governance/governance-runner.ts",
  "src/governance/governance-state.ts",
  "src/governance/governance-types.ts",
  "src/governance/scope.ts",
  "src/implementation/implement-command.ts",
  "src/implementation/implement-readiness.ts",
  "src/implementation/implement-report.ts",
  "src/implementation/implement-types.ts",
  "src/implementation/test-gates.ts",
  "src/workflow/workflow-types.ts",
  "src/workflow/workflow-state.ts",
  "src/workflow/workflow-files.ts",
  "src/workflow/workflow-guards.ts",
  "src/workflow/workflow-report.ts",
  "src/workflow/workflow-runner.ts",
  "src/workflow/commands/discovery.ts",
  "src/workflow/commands/requirements.ts",
  "src/workflow/commands/spec.ts",
  "src/workflow/commands/plan.ts",
  "src/workflow/commands/tasks.ts",
  "src/types/node-shims.d.ts",
  "scripts/lint.mjs",
  "scripts/format-check.mjs",
  "scripts/smoke-test.mjs",
  "scripts/package-check.mjs",
  "scripts/pack-dry-run.mjs",
  "scripts/release-check.mjs"
];

const forbiddenPatterns = [
  { pattern: /sk-[A-Za-z0-9_-]{20,}/, message: "Potential API key detected." },
  { pattern: /BEGIN (RSA |EC |OPENSSH |)PRIVATE KEY/, message: "Private key material detected." }
];

let failed = false;

for (const file of requiredFiles) {
  const path = join(rootDir, file);

  if (!existsSync(path)) {
    console.error(`Missing required file: ${file}`);
    failed = true;
    continue;
  }

  const content = readFileSync(path, "utf8");

  for (const rule of forbiddenPatterns) {
    if (rule.pattern.test(content)) {
      console.error(`${rule.message} File: ${file}`);
      failed = true;
    }
  }
}

if (failed) {
  process.exitCode = 1;
}
