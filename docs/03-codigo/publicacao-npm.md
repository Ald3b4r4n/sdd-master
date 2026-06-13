# Publicação npm

A publicação npm controlada atual do SDD Master é a versão prototype `0.2.0-prototype`.

A próxima prerelease preparada localmente é `0.3.0-alpha`, ainda não publicada.

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

`0.2.0-prototype` foi publicado com `npm publish --access public --tag prototype`. A instalação recomendada neste estágio continua sendo `sdd-master@prototype`, porque a versão ainda é prototype e não é release estável.

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

O dry-run ajudou a confirmar quais arquivos entrariam no pacote e se a configuração npm estava coerente, sem publicar a versão real.

Como `0.3.0-alpha` é uma versão prerelease alpha, a publicação futura deve usar a tag npm `alpha` para evitar publicação acidental como `latest`. O comando deve informar `--tag alpha` explicitamente.

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
- Registrar o estado real de `latest` e orientar instalação por `sdd-master@prototype`.
- Confirmar aprovação humana explícita.

## Publicação real

Novas publicações reais exigem fase própria, aprovação humana e comando manual intencional. Este documento registra a publicação prototype já realizada em `0.2.0-prototype`, com `prototype` apontando para `0.2.0-prototype` e `latest` permanecendo em `0.1.0-prototype.1`, além da preparação local de `0.3.0-alpha`. Não autoriza novas publicações.
