# Update seguro

`sdd master update` atualiza uma instalação local do SDD Master sem apagar histórico, rastreabilidade ou decisões humanas.

## Objetivo

O update sincroniza templates oficiais versionados e metadados de instalação em `.sdd-master/project-state.md`.

Ele não é um uninstall, não limpa projeto e não tenta reescrever documentos preenchidos.

## Dry-run

```bash
sdd master update --dry-run
sdd master update --dry-run --json
```

Dry-run calcula o plano e não altera arquivos.

## Apply

```bash
sdd master update --apply --yes
```

Apply cria backup quando precisa alterar arquivos existentes e aplica apenas mudanças seguras.

## Backup

Backups ficam em:

```text
.sdd-master/backups/update-YYYYMMDD-HHMMSS/
```

O backup copia somente arquivos que seriam alterados, não o projeto inteiro.

## Conflitos

Se um template existente não contém `Managed by: SDD Master` ou parece ter sido modificado localmente, o update preserva o arquivo e registra conflito.

## Templates versionados

Templates oficiais incluem:

```markdown
## Template metadata
- Template ID:
- Template version: 0.1.0
- SDD Master compatibility: >=0.1.0-prototype.1
- Managed by: SDD Master
```

## Project-state

Instalações antigas sem metadados recebem o bloco:

```markdown
## SDD Master

- Versão instalada:
- Versão dos templates:
- Data da instalação:
- Último update:
- Canal recomendado:
```

## Quando usar

Use quando atualizar o pacote SDD Master ou quando um projeto consumidor precisar receber templates ausentes e metadados de versão.

## Quando não usar

Não use para apagar documentos, desfazer decisões humanas, limpar rastreabilidade ou substituir uma migração manual de produto.

## Por que não há uninstall automático

`.sdd-master/` contém histórico, aprovações, decisões, auditorias e rastreabilidade. Remover isso automaticamente quebraria a regra central do framework: update nunca deve apagar histórico.
