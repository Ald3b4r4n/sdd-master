import { spawnSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const rootDir = process.cwd();
const expectedVersion = "0.2.0-prototype";
const forbiddenPackPatterns = [
  /\.env$/,
  /\.env\.(local|production|development|staging|test|backup|old)$/,
  /^\.sdd-master\//,
  /^node_modules\//,
  /\.pdf$/i,
  /\.pem$/i,
  /\.key$/i,
  /^secrets\//,
  /^private\//,
  /^credentials\//
];
const requiredFiles = [
  "package.json",
  "README.md",
  "CHANGELOG.md",
  "LICENSE",
  "SECURITY.md",
  "CONTRIBUTING.md",
  "CODE_OF_CONDUCT.md",
  ".github/workflows/ci.yml",
  "assets/readme/sdd-master-hero.svg",
  "docs/01-negocio-requisitos/visao-do-produto.md",
  "docs/02-tecnica-arquitetura/arquitetura-do-framework.md",
  "docs/02-tecnica-arquitetura/compatibilidade-multi-ia.md",
  "docs/02-tecnica-arquitetura/seguranca-e-governanca.md",
  "docs/03-codigo/checklist-github-release.md",
  "docs/03-codigo/checklist-publicacao-npm.md",
  "docs/03-codigo/comandos-cli.md",
  "docs/03-codigo/desenvolvimento-local.md",
  "docs/03-codigo/release-local.md",
  "docs/03-codigo/publicacao-npm.md",
  "docs/03-codigo/workflow-sdd.md",
  "releases/github-v0.2.0-prototype.md",
  "releases/github-v0.2.0-prototype-notes.md",
  "releases/v0.2.0-prototype.md",
  "releases/github-v0.1.0-prototype.md",
  "releases/github-v0.1.0-prototype-notes.md",
  "releases/github-v0.1.0-prototype.1.md",
  "releases/github-v0.1.0-prototype.1-notes.md",
  "releases/v0.1.0-prototype-audit.md",
  "releases/v0.1.0-prototype.1.md",
  "releases/v0.1.0-prototype.md",
  "dist/cli/main.js"
];
const forbiddenStagedPatterns = [
  /^\.env$/,
  /^\.env\./,
  /^\.sdd-master\//,
  /^dist\//,
  /^node_modules\//,
  /\.pdf$/i,
  /\.pem$/i,
  /\.key$/i,
  /^secrets\//,
  /^private\//,
  /^credentials\//
];
const failures = [];

function pathExists(relativePath) {
  return existsSync(join(rootDir, relativePath));
}

function readText(relativePath) {
  return readFileSync(join(rootDir, relativePath), "utf8");
}

function run(command, args) {
  const result = spawnSync(command, args, {
    cwd: rootDir,
    encoding: "utf8"
  });

  return {
    ok: !result.error && result.status === 0,
    output: `${result.stdout ?? ""}${result.stderr ?? ""}`.trim(),
    stdout: result.stdout ?? "",
    error: result.error
  };
}

function runNpm(args) {
  if (process.platform === "win32") {
    return run("cmd.exe", ["/d", "/s", "/c", `npm ${args.join(" ")}`]);
  }

  return run("npm", args);
}

function collectFiles(directory, base = directory) {
  if (!existsSync(directory)) return [];

  const files = [];

  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const fullPath = join(directory, entry.name);
    const relativePath = fullPath.slice(base.length + 1).replace(/\\/g, "/");

    if (entry.isDirectory()) {
      if ([".git", "node_modules", "dist"].includes(entry.name)) continue;
      files.push(...collectFiles(fullPath, base));
      continue;
    }

    files.push(relativePath);
  }

  return files;
}

function validatePackageJson() {
  if (!pathExists("package.json")) {
    failures.push("package.json must exist.");
    return;
  }

  const packageJson = JSON.parse(readText("package.json"));

  if (packageJson.version !== expectedVersion) {
    failures.push(`package.json version must be ${expectedVersion}. Found: ${packageJson.version ?? "missing"}.`);
  }

  if (packageJson.license !== "MIT") {
    failures.push("package.json license must be MIT.");
  }

  if (!["./dist/cli/main.js", "dist/cli/main.js"].includes(packageJson.bin?.sdd)) {
    failures.push("package.json bin.sdd must point to dist/cli/main.js.");
  }
}

function validateRequiredFiles() {
  for (const file of requiredFiles) {
    if (!pathExists(file)) failures.push(`Required release file is missing: ${file}`);
  }
}

function validateForbiddenLocalFiles() {
  if (pathExists(".env")) failures.push("Package root must not contain .env.");

  const sddMasterPath = join(rootDir, ".sdd-master");
  if (existsSync(sddMasterPath) && statSync(sddMasterPath).isDirectory()) {
    failures.push("Package root must not contain .sdd-master/.");
  }

  const envFiles = collectFiles(rootDir).filter((file) => {
    const name = file.split("/").at(-1);
    return name === ".env" || (name?.startsWith(".env.") && name !== ".env.example");
  });

  for (const file of envFiles) {
    failures.push(`Real environment file is not allowed: ${file}`);
  }
}

function validateGitStatus() {
  const result = run("git", ["status", "--short"]);
  if (!result.ok) {
    failures.push(`git status --short failed: ${result.output || result.error?.message}`);
    return;
  }

  for (const line of result.stdout.split(/\r?\n/).filter(Boolean)) {
    const status = line.slice(0, 2);
    const file = line.slice(3).replace(/^"|"$/g, "");
    const isStaged = status[0] !== " " && status[0] !== "?";

    if (isStaged && forbiddenStagedPatterns.some((pattern) => pattern.test(file))) {
      failures.push(`Forbidden staged file detected: ${file}`);
    }
  }
}

function validateWorkflow() {
  if (!pathExists(".github/workflows/ci.yml")) return;

  const workflow = readText(".github/workflows/ci.yml");
  if (/npm publish/i.test(workflow)) failures.push("CI workflow must not run npm publish.");
  if (/\bdeploy\b/i.test(workflow)) failures.push("CI workflow must not contain deploy steps.");
  if (/secrets\./i.test(workflow)) failures.push("CI workflow must not reference GitHub secrets.");
}

function validatePackOutput(stdout) {
  const packs = JSON.parse(stdout);
  const files = packs.flatMap((pack) => pack.files.map((file) => file.path));

  for (const file of files) {
    if (forbiddenPackPatterns.some((pattern) => pattern.test(file))) {
      failures.push(`Forbidden file listed by npm pack --dry-run: ${file}`);
    }
  }
}

function runReleaseScripts() {
  for (const script of ["smoke", "package:check", "pack:dry-run"]) {
    const result = runNpm(["run", script]);
    if (!result.ok) failures.push(`npm run ${script} failed: ${result.output}`);
  }

  const pack = runNpm(["pack", "--dry-run", "--json"]);
  if (!pack.ok) {
    failures.push(`npm pack --dry-run failed: ${pack.output}`);
    return;
  }

  try {
    validatePackOutput(pack.stdout);
  } catch {
    failures.push("Could not parse npm pack --dry-run JSON output.");
  }
}

validatePackageJson();
validateRequiredFiles();
validateForbiddenLocalFiles();
validateGitStatus();
validateWorkflow();

if (failures.length === 0) {
  runReleaseScripts();
}

if (failures.length > 0) {
  console.error(`Release check failed:\n${failures.map((failure) => `- ${failure}`).join("\n")}`);
  process.exitCode = 1;
} else {
  console.log(`Release check passed for ${expectedVersion}.`);
}
