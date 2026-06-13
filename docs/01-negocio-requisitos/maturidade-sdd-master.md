# Matriz de Maturidade — SDD Master

## Maturidade atual

- Produto: SDD Master
- Versao publica atual: 0.2.0-prototype
- Versao local preparada: 0.3.0-alpha
- Estagio: Alpha preparado localmente
- Proximo estagio alvo: Alpha publicado

## Niveis

| Nivel | Nome | Status | Descricao |
|---|---|---|---|
| M0 | Ideia | Concluido | Conceito inicial definido |
| M1 | Fundacao | Concluido | CLI, npm, GitHub, docs e seguranca inicial |
| M2 | Workflow basico | Concluido | Discovery -> tasks, governanca e gates |
| M3 | Alpha operacional | Proximo | Uso real em projetos com feedback |
| M4 | Beta | Futuro | Estabilidade e hardening em multiplos projetos |
| M5 | Release Candidate | Futuro | Congelamento de API e fluxo |
| M6 | 1.0.0 estavel | Futuro | Versao estavel |

## Criterios para entrar em 0.3.0-alpha

- Preparar `0.3.0-alpha` localmente sem publicar.
- Validar `npm publish --dry-run --access public --tag alpha`.
- Manter `latest` fora do fluxo alpha.
- Publicar alpha somente com autorização humana explícita futura.
