import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const rootDir = process.cwd();
const requiredFiles = [
  "README.md",
  "CHANGELOG.md",
  "LICENSE",
  "CONTRIBUTING.md",
  "SECURITY.md",
  "CODE_OF_CONDUCT.md",
  "src/index.ts",
  "src/cli/main.ts"
];

const forbiddenPatterns = [
  { pattern: /sk-[A-Za-z0-9_-]+/, message: "Potential API key detected." },
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
