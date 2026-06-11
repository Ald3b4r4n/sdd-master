import { agentFiles } from "./agent-registry.js";
import type { AgentLanguage, SupportedAgent } from "./agent-types.js";

const rulesPt = [
  "Ler `.sdd-master/constitution.md` antes de agir.",
  "Ler `.sdd-master/project-state.md` antes de agir.",
  "Executar retomada universal antes de qualquer mudança.",
  "Não implementar sem especificação aprovada.",
  "Não implementar sem teste/check criado antes.",
  "Não avançar fase sem aprovação humana.",
  "Não pular qualidade.",
  "Não pular auditoria.",
  "Não pular documentação.",
  "Não alterar escopo sem autorização formal.",
  "Não aceitar risco sem aprovação humana.",
  "Não enviar `.sdd-master/` para GitHub/remoto.",
  "Não enviar `.env` real.",
  "Não enviar variáveis de ambiente reais.",
  "Não enviar segredos, tokens, credenciais ou dados sensíveis.",
  "Não misturar commit de produto com commit interno.",
  "Não fazer push sem autorização humana.",
  "Não adicionar dependência sem auditoria e aprovação.",
  "Não criar UI sem validação UI/UX quando aplicável.",
  "Não ignorar acessibilidade quando houver interface.",
  "Não ignorar segurança desde o início.",
  "Não usar skill externa sem aprovação e registro.",
  "Não apagar rastreabilidade.",
  "Informar skills utilizadas em relatórios.",
  "Atualizar documentação pública e estado interno quando houver impacto."
];

const rulesEn = [
  "Read `.sdd-master/constitution.md` before acting.",
  "Read `.sdd-master/project-state.md` before acting.",
  "Run universal resumption before any change.",
  "Do not implement without approved specification.",
  "Do not implement without tests/checks created first.",
  "Do not advance phases without human approval.",
  "Do not skip quality.",
  "Do not skip audit.",
  "Do not skip documentation.",
  "Do not change scope without formal authorization.",
  "Do not accept risk without human approval.",
  "Do not push `.sdd-master/` to GitHub/remotes.",
  "Do not commit real `.env` files.",
  "Do not commit real environment variables.",
  "Do not commit secrets, tokens, credentials, or sensitive data.",
  "Do not mix product commits with internal governance commits.",
  "Do not push without human authorization.",
  "Do not add dependencies without audit and approval.",
  "Do not create UI without UI/UX validation when applicable.",
  "Do not ignore accessibility when there is an interface.",
  "Do not ignore security from the beginning.",
  "Do not use external skills without approval and registration.",
  "Do not erase traceability.",
  "Report used skills in reports.",
  "Update public documentation and internal state when impacted."
];

const rulesEs = [
  "Leer `.sdd-master/constitution.md` antes de actuar.",
  "Leer `.sdd-master/project-state.md` antes de actuar.",
  "Ejecutar retomada universal antes de cualquier cambio.",
  "No implementar sin especificación aprobada.",
  "No implementar sin pruebas/checks creados antes.",
  "No avanzar fase sin aprobación humana.",
  "No saltar calidad, auditoría ni documentación.",
  "No cambiar alcance sin autorización formal.",
  "No aceptar riesgo sin aprobación humana.",
  "No enviar `.sdd-master/` a GitHub/remoto.",
  "No enviar `.env` real ni variables reales de entorno.",
  "No enviar secretos, tokens, credenciales o datos sensibles.",
  "No mezclar commits de producto con commits internos.",
  "No hacer push sin autorización humana.",
  "No agregar dependencias sin auditoría y aprobación.",
  "No ignorar UI/UX, accesibilidad o seguridad cuando aplique.",
  "No usar skills externas sin aprobación y registro.",
  "No borrar trazabilidad.",
  "Informar skills utilizadas en reportes.",
  "Actualizar documentación pública y estado interno cuando haya impacto."
];

