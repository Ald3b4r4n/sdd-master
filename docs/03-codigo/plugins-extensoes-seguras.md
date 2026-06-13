# Plugins e extensoes seguras

`sdd master plugins` controla plugins/extensoes como metadados locais, com politica de supply chain segura.

```bash
sdd master plugins --yes --title="Plugin de integracao" --category="integration" --source="Registry local controlado"
sdd master plugins --yes --plugin="PLUGIN-001" --approve
sdd master plugins --yes --plugin="PLUGIN-001" --install-local
sdd master plugins --yes --plugin="PLUGIN-001" --mark-used --phase="PHASE-01" --target="plugin-review"
```

Regras:

- instalacao global e proibida;
- nenhum codigo remoto e baixado ou executado;
- plugins externos exigem aprovacao humana;
- instalacao local cria apenas metadados em `.agents/plugins/` e `.sdd-master/plugins/`;
- todo plugin usado deve aparecer em relatorio.

`sdd master skills` continua responsavel por skills locais, com o mesmo padrao de registry local e supply chain segura.
