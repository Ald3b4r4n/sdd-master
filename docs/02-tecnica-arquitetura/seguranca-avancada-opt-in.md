# Segurança avançada opt-in

## Princípio

A segurança builtin permanece sempre local. Integrações externas são opcionais e nunca são executadas implicitamente.

## Fluxo

1. O scanner builtin verifica arquivos proibidos e padrões suspeitos.
2. `--detect-tools` consulta somente a versão local disponível.
3. `--run-external` verifica o help da ferramenta e seleciona um modo local compatível.
4. A saída externa é resumida em memória.
5. Somente status, contagem aproximada e recomendações redigidas podem ser persistidos.

## Redaction

Uma função central redige tokens longos, credenciais atribuídas, bearer tokens, JWTs, chaves de provedores e blocos de chave privada.
Artefato com conteúdo sensível não redigido torna o estado avançado `blocked`.

## Integrações

- `doctor`: mostra policy, ferramentas, relatório, auditoria e redaction.
- `status`: resume segurança builtin e avançada.
- `git --pre-push`: bloqueia relatório `blocked` ou saída não redigida.
- `release` e `deploy`: herdam os mesmos bloqueios.
- `implement`: inclui o estado no handoff e readiness.

Ferramentas ausentes não bloqueiam o projeto por padrão.
