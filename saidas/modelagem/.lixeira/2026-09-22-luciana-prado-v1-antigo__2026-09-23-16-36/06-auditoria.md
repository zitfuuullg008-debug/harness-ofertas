# AUDITORIA MVT — Caixinha de Canela

Arquivo: `04-pagina.html` · Data: 2026-09-22 · OA100K: recebida (`02-modelagem-oa100k.md`)
Modo: `--auto` headless · Fase 5 (imagens) **não executada**

## Aviso que muda a leitura deste laudo

A metodologia manda auditar **depois** das imagens, e olhando a página renderizada em 430px.
Nesta rodada isso não aconteceu: a Fase 5 foi pulada por decisão do modo `--auto` e a sessão
é headless, sem navegador.

Então este laudo audita **copy, estrutura, coerência e carga**. A nota de **Execução visual
não foi dada** — dar uma seria inventar. O que está escrito em "Imagens" é inventário de
pendência, não diagnóstico visual.

## O que essa página vende

Um PDF de R$ 19,90 que ensina uma massa base de rolinho de canela, seis coberturas que saem
dela e o cálculo de quanto cobrar, para mulher que já faz doce por encomenda e cobra abaixo
do que vale.

A frase saiu em uma linha, sem esforço. Isso é mérito da primeira dobra: `"Uma massa só, 24
rolinhos de canela e 6 caixinhas prontas pra vender."` carrega produto, quantidade e destino
num fôlego só.

## Notas

| Mandamento | Nota | Por quê |
|---|---|---|
| Clareza | 8/10 | A headline é a promessa inteira e não pede releitura. O mecanismo aparece explicado por funcionamento, não por metáfora: `"Uma fornada de sábado de manhã, seis sabores saindo da mesma massa"`. Perde 2 pontos porque a palavra "Fornada Sortida", que é o mecanismo nomeado da OA100K, **não aparece uma vez sequer na página** |
| Especificidade | 8/10 | Acima do mercado: cada número tem fonte visível na própria página (`"Fonte: Boletim Trends, junho de 2026"`). `"R$ 10 a R$ 19"`, `"75 mil"`, `"6 em cada 10"`, `"só 37% delas têm CNPJ"`. Nenhum "resultados incríveis" em toda a página. Perde 2 pontos no `"24 rolinhos"`, que é o único número da página sem lastro em nada |
| Praticidade | 8/10 | `"Uma fornada no sábado de manhã rende as caixinhas do fim de semana inteiro"` e `"Forno de casa, forma comum e ingrediente do mercado do bairro"` colocam o produto na semana dela. O bloco de bônus `"Forno de Fogão Comum"` é praticidade pura. Perde 2 pontos porque a página nunca diz o que acontece nos cinco minutos seguintes à compra, além de `"direto no seu {{MEIO_DE_ENTREGA}}"`, que é placeholder |
| Tangibilização | 5/10 | **É o mandamento reprovado.** A checklist é de entregas, não de promessas, e isso é acerto: `"A folha de preço da fornada, com custo da forma cheia e preço da caixinha"` é uma coisa que dá pra desenhar. Mas a página não mostra **uma única imagem do produto existindo**: 14 `<img>` e 14 placeholders. Mockup, prints e capas de bônus são todos `{{IMG:...}}`. Bônus com nome bom e nenhuma prova visual é exatamente o que a metodologia chama de inflar a oferta no papel |
| Execução visual | **não auditada** | Sem imagens e sem navegador na sessão. Não entra na média |
| **Média dos 4 auditáveis** | **7,25/10** | |

## Bloqueadores

Três, e a média não importa enquanto existirem. Esta página não pode receber um real de
tráfego no estado atual.

**1. `{{CHECKOUT}}` no único botão de compra.**
O `href` do botão laranja do bloco de oferta é literalmente `{{CHECKOUT}}`. Os outros 5 CTAs
rolam para `#plano-basico` e chegam nesse botão. **Nenhum caminho da página termina numa
venda.** É o bloqueador mais barato de resolver e o mais fatal de esquecer.

**2. 14 placeholders de imagem.**
Nenhum `src` da página resolve. Publicada assim, ela renderiza 14 caixas quebradas, incluindo
a primeira dobra e as quatro capas de bônus. A metodologia é explícita: imagem quebrada é
bloqueador, não observação.

**3. Bloco de autoridade inteiramente em placeholder.**
`{{NOME_AUTORIDADE}}`, `{{BIO_1}}`, `{{BIO_2}}`, `{{BIO_3}}`, `{{FRASE_DE_FECHO}}` e
`{{IMG:autor:1}}`. A seção existe e está vazia.

