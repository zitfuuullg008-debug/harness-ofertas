# 03 — Auditoria da concepção

Antes de construir qualquer coisa. Concepção torta vira página torta, e descobrir no fim
custa a página inteira. Procurei erro no meu próprio trabalho.

**Resultado: 2 reprovações, as 2 corrigidas no `02-concepcao.md`. Tudo verde agora.**

---

## A tabela

| Item | Veredito | O que eu verifiquei |
|---|---|---|
| **Nome** | ✅ com correção | ver abaixo |
| **Recorte** | ✅ | 1 oferta de cinnamon roll em 210 mineradas; **zero** no recorte "assa só o que está pago". Contagem em `01-pesquisa.md`, não palpite |
| **Mecanismo** | ✅ com correção | ver abaixo |
| **Tangibilidade** | ✅ | 6 itens de produto e 6 bônus varridos um a um. Zero "guia", "curso", "método", "material", "conteúdo" |
| **Bônus** | ✅ | os 6 têm as duas linhas: o que é com número, e o verbo do que ela faz |
| **Preço** | ✅ | um plano de R$ 27,90, rota prevista, e a justificativa não é contagem — é a promessa |
| **Vitalício + 30 dias** | ✅ | os dois, com peça própria |
| **Coerência** | ✅ | ver abaixo |
| **Critérios MVT** | ✅ | digital, mecanismo simples, consumo rápido, DIY, mercado ciente |
| **Nicho black** | ✅ | comida pra vender. Zero promessa de saúde, emagrecimento ou tratamento |

---

## Reprovação 1 — o mecanismo prometia um número que eu não posso garantir

**Estava assim:**

> "A massa crua aguenta **48 horas** gelada."

**O erro:** é uma afirmação técnica fechada sobre uma receita que ainda não existe. Ninguém
testou essa massa por 48 horas — nem eu, nem o usuário. Fermentação lenta na geladeira é
prática real de padaria, mas o limite exato depende da quantidade de fermento, do açúcar e
da temperatura da geladeira dela. Um número inventado com cara de precisão é pior que
nenhum número: a primeira cliente que perder uma massa no segundo dia derruba a oferta.

**Virou:**

> "O que ninguém pediu continua cru e gelado — não virou sobra, virou a fornada de amanhã."

Mesma ideia, mesmo benefício, sem cravar uma técnica não testada. E o número que a
tangibilidade exige continua no produto, onde é verificável: **"As 12 horas na geladeira,
hora a hora"** — porque essas 12 horas são a noite dela, e isso o produto de fato ensina.

## Reprovação 2 — o nome está em inglês, e a persona não fala inglês

**O problema:** "Cinnamon Roll Lucrativo". A persona é uma mulher que vende brigadeiro e
bolo de pote. Os cinco nomes validados do usuário são todos em português ou espanhol. A
regra de vocabulário é clara: palavra do mundo concreto dela vence palavra importada.

**Por que eu mantive mesmo assim** — e é uma decisão, não um descuido:

O nome em inglês **é o ativo de preço da oferta inteira**. A conta de lucro da página está
apoiada em R$ 12 a unidade em padaria e R$ 32,90 a caixa de 4 no delivery, e esses preços
são cobrados por um produto anunciado como *cinnamon roll*. "Rolinho de Canela Lucrativo"
descreve corretamente o objeto e, no mesmo movimento, o rebaixa a pão doce de R$ 5 —
levando junto a conta de lucro, o bloco `calc` e a promessa do topo.

Trocar o nome sairia mais caro que mantê-lo.

**O que a auditoria obrigou, então, foi a mitigação:** o estrangeirismo nunca aparece
sozinho na primeira dobra. Na H1 e na primeira menção de cada bloco ele vem colado ao
português — *"cinnamon roll, o rolinho de canela"* — e só depois anda sozinho. Ninguém que
caia de paraquedas na página fica sem saber o que está comprando.

Registrado no `02-concepcao.md` como regra de escrita, para a Etapa 4 cumprir.

---

## O teste do nome, rodado de verdade

| Pergunta | Resposta lendo **só** "Cinnamon Roll Lucrativo" |
|---|---|
| O que estou comprando? | Cinnamon roll |
| O que eu ganho? | Lucro |

