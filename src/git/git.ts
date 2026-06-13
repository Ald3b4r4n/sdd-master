import { runGitSecurityCheck } from "./git-checks.js";
import { formatGitSecurityJson, formatGitSecurityText } from "./git-report.js";
import type { GitMode } from "./git-types.js";

export function runGitCommand(cwd: string, args: string[]): { exitCode: number; output: string; error?: string } {
  if (args.includes("--help") || args.includes("-h")) {
    return { exitCode: 0, output: getGitHelp() };
  }

  const unknown = args.find((arg) => !["--json", "--pre-commit", "--pre-push"].includes(arg));
  if (unknown) return { exitCode: 1, output: "", error: `Opção desconhecida para git: ${unknown}\n` };

  const mode: GitMode = args.includes("--pre-push")
    ? "pre-push"
    : args.includes("--pre-commit")
      ? "pre-commit"
      : "default";
  const report = runGitSecurityCheck(cwd, mode);

  return {
    exitCode: 0,
    output: args.includes("--json") ? formatGitSecurityJson(report) : formatGitSecurityText(report)
  };
}

function getGitHelp(): string {
  return `sdd master git

Status:
  Disponível no BLOCO 07.

Finalidade:
  Diagnosticar Git e segurança local sem executar commit, push, tag ou release.

Uso:
  sdd master git
  sdd master git --json
  sdd master git --pre-commit
  sdd master git --pre-push

Bloqueia:
  .env real, arquivos sensíveis, segredos suspeitos, relatório avançado blocked,
  saída não redigida e .sdd-master/ pendente em pre-push.

Ferramentas externas:
  gitleaks/trufflehog ausentes não bloqueiam por padrão.

Segurança:
  Este comando não executa commit.
  Este comando não executa push.
  Push exige autorização humana explícita.
`;
}
