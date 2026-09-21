---
description: Gera 3 ângulos novos de criativo + variações de hook pra cada produto em produtos/, seguindo a skill criativos-meta. Escreve em saidas/criativos/. Opcional: nome de um produto pra gerar só dele.
allowed-tools: Agent, Read
---

Use o Agent tool com `subagent_type: "criativos"` e este prompt:

"Gere os criativos da semana. $ARGUMENTS
Se o argumento acima citar um produto, gere só pra ele; senão, pra todos em produtos/. Siga seu processo completo (carregue a skill criativos-meta primeiro) e escreva em saidas/criativos/."

Rode com `run_in_background: false`. Quando terminar, repasse a linha de resumo e o caminho do arquivo como link clicável.
