# Segurança e Governança

## Constitution

`.sdd-master/constitution.md` contém regras invioláveis. Qualquer violação deve gerar achado bloqueante.

## Project-state

`.sdd-master/project-state.md` registra fase atual, maturidade, próximo comando permitido, agente principal e arquivos de agente configurados.

## Arquivos de ambiente

Arquivos `.env` reais não devem ser versionados. Use apenas `.env.example` com placeholders seguros.

## `.sdd-master/`

Pode existir localmente para governança, mas não deve ser enviado ao remoto do produto sem política explícita.

## Secret scanning heurístico

`sdd master git` procura padrões suspeitos de chaves, tokens, URLs com credenciais, chaves privadas e arquivos sensíveis. O valor encontrado nunca deve ser impresso.

## Aprovação humana

Push, mudança de escopo, aceitação de risco e avanço de fase exigem autorização humana.

## Separação produto/governança

Commits de produto e commits internos de governança devem ser separados quando isso reduzir risco e melhorar revisão.
