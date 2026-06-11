# Release Local

Uma release local é um ponto de controle validado no Git local. Ela consolida versão, documentação, pacote, checks e tag sem publicar artefatos externos.

No SDD Master, a release local `v0.1.0-prototype.1` serve para deixar o projeto pronto para revisão humana antes da publicação npm real, preservando a tag inicial `v0.1.0-prototype` sem reescrita.

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
npm publish --dry-run --access public --tag prototype
```

Para a versão prerelease `0.1.0-prototype.1`, a tag npm configurada é `prototype`.

## GitHub Release draft

A criação de uma GitHub Release deve ser feita somente após:

1. tag local existir;
2. tag remota existir;
3. `npm run check` passar;
4. `npm publish --dry-run --access public --tag prototype` passar;
5. `sdd master git --pre-push` não retornar bloqueio;
6. aprovação humana explícita.

A primeira release pode ser criada como draft usando:

```bash
gh release create v0.1.0-prototype.1 --draft --title "v0.1.0-prototype.1" --notes-file releases/github-v0.1.0-prototype.1-notes.md
```

Não publicar release final sem aprovação humana.

## Regras de segurança

- Não fazer push sem autorização humana.
- Não publicar no npm sem autorização humana.
- Não criar release GitHub sem autorização humana.
- Não incluir `.env`, segredos, credenciais, chaves privadas, dados pessoais ou `.sdd-master/` de projetos consumidores.
- Não mover, apagar ou commitar PDFs locais untracked.
