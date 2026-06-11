# Contribuindo com o SDD Master

Obrigado por considerar contribuir com o SDD Master. Este projeto segue uma abordagem rígida de especificação, documentação, TDD, auditoria e segurança.

## Instalação

```bash
npm install
```

## Build

```bash
npm run build
```

## Testes

```bash
npm test
```

## Lint e Check

```bash
npm run lint
npm run check
```

## Padrão de Commits

Use o formato:

```text
tipo(phase-XX): descrição
```

Exemplos:

```text
chore(phase-01): bootstrap npm package
test(phase-02): cover cli help command
```

## Regras Obrigatórias

- Não envie `.env` real.
- Não envie segredos, tokens, senhas, certificados, credenciais ou dados sensíveis.
- Documente mudanças relevantes no README, CHANGELOG ou docs quando aplicável.
- Use TDD para mudanças de comportamento.
- Trate segurança como parte do escopo técnico.
- Prefira mudanças pequenas, revisáveis e rastreáveis.
- Não publique pacotes nem crie releases sem uma fase explícita para isso.
