---
description: Minera ofertas escaladas no Meta Ads por nicho (roda o scraper se ainda não rodou hoje) e gera o relatório em saidas/mineracao/. Opcional: passe o id de um nicho (ex. /minerar receitas).
allowed-tools: Agent, Read, Bash
---

Use o Agent tool com `subagent_type: "minerador"` e este prompt:

"Minere as ofertas escaladas de hoje. $ARGUMENTS
Se o argumento acima for o id de um nicho de config/nichos.json, rode só ele; se estiver vazio, rode todos. Siga seu processo completo e escreva o relatório em saidas/mineracao/."

Rode com `run_in_background: false` (o próximo passo depende do resultado). Quando terminar, repasse ao usuário a linha de resumo do agente e o caminho do arquivo como link clicável.
