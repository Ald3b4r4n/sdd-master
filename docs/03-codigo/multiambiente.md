# Compatibilidade Multiambiente

O SDD Master oferece o mesmo fluxo de onboarding e diagnóstico em Windows, Linux e macOS.

Os caminhos gerenciados passam pela camada central de path safety. Exemplos e testes usam caminhos relativos, diretórios temporários e APIs Node.js multiplataforma.

```bash
sdd master init
sdd master onboard --profile="web"
sdd master doctor --path-safety
```

Nenhum fluxo deve depender de `find` Unix, gravar fora do projeto consumidor ou criar `.sdd-master/` na raiz do pacote.
