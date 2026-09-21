---
description: Gera ideias de ofertas novas e melhorias nos produtos a partir da mineração mais recente (Metodologia MVT). Escreve em saidas/ideias/.
allowed-tools: Agent, Read
---

Use o Agent tool com `subagent_type: "ideador"` e este prompt:

"Gere as ideias de oferta da semana a partir do relatório de mineração mais recente e das fichas em produtos/. $ARGUMENTS
Siga seu processo completo e escreva em saidas/ideias/."

Rode com `run_in_background: false`. Quando terminar, repasse a linha de resumo e o caminho do arquivo como link clicável.
