import { readFileSync } from "node:fs";
import { join } from "node:path";

const rootDir = process.cwd();
const files = [
  "package.json",
  "tsconfig.json",
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
  "docs/03-codigo/publicacao-npm.md",
  "docs/03-codigo/release-local.md",
  "releases/v0.1.0-prototype.md",
  "assets/readme/sdd-master-hero.svg",
  "assets/readme/workflow-overview.svg",
  "assets/readme/multi-ai-support.svg",
  "assets/readme/safety-gates.svg",
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
  "tests/cli.test.mjs",
  "scripts/lint.mjs",
  "scripts/format-check.mjs",
  "scripts/smoke-test.mjs",
  "scripts/package-check.mjs",
  "scripts/pack-dry-run.mjs",
  "scripts/release-check.mjs"
];

let failed = false;

for (const file of files) {
  const content = readFileSync(join(rootDir, file), "utf8");

  if (content.includes("\t")) {
    console.error(`Tabs are not allowed: ${file}`);
    failed = true;
  }

  if (!content.endsWith("\n")) {
    console.error(`File must end with a newline: ${file}`);
    failed = true;
  }
}

if (failed) {
  process.exitCode = 1;
}