Vale dizer com todas as letras: **esta é a mesma fraqueza que o Raio-X apontou na
concorrente.** O laudo da Fase 1 registrou que Luciana Prado roda 60 criativos sem um rosto
e sem uma assinatura, e chamou isso de "o buraco dela". Se esta página subir com o bloco
vazio, a vantagem competitiva que justificou a modelagem inteira deixa de existir.

## Semáforo por bloco

| # | Bloco | | Diagnóstico |
|---|---|---|---|
| 1 | Barra de urgência | 🟢 | Data gerada por JS, nunca fixa. Cumpre |
| 2 | Primeira dobra | 🟡 | A headline vende sozinha. As 4 pills são entregas concretas, não adjetivos. Amarelo só pela hero em placeholder, que é metade da função do bloco |
| 3 | Prova social do hero | 🟢 | Decisão acertada: no lugar de "+2.000 alunas" inventado, `"R$ 32,90 é o que uma padaria artesanal cobra hoje por uma caixinha de 4 unidades"`. Prova de mercado real ocupando o slot de prova social ausente. As estrelas falsas foram removidas |
| 4 | Demonstrativo | 🔴 | **Não cumpre.** A função do bloco é provar que o produto existe, e ele é um carrossel de 6 imagens que não existem. O texto está correto; o bloco está vazio |
| 5 | Ideal para você | 🟢 | Descreve a vida dela, não o produto: `"Faz bolo, faz docinho, todo mundo elogia, e no fim do mês a conta não fecha"`. É o melhor bloco da página |
| 6 | Produto principal | 🟡 | A checklist de 10 itens lista entregas nomeadas, com os seis sabores um a um. Amarelo pelo mockup ausente |
| 7 | Bridge dos bônus | 🟢 | Ajustado de 7 para 4 bônus, como manda a variação do template |
| 8 | Bônus | 🟡 | Cada um dos 4 mata uma objeção nomeada e nenhum é enchimento. `"Chega Inteira"` e `"Forno de Fogão Comum"` são os mais fortes. Amarelo pelas 4 capas ausentes |
| 9 | Validação de mercado | 🟢 | Ocupa a posição do bloco de depoimentos com 4 dados verificáveis e fonte em cada card. Não é prova do produto, é prova do mercado, e a página não finge que é outra coisa |
| 10 | Bridge dos planos | 🟢 | `"Um dia você vai falar o seu preço sem pedir desculpa por ele"`. Emocional, sem preço, cumpre a regra do bloco |
| 11 | Oferta | 🔴 | **Não cumpre**, por causa do `{{CHECKOUT}}`. A estrutura de plano único está correta e o `id="plano-basico"` foi mantido, então as 5 âncoras chegam |
| 12 | Garantia | 🟢 | 7 dias, incondicional, com os três cards de reforço. Sem condicional e sem burocracia: `"é só pedir o reembolso dentro desse prazo e o valor volta integral"` |
| 13 | Autoridade | 🔴 | Vazio |
| 14 | FAQ | 🟢 | A pergunta 1 é a objeção real e cara, não a fácil: `"Receita de rolinho de canela não tem de graça na internet?"`. A resposta não desconversa, admite que tem e reposiciona. Perguntas 3 e 4 também são objeção de verdade. Duas respostas ainda em placeholder |
| 15 | Rodapé | 🟢 | Traz o disclaimer de resultado, que é obrigatório num produto de renda extra e que quase nenhuma página do nicho coloca |

## Coerência

**Nome do produto:** "Caixinha de Canela" aparece 11 vezes, idêntico, em `<title>`, hero
(implícito na promessa), produto, oferta, garantia, FAQ e rodapé. Sem divergência.

**Promessa única:** headline promete `"6 caixinhas prontas pra vender"`, o produto entrega
a massa, os 6 sabores e a montagem da caixinha, e a garantia fala de `"fazer a primeira
massa"`. Alinhadas.

**Checklist contra bônus:** os 4 itens de bônus do bloco de oferta batem exatamente, nome
por nome, com os 4 cards da seção de bônus. Nenhum item fantasma, nenhum faltando.

**CTA:** os 6 botões dizem `"Quero minha Caixinha de Canela"`, sem variação. Cumpre o
dicionário de termos.

**Preço:** R$ 19,90 aparece uma vez, sem "de/por" fabricado. A comparação usada é
`"Uma caixinha de 4 unidades pronta custa R$ 32,90 numa padaria artesanal"`, que é preço
de mercado com fonte, não âncora inventada. Coerente com o hero, que abre com o mesmo número.

