---
description: Puxa da Utmify só o que a tela atual do Termômetro precisa e grava em data/termometro/cache.json. Uso "/termometro hoje", "/termometro 7d", "/termometro 30d".
allowed-tools: Bash, Read, Write, Edit
---

O Termômetro do painel é o artifact de sempre, mas lê um cache local em vez de falar com a Utmify. Sua função é encher esse cache — **só do período pedido**.

Período em `$ARGUMENTS`: `hoje`, `ontem`, `7d`, `30d`, `mes`, `mespassado`. Vazio = `hoje`.

## A regra que importa: busque só o que a tela precisa

O artifact original atualiza em 10 segundos porque faz **1 + N chamadas em paralelo**, só do período visível. Buscar todos os períodos de uma vez leva mais de meia hora e não serve pra nada — o usuário está olhando uma tela só.

**Dispare todas as chamadas de um lote na MESMA mensagem**, pra elas irem em paralelo. Sequencial é o que torna isso lento.

## 1. A janela

`date +%Y-%m-%d` pra saber hoje — não deduza. Fuso **-03:00**, formato `AAAA-MM-DDTHH:MM:SS-03:00`.

| Período | de | até |
|---|---|---|
| `hoje` | hoje T00:00:00 | hoje T23:59:59 |
| `ontem` | ontem T00:00:00 | ontem T23:59:59 |
| `7d` | hoje−6 T00:00:00 | hoje T23:59:59 |
| `30d` | hoje−29 T00:00:00 | hoje T23:59:59 |
| `mes` | dia 1 deste mês | hoje T23:59:59 |
| `mespassado` | dia 1 do mês passado | último dia do mês passado T23:59:59 |

## 2. As chamadas

1. **`get_dashboards {}`** — uma. Cada dashboard é uma oferta; o que tem "geral" no nome é o consolidado.
2. **`get_dashboard_summary {dashboardId, dateRange:{from,to}}`** — todos os dashboards, **inclusive o geral**, na janela do período. Todas na mesma mensagem.
3. **Só quando o período tiver mais de um dia**: `get_dashboard_summary` do dashboard **geral** para cada dia da janela, em lotes de 6 por mensagem. É o que desenha os gráficos. Num período de um dia só isso **não é preciso** — os gráficos saem da série horária que já veio no passo 2.

Campanhas (`get_meta_ad_objects`) **não** entram aqui: o painel busca sob demanda quando o usuário abre uma oferta.

Se uma chamada falhar, pule e siga. Não repita mais de duas vezes.

## 3. Some ao cache, não o substitua

Leia `data/termometro/cache.json` se existir. **Mantenha as chamadas que já estão lá** e acrescente/atualize as deste período. Assim os outros períodos que já foram baixados continuam instantâneos.

```json
{
  "atualizadoEm": "<ISO de agora>",
  "chamadas": [
    { "ferramenta": "get_dashboards", "entrada": {}, "payload": <resposta crua> },
    { "ferramenta": "get_dashboard_summary", "entrada": {"dashboardId":"...","dateRange":{"from":"...","to":"..."}}, "payload": <resposta crua> }
  ]
}
```

`entrada` é **exatamente** o objeto que você passou — o painel casa a chave por ele.

### O `payload` vai ENXUTO, e isso é o que faz a atualização ser rápida

A resposta da Utmify é grande, e **o Termômetro lê só uma fatia dela**. Como cada byte que você grava passa por você em texto, gravar a resposta inteira é o que torna isso lento. Então copie **exatamente estes campos**, com os mesmos nomes e a mesma forma aninhada, e **descarte o resto**:

```json
{
  "statistics": {
    "comissions": { "gross": 0, "net": 0, "pendingGrossRevenue": 0, "refundedGrossRevenue": 0 },
    "ads": { "spent": 0, "clicks": 0, "pageViews": 0, "initiateCheckouts": 0 },
    "analytics": { "profit": 0, "avgTicket": 0, "cpa": 0 },
    "refundRate": 0
  },
  "ordersCount": {
    "approved": 0, "total": 0, "pending": 0, "refunded": 0,
    "byProductName": [ { "productName": "", "count": 0, "revenue": 0 } ]
  },
  "hourlyCumulative": {
    "revenueByHourNetCumulative": [ { "cents": 0 } ],
    "revenueByHourGrossCumulative": [ { "cents": 0 } ],
    "investmentByHourCumulative": [ { "cents": 0 } ],
    "profitByHourNetCumulative": [ { "cents": 0 } ],
    "profitByHourGrossCumulative": [ { "cents": 0 } ]
  }
}
```

**Não invente campo que não veio** — se a Utmify não mandou, deixe de fora. **Não converta valor nenhum**: os números vão em centavos, como chegaram. As séries de `hourlyCumulative` mantêm as 24 posições e o formato `{ "cents": N }`, porque é assim que o Termômetro lê.

Para `get_dashboards`, guarde a lista como veio (é pequena). Para `get_meta_ad_objects`, guarde `results` e `untrackedCount`.

Duas entradas com a mesma `ferramenta` e a mesma `entrada` não podem coexistir: a nova substitui a velha.

## 4. Responda em 1 linha

O período, quantas chamadas entraram e quantas falharam.
