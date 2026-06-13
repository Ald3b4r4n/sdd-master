# Compatibilidade RC

## Versao

`0.8.0-rc` e o primeiro release candidate do SDD Master.

## Promessa

O RC congela a API publica dos comandos listados em `api-publica-cli.md` como candidata a `1.0.0`.

## Compatibilidade garantida

- `sdd master <comando>` permanece o namespace publico.
- `--json` continua sem banner e com JSON parseavel.
- `--yes` e `-y` continuam aceitos nos comandos que escrevem arquivos.
- `release`, `deploy` e `implement` continuam guards, sem execucao real.
- `plugins` e `skills` continuam metadados locais, sem execucao de codigo externo.
- `.env`, secrets e `.sdd-master/` na raiz do pacote continuam bloqueados.

## Compatibilidade ainda flexivel antes de 1.0

- Novos campos JSON podem ser adicionados.
- Mensagens de texto podem ser refinadas.
- Templates e documentos gerados podem receber secoes novas.
- Checks de seguranca podem ficar mais restritivos.

## Instalacao pretendida apos publicacao

```bash
npm install -g sdd-master@rc
```

Nao publicar como `latest` nesta fase.
