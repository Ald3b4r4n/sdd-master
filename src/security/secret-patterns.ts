export type SecretPattern = {
  id: string;
  label: string;
  pattern: RegExp;
};

const envPrefix = String.raw`(?:^|[^A-Za-z0-9_])`;
const upperEnvPrefix = String.raw`(?:[A-Z0-9]+_)*`;
const safePlaceholder = String.raw`(?!placeholder|change-me|replace-me|your-[a-z-]+-here)`;

export const secretPatterns: SecretPattern[] = [
  { id: "stripe-live", label: "Stripe live key", pattern: /sk_live_[A-Za-z0-9_=-]+/ },
  { id: "stripe-test", label: "Stripe test key", pattern: /sk_test_[A-Za-z0-9_=-]+/ },
  { id: "openai-project", label: "OpenAI project key", pattern: /sk-proj-[A-Za-z0-9_-]{8,}/ },
  { id: "aws-access-key", label: "AWS access key", pattern: /AKIA[0-9A-Z]{12,}/ },
  { id: "google-api-key", label: "Google API key", pattern: /AIza[0-9A-Za-z_-]{12,}/ },
  { id: "github-token", label: "GitHub token", pattern: /gh[pousr]_[A-Za-z0-9_]{20,}/ },
  { id: "npm-token", label: "npm token", pattern: /npm_[A-Za-z0-9]{20,}/ },
  { id: "bearer-token", label: "Bearer token", pattern: /Bearer\s+[A-Za-z0-9._~+/-]{12,}=*/ },
  { id: "jwt", label: "JWT", pattern: /eyJ[A-Za-z0-9_-]{6,}\.[A-Za-z0-9_-]{6,}\.[A-Za-z0-9_-]{6,}/ },
  { id: "private-key", label: "Private key", pattern: /BEGIN (RSA |EC |OPENSSH |)PRIVATE KEY/ },
  { id: "laravel-app-key", label: "Laravel APP_KEY", pattern: new RegExp(`${envPrefix}APP_KEY\\s*=\\s*base64:[A-Za-z0-9+/=]+`) },
  { id: "jwt-secret", label: "JWT secret", pattern: new RegExp(`${envPrefix}${upperEnvPrefix}JWT_SECRET\\s*=\\s*\\S{8,}`) },
  {
    id: "database-url",
    label: "Database URL with credentials",
    pattern: new RegExp(`${envPrefix}${upperEnvPrefix}DATABASE_URL\\s*=\\s*[a-z]+://[^:\\s]+:[^@\\s]+@[^/\\s]+`)
  },
  { id: "password", label: "Password", pattern: new RegExp(`${envPrefix}${upperEnvPrefix}PASSWORD\\s*=\\s*${safePlaceholder}\\S{6,}`) },
  { id: "secret", label: "Secret", pattern: new RegExp(`${envPrefix}${upperEnvPrefix}SECRET[A-Z0-9_]*\\s*=\\s*${safePlaceholder}\\S{6,}`) },
  { id: "token", label: "Token", pattern: new RegExp(`${envPrefix}${upperEnvPrefix}TOKEN\\s*=\\s*${safePlaceholder}\\S{6,}`) },
  { id: "api-key", label: "API key/token", pattern: new RegExp(`${envPrefix}${upperEnvPrefix}API_KEY\\s*=\\s*${safePlaceholder}\\S{6,}`) },
  { id: "private-key-var", label: "Private key variable", pattern: new RegExp(`${envPrefix}${upperEnvPrefix}PRIVATE_KEY\\s*=\\s*\\S{6,}`) }
];
