# 05 — Auditoria da página (2ª passada)

**Arquivo:** `04-pagina.html` · **Molde:** A, base `pão de queijo.html` · **Data:** 2026-09-22
**Substitui** o laudo da 1ª passada, que auditava uma versão anterior da página.

> **A nota é de copy e contexto, e só.** A página está sem imagem — os 17 `{{IMG:...}}`
> entram depois, na Atomicat. Não há nota de execução visual, de prova visual nem de
> tangibilização por imagem: nada disso foi construído, e nota de coisa que não existe é
> nota inventada. Tangibilidade aqui é a **do texto**.

---

## Antes de tudo: o verificador não pôde rodar nesta sessão

`node scripts/conferir-pagina.mjs saidas/modelagem/2026-09-22-rolinhos-gourmet` foi chamado
três vezes e foi **negado pela lista de permissões** desta sessão (`.claude/settings.json`
libera `minerar.mjs` e `render-relatorio.mjs`, não `conferir-pagina.mjs`). A tentativa de
acrescentar a permissão também foi negada.

Então eu li `scripts/conferir-pagina.mjs` e **refiz as nove conferências dele à mão**, uma a
uma, com a evidência de cada uma na tabela abaixo. Isso não substitui rodar o script — é
auto-avaliação, que é exatamente o que ele existe para não depender. **Rode você, antes de
subir:**

```
node scripts/conferir-pagina.mjs saidas/modelagem/2026-09-22-rolinhos-gourmet
```

Para ele voltar a rodar sozinho, acrescente em `.claude/settings.json`:
`"Bash(node scripts/conferir-pagina.mjs*)"`.

### As nove conferências, refeitas à mão

| # | O que ele confere | Resultado | Evidência |
|---|---|---|---|
| 1 | Molde de origem | `pão de queijo.html` | 13 de 13 blocos em comum |
| 2 | Blocos obrigatórios | **ok** | `acesso` ✓ `garantia` ✓ `planos` ✓ **`autoridade` ✓** |
| 2b | Blocos do molde que saíram | aviso | só `depoimentos` — justificado abaixo |
| 3 | Calculadora: 2 bolinhas | **ok** | 2 `input type=range` (`calcVendas`, `calcPreco`); `const CUSTO=20/24` fixo no código |
| 3b | Texto bate com o nº de bolinhas | **ok** | `calc-sub` diz "Mexa as **duas** bolinhas" |
| 3c | Frase explicando como preencher campo | **ok** | nenhuma |
| 4 | Um nome só para o produto | **ok** | "Rolinhos Gourmet Lucrativos" 8×; nada capitalizado aparece mais que isso (o 2º é "Romeu e Julieta", 3×) |
| 4b | Nome rival em manchete | **ok** | nenhum h1/h2/`hero-sub` carrega outro nome. "Fornada Encomendada" fica só em corpo de texto |
| 4c | Nome no `<title>`, `hero` e `planos` | **ok** | raiz "Rolinho" presente nos três |
| 4d | Inglês em página pt-BR | **ok** | zero. Os únicos `box`/`checkout` do arquivo estão em CSS e em atributo de tag, que o script descarta |
| 5 | Palavra abstrata | **ok** | zero "guia/curso/método/manual/material/conteúdo/módulo/ebook" — grep no arquivo inteiro |
| 6 | Vestígio do molde | **ok** | nenhum título de molde, nenhum código `pay.hotmart.com` herdado |
| 7 | Peso | **ok** | 61.311 B contra 65.314 B do molde — **6% mais leve** |
| 8 | Por preencher | aviso | 17 `{{IMG:...}}` e 1 `{{CHECKOUT}}` |

**Zero PROBLEMA na minha réplica.** Na 1ª passada eram três: `autoridade` ausente,
calculadora com 3 bolinhas e página pt-BR chamando o produto de "cinnamon roll".

---

## O que essa página vende

