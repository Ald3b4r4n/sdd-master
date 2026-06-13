# Plugins e extensoes seguras

`sdd master plugins` controla plugins/extensoes como metadados locais, com politica de supply chain segura.

```bash
sdd master plugins --yes --title="Plugin de integracao" --category="other" --source="Registry local controlado" --version="1.0.0" --permission="docs/**"
sdd master plugins --yes --id="PLUGIN-001" --audit
sdd master plugins --yes --id="PLUGIN-001" --approve
sdd master plugins --yes --id="PLUGIN-001" --install-local
sdd master plugins --yes --id="PLUGIN-001" --mark-used --phase="PHASE-01" --target="plugin-review"
sdd master plugins --json --report
```

Regras:

- instalacao global e proibida;
- nenhum codigo remoto e baixado ou executado;
- plugins externos exigem aprovacao humana;
- candidatos, rejeitados e bloqueados nao podem ser usados;
- origem ausente e BLOCKER; origem remota e risco de supply chain;
- instalacao local cria apenas metadados em `.agents/skills/installed/`;
- policy, registry, plugins, approvals, audits, usage e reports ficam em `.sdd-master/extensions/`;
- todo plugin usado deve aparecer em relatorio.

O registry legado em `.sdd-master/plugins/` continua legivel para migracao, mas novos comandos escrevem somente na estrutura correta.

`sdd master skills` continua responsavel por skills locais e tambem sincroniza o registry consolidado.