export function createAgentInstruction(agent: SupportedAgent, language: AgentLanguage): string {
  if (agent === "aider") {
    return createAiderConfig(language);
  }

  if (language === "pt-BR") {
    return createMarkdownPt(agent);
  }

  if (language === "es") {
    return createMarkdownEs(agent);
  }

  return createMarkdownEn(agent);
}

function createMarkdownPt(agent: SupportedAgent): string {
  return `# SDD Master — Instruções para Agentes

## Prioridade

Estas instruções são obrigatórias para qualquer agente de codificação trabalhando neste repositório.

Agente configurado: ${agent}
Arquivo gerado: ${agentFiles[agent].path}

Antes de fazer mudanças, leia:

1. \`.sdd-master/constitution.md\`
2. \`.sdd-master/project-state.md\`
3. \`.sdd-master/reports/\`
4. \`.sdd-master/audits/\`
5. \`.sdd-master/traceability/\`
6. \`docs/01-negocio-requisitos/\`
7. \`docs/02-tecnica-arquitetura/\`
8. \`docs/03-codigo/\`

## Regras inegociáveis

${rulesPt.map((rule) => `- ${rule}`).join("\n")}

## Fluxo obrigatório

1. Entender o estado atual.
2. Identificar o comando permitido.
3. Confirmar fase e tarefa.
4. Criar ou verificar testes primeiro.
5. Implementar apenas o escopo aprovado.
6. Atualizar documentação.
7. Atualizar rastreabilidade.
8. Rodar checks.
9. Relatar mudanças.
10. Aguardar aprovação humana quando exigido.
`;
}

function createMarkdownEn(agent: SupportedAgent): string {
  return `# SDD Master — Agent Instructions

## Priority

These instructions are mandatory for every AI coding agent working in this repository.

Configured agent: ${agent}
Generated file: ${agentFiles[agent].path}

Before making changes, read:

1. \`.sdd-master/constitution.md\`
2. \`.sdd-master/project-state.md\`
3. \`.sdd-master/reports/\`
4. \`.sdd-master/audits/\`
5. \`.sdd-master/traceability/\`
6. \`docs/01-negocio-requisitos/\`
7. \`docs/02-tecnica-arquitetura/\`
8. \`docs/03-codigo/\`

## Non-negotiable rules

${rulesEn.map((rule) => `- ${rule}`).join("\n")}

## Required workflow

1. Understand current state.
2. Identify allowed command.
3. Confirm phase and task.
4. Create or verify tests first.
5. Implement only approved scope.
6. Update documentation.
7. Update traceability.
8. Run checks.
9. Report changes.
10. Wait for human approval when required.
`;
}

function createMarkdownEs(agent: SupportedAgent): string {
  return `# SDD Master — Instrucciones para Agentes

## Prioridad

Estas instrucciones son obligatorias para agentes de codificación que trabajen en este repositorio.

Agente configurado: ${agent}
Archivo generado: ${agentFiles[agent].path}

Antes de cambiar archivos, lee \`.sdd-master/constitution.md\`, \`.sdd-master/project-state.md\`, reportes, auditorías, trazabilidad y documentación pública.

## Reglas no negociables

${rulesEs.map((rule) => `- ${rule}`).join("\n")}

## Flujo requerido

1. Entender el estado actual.
2. Confirmar fase, alcance y tarea.
3. Crear o verificar pruebas primero.
4. Implementar solo alcance aprobado.
5. Actualizar documentación y trazabilidad.
6. Ejecutar checks.
7. Reportar cambios.
8. Esperar aprobación humana cuando aplique.
`;
}

function createAiderConfig(language: AgentLanguage): string {
  const body = language === "en" ? createMarkdownEn("aider") : createMarkdownPt("aider");

  return `# SDD Master instructions for Aider
read:
  - .sdd-master/constitution.md
  - .sdd-master/project-state.md
  - docs/01-negocio-requisitos/
  - docs/02-tecnica-arquitetura/
  - docs/03-codigo/

message: |
${body
  .split("\n")
  .map((line) => `  ${line}`)
  .join("\n")}
`;
}
