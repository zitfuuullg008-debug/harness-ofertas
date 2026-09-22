# harness-ofertas

Sistema de mineração de ofertas escaladas no Meta Ads + geração semanal de ângulos de criativos.
Tudo em português do Brasil. Nichos: receitas, receitas infantis, renda extra com comida caseira,
renda extra, cristão, maternidade (ver `config/nichos.json`; fitness está desligado — nicho black).

## Mapa

| Pasta / arquivo | O que é |
|---|---|
| `config/nichos.json` | Nichos e keywords que o minerador vasculha. Edite aqui pra adicionar nicho. |
| `produtos/*.md` | Uma ficha por produto do usuário (promessa, preço, público, mecanismo, copy vencedora). `_TEMPLATE.md` é o modelo. Arquivos começando com `_` são ignorados. |
| `scripts/minerar.mjs` | Scraper Playwright da Biblioteca de Anúncios. Gera `data/raw/<data>/resumo.json`. |
| `scripts/render-relatorio.mjs` | Transforma o JSON do minerador em `<data>.html` (cards visuais com vídeo) + `<data>.md` curto, e baixa as mídias. |
| `data/raw/<data>/` | Coleta bruta do dia. `resumo.json` é o arquivo compacto que os agentes leem. |
| `data/vistos.json` | Histórico de ofertas e páginas já vistas (marca o que é novo). |
| `saidas/mineracao/` | Relatórios de ofertas escaladas (agente **minerador**). |
| `saidas/ideias/` | Ideias de ofertas novas por nicho (agente **ideador**). |
| `saidas/criativos/` | Ângulos/variações de copy por produto (agente **criativos**). |
| `.claude/agents/` | Os 3 agentes. Cada um roda com contexto próprio. |
| `.claude/commands/` | `/minerar`, `/ideias`, `/criativos`, `/semana`. |

## Rodada diária (automática, sem o PC do usuário)

1. **05:00** — GitHub Actions (`.github/workflows/minerar.yml`) coleta via proxy residencial (segredo `PROXY_URL`) e comita `data/raw/<data>/`. Roda `nichosPorDia` nichos em **rodízio** (3 por dia entre os `ativo != false`).
2. **06:00** — rotina do Claude na nuvem lê a coleta, classifica, escolhe as `ofertasNoTotal` (3) melhores do dia, renderiza e comita `saidas/` + `index.html`.
3. GitHub Pages publica: https://zitfuuullg008-debug.github.io/harness-ofertas/

**Banda é dinheiro:** o proxy é pago por GB. Não aumente keywords, nichos por dia ou `--max` sem necessidade; não rode o scraper "pra testar" — use a coleta já commitada em `data/raw/`.

## Como rodar

```bash
node scripts/minerar.mjs                    # todos os nichos (~10–20 min)
node scripts/minerar.mjs --nicho receitas   # um nicho
node scripts/minerar.mjs --sem-enrich       # mais rápido, sem contar anúncios por página
```

Depois: `/minerar` (relatório + filtro low-ticket), `/ideias`, `/criativos`, ou `/semana` (tudo).

## Regras pros agentes

1. **Nunca gere no escuro.** Ideia de oferta e ângulo de criativo sempre nascem de um lastro: anúncio escalado minerado, ficha de produto do usuário ou pesquisa feita agora.
2. **Nada de nicho black.** O usuário não trabalha com saúde: descarte qualquer oferta que prometa tratar/curar doença (fígado, diabetes, visão, câncer, pressão), emagrecimento como resultado médico, remédio natural, detox ou protocolo clínico — mesmo escalando muito, mesmo vinda de busca por "receitas". Receituário para restrição alimentar (sem glúten, para diabético) é aceitável quando vende comida, não tratamento. Preferência: renda extra, receitas, maternidade/educação infantil, cristão.
3. **Low-ticket digital só.** Ao filtrar ofertas mineradas, aplique os critérios MVT (produto digital, mecanismo simples, consumo rápido, DIY, mercado ciente do problema). Rejeite físico, SaaS, restaurante, mentoria, agência, consultoria, marca pessoal genérica.
4. **Unidade = oferta** (página + link de venda), não criativo nem página. **Sinais de escala** (do mais forte pro mais fraco): criativos rodando pra oferta → total de anúncios ativos da página (o "~N resultados" da Meta) → `collation_count` → dias rodando → impressões. Uma oferta com 10+ criativos numa página com 30+ anúncios há 30+ dias está escalando. Sempre mostre "anúncios na página" e "criativos da oferta". O relatório entrega `ofertasNoTotal` (config, hoje 3) ofertas — as melhores do dia entre os nichos do rodízio.
5. **Não repita.** Confira `data/vistos.json` e os relatórios anteriores em `saidas/` antes de apresentar algo como novidade. Se já apareceu, diga "recorrente (3ª semana)" — isso é sinal forte, não ruído.
6. **Saída sempre em arquivo** com data no nome (`saidas/<tipo>/AAAA-MM-DD.*`), e uma linha de resumo no chat. O usuário quer abrir o arquivo, não ler parede de texto. **Formato didático, por card:** anúncios ativos → produto → por que está escalando → como modelar. Bullets curtos (≤ 15 palavras), nada de parágrafo longo.
7. **Copy em PT-BR falado**, nas regras da skill `criativos-meta` (sem preço na copy, sem promessa de faturamento solto, valor amarrado à atividade concreta).
7. Não instale dependências novas, não altere `scripts/minerar.mjs` sem pedir.
