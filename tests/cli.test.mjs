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

function runNpmScript(script) {
  const command = process.platform === "win32" ? "cmd.exe" : "npm";
  const args = process.platform === "win32" ? ["/d", "/s", "/c", `npm run ${script}`] : ["run", script];

  return spawnSync(command, args, {
    cwd: rootDir,
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
    assert.match(result.stdout, /sdd master release/);
    assert.match(result.stdout, /sdd master deploy/);
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

  it("supports local skills and UI/UX gates without global installs or root state", () => {
    withTempProject((projectDir) => {
      const skillsWithoutInit = runCli(["master", "skills", "--yes", "--title=Skill"], projectDir);
      const uiuxWithoutInit = runCli(["master", "uiux", "--yes", "--profile=WEB"], projectDir);

      assert.notEqual(skillsWithoutInit.status, 0);
      assert.match(skillsWithoutInit.stderr, /SDD Master não inicializado/);
      assert.notEqual(uiuxWithoutInit.status, 0);
      assert.match(uiuxWithoutInit.stderr, /sdd master init/);

      assert.equal(initTempProject(projectDir).status, 0);
      assert.equal(
        runCli(["master", "discovery", "--yes", "--title=Web", "--project-type=web", "--profiles=WEB"], projectDir).status,
        0
      );

      const skill = runCli(
        [
          "master",
          "skills",
          "--yes",
          "--title=Antigravity UI polish",
          "--category=uiux",
          "--source=https://github.com/sickn33/antigravity-awesome-skills/",
          "--reason=Avaliar boas práticas visuais."
        ],
        projectDir
      );
      assert.equal(skill.status, 0, skill.stderr);
      assert.equal(existsSync(join(projectDir, ".sdd-master", "skills", "SKILL-001.md")), true);
      assert.match(readFileSync(join(projectDir, ".sdd-master", "skills", "SKILL-001.md"), "utf8"), /Instalação global\nProibida/);

      const skillJson = JSON.parse(runCli(["master", "skills", "--json", "--report"], projectDir).stdout);
      assert.equal(skillJson.summary.candidates, 1);

      const approve = runCli(
        ["master", "skills", "--yes", "--skill=SKILL-001", "--approve", "--reason=Aprovada para uso local."],
        projectDir
      );
      assert.equal(approve.status, 0, approve.stderr);
      assert.match(readFileSync(join(projectDir, ".sdd-master", "skills", "SKILL-001.md"), "utf8"), /## Status\nAprovada/);

      const install = runCli(["master", "skills", "--yes", "--skill=SKILL-001", "--install-local"], projectDir);
      assert.equal(install.status, 0, install.stderr);
      const installedSkill = readFileSync(join(projectDir, ".agents", "skills", "installed", "SKILL-001.md"), "utf8");
      assert.match(installedSkill, /Ela não executa código automaticamente/);
      assert.match(installedSkill, /Ela não baixou código remoto/);

      const used = runCli(
        ["master", "skills", "--yes", "--skill=SKILL-001", "--mark-used", "--phase=PHASE-01", "--target=uiux-review"],
        projectDir
      );
      assert.equal(used.status, 0, used.stderr);
      assert.equal(existsSync(join(projectDir, ".sdd-master", "skills", "usage", "SKILL-USAGE-001.md")), true);
      assert.equal(existsSync(join(projectDir, ".env")), false);
      assert.equal(existsSync(join(projectDir, "node_modules")), false);

      const uiux = runCli(
        ["master", "uiux", "--yes", "--phase=PHASE-01", "--profile=WEB", "--title=Revisão UI/UX inicial", "--status=approved"],
        projectDir
      );
      assert.equal(uiux.status, 0, uiux.stderr);
      assert.equal(existsSync(join(projectDir, ".sdd-master", "uiux", "UIUX-001.md")), true);

      assert.equal(
        runCli(["master", "uiux", "--yes", "--type=design-system", "--phase=PHASE-01", "--profile=WEB"], projectDir)
          .status,
        0
      );
      assert.equal(
        runCli(["master", "uiux", "--yes", "--type=accessibility", "--phase=PHASE-01", "--profile=WEB"], projectDir)
          .status,
        0
      );
      assert.equal(runCli(["master", "uiux", "--yes", "--type=seo", "--phase=PHASE-01", "--profile=WEB"], projectDir).status, 0);
      assert.equal(
        runCli(["master", "uiux", "--yes", "--type=responsiveness", "--phase=PHASE-01", "--profile=WEB"], projectDir)
          .status,
        0
      );
      assert.equal(
        runCli(["master", "uiux", "--yes", "--type=performance", "--phase=PHASE-01", "--profile=WEB"], projectDir)
          .status,
        0
      );

      const uiuxJson = JSON.parse(
        runCli(["master", "uiux", "--json", "--yes", "--phase=PHASE-01", "--profile=WEB", "--title=JSON Review"], projectDir)
          .stdout
      );
      assert.equal(uiuxJson.summary.seo, true);
      assert.equal(existsSync(join(projectDir, "docs", "02-tecnica-arquitetura", "design-system.md")), true);
      assert.equal(existsSync(join(projectDir, "docs", "02-tecnica-arquitetura", "acessibilidade.md")), true);
      assert.equal(existsSync(join(projectDir, "docs", "02-tecnica-arquitetura", "seo.md")), true);
      assert.equal(existsSync(join(projectDir, "docs", "02-tecnica-arquitetura", "responsividade.md")), true);

      const status = runCli(["master", "status"], projectDir);
      assert.equal(status.status, 0);
      assert.match(status.stdout, /Skills:/);
      assert.match(status.stdout, /UI\/UX:/);

      const doctorJson = JSON.parse(runCli(["master", "doctor", "--json"], projectDir).stdout);
      assert.equal(typeof doctorJson.skills, "object");
      assert.equal(typeof doctorJson.uiux, "object");
      assert.equal(doctorJson.uiux.seo, true);
    });

    withTempProject((projectDir) => {
      assert.equal(initTempProject(projectDir).status, 0);
      assert.equal(
        runCli(["master", "discovery", "--yes", "--title=Web", "--project-type=web", "--profiles=WEB"], projectDir).status,
        0
      );
      const webImplement = JSON.parse(
        runCli(["master", "implement", "--json", "--yes", "--phase=PHASE-01", "--task=TASK-001"], projectDir).stdout
      );
      assert.equal(webImplement.blockers.includes("UI/UX aprovado pendente"), true);
      assert.equal(webImplement.blockers.includes("Design system pendente"), true);
      assert.equal(webImplement.blockers.includes("Acessibilidade pendente"), true);
      assert.equal(webImplement.blockers.includes("SEO pendente"), true);
      assert.equal(webImplement.blockers.includes("Responsividade pendente"), true);

      assert.equal(
        runCli(["master", "uiux", "--yes", "--profile=WEB", "--status=failed", "--title=Reprovado"], projectDir).status,
        0
      );
      const failedUiux = JSON.parse(
        runCli(["master", "implement", "--json", "--yes", "--phase=PHASE-01", "--task=TASK-001"], projectDir).stdout
      );
      assert.equal(failedUiux.blockers.includes("UI/UX aprovado pendente"), true);
    });

    withTempProject((projectDir) => {
      assert.equal(initTempProject(projectDir).status, 0);
      assert.equal(
        runCli(["master", "discovery", "--yes", "--title=API", "--project-type=api", "--profiles=API"], projectDir).status,
        0
      );
      const apiImplement = JSON.parse(
        runCli(["master", "implement", "--json", "--yes", "--phase=PHASE-01", "--task=TASK-001"], projectDir).stdout
      );
      assert.equal(apiImplement.blockers.includes("SEO pendente"), false);
      assert.equal(apiImplement.gates.find((gate) => gate.gate === "SEO")?.status, "not-applicable");
    });

    withTempProject((projectDir) => {
      assert.equal(initTempProject(projectDir).status, 0);
      assert.equal(
        runCli(["master", "discovery", "--yes", "--title=CLI", "--project-type=cli", "--profiles=CLI"], projectDir).status,
        0
      );
      const cliImplement = JSON.parse(
        runCli(["master", "implement", "--json", "--yes", "--phase=PHASE-01", "--task=TASK-001"], projectDir).stdout
      );
      assert.equal(cliImplement.blockers.includes("SEO pendente"), false);
      assert.equal(cliImplement.gates.find((gate) => gate.gate === "Responsiveness")?.status, "Pendente");
    });

    assert.equal(runCli(["master", "help", "skills"]).status, 0);
    assert.equal(runCli(["master", "help", "uiux"]).status, 0);
    assert.equal(runCli(["master", "skills", "--help"]).status, 0);
    assert.equal(runCli(["master", "uiux", "--help"]).status, 0);
    assert.equal(existsSync(join(rootDir, ".sdd-master")), false);
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
      const secretName = ["STRIPE", "SECRET", "KEY"].join("_");
      writeFileSync(join(projectDir, ".env.example"), `${secretName}=${liveKey}\n`, "utf8");
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

  it("git pre-push blocks generated secrets in consumer files without leaking values", () => {
    withTempProject((projectDir) => {
      runGit(["init"], projectDir);
      const projectKey = ["sk", "proj", "abcdefghijklmnopqrstuvwxyz"].join("-");
      const appKey = ["APP_KEY", "base64:" + "abcdefghijklmnopqrstuvwxyz123456"].join("=");
      const privateKey = ["BEGIN", "PRIVATE", "KEY"].join(" ");
      const tsSecret = ["sk", "proj", "typescriptfakevalue"].join("-");

      writeFileSync(join(projectDir, "config.txt"), `${projectKey}\n${appKey}\n${privateKey}\n`, "utf8");
      writeFileSync(join(projectDir, "config.ts"), `export const fixture = "${tsSecret}";\n`, "utf8");

      const result = runCli(["master", "git", "--pre-push"], projectDir);
      const report = JSON.parse(runCli(["master", "git", "--pre-push", "--json"], projectDir).stdout);

      assert.equal(report.status, "blocked");
      assert.equal(report.security.suspectedSecrets.length >= 4, true);
      assert.match(result.stdout, /Possível segredo detectado/);
      assert.match(result.stdout, /\[REDACTED\]/);
      assert.equal(result.stdout.includes(projectKey), false);
      assert.equal(result.stdout.includes(appKey), false);
      assert.equal(result.stdout.includes(privateKey), false);
      assert.equal(result.stdout.includes(tsSecret), false);
    });
  });

  it("git pre-push does not block redacted reports or internal scanner wording", () => {
    withTempProject((projectDir) => {
      runGit(["init"], projectDir);
      writeFileSync(
        join(projectDir, "scanner.ts"),
        [
          "const suspectedSecrets = scanForSecrets(cwd);",
          "const secrets = report.security.suspectedSecrets;",
          "const text = 'Valor: [REDACTED]';"
        ].join("\n"),
        "utf8"
      );

      const report = JSON.parse(runCli(["master", "git", "--pre-push", "--json"], projectDir).stdout);

      assert.notEqual(report.status, "blocked");
      assert.equal(report.security.suspectedSecrets.length, 0);
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

  it("implements safe update with dry-run, backups, reports and conflicts", () => {
    withTempProject((projectDir) => {
      const withoutInit = runCli(["master", "update", "--dry-run"], projectDir);
      assert.notEqual(withoutInit.status, 0);
      assert.match(withoutInit.stderr, /SDD Master não inicializado/);

      assert.equal(runCli(["master", "update", "--help"], projectDir).status, 0);
      assert.equal(runCli(["master", "help", "update"], projectDir).status, 0);
      assert.equal(initTempProject(projectDir).status, 0);

      const projectStatePath = join(projectDir, ".sdd-master", "project-state.md");
      const originalState = readFileSync(projectStatePath, "utf8");
      const oldState = originalState.replace(/\n## SDD Master\n[\s\S]*?(?=\n## Estado atual)/, "");
      writeFileSync(projectStatePath, oldState, "utf8");

      const missingTemplatePath = join(
        projectDir,
        ".sdd-master",
        "templates",
        "workflow",
        "test-result-template.md"
      );
      rmSync(missingTemplatePath, { force: true });

      const modifiedTemplatePath = join(
        projectDir,
        ".sdd-master",
        "templates",
        "workflow",
        "task-template.md"
      );
      writeFileSync(modifiedTemplatePath, "# Template local preenchido\n\nDecisão humana preservada.\n", "utf8");
      const customFilePath = join(projectDir, ".sdd-master", "templates", "workflow", "custom-local.md");
      writeFileSync(customFilePath, "# Arquivo local\n", "utf8");

      const beforeDryRunState = readFileSync(projectStatePath, "utf8");
      const dryRun = runCli(["master", "update", "--dry-run"], projectDir);
      assert.equal(dryRun.status, 0, dryRun.stderr);
      assert.match(dryRun.stdout, /Modo:\s+dry-run/);
      assert.match(dryRun.stdout, /Nenhuma alteração foi feita/);
      assert.equal(readFileSync(projectStatePath, "utf8"), beforeDryRunState);
      assert.equal(existsSync(missingTemplatePath), false);

      const dryRunJson = JSON.parse(runCli(["master", "update", "--dry-run", "--json"], projectDir).stdout);
      assert.equal(Array.isArray(dryRunJson.created), true);
      assert.equal(Array.isArray(dryRunJson.updated), true);
      assert.equal(Array.isArray(dryRunJson.preserved), true);
      assert.equal(Array.isArray(dryRunJson.conflicts), true);
      assert.equal(dryRunJson.created.includes(".sdd-master/templates/workflow/test-result-template.md"), true);
      assert.equal(
        dryRunJson.conflicts.some((conflict) => conflict.path === ".sdd-master/templates/workflow/task-template.md"),
        true
      );

      const apply = runCli(["master", "update", "--apply", "--yes", "--json"], projectDir);
      assert.equal(apply.status, 0, apply.stderr);
      const applied = JSON.parse(apply.stdout);
      assert.equal(applied.status, "partial");
      assert.equal(applied.created.includes(".sdd-master/templates/workflow/test-result-template.md"), true);
      assert.equal(applied.projectStateUpdated, true);
      assert.equal(typeof applied.reportPath, "string");
      assert.equal(typeof applied.backupPath, "string");

      assert.equal(existsSync(missingTemplatePath), true);
      assert.equal(readFileSync(modifiedTemplatePath, "utf8"), "# Template local preenchido\n\nDecisão humana preservada.\n");
      assert.equal(existsSync(customFilePath), true);
      assert.match(readFileSync(projectStatePath, "utf8"), /## SDD Master/);
      assert.match(readFileSync(projectStatePath, "utf8"), /Versão dos templates: 0\.1\.0/);
      assert.equal(existsSync(join(projectDir, applied.backupPath, "manifest.md")), true);
      assert.match(readFileSync(join(projectDir, applied.reportPath), "utf8"), /## Status\npartial/);
      assert.equal(existsSync(join(projectDir, ".env")), false);

      const force = runCli(["master", "update", "--apply", "--yes", "--force", "--json"], projectDir);
      assert.equal(force.status, 0, force.stderr);
      assert.equal(existsSync(customFilePath), true);

      const status = runCli(["master", "status"], projectDir);
      assert.equal(status.status, 0);
      assert.match(status.stdout, /Update:/);
      assert.match(status.stdout, /Versão dos templates:/);

      const doctorJson = JSON.parse(runCli(["master", "doctor", "--json"], projectDir).stdout);
      assert.equal(typeof doctorJson.update, "object");
      assert.equal(
        doctorJson.checks.some((check) => check.id === "update"),
        true
      );
    });

    assert.equal(existsSync(join(rootDir, ".sdd-master")), false);
    assert.equal(existsSync(join(rootDir, "SDD Master Roadmap.pdf")), true);
    assert.equal(existsSync(join(rootDir, "SDD Master — Checklist de Implementação v0.1.pdf")), true);
    assert.equal(existsSync(join(rootDir, "SDD Master — Documento Mestre v0.1.pdf")), true);
  });

  it("returns an error for unknown master commands", () => {
    const result = runCli(["master", "banana"]);

    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /Comando desconhecido: banana/);
    assert.match(result.stderr, /sdd master help/);
  });

  it("declares the sdd binary in package.json", () => {
    const packageJson = JSON.parse(readFileSync(join(rootDir, "package.json"), "utf8"));

    assert.equal(packageJson.bin?.sdd, "dist/cli/main.js");
  });

  it("has hardened package metadata and files allowlist", () => {
    const packageJson = JSON.parse(readFileSync(join(rootDir, "package.json"), "utf8"));

    assert.equal(packageJson.license, "MIT");
    assert.equal(packageJson.version, "0.2.0-prototype");
    assert.equal(packageJson.bin?.sdd, "dist/cli/main.js");
    assert.equal(packageJson.files.includes("dist/"), true);
    assert.equal(packageJson.files.includes("README.md"), true);
    assert.equal(packageJson.files.includes("LICENSE"), true);
    assert.equal(packageJson.files.includes("CHANGELOG.md"), true);
    assert.equal(packageJson.files.includes("docs/"), true);
    assert.equal(packageJson.files.includes("assets/"), true);
    assert.equal(packageJson.files.includes(".sdd-master/"), false);
    assert.equal(packageJson.files.includes(".env"), false);
    assert.equal(packageJson.files.some((entry) => entry.toLowerCase().endsWith(".pdf")), false);
    assert.match(packageJson.scripts.check, /npm run smoke/);
    assert.match(packageJson.scripts.check, /npm run package:check/);
    assert.match(packageJson.scripts.check, /npm run pack:dry-run/);
  });

  it("includes hardening scripts", () => {
    const scripts = [
      "scripts/smoke-test.mjs",
      "scripts/package-check.mjs",
      "scripts/pack-dry-run.mjs"
    ];

    for (const script of scripts) {
      assert.equal(existsSync(join(rootDir, script)), true, `${script} should exist`);
    }
  });

  it("runs hardening scripts after build", () => {
    const smoke = runNpmScript("smoke");
    const packageCheck = runNpmScript("package:check");
    const packDryRun = runNpmScript("pack:dry-run");

    assert.equal(smoke.status, 0, smoke.stderr || smoke.stdout);
    assert.equal(packageCheck.status, 0, packageCheck.stderr || packageCheck.stdout);
    assert.equal(packDryRun.status, 0, packDryRun.stderr || packDryRun.stdout);
    assert.equal(existsSync(join(rootDir, ".env")), false);
    assert.equal(existsSync(join(rootDir, ".sdd-master")), false);
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
    assert.match(readme, /## Instalação via npm/);
    assert.match(readme, /## Uso local durante desenvolvimento/);
    assert.match(readme, /## Comandos atuais/);
    assert.match(readme, /\| `sdd master init` \| Disponível \|/);
    assert.match(readme, /## Segurança/);
    assert.match(readme, /## Compatibilidade multi-IA/);
    assert.match(readme, /```mermaid/);
    assert.match(readme, /sdd master doctor/);
    assert.match(readme, /sdd master git --pre-push/);
    assert.match(readme, /sdd master agents --yes/);
    assert.match(readme, /npm run check/);
    assert.match(readme, /npm run package:check/);
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
      "docs/03-codigo/checklist-github-release.md",
      "docs/03-codigo/checklist-publicacao-npm.md",
      "docs/03-codigo/comandos-cli.md",
      "docs/03-codigo/desenvolvimento-local.md",
      "docs/03-codigo/governanca-sdd.md",
      "docs/03-codigo/implement-guard.md",
      "docs/03-codigo/publicacao-npm.md",
      "docs/03-codigo/quality-audit-blockers.md",
      "docs/03-codigo/release-local.md",
      "docs/03-codigo/workflow-sdd.md"
    ];

    for (const doc of docs) {
      const content = readFileSync(join(rootDir, doc), "utf8");
      assert.equal(content.trim().length > 0, true, `${doc} should not be empty`);
    }

    const commands = readFileSync(join(rootDir, "docs/03-codigo/comandos-cli.md"), "utf8");
    const localDevelopment = readFileSync(join(rootDir, "docs/03-codigo/desenvolvimento-local.md"), "utf8");
    assert.match(commands, /sdd master init/);
    assert.match(commands, /sdd master doctor/);
    assert.match(commands, /sdd master git/);
    assert.match(localDevelopment, /npm run smoke/);
    assert.match(localDevelopment, /npm run package:check/);
    assert.match(localDevelopment, /npm run pack:dry-run/);
  });

  it("implements the initial SDD workflow commands safely", () => {
    for (const command of ["discovery", "requirements", "spec", "plan", "tasks"]) {
      withTempProject((projectDir) => {
        const result = runCli(["master", command, "--yes"], projectDir);

        assert.notEqual(result.status, 0);
        assert.match(result.stderr, /SDD Master não inicializado neste diretório/);
        assert.match(result.stderr, /sdd master init/);
      });
    }

    withTempProject((projectDir) => {
      initTempProject(projectDir);

      const prematureRequirements = runCli(["master", "requirements", "--yes"], projectDir);
      const prematureSpec = runCli(["master", "spec", "--yes"], projectDir);
      const prematurePlan = runCli(["master", "plan", "--yes"], projectDir);
      const prematureTasks = runCli(["master", "tasks", "--yes"], projectDir);

      assert.notEqual(prematureRequirements.status, 0);
      assert.notEqual(prematureSpec.status, 0);
      assert.notEqual(prematurePlan.status, 0);
      assert.notEqual(prematureTasks.status, 0);
      assert.match(prematureRequirements.stderr, /Pré-condição ausente/);
      assert.match(prematureSpec.stderr, /requirements-index\.md/);
      assert.match(prematurePlan.stderr, /phase-01-spec\.md/);
      assert.match(prematureTasks.stderr, /phase-01-plan\.md/);

      const discovery = runCli(
        [
          "master",
          "discovery",
          "--yes",
          "--title=Minha Loja",
          "--project-type=web",
          "--profiles=WEB,E-COMMERCE",
          "--maturity=M0"
        ],
        projectDir
      );

      assert.equal(discovery.status, 0);
      assert.match(discovery.stdout, /SDD Master — Discovery/);
      assert.match(discovery.stdout, /\/sdd-master-requirements/);
      assert.equal(existsSync(join(projectDir, ".sdd-master", "discovery", "initial-discovery.md")), true);
      assert.equal(existsSync(join(projectDir, ".sdd-master", "discovery", "project-profiles.md")), true);
      assert.equal(existsSync(join(projectDir, ".sdd-master", "discovery", "initial-risks.md")), true);
      assert.equal(existsSync(join(projectDir, ".sdd-master", "discovery", "constraints.md")), true);
      assert.equal(existsSync(join(projectDir, "docs", "01-negocio-requisitos", "publico-alvo.md")), true);

      const stateAfterDiscovery = readFileSync(join(projectDir, ".sdd-master", "project-state.md"), "utf8");
      assert.match(stateAfterDiscovery, /Fase atual: PHASE-01 — Discovery/);
      assert.match(stateAfterDiscovery, /Próximo comando permitido: \/sdd-master-requirements/);
      assert.match(stateAfterDiscovery, /Maturidade atual: M0 — Ideia/);

      const discoveryJson = JSON.parse(
        runCli(["master", "discovery", "--json", "--yes", "--title=Minha Loja"], projectDir).stdout
      );
      assert.equal(discoveryJson.status, "created");
      assert.equal(discoveryJson.command, "discovery");
      assert.equal(discoveryJson.nextCommand, "/sdd-master-requirements");
      assert.equal(discoveryJson.approval, "pending");
      assert.equal(discoveryJson.preservedFiles.includes(".sdd-master/discovery/initial-discovery.md"), true);

      const requirements = runCli(["master", "requirements", "--yes", "--title=Requisitos iniciais"], projectDir);
      assert.equal(requirements.status, 0);
      assert.equal(existsSync(join(projectDir, ".sdd-master", "requirements", "requirements-index.md")), true);
      assert.equal(existsSync(join(projectDir, ".sdd-master", "requirements", "rf", "RF-001.md")), true);
      assert.equal(existsSync(join(projectDir, ".sdd-master", "requirements", "rnf", "RNF-001.md")), true);
      assert.equal(
        existsSync(join(projectDir, ".sdd-master", "requirements", "business-rules", "BR-001.md")),
        true
      );

      const spec = runCli(
        ["master", "spec", "--yes", "--phase=PHASE-01", "--title=Especificação inicial"],
        projectDir
      );
      assert.equal(spec.status, 0);
      assert.equal(existsSync(join(projectDir, ".sdd-master", "specs", "phase-01-spec.md")), true);

      const plan = runCli(
        ["master", "plan", "--yes", "--phase=PHASE-01", "--title=Plano técnico inicial"],
        projectDir
      );
      assert.equal(plan.status, 0);
      assert.equal(existsSync(join(projectDir, ".sdd-master", "plans", "phase-01-plan.md")), true);
      assert.equal(
        existsSync(join(projectDir, "docs", "02-tecnica-arquitetura", "plano-tecnico-inicial.md")),
        true
      );

      const tasks = runCli(
        ["master", "tasks", "--yes", "--phase=PHASE-01", "--title=Tarefas iniciais"],
        projectDir
      );
      assert.equal(tasks.status, 0);
      assert.match(tasks.stdout, /ainda não está implementado/);
      assert.equal(existsSync(join(projectDir, ".sdd-master", "tasks", "phase-01-tasks.md")), true);
      assert.equal(existsSync(join(projectDir, ".sdd-master", "tasks", "TASK-001.md")), true);
      assert.equal(existsSync(join(projectDir, "docs", "03-codigo", "tarefas-iniciais.md")), true);

      const stateAfterTasks = readFileSync(join(projectDir, ".sdd-master", "project-state.md"), "utf8");
      assert.match(stateAfterTasks, /Fase atual: PHASE-05 — Tasks/);
      assert.match(stateAfterTasks, /Próximo comando permitido: \/sdd-master-implement/);

      const generatedFiles = [
        ".sdd-master/discovery/initial-discovery.md",
        ".sdd-master/requirements/rf/RF-001.md",
        ".sdd-master/specs/phase-01-spec.md",
        ".sdd-master/plans/phase-01-plan.md",
        ".sdd-master/tasks/TASK-001.md"
      ];

      for (const file of generatedFiles) {
        const content = readFileSync(join(projectDir, file), "utf8");
        assert.match(content, /Aprovação humana: Pendente|## Aprovação humana\s+Pendente/);
      }

      assert.match(
        readFileSync(join(projectDir, ".sdd-master", "discovery", "initial-discovery.md"), "utf8"),
        /\/sdd-master-requirements/
      );
      assert.match(
        readFileSync(join(projectDir, ".sdd-master", "specs", "phase-01-spec.md"), "utf8"),
        /\/sdd-master-plan/
      );
      assert.match(
        readFileSync(join(projectDir, ".sdd-master", "plans", "phase-01-plan.md"), "utf8"),
        /\/sdd-master-tasks/
      );

      const status = runCli(["master", "status"], projectDir);
      assert.equal(status.status, 0);
      assert.match(status.stdout, /Workflow inicial:/);
      assert.match(status.stdout, /Discovery: OK/);
      assert.match(status.stdout, /Tasks: OK/);
      assert.match(status.stdout, /\/sdd-master-implement/);

      const doctorJson = JSON.parse(runCli(["master", "doctor", "--json"], projectDir).stdout);
      assert.equal(typeof doctorJson.workflow, "object");
      assert.equal(doctorJson.workflow.discovery, true);
      assert.equal(doctorJson.workflow.tasks, true);

      for (const command of ["discovery", "requirements", "spec", "plan", "tasks"]) {
        const contextual = runCli(["master", "help", command]);
        const direct = runCli(["master", command, "--help"]);

        assert.equal(contextual.status, 0);
        assert.equal(direct.status, 0);
        assert.match(contextual.stdout, new RegExp(`sdd master ${command}`));
        assert.match(direct.stdout, /Aprovação humana/);
      }

      assert.equal(existsSync(join(projectDir, ".env")), false);
      assert.doesNotMatch(
        generatedFiles.map((file) => readFileSync(join(projectDir, file), "utf8")).join("\n"),
        /sk-[A-Za-z0-9_-]{20,}|BEGIN (RSA |EC |OPENSSH |)PRIVATE KEY/
      );
    });

    assert.equal(existsSync(join(rootDir, ".sdd-master")), false);
    assert.equal(existsSync(join(rootDir, "SDD Master Roadmap.pdf")), true);
    assert.equal(existsSync(join(rootDir, "SDD Master — Checklist de Implementação v0.1.pdf")), true);
    assert.equal(existsSync(join(rootDir, "SDD Master — Documento Mestre v0.1.pdf")), true);
  });

  it("implements governance commands and formal implement gates safely", () => {
    for (const command of ["clarify", "approve", "scope", "backlog"]) {
      withTempProject((projectDir) => {
        const result = runCli(["master", command, "--yes"], projectDir);

        assert.notEqual(result.status, 0);
        assert.match(result.stderr, /SDD Master não inicializado neste diretório/);
        assert.match(result.stderr, /sdd master init/);
      });
    }

    withTempProject((projectDir) => {
      initTempProject(projectDir);

      const clarify = runCli(
        [
          "master",
          "clarify",
          "--yes",
          "--title=Definir público-alvo principal",
          "--phase=PHASE-01",
          "--type=question"
        ],
        projectDir
      );
      assert.equal(clarify.status, 0);
      assert.equal(existsSync(join(projectDir, ".sdd-master", "clarifications", "CLARIFY-001.md")), true);
      assert.match(
        readFileSync(join(projectDir, ".sdd-master", "clarifications", "CLARIFY-001.md"), "utf8"),
        /## Status\s+Aberta/
      );

      const clarifyJson = JSON.parse(
        runCli(
          [
            "master",
            "clarify",
            "--json",
            "--yes",
            "--id=CLARIFY-001",
            "--status=resolved",
            "--reason=Público-alvo definido pelo humano."
          ],
          projectDir
        ).stdout
      );
      assert.equal(clarifyJson.command, "clarify");
      assert.equal(clarifyJson.id, "CLARIFY-001");
      assert.equal(clarifyJson.status, "updated");
      assert.equal(Array.isArray(clarifyJson.blockers), true);
      assert.match(
        readFileSync(join(projectDir, ".sdd-master", "clarifications", "CLARIFY-001.md"), "utf8"),
        /## Status\s+Resolvida/
      );

      const approveMissingDecision = runCli(
        ["master", "approve", "--yes", "--target=discovery", "--phase=PHASE-01"],
        projectDir
      );
      assert.notEqual(approveMissingDecision.status, 0);
      assert.match(approveMissingDecision.stderr, /approve exige --decision/);

      const approval = runCli(
        [
          "master",
          "approve",
          "--yes",
          "--target=discovery",
          "--phase=PHASE-01",
          "--decision=approved",
          "--reason=Discovery revisado e aprovado pelo humano."
        ],
        projectDir
      );
      assert.equal(approval.status, 0);
      assert.equal(existsSync(join(projectDir, ".sdd-master", "approvals", "APPROVAL-001.md")), true);
      assert.match(
        readFileSync(join(projectDir, ".sdd-master", "approvals", "APPROVAL-001.md"), "utf8"),
        /## Aprovador\s+Humano/
      );

      const approvedScope = runCli(
        ["master", "scope", "--yes", "--type=approved", "--title=MVP inicial", "--phase=PHASE-01"],
        projectDir
      );
      assert.equal(approvedScope.status, 0);
      assert.match(
        readFileSync(join(projectDir, ".sdd-master", "scope", "approved-scope.md"), "utf8"),
        /MVP inicial/
      );

      const outOfScope = runCli(
        [
          "master",
          "scope",
          "--yes",
          "--type=out-of-scope",
          "--title=Deploy em produção",
          "--phase=PHASE-01",
          "--reason=Fora do MVP inicial."
        ],
        projectDir
      );
      assert.equal(outOfScope.status, 0);
      assert.match(
        readFileSync(join(projectDir, ".sdd-master", "scope", "out-of-scope.md"), "utf8"),
        /Deploy em produção/
      );

      const change = runCli(
        [
          "master",
          "scope",
          "--yes",
          "--type=change",
          "--title=Adicionar suporte mobile",
          "--phase=PHASE-01",
          "--reason=Nova necessidade identificada."
        ],
        projectDir
      );
      assert.equal(change.status, 0);
      assert.equal(existsSync(join(projectDir, ".sdd-master", "scope", "changes", "CHANGE-001.md")), true);
      assert.match(change.stdout, /Mudanças de escopo abertas/);

      const backlog = runCli(
        [
          "master",
          "backlog",
          "--yes",
          "--type=future-requirement",
          "--title=Integração com GitHub Projects",
          "--priority=COULD"
        ],
        projectDir
      );
      assert.equal(backlog.status, 0);
      assert.equal(existsSync(join(projectDir, ".sdd-master", "backlog", "BACKLOG-001.md")), true);
      assert.match(backlog.stdout, /Backlog não autoriza implementação/);

      const status = runCli(["master", "status"], projectDir);
      assert.equal(status.status, 0);
      assert.match(status.stdout, /Governança:/);
      assert.match(status.stdout, /Clarificações abertas: 0/);
      assert.match(status.stdout, /Aprovações registradas: 1/);
      assert.match(status.stdout, /Mudanças de escopo abertas: 1/);
      assert.match(status.stdout, /Backlog registrado: 1/);
      assert.match(status.stdout, /Implementação:/);
      assert.match(status.stdout, /Pronta: Não/);

      const doctorJson = JSON.parse(runCli(["master", "doctor", "--json"], projectDir).stdout);
      assert.equal(typeof doctorJson.governance, "object");
      assert.equal(doctorJson.governance.backlog.total, 1);
      assert.equal(doctorJson.governance.scope.openChanges, 1);
      assert.equal(typeof doctorJson.implementReadiness, "object");
      assert.equal(doctorJson.implementReadiness.ready, false);
      assert.equal(doctorJson.implementReadiness.blockers.includes("Mudanças de escopo abertas"), true);

      for (const command of ["clarify", "approve", "scope", "backlog"]) {
        const contextual = runCli(["master", "help", command]);
        const direct = runCli(["master", command, "--help"]);

        assert.equal(contextual.status, 0);
        assert.equal(direct.status, 0);
        assert.match(contextual.stdout, new RegExp(`sdd master ${command}`));
        assert.match(direct.stdout, /Aprovação humana|Backlog não autoriza implementação/);
      }

      const secondBacklog = runCli(
        ["master", "backlog", "--yes", "--type=idea", "--title=Ideia futura", "--priority=COULD"],
        projectDir
      );
      assert.equal(secondBacklog.status, 0);
      assert.equal(existsSync(join(projectDir, ".sdd-master", "backlog", "BACKLOG-001.md")), true);
      assert.equal(existsSync(join(projectDir, ".sdd-master", "backlog", "BACKLOG-002.md")), true);

      assert.equal(existsSync(join(projectDir, ".env")), false);
      const governanceContent = [
        readFileSync(join(projectDir, ".sdd-master", "clarifications", "CLARIFY-001.md"), "utf8"),
        readFileSync(join(projectDir, ".sdd-master", "approvals", "APPROVAL-001.md"), "utf8"),
        readFileSync(join(projectDir, ".sdd-master", "scope", "changes", "CHANGE-001.md"), "utf8"),
        readFileSync(join(projectDir, ".sdd-master", "backlog", "BACKLOG-001.md"), "utf8")
      ].join("\n");
      assert.doesNotMatch(governanceContent, /sk-[A-Za-z0-9_-]{20,}|BEGIN (RSA |EC |OPENSSH |)PRIVATE KEY/);
    });

    assert.equal(existsSync(join(rootDir, ".sdd-master")), false);
    assert.equal(existsSync(join(rootDir, "SDD Master Roadmap.pdf")), true);
    assert.equal(existsSync(join(rootDir, "SDD Master — Checklist de Implementação v0.1.pdf")), true);
    assert.equal(existsSync(join(rootDir, "SDD Master — Documento Mestre v0.1.pdf")), true);
  });

  it("implements quality audit docs and blocker gates safely", () => {
    for (const command of ["quality", "audit", "docs", "blocker"]) {
      withTempProject((projectDir) => {
        const result = runCli(["master", command, "--yes"], projectDir);

        assert.notEqual(result.status, 0);
        assert.match(result.stderr, /SDD Master não inicializado neste diretório/);
        assert.match(result.stderr, /sdd master init/);
      });
    }

    withTempProject((projectDir) => {
      initTempProject(projectDir);

      const quality = runCli(
        ["master", "quality", "--yes", "--phase=PHASE-01", "--target=tasks", "--title=Revisão de qualidade"],
        projectDir
      );
      assert.equal(quality.status, 0);
      assert.equal(existsSync(join(projectDir, ".sdd-master", "quality", "QUALITY-001.md")), true);

      const qualityJson = JSON.parse(
        runCli(
          [
            "master",
            "quality",
            "--json",
            "--yes",
            "--phase=PHASE-01",
            "--target=spec",
            "--status=failed",
            "--reason=Critérios de aceite incompletos."
          ],
          projectDir
        ).stdout
      );
      assert.equal(qualityJson.command, "quality");
      assert.equal(qualityJson.status, "created");
      assert.equal(qualityJson.implementReady, false);
      assert.equal(existsSync(join(projectDir, ".sdd-master", "quality", "QUALITY-002.md")), true);
      assert.equal(existsSync(join(projectDir, ".sdd-master", "blockers", "BLOCKER-001.md")), true);

      const audit = runCli(
        ["master", "audit", "--yes", "--phase=PHASE-01", "--type=self-audit", "--title=Auditoria da fase"],
        projectDir
      );
      assert.equal(audit.status, 0);
      assert.equal(existsSync(join(projectDir, ".sdd-master", "audits", "AUDIT-001.md")), true);

      const auditBlocker = runCli(
        [
          "master",
          "audit",
          "--yes",
          "--phase=PHASE-01",
          "--severity=BLOCKER",
          "--category=constitution",
          "--title=Tentativa de avançar sem aprovação",
          "--reason=Tasks ainda pendentes de aprovação humana."
        ],
        projectDir
      );
      assert.equal(auditBlocker.status, 0);
      assert.equal(existsSync(join(projectDir, ".sdd-master", "audits", "AUDIT-002.md")), true);
      assert.equal(existsSync(join(projectDir, ".sdd-master", "blockers", "BLOCKER-002.md")), true);

      const auditHigh = runCli(
        [
          "master",
          "audit",
          "--yes",
          "--phase=PHASE-01",
          "--severity=HIGH",
          "--category=workflow",
          "--title=Achado alto",
          "--reason=Risco alto registrado."
        ],
        projectDir
      );
      assert.equal(auditHigh.status, 0);

      const docs = runCli(
        ["master", "docs", "--yes", "--phase=PHASE-01", "--target=workflow", "--title=Validação documental"],
        projectDir
      );
      assert.equal(docs.status, 0);
      assert.equal(existsSync(join(projectDir, ".sdd-master", "docs", "DOCS-001.md")), true);

      const outdatedDocs = runCli(
        [
          "master",
          "docs",
          "--yes",
          "--phase=PHASE-01",
          "--target=docs/03-codigo/workflow-sdd.md",
          "--status=outdated",
          "--reason=Novo comando ainda não documentado."
        ],
        projectDir
      );
      assert.equal(outdatedDocs.status, 0);
      assert.equal(existsSync(join(projectDir, ".sdd-master", "docs", "DOCS-002.md")), true);

      const manualBlocker = runCli(
        [
          "master",
          "blocker",
          "--yes",
          "--title=Tasks sem aprovação humana",
          "--phase=PHASE-01",
          "--severity=BLOCKER",
          "--reason=Implementação não pode começar."
        ],
        projectDir
      );
      assert.equal(manualBlocker.status, 0);
      assert.equal(existsSync(join(projectDir, ".sdd-master", "blockers", "BLOCKER-003.md")), true);

      const blockerJson = JSON.parse(runCli(["master", "blocker", "--json"], projectDir).stdout);
      assert.equal(blockerJson.command, "blocker");
      assert.equal(blockerJson.status, "listed");
      assert.equal(blockerJson.records.includes("BLOCKER-001"), true);

      const resolved = runCli(
        ["master", "blocker", "--yes", "--id=BLOCKER-003", "--status=resolved", "--reason=Aprovação registrada."],
        projectDir
      );
      assert.equal(resolved.status, 0);
      assert.match(
        readFileSync(join(projectDir, ".sdd-master", "blockers", "BLOCKER-003.md"), "utf8"),
        /## Status\s+Resolvido/
      );

      const status = runCli(["master", "status"], projectDir);
      assert.equal(status.status, 0);
      assert.match(status.stdout, /Quality:/);
      assert.match(status.stdout, /Falhas abertas: 1/);
      assert.match(status.stdout, /Audit:/);
      assert.match(status.stdout, /BLOCKER abertos: 1/);
      assert.match(status.stdout, /HIGH\/CRITICAL abertos: 1/);
      assert.match(status.stdout, /Docs:/);
      assert.match(status.stdout, /Pendências documentais: 1/);
      assert.match(status.stdout, /Blockers:/);
      assert.match(status.stdout, /Abertos: 2/);
      assert.match(status.stdout, /Pronta: Não/);

      const doctorJson = JSON.parse(runCli(["master", "doctor", "--json"], projectDir).stdout);
      assert.equal(typeof doctorJson.gates, "object");
      assert.equal(doctorJson.gates.quality.failedOpen, 1);
      assert.equal(doctorJson.gates.audit.blockerOpen, 1);
      assert.equal(doctorJson.gates.audit.highCriticalOpen, 1);
      assert.equal(doctorJson.gates.docs.pending, 1);
      assert.equal(doctorJson.gates.blockers.open, 2);
      assert.equal(doctorJson.implementReadiness.ready, false);
      assert.equal(doctorJson.status, "broken");

      for (const command of ["quality", "audit", "docs", "blocker"]) {
        const contextual = runCli(["master", "help", command]);
        const direct = runCli(["master", command, "--help"]);

        assert.equal(contextual.status, 0);
        assert.equal(direct.status, 0);
        assert.match(contextual.stdout, new RegExp(`sdd master ${command}`));
        assert.match(direct.stdout, /readiness|implementação|Bloqueios/i);
      }

      assert.equal(existsSync(join(projectDir, ".env")), false);
      const gateContent = [
        readFileSync(join(projectDir, ".sdd-master", "quality", "QUALITY-001.md"), "utf8"),
        readFileSync(join(projectDir, ".sdd-master", "audits", "AUDIT-002.md"), "utf8"),
        readFileSync(join(projectDir, ".sdd-master", "docs", "DOCS-002.md"), "utf8"),
        readFileSync(join(projectDir, ".sdd-master", "blockers", "BLOCKER-001.md"), "utf8")
      ].join("\n");
      assert.doesNotMatch(gateContent, /sk-[A-Za-z0-9_-]{20,}|BEGIN (RSA |EC |OPENSSH |)PRIVATE KEY/);
    });

    assert.equal(existsSync(join(rootDir, ".sdd-master")), false);
    assert.equal(existsSync(join(rootDir, "SDD Master Roadmap.pdf")), true);
    assert.equal(existsSync(join(rootDir, "SDD Master — Checklist de Implementação v0.1.pdf")), true);
    assert.equal(existsSync(join(rootDir, "SDD Master — Documento Mestre v0.1.pdf")), true);

    const prePush = runCli(["master", "git", "--pre-push"], rootDir);
    assert.notEqual(prePush.stdout, "");
    assert.doesNotMatch(prePush.stdout, /Status geral:\s+blocked/);
  });

  it("implements the implement guard without changing consumer code", () => {
    withTempProject((projectDir) => {
      const result = runCli(["master", "implement", "--yes"], projectDir);

      assert.notEqual(result.status, 0);
      assert.match(result.stderr, /SDD Master não inicializado neste diretório/);
      assert.match(result.stderr, /sdd master init/);
    });

    const contextual = runCli(["master", "help", "implement"]);
    const direct = runCli(["master", "implement", "--help"]);
    assert.equal(contextual.status, 0);
    assert.equal(direct.status, 0);
    assert.match(contextual.stdout, /guard\/dry-run/);
    assert.match(direct.stdout, /não altera código/);

    withTempProject((projectDir) => {
      initTempProject(projectDir);
      const consumerCode = join(projectDir, "app.js");
      writeFileSync(consumerCode, "console.log('consumer code');\n", "utf8");

      const blocked = runCli(["master", "implement", "--yes", "--phase=PHASE-01", "--task=TASK-001"], projectDir);
      assert.notEqual(blocked.status, 0);
      assert.match(blocked.stdout, /SDD Master — Implement Guard/);
      assert.match(blocked.stdout, /Status:\s+Bloqueado/);
      assert.match(blocked.stdout, /Discovery não criado/);
      assert.equal(readFileSync(consumerCode, "utf8"), "console.log('consumer code');\n");
      assert.equal(existsSync(join(projectDir, ".sdd-master", "implementation", "IMPLEMENT-001.md")), true);

      const json = JSON.parse(
        runCli(["master", "implement", "--json", "--yes", "--phase=PHASE-01", "--target=TASK-001"], projectDir).stdout
      );
      assert.equal(json.status, "blocked");
      assert.equal(json.mode, "guard");
      assert.equal(json.phase, "PHASE-01");
      assert.equal(json.task, "TASK-001");
      assert.equal(json.ready, false);
      assert.equal(json.codeChanged, false);
      assert.equal(Array.isArray(json.gates), true);
      assert.equal(Array.isArray(json.nextActions), true);

      const discoveryOnly = runCli(["master", "discovery", "--yes", "--title=Projeto"], projectDir);
      assert.equal(discoveryOnly.status, 0);
      const missingRequirements = JSON.parse(
        runCli(["master", "implement", "--json", "--yes", "--phase=PHASE-01", "--task=TASK-001"], projectDir).stdout
      );
      assert.equal(missingRequirements.blockers.includes("Requirements não criados"), true);

      assert.equal(runCli(["master", "requirements", "--yes", "--title=Requisitos"], projectDir).status, 0);
      const missingSpec = JSON.parse(
        runCli(["master", "implement", "--json", "--yes", "--phase=PHASE-01", "--task=TASK-001"], projectDir).stdout
      );
      assert.equal(missingSpec.blockers.includes("Spec não criada"), true);

      assert.equal(runCli(["master", "spec", "--yes", "--phase=PHASE-01", "--title=Spec"], projectDir).status, 0);
      const missingPlan = JSON.parse(
        runCli(["master", "implement", "--json", "--yes", "--phase=PHASE-01", "--task=TASK-001"], projectDir).stdout
      );
      assert.equal(missingPlan.blockers.includes("Plan não criado"), true);

      assert.equal(runCli(["master", "plan", "--yes", "--phase=PHASE-01", "--title=Plan"], projectDir).status, 0);
      const missingTasks = JSON.parse(
        runCli(["master", "implement", "--json", "--yes", "--phase=PHASE-01", "--task=TASK-001"], projectDir).stdout
      );
      assert.equal(missingTasks.blockers.includes("Tasks não criadas"), true);

      assert.equal(runCli(["master", "tasks", "--yes", "--phase=PHASE-01", "--title=Tasks"], projectDir).status, 0);
      const missingApprovalsAndTests = JSON.parse(
        runCli(["master", "implement", "--json", "--yes", "--phase=PHASE-01", "--task=TASK-001"], projectDir).stdout
      );
      assert.equal(missingApprovalsAndTests.blockers.includes("Aprovação de tasks pendente"), true);
      assert.equal(
        missingApprovalsAndTests.blockers.includes("Testes obrigatórios antes da implementação não definidos"),
        true
      );

      const taskPath = join(projectDir, ".sdd-master", "tasks", "TASK-001.md");
      const taskContent = readFileSync(taskPath, "utf8").replace(
        "## Testes obrigatórios antes da implementação\n-",
        "## Testes obrigatórios antes da implementação\n- npm test"
      );
      writeFileSync(taskPath, taskContent, "utf8");

      const testsOk = JSON.parse(
        runCli(["master", "implement", "--json", "--yes", "--phase=PHASE-01", "--task=TASK-001"], projectDir).stdout
      );
      assert.equal(testsOk.gates.find((gate) => gate.gate === "Test gates")?.status, "OK");
      assert.equal(testsOk.blockers.includes("Testes obrigatórios antes da implementação não definidos"), false);

      for (const target of ["discovery", "requirements", "spec", "plan", "tasks"]) {
        assert.equal(
          runCli(
            [
              "master",
              "approve",
              "--yes",
              `--target=${target}`,
              "--phase=PHASE-01",
              "--decision=approved",
              `--reason=${target} aprovado.`
            ],
            projectDir
          ).status,
          0
        );
      }

      assert.equal(
        runCli(["master", "clarify", "--yes", "--title=Dúvida aberta", "--phase=PHASE-01"], projectDir).status,
        0
      );
      const withClarification = JSON.parse(
        runCli(["master", "implement", "--json", "--yes", "--phase=PHASE-01", "--task=TASK-001"], projectDir).stdout
      );
      assert.equal(withClarification.blockers.includes("Clarificações abertas"), true);
      assert.equal(
        runCli(
          [
            "master",
            "clarify",
            "--yes",
            "--id=CLARIFY-001",
            "--status=resolved",
            "--reason=Resolvida."
          ],
          projectDir
        ).status,
        0
      );

      assert.equal(
        runCli(["master", "scope", "--yes", "--type=change", "--title=Mudança aberta", "--phase=PHASE-01"], projectDir)
          .status,
        0
      );
      const withScopeChange = JSON.parse(
        runCli(["master", "implement", "--json", "--yes", "--phase=PHASE-01", "--task=TASK-001"], projectDir).stdout
      );
      assert.equal(withScopeChange.blockers.includes("Mudanças de escopo abertas"), true);

      assert.equal(
        runCli(["master", "blocker", "--yes", "--title=Bloqueio", "--phase=PHASE-01"], projectDir).status,
        0
      );
      const withBlocker = JSON.parse(
        runCli(["master", "implement", "--json", "--yes", "--phase=PHASE-01", "--task=TASK-001"], projectDir).stdout
      );
      assert.equal(withBlocker.blockers.includes("Blockers ativos"), true);

      assert.equal(
        runCli(["master", "audit", "--yes", "--severity=BLOCKER", "--title=Audit blocker", "--phase=PHASE-01"], projectDir)
          .status,
        0
      );
      const withAudit = JSON.parse(
        runCli(["master", "implement", "--json", "--yes", "--phase=PHASE-01", "--task=TASK-001"], projectDir).stdout
      );
      assert.equal(withAudit.blockers.includes("Auditoria BLOCKER aberta"), true);

      assert.equal(
        runCli(["master", "quality", "--yes", "--status=failed", "--title=Quality failed", "--phase=PHASE-01"], projectDir)
          .status,
        0
      );
      const withQuality = JSON.parse(
        runCli(["master", "implement", "--json", "--yes", "--phase=PHASE-01", "--task=TASK-001"], projectDir).stdout
      );
      assert.equal(withQuality.blockers.includes("Quality review failed aberta"), true);

      assert.equal(
        runCli(["master", "docs", "--yes", "--status=outdated", "--title=Docs outdated", "--phase=PHASE-01"], projectDir)
          .status,
        0
      );
      const withDocs = JSON.parse(
        runCli(["master", "implement", "--json", "--yes", "--phase=PHASE-01", "--task=TASK-001"], projectDir).stdout
      );
      assert.equal(withDocs.blockers.includes("Documentação desatualizada"), true);

      const implementFile = readFileSync(join(projectDir, ".sdd-master", "implementation", "IMPLEMENT-001.md"), "utf8");
      assert.match(implementFile, /## Gates verificados/);
      assert.match(implementFile, /\| Test gates \|/);
      assert.match(implementFile, /Este registro não executa implementação/);
      assert.equal(readFileSync(consumerCode, "utf8"), "console.log('consumer code');\n");

      const status = runCli(["master", "status"], projectDir);
      assert.equal(status.status, 0);
      assert.match(status.stdout, /Implement Guard:/);
      assert.match(status.stdout, /Código alterado pelo implement: Não/);

      const doctorJson = JSON.parse(runCli(["master", "doctor", "--json"], projectDir).stdout);
      assert.equal(typeof doctorJson.implementGuard, "object");
      assert.equal(doctorJson.implementGuard.codeChanged, false);
      assert.equal(doctorJson.implementGuard.hasRecords, true);

      assert.equal(existsSync(join(projectDir, ".env")), false);
      const implementationContent = readFileSync(
        join(projectDir, ".sdd-master", "implementation", "IMPLEMENT-001.md"),
        "utf8"
      );
      assert.doesNotMatch(implementationContent, /sk-[A-Za-z0-9_-]{20,}|BEGIN (RSA |EC |OPENSSH |)PRIVATE KEY/);
    });

    assert.equal(existsSync(join(rootDir, ".sdd-master")), false);
    assert.equal(existsSync(join(rootDir, "SDD Master Roadmap.pdf")), true);
    assert.equal(existsSync(join(rootDir, "SDD Master — Checklist de Implementação v0.1.pdf")), true);
    assert.equal(existsSync(join(rootDir, "SDD Master — Documento Mestre v0.1.pdf")), true);

    const prePush = runCli(["master", "git", "--pre-push"], rootDir);
    assert.notEqual(prePush.stdout, "");
    assert.doesNotMatch(prePush.stdout, /Status geral:\s+blocked/);
  });

  it("implements release and deploy guards without publishing or deploying", () => {
    withTempProject((projectDir) => {
      const releaseWithoutInit = runCli(["master", "release"], projectDir);
      const deployWithoutInit = runCli(["master", "deploy"], projectDir);

      assert.notEqual(releaseWithoutInit.status, 0);
      assert.notEqual(deployWithoutInit.status, 0);
      assert.match(releaseWithoutInit.stderr, /SDD Master não inicializado/);
      assert.match(deployWithoutInit.stderr, /SDD Master não inicializado/);

      const releaseHelp = runCli(["master", "release", "--help"], projectDir);
      const deployHelp = runCli(["master", "deploy", "--help"], projectDir);
      const releaseMasterHelp = runCli(["master", "help", "release"], projectDir);
      const deployMasterHelp = runCli(["master", "help", "deploy"], projectDir);

      assert.equal(releaseHelp.status, 0);
      assert.equal(deployHelp.status, 0);
      assert.equal(releaseMasterHelp.status, 0);
      assert.equal(deployMasterHelp.status, 0);
      assert.match(releaseHelp.stdout, /não cria tag/);
      assert.match(releaseHelp.stdout, /não publica npm/);
      assert.match(deployHelp.stdout, /não executa deploy real/);
      assert.match(deployHelp.stdout, /não acessa servidor/);

      const init = initTempProject(projectDir);
      assert.equal(init.status, 0, init.stderr);
      assert.equal(runGit(["init"], projectDir).status, 0);
      const tagsBefore = runGit(["tag", "--list"], projectDir).stdout;

      const release = runCli(
        [
          "master",
          "release",
          "--yes",
          "--phase=PHASE-01",
          "--version=0.3.0-alpha",
          "--channel=alpha",
          "--type=local",
          "--dry-run",
          "--json"
        ],
        projectDir
      );
      const deploy = runCli(
        [
          "master",
          "deploy",
          "--yes",
          "--phase=PHASE-01",
          "--environment=staging",
          "--provider=vercel",
          "--strategy=serverless",
          "--dry-run",
          "--json"
        ],
        projectDir
      );
      const deployProduction = runCli(
        ["master", "deploy", "--yes", "--environment=production", "--dry-run", "--json"],
        projectDir
      );
      const tagsAfter = runGit(["tag", "--list"], projectDir).stdout;

      assert.notEqual(release.status, 0);
      assert.notEqual(deploy.status, 0);
      assert.notEqual(deployProduction.status, 0);

      const releaseJson = JSON.parse(release.stdout);
      const deployJson = JSON.parse(deploy.stdout);
      const productionJson = JSON.parse(deployProduction.stdout);

      assert.equal(releaseJson.tagCreated, false);
      assert.equal(releaseJson.published, false);
      assert.equal(releaseJson.githubReleaseCreated, false);
      assert.equal(deployJson.deployed, false);
      assert.equal(deployJson.serverAccessed, false);
      assert.equal(deployJson.remoteScriptsExecuted, false);
      assert.equal(productionJson.status, "blocked");
      assert.equal(productionJson.blockers.includes("Deploy production exige aprovação humana explícita."), true);
      assert.equal(tagsAfter, tagsBefore);

      const releaseFile = join(projectDir, ".sdd-master", "releases", "RELEASE-001.md");
      const releaseChecklist = join(
        projectDir,
        ".sdd-master",
        "releases",
        "checklists",
        "RELEASE-CHECKLIST-001.md"
      );
      const deployFile = join(projectDir, ".sdd-master", "deliveries", "DEPLOY-001.md");
      const deployChecklist = join(
        projectDir,
        ".sdd-master",
        "deliveries",
        "checklists",
        "DEPLOY-CHECKLIST-001.md"
      );

      assert.equal(existsSync(releaseFile), true);
      assert.equal(existsSync(releaseChecklist), true);
      assert.equal(existsSync(deployFile), true);
      assert.equal(existsSync(deployChecklist), true);

      const releaseContent = readFileSync(releaseFile, "utf8");
      const deployContent = readFileSync(deployFile, "utf8");
      assert.match(releaseContent, /Este comando não cria tag, não publica npm e não publica GitHub Release/);
      assert.match(deployContent, /Este comando não executa deploy real/);
      assert.doesNotMatch(deployContent, /\b(ssh|ftp|sftp|rsync|scp)\b/i);
      assert.match(deployContent, /NODE_ENV/);
      assert.match(deployContent, /APP_ENV/);
      assert.doesNotMatch(deployContent, /NODE_ENV=/);
      assert.doesNotMatch(deployContent, /APP_ENV=/);

      const status = runCli(["master", "status"], projectDir);
      assert.equal(status.status, 0);
      assert.match(status.stdout, /Release:/);
      assert.match(status.stdout, /Deploy:/);

      const doctor = runCli(["master", "doctor", "--json"], projectDir);
      assert.equal(doctor.status, 0);
      const doctorJson = JSON.parse(doctor.stdout);
      assert.equal(typeof doctorJson.delivery.release, "object");
      assert.equal(typeof doctorJson.delivery.deploy, "object");

      assert.equal(existsSync(join(projectDir, ".env")), false);
      const allDeliveryText = `${releaseContent}\n${deployContent}`;
      assert.doesNotMatch(allDeliveryText, /sk-[A-Za-z0-9_-]{20,}|BEGIN (RSA |EC |OPENSSH |)PRIVATE KEY/);
      assert.equal(existsSync(join(rootDir, ".sdd-master")), false);
    });
  });

  it("includes local prototype release checks and documentation", () => {
    const packageJson = JSON.parse(readFileSync(join(rootDir, "package.json"), "utf8"));
    const releaseDoc = readFileSync(join(rootDir, "releases", "v0.1.0-prototype.md"), "utf8");
    const githubReleaseDoc = readFileSync(join(rootDir, "releases", "github-v0.1.0-prototype.md"), "utf8");
    const githubReleaseNotes = readFileSync(
      join(rootDir, "releases", "github-v0.1.0-prototype-notes.md"),
      "utf8"
    );
    const releaseDocCurrent = readFileSync(join(rootDir, "releases", "v0.1.0-prototype.1.md"), "utf8");
    const githubReleaseDocCurrent = readFileSync(
      join(rootDir, "releases", "github-v0.1.0-prototype.1.md"),
      "utf8"
    );
    const githubReleaseNotesCurrent = readFileSync(
      join(rootDir, "releases", "github-v0.1.0-prototype.1-notes.md"),
      "utf8"
    );
    const releaseDocV020 = readFileSync(join(rootDir, "releases", "v0.2.0-prototype.md"), "utf8");
    const githubReleaseDocV020 = readFileSync(join(rootDir, "releases", "github-v0.2.0-prototype.md"), "utf8");
    const githubReleaseNotesV020 = readFileSync(
      join(rootDir, "releases", "github-v0.2.0-prototype-notes.md"),
      "utf8"
    );
    const finalAuditV020 = readFileSync(join(rootDir, "releases", "v0.2.0-prototype-final-audit.md"), "utf8");
    const commandInventoryV020 = readFileSync(
      join(rootDir, "docs", "03-codigo", "inventario-comandos-0.2.0.md"),
      "utf8"
    );
    const maturityMatrix = readFileSync(
      join(rootDir, "docs", "01-negocio-requisitos", "maturidade-sdd-master.md"),
      "utf8"
    );
    const alphaRoadmap = readFileSync(
      join(rootDir, "docs", "01-negocio-requisitos", "roadmap-0.3.0-alpha.md"),
      "utf8"
    );
    const securityAuditV020 = readFileSync(
      join(rootDir, "docs", "02-tecnica-arquitetura", "auditoria-seguranca-0.2.0.md"),
      "utf8"
    );
    const githubReleaseChecklist = readFileSync(
      join(rootDir, "docs", "03-codigo", "checklist-github-release.md"),
      "utf8"
    );
    const npmPublishChecklist = readFileSync(
      join(rootDir, "docs", "03-codigo", "checklist-publicacao-npm.md"),
      "utf8"
    );
    const releaseAudit = readFileSync(join(rootDir, "releases", "v0.1.0-prototype-audit.md"), "utf8");
    const releaseLocal = readFileSync(join(rootDir, "docs", "03-codigo", "release-local.md"), "utf8");
    const npmPublish = readFileSync(join(rootDir, "docs", "03-codigo", "publicacao-npm.md"), "utf8");
    const readme = readFileSync(join(rootDir, "README.md"), "utf8");
    const changelog = readFileSync(join(rootDir, "CHANGELOG.md"), "utf8");

    assert.equal(existsSync(join(rootDir, "scripts", "release-check.mjs")), true);
    assert.equal(packageJson.scripts["release:check"], "node scripts/release-check.mjs");
    assert.equal(packageJson.version, "0.2.0-prototype");
    assert.equal(packageJson.publishConfig?.access, "public");
    assert.equal(packageJson.publishConfig?.tag, "prototype");
    assert.equal(packageJson.repository?.url, "git+https://github.com/Ald3b4r4n/sdd-master.git");
    assert.equal(packageJson.bugs?.url, "https://github.com/Ald3b4r4n/sdd-master/issues");
    assert.equal(packageJson.homepage, "https://github.com/Ald3b4r4n/sdd-master#readme");
    assert.equal(packageJson.keywords.includes("sdd"), true);
    assert.equal(packageJson.keywords.includes("ai-agents"), true);
    assert.match(packageJson.scripts.check, /npm run release:check/);

    assert.equal(existsSync(join(rootDir, "releases", "v0.1.0-prototype.md")), true);
    assert.equal(existsSync(join(rootDir, "releases", "github-v0.1.0-prototype.md")), true);
    assert.equal(existsSync(join(rootDir, "releases", "github-v0.1.0-prototype-notes.md")), true);
    assert.equal(existsSync(join(rootDir, "releases", "v0.1.0-prototype.1.md")), true);
    assert.equal(existsSync(join(rootDir, "releases", "github-v0.1.0-prototype.1.md")), true);
    assert.equal(existsSync(join(rootDir, "releases", "github-v0.1.0-prototype.1-notes.md")), true);
    assert.equal(existsSync(join(rootDir, "releases", "v0.2.0-prototype.md")), true);
    assert.equal(existsSync(join(rootDir, "releases", "v0.2.0-prototype-final-audit.md")), true);
    assert.equal(existsSync(join(rootDir, "releases", "github-v0.2.0-prototype.md")), true);
    assert.equal(existsSync(join(rootDir, "releases", "github-v0.2.0-prototype-notes.md")), true);
    assert.equal(existsSync(join(rootDir, "docs", "03-codigo", "inventario-comandos-0.2.0.md")), true);
    assert.equal(existsSync(join(rootDir, "docs", "01-negocio-requisitos", "maturidade-sdd-master.md")), true);
    assert.equal(existsSync(join(rootDir, "docs", "01-negocio-requisitos", "roadmap-0.3.0-alpha.md")), true);
    assert.equal(existsSync(join(rootDir, "docs", "02-tecnica-arquitetura", "auditoria-seguranca-0.2.0.md")), true);
    assert.equal(existsSync(join(rootDir, "releases", "v0.1.0-prototype-audit.md")), true);
    assert.equal(existsSync(join(rootDir, "docs", "03-codigo", "checklist-github-release.md")), true);
    assert.equal(existsSync(join(rootDir, "docs", "03-codigo", "checklist-publicacao-npm.md")), true);
    assert.match(releaseDoc, /Prototype/);
    assert.match(releaseDoc, /Push: não realizado/);
    assert.match(releaseDoc, /npm publish: não realizado/);
    assert.match(releaseDoc, /v0\.1\.0-prototype/);
    assert.match(githubReleaseDoc, /v0\.1\.0-prototype/);
    assert.match(githubReleaseDoc, /Prototype/);
    assert.match(githubReleaseDoc, /Real npm publication/);
    assert.doesNotMatch(githubReleaseDoc, /\.env/);
    assert.doesNotMatch(githubReleaseDoc, /tokens|segredos/i);
    assert.match(githubReleaseNotes, /v0\.1\.0-prototype/);
    assert.match(githubReleaseNotes, /Draft prepared/);
    assert.match(githubReleaseNotes, /Real npm publication/);
    assert.doesNotMatch(githubReleaseNotes, /\.env/);
    assert.doesNotMatch(githubReleaseNotes, /tokens|segredos/i);
    assert.match(releaseDocCurrent, /0\.1\.0-prototype\.1/);
    assert.match(releaseDocCurrent, /v0\.1\.0-prototype\.1/);
    assert.match(releaseDocCurrent, /sem mover ou reescrever histórico Git/);
    assert.match(releaseDocCurrent, /npm install -g sdd-master@prototype/);
    assert.match(releaseDocCurrent, /npm publish: realizado/);
    assert.match(releaseDocCurrent, /latest.*0\.1\.0-prototype\.1/);
    assert.match(releaseDocCurrent, /bloqueou a remoção de `latest`/);
    assert.match(releaseDocCurrent, /npm install -g sdd-master/);
    assert.match(githubReleaseDocCurrent, /v0\.1\.0-prototype\.1/);
    assert.match(githubReleaseDocCurrent, /v0\.1\.0-prototype/);
    assert.match(githubReleaseDocCurrent, /Real npm publication/);
    assert.doesNotMatch(githubReleaseDocCurrent, /\.env/);
    assert.doesNotMatch(githubReleaseDocCurrent, /tokens|segredos/i);
    assert.match(githubReleaseNotesCurrent, /v0\.1\.0-prototype\.1/);
    assert.match(githubReleaseNotesCurrent, /without rewriting Git history/);
    assert.match(githubReleaseNotesCurrent, /Real npm publication/);
    assert.doesNotMatch(githubReleaseNotesCurrent, /\.env/);
    assert.doesNotMatch(githubReleaseNotesCurrent, /tokens|segredos/i);
    assert.match(githubReleaseChecklist, /gh release create/);
    assert.match(githubReleaseChecklist, /aprovação humana explícita/);
    assert.match(githubReleaseChecklist, /v0\.2\.0-prototype/);
    assert.match(githubReleaseChecklist, /v0\.1\.0-prototype\.1/);
    assert.match(npmPublishChecklist, /npm publish --access public --tag prototype/);
    assert.match(npmPublishChecklist, /aprovação humana explícita/);
    assert.match(npmPublishChecklist, /0\.2\.0-prototype/);
    assert.match(npmPublishChecklist, /npm install -g sdd-master@prototype/);
    assert.match(releaseAudit, /v0\.1\.0-prototype/);
    assert.match(releaseAudit, /npm publish dry-run/);
    assert.match(releaseAudit, /npm publish real: não executado/);

    assert.match(releaseLocal, /release local/i);
    assert.match(releaseLocal, /não publicar automaticamente/i);
    assert.match(releaseLocal, /tag npm configurada é `prototype`/);
    assert.match(releaseLocal, /0\.2\.0-prototype/);
    assert.match(releaseLocal, /gh release create/);
    assert.match(releaseLocal, /aprovação humana/i);
    assert.match(npmPublish, /npm publish --dry-run --access public --tag prototype/);
    assert.match(npmPublish, /tag npm `prototype`/);
    assert.match(npmPublish, /0\.2\.0-prototype/);
    assert.match(npmPublish, /--tag prototype/);
    assert.match(npmPublish, /npm install -g sdd-master@prototype/);
    assert.match(npmPublish, /aprovação humana/i);
    assert.match(readme, /0\.2\.0-prototype/);
    assert.match(readme, /0\.3\.0-alpha/);
    assert.match(readme, /histórico Git/);
    assert.match(readme, /sem reescrita/);
    assert.match(readme, /npm run release:check/);
    assert.match(readme, /## GitHub Release/);
    assert.match(readme, /npm install -g sdd-master@prototype/);
    assert.match(readme, /O que mudou em 0\.2\.0-prototype/);
    assert.match(readme, /publicação npm prototype/);
    assert.match(readme, /--tag prototype/);
    assert.match(readme, /GitHub Release/);
    assert.match(readme, /aprovação humana explícita/);
    assert.match(changelog, /## \[0\.2\.0-prototype\] - 2026-06-13/);
    assert.match(changelog, /Auditoria final da fase `0\.2\.0-prototype`/);
    assert.match(changelog, /sdd master update/);
    assert.match(changelog, /Esta versão continua sendo prototype/);
    assert.match(releaseDocV020, /0\.2\.0-prototype/);
    assert.match(releaseDocV020, /Workflow SDD inicial/);
    assert.match(releaseDocV020, /Update seguro/);
    assert.match(releaseDocV020, /npm publish real: executado/);
    assert.match(githubReleaseDocV020, /prerelease/i);
    assert.match(githubReleaseDocV020, /v0\.2\.0-prototype/);
    assert.match(githubReleaseNotesV020, /Workflow SDD inicial/);
    assert.match(githubReleaseNotesV020, /Implement guard/i);
    assert.match(githubReleaseNotesV020, /Update seguro/);
    assert.match(githubReleaseNotesV020, /prototype/i);
    assert.match(finalAuditV020, /0\.2\.0-prototype/);
    assert.match(finalAuditV020, /npm publicado/);
    assert.match(finalAuditV020, /GitHub prerelease/);
    assert.match(commandInventoryV020, /sdd master update/);
    assert.match(commandInventoryV020, /sdd master implement/);
    assert.match(commandInventoryV020, /sdd master skills/);
    assert.match(commandInventoryV020, /sdd master uiux/);
    assert.match(maturityMatrix, /0\.3\.0-alpha/);
    assert.match(alphaRoadmap, /Uso real em projeto consumidor/);
    assert.match(securityAuditV020, /strict-ssl/);

    const reviewedFiles = [
      releaseDoc,
      githubReleaseDoc,
      githubReleaseNotes,
      releaseDocCurrent,
      githubReleaseDocCurrent,
      githubReleaseNotesCurrent,
      releaseDocV020,
      finalAuditV020,
      githubReleaseDocV020,
      githubReleaseNotesV020,
      commandInventoryV020,
      maturityMatrix,
      alphaRoadmap,
      securityAuditV020,
      githubReleaseChecklist,
      npmPublishChecklist,
      releaseAudit,
      releaseLocal,
      npmPublish,
      readme,
      changelog
    ].join("\n");
    assert.doesNotMatch(reviewedFiles, /sk-[A-Za-z0-9_-]{20,}/);
    assert.doesNotMatch(reviewedFiles, /BEGIN (RSA |EC |OPENSSH |)PRIVATE KEY/);
  });

  it("release check passes after build and blocks wrong package versions", () => {
    const releaseCheck = runNpmScript("release:check");

    assert.equal(releaseCheck.status, 0, releaseCheck.stderr || releaseCheck.stdout);
    assert.match(releaseCheck.stdout, /Release check passed/);

    withTempProject((projectDir) => {
      writeFileSync(
        join(projectDir, "package.json"),
        JSON.stringify(
          {
            name: "sdd-master-test",
            version: "0.0.0",
            license: "MIT",
            bin: { sdd: "./dist/cli/main.js" }
          },
          null,
          2
        ),
        "utf8"
      );

      const result = spawnSync(process.execPath, [join(rootDir, "scripts", "release-check.mjs")], {
        cwd: projectDir,
        encoding: "utf8"
      });

      assert.notEqual(result.status, 0);
      assert.match(result.stderr, /version must be 0\.2\.0-prototype/);
    });
  });

  it("includes public GitHub repository templates and safe CI", () => {
    const ci = readFileSync(join(rootDir, ".github", "workflows", "ci.yml"), "utf8");
    const prTemplate = readFileSync(join(rootDir, ".github", "pull_request_template.md"), "utf8");
    const contributing = readFileSync(join(rootDir, "CONTRIBUTING.md"), "utf8");
    const security = readFileSync(join(rootDir, "SECURITY.md"), "utf8");
    const readme = readFileSync(join(rootDir, "README.md"), "utf8");
    const localDevelopment = readFileSync(
      join(rootDir, "docs", "03-codigo", "desenvolvimento-local.md"),
      "utf8"
    );

    const issueTemplates = [
      ".github/ISSUE_TEMPLATE/bug_report.md",
      ".github/ISSUE_TEMPLATE/feature_request.md",
      ".github/ISSUE_TEMPLATE/documentation_request.md",
      ".github/ISSUE_TEMPLATE/skill_request.md",
      ".github/ISSUE_TEMPLATE/security_notice.md"
    ];

    assert.match(ci, /^name: CI/m);
    assert.match(ci, /pull_request:/);
    assert.match(ci, /push:/);
    assert.match(ci, /branches:\n\s+- main/);
    assert.match(ci, /ubuntu-latest/);
    assert.match(ci, /node-version: "20"/);
    assert.match(ci, /run: npm ci/);
    assert.match(ci, /run: npm run build/);
    assert.match(ci, /run: npm test/);
    assert.match(ci, /run: npm run smoke/);
    assert.match(ci, /run: npm run package:check/);
    assert.match(ci, /run: npm run pack:dry-run/);
    assert.match(ci, /run: npm run check/);
    assert.match(ci, /permissions:\n\s+contents: read/);
    assert.doesNotMatch(ci, /npm publish/);
    assert.doesNotMatch(ci, /\bdeploy\b/i);
    assert.doesNotMatch(ci, /secrets\./i);
    assert.doesNotMatch(ci, /contents: write/);

    assert.equal(existsSync(join(rootDir, ".github", "pull_request_template.md")), true);
    assert.match(prTemplate, /npm run check/);
    assert.match(prTemplate, /real `\.env`/);
    assert.match(prTemplate, /secrets, tokens, credentials/);

    for (const template of issueTemplates) {
      const content = readFileSync(join(rootDir, template), "utf8");
      assert.equal(content.trim().length > 0, true, `${template} should not be empty`);
      assert.match(content, /Do not|Não|do not/i);
      assert.match(content, /tokens|segredo|Secret|secret/i);
    }

    assert.match(contributing, /npm run check/);
    assert.match(contributing, /tipo\(phase-XX\): descrição/);
    assert.match(security, /Security contact: to be defined before the first public release\./);
    assert.match(security, /\.env/);
    assert.match(security, /tokens/);
    assert.match(security, /dados sensíveis|dados pessoais/);
    assert.match(readme, /## Contribuição e GitHub/);
    assert.match(readme, /Nunca publique `.env`, tokens, credenciais/);
    assert.match(localDevelopment, /## Simulando o CI localmente/);
    assert.match(localDevelopment, /npm run check/);

    assert.equal(existsSync(join(rootDir, "SDD Master Roadmap.pdf")), true);
    assert.equal(
      existsSync(join(rootDir, "SDD Master — Checklist de Implementação v0.1.pdf")),
      true
    );
    assert.equal(existsSync(join(rootDir, "SDD Master — Documento Mestre v0.1.pdf")), true);

    const reviewedFiles = [
      ci,
      prTemplate,
      contributing,
      security,
      readme,
      localDevelopment,
      ...issueTemplates.map((template) => readFileSync(join(rootDir, template), "utf8"))
    ].join("\n");

    assert.doesNotMatch(reviewedFiles, /sk-[A-Za-z0-9_-]{20,}/);
    assert.doesNotMatch(reviewedFiles, /BEGIN (RSA |EC |OPENSSH |)PRIVATE KEY/);
  });
});
