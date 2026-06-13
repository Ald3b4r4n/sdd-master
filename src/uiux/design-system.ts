export function designSystemContent(): string {
  return `# Design System

## Status
Rascunho

## Fundamentos
- Cores:
- Tipografia:
- Espaçamento:
- Radius:
- Sombras:
- Ícones:

## Componentes base
- Botões:
- Inputs:
- Cards:
- Navegação:
- Feedback:

## Acessibilidade
- Contraste:
- Foco visível:
- Estados:

## Aprovação humana
Pendente
`;
}

export function checklistContent(title: string, items: string[]): string {
  return `# ${title}

## Status
Rascunho

## Checklist
${items.map((item) => `- ${item}:`).join("\n")}

## Achados
-

## Aprovação humana
Pendente
`;
}
