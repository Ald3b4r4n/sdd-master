import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  existsSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it } from "node:test";

const rootDir = process.cwd();
const cliPath = join(rootDir, "dist", "cli", "main.js");

function runCli(args, cwd = rootDir) {
  return spawnSync(process.execPath, [cliPath, ...args], {
    cwd,
    encoding: "utf8"
  });
}

function withTempProject(callback) {
  const directory = mkdtempSync(join(tmpdir(), "sdd-master-test-"));

  try {
    callback(directory);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}

function collectMarkdownFiles(directory, base = directory) {
  const files = [];

  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const fullPath = join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...collectMarkdownFiles(fullPath, base));
      continue;
    }

    if (entry.name.endsWith(".md")) {
      files.push(fullPath.slice(base.length + 1).replace(/\\/g, "/"));
    }
  }

  return files;
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
    assert.match(result.stdout, /Disponível no BLOCO 03/);
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

  it("initializes SDD Master structure in a temporary project", () => {
    withTempProject((projectDir) => {
      const result = runCli(
        [
          "master",
          "init",
          "--yes",
          "--language=pt-BR",
          "--agent=codex",
          "--project-name=Projeto Teste"
        ],
        projectDir
      );

      assert.equal(result.status, 0);
      assert.match(result.stdout, /SDD Master inicializado com sucesso/);
      assert.match(result.stdout, /Projeto Teste/);
      assert.match(result.stdout, /Templates oficiais:\s+Criados: \d+\s+Já existentes: 0/);

      const requiredDirectories = [
        ".sdd-master/discovery",
        ".sdd-master/requirements",
        ".sdd-master/specs",
        ".sdd-master/plans",
        ".sdd-master/tasks",
        ".sdd-master/tests",
        ".sdd-master/audits",
        ".sdd-master/quality",
        ".sdd-master/reports",
        ".sdd-master/traceability",
        ".sdd-master/approvals",
        ".sdd-master/risks",
        ".sdd-master/pendings",
        ".sdd-master/blockers",
        ".sdd-master/backlog",
        ".sdd-master/scope",
        ".sdd-master/skills",
        ".sdd-master/releases",
        ".sdd-master/deliveries",
        ".sdd-master/db",
        ".sdd-master/privacy",
        ".sdd-master/rollback",
        "docs/01-negocio-requisitos",
        "docs/02-tecnica-arquitetura",
        "docs/03-codigo",
        ".agents/skills"
      ];
      const templateCategories = [
        "requirements",
        "product",
        "architecture",
        "code",
        "workflow",
        "governance",
        "security",
        "uiux",
        "operations",
        "agents"
      ];

      assert.equal(existsSync(join(projectDir, ".sdd-master")), true);
      assert.equal(existsSync(join(projectDir, ".sdd-master", "constitution.md")), true);
      assert.equal(existsSync(join(projectDir, ".sdd-master", "project-state.md")), true);
      assert.equal(existsSync(join(projectDir, ".sdd-master", "templates", "README.md")), true);

      for (const directory of requiredDirectories) {
        assert.equal(existsSync(join(projectDir, directory)), true, `${directory} should exist`);
        assert.equal(statSync(join(projectDir, directory)).isDirectory(), true);
      }

      for (const category of templateCategories) {
        assert.equal(
          existsSync(join(projectDir, ".sdd-master", "templates", category)),
          true,
          `${category} template category should exist`
        );
      }

      const projectState = readFileSync(join(projectDir, ".sdd-master", "project-state.md"), "utf8");
      assert.match(projectState, /Nome do projeto: Projeto Teste/);
      assert.match(projectState, /Idioma operacional: pt-BR/);
      assert.match(projectState, /IA\/agente principal: codex/);

      const templatesReadme = readFileSync(
        join(projectDir, ".sdd-master", "templates", "README.md"),
        "utf8"
      );
      assert.match(templatesReadme, /biblioteca local de templates oficiais/);
      assert.match(templatesReadme, /Templates não são documentação aprovada/);

      const templateRoot = join(projectDir, ".sdd-master", "templates");
      const markdownTemplates = collectMarkdownFiles(templateRoot);
      assert.equal(markdownTemplates.length >= 40, true);

      const requiredTemplates = [
        "requirements/functional-requirement-template.md",
        "architecture/adr-template.md",
        "workflow/task-template.md",
        "workflow/audit-template.md",
        "uiux/design-system-template.md",
        "security/secret-scan-template.md",
        "workflow/release-template.md"
      ];

      for (const template of requiredTemplates) {
        assert.equal(markdownTemplates.includes(template), true, `${template} should exist`);
        const content = readFileSync(join(templateRoot, template), "utf8");
        assert.equal(content.trim().length > 0, true, `${template} should not be empty`);
        assert.match(content, /## Metadados/);
        assert.match(content, /## Rastreabilidade/);
        assert.match(content, /## Histórico de alterações/);
      }

      assert.match(
        readFileSync(join(templateRoot, "requirements", "functional-requirement-template.md"), "utf8"),
        /## Critérios de aceite/
      );
      assert.match(
        readFileSync(join(templateRoot, "architecture", "adr-template.md"), "utf8"),
        /## Alternativas consideradas/
      );
      assert.match(
        readFileSync(join(templateRoot, "workflow", "task-template.md"), "utf8"),
        /## Testes obrigatórios/
      );
      assert.match(
        readFileSync(join(templateRoot, "workflow", "audit-template.md"), "utf8"),
        /## Relação com requisito\/tarefa\/documento\/teste\/commit/
      );
      assert.match(
        readFileSync(join(templateRoot, "uiux", "design-system-template.md"), "utf8"),
        /## Microcopy/
      );
      assert.match(
        readFileSync(join(templateRoot, "security", "secret-scan-template.md"), "utf8"),
        /## Achados sem expor valores sensíveis/
      );
      assert.match(
        readFileSync(join(templateRoot, "workflow", "release-template.md"), "utf8"),
        /## Aprovação humana/
      );

      const gitignore = readFileSync(join(projectDir, ".gitignore"), "utf8");
      assert.match(gitignore, /node_modules\//);
      assert.match(gitignore, /\.env\.\*/);
      assert.match(gitignore, /must never be pushed to product remotes/);

      const readme = readFileSync(join(projectDir, "README.md"), "utf8");
      assert.match(readme, /# Projeto Teste/);
      assert.match(readme, /Projeto inicializado com SDD Master/);
      assert.equal(existsSync(join(projectDir, ".env")), false);
    });
  });

  it("does not duplicate README governance section when README already exists", () => {
    withTempProject((projectDir) => {
      writeFileSync(
        join(projectDir, "README.md"),
        "# Existing Project\n\n## Governança SDD Master\n\nTexto existente.\n",
        "utf8"
      );

      const result = runCli(
        ["master", "init", "-y", "--language=pt-BR", "--agent=codex", "--project-name=Projeto Teste"],
        projectDir
      );

      assert.equal(result.status, 0);
      const readme = readFileSync(join(projectDir, "README.md"), "utf8");
      const matches = readme.match(/## Governança SDD Master/g) ?? [];
      assert.equal(matches.length, 1);
      assert.match(readme, /Texto existente/);
    });
  });

  it("does not overwrite an existing initialization", () => {
    withTempProject((projectDir) => {
      const first = runCli(
        ["master", "init", "-y", "--language=pt-BR", "--agent=codex", "--project-name=Projeto Teste"],
        projectDir
      );
      const statePath = join(projectDir, ".sdd-master", "project-state.md");
      writeFileSync(statePath, "estado preservado\n", "utf8");
      const templatePath = join(
        projectDir,
        ".sdd-master",
        "templates",
        "requirements",
        "functional-requirement-template.md"
      );
      writeFileSync(templatePath, "template preservado\n", "utf8");

      const second = runCli(
        ["master", "init", "-y", "--language=en", "--agent=claude", "--project-name=Other"],
        projectDir
      );

      assert.equal(first.status, 0);
      assert.equal(second.status, 0);
      assert.match(second.stdout, /Projeto já parece inicializado/);
      assert.match(second.stdout, /Templates oficiais:/);
      assert.equal(readFileSync(statePath, "utf8"), "estado preservado\n");
      assert.equal(readFileSync(templatePath, "utf8"), "template preservado\n");
    });
  });

  it("rejects invalid language and invalid agent", () => {
    withTempProject((projectDir) => {
      const invalidLanguage = runCli(
        ["master", "init", "-y", "--language=fr", "--agent=codex", "--project-name=Projeto Teste"],
        projectDir
      );
      const invalidAgent = runCli(
        ["master", "init", "-y", "--language=pt-BR", "--agent=unknown", "--project-name=Projeto Teste"],
        projectDir
      );

      assert.notEqual(invalidLanguage.status, 0);
      assert.match(invalidLanguage.stderr, /Idioma inválido: fr/);
      assert.notEqual(invalidAgent.status, 0);
      assert.match(invalidAgent.stderr, /Agente inválido: unknown/);
    });
  });

  it("detects initialized projects in status output", () => {
    withTempProject((projectDir) => {
      const init = runCli(
        ["master", "init", "-y", "--language=pt-BR", "--agent=codex", "--project-name=Projeto Teste"],
        projectDir
      );
      const status = runCli(["master", "status"], projectDir);

      assert.equal(init.status, 0);
      assert.equal(status.status, 0);
      assert.match(status.stdout, /Instalação SDD Master:\s+Detectada/);
      assert.match(status.stdout, /\.sdd-master\/constitution.md: OK/);
      assert.match(status.stdout, /docs\/03-codigo\/: OK/);
      assert.match(status.stdout, /\.sdd-master\/templates\/: OK/);
      assert.match(status.stdout, /\/sdd-master-discovery/);
    });
  });

  it("does not create package-root .sdd-master or .env during init tests", () => {
    assert.equal(existsSync(join(rootDir, ".sdd-master")), false);
    assert.equal(existsSync(join(rootDir, ".env")), false);
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
    const expectedPdfs = [
      "SDD Master — Checklist de Implementação v0.1.pdf",
      "SDD Master — Documento Mestre v0.1.pdf",
      "SDD Master Roadmap.pdf"
    ];
    const result = runCli(["master", "help", "status"]);

    assert.equal(result.status, 0);
    assert.match(result.stdout, /sdd master status/);

    for (const pdf of expectedPdfs) {
      assert.equal(existsSync(join(rootDir, pdf)), true, `${pdf} should remain in place`);
    }
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
