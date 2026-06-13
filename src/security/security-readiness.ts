import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { containsUnredactedSensitiveText } from "./redaction.js";
import { notRequestedTool } from "./external-tools.js";
import type { SecurityState } from "./security-types.js";

export function getAdvancedSecurityState(cwd: string): SecurityState {
  const root = join(cwd, ".sdd-master", "security");
  if (!existsSync(root)) {
    return {
      status: "not-started",
      policy: "not-started",
      builtin: "not-started",
      externalTools: "not-started",
      gitleaks: notRequestedTool("gitleaks"),
      trufflehog: notRequestedTool("trufflehog"),
      lastReport: "não iniciado",
      lastAudit: "não iniciado",
      redaction: "not-started",
      unredactedOutput: false,
      blockers: [],
      warnings: []
    };
  }

  const reportPath = latestFile(root, "reports", "SECURITY-REPORT-");
  const auditPath = latestFile(root, "audits", "SECURITY-AUDIT-");
  const toolsPath = latestFile(root, "external-tools", "EXTERNAL-TOOLS-");
  const report = reportPath ? readFileSync(join(root, "reports", reportPath), "utf8") : "";
  const audit = auditPath ? readFileSync(join(root, "audits", auditPath), "utf8") : "";
  const tools = toolsPath ? readFileSync(join(root, "external-tools", toolsPath), "utf8") : "";
  const unredactedOutput = [report, audit, tools].some((content) => content && containsUnredactedSensitiveText(content));
  const reportBlocked = /## Resultado\s*\r?\nblocked/i.test(report);
  const auditBlocked = /## Decisão\s*\r?\nBloqueado/i.test(audit);
  const blockers = [
    ...(reportBlocked ? ["Último relatório de segurança está blocked."] : []),
    ...(auditBlocked ? ["Última auditoria de segurança está bloqueada."] : []),
    ...(unredactedOutput ? ["Saída sensível não redigida detectada em artefato de segurança."] : [])
  ];
  const availability = parseAvailability(tools);
  const warnings = [
    ...(!reportPath && !auditPath ? ["Segurança avançada ainda não executada."] : []),
    ...(!existsSync(join(root, "security-policy.md")) ? ["Security policy ausente."] : []),
    ...(availability === "missing" ? ["Ferramentas externas ausentes; integração continua opcional."] : [])
  ];

  return {
    status: blockers.length > 0 ? "blocked" : warnings.length > 0 ? "warning" : "clean",
    policy: existsSync(join(root, "security-policy.md")) ? "OK" : "missing",
    builtin: /- builtin:\s*blocked/i.test(report) ? "blocked" : reportPath ? "clean" : "not-started",
    externalTools: availability,
    gitleaks: notRequestedTool("gitleaks"),
    trufflehog: notRequestedTool("trufflehog"),
    lastReport: reportPath?.replace(".md", "") ?? "não iniciado",
    lastAudit: auditPath?.replace(".md", "") ?? "não iniciado",
    redaction: unredactedOutput ? "broken" : reportPath || auditPath ? "enabled" : "not-started",
    unredactedOutput,
    blockers,
    warnings
  };
}

export function formatSecurityHandoff(cwd: string): string {
  const state = getAdvancedSecurityState(cwd);
  return `- Último relatório de segurança: ${state.lastReport}
- Scanner externo usado: ${state.externalTools === "not-started" ? "Não" : "Consultar relatório de ferramentas"}
- Redaction: ${state.redaction}
- Pendências: ${state.blockers.length > 0 ? state.blockers.join("; ") : state.warnings.join("; ") || "Nenhuma"}`;
}

function latestFile(root: string, directory: string, prefix: string): string | undefined {
  const path = join(root, directory);
  if (!existsSync(path)) return undefined;
  return readdirSync(path)
    .filter((file) => file.startsWith(prefix) && file.endsWith(".md"))
    .sort()
    .at(-1);
}

function parseAvailability(content: string): SecurityState["externalTools"] {
  if (!content) return "not-started";
  const available = (content.match(/- Disponível:\s*Sim/g) ?? []).length;
  if (available === 2) return "available";
  if (available === 1) return "partial";
  return "missing";
}
