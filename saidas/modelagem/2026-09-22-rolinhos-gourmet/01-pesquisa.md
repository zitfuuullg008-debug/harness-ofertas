# 01 — Pesquisa e leitura da concorrência

**Lastro:** Luciana Prado · `inlead.digital/rolinhos-gourmet` · minerado em 2026-09-22
**Profundidade:** completa (destino é página de vendas direta, não quiz/curso/VSL)
**Rodada:** `--auto`, 2026-09-22

---

## A oferta que serve de lastro

| Campo | Valor |
|---|---|
| Página | Luciana Prado (`878176412048107`) |
| Produto | Rolinhos gourmet — o relatório classificou como "salgado único pra fazer e vender" |
| Preço | R$ 9,90–19,90 (inferido pelo minerador, **não confirmado**) |
| Promessa | "Aprenda a fazer rolinhos gourmet." |
| Hook | "Aprenda a fazer rolinhos gourmet" |
| Link de venda | `https://inlead.digital/rolinhos-gourmet` |
| Anúncios ativos na página | **150** |
| Criativos da oferta | **60** (60 de 60 apontam pro mesmo link) |
| Dias rodando | 46 |
| Keyword de origem | "aprenda a fazer dinheiro" (nicho renda extra) |
| Biblioteca | https://www.facebook.com/ads/library/?id=1037695398665651 |
| Recorrente? | **Não.** `data/vistos.json` marca `primeiraVez: 2026-09-22`. Primeira aparição |

### O que os 60 criativos provam

Uma página com 150 anúncios ativos, **todos** apontando pro mesmo destino, rodando há 46
dias. Não é teste: é escala. O lastro de demanda está provado — esse público compra doce
de canela como produto de renda extra. Só isso é o que a oferta dela me dá.

---

## Correção factual: não é salgado, é doce

O relatório do dia diz "salgado único". Está errado, e a correção muda a oferta inteira.

Evidência colhida agora, no HTML cru da página de destino:

```
<meta property="og:title"    content="cinnamonroll">
<meta property="og:site_name" content="cinnamonroll">
<meta property="og:image:alt" content="cinnamonroll">
<meta property="og:url"      content="app.saboneteslucrativos.site">
```

"Rolinho gourmet" é **cinnamon roll** — rolinho de canela doce. Trabalho daqui pra frente
com doce.

O `og:url` apontando pra `app.saboneteslucrativos.site` também diz quem é a Luciana Prado:
o domínio do painel é de **sabonete**, não de confeitaria. É operador de mídia rodando
várias ofertas de renda extra no mesmo painel, não confeiteira com autoridade no doce.
Isso é um buraco dela — e uma vantagem disponível pra nós.

---

## O que não deu pra extrair da página dela, e por quê

A página é um Next.js da Inlead com o conteúdo inteiro **criptografado em AES** no
`__NEXT_DATA__`:

```
"props":{"pageProps":{"q":"T6207tQPDWoVXl1tXREB5ewPqlsK7ZU2FsdGVkX1+38GBiPPEnJU6TtJS…
```

O HTML servido tem 75.845 bytes e **12 caracteres de texto visível** ("cinnamonroll").
Sem navegador nesta sessão, não há como renderizar.

Então, honestamente:

| Item | Status |
|---|---|
| Preço real dela | **Não identificado** (os R$ 9,90–19,90 são inferência do minerador) |
| Bônus | **Não identificado** |
| Garantia | **Não identificado** |
| Mecanismo nomeado | **Não identificado** |
| Estrutura de blocos | **Não identificado** |
| Plataforma de checkout | **Não identificado** |
| Promessa | Conhecida pelo criativo: "Aprenda a fazer rolinhos gourmet" |
| Público | Renda extra (keyword "aprenda a fazer dinheiro"), PT-BR |
| Formato do destino | Página de vendas direta (não é quiz, curso nem VSL) |

Nada acima foi chutado. O que não deu pra ver ficou como "Não identificado" — e, como a
concepção é nossa e não cópia dela, isso não trava a Etapa 2.

---

## Pesquisa de mercado

### Quanto o cinnamon roll vende no varejo (é o que sustenta a conta de lucro)

| Praça | Preço |
|---|---|
| Faixa comum em padaria/cafeteria | R$ 6 a R$ 10 a unidade |
| Padaria em São Paulo | R$ 12 a unidade |
| Versão trançada | R$ 14 a unidade |
| Casa especializada (linha premium) | R$ 18,50 · R$ 21 · R$ 23,50 |
| Pack de 4, delivery artesanal | R$ 32,90 (≈ R$ 8,22 a unidade) |

