# Skills locais e UI/UX

Design deve ser o carro-chefe do SDD Master.

## Skills

`sdd master skills` prepara um fluxo seguro para registrar skills candidatas, aprovar uso humano, instalar metadados localmente e marcar uso em relatório.

```bash
sdd master skills --yes --title="Antigravity UI polish" --category="uiux" --source="https://github.com/sickn33/antigravity-awesome-skills/"
sdd master skills --yes --skill="SKILL-001" --approve
sdd master skills --yes --skill="SKILL-001" --install-local
sdd master skills --yes --skill="SKILL-001" --mark-used --phase="PHASE-01" --target="uiux-review"
```

Regras:

- instalação global é proibida;
- instalação local cria apenas metadados em `.agents/skills/installed/`;
- registry local fica em `.agents/skills/registry.md`;
- código remoto não é baixado nem executado;
- skills externas são risco de supply chain até aprovação;
- toda skill usada deve aparecer no relatório do agente.

## UI/UX

`sdd master uiux` cria gates de interface, design system, acessibilidade, SEO, responsividade e performance.

```bash
sdd master uiux --yes --phase="PHASE-01" --profile="WEB" --title="Revisão UI/UX inicial"
sdd master uiux --yes --type="design-system" --phase="PHASE-01" --profile="WEB"
sdd master uiux --yes --type="accessibility" --phase="PHASE-01" --profile="WEB"
sdd master uiux --yes --type="seo" --phase="PHASE-01" --profile="WEB"
sdd master uiux --yes --type="responsiveness" --phase="PHASE-01" --profile="WEB"
```

Perfis com interface exigem UI/UX aprovado, design system, acessibilidade e responsividade antes da implementação. Perfis `WEB`, `SAAS` e `E-COMMERCE` também exigem SEO.
