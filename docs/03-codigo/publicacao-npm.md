# Publicação npm

A publicação npm do SDD Master será uma etapa futura. Neste estágio prototype, o projeto só deve validar empacotamento e publicação em modo dry-run.

## Antes de publicar

Execute:

```bash
npm run check
npm run release:check
npm publish --dry-run --access public --tag prototype
```

O dry-run ajuda a confirmar quais arquivos entrariam no pacote e se a configuração npm está coerente, sem publicar a versão real.

Como `0.1.0-prototype.1` é uma versão prerelease, a configuração do pacote usa a tag npm `prototype` para evitar publicação acidental como `latest`. O comando deve informar `--tag prototype` explicitamente.

## Antes da primeira publicação npm

Antes de publicar de verdade:

```bash
npm run check
npm publish --dry-run --access public --tag prototype
```

A publicação real exige:

- login npm confirmado;
- nome do pacote validado;
- tag/release alinhada;
- autorização humana explícita;
- ausência de `.env`, segredos, credenciais e dados sensíveis.

## Segurança

Nunca publique com `.env`, segredo, token, credencial, chave privada, certificado, dado pessoal, log sensível ou conteúdo interno de `.sdd-master/` de projetos consumidores.

Não automatize `npm publish` neste estágio. O workflow de CI não deve publicar pacote, criar deploy, acessar secrets ou criar release.

## Confirmações operacionais

Antes de uma publicação real:

- Confirmar o nome do pacote.
- Confirmar a versão.
- Confirmar a tag npm de prerelease.
- Confirmar autenticação npm.
- Confirmar acesso ao pacote ou escopo npm.
- Confirmar que `npm publish --dry-run --access public --tag prototype` passou.
- Confirmar que o output do dry-run não aponta para `latest`.
- Confirmar aprovação humana explícita.

## Publicação real

A publicação real exige uma fase própria, aprovação humana e comando manual intencional. Este documento não autoriza `npm publish` real.
