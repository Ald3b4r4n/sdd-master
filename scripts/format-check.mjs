import { readFileSync } from "node:fs";
import { join } from "node:path";

const rootDir = process.cwd();
const files = [
  "package.json",
  "tsconfig.json",
  "README.md",
  "CHANGELOG.md",
  "CONTRIBUTING.md",
  "SECURITY.md",
  "CODE_OF_CONDUCT.md",
  "src/index.ts",
  "src/cli/main.ts",
  "src/cli/args.ts",
  "src/cli/output.ts",
  "src/cli/command-registry.ts",
  "src/cli/commands/master-init.ts",
  "src/cli/commands/root-help.ts",
  "src/cli/commands/master-help.ts",
  "src/cli/commands/master-version.ts",
  "src/cli/commands/master-status.ts",
  "src/cli/commands/planned-command.ts",
  "src/types/node-shims.d.ts",
  "tests/cli.test.mjs",
  "scripts/lint.mjs",
  "scripts/format-check.mjs"
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
