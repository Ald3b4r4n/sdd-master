# Release Local

Uma release local é um ponto de controle validado no Git local. Ela consolida versão, documentação, pacote, checks e tag sem publicar artefatos externos.

No SDD Master, a release local `v0.1.0-prototype` serve para deixar o projeto pronto para revisão humana antes do primeiro push e antes de qualquer publicação npm real.

## Por que não publicar automaticamente

Publicação no npm, push para GitHub e criação de release GitHub mudam o estado público do projeto. Essas ações exigem aprovação humana explícita, revisão de segurança e confirmação operacional do destino.

O fluxo local reduz risco porque valida o pacote sem criar remoto, sem enviar tag remota, sem publicar release e sem executar deploy.

## Commit, tag local, push e release GitHub

- Commit registra mudanças no repositório local.
- Tag local marca um commit como ponto de release local.
- Push envia commits ou tags para um remoto Git.
- Release GitHub publica metadados e artefatos no GitHub.

Essas etapas são separadas de propósito. Uma tag local não implica push, release GitHub ou publicação npm.

## Comandos de validação

Antes de criar ou revisar uma release local:

```bash
npm run build
npm test
npm run smoke
npm run package:check
npm run pack:dry-run
npm run release:check
npm run check
```

Também é permitido validar a publicação futura sem publicar:

```bash
npm publish --dry-run --access public
```

Para a versão prerelease `0.1.0-prototype`, a tag npm configurada é `prototype`.

## Regras de segurança

- Não fazer push sem autorização humana.
- Não publicar no npm sem autorização humana.
- Não criar release GitHub sem autorização humana.
- Não incluir `.env`, segredos, credenciais, chaves privadas, dados pessoais ou `.sdd-master/` de projetos consumidores.
- Não mover, apagar ou commitar PDFs locais untracked.
