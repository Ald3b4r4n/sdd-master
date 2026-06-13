# Comando security

`sdd master security` executa a segurança builtin do SDD Master. Por padrão, nenhum scanner externo é consultado ou executado.

```bash
sdd master security
sdd master security --json
sdd master security --detect-tools --json
sdd master security --report --audit
sdd master security --run-external --tool="gitleaks" --report
sdd master security --run-external --tool="trufflehog" --report
```

## Modos

- `basic`: scanner builtin local.
- `advanced`: scanner builtin com integração externa explicitamente solicitada.

## Ferramentas externas

`gitleaks` e `trufflehog` são opcionais. O comando apenas detecta versões com `--detect-tools`.
A execução exige `--run-external` e usa somente o working tree/filesystem local.

O SDD Master:

- não instala scanners;
- não baixa binários;
- não usa GitHub API;
- não envia código para serviços externos;
- não persiste saída bruta;
- verifica o help da versão instalada antes de escolher flags locais.

## Artefatos

Com `--report` ou `--audit`, em projeto inicializado:

```text
.sdd-master/security/security-policy.md
.sdd-master/security/reports/SECURITY-REPORT-001.md
.sdd-master/security/audits/SECURITY-AUDIT-001.md
.sdd-master/security/external-tools/EXTERNAL-TOOLS-001.md
```

Todos os valores sensíveis aparecem como `[REDACTED]`.

## Ausência de ferramentas

Ferramenta ausente gera warning. `--strict` pode exigir disponibilidade; `--allow-missing-tools` mantém a ausência não bloqueante.
