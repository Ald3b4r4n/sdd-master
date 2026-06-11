# Política de Segurança

## Reporte Responsável

Não abra issue pública contendo segredo, token, senha, chave privada, certificado, credencial, dado pessoal ou qualquer evidência sensível.

Se encontrar uma vulnerabilidade, reporte de forma responsável ao mantenedor do projeto por um canal privado combinado previamente. Quando o repositório público estiver ativo, este documento será atualizado com o canal oficial de contato.

## Segredos e Credenciais

- Nunca exponha tokens, senhas, chaves privadas, certificados ou credenciais.
- Nunca versione `.env` real.
- Use apenas placeholders em arquivos de exemplo.
- Remova dados sensíveis de logs, prints, relatórios e testes.

## Secret Scanning Futuro

O projeto deverá adotar verificações automatizadas para detectar segredos antes de commits, releases e publicações. Até lá, toda contribuição deve passar por revisão manual cuidadosa.

## Dependências

Mantenha dependências em quantidade mínima e revise riscos antes de adicionar novos pacotes. Dependências devem ter propósito claro, manutenção ativa e uso compatível com a licença do projeto.

## Skills e Ferramentas Externas

Skills, agentes e automações externas devem ser tratados como código de terceiros. Revise permissões, entradas, saídas e acesso a arquivos antes de usar qualquer integração em fluxo sensível.
