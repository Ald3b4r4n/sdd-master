# Auditoria de Seguranca — 0.2.0-prototype

## Escopo

Auditoria documental e local da versao `0.2.0-prototype`.

## Verificacoes

- `.env` real: nao detectado.
- `.sdd-master/` na raiz: nao detectado.
- segredos: nao detectados.
- token npm em arquivo: nao detectado.
- OTP em arquivo: nao detectado.
- PDFs commitados: nao.
- npm pack: sem PDFs, `.env`, `.sdd-master/`, chaves ou credenciais.
- Git pre-push: warning sem bloqueio por PDFs untracked.
- CI sem secrets: sim.
- CI sem deploy: sim.
- CI sem npm publish: sim.

## TLS/npm

- Erro original: `UNABLE_TO_VERIFY_LEAF_SIGNATURE`.
- Correcao: uso de certificados do sistema via `NODE_OPTIONS=--use-system-ca`.
- strict-ssl: `true`.
- NODE_TLS_REJECT_UNAUTHORIZED: nao usado.
- NODE_OPTIONS: `--use-system-ca` usado apenas em comandos npm de rede.
- Resultado: publicacao npm `0.2.0-prototype` concluida com dist-tag `prototype`.

## Riscos

- Secret scanning heuristico.
- `latest` ainda aponta para prerelease anterior.
- Certificados dependem do ambiente.
- PDFs locais untracked.

## Decisao

- Status: aprovado para manter publicado como prototype.
- Apto para manter publicado: sim.
- Apto para proxima fase: sim, com foco em validacao real para `0.3.0-alpha`.