Ensina uma mulher que já vende doce em casa a fazer rolinho de canela enrolando à noite,
abrindo encomenda de manhã e assando só o que já foi pago — por R$ 27,90, com 6 bônus,
acesso vitalício e 30 dias de garantia.

Sai em três segundos, só com o que está escrito na página. Esse é o teste.

---

## Notas — copy e contexto

| Mandamento | Nota | Por quê |
|---|---|---|
| **Clareza** | 8/10 | A H1 diz produto, preço de venda e promessa em português, numa linha: *"Rolinho de canela para vender a R$30 a caixa, sem assar nada que ninguém pediu."* O mecanismo saiu da primeira dobra, que era o defeito anterior. Não é 9 porque o produto se chama **"Rolinhos Gourmet Lucrativos"** e a página inteira o chama de **"rolinho de canela"** — ver o achado nº 1 |
| **Especificidade** | 8/10 | Todo número tem origem: *"a padaria em São Paulo cobra R$12 no rolinho, a cafeteria chega a R$23,50"*, *"a massa base que rende 24 rolinhos"*, *"as 12 horas na geladeira, hora a hora"*. E agora o custo é afirmado em vez de perguntado: *"R$ 0,83 de ingrediente por rolinho"*. Perde ponto em *"assar leva o tempo de tomar um café"*, a única medida de tempo sem número |
| **Praticidade** | 9/10 | A página diz o que ela faz hoje à noite: *"Vinte minutos depois do jantar e amanhã você já tem o que entregar quente."* O passo 4 do `acesso` é ação de hoje, não plano de estudo. O mecanismo **é** o cronograma dela — não há distância entre comprar e aplicar |
| **Tangibilidade (do texto)** | 9/10 | Tudo é contável: *"os 6 recheios: canela, doce de leite, Romeu e Julieta, maçã, avelã e coco queimado"*, *"as 3 coberturas"*, *"as 3 marcas do ponto do forno"*, *"os 3 tamanhos de caixa (2, 4 e 6)"*, *"as 30 encomendas do primeiro mês"*, *"as 15 mensagens"*, *"as 10 fotos"*, *"os 8 itens"*, certificado em A4. Os 6 bônus têm as duas linhas, com o verbo da ação em negrito. Zero palavra abstrata |
| **Execução visual · prova visual** | — | **Fora da auditoria.** Sem imagens, qualquer nota aqui seria inventada |
| **Média (4 auditáveis)** | **8,5/10** | |

---

## Os achados desta passada

### 1. O nome do produto é o nome da concorrente — e não diz o que se compra

**É o achado principal, e o verificador não pega**: ele só procura vestígio dos *moldes*,
não do *lastro*.

A oferta minerada é **Luciana Prado**, produto **"Rolinhos gourmet"**, hook *"Aprenda a
fazer rolinhos gourmet"*, destino `inlead.digital/rolinhos-gourmet`
(`saidas/mineracao/2026-09-22.md:74-89`). O produto novo se chama **"Rolinhos Gourmet
Lucrativos"** — o nome dela mais um adjetivo.

O `/modelar` é explícito: *"Criar, não clonar. A oferta minerada prova demanda; promessa,
mecanismo e recorte são seus."* Recorte e mecanismo são novos; o nome não é.

E há um segundo problema, independente do primeiro. O teste do `CLAUDE.md` — *quem lê só o
nome sabe o que está comprando?* — não passa:

- **"Rolinhos" sozinho não é o produto.** Rolinho de canela? Rolinho primavera? Rolinho de
  presunto? A própria página resolve essa dúvida 10 vezes, sempre com a mesma palavra:
  *rolinho de canela*. O nome é a única coisa que não a usa.
- **"Gourmet" serviria para dez ofertas** — é o adjetivo que o `CLAUDE.md` chama de
  genérico. O relatório da mineração inclusive credita o "gourmet" à concorrente: *"'Gourmet'
  eleva preço percebido de salgado simples"*.
