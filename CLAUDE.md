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
| `saidas/modelagem/` | Material do pipeline MVT quando o usuário escolhe uma oferta pra modelar (`/modelar`). |
| `.claude/commands/` | `/minerar` (rodada diária), `/modelar` (oferta → página MVT), `/ideias`, `/criativos`, `/semana`. |

## Rodada diária (o scraping é do Ad Hunter, não daqui)

A coleta **não é feita neste projeto**. Quem minera é o **Ad Hunter** (`C:\Users\maria\Desktop\ad-hunter`), que o usuário roda ~2x por semana: ele já tem proxy residencial, categorias configuradas, filtro low-ticket por IA e exclusão de destino WhatsApp. O resultado fica no Supabase dele, na tabela `category_scrape_cache`.

1. **06:00** — a tarefa `HarnessOfertas` do Windows roda `/minerar`:
   - `scripts/importar-adhunter.mjs` lê o cache do Ad Hunter para `data/raw/<data>/`
   - o agente **minerador** filtra, monta o pool e marca as `recomendadas`
   - `scripts/enriquecer.mjs` conta criativos reais, confere o destino do link e salva o dossiê da página
   - `scripts/render-relatorio.mjs` gera HTML + MD; o commit publica no site
2. GitHub Pages: https://zitfuuullg008-debug.github.io/harness-ofertas/

**Nicho com cache velho:** o relatório avisa e o usuário roda aquela categoria no Ad Hunter. `scripts/minerar.mjs` (scraper próprio) fica como plano B — só com `--coletar`, porque gasta banda/proxy e arrisca bloqueio da Meta.

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
4. **Unidade = oferta** (página + link de venda), não criativo nem página. **Sinais de escala** (do mais forte pro mais fraco): criativos rodando pra oferta → total de anúncios ativos da página (o "~N resultados" da Meta) → `collation_count` → dias rodando → impressões. Uma oferta com 10+ criativos numa página com 30+ anúncios há 30+ dias está escalando. Sempre mostre "anúncios na página" e "criativos da oferta". O relatório entrega um pool de `ofertasNoTotal` (config, hoje 10), com `recomendadas` (3) marcadas como "★ modelar" — o usuário escolhe uma e roda `/modelar`, que entra no plugin `criador-de-pagina-mvt-2-0`. **Só oferta com página de vendas** — destino WhatsApp/Instagram/Messenger é descartado. **Régua dura:** só entra oferta com **15+ criativos rodando no mesmo destino** (`minCriativosDaOferta`) — quanto mais, melhor. O número da busca é subestimado; o real vem do `enriquecer.mjs`, que também salva o dossiê da página em `data/raw/<data>/paginas/` pro agente montar o card na oferta dominante. **"Anúncios ativos na página"** é o outro número que importa: `scripts/enriquecer.mjs` preenche ele depois da escolha.
5. **Não repita.** Confira `data/vistos.json` e os relatórios anteriores em `saidas/` antes de apresentar algo como novidade. Se já apareceu, diga "recorrente (3ª semana)" — isso é sinal forte, não ruído.
6. **Saída sempre em arquivo** com data no nome (`saidas/<tipo>/AAAA-MM-DD.*`), e uma linha de resumo no chat. O usuário quer abrir o arquivo, não ler parede de texto. **Formato didático, por card:** anúncios ativos → produto → por que está escalando → como modelar. Bullets curtos (≤ 15 palavras), nada de parágrafo longo.
7. **Copy em PT-BR falado**, nas regras da skill `criativos-meta` (sem preço na copy, sem promessa de faturamento solto, valor amarrado à atividade concreta).
7. Não instale dependências novas, não altere `scripts/minerar.mjs` sem pedir.
