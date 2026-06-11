import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

const rootDir = process.cwd();
const cliPath = join(rootDir, "dist", "cli", "main.js");

function runCli(args) {
  return spawnSync(process.execPath, [cliPath, ...args], {
    cwd: rootDir,
    encoding: "utf8"
  });
}

describe("SDD Master package foundation", () => {
  it("responds to the root help command", () => {
    const result = runCli(["--help"]);

    assert.equal(result.status, 0);
    assert.match(result.stdout, /SDD Master/);
    assert.match(result.stdout, /sdd master help/);
    assert.match(result.stdout, /sdd master init/);
  });

  it("responds to the short root help flag", () => {
    const result = runCli(["-h"]);

    assert.equal(result.status, 0);
    assert.match(result.stdout, /Uso:/);
    assert.match(result.stdout, /sdd master <command>/);
  });

  it("prints the package version", () => {
    const packageJson = JSON.parse(readFileSync(join(rootDir, "package.json"), "utf8"));
    const result = runCli(["--version"]);
    const shortResult = runCli(["-v"]);
    const masterResult = runCli(["master", "version"]);

    assert.equal(result.status, 0);
    assert.equal(shortResult.status, 0);
    assert.equal(masterResult.status, 0);
    assert.equal(result.stdout.trim(), packageJson.version);
    assert.equal(shortResult.stdout.trim(), packageJson.version);
    assert.equal(masterResult.stdout.trim(), packageJson.version);
  });

  it("responds to master help", () => {
    const result = runCli(["master", "help"]);

    assert.equal(result.status, 0);
    assert.match(result.stdout, /SDD Master — Namespace master/);
    assert.match(result.stdout, /Comandos planejados/);
  });

  it("shows contextual help for init", () => {
    const result = runCli(["master", "help", "init"]);

    assert.equal(result.status, 0);
    assert.match(result.stdout, /sdd master init/);
    assert.match(result.stdout, /Planejado para BLOCO 03/);
    assert.match(result.stdout, /Não deve criar \.env real/);
  });

  it("shows contextual help for doctor", () => {
    const result = runCli(["master", "help", "doctor"]);

    assert.equal(result.status, 0);
    assert.match(result.stdout, /sdd master doctor/);
    assert.match(result.stdout, /Diagnosticar a instalação/);
    assert.match(result.stdout, /Não deve expor segredos/);
  });

  it("shows basic status without requiring .sdd-master", () => {
    const result = runCli(["master", "status"]);

    assert.equal(result.status, 0);
    assert.match(result.stdout, /SDD Master — Status/);
    assert.match(result.stdout, /Não detectada/);
    assert.match(result.stdout, /\.sdd-master\/ não existe/);
  });

  it("keeps init as a safe stub and does not create .sdd-master", () => {
    const sddMasterPath = join(rootDir, ".sdd-master");
    const result = runCli(["master", "init"]);

    assert.equal(result.status, 0);
    assert.match(result.stdout, /Comando planejado: sdd master init/);
    assert.match(result.stdout, /Nenhuma alteração foi feita/);
    assert.equal(existsSync(sddMasterPath), false);
  });

  it("keeps doctor as a safe stub and does not alter root files", () => {
    const before = readdirSync(rootDir).sort();
    const result = runCli(["master", "doctor"]);
    const after = readdirSync(rootDir).sort();

    assert.equal(result.status, 0);
    assert.match(result.stdout, /Comando planejado: sdd master doctor/);
    assert.deepEqual(after, before);
  });

  it("keeps update as a safe stub", () => {
    const result = runCli(["master", "update"]);

    assert.equal(result.status, 0);
    assert.match(result.stdout, /Comando planejado: sdd master update/);
    assert.match(result.stdout, /Nenhuma alteração foi feita/);
  });

  it("returns an error for unknown master commands", () => {
    const result = runCli(["master", "banana"]);

    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /Comando desconhecido: banana/);
    assert.match(result.stderr, /sdd master help/);
  });

  it("declares the sdd binary in package.json", () => {
    const packageJson = JSON.parse(readFileSync(join(rootDir, "package.json"), "utf8"));

    assert.equal(packageJson.bin?.sdd, "./dist/cli/main.js");
  });

  it("does not depend on untracked PDF files for CLI behavior", () => {
    const result = runCli(["master", "help", "status"]);

    assert.equal(result.status, 0);
    assert.match(result.stdout, /sdd master status/);
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
