# DECISÕES — Cinnamon Roll Lucrativo

Rodada `--auto` de 2026-09-22. Cada linha abaixo é um ponto onde a skill teria parado e
perguntado "confirma?". Ninguém estava no teclado, então decidi. **Este arquivo é o gate.**
Discorde de qualquer linha e me diga qual — a etapa correspondente se refaz.

> Esta é a segunda passada nesta oferta. A primeira está em
> `2026-09-22-luciana-prado-v1-antigo/` e caiu no nome: **"Caixinha de Canela"** é
> embalagem + ingrediente, e não dizia que a oferta era de vender. O `CLAUDE.md` passou a
> citar esse nome como exemplo reprovado. Esta rodada refaz a concepção inteira.

---

## Etapa 1 — Pesquisa

| # | Decisão | Alternativa descartada | Por quê |
|---|---|---|---|
| 1 | Tratar como **doce** (cinnamon roll), contra o relatório do dia | Seguir o relatório, que diz "salgado único" | O `og:title` da página de destino é `cinnamonroll`. O relatório está errado |
| 2 | Extração da concorrente = **"Não identificado"** | Insistir em decifrar o payload AES da Inlead | A página serve 75.845 bytes e 12 caracteres de texto. Sem navegador na sessão. Preço, bônus, garantia e mecanismo dela ficaram em branco em vez de chutados |
| 3 | Profundidade **completa** mesmo assim | Tratar como rasa | O destino é página de vendas direta. A pesquisa de mercado rodou inteira; só a extração da concorrente ficou bloqueada |
| 4 | Contar saturação nos **210 anúncios minerados**, não no chute | Estimar "parece pouco concorrido" | Varri as 7 coletas de `data/raw/2026-09-22/`. 1 oferta de cinnamon roll em 210. Esse número é o insumo da Etapa 2 |

## Etapa 2 — Concepção

| # | Decisão | Alternativa descartada | Por quê |
|---|---|---|---|
| 5 | **Manter** o cinnamon roll | Deslocar pra brownie de pote, pão de mel, rosca ou bolo de pote | Saturação de 1 em 210. A regra manda manter produto com saturação baixa e demanda provada. O gargalo do lastro era a concepção, não o produto |
| 6 | Recorte no **gargalo de produção e sobra** | Recorte por sabor ou por variedade, como fazem os 3 concorrentes de marketplace | Os três vendem oficina de confeitaria. Nenhum resolve quando fazer, quanto cobrar e o que fazer com o que sobra. Zero concorrentes nesse recorte exato |
| 7 | Mecanismo por **fusão: Fornada Encomendada** | Só "a massa dorme na geladeira" ou só "venda antes de assar" | Ligação causal direta: é porque a massa espera crua que dá pra vender antes de assar. Uma resolve produção, a outra resolve sobra e preço |
| 8 | Nome **Cinnamon Roll Lucrativo** | "Rolinho de Canela Lucrativo" (tudo em português) | O termo em inglês é o que sustenta R$ 12 a unidade. "Rolinho de canela" sozinho rebaixa a oferta a pão doce de R$ 5 e derruba a conta de lucro. **Mitigação obrigatória:** o nome nunca aparece sem a glosa em português na primeira dobra |
| 9 | Nome do produto **≠** nome do mecanismo | Usar "Fornada Encomendada" como nome do produto | Dois ativos diferentes. Mecanismo virando nome queima os dois — está no `CLAUDE.md` |
| 10 | **6 bônus** | Cortar para 4, deixando só os que empurram a promessa | Plano único sustenta melhor a âncora de R$ 197 com seis. Os três mais fracos (fotos, lista, certificado) continuam tangíveis e todos têm número |
| 11 | Persona 1 (já vende, vê sobrar) a **70%**, persona 2 (nunca vendeu) a 30% | Escrever para quem nunca vendeu | Quem já vende já provou que vende e já superou a vergonha de oferecer. Converte mais barato. A secundária entra por duas portas só |
| 12 | **Não cravar custo de ingrediente** na página | Inventar "R$ 1,20 por rolinho" | Não há fonte confiável de preço de insumo pra hoje. A primeira pessoa que for ao mercado conferir derruba a oferta |

## Etapa 3 — Auditoria da concepção