### As duas incoerências encontradas

**1. O mecanismo sumiu.**

| OA100K (Fase 2) | Página |
|---|---|
| "Mecanismo: **Fornada Sortida**" | a expressão não aparece nenhuma vez |

A modelagem gastou uma etapa inteira batizando o mecanismo, justificou a fusão de dois
mecanismos e aprovou o nome no teste dos 2 segundos. A página usa a **ideia** do mecanismo
em `"seis sabores saindo da mesma massa"`, mas nunca o **nome**. Mecanismo sem nome não vira
ativo de anúncio e não diferencia a oferta de uma receita qualquer.

**2. O "24" não fecha com o "6".**

| Hero | Produto |
|---|---|
| "24 rolinhos de canela e 6 caixinhas" | 6 sabores, caixinha de 4 |

24 dividido por 4 dá 6 caixinhas, e a conta bate. Mas a página oferece **6 sabores** e a
caixinha tem **4**. Uma leitora atenta pergunta quais dois sabores ficam de fora. Não é
contradição matemática, é uma pergunta que a página abre e não responde.

## Consciência e objeções

**Nível tratado:** dor e solução. A página assume que a leitora já sabe que precisa de
dinheiro e que vender comida é um caminho, e apresenta o produto que ela não conhece.

**Adequado a tráfego frio: sim.** E é uma correção direta do erro da concorrente. O Raio-X
mostrou que Luciana Prado compra tráfego na keyword "aprenda a fazer dinheiro" e entrega a
promessa `"Aprenda a fazer rolinhos gourmet"`, que é desejo de hobby. Esta página compra o
mesmo tráfego e entrega `"6 caixinhas prontas pra vender"`.

| Objeção | Onde a página responde |
|---|---|
| "Isso tem de graça no Google" | FAQ 1, de frente e sem desconversar. Também no posicionamento implícito do bloco de produto, que lista folha de preço e roteiro de venda ao lado das receitas |
| "Não sei quanto cobrar, e se eu cobrar caro ninguém compra" | Benefício 2, bloco de validação de mercado (os R$ 32,90 e os R$ 10 a R$ 19) e FAQ 8. É a objeção mais bem respondida da página |
| "Meu forno é ruim" | Bônus 4 e FAQ 3 |
| "Vai chegar esparramado" | Bônus 2 |
| "Tenho vergonha de oferecer" | Bônus 1 e card 3 do bloco "Ideal para você" |
| "Não tenho CNPJ" | FAQ 4, com dado do Sebrae. Boa resposta: usa estatística em vez de opinião |
| **"Quem é você pra me ensinar isso?"** | **Em lugar nenhum.** O bloco que responderia está vazio |

### Promessa exagerada ou não sustentada

**Nenhuma.** Varri a página inteira procurando promessa de faturamento e não achei. Não há
"ganhe R$ 2.000 por mês", não há "renda garantida", não há depoimento de resultado. Os
números todos são preço de mercado com fonte, e o rodapé traz o disclaimer explícito:
`"O resultado de cada pessoa depende do que ela produz, do preço que pratica e de quanto ela
vende."`

Isso reduz risco de bloqueio de anúncio e é o ponto em que esta página está mais acima do
mercado do nicho.

O único número sem lastro é o `"24 rolinhos"`. Não é exagero de promessa, é um dado que
precisa ser verificado contra a receita real antes de subir. Se a massa render 18, a headline
mente e a garantia vira reembolso.

## Imagens

Inventário de pendência. Nenhuma foi vista, porque nenhuma existe.

| # | Bloco | Placeholder | | O que precisa provar |
|---|---|---|---|---|
| 1 | Hero | `{{IMG:hero:1}}` | ⬜ | A caixinha de 4 montada, com 4 sabores visíveis, 1:1, abaixo de 150KB |
| 2 a 7 | Demonstrativo | `{{IMG:demo:1}}` a `{{IMG:demo:6}}` | ⬜ | Páginas internas do PDF. É o bloco que prova que o produto existe |
| 8 | Produto | `{{IMG:mockup-principal:1}}` | ⬜ | Mockup do PDF no celular com a folha de preço ao lado, 1:1 |
| 9 a 12 | Bônus 1 a 4 | `{{IMG:bonus:1}}` a `{{IMG:bonus:4}}` | ⬜ | Capa de cada bônus, cada uma mostrando o conteúdo dele |
| 13 | Oferta | `{{IMG:plano-completo:1}}` | ⬜ | Composição com tudo junto: PDF, folha, rótulo, 1:1 |
| 14 | Autoridade | `{{IMG:autor:1}}` | ⬜ | Foto de quem assina |

