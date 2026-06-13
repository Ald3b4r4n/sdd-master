# Breaking Changes

## Politica ate 1.0.0

Durante `0.8.0-rc`, breaking changes ainda sao permitidos quando:

- corrigem risco de seguranca;
- reforcam path safety, redaction ou supply chain;
- alinham contrato publico antes de `1.0.0`;
- possuem teste de regressao;
- aparecem no CHANGELOG.

## Permitidos ate 1.0.0

- Adicionar flags opcionais.
- Adicionar campos JSON.
- Tornar checks mais restritivos.
- Ajustar nomes de documentos gerados quando a migracao estiver documentada.
- Refinar saida textual.

## proibidos após 1.0

- Remover comando publico sem major.
- Remover flag publica sem major.
- Quebrar JSON documentado sem major.
- Relaxar bloqueios de `.env`, secrets, path traversal ou publish/deploy automatico.
- Executar plugin externo sem opt-in explicito.
- Publicar npm, criar tag, fazer push ou criar GitHub Release por comando automatico.

## Registro RC

Nenhum breaking change bloqueante conhecido permanece aberto em `0.8.0-rc`.