| # | Decisão | Alternativa descartada | Por quê |
|---|---|---|---|
| 13 | Tirar o **"48 horas na geladeira"** do mecanismo | Manter o número, que é bom de copy | Afirmação técnica fechada sobre uma receita que ninguém testou. Virou "continua cru e gelado — é a fornada de amanhã" |
| 14 | **Manter** o nome em inglês, mas exigir a glosa | Trocar por um nome 100% em português | Ver decisão 8. A auditoria não derrubou o nome; obrigou a mitigação |
| 15 | **Manter** o bônus 6 (certificado), sabendo que é o mais fraco | Cortar, porque não empurra a promessa | É bônus validado: está na página de maior lucro do catálogo. E quebra "é coisa de amadora" na persona secundária |

## Etapa 4 — Página

| # | Decisão | Alternativa descartada | Por quê |
|---|---|---|---|
| 16 | Molde **A**, base `pão de queijo.html`, copiado e editado no lugar | Molde B, ou gerar HTML novo | Ela vai **vender** o que aprender. E o `pão de queijo.html` é a maior lucro e melhor ROAS das nove ofertas |
| 17 | **Nada enxertado** de `templates/blocos/` | Enxertar `planos-1-plano.html` e `garantia-30dias.html` | As duas peças **foram recortadas deste mesmo arquivo**. O molde já traz plano único a R$ 27,90, âncora R$ 197, garantia de 30 dias e o bloco `acesso`. Enxertar seria colar de volta o que já está lá |
| 18 | **Remover `depoimentos`** inteiro | Manter com placeholder, ou inventar aluna | O molde trazia "+17.800 alunas" e 9 depoimentos com nome e valor. Não há uma cliente real. Inventar é fraude e placeholder vazio é pior que ausência |
| 19 | **Remover `autoridade`** inteiro | Inventar uma chef, ou assumir que é você | O molde trazia "Chef Mari Dias" faturando R$7.000/mês. Quem assina a oferta é decisão sua, não minha. O bloco volta inteiro quando você decidir |
| 20 | Preço: **um plano, R$ 27,90** | Dois planos, R$ 17,90 + R$ 27,90 | A promessa da página é **vender**. Um básico sem as 30 encomendas, sem as 15 mensagens e sem as 10 fotos não cumpre a promessa do topo. Quebrar a oferta pra ganhar R$ 10 não paga |
| 21 | Reescrever a **calculadora** com um terceiro controle | Herdar o `CUSTO=8.5` do pão de queijo, ou apagar o bloco | Herdar afirma um custo que ninguém mediu. Apagar tira o bloco que o molde campeão tem. O terceiro controle é ela pondo o custo dela — e o H2 já era "Faça a conta você mesma" |
| 22 | Mexer no **script da calculadora** | Deixar o script intacto | A regra protege a máquina do molde (carrossel, FAQ, barra de progresso). O `CUSTO=8.5` é dado da oferta antiga, não design. Nenhum CSS, classe, fonte ou layout foi tocado |
| 23 | Baixar os **limites dos controles** da calculadora | Manter 15 caixas/dia e R$ 60 | Produzia "R$ 26 mil de sobra no mês". Promessa desse tamanho é risco de bloqueio de anúncio |

## O que sobrou em aberto na página

| Marcador | Onde | Quantos |
|---|---|---|
| `{{CHECKOUT}}` | bloco `planos` | 1 |
| `{{IMG:hero:1}}` | primeira dobra | 1 |
| `{{IMG:dor:1}}` | bancada com a sobra | 1 |
| `{{IMG:demo:1}}` a `:6` | carrossel dos 6 recheios | 6 |
| `{{IMG:produto:1}}` | mockup do produto | 1 |
| `{{IMG:bonus:1}}` a `:6` | capas dos 6 bônus | 6 |
| `{{IMG:planos:1}}` | mockup completo | 1 |

O `alt` de cada um é o briefing da foto — diz o que a imagem precisa mostrar.

## As duas coisas que eu mudaria se pudesse

1. **Decidir quem assina a oferta.** É o gargalo da auditoria e é a única vantagem sobre a
   concorrente que a página ainda não materializou — o painel dela é de sabonete, não de
   confeitaria.
2. **Testar a massa de 24 antes de subir.** O rendimento e as 12 horas de geladeira estão
   coerentes com as receitas levantadas, mas ninguém assou. É o único número da página que
   depende de você, e não de uma fonte.
