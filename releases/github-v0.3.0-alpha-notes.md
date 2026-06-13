# GitHub Release Notes — v0.3.0-alpha

## Resumo

`v0.3.0-alpha` consolida a transição do SDD Master de prototype para alpha operacional. Esta preparação é local e ainda não publica GitHub Release.

## Principais comandos

- `sdd master release`
- `sdd master deploy`
- `sdd master implement --prepare`
- `sdd master plugins`
- `sdd master security`
- `sdd master onboard`
- `sdd master doctor --path-safety`

## Principais proteções

- Release/deploy continuam como guards/checklists.
- Implement assistido não altera código do consumidor.
- Plugins e skills não executam código externo automaticamente.
- Scanners externos são opt-in.
- Path safety bloqueia traversal e escrita fora do projeto.
- `.env`, segredos e `.sdd-master/` na raiz continuam proibidos.

## Instalação pretendida após publicação

```bash
npm install -g sdd-master@alpha
```

Até a publicação real, use:

```bash
npm install -g sdd-master@prototype
```

## Aviso alpha

Esta versão é prerelease alpha. A API pública ainda pode evoluir antes de uma versão estável.

## Limitações conhecidas

- Não há execução automática de implementação real.
- Não há deploy automático real.
- Não há execução remota de plugins externos.
- Não há garantia final de API pública congelada.

## Documentação relacionada

- `README.md`
- `docs/03-codigo/release-deploy-guards.md`
- `docs/03-codigo/implement-assistido.md`
- `docs/03-codigo/security-command.md`
- `docs/03-codigo/onboarding-guiado.md`
- `docs/02-tecnica-arquitetura/path-safety-multiplataforma.md`