Os 6 `alt` do carrossel também estão em placeholder (`{{ALT:demo:1}}` a `{{ALT:demo:6}}`).

Os 5 ícones do bloco "Ideal para você" foram resolvidos com emoji dentro do círculo branco,
como manda a regra do elemento-assinatura quando não há ícone pronto. Funciona, mas emoji de
sistema em página de venda é ponto perdido na execução visual. Vale trocar por ícone de traço
quando houver arte.

## Peso e carregamento

| Métrica | Valor | Situação |
|---|---|---|
| HTML cru | 49,3 KB | 🟢 |
| HTML comprimido | 11,9 KB | 🟢 Excelente |
| CSS inline | 18,8 KB | 🟢 |
| Nós no DOM | ~398 | 🟢 Leve |
| Bibliotecas externas | nenhuma | 🟢 Single-file mantido |
| `preload` no hero | presente, com `fetchpriority="high"` | 🟢 |
| `loading="lazy"` | nas 13 imagens fora do hero | 🟢 |
| Pesos de fonte carregados | PJS 400/500/600/700/800/900 + itálico 400; Playfair 700/800/900 | 🟢 Todos usados no CSS. Sem desperdício |
| Peso da hero | não mensurável | ⬜ Pendente da Fase 5. Teto: 150KB |
| Soma das imagens | não mensurável | ⬜ Pendente da Fase 5 |

Sem imagens, a página pesa 11,9 KB comprimidos. A carga inteira vai depender exclusivamente
do que entrar na Fase 5.

## Onde está o gargalo

**A página não mostra o produto existindo.** Tudo o mais está no lugar: a dor tem nome, o
preço tem âncora real, os bônus matam objeções nomeadas e nenhuma promessa é exagerada. Mas
a compradora chega ao botão sem nunca ter visto uma página do PDF, a folha de preço ou a
caixinha montada. Em low ticket a decisão é de impulso, e impulso precisa de coisa pra olhar.

Não é problema de copy. É a Fase 5, e é ela que separa esta página de estar pronta.

## As 5 correções de maior impacto

1. **Bloco de oferta** — o único botão de compra aponta para `{{CHECKOUT}}` — precisa passar a
   existir a URL real do checkout, com `target="_blank"`, antes de qualquer outra coisa.

2. **Demonstrativo, produto, bônus e hero** — 13 imagens de produto ausentes — precisa passar a
   existir o material visual da Fase 5, com prioridade para os 6 prints do carrossel, que são
   o bloco que hoje está 🔴 por vazio.

3. **Autoridade** — a seção inteira está em placeholder e é a mesma fraqueza que derrubou a
   concorrente na Fase 1 — precisa passar a existir um nome, um rosto e três parágrafos que
   liguem essa pessoa a cozinhar e a vender. Sem credencial inventada.

4. **Copy, transversal** — o mecanismo "Fornada Sortida" não aparece na página — precisa passar
   a existir nomeado, pelo menos na primeira dobra e no bloco de produto, para virar ativo de
   anúncio e diferenciar a oferta de uma receita qualquer.

5. **Hero e produto** — a conta "24 rolinhos, 6 caixinhas, 6 sabores, caixinha de 4" abre uma
   pergunta que a página não responde — precisa passar a existir, no bloco de produto, a frase
   que explica como a leitora escolhe os 4 sabores da caixinha entre os 6 que aprendeu. E o
   rendimento de 24 precisa ser conferido contra a receita real.

## O que ficou de fora desta auditoria

1. **Toda a Parte 5 da metodologia, execução visual.** Fase 5 não rodou e a sessão não tem
   navegador. Recorte de imagem, emenda entre seções, hierarquia de preço renderizada,
   espaçamento entre blocos e comportamento dos dois carrosséis com conteúdo real: nada disso
   foi visto. A página **não foi aberta em 430px**, contrariando a regra da skill, e o motivo
   é ambiental, não escolha.
2. **Peso real de carregamento**, que depende das imagens.
3. **Conferência da imagem certa no bloco certo**, que precisa do manifesto `05-imagens.json`.
4. **Validação do rendimento de 24 rolinhos**, que depende da receita real, que ainda não existe.

Quando a Fase 5 fechar, esta auditoria precisa **rodar de novo do zero**, lendo a página
renderizada. A nota de hoje vale para copy e estrutura, e só.
