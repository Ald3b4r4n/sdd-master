import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const rootDir = process.cwd();
const packageJson = JSON.parse(readFileSync(join(rootDir, "package.json"), "utf8"));
const requiredFiles = [
  "README.md",
  "LICENSE",
  "CHANGELOG.md",
  "SECURITY.md",
  "CONTRIBUTING.md",
  "CODE_OF_CONDUCT.md",
  "assets/readme/sdd-master-hero.svg",
  "assets/readme/workflow-overview.svg",
  "assets/readme/multi-ai-support.svg",
  "assets/readme/safety-gates.svg",
  "docs/01-negocio-requisitos/visao-do-produto.md",
  "docs/02-tecnica-arquitetura/arquitetura-do-framework.md",
  "docs/02-tecnica-arquitetura/compatibilidade-multi-ia.md",
  "docs/02-tecnica-arquitetura/seguranca-e-governanca.md",
  "docs/03-codigo/checklist-github-release.md",
  "docs/03-codigo/checklist-publicacao-npm.md",
  "docs/03-codigo/comandos-cli.md",
  "docs/03-codigo/desenvolvimento-local.md",
  "docs/03-codigo/governanca-sdd.md",
  "docs/03-codigo/publicacao-npm.md",
  "docs/03-codigo/quality-audit-blockers.md",
  "docs/03-codigo/release-local.md",
  "docs/03-codigo/workflow-sdd.md"
];
const forbiddenFilesEntries = [".env", ".env.*", ".sdd-master/", "node_modules/", "*.pdf"];
const failures = [];

if (!packageJson.name) failures.push("package.json must have name.");
if (!packageJson.version) failures.push("package.json must have version.");
if (packageJson.license !== "MIT") failures.push("package.json license must be MIT.");
if (packageJson.publishConfig?.access !== "public") {
  failures.push("package.json publishConfig.access must be public.");
}
if (packageJson.publishConfig?.tag !== "prototype") {
  failures.push("package.json publishConfig.tag must be prototype.");
}
if (!["./dist/cli/main.js", "dist/cli/main.js"].includes(packageJson.bin?.sdd)) {
  failures.push("package.json bin.sdd must point to dist/cli/main.js.");
}
if (!existsSync(join(rootDir, "dist", "cli", "main.js"))) {
  failures.push("Missing dist/cli/main.js. Run npm run build first.");
}

for (const file of requiredFiles) {
  if (!existsSync(join(rootDir, file))) failures.push(`Missing required package file: ${file}`);
}

const packageFiles = packageJson.files ?? [];
for (const entry of ["dist/", "README.md", "LICENSE", "CHANGELOG.md", "docs/", "assets/"]) {
  if (!packageFiles.includes(entry)) failures.push(`package.json files must include ${entry}`);
}
for (const forbidden of forbiddenFilesEntries) {
  if (packageFiles.includes(forbidden)) failures.push(`package.json files must not include ${forbidden}`);
}

if (existsSync(join(rootDir, ".env"))) failures.push("Package root must not contain .env.");
if (existsSync(join(rootDir, ".sdd-master"))) failures.push("Package root must not contain .sdd-master/.");
if (existsSync(join(rootDir, "node_modules")) && packageFiles.includes("node_modules/")) {
  failures.push("Package files must not include node_modules/.");
}

if (failures.length > 0) {
  console.error(`Package check failed:\n${failures.map((failure) => `- ${failure}`).join("\n")}`);
  process.exitCode = 1;
}
