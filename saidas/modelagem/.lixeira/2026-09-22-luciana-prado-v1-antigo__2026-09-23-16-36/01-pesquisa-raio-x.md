# Fase 1 — Pesquisa de Mercado + Raio-X da concorrência

**Oferta-lastro:** Luciana Prado — "Rolinhos gourmet"
**Data:** 2026-09-22 · **Modo:** `--auto` (headless)
**Link de venda analisado:** https://inlead.digital/rolinhos-gourmet
**Biblioteca de Anúncios:** https://www.facebook.com/ads/library/?id=1037695398665651

---

## 0. Correção de leitura antes de tudo

O relatório de mineração classificou a oferta como **"receita de salgado único"**. Está errado.

| Evidência | O que diz |
|---|---|
| `og:title` da página de vendas | `cinnamonroll` |
| Thumbs de 5 criativos distintos, inspecionados | rolo espiralado de massa doce, cobertura de cream cheese, calda de doce de leite, versão red velvet |
| Nome comercial no Brasil | cinnamon roll / rolinho de canela |

**"Rolinhos gourmet" é cinnamon roll — doce, não salgado.** Toda a modelagem abaixo parte disso.
Vale corrigir o card no relatório do dia.

---

## 1. Pesquisa de Mercado (Fase 0 obrigatória)

### 1.1 O produto tem mercado — e tem preço

