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
  "docs/02-tecnica-arquitetura/arquitetura-do-framework.md",
  "docs/02-tecnica-arquitetura/compatibilidade-multi-ia.md",
  "docs/02-tecnica-arquitetura/seguranca-e-governanca.md",
  "docs/03-codigo/comandos-cli.md",
  "docs/03-codigo/desenvolvimento-local.md",
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
  "src/types/node-shims.d.ts",
  "scripts/lint.mjs",
  "scripts/format-check.mjs",
  "scripts/smoke-test.mjs",
  "scripts/package-check.mjs",
  "scripts/pack-dry-run.mjs"
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
