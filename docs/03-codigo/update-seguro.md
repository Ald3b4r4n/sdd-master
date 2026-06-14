# Update Seguro

`sdd master update` é funcional e estável em `1.0.0`.

## Objetivo

Sincronizar templates, estrutura, backups, relatórios e metadados sem apagar histórico.

## Uso

```bash
sdd master update --dry-run
sdd master update --apply --yes
sdd master update --dry-run --json
```

## Garantias

- `--dry-run` não altera arquivos;
- `--apply` cria backup quando altera arquivos existentes;
- conflitos são preservados e reportados;
- `.env` nunca é criado;
- histórico e decisões humanas são preservados.
