import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

export const extensionPolicyPath = ".sdd-master/extensions/extension-policy.md";

export function ensureExtensionPolicy(cwd: string): string {
  const path = join(cwd, extensionPolicyPath);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(
    path,
    `# Política de Extensões — SDD Master

## Regras obrigatórias

- Nenhum plugin executa código automaticamente.
- Nenhuma skill executa código automaticamente.
- Nenhuma extensão instala dependência global.
- Extensões externas exigem aprovação humana.
- Toda extensão precisa de origem declarada.
- Toda extensão precisa de permissões declaradas.
- Toda extensão usada precisa aparecer em relatório.
- Extensão com origem remota é risco de supply chain.
- Extensão não pode criar \`.env\`.
- Extensão não pode expor segredos.
- Extensão não pode fazer push.
- Extensão não pode publicar npm.
- Extensão não pode executar deploy.

## Status aceitos

- Candidato
- Aprovado
- Rejeitado
- Instalado localmente
- Usado
- Bloqueado

## Aprovação humana

Obrigatória antes de instalação local ou uso real.
`,
    "utf8"
  );
  return extensionPolicyPath;
}
