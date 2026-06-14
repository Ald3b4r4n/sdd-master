# Breaking Changes

## Política pós-1.0

Em `1.0.0`, o contrato público está estável.

Qualquer breaking change daqui para frente exige nova versão major.

## Permitido

- Adicionar flags opcionais.
- Adicionar campos JSON.
- Melhorar mensagens e templates.
- Tornar checks mais restritivos.

## Proibido sem major

- Remover comando público.
- Remover flag pública.
- Quebrar JSON documentado.
- Enfraquecer path safety, redaction ou supply chain.
- Executar publish, deploy ou plugin automaticamente.
