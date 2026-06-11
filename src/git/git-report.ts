import type { GitSecurityReport } from "./git-types.js";

export function formatGitSecurityJson(report: GitSecurityReport): string {
  return `${JSON.stringify(report, null, 2)}\n`;
}

export function formatGitSecurityText(report: GitSecurityReport): string {
  if (report.status === "blocked") {
    return `SDD Master — Git/Security Check

Status geral:
  blocked

Falhas críticas:
${report.blockers.map((blocker) => `- ${blocker}`).join("\n")}
${formatFindings(report)}

Ação obrigatória:
  Remova segredos e arquivos sensíveis antes de commit/push.
${report.mode === "pre-push" ? "\nEste comando não executa push.\nPush exige autorização humana explícita.\n" : ""}`;
  }

  return `SDD Master — Git/Security Check

Status geral:
  ${report.status}

Git:
  Repositório Git: ${report.git.isRepository ? "Sim" : "Não"}
  Branch atual: ${report.git.branch ?? "não detectado"}
  Remotos configurados: ${report.git.remotes.length > 0 ? "Sim" : "Não"}
  Arquivos alterados: ${report.git.modifiedFiles.length}
  Arquivos staged: ${report.git.stagedFiles.length}
  Arquivos untracked: ${report.git.untrackedFiles.length}

Segurança:
  .env real detectado: ${report.security.forbiddenFiles.some((file) => file === ".env" || file.startsWith(".env.")) ? "Sim" : "Não"}
  Arquivos sensíveis detectados: ${report.security.forbiddenFiles.length > 0 ? "Sim" : "Não"}
  Segredos suspeitos detectados: ${report.security.suspectedSecrets.length > 0 ? "Sim" : "Não"}
  .env.example seguro: ${formatEnvExample(report)}
  .gitignore: ${report.security.gitignore.missingEntries.length === 0 ? "OK" : "Atenção"}

SDD Master interno:
  .sdd-master/ staged: ${report.sddMaster.internalFilesStaged.length > 0 ? "Sim" : "Não"}

Decisão:
  ${report.status === "clean" ? "Nenhum bloqueio crítico encontrado." : "Atenções encontradas, mas sem bloqueio crítico."}
${report.mode === "pre-commit" ? "\nEste comando não executa commit.\n" : ""}${report.mode === "pre-push" ? "\nEste comando não executa push.\nPush exige autorização humana explícita.\n" : ""}`;
}

function formatFindings(report: GitSecurityReport): string {
  const forbidden = report.security.forbiddenFiles.map((file) => `\nArquivo sensível: ${file}`).join("");
  const secrets = report.security.suspectedSecrets
    .map(
      (finding) => `
Possível segredo detectado:
  Arquivo: ${finding.file}
  Linha: ${finding.line}
  Tipo: ${finding.type}
  Valor: [REDACTED]`
    )
    .join("\n");
  return `${forbidden}${secrets ? `\n${secrets}` : ""}`;
}

function formatEnvExample(report: GitSecurityReport): string {
  if (report.security.envExample.status === "not-found") return "Não encontrado";
  return report.security.envExample.status === "safe" ? "Sim" : "Não";
}