| Dado | Número | Fonte |
|---|---|---|
| Preço de 1 cinnamon roll em cafeteria de SP | R$ 10 a R$ 19 | [Exame](https://exame.com/casual/4-lugares-para-provar-cinnamon-roll-em-sao-paulo/), [Guia da Semana](https://www.guiadasemana.com.br/restaurantes/galeria/onde-comer-cinnamon-roll-em-sao-paulo) |
| Unidade com cobertura de cream cheese | R$ 17,90 (Bakebun Bakery) | [Guia da Semana](https://www.guiadasemana.com.br/restaurantes/galeria/onde-comer-cinnamon-roll-em-sao-paulo) |
| Caixa com 4 unidades, delivery artesanal | R$ 32,90 | [Conexão Delícia](https://conexaodelicia.com/produto/cinnamon-roll/) |
| Ingredientes da base | farinha, açúcar, canela, manteiga, leite — "baixo custo, boa margem de lucro" | [Academia Assaí](https://www.academiaassai.com.br/noticia/cinnamon-rolls) |
| Venda em evento, negócio especializado | ~120 unidades por evento | [Correio Braziliense](https://www.correiobraziliense.com.br/revista-do-correio/2022/01/4976324-aprendiz-de-confeiteiro-abre-negocio-proprio-especializado-em-cinnamon-rolls.html) |

**Leitura minha:** este é o detalhe que sustenta a oferta inteira. Ingrediente de padaria comum
virando item de R$ 12–18 é uma diferença que a pessoa entende sem precisar de planilha. O
concorrente tem esse trunfo na mão e **não usa** — ver Raio-X.

### 1.2 O momento é agora (tendência, não moda morta)

| Dado | Número | Fonte |
|---|---|---|
| Novos negócios de panificação em 2 anos (2024–2025) | +75 mil, crescimento de 26% | [Boletim Trends CE, jun/2026](https://empreender.boletimtrendsce.com.br/2026/06/08/padarias-e-confeitarias-ganham-75-mil-novos-negocios-em-dois-anos-veja-quem-esta-lucrando-com-a-tendencia/) |
| Padarias + confeitarias ativas no Brasil | 304 mil estabelecimentos | mesma fonte |
| Cinnamon roll em confeitaria/panificação | listado como tendência para 2026 | [Gradina](https://gradina.com.br/blog/tendencias-em-confeitaria-e-panificacao-para-o-ano-de-2026), [Tagme](https://tagme.com.br/tendencias-para-cafeterias/) |
| Origem do interesse | viralizou primeiro nas redes, depois entrou na padaria artesanal | [Prática](https://blog.praticabr.com/cinnamon-roll-doce-saboroso) |

**Leitura minha:** produto que já nasce com demanda aquecida — quem vende não precisa explicar
o que é. Isso corta a maior objeção de quem começa ("será que alguém compra?").

### 1.3 Quem é a compradora

| Dado | Número | Fonte |
|---|---|---|
| Brasileiros que fizeram bico informal nos últimos 12 meses pra fechar o orçamento | 60% | [Pesquisa BB / capitais](https://vtvnews.com.br/noticias/brasil/renda-extra-trabalho-informal-pesquisa-capitais-bb/) |
| Negócios informais de alimentação liderados por mulheres | 6 em cada 10 | Sebrae, via [Marcas e Mercados](https://marcasemercados.com.br/confeitaria-deixa-de-ser-renda-extra-e-se-consolida-como-negocio-para-milhares-de-brasileiras) |
| Mulheres à frente de negócios no Brasil (2025) | 10,4 milhões — +27% na década | Sebrae, mesma fonte |
| Brasileiras que desejam empreender | 57% | Fiocruz/UFMG, mesma fonte |
| Idade das empreendedoras do setor | 60%+ entre 31 e 51 anos | Pesquisa Sebrae Minas, 4ª ed. |
| Têm filhos | 6 em cada 10 | mesma fonte |
| **Possuem CNPJ** | **só 37%** | mesma fonte |
| Comunidade de confeiteiras "Empreendendo no Lar" | 240 mil participantes | mesma fonte |

**Leitura minha:** o dado dos 37% com CNPJ é o retrato da persona. Ela não quer abrir empresa,
não quer curso de negócio, não quer ser empreendedora. Ela quer **vender doce e receber por Pix**
sem mudar de vida. Qualquer copy que fale "monte seu negócio" fala com a pessoa errada.

### 1.4 Mapa de preço do nicho vizinho (renda extra com comida)

| Oferta | Preço | Fonte |
|---|---|---|
| Curso de Geladinho Gourmet (+95 receitas) | R$ 47 | [Inspirações Lucrativas](https://inspiracoeslucrativas.com/curso-de-geladinho-gourmet/) |
| Manual da Renda Extra – Geladinho Gourmet (50+ receitas, 40 videoaulas) | low ticket, plataforma Hotmart | [zCursos](https://zcursos.me/manual-da-renda-extra-geladinho-gourmet-natanael-henrique) |
| Faixa praticada nas ofertas mineradas do dia (relatório 2026-09-22) | R$ 7 a R$ 19,90 | `saidas/mineracao/2026-09-22.json` |
| Taxa de plataforma (referência de margem) | Kiwify 4,99% + R$ 0,50 · Hotmart 9,9% + R$ 2,49 | [FreelaSemCrise](https://www.freelasemcrise.com.br/blog/hotmart-kiwify-eduzz-comparativo) |

**Vazio encontrado:** existe curso de confeitaria genérico (dezenas de receitas) e existe receita
solta de cinnamon roll de graça em blog. **Não existe, no low ticket, o produto único
cinnamon roll vendido com precificação e roteiro de venda junto.** É esse buraco que a nossa
oferta ocupa.

---

## 2. Raio-X da concorrência — Luciana Prado

### 2.1 Sinais de escala (o motivo de ela estar aqui)

| Métrica | Valor |
|---|---|
| Anúncios ativos na página | 150 |
| Criativos coletados | 60 |
| Criativos apontando pro mesmo destino | **60 de 60 (100%)** |
| Dias rodando | 46 |
| Ofertas na página | 1 |
| Destino | `inlead.digital/rolinhos-gourmet` — página de vendas |

Página inteira num link só, há mês e meio. Não é teste: é escala com convicção.

### 2.2 Extração da oferta

| Campo | O que foi encontrado |
|---|---|
| Nome do produto | **Não identificado** — a página é Next.js com payload criptografado (`Salted__`/AES); o HTML servido tem só a palavra `cinnamonroll` |
| Promessa | "Aprenda a fazer rolinhos gourmet" |
| Mecanismo | **Não identificado** |
| Preço | **Não identificado** (relatório infere R$ 9,90–19,90 pela faixa do nicho) |
| Bônus | **Não identificado** |
| Garantia | **Não identificado** |
| Prova social | **Não identificado** |
| Checkout | **Não identificado** |
| Autora / especialista | **Não identificado** — "Luciana Prado" é o nome da página do Facebook, não aparece rosto nem assinatura nos criativos |

### 2.3 Os criativos — 60 anúncios, uma linha de copy

Os 60 criativos têm **texto, título e CTA idênticos**:

- Texto: `Aprenda a fazer rolinhos gourmet ✨`
- Título: `Clica em saiba mais`
- CTA: `Saiba mais`

O que muda é só o vídeo. Pelos thumbs inspecionados: ASMR de confeitaria — mão puxando o rolo
da forma, saco de confeitar descendo o creme, bandeja de red velvet sendo coberta. Sem rosto,
sem narração de autoridade, sem preço na tela.

**Isto é uma operação de mídia, não de conteúdo.** O teste roda 100% no vídeo; a copy é uma
constante. É barato de escalar e é exatamente por isso que funciona.

### 2.4 A descoberta que muda o jogo

O `og:url` da página de vendas é `app.saboneteslucrativos.site`.

A página de cinnamon roll foi publicada **na mesma conta de page builder de uma oferta de
sabonetes artesanais**. Somando ao fato de não existir rosto, nome ou assinatura em nenhum
dos 60 criativos:

> "Luciana Prado" não é uma confeiteira com audiência. É um operador de tráfego rodando um
> portfólio de ofertas low ticket de renda extra, e cinnamon roll é a vez da bola.

Repare que o relatório do dia já tinha achado **Saboaria da Tia Rose** e **Aisne Morelli**,
duas ofertas de sabonete artesanal, no mesmo nicho. O padrão fecha.

### 2.5 Força e fraqueza

**O que ela acerta (copiar):**

- Um produto, um nome, uma página — zero dispersão
- Produto visualmente irresistível: o vídeo vende sem precisar de argumento
- Copy mínima: o criativo carrega o peso, o texto não atrapalha
- Produto que já é tendência — não precisa educar o mercado

**Onde ela está descoberta (nosso espaço):**

| Buraco | Por que é um buraco |
|---|---|
| **Zero autoridade** | Nenhum rosto, nenhuma assinatura. Quem compra não sabe de quem está comprando |
| **Promessa de hobby, público de renda** | O anúncio foi minerado na keyword "aprenda a fazer dinheiro", mas a promessa é "aprenda a fazer". Ela atrai quem quer ganhar e entrega quem quer cozinhar |
| **Sem a ponte do dinheiro** | Ingrediente de padaria → item de R$ 12–18. Ela tem esse dado de graça e não usa |
| **Receita não é transformação** | Receita a pessoa acha no Google. O que ela não acha é preço, porção, embalagem, e pra quem vender |
| **Sem tangibilização** | Sem bônus, sem garantia, sem prova social identificáveis |

---

## 3. Recomendação de recorte

**Rota escolhida: vender o micro-negócio de um produto só, não a receita.**

- **Nicho (imutável a partir daqui):** renda extra com comida caseira
- **Subnicho (imutável):** confeitaria de produto único — cinnamon roll
- **Persona:** mulher, 31–51 anos, com filhos, sem CNPJ, já cozinha em casa, já fez ou pensa em
  fazer bico pra fechar o mês. Quer vender no grupo do condomínio e no WhatsApp, não quer
  abrir empresa
- **Nível de consciência:** ciente do problema (falta dinheiro) e ciente da solução (vender comida).
  **Não** ciente do produto — ela nunca pensou em cinnamon roll como o item pra vender
- **Dor central:** não é "não sei cozinhar". É "não sei **o que** vender que dê margem, nem por
  quanto cobrar, nem pra quem oferecer sem passar vergonha"
- **Preço-alvo:** R$ 19,90 — teto da faixa do nicho, sustentado por entregar mais que receita

**O que mantemos da referência:** o produto único, o nome próprio do produto, a página única,
o apelo visual que vende sozinho.

**O que mudamos:** a promessa sai de *aprender a fazer* e vai para *fazer e vender*. É a única
mudança que importa, e é a que a concorrente não pode copiar sem refazer a oferta inteira.

---

## 4. Não identificado — registrado como lacuna

- Preço real, bônus, garantia e checkout da concorrente (página criptografada; só um navegador
  renderizando resolveria)
- Volume de vendas ou faturamento dela — nenhum dado público
- Data de início dos 60 criativos (campo `inicio` veio nulo na coleta)

Nenhum desses vira número na nossa página.
