const replacements: RegExp[] = [
  /-----BEGIN [A-Z ]*PRIVATE KEY-----[\s\S]*?-----END [A-Z ]*PRIVATE KEY-----/gi,
  /\bBearer\s+[A-Za-z0-9._~+/-]{8,}=*\b/gi,
  /\bgh[pousr]_[A-Za-z0-9_]{20,}\b/g,
  /\bnpm_[A-Za-z0-9]{20,}\b/g,
  /\bAKIA[0-9A-Z]{12,}\b/g,
  /\beyJ[A-Za-z0-9_-]{6,}\.[A-Za-z0-9_-]{6,}\.[A-Za-z0-9_-]{6,}\b/g,
  /\b(?:sk_live_|sk_test_|sk-proj-|AIza)[A-Za-z0-9_=-]{8,}\b/g,
  /\b[A-Za-z0-9_-]{40,}\b/g,
  /((?:password|token|secret|api_key|apikey|private_key)\s*[:=]\s*)(?!\[REDACTED\])["']?[^"'\s,;]+["']?/gi
];

export function redactSensitiveText(value: string): string {
  return replacements.reduce(
    (redacted, pattern) =>
      redacted.replace(pattern, (match, prefix?: string) => (prefix ? `${prefix}[REDACTED]` : "[REDACTED]")),
    value
  );
}

export function containsUnredactedSensitiveText(value: string): boolean {
  return redactSensitiveText(value) !== value;
}
