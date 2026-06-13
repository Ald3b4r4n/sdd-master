# Publicação npm

A publicação npm controlada atual do SDD Master é a versão alpha `0.3.0-alpha`.

Ela foi publicada com autorização humana explícita usando `npm publish --access public --tag alpha`.

## npm

Publicado no npm:

```bash
npm install -g sdd-master@alpha
```

Versão publicada:

```text
sdd-master@0.3.0-alpha
```

Dist-tag:

```text
alpha
```

`0.3.0-alpha` foi publicado com `npm publish --access public --tag alpha`. A instalação recomendada neste estágio é `sdd-master@alpha`, porque a versão é alpha e não é release estável.

Estado real das dist-tags após publicação:

- `alpha`: `0.3.0-alpha`
- `prototype`: `0.2.0-prototype`
- `latest`: `0.1.0-prototype.1`

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
npm publish --dry-run --access public --tag alpha
```

O dry-run ajudou a confirmar quais arquivos entrariam no pacote e se a configuração npm estava coerente antes da publicação real.

Como `0.3.0-alpha` é uma versão prerelease alpha, a publicação usou a tag npm `alpha` para evitar publicação acidental como `latest`. O comando deve informar `--tag alpha` explicitamente em novas prereleases alpha.

## Antes de novas publicações npm

Antes de publicar uma nova versão de verdade:

```bash
npm run check
npm publish --dry-run --access public --tag alpha
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
- Confirmar que `npm publish --dry-run --access public --tag alpha` passou.
- Confirmar que o output do dry-run aponta para a dist-tag planejada.
- Registrar o estado real de `latest` e orientar instalação por `sdd-master@alpha` quando a alpha for o canal recomendado.
- Confirmar aprovação humana explícita.

## Publicação real

Novas publicações reais exigem fase própria, aprovação humana e comando manual intencional. Este documento registra a publicação prototype já realizada em `0.2.0-prototype`, com `prototype` apontando para `0.2.0-prototype`, e a publicação alpha de `0.3.0-alpha`, com `alpha` apontando para `0.3.0-alpha`. `latest` permanece em `0.1.0-prototype.1`. Não autoriza novas publicações.
