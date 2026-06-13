import { findForbiddenFiles } from "./sensitive-files.js";
import { scanForSecrets } from "./secret-scan.js";
import type { SecurityFinding } from "./security-types.js";

export function runBuiltinSecurity(cwd: string): {
  status: "clean" | "blocked";
  findings: SecurityFinding[];
  blockers: string[];
} {
  const forbidden = findForbiddenFiles(cwd);
  const secrets = scanForSecrets(cwd);
  const findings: SecurityFinding[] = [
    ...forbidden.map((file) => ({
      type: "Arquivo sensível/proibido",
      severity: "CRITICAL" as const,
      file,
      value: "[REDACTED]" as const
    })),
    ...secrets.map((finding) => ({
      type: finding.type,
      severity: "HIGH" as const,
      file: finding.file,
      value: "[REDACTED]" as const
    }))
  ];
  return {
    status: findings.length > 0 ? "blocked" : "clean",
    findings,
    blockers: [
      ...(forbidden.length > 0 ? ["Arquivo sensível/proibido detectado."] : []),
      ...(secrets.length > 0 ? ["Possível segredo detectado."] : [])
    ]
  };
}
