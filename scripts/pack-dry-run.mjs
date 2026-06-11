import { spawnSync } from "node:child_process";

const forbiddenPatterns = [
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

const command = process.platform === "win32" ? "cmd.exe" : "npm";
const args =
  process.platform === "win32"
    ? ["/d", "/s", "/c", "npm pack --dry-run --json"]
    : ["pack", "--dry-run", "--json"];
const result = spawnSync(command, args, {
  cwd: process.cwd(),
  encoding: "utf8"
});

if (result.error || result.status !== 0) {
  console.error(`npm pack dry-run failed:\n${result.error?.message ?? result.stderr ?? result.stdout}`);
  process.exitCode = 1;
} else {
  const failures = [];

  try {
    const packs = JSON.parse(result.stdout);
    const files = packs.flatMap((pack) => pack.files.map((file) => file.path));

    for (const file of files) {
      if (forbiddenPatterns.some((pattern) => pattern.test(file))) {
        failures.push(`Forbidden file listed by npm pack --dry-run: ${file}`);
      }
    }

    if (!files.some((file) => file.startsWith("dist/"))) {
      failures.push("npm pack --dry-run did not include dist/.");
    }

    if (!files.includes("README.md")) {
      failures.push("npm pack --dry-run did not include README.md.");
    }
  } catch {
    failures.push("Could not parse npm pack --dry-run JSON output.");
  }

  if (failures.length > 0) {
    console.error(`Pack dry-run check failed:\n${failures.map((failure) => `- ${failure}`).join("\n")}`);
    process.exitCode = 1;
  }
}
