---
description: Rodada completa da semana — minera ofertas, gera ideias e gera criativos, nessa ordem, cada etapa com agente próprio.
allowed-tools: Agent, Read, Bash
---

Execute as três etapas EM SEQUÊNCIA (cada uma depende da anterior), sempre com `run_in_background: false`:

1. Agent `subagent_type: "minerador"` — "Minere as ofertas escaladas de hoje, todos os nichos. Siga seu processo completo e escreva em saidas/mineracao/."
2. Agent `subagent_type: "ideador"` — "Gere as ideias de oferta da semana a partir do relatório de mineração de hoje. Siga seu processo completo e escreva em saidas/ideias/."
3. Agent `subagent_type: "criativos"` — "Gere os criativos da semana pra todos os produtos em produtos/. Carregue a skill criativos-meta primeiro. Siga seu processo completo e escreva em saidas/criativos/."

Se a etapa 1 falhar (scraper bloqueado), pule a 2 e rode a 3 mesmo assim usando o relatório de mineração mais recente que existir.

No fim, responda com 3 linhas — uma por etapa — cada uma com o caminho do arquivo como link clicável e o destaque daquela etapa.
