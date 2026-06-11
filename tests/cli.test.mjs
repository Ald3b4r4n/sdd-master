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

function runGit(args, cwd) {
  return spawnSync("git", args, { cwd, encoding: "utf8" });
}

function withTempProject(callback) {
  const directory = mkdtempSync(join(tmpdir(), "sdd-master-test-"));

  try {
    callback(directory);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}

function initTempProject(projectDir) {
  return runCli(
    ["master", "init", "-y", "--language=pt-BR", "--agent=codex", "--project-name=Projeto Teste"],
    projectDir
  );
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
    assert.match(result.stdout, /Disponível no BLOCO 05/);
    assert.match(result.stdout, /sdd master doctor --json/);
    assert.match(result.stdout, /Não deve expor segredos/);
  });

  it("shows contextual help for agents and command help", () => {
    const contextual = runCli(["master", "help", "agents"]);
    const direct = runCli(["master", "agents", "--help"]);

    assert.equal(contextual.status, 0);
    assert.equal(direct.status, 0);
    assert.match(contextual.stdout, /Disponível no BLOCO 06/);
    assert.match(contextual.stdout, /--agents/);
    assert.match(contextual.stdout, /--force/);
    assert.match(direct.stdout, /Agentes suportados/);
    assert.match(direct.stdout, /codex/);
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
      assert.equal(existsSync(join(projectDir, "AGENTS.md")), true);

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
      assert.match(projectState, /## Agentes \/ IAs configuradas/);
      assert.match(projectState, /IA principal: codex/);
      assert.match(projectState, /AGENTS\.md/);

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
      const agentsMd = readFileSync(join(projectDir, "AGENTS.md"), "utf8");
      assert.match(agentsMd, /Não enviar `.env` real/);
      assert.match(agentsMd, /Não fazer push sem autorização humana/);
      assert.match(agentsMd, /\.sdd-master\/constitution.md/);
      assert.match(agentsMd, /\.sdd-master\/project-state.md/);
      assert.equal(existsSync(join(projectDir, ".env")), false);
    });
  });

  it("init creates the selected primary agent file", () => {
    withTempProject((projectDir) => {
      const claude = runCli(
        ["master", "init", "-y", "--language=pt-BR", "--agent=claude", "--project-name=Claude Project"],
        projectDir
      );

      assert.equal(claude.status, 0);
      assert.equal(existsSync(join(projectDir, "CLAUDE.md")), true);
    });

    withTempProject((projectDir) => {
      const cursor = runCli(
        ["master", "init", "-y", "--language=pt-BR", "--agent=cursor", "--project-name=Cursor Project"],
        projectDir
      );

      assert.equal(cursor.status, 0);
      assert.equal(existsSync(join(projectDir, ".cursor", "rules", "sdd-master.mdc")), true);
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
      const init = initTempProject(projectDir);
      const status = runCli(["master", "status"], projectDir);

      assert.equal(init.status, 0);
      assert.equal(status.status, 0);
      assert.match(status.stdout, /Instalação SDD Master:\s+Detectada/);
      assert.match(status.stdout, /\.sdd-master\/constitution.md: OK/);
      assert.match(status.stdout, /docs\/03-codigo\/: OK/);
      assert.match(status.stdout, /\.sdd-master\/templates\/: OK/);
      assert.match(status.stdout, /AGENTS\.md: OK/);
      assert.match(status.stdout, /\.agents\/skills\/: OK/);
      assert.match(status.stdout, /\/sdd-master-discovery/);
    });
  });

  it("agents command requires initialized project", () => {
    withTempProject((projectDir) => {
      const result = runCli(
        ["master", "agents", "--yes", "--agents=codex", "--language=pt-BR"],
        projectDir
      );

      assert.notEqual(result.status, 0);
      assert.match(result.stderr, /SDD Master não inicializado/);
      assert.match(result.stderr, /sdd master init/);
    });
  });

  it("agents command creates codex, claude and cursor files", () => {
    withTempProject((projectDir) => {
      initTempProject(projectDir);
      const result = runCli(
        ["master", "agents", "--yes", "--agents=codex,claude,cursor", "--language=pt-BR"],
        projectDir
      );

      assert.equal(result.status, 0);
      assert.equal(existsSync(join(projectDir, "AGENTS.md")), true);
      assert.equal(existsSync(join(projectDir, "CLAUDE.md")), true);
      assert.equal(existsSync(join(projectDir, ".cursor", "rules", "sdd-master.mdc")), true);
      assert.match(readFileSync(join(projectDir, "CLAUDE.md"), "utf8"), /Não enviar `.env` real/);
      assert.match(readFileSync(join(projectDir, "CLAUDE.md"), "utf8"), /Não fazer push sem autorização humana/);
      assert.match(readFileSync(join(projectDir, "CLAUDE.md"), "utf8"), /\.sdd-master\/constitution.md/);
      assert.match(readFileSync(join(projectDir, "CLAUDE.md"), "utf8"), /\.sdd-master\/project-state.md/);
    });
  });

  it("agents command creates gemini and copilot files in English", () => {
    withTempProject((projectDir) => {
      initTempProject(projectDir);
      const result = runCli(
        ["master", "agents", "--yes", "--agents=gemini,copilot", "--language=en"],
        projectDir
      );

      assert.equal(result.status, 0);
      assert.equal(existsSync(join(projectDir, "GEMINI.md")), true);
      assert.equal(existsSync(join(projectDir, ".github", "copilot-instructions.md")), true);
      assert.match(readFileSync(join(projectDir, "GEMINI.md"), "utf8"), /Do not commit real `.env` files/);
    });
  });

  it("agents command creates windsurf, cline and roo files", () => {
    withTempProject((projectDir) => {
      initTempProject(projectDir);
      const result = runCli(
        ["master", "agents", "--yes", "--agents=windsurf,cline,roo", "--language=pt-BR"],
        projectDir
      );

      assert.equal(result.status, 0);
      assert.equal(existsSync(join(projectDir, ".windsurf", "rules", "sdd-master.md")), true);
      assert.equal(existsSync(join(projectDir, ".cline", "rules", "sdd-master.md")), true);
      assert.equal(existsSync(join(projectDir, ".roo", "rules", "sdd-master.md")), true);
    });
  });

  it("agents command creates aider and continue files", () => {
    withTempProject((projectDir) => {
      initTempProject(projectDir);
      const result = runCli(
        ["master", "agents", "--yes", "--agents=aider,continue", "--language=pt-BR"],
        projectDir
      );

      assert.equal(result.status, 0);
      assert.equal(existsSync(join(projectDir, ".aider.conf.yml")), true);
      assert.equal(existsSync(join(projectDir, ".continue", "sdd-master.md")), true);
    });
  });

  it("agents command preserves existing files unless force is used", () => {
    withTempProject((projectDir) => {
      initTempProject(projectDir);
      const agentsPath = join(projectDir, "AGENTS.md");
      writeFileSync(agentsPath, "manual content\n", "utf8");

      const preserved = runCli(
        ["master", "agents", "--yes", "--agents=codex", "--language=pt-BR"],
        projectDir
      );
      assert.equal(preserved.status, 0);
      assert.equal(readFileSync(agentsPath, "utf8"), "manual content\n");
      assert.match(preserved.stdout, /Arquivos preservados:\s+- AGENTS\.md/);

      const forced = runCli(
        ["master", "agents", "--yes", "--agents=codex", "--language=pt-BR", "--force"],
        projectDir
      );
      assert.equal(forced.status, 0);
      assert.notEqual(readFileSync(agentsPath, "utf8"), "manual content\n");
      assert.match(forced.stdout, /Arquivos sobrescritos:\s+- AGENTS\.md/);
    });
  });

  it("agents command updates project-state and doctor JSON", () => {
    withTempProject((projectDir) => {
      initTempProject(projectDir);
      const agents = runCli(
        ["master", "agents", "--yes", "--agents=codex,claude,cursor", "--language=pt-BR"],
        projectDir
      );
      const state = readFileSync(join(projectDir, ".sdd-master", "project-state.md"), "utf8");
      const doctor = JSON.parse(runCli(["master", "doctor", "--json"], projectDir).stdout);

      assert.equal(agents.status, 0);
      assert.match(state, /IA principal: codex/);
      assert.match(state, /IAs adicionais: claude, cursor/);
      assert.match(state, /CLAUDE\.md/);
      assert.equal(doctor.checks.some((check) => check.id === "agents"), true);
      assert.equal(doctor.agents.files.includes("AGENTS.md"), true);
      assert.equal(doctor.agents.files.includes("CLAUDE.md"), true);
      assert.equal(doctor.agents.files.includes(".cursor/rules/sdd-master.mdc"), true);
      assert.equal(doctor.agents.hasProjectStateBlock, true);
    });
  });

  it("agents command rejects invalid language and invalid agent", () => {
    withTempProject((projectDir) => {
      initTempProject(projectDir);
      const invalidLanguage = runCli(
        ["master", "agents", "--yes", "--agents=codex", "--language=fr"],
        projectDir
      );
      const invalidAgent = runCli(
        ["master", "agents", "--yes", "--agents=banana", "--language=pt-BR"],
        projectDir
      );

      assert.notEqual(invalidLanguage.status, 0);
      assert.match(invalidLanguage.stderr, /Idioma inválido: fr/);
      assert.notEqual(invalidAgent.status, 0);
      assert.match(invalidAgent.stderr, /Agente inválido: banana/);
    });
  });

  it("agents command does not create .env", () => {
    withTempProject((projectDir) => {
      initTempProject(projectDir);
      const result = runCli(
        ["master", "agents", "--yes", "--agents=codex", "--language=pt-BR"],
        projectDir
      );

      assert.equal(result.status, 0);
      assert.equal(existsSync(join(projectDir, ".env")), false);
    });
  });

  it("reports broken doctor status when project is not initialized", () => {
    withTempProject((projectDir) => {
      const result = runCli(["master", "doctor"], projectDir);

      assert.equal(result.status, 0);
      assert.match(result.stdout, /SDD Master — Doctor/);
      assert.match(result.stdout, /Status geral:\s+broken/);
      assert.match(result.stdout, /Estrutura \.sdd-master\/ não encontrada/);
      assert.match(result.stdout, /sdd master init/);
    });
  });

  it("reports healthy or warning doctor status after init", () => {
    withTempProject((projectDir) => {
      const init = initTempProject(projectDir);
      const result = runCli(["master", "doctor"], projectDir);

      assert.equal(init.status, 0);
      assert.equal(result.status, 0);
      assert.match(result.stdout, /SDD Master — Doctor/);
      assert.match(result.stdout, /Status geral:\s+(healthy|warning)/);
      assert.match(result.stdout, /\.sdd-master\/: OK/);
      assert.match(result.stdout, /constitution.md: OK/);
      assert.match(result.stdout, /project-state.md: OK/);
      assert.match(result.stdout, /docs\/01-negocio-requisitos\/: OK/);
      assert.match(result.stdout, /docs\/02-tecnica-arquitetura\/: OK/);
      assert.match(result.stdout, /docs\/03-codigo\/: OK/);
      assert.match(result.stdout, /\.sdd-master\/templates\/: OK/);
      assert.match(result.stdout, /Templates encontrados: \d+/);
      assert.match(result.stdout, /Templates mínimos: OK/);
      assert.match(result.stdout, /\.gitignore: OK/);
      assert.match(result.stdout, /Próximo passo recomendado:\s+\/sdd-master-discovery/);
    });
  });

  it("prints valid doctor JSON with checks and project state", () => {
    withTempProject((projectDir) => {
      const init = initTempProject(projectDir);
      const result = runCli(["master", "doctor", "--json"], projectDir);
      const report = JSON.parse(result.stdout);

      assert.equal(init.status, 0);
      assert.equal(result.status, 0);
      assert.match(report.status, /^(healthy|warning)$/);
      assert.equal(Array.isArray(report.checks), true);
      assert.equal(report.checks.some((check) => check.id === "internal-structure"), true);
      assert.equal(report.projectState.projectName, "Projeto Teste");
      assert.equal(report.projectState.language, "pt-BR");
      assert.equal(report.projectState.agent, "codex");
      assert.equal(report.projectState.currentPhase, "PHASE-01 — Discovery");
      assert.equal(report.projectState.nextCommand, "/sdd-master-discovery");
      assert.equal(report.projectState.maturity, "M0 — Ideia");
      assert.equal(report.projectState.stage, "Prototype");
      assert.equal(report.recommendation, "/sdd-master-discovery");
    });
  });

  it("doctor JSON detects structure, docs, templates, agents and gitignore", () => {
    withTempProject((projectDir) => {
      initTempProject(projectDir);
      const result = runCli(["master", "doctor", "--json"], projectDir);
      const report = JSON.parse(result.stdout);
      const byId = Object.fromEntries(report.checks.map((check) => [check.id, check]));

      assert.equal(byId["internal-structure"].status, "pass");
      assert.equal(byId["public-docs"].status, "pass");
      assert.equal(byId.agents.status, "pass");
      assert.equal(byId["official-templates"].status, "pass");
      assert.equal(byId.gitignore.status, "pass");
      assert.equal(report.templates.count >= 40, true);
      assert.equal(report.templates.hasMinimumTemplates, true);
    });
  });

  it("doctor marks real .env as critical failure but accepts .env.example", () => {
    withTempProject((projectDir) => {
      initTempProject(projectDir);
      writeFileSync(join(projectDir, ".env.example"), "EXAMPLE_API_KEY=replace-me\n", "utf8");
      const safe = JSON.parse(runCli(["master", "doctor", "--json"], projectDir).stdout);

      assert.equal(safe.security.hasRealEnv, false);
      assert.equal(safe.security.sensitiveFiles.includes(".env.example"), false);

      writeFileSync(join(projectDir, ".env"), "PLACEHOLDER=local-only\n", "utf8");
      const result = runCli(["master", "doctor"], projectDir);
      const unsafe = JSON.parse(runCli(["master", "doctor", "--json"], projectDir).stdout);

      assert.equal(result.status, 0);
      assert.match(result.stdout, /Falha crítica/);
      assert.match(result.stdout, /Arquivo de ambiente real detectado/);
      assert.match(result.stdout, /\.env/);
      assert.equal(unsafe.status, "broken");
      assert.equal(unsafe.security.hasRealEnv, true);
      assert.equal(unsafe.security.sensitiveFiles.includes(".env"), true);
    });
  });

  it("doctor recommends init when not installed and does not create files", () => {
    withTempProject((projectDir) => {
      const before = readdirSync(projectDir).sort();
      const result = runCli(["master", "doctor", "--json"], projectDir);
      const after = readdirSync(projectDir).sort();
      const report = JSON.parse(result.stdout);

      assert.equal(result.status, 0);
      assert.equal(report.status, "broken");
      assert.equal(report.recommendation, "sdd master init");
      assert.deepEqual(after, before);
    });
  });

  it("git command prints a readable report in a git repository", () => {
    withTempProject((projectDir) => {
      runGit(["init"], projectDir);
      writeFileSync(join(projectDir, "README.md"), "# Test\n", "utf8");
      const result = runCli(["master", "git"], projectDir);

      assert.equal(result.status, 0);
      assert.match(result.stdout, /SDD Master — Git\/Security Check/);
      assert.match(result.stdout, /Git:/);
      assert.match(result.stdout, /Segurança:/);
      assert.equal(existsSync(join(projectDir, ".env")), false);
    });
  });

  it("git command prints valid JSON with git and security sections", () => {
    withTempProject((projectDir) => {
      runGit(["init"], projectDir);
      const result = runCli(["master", "git", "--json"], projectDir);
      const report = JSON.parse(result.stdout);

      assert.equal(result.status, 0);
      assert.equal(typeof report.status, "string");
      assert.equal(typeof report.git, "object");
      assert.equal(typeof report.security, "object");
      assert.equal(Array.isArray(report.git.stagedFiles), true);
      assert.equal(Array.isArray(report.security.forbiddenFiles), true);
    });
  });

  it("git command detects forbidden env and key files", () => {
    withTempProject((projectDir) => {
      writeFileSync(join(projectDir, ".env"), "PLACEHOLDER=local-only\n", "utf8");
      writeFileSync(join(projectDir, "certificate.pem"), "placeholder\n", "utf8");
      writeFileSync(join(projectDir, "private.key"), "placeholder\n", "utf8");
      const report = JSON.parse(runCli(["master", "git", "--json"], projectDir).stdout);

      assert.equal(report.status, "blocked");
      assert.equal(report.security.forbiddenFiles.includes(".env"), true);
      assert.equal(report.security.forbiddenFiles.includes("certificate.pem"), true);
      assert.equal(report.security.forbiddenFiles.includes("private.key"), true);
    });
  });

  it("git command accepts safe .env.example and blocks suspicious .env.example", () => {
    withTempProject((projectDir) => {
      writeFileSync(join(projectDir, ".env.example"), "API_KEY=your-api-key-here\nDATABASE_URL=placeholder\n", "utf8");
      const safe = JSON.parse(runCli(["master", "git", "--json"], projectDir).stdout);
      assert.notEqual(safe.security.envExample.status, "suspect");

      const liveKey = "sk_" + "live_" + "abc1234567890";
      writeFileSync(join(projectDir, ".env.example"), `STRIPE_SECRET_KEY=${liveKey}\n`, "utf8");
      const unsafe = JSON.parse(runCli(["master", "git", "--json"], projectDir).stdout);
      assert.equal(unsafe.status, "blocked");
      assert.equal(unsafe.security.envExample.status, "suspect");
    });
  });

  it("git command detects heuristic secret patterns without printing values", () => {
    withTempProject((projectDir) => {
      const projectKey = "sk-" + "proj-" + "abcdefghijklmnopqrstuvwxyz";
      const appKey = "APP_" + "KEY=base64:" + "abcdefghijklmnopqrstuvwxyz123456";
      const privateKey = "BEGIN " + "PRIVATE KEY";
      writeFileSync(join(projectDir, "config.txt"), `${projectKey}\n${appKey}\n${privateKey}\n`, "utf8");
      const result = runCli(["master", "git"], projectDir);
      const report = JSON.parse(runCli(["master", "git", "--json"], projectDir).stdout);

      assert.equal(report.status, "blocked");
      assert.equal(report.security.suspectedSecrets.length >= 3, true);
      assert.match(result.stdout, /Possível segredo detectado/);
      assert.match(result.stdout, /\[REDACTED\]/);
      assert.equal(result.stdout.includes(projectKey), false);
      assert.equal(result.stdout.includes(appKey), false);
    });
  });

  it("git command validates complete and incomplete gitignore", () => {
    withTempProject((projectDir) => {
      writeFileSync(
        join(projectDir, ".gitignore"),
        ".env\n.env.*\n!.env.example\nnode_modules/\ndist/\ncoverage/\nsecrets/\nprivate/\ncredentials/\n*.pem\n*.key\n",
        "utf8"
      );
      const complete = JSON.parse(runCli(["master", "git", "--json"], projectDir).stdout);
      assert.equal(complete.security.gitignore.missingEntries.length, 0);

      writeFileSync(join(projectDir, ".gitignore"), "node_modules/\n", "utf8");
      const incomplete = JSON.parse(runCli(["master", "git", "--json"], projectDir).stdout);
      assert.equal(incomplete.status === "warning" || incomplete.status === "blocked", true);
      assert.equal(incomplete.security.gitignore.missingEntries.length > 0, true);
    });
  });

  it("git pre-commit blocks suspected secrets", () => {
    withTempProject((projectDir) => {
      const suspiciousValue = "sk-" + "proj-" + "abcdefghijklmnopqrstuvwxyz";
      writeFileSync(join(projectDir, "config.txt"), suspiciousValue, "utf8");
      const report = JSON.parse(runCli(["master", "git", "--pre-commit", "--json"], projectDir).stdout);

      assert.equal(report.mode, "pre-commit");
      assert.equal(report.status, "blocked");
    });
  });

  it("git pre-push blocks staged or pending .sdd-master files", () => {
    withTempProject((projectDir) => {
      runGit(["init"], projectDir);
      initTempProject(projectDir);
      runGit(["add", ".sdd-master/constitution.md"], projectDir);
      const report = JSON.parse(runCli(["master", "git", "--pre-push", "--json"], projectDir).stdout);
      const text = runCli(["master", "git", "--pre-push"], projectDir);

      assert.equal(report.mode, "pre-push");
      assert.equal(report.status, "blocked");
      assert.equal(report.sddMaster.internalFilesStaged.includes(".sdd-master/constitution.md"), true);
      assert.match(text.stdout, /Este comando não executa push/);
      assert.match(text.stdout, /Push exige autorização humana explícita/);
    });
  });

  it("git help works", () => {
    const contextual = runCli(["master", "help", "git"]);
    const direct = runCli(["master", "git", "--help"]);

    assert.equal(contextual.status, 0);
    assert.equal(direct.status, 0);
    assert.match(contextual.stdout, /Disponível no BLOCO 07/);
    assert.match(direct.stdout, /--pre-commit/);
    assert.match(direct.stdout, /não executa commit/i);
  });

  it("doctor JSON and status include git security summary", () => {
    withTempProject((projectDir) => {
      initTempProject(projectDir);
      const doctor = JSON.parse(runCli(["master", "doctor", "--json"], projectDir).stdout);
      const status = runCli(["master", "status"], projectDir);

      assert.equal(typeof doctor.gitSecurity, "object");
      assert.equal(typeof doctor.gitSecurity.status, "string");
      assert.match(status.stdout, /Git\/Security:/);
      assert.match(status.stdout, /Segredos suspeitos:/);
    });
  });

  it("git command does not alter project files", () => {
    withTempProject((projectDir) => {
      writeFileSync(join(projectDir, "README.md"), "# Stable\n", "utf8");
      const before = readdirSync(projectDir).sort();
      const result = runCli(["master", "git"], projectDir);
      const after = readdirSync(projectDir).sort();

      assert.equal(result.status, 0);
      assert.deepEqual(after, before);
      assert.equal(readFileSync(join(projectDir, "README.md"), "utf8"), "# Stable\n");
    });
  });

  it("does not create package-root .sdd-master or .env during init tests", () => {
    assert.equal(existsSync(join(rootDir, ".sdd-master")), false);
    assert.equal(existsSync(join(rootDir, ".env")), false);
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
    const doctor = runCli(["master", "doctor"]);

    assert.equal(result.status, 0);
    assert.equal(doctor.status, 0);
    assert.match(result.stdout, /sdd master status/);
    assert.match(doctor.stdout, /SDD Master — Doctor/);

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

  it("includes the premium README sections and visual references", () => {
    const readme = readFileSync(join(rootDir, "README.md"), "utf8");

    assert.match(readme, /^# SDD Master/m);
    assert.match(readme, /assets\/readme\/sdd-master-hero\.svg/);
    assert.match(readme, /## Instalação futura via npm/);
    assert.match(readme, /## Uso local durante desenvolvimento/);
    assert.match(readme, /## Comandos atuais/);
    assert.match(readme, /\| `sdd master init` \| Disponível \|/);
    assert.match(readme, /## Segurança/);
    assert.match(readme, /## Compatibilidade multi-IA/);
    assert.match(readme, /```mermaid/);
    assert.match(readme, /sdd master doctor/);
    assert.match(readme, /sdd master git --pre-push/);
    assert.match(readme, /sdd master agents --yes/);
  });

  it("includes required README SVG assets", () => {
    const assets = [
      "assets/readme/sdd-master-hero.svg",
      "assets/readme/workflow-overview.svg",
      "assets/readme/multi-ai-support.svg",
      "assets/readme/safety-gates.svg"
    ];

    for (const asset of assets) {
      const content = readFileSync(join(rootDir, asset), "utf8");

      assert.equal(content.trim().length > 0, true, `${asset} should not be empty`);
      assert.match(content, /<svg/);
      assert.equal(content.includes(".env"), false, `${asset} should not mention .env`);
      assert.doesNotMatch(content, /sk-[A-Za-z0-9_-]{20,}/);
      assert.doesNotMatch(content, /BEGIN (RSA |EC |OPENSSH |)PRIVATE KEY/);
    }
  });

  it("includes required public documentation files", () => {
    const docs = [
      "docs/01-negocio-requisitos/visao-do-produto.md",
      "docs/02-tecnica-arquitetura/arquitetura-do-framework.md",
      "docs/02-tecnica-arquitetura/compatibilidade-multi-ia.md",
      "docs/02-tecnica-arquitetura/seguranca-e-governanca.md",
      "docs/03-codigo/comandos-cli.md",
      "docs/03-codigo/desenvolvimento-local.md"
    ];

    for (const doc of docs) {
      const content = readFileSync(join(rootDir, doc), "utf8");
      assert.equal(content.trim().length > 0, true, `${doc} should not be empty`);
    }

    const commands = readFileSync(join(rootDir, "docs/03-codigo/comandos-cli.md"), "utf8");
    assert.match(commands, /sdd master init/);
    assert.match(commands, /sdd master doctor/);
    assert.match(commands, /sdd master git/);
  });
});
