# Publicação npm

A publicação npm controlada atual do SDD Master é a versão beta `0.5.0-beta`.

Ela foi publicada com autorização humana explícita usando `npm publish --access public --tag beta`.

## npm

Publicado no npm:

```bash
npm install -g sdd-master@alpha
npm install -g sdd-master@beta
```

Versão publicada:

```text
sdd-master@0.5.0-beta
```

Dist-tag:

```text
beta
```

`0.5.0-beta` foi publicado com `npm publish --access public --tag beta`. A instalação recomendada neste estágio é `sdd-master@beta`, porque a versão é beta e não é release estável.

Estado real das dist-tags após publicação:

- `alpha`: `0.3.0-alpha`
- `beta`: `0.5.0-beta`
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
npm publish --dry-run --access public --tag beta
```

O dry-run ajudou a confirmar quais arquivos entrariam no pacote e se a configuração npm estava coerente antes da publicação real.

Como `0.5.0-beta` é uma versão prerelease beta, a publicação usou a tag npm `beta` para evitar publicação acidental como `latest`. A primeira tentativa real falhou por TLS local (`UNABLE_TO_VERIFY_LEAF_SIGNATURE`) e foi repetida com `NODE_OPTIONS=--use-system-ca`, sem alterar `strict-ssl`.

## Antes de novas publicações npm

Antes de publicar uma nova versão de verdade:

```bash
npm run check
npm publish --dry-run --access public --tag beta
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
- Confirmar que `npm publish --dry-run --access public --tag beta` passou.
- Confirmar que o output do dry-run aponta para a dist-tag planejada.
- Registrar o estado real de `latest` e orientar instalação por `sdd-master@beta` quando a beta for o canal recomendado.
- Confirmar aprovação humana explícita.

## Publicação real

Novas publicações reais exigem fase própria, aprovação humana e comando manual intencional. Este documento registra a publicação prototype já realizada em `0.2.0-prototype`, com `prototype` apontando para `0.2.0-prototype`, a publicação alpha de `0.3.0-alpha`, com `alpha` apontando para `0.3.0-alpha`, e a publicação beta de `0.5.0-beta`, com `beta` apontando para `0.5.0-beta`. `latest` permanece em `0.1.0-prototype.1`. Não autoriza novas publicações.
# Publicação npm RC

Para `0.8.0-rc`, a publicação real foi executada com:

```bash
npm publish --access public --tag rc
```

Validacao previa executada:

```bash
npm publish --dry-run --access public --tag rc
```

Nao usar `latest` manualmente. As dist-tags `prototype`, `alpha` e `beta` continuam disponiveis e nao foram alteradas neste bloco. A instalacao e `npm install -g sdd-master@rc`.

Estado real confirmado:

- `rc`: `0.8.0-rc`
- `beta`: `0.5.0-beta`
- `alpha`: `0.3.0-alpha`
- `prototype`: `0.2.0-prototype`
- `latest`: `0.1.0-prototype.1`
