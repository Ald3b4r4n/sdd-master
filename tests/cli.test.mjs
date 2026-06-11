import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

const rootDir = process.cwd();
const cliPath = join(rootDir, "dist", "cli", "main.js");

function runCli(args) {
  return execFileSync(process.execPath, [cliPath, ...args], {
    cwd: rootDir,
    encoding: "utf8"
  });
}

describe("SDD Master package foundation", () => {
  it("responds to the root help command", () => {
    const output = runCli(["--help"]);

    assert.match(output, /SDD Master/);
    assert.match(output, /sdd master help/);
    assert.match(output, /sdd master init/);
  });

  it("responds to master help aliases", () => {
    assert.match(runCli(["master", "--help"]), /Comandos disponíveis/);
    assert.match(runCli(["master", "help"]), /Próximos comandos planejados/);
  });

  it("declares the sdd binary in package.json", () => {
    const packageJson = JSON.parse(readFileSync(join(rootDir, "package.json"), "utf8"));

    assert.equal(packageJson.bin?.sdd, "./dist/cli/main.js");
  });

  it("includes mandatory public project files", () => {
    const files = [
      "README.md",
      "CHANGELOG.md",
      "LICENSE",
      "CONTRIBUTING.md",
      "SECURITY.md",
      "CODE_OF_CONDUCT.md"
    ];

    for (const file of files) {
      assert.equal(existsSync(join(rootDir, file)), true, `${file} should exist`);
    }
  });

  it("includes the initial documentation axes", () => {
    const directories = [
      "docs/01-negocio-requisitos",
      "docs/02-tecnica-arquitetura",
      "docs/03-codigo"
    ];

    for (const directory of directories) {
      const absolutePath = join(rootDir, directory);
      assert.equal(existsSync(absolutePath), true, `${directory} should exist`);
      assert.equal(statSync(absolutePath).isDirectory(), true, `${directory} should be a directory`);
    }
  });
});
