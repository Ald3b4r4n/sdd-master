# Presets Oficiais — SDD Master

## Presets beta

O SDD Master beta oferece presets oficiais para acelerar o início sem pular governança:

- `web`
- `api`
- `cli`
- `mobile`
- `desktop`
- `library`
- `ecommerce`
- `generic`

Uso:

```bash
sdd master init --yes --preset="ecommerce" --ai="codex"
```

## E-commerce

O preset `ecommerce` é tratado como perfil crítico de produto. Ele registra atenção inicial para:

- SEO;
- UI/UX;
- catálogo;
- checkout;
- frete;
- pagamento;
- segurança;
- LGPD;
- acessibilidade;
- performance;
- admin;
- deploy guard;
- rollback.

## Regras

- Presets não criam `.env`.
- Presets não executam deploy.
- Presets não publicam npm.
- Presets não instalam dependências.
- Presets só escrevem dentro da raiz do projeto consumidor.