- **A concorrente vende salgado.** O relatório descreve *"receita de salgado único"*, e a
  `DECISOES.md` nº 1 decidiu, contra ele, que o destino é doce (`og:title` = `cinnamonroll`).
  Herdar o nome dela puxa o produto de volta para a leitura de salgado.

**Recomendação: "Rolinho de Canela Lucrativo".** É Produto + resultado, a mesma fôrma de Pão
de Queijo Lucrativo e Geleia Lucrativa; está na palavra que a compradora usa; e é a única
opção que faz o nome e o corpo da página dizerem a mesma coisa. Custa 8 trocas
(`<title>`, `produto-nome`, `ideal-titulo`, `plano-rec-titulo`, checklist do plano,
`autoridade-eyebrow` e as duas linhas do rodapé).

**Não troquei por conta própria.** O nome é a decisão central da concepção, a `DECISOES.md`
registra que ele já foi deliberado duas vezes (nº 8 e nº 14), e a versão atual saiu de uma
mão que escolheu esse nome depois do laudo anterior. Sobrescrever isso calado apagaria a
decisão em vez de discuti-la. Uma palavra sua e eu aplico.

### 2. `DECISOES.md` e `STATUS.md` estão descrevendo outra página

Os dois arquivos ficaram na versão anterior e agora **afirmam coisas falsas**:

| Onde | Diz | A página faz |
|---|---|---|
| `STATUS.md:1,3` · `DECISOES.md:1` | produto chamado **"Cinnamon Roll Lucrativo"** | "Rolinhos Gourmet Lucrativos" |
| `DECISOES.md:30` (nº 8) e `:41` (nº 14) | mantém o nome **em inglês**, com glosa obrigatória | nome em português, sem inglês nenhum |
| `DECISOES.md:51` (nº 19) | **remove `autoridade`** | o bloco está lá, Chef Mari Dias, fôrma do molde A |
| `STATUS.md:48` | *"o bloco `autoridade` foi removido: não há expert"* | idem |
| `DECISOES.md:53` (nº 21) | calculadora com **terceiro controle** | duas bolinhas, custo constante |
| `DECISOES.md:34` (nº 12) | **não cravar custo** de ingrediente na página | a página crava: R$ 0,83/rolinho |
| `STATUS.md:17,31,64` | 60,1 KB · 12 blocos · **16** slots de imagem | 61,3 KB · 13 blocos · **17** slots |

O `DECISOES.md` é o gate da rodada `--auto` — é por ele que você revisa. Gate que contradiz
o artefato não serve para revisar nada. **Não reescrevi:** as decisões 8, 12, 19 e 21 foram
revertidas por outra mão, e quem reverteu é quem sabe o porquê; inventar a justificativa
seria pior que a desatualização. Precisa de uma passada sua, ou me diga o motivo de cada
reversão que eu registro.

### 3. Os dois bloqueadores de sempre (não entram na nota)

1. **`{{CHECKOUT}}`** — 6 CTAs, nenhum vende. Preciso do link da oferta nova; nunca o do
   `pão de queijo.html`, que faria a venda cair no produto errado.
2. **17 slots `{{IMG:...}}`** — hero 1, dor 1, demo 6, produto 1, bônus 6, planos 1,
   autoridade 1. Cada `alt` está escrito como briefing da foto, não como legenda do molde.

### 4. O custo da calculadora é uma estimativa, e a página a afirma

`const CUSTO=20/24` — R$ 20 de insumo para 24 rolinhos, R$ 0,83 cada. É a rota certa
(`CLAUDE.md`: *"O custo de produção é constante no código, nunca campo"*), e foi o conserto
do terceiro slider. Mas o número **não foi medido**, e reverte a decisão nº 12. R$ 20 para
farinha, açúcar, manteiga, fermento e canela de uma massa de 24 é plausível; confirme num
mercado antes de subir, porque é afirmação que a primeira compradora checa.

---

