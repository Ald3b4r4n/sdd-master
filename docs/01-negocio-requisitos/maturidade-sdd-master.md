# Matriz de Maturidade — SDD Master

## Maturidade atual

- Produto: SDD Master
- Versao publica atual: 1.0.0
- Dist-tag recomendada: latest
- Estagio: Estavel publicado
- Proximo estagio alvo: Evolucao incremental

## Niveis

| Nivel | Nome | Status | Descricao |
|---|---|---|---|
| M0 | Ideia | Concluido | Conceito inicial definido |
| M1 | Fundacao | Concluido | CLI, npm, GitHub, docs e seguranca inicial |
| M2 | Workflow basico | Concluido | Discovery -> tasks, governanca e gates |
| M3 | Alpha operacional | Concluido | Uso real em projetos com feedback |
| M4 | Beta | Concluido | Estabilidade e hardening em multiplos projetos |
| M5 | Release Candidate | Concluido | Congelamento de API e fluxo |
| M6 | 1.0.0 estavel | Concluido | Versao estavel |

## Criterios para entrar em 0.3.0-alpha

- Validar `npm publish --dry-run --access public --tag latest`.
- Publicar com `npm publish --access public --tag latest`.
- Manter `prototype`, `alpha`, `beta` e `rc` como histórico.
- Publicar stable somente com autorização humana explícita.
