# Supply chain local

O SDD Master trata plugins e skills como superficies de supply chain controladas localmente.

Princípios:

- nada executa codigo remoto automaticamente;
- instalacoes globais sao proibidas;
- aprovacao humana e obrigatoria para qualquer artefato externo;
- registries locais ficam em `.sdd-master/` e `.agents/`;
- relatorios de uso sao exigidos para rastreabilidade.

Comandos relacionados:

```bash
sdd master skills --yes --title="Skill de UI/UX" --category="uiux"
sdd master plugins --yes --title="Plugin de integracao" --category="integration"
```

Essa politica reduz risco de cadeia de fornecimento sem bloquear o uso local e rastreavel de extensoes e skills.