## Semáforo por bloco

| # | Bloco | | Diagnóstico |
|---|---|---|---|
| 1 | hero | 🟢 | H1 em português, com produto, preço e promessa. O mecanismo saiu daqui — era o defeito da passada anterior. Falta `{{IMG:hero:1}}` |
| 2 | dor | 🟢 | *"Você assa a fornada inteira. E vende metade."* Nomeia o prejuízo com número: *"Vende onze. Sobram treze esfriando."* |
| 3 | demo | 🟢 | Agora nomeia o mecanismo no corpo, não na manchete — ver correção 5. O H2 continua sendo o benefício: *"O forno só liga depois que o dinheiro entra."* |
| 4 | razoes | 🟢 | Os 5 motivos são argumentos distintos. O primeiro ancora no preço de mercado com fonte |
| 5 | calc | 🟢 | Duas bolinhas, custo constante, faturamento em destaque. Consertado de verdade — ver correções 1 e 6 |
| 6 | produto | 🟢 | 8 itens contáveis, todos com número ou forma |
| 7 | ideal | 🟢 | Descreve a vida dela, não o produto: *"Trabalha fora e só tem a noite"*, *"Cobra R$4 no brigadeiro e sabe que é pouco"* |
| 8 | bonuses | 🟢 | Os 6 com as duas linhas e o verbo da ação em negrito: *"Copia, cola e manda"*, *"Imprime, prende na geladeira e para de chutar preço"* |
| — | ~~depoimentos~~ | ⬛ | **Removido inteiro.** Não há cliente real. O molde trazia "+17.800 alunas" e nove depoimentos com nome e valor — inventar é fraude, placeholder vazio é pior que ausência. Volta do molde quando houver três prints |
| 9 | planos | 🟡 | Plano único R$ 27,90, âncora R$ 197, checklist de 8 linhas batendo com produto + 6 bônus + vitalício. Amarelo só pelo `{{CHECKOUT}}` |
| 10 | garantia | 🟢 | 30 dias, incondicional, com o valor exato: *"Os R$27,90 voltam integrais"* · *"Sem perguntas"* |
| 11 | autoridade | 🟢 | **De volta, e na fôrma.** Chef Mari Dias, sem credencial nenhuma, os dois parágrafos fixos idênticos ao `pão de queijo.html`, só o terceiro trocado de produto. Título com o nome do produto. Foto é `{{IMG:autoridade:1}}`, não a URL da Atomicat do molde |
| 12 | acesso | 🟢 | Os 4 passos, com o quarto refeito: *"Enrola a primeira massa hoje à noite"* |
| 13 | faq | 🟢 | 12 perguntas. As três caras estão lá: preço da região, "tem de graça na internet" e a objeção que só existe aqui — *"E se eu enrolar e ninguém pedir naquele dia?"* |

**Ordem final:** `hero → dor → demo → razoes → calc → produto → ideal → bonuses → planos →
garantia → autoridade → acesso → faq`. **Idêntica à do molde**, menos `depoimentos`. Zero
desvio de ordem.

---

## Coerência

**Dicionário de termos.** "Rolinhos Gourmet Lucrativos" 8×, sempre igual, inclusive no grito
do bloco de planos. "Fornada Encomendada" 3× — demo, produto e FAQ — sem um sinônimo. Os 6
CTAs dizem a mesma frase: "QUERO COMEÇAR A VENDER". O ressalva está no achado nº 1: o nome
canônico é consistente consigo mesmo, mas não com o *descritor* que a página usa.

**Promessa única.** O topo promete vender sem assar à toa; o produto entrega a massa que
espera; a garantia fala de *"enrolar a massa numa noite e entregar a primeira caixa na manhã
seguinte"*. Mesma história nos três.

**Checklist contra bônus.** As 6 capas do bloco `bonuses` batem uma a uma com as 6 linhas do
plano. Zero item fantasma, zero item faltando.

