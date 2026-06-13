# Checklist de Publicação npm — SDD Master

## Status

Preparação de publicação real para `sdd-master@0.2.0-prototype`.

Versão prerelease atual: `0.2.0-prototype`.

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

Observação: a publicação deve usar `npm publish --access public --tag prototype`. A instalação recomendada neste estágio permanece `sdd-master@prototype`.

Evite usar:

```bash
npm install -g sdd-master
```

até existir uma release estável.

## Antes de publicar

- [ ] Confirmar nome do pacote no npm.
- [ ] Confirmar login npm.
- [ ] Confirmar versão em `package.json`.
- [ ] Confirmar tag Git correspondente `v0.2.0-prototype`.
- [ ] Confirmar GitHub Release draft.
- [ ] Executar `npm run check`.
- [ ] Executar `npm publish --dry-run --access public --tag prototype`.
- [ ] Confirmar no output do dry-run que a tag npm planejada é `prototype`.
- [ ] Se `latest` apontar para prototype por ser a única versão publicada, registrar o risco e a mitigação.
- [ ] Executar `sdd master git --pre-push`.
- [ ] Confirmar ausência de `.env`.
- [ ] Confirmar ausência de segredos.
- [ ] Confirmar ausência de `.sdd-master/` na raiz.
- [ ] Confirmar que PDFs locais não entram no pacote.
- [ ] Confirmar aprovação humana explícita.

## Comando de publicação real

```bash
npm publish --access public --tag prototype
```

## Regra

Não executar publicação real sem autorização humana explícita.
