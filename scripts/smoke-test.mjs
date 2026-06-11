import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";

const rootDir = process.cwd();
const cliPath = join(rootDir, "dist", "cli", "main.js");
const commands = [
  ["--help"],
  ["--version"],
  ["master", "help"],
  ["master", "status"],
  ["master", "doctor", "--json"],
  ["master", "git", "--json"]
];

const failures = [];

if (!existsSync(cliPath)) {
  failures.push("Missing dist/cli/main.js. Run npm run build first.");
} else {
  for (const args of commands) {
    const result = spawnSync(process.execPath, [cliPath, ...args], {
      cwd: rootDir,
      encoding: "utf8"
    });

    if (result.status !== 0) {
      failures.push(`Command failed: node dist/cli/main.js ${args.join(" ")}`);
      if (result.stderr.trim()) failures.push(`stderr: ${result.stderr.trim()}`);
      continue;
    }

    if (args.includes("--json")) {
      try {
        JSON.parse(result.stdout);
      } catch {
        failures.push(`Command did not return valid JSON: node dist/cli/main.js ${args.join(" ")}`);
      }
    }
  }
}

if (failures.length > 0) {
  console.error(`Smoke test failed:\n${failures.map((failure) => `- ${failure}`).join("\n")}`);
  process.exitCode = 1;
}
