# Publicação npm

A próxima publicação npm controlada do SDD Master é a versão prototype `0.2.0-prototype`.

## npm

Publicado no npm:

```bash
npm install -g sdd-master@prototype
```

Versão publicada:

```text
sdd-master@0.2.0-prototype
```

Dist-tag:

```text
prototype
```

`0.2.0-prototype` deve ser publicado com `npm publish --access public --tag prototype`. A instalação recomendada neste estágio continua sendo `sdd-master@prototype`, porque a versão ainda é prototype e não é release estável.

Evite usar:

```bash
npm install -g sdd-master
```

até existir uma release estável.

## Validação pré-publicação usada

Execute:

```bash
npm run check
npm run release:check
npm publish --dry-run --access public --tag prototype
```

O dry-run ajuda a confirmar quais arquivos entrariam no pacote e se a configuração npm está coerente, sem publicar a versão real.

Como `0.2.0-prototype` é uma versão prerelease, a configuração do pacote usa a tag npm `prototype` para evitar publicação acidental como `latest`. O comando deve informar `--tag prototype` explicitamente.

## Antes de novas publicações npm

Antes de publicar uma nova versão de verdade:

```bash
npm run check
npm publish --dry-run --access public --tag prototype
```

Uma publicação real exige:

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
- Confirmar que o output do dry-run aponta para a dist-tag planejada.
- Se `latest` apontar para uma versão prototype por ser a única versão publicada, registrar o risco e orientar instalação por `sdd-master@prototype`.
- Confirmar aprovação humana explícita.

## Publicação real

Novas publicações reais exigem fase própria, aprovação humana e comando manual intencional. Este documento registra a publicação prototype já realizada e não autoriza novas publicações.
