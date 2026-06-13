# Supply chain local

O SDD Master trata plugins e skills como superficies de supply chain controladas localmente.

Princípios:

- nada executa codigo remoto automaticamente;
- instalacoes globais sao proibidas;
- aprovacao humana e obrigatoria para qualquer artefato externo;
- policy e registry consolidado ficam em `.sdd-master/extensions/`;
- metadados instalados ficam em `.agents/skills/installed/`;
- relatorios de uso sao exigidos para rastreabilidade.

Classificacao:

- origem ausente: `BLOCKER`;
- `remote-source` ou `external-package`: `HIGH`;
- URL remota: `HIGH`;
- permissoes amplas: `HIGH`;
- nenhuma permissao declarada: `MEDIUM`.

Uso sem aprovacao humana quebra o `doctor`. Origem remota usada sem auditoria gera alerta forte.

Comandos relacionados:

```bash
sdd master skills --yes --title="Skill de UI/UX" --category="uiux"
sdd master plugins --yes --title="Plugin de integracao" --category="integration"
```

Essa politica reduz risco de cadeia de fornecimento sem bloquear o uso local e rastreavel de extensoes e skills.