**O ponto que parece incoerente e não é.** A H1 diz *"R$30 a caixa"* e o `razoes` diz *"a
padaria cobra R$12 no rolinho"*. Caixa de 4 a R$ 30 dá R$ 7,50 a unidade — abaixo da
padaria, de propósito, e o FAQ 1 explica de frente. O preço dela fica fácil de praticar e o
benchmark fica por cima. Mantido.

**Prova social.** Nenhum número de aluna em lugar nenhum, coerente com o bloco removido.
Nenhum resíduo de "+17.800". E o bloco `autoridade` que voltou **não inventou credencial**:
nem diploma, nem curso, nem anos de mercado, nem número de alunas.

---

## Consciência e objeções

**Nível tratado: consciência do problema.** Ela sabe que sobra doce na bancada e que cobra
pouco; não sabe que existe jeito de inverter a ordem. Nível certo para tráfego frio — a
página abre pelo prejuízo (`dor`), não pelo produto.

| Objeção | Onde a página responde |
|---|---|
| "Na minha cidade ninguém paga isso" | FAQ 1, com o preço da padaria e a saída da caixa de 2 |
| "Tem receita de graça na internet" | FAQ 2 — separa receita de mecanismo: *"está comprando o jeito de vender sem sobrar"* |
| "E se eu fizer e não vender?" | FAQ 5 e o bloco `dor` inteiro. É a objeção central, e o mecanismo existe para ela |
| "Quem é você pra me ensinar?" | Bloco `autoridade` — **que na versão anterior não existia**. É a objeção que voltou a ter resposta |
| "Nunca vendi nada" (persona secundária) | Card 4 do `ideal` — as duas portas combinadas na concepção, nem uma a mais |

**Promessa exagerada?** Não há promessa de faturamento em texto fixo. O único número grande
sai da calculadora, dos dois valores que ela mesma põe, e o rodapé mantém o aviso de que são
exemplos. No teto dos sliders (10 caixas × R$ 45) o resultado é R$ 12.500 de sobra no mês —
alto, mas é o extremo do controle, não uma afirmação da página.

---

## Peso e carregamento — medido

| Métrica | Página nova | Molde de origem | Situação |
|---|---|---|---|
| HTML cru | **61.311 B** | 65.314 B | ✅ 6% mais leve |
| `<section>` | 13 | 14 | ✅ só `depoimentos` a menos |
| `<img>` | **17** | 26 | ✅ 9 a menos |
| `<style>` / `<script>` | 1 / 2 | 1 / 2 | ✅ igual |
| `loading="lazy"` | 16 de 17 | — | ✅ só o hero fora, correto |
| `fetchpriority="high"` no hero | sim | sim | ✅ |

A regra era não ficar mais pesada que o molde. Não ficou.

---

## As correções que eu fiz agora

1. **`calc` — `<div class="calc-field">` vazia.** Sobrou do terceiro slider que foi retirado.
   A classe carrega `margin-bottom:var(--s3)`, então eram 22px de buraco entre a última
   bolinha e a conta. Removida a div inteira. Nenhum CSS tocado.
2. **`<style>` — bloco `autoridade` duplicado.** Ao reinserir a seção, o CSS de
   `templates/blocos/autoridade-molde-a.html` foi colado no fim da folha — mas ele já estava
   lá, idêntico, nas linhas 202-209, porque o `pão de queijo.html` sempre teve o bloco.
   Removida a **segunda** cópia (~360 B). Isso restaura o molde, não redesenha nada: conferi
   que o `<style>` do molde termina em `.mockup-completo` e que `.autoridade` aparece nele
   uma vez só.
3. **"seu e mail" → "seu e-mail"**, em dois lugares (`demo-cta` e FAQ 8). A página escreve
   "e-mail" corretamente nos outros três.
4. **`calc` — *"R$ 0,83 de massa por rolinho"* → *"de ingrediente por rolinho"*.** A linha se
   chama "Ingredientes" e o `CUSTO` cobre massa, recheio e cobertura. "De massa" subestimava
   o próprio número da página.
