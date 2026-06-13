# Troubleshooting

## Banner apareceu em JSON

Use `--json` no comando final e valide se nao ha wrapper de shell injetando texto. O RC tem teste garantindo JSON sem banner.

## TLS falhou no npm publish dry-run

Nao use `strict-ssl=false`. Se necessario no Windows, use somente:

```powershell
$env:NODE_OPTIONS="--use-system-ca"
npm publish --dry-run --access public --tag rc
```

## O comando bloqueou por `.env`

Remova `.env` real da raiz do pacote. Use `.env.example` sem valores sensiveis quando precisar documentar chaves.

## `.sdd-master/` apareceu na raiz do pacote

Remova antes de release. A raiz do pacote SDD Master nao deve carregar estado de projeto consumidor.

## Scanners externos nao encontrados

Esperado quando `gitleaks` ou `trufflehog` nao foram instalados manualmente. O modo builtin continua disponivel.
