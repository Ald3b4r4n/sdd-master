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

## Smoke e Pacote

```bash
npm run smoke
npm run package:check
npm run pack:dry-run
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
- Não envie conteúdo interno de `.sdd-master/` de projetos consumidores.
- Documente mudanças relevantes no README, CHANGELOG ou docs quando aplicável.
- Use TDD para mudanças de comportamento.
- Trate segurança como parte do escopo técnico.
- Prefira mudanças pequenas, revisáveis e rastreáveis.
- Não publique pacotes nem crie releases sem uma fase explícita para isso.

## Propondo Comandos, Templates e Skills

Novos comandos, templates oficiais e skills de agentes devem vir com escopo claro, testes, documentação e limites de segurança. Explique quais arquivos serão lidos ou escritos, quais dados devem ser bloqueados e como o comportamento será validado localmente.

## Issues e Pull Requests

Use os templates de issue e Pull Request do repositório. Eles existem para manter escopo, validação e segurança visíveis durante a revisão.

Antes de abrir um Pull Request, rode:

```bash
npm run build
npm test
npm run smoke
npm run package:check
npm run pack:dry-run
npm run check
```

## Critérios de Merge

Um Pull Request deve ter escopo claro, checks passando, documentação atualizada quando necessário, nenhum segredo ou arquivo sensível e revisão humana antes do merge. Mudanças que adicionem publicação, release, criação de remoto ou automação de push exigem fase explícita e aprovação separada.
