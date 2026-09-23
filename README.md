# harness-ofertas

Minera ofertas de produto digital low-ticket que estão **escalando no Meta Ads**, propõe ofertas novas pra você, e toda semana gera **ângulos de criativo prontos pra gravar** pra cada produto seu — sem você precisar escrever nada.

## O Painel (app de desktop)

Dê dois cliques em **"Painel de Ofertas"** no Desktop. Abre uma janela limpa, sem barra de
navegador, e tudo roda no seu computador — nada vai pra nuvem.

Lá dentro:

| Aba | Pra quê |
|---|---|
| **Início** | Os números do dia e os botões grandes: minerar, gerar criativos, gerar ideias, atualizar o Ad Hunter. |
| **Ofertas** | As ofertas do relatório em cards, com vídeo, "anúncios ativos", "criativos da oferta", por que escala e como modelar. Dá pra favoritar, filtrar por nicho e abrir a **Biblioteca de anúncios** do anunciante. |
| **Páginas** | As páginas de venda que o MVT já montou. |
| **Criativos** | Seus produtos e os ângulos/variações de copy gerados. |
| **Ideias** | Sugestões de oferta nova. |
| **Automações** | Liga, desliga e roda na hora as tarefas agendadas. |
| **Ajustes** | Tamanho do pool, quantas vêm com ★, a régua de criativos, e os nichos/palavras-chave. |

Quando você clica em **★ Modelar página**, o Claude roda o pipeline MVT inteiro sozinho —
pesquisa de mercado, Raio-X da concorrência, modelagem, copy, página de vendas e auditoria — e
grava tudo em `saidas/modelagem/`. Onde a metodologia pediria a sua confirmação, ele decide e
anota a escolha (e a alternativa que descartou) em `DECISOES.md`: é por ali que você revisa e
pede ajuste. As imagens na Atomicat e o app entregável ficam pra você, com o briefing pronto.

Se preferir decidir fase por fase, o botão **⌨ com você** abre o Claude numa janela.

Enquanto algo roda, um painelzinho no canto mostra ao vivo o que o Claude está fazendo.

Se o atalho sumir: o arquivo é `Painel de Ofertas.vbs`, na pasta do projeto.

## Como funciona (engenharia de harness)

Três agentes, cada um com contexto próprio (um não contamina o outro), ligados por arquivos:

```
config/nichos.json ──► scripts/minerar.mjs ──► data/raw/<data>/resumo.json
                                                        │
                                          ┌─────────────▼─────────────┐
                                          │  agente MINERADOR          │  filtra low-ticket, ranqueia
                                          │  → saidas/mineracao/       │  3 ofertas por nicho
                                          └─────────────┬─────────────┘
                     produtos/*.md ───────────┬─────────┴──────────┐
                                              ▼                    ▼
                               ┌──────────────────┐  ┌──────────────────────┐
                               │ agente IDEADOR    │  │ agente CRIATIVOS      │  usa a skill
                               │ → saidas/ideias/  │  │ → saidas/criativos/   │  criativos-meta
                               └──────────────────┘  └──────────────────────┘
```

O scraper replica a técnica do Ad Hunter (intercepta o GraphQL da Biblioteca de Anúncios num Chromium headless) sem depender dele. O "score de escala" pondera: total de anúncios ativos da página, `collation_count` (mesmo criativo em N anúncios), dias rodando, quantos anúncios apareceram no lote, impressões.

## Comandos (dentro do Claude Code, nesta pasta)

| Comando | O que faz |
|---|---|
| `/minerar` | Roda o scraper (se ainda não rodou hoje) e escreve o relatório de ofertas escaladas. `/minerar receitas` faz só um nicho. |
| `/ideias` | Lê a mineração + suas fichas de produto e propõe ofertas novas / melhorias (MVT). |
| `/criativos` | Pra cada produto em `produtos/`, 3 ângulos novos + 5 hooks, seguindo a skill `criativos-meta`. |
| `/semana` | Os três em sequência. É o que roda automaticamente na terça. |

## Setup (uma vez)

1. `npm install` (já feito).
2. Preencha `produtos/` — copie `_TEMPLATE.md` pra cada produto. **Sem ficha, o agente de criativos não gera** (de propósito).
3. Ajuste `config/nichos.json` se quiser mais/menos nichos ou keywords.
4. Escolha como automatizar (diário às 6h):

   **Opção A — nuvem, PC desligado (recomendado).** O projeto fica num repositório GitHub; uma *routine* do Claude Code roda todo dia às 6h (horário de Brasília) no sandbox da Anthropic, minera, classifica, gera o relatório e faz commit. Com o GitHub Pages ligado, o relatório vira um site: `https://<usuario>.github.io/harness-ofertas/`. Configuração em `scripts/nuvem.sh` + prompt da routine (ver seção abaixo). Gerencie em https://claude.ai/code/routines.

   **Opção B — PC em suspensão.** Agendador do Windows acorda o PC às 6h:

   ```powershell
   powershell -ExecutionPolicy Bypass -File scriptsgendar.ps1
   ```

   Aparece no Agendador de Tarefas (Win+R → `taskschd.msc`) como `HarnessOfertas`. Abre o HTML no navegador quando termina. Remover: `Unregister-ScheduledTask -TaskName "HarnessOfertas" -Confirm:$false`.

## Rotina na nuvem (Opção A) — como funciona

Duas peças, porque o sandbox da nuvem do Claude não deixa o navegador sair direto pra internet:

1. **GitHub Actions** (`.github/workflows/minerar.yml`) — todo dia às 05:00 (Brasília) roda o scraper com internet aberta e o proxy residencial (segredo `PROXY_URL` no repositório), e comita `data/raw/<data>/` no repositório. Mantém os últimos 10 dias.
2. **Rotina do Claude** (claude.ai/code → Rotinas) — às 06:00 lê a coleta do dia, age como o agente minerador (filtra low-ticket, escolhe as 4 melhores), renderiza com `--so-thumbs` e comita `saidas/` + `index.html`. Se a coleta ainda não existir, `scripts/nuvem.sh` dispara o workflow e espera.
3. **GitHub Pages** publica o site a cada commit: https://zitfuuullg008-debug.github.io/harness-ofertas/

Teste manual: GitHub → Actions → "Minerar ofertas" → Run workflow (dá pra limitar nichos/anúncios).

## Rodar o scraper na mão

```bash
node scripts/minerar.mjs                      # todos os nichos (10–20 min)
node scripts/minerar.mjs --nicho cristao      # um nicho
node scripts/minerar.mjs --sem-enrich         # mais rápido
node scripts/minerar.mjs --headful            # ver o navegador (debug)
```

Se a Meta começar a bloquear (rate limit), o script pausa 90s sozinho. Se persistir, espere algumas horas — o Ad Hunter resolve isso com proxy residencial; aqui, pra uma rodada por semana, não costuma precisar.

## Logs

Execuções automáticas ficam em `logs/`. Se a terça não gerou arquivo em `saidas/criativos/`, olhe o log mais recente.
