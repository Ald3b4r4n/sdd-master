export type SecretPattern = {
  id: string;
  label: string;
  pattern: RegExp;
};

export const secretPatterns: SecretPattern[] = [
  { id: "stripe-live", label: "Stripe live key", pattern: /sk_live_[A-Za-z0-9_=-]+/ },
  { id: "stripe-test", label: "Stripe test key", pattern: /sk_test_[A-Za-z0-9_=-]+/ },
  { id: "openai-project", label: "OpenAI project key", pattern: /sk-proj-[A-Za-z0-9_-]{8,}/ },
  { id: "aws-access-key", label: "AWS access key", pattern: /AKIA[0-9A-Z]{12,}/ },
  { id: "google-api-key", label: "Google API key", pattern: /AIza[0-9A-Za-z_-]{12,}/ },
  { id: "private-key", label: "Private key", pattern: /BEGIN (RSA |)PRIVATE KEY/ },
  { id: "laravel-app-key", label: "Laravel APP_KEY", pattern: /APP_KEY\s*=\s*base64:[A-Za-z0-9+/=]+/ },
  { id: "jwt-secret", label: "JWT secret", pattern: /JWT_SECRET\s*=\s*\S{8,}/i },
  {
    id: "database-url",
    label: "Database URL with credentials",
    pattern: /DATABASE_URL\s*=\s*[a-z]+:\/\/[^:\s]+:[^@\s]+@[^/\s]+/i
  },
  { id: "password", label: "Password", pattern: /PASSWORD\s*=\s*(?!placeholder|change-me|replace-me|your-password-here)\S{6,}/i },
  { id: "secret", label: "Secret", pattern: /SECRET[A-Z0-9_]*\s*=\s*(?!placeholder|change-me|replace-me|your-secret-here)\S{6,}/i },
  { id: "token", label: "Token", pattern: /TOKEN\s*=\s*(?!placeholder|change-me|replace-me|your-token-here)\S{6,}/i },
  { id: "api-key", label: "API key/token", pattern: /API_KEY\s*=\s*(?!placeholder|your-api-key-here|change-me|replace-me)\S{6,}/i },
  { id: "private-key-var", label: "Private key variable", pattern: /PRIVATE_KEY\s*=\s*\S{6,}/i }
];