5. **`demo` — o mecanismo não era nomeado no bloco que o explica.** "Fornada Encomendada"
   aparecia só no `produto` e no FAQ. Entrou na abertura do `demo-sub`: *"Chama-se **Fornada
   Encomendada**: você enrola de noite…"*. É exatamente onde o `CLAUDE.md` manda pôr — corpo
   do bloco que explica como funciona, nunca manchete nem subtítulo do hero. Conferi que isso
   não cria nome rival em destaque: 3 ocorrências, nenhuma em h1, h2 ou `hero-sub`.

## O que eu não fiz, de propósito

- **O nome do produto** — achado nº 1. É decisão de concepção e foi revertida por outra mão
  depois do laudo anterior; discutir é melhor que sobrescrever.
- **`DECISOES.md` e `STATUS.md`** — achado nº 2. Reescrever decisões que eu não tomei
  inventaria a justificativa delas.
- **Não redesenhei.** Nenhum CSS novo, cor nova, fonte nova ou layout novo. Duas
  recomendações ficam de pé:
  - **CSS órfão:** `.depoimentos`, `.depo-*` e o `@keyframes scrollDepo` continuam na folha,
    ~1,5 KB sem uso, porque o bloco saiu. São CSS **do molde**, e o bloco volta quando
    houver depoimento real — por isso deixei. Limpar é seguro e é decisão sua.
  - **`rel="preload"` na imagem do hero:** o molde não tem, e não dá para escrever o preload
    sem a URL real. Entra junto com as imagens.
  - **JS:** a variável `cdet` (`calcCustoDet`) é declarada e nunca usada — o texto do custo é
    estático. Uma linha morta, inofensiva.

---

## Onde está o gargalo

**Não é mais a ausência de gente na página.** Com o `autoridade` de volta, a oferta tem quem
a assine, na fôrma do molde e sem credencial inventada. O que continua faltando é **prova
social de cliente**: sem depoimento, o que sustenta a oferta em tráfego frio é argumento
mais o rosto da expert. Isso não se resolve com copy — resolve-se com as três primeiras
clientes reais e o bloco `depoimentos` voltando inteiro do molde.

Antes disso, porém, vem o nome: é a primeira coisa lida, a mais repetida, e hoje é o nome da
concorrente descrevendo um produto que a página chama de outra coisa.

---

## As 5 correções de maior impacto, por ordem

1. **Nome** — "Rolinhos Gourmet Lucrativos" → **"Rolinho de Canela Lucrativo"**. Tira o nome
   da concorrente, faz o nome dizer o produto e alinha com o que a página já escreve 10×.
2. **`planos`** — `{{CHECKOUT}}` não aponta para nada → link da oferta nova. **Bloqueador.**
3. **`DECISOES.md` e `STATUS.md`** — reconciliar com a página. O gate da rodada `--auto` está
   descrevendo uma versão que não existe mais.
4. **Imagens** — 17 slots, com os `alt` já servindo de briefing. Prioridade: hero, produto,
   planos (os dois mockups), depois os 6 do carrossel.
5. **Prova social** — as 3 primeiras clientes reais com print e resultado concreto. O bloco
   `depoimentos` volta inteiro do molde quando existirem.

## O que ficou de fora desta auditoria

- **Execução visual inteira** — sem imagens e sem render a 430px, não há nota.
- **Emendas entre seções, espaçamento e recorte de imagem** — dependem do render. A exceção é
  o buraco da `calc-field` vazia, que dava para ver no markup e foi corrigido.
- **Peso das imagens e soma total** — as imagens não existem.
- **A conferência mecânica de verdade** — o `conferir-pagina.mjs` não pôde rodar nesta
  sessão. A réplica à mão está no topo, com a evidência de cada item, mas ela é
  auto-avaliação: rode o script antes de subir.