Fontes: [Exame](https://exame.com/casual/4-lugares-para-provar-cinnamon-roll-em-sao-paulo/),
[Conexão Delícia](https://conexaodelicia.com/produto/cinnamon-roll/),
[Le Petit Marché](https://lepetitmarchegourmet.com.br/produtos/cinnamon-roll-4-unidades/),
[Santo Gostinho](https://www.santogostinho.com.br/cinamonn-roll-canela-90g),
[Prática](https://blog.praticabr.com/cinnamon-roll-doce-saboroso).

**A leitura que importa:** o insumo é farinha, açúcar, canela, manteiga e leite — barato e
de mercado de esquina ([Academia Assaí](https://www.academiaassai.com.br/noticia/cinnamon-rolls)).
O varejo cobra de R$ 8 a R$ 23. A distância entre as duas pontas é a oferta.

### Quem já vende curso disso

| Produto | Praça | Ângulo |
|---|---|---|
| Cinnamon Roll 2.0 — Nat Casagrande Cake's | Hotmart marketplace | clássico + 5 sabores novos |
| Curso Cinnamon Rolls com Fermentação Natural — Paneartt | Hotmart marketplace | levain, "fazer e vender" |
| Oficina de Cinnamon Rolls — The Cookie Shop | site próprio | oficina, logística de produção |
| Rollos de Canela — Alejandro Rodriguez | Hotmart ES | espanhol |
| Roles de Canela que Enamoran | Hotmart ES | espanhol, "hornear y emprender" |

Fontes: [Hotmart — Cinnamon Roll 2.0](https://hotmart.com/pt-br/marketplace/produtos/cinnamon-roll-2-0/N58367495J),
[Hotmart — Fermentação Natural](https://hotmart.com/pt-br/marketplace/produtos/curso-cinnamon-rolls-com-fermentacao-natural/L66564896S),
[The Cookie Shop](https://thecookieshop.wordpress.com/curso-online-oficina-de-cinnamon-rolls/),
[Hotmart ES — Rollos de Canela](https://hotmart.com/es/marketplace/productos/hagsxd-rollos-de-canela-e9wln/A101942648R),
[Hotmart ES — Roles que Enamoran](https://hotmart.com/es/marketplace/productos/roles-de-canela-que-enamoran-aprende-a-hornear-y-emprender-desde-casa/L101847530O).

### Contagem de concorrentes — como eu contei

Duas contagens, porque medem coisas diferentes:

**1. Tráfego pago (é o que define saturação de leilão).** Varri as 7 coletas de
`data/raw/2026-09-22/` — **291 anúncios, 210 ofertas distintas** em receitas, receitas
infantis, comida caseira, renda extra, maternidade, cristão e fitness. Filtrei por
`canela|cinnamon|rolinho|rocambole|enrolad|roll`: **8 ocorrências, 1 relevante** — a
própria Luciana Prado. As outras 7 são ruído (sermão, Instagram, WhatsApp sem número).

> **1 oferta de cinnamon roll em 210 ofertas rodando.**

**2. Marketplace (é o que define concorrência de conteúdo).** 3 produtos PT-BR e 2 ES.
Nenhum deles aparece na mineração — ou seja, nenhum está comprando tráfego em escala.

### O buraco que a pesquisa abre

Os três concorrentes PT-BR vendem a mesma coisa por baixo do nome: **oficina de
confeitaria**. Fermentação natural, levain, variedade de sabores, técnica.

Nenhum deles resolve o que trava quem quer **vender**:

1. **A massa toma o dia.** Fermentação natural pede levain vivo e horas de espera. Quem
   trabalha fora não produz.
2. **O produto esfria.** Cinnamon roll vendido frio é outro produto — é o quentinho que
   justifica R$ 12 a R$ 23. Ninguém ensina a resolver isso.
3. **Produz antes de vender.** Assa a fornada, sai oferecendo, sobra metade. É prejuízo
   com nome de estoque.

Os três problemas têm a mesma solução e ninguém a está vendendo. É por aí que a Etapa 2 vai.

### O que a Luciana Prado prova e o que ela não entrega

| Ela prova | Ela não entrega (verificável pelo criativo) |
|---|---|
| Que o público de renda extra clica em cinnamon roll | Promessa é de **hobby** ("aprenda a fazer"), não de dinheiro |
| Que dá pra escalar 60 criativos em 46 dias | Compra tráfego em "aprenda a fazer dinheiro" e entrega receita |
| Que o produto sustenta oferta de uma receita só | Não tem rosto, não tem autoridade no doce (painel é de sabonete) |

Ela paga por quem quer **ganhar** e entrega quem quer **cozinhar**. Esse vão é a nossa
entrada.

---

## O que entra na Etapa 2

- Produto: **cinnamon roll** (doce), mantido — saturação de 1 em 210 é baixa demais pra
  trocar de produto.
- Recorte a estreitar: **fazer e vender**, não "aprender a fazer".
- Gargalo real a atacar: massa longa, produto que esfria, produção antes da venda.
- Âncora de preço de varejo pra conta de lucro: **R$ 8 a R$ 23 a unidade**, insumo barato.
- Molde da página: **A, "fazer e vender"**, base `pão de queijo.html`.
