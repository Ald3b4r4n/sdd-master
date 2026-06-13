# v0.2.0-prototype

Esta prerelease consolida o primeiro fluxo SDD funcional do SDD Master.

## Principais comandos adicionados

- `sdd master discovery`
- `sdd master requirements`
- `sdd master spec`
- `sdd master plan`
- `sdd master tasks`
- `sdd master clarify`
- `sdd master approve`
- `sdd master scope`
- `sdd master backlog`
- `sdd master quality`
- `sdd master audit`
- `sdd master docs`
- `sdd master blocker`
- `sdd master implement`
- `sdd master skills`
- `sdd master uiux`
- `sdd master update`

## Destaques

- Workflow SDD inicial com documentos rastreáveis.
- Governança formal para dúvidas, aprovações, escopo e backlog.
- Gates de qualidade, auditoria, documentação e blockers.
- Implement guard em modo dry-run, sem alterar código do consumidor.
- Skills locais sem instalação global e sem execução remota.
- Gates de UI/UX, design system, accessibility, SEO, responsiveness e performance.
- Update seguro com backup, relatórios e preservação de conflitos.

## Instalação recomendada

```bash
npm install -g sdd-master@prototype
```

## Aviso prototype

Esta versão continua sendo prototype. Use em projetos de teste ou com revisão humana explícita antes de aplicar em fluxos críticos.

## Limitações conhecidas

- Ainda não há implementação real de código por agente.
- Ainda não há release estável.
- Ainda não há deploy.
- Ainda não há busca online real de skills.
- Secret scanning externo com ferramentas dedicadas ainda não está integrado.

## Segurança

- `.env` real, segredos, tokens e credenciais não devem ser publicados.
- `.sdd-master/` de projetos consumidores não deve ser enviado a repositórios públicos sem política explícita.
- PDFs locais do projeto não fazem parte da release nem do pacote npm.
