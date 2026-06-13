# Path Safety Multiplataforma

## Objetivo

O SDD Master confina leituras e escritas gerenciadas ao diretório do projeto consumidor.

A camada central em `src/filesystem/` normaliza caminhos para Windows, Linux e macOS, valida o destino resolvido e inspeciona ancestrais existentes antes de qualquer escrita.

## Regras

- Caminhos absolutos fora da raiz são bloqueados.
- Traversal que escapa da raiz, como `../arquivo`, é bloqueado.
- Separadores `/` e `\` são normalizados.
- Caminhos com espaços, acentos e Unicode são aceitos dentro da raiz.
- Drives Windows e caminhos UNC externos são bloqueados.
- Symlinks internos podem ser usados.
- Symlinks que redirecionam para fora do projeto são bloqueados.
- Padrões de `--allowed-files` e `--forbidden-files` não aceitam traversal nem caminhos absolutos.
- Arquivos proibidos continuam prevalecendo sobre arquivos permitidos.

## API interna

- `resolveInsideProject`
- `assertInsideProject`
- `safeJoin`
- `safeRelative`
- `safeMkdir`
- `safeWriteFile`
- `safeAppendFile`
- `safeReadFile`
- `safeExists`

## Diagnóstico

```bash
sdd master doctor --path-safety
sdd master doctor --path-safety --json
sdd master status
```

O diagnóstico informa plataforma, raiz redigida, quantidade de caminhos inseguros, symlinks perigosos e status.

## Erros seguros

Erros de caminho usam `status: blocked` e `reason: unsafe-path`. Saídas JSON redigem o caminho solicitado e a raiz do projeto como `[REDACTED]`.

## Git

`sdd master git --pre-push` bloqueia path safety em estado `blocked` e também bloqueia `.sdd-master/` na raiz do próprio pacote SDD Master.