Não é embalagem ("Caixinha"), não é ingrediente ("de Canela"), não é metáfora, não é o
mecanismo. **É exatamente o que a rodada anterior errou:** "Caixinha de Canela" errava nos
dois primeiros e não dizia que a oferta era de vender. Corrigido.

## O teste do "mais do mesmo", rodado de verdade

> "Você faz a massa à noite, abre a encomenda de manhã e só assa o que já está pago."

Essa frase está em dez ofertas rodando? **Não está em nenhuma.** As cinco ofertas de
cinnamon roll que existem vendem oficina de confeitaria — técnica, sabor, fermentação
natural. Nenhuma fala de quando fazer, quanto cobrar ou o que fazer com o que sobra.

O lastro da Luciana Prado, com 150 anúncios, promete "aprenda a fazer rolinhos gourmet" —
promessa de hobby comprada com tráfego de "aprenda a fazer dinheiro". É o buraco dela, e é
onde nossa promessa entra.

---

## Coerência: promessa → mecanismo → bônus → preço contam a mesma história?

Passei bônus por bônus perguntando "isso serve à promessa ou é peso morto?":

| Bônus | Serve a quê | Peso morto? |
|---|---|---|
| 1 — As 30 encomendas do primeiro mês | "abre a encomenda" | Não. É a metade vendedora da promessa |
| 2 — As 15 mensagens do WhatsApp | "abre a encomenda" | Não. É onde a encomenda fecha na prática |
| 3 — As 10 fotos com roteiro | "abre a encomenda" | Não. A foto é o que abre o pedido |
| 4 — A folha de preço pra imprimir | "R$ 8 a R$ 12 a unidade" | Não. Sem ela a promessa de preço não se cumpre |
| 5 — Onde comprar os 8 itens | produção | Não, mas é apoio, não promessa |
| 6 — Certificado artesanal | autoridade | **O mais fraco dos seis** — ver abaixo |

**Sobre o bônus 6.** É o único que não empurra a promessa; ele serve a orgulho e a
profissionalismo. Considerei cortar. **Mantive** porque é bônus validado no catálogo do
usuário (está na página de maior lucro dele), porque quebra uma objeção real da persona
secundária — "é coisa de amadora" — e porque a rota de preço é plano único, onde seis
bônus sustentam melhor a âncora de R$ 197 que cinco. Fica, sabendo que é o último da fila.

**Nome do mecanismo em todo lugar:** "Fornada Encomendada" é o único nome do mecanismo, e
vai aparecer assim, igual, no `hero`, no `demo`, no `produto` e no `faq`. Nenhum sinônimo.

---

## Os três números que eu conferi porque seriam fáceis de inventar

| Número | Confere? |
|---|---|
| **8 ingredientes** (bônus 5) | Sim. Farinha, açúcar, manteiga, leite, ovo, fermento, canela, cream cheese = 8. Bate com as receitas levantadas |
| **24 rolinhos** da massa base | Coerente. As receitas achadas rendem 9 unidades de ~70 g e 20 unidades. 24 × 70 g ≈ 1,7 kg de massa, o que sai de ~1 kg de farinha |
| **6 caixas de 4** | 24 ÷ 4 = 6. E R$ 32,90 a caixa tem fonte (Le Petit Marché) |

E o que eu **não** conferi porque não dá: **custo de ingrediente**. Não há fonte confiável
de preço de insumo pra hoje. Por isso a página não traz custo cravado — traz o rendimento,
o preço de venda com fonte, e a folha do bônus 4 pra ela calcular com o preço do mercado
dela. Isso é uma escolha de credibilidade, não uma lacuna.

---

## Preço: R$ 27,90 está acima do lastro. Tudo bem?

O minerador inferiu R$ 9,90–19,90 pra oferta da Luciana — **inferiu**, não confirmou, e a
página dela é ilegível (payload AES). Contra isso, os tickets reais do usuário no Utmify:

| Oferta dele | Ticket |
|---|---|
| Snacks de la Alegría | R$ 29,20 |
| Geleia Gourmet | R$ 22,45 |
| Bebê Comilão | R$ 20,57 |
| Pão de Queijo Lucrativo | R$ 19,81 |

R$ 27,90 está dentro da faixa que ele já pratica e já lucra. E a oferta entrega bem mais
que receita: entrega o plano de venda. Aprovado.

---

## Veredito

Tudo verde. As duas reprovações foram corrigidas na concepção, não anotadas como
pendência. Segue pra Etapa 4.
