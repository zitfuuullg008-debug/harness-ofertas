---
description: Pega uma oferta minerada como lastro de demanda e cria uma oferta nova pela Metodologia MVT, já montada no template validado. Uso: /modelar Roberta Carvalho | /modelar 1 | /modelar --auto Roberta Carvalho
allowed-tools: Read, Glob, Grep, Skill, Bash, WebFetch, WebSearch, Write, Edit
---

O usuário escolheu uma oferta minerada. Ela é **lastro de demanda**, não modelo a copiar: prova que aquele público compra, e só. A concepção que vai ao ar é sua. Argumento: `$ARGUMENTS` (nome do anunciante, número do card, ou vazio; pode vir com `--auto` na frente).

## 1. Ache a oferta e classifique o formato

Leia o relatório mais recente em `saidas/mineracao/` (o `.json`). Case `$ARGUMENTS` (sem o `--auto`) com `pagina`; se for número, use a ordem dos cards; se vier vazio, liste as 3 `recomendada: true` numa linha cada e pergunte qual.

Monte a ficha: `pagina`, `produto`, `preco`, `promessa`, `hook`, `linkVenda`, `anunciosNaPagina`, `criativosDaOferta`, `diasRodando`, `porqueEscala`, `comoModelar`, `urlBiblioteca`.

Abra o `linkVenda` e **classifique o formato do destino**, porque é isso que define quanto trabalho a Etapa 1 merece:

| Formato | Como reconhecer | Profundidade |
|---|---|---|
| **Quiz / curso / VSL** | quiz de perguntas, área de curso, vídeo longo com botão embaixo | **Rasa.** Leia só promessa, público e preço. Não faça engenharia reversa da oferta inteira — aqui você modela **só a página de vendas** |
| **Página de vendas direta** | página low-ticket com blocos, preço à vista | **Completa.** Raio-X inteiro |

Defina o `<slug>` em kebab-case e crie **`saidas/modelagem/<hoje>-<slug>/`**.

## 2. Dois modos

### Sem `--auto` — acompanhado

Uma etapa por vez, com gate de confirmação no fim de cada uma. O usuário está na frente do teclado: pergunte.

### Com `--auto` — sozinho (o botão "★ Modelar página" do painel)

**Ninguém está no teclado.** A rodada é headless: o que você escrever no chat se perde, e uma pergunta de gate trava tudo até o limite de turnos. Nesta modalidade e só nela:

1. **Os gates viram decisões suas.** Escolha a rota que os dados sustentam e siga.
2. **Registre no `DECISOES.md`**: o que escolheu, a alternativa descartada, o porquê em meia linha. É o substituto do gate — é por ali que o usuário revisa e pede ajuste.
3. **Não invente dado.** O que a pesquisa não sustentar vira "Não identificado".

## 3. As etapas

**Cada coisa criada é conferida antes de virar insumo da seguinte.** A concepção passa por uma conferência antes de virar página, e a página passa por outra antes de ser entregue. Concepção torta vira página torta; descobrir isso no fim custa a página inteira.

Os arquivos da pasta, e só eles:

| Arquivo | Etapa |
|---|---|
| `01-pesquisa.md` | pesquisa de mercado + leitura da concorrência |
| `02-concepcao.md` | a oferta nova: nome, recorte, mecanismo, bônus, preço |
| `03-auditoria-concepcao.md` | **confere a concepção** contra o MVT — antes de construir |
| `04-pagina.html` | **copy escrita direto no HTML**, no molde validado |
| `05-auditoria-pagina.md` | **confere a página**, lista os ajustes feitos e a nota |
| `DECISOES.md` · `STATUS.md` | as escolhas e o estado |

### Etapa 1 — Pesquisa e leitura da concorrência

Invoque `criador-de-pagina-mvt-2-0:raio-x-mvt`. A pesquisa de mercado roda **sempre**, nos dois níveis de profundidade — é ela que diz quantos concorrentes o recorte tem, que é o insumo da Etapa 2.

Na profundidade rasa, pare na pesquisa + promessa/público/preço do concorrente. Na completa, faça a extração inteira.

### Etapa 2 — A concepção é sua, e não pode ser mais do mesmo

Invoque `criador-de-pagina-mvt-2-0:modelador-mvt`, mas com estas regras por cima:

**Antes de qualquer coisa, olhe o que já está dando certo.** Leia `templates/CATALOGO.md` e as páginas em `templates/` **na etapa da concepção**, não só na hora de montar o HTML. O lucro real de cada uma está no catálogo. O que já vende dita mecanismo, promessa de esforço, número de bônus e faixa de preço — a oferta nova começa daquele lugar, não do zero.

**O teste do "mais do mesmo".** Escreva a promessa da oferta nova em uma linha e pergunte: *essa frase já está em dez ofertas rodando?* Se estiver, está no genérico e não serve.

Reprovado: "marmita fitness", "receitas gostosas", "100 receitas de bolo", "bolo de pote pra vender". São categorias, não recortes.

Aprovado: recorte estreitado por **público, ocasião, restrição ou mecanismo** — e que a pesquisa da Etapa 1 mostre com poucos vendedores. Se o recorte tiver 5 ou mais ofertas iguais rodando, **estreite mais** antes de seguir.

Use a contagem da pesquisa, não o seu palpite: diga no `02-concepcao.md` quantos concorrentes o recorte tem e como você contou.

**Onde procurar.** O usuário trabalha com comida e renda extra com comida — é aí que ele quer as oportunidades. Mercado novo fora de comida é bem-vindo quando o recorte for claramente bom; nesse caso diga na primeira linha do `02-concepcao.md` que é fora do nicho dele e por que vale.

**O nome do produto.** É a primeira coisa que a pessoa lê e a que mais se repete na página. Nome sem graça derruba a oferta inteira.

*O teste:* alguém que nunca viu a oferta lê **só o nome** e consegue dizer (a) o que está comprando e (b) o que ganha com isso? Se não conseguir, o nome falhou — refaça.

As três formas que funcionam, tiradas do que o usuário já vende:

| Forma | Exemplos dele |
|---|---|
| **Produto + resultado** | Pão de Queijo Lucrativo · Geleia Lucrativa · Mermelada Rentable |
| **Produto + emoção** | Lanchinhos da Alegria · Snacks de la Alegría · Cardápio Bebê Comilão |
| **Convite com a pessoa** | Cozinhe com a Lu |

Reprovado, sempre:

- **Embalagem ou ingrediente no lugar do produto.** "Caixinha de Canela" foi assim: caixinha é como se entrega, canela é o que vai dentro. O produto é o rolinho — e era pra vender, o que o nome não diz.
- **Metáfora que esconde** o que se compra.
- **O mecanismo virando nome.** O mecanismo é outro ativo ("Fornada Sortida"); o nome do produto tem que ser o produto.
- Nome que serviria para dez ofertas diferentes.

**Em português, na palavra que o público usa.** "Cinnamon Roll Lucrativo" erra aí: quem faz e vende no Brasil diz *rolinho de canela*. Nome que a compradora não pronuncia não gruda.

**Um nome só, do começo ao fim.** Escolhido o nome, a página inteira usa **aquela** palavra: título, H1, blocos, bônus, planos, FAQ, botões. Nada de alternar entre o nome, o termo em inglês, a tradução e o apelido — cada sinônimo a mais é uma dúvida a mais sobre o que se está comprando. Vale para o produto, o mecanismo, a promessa, os bônus e o preço: um termo para cada coisa.

**O mecanismo não disputa com o nome.** São dois ativos e o nome é o que se repete. O mecanismo entra onde explica *como funciona* — nunca no subtítulo logo abaixo do H1, nunca como headline de bloco. Se ao ler a página a pessoa sai lembrando do mecanismo e não do produto, está invertido.

Se a oferta é de **fazer e vender**, o nome carrega o dinheiro — é o que os quatro campeões dele fazem. Se é de **usar**, carrega a emoção ou quem vai usar.

**A headline de "fazer e vender" promete o mês, não a unidade.** Ninguém quer vender uma caixa por R$30 — quer faturar no fim do mês. O número grande da manchete é **quanto entra por mês**, e os moldes já fazem assim:

> Pão de queijo recheado congelado para **lucrar R$3.000 já no primeiro mês**.
> Geleia artesanal gourmet para **lucrar R$3.500 já no primeiro mês**.

A fôrma é `<produto> para <faturar|lucrar> R$X <prazo>`. O valor tem que ser **sustentado pela calculadora da própria página** — dentro do alcance das bolinhas, não um número inventado. Diga no `DECISOES.md` qual posição das bolinhas sustenta o número.

Em oferta de **usar** (molde B) isso não vale: lá a manchete carrega a transformação, não dinheiro.

**Fale a língua da compradora.** O público não é especialista e não tem estudo formal: ela cozinha e quer vender. Se precisar procurar o que uma palavra significa, a venda já foi.

- **Zero jargão**, de cozinha ou de marketing. `levain`, `autólise`, `sova`, `temperagem`, `ganache`, `mise en place` — e também `ticket médio`, `funil`, `lead`, `conversão`, `nicho`. Diga em palavra comum: fermento de padaria, amassar, derreter e esfriar, creme de chocolate, quanto cada cliente paga.
- **Uma ideia por frase.** O erro não é frase comprida, é frase que empilha ação: *"Você enrola à noite, abre a encomenda de manhã e só liga o forno depois que o Pix cai"* obriga a pessoa a segurar três coisas ao mesmo tempo. Vira três frases: *"Você enrola os rolinhos à noite e guarda na geladeira. De manhã, só assa o que já foi pago. O resto fica lá, esperando o próximo pedido."*
- **Diga o que ela FAZ, não o que deixa de fazer.** Negativa empilhada trava: *"sem assar nada que ninguém pediu"* tem três — *sem*, *nada*, *ninguém* — e a pessoa precisa desfazer as três pra descobrir que a ideia é boa. Na positiva fica na hora: *"assando só o que já foi pago"*.
- **Sinal de alerta:** vírgula e "e" emendando três ideias na mesma frase, ou três negativas numa frase só, em headline, subtítulo ou H2.

Persuasivo e claro não brigam — claro é o que deixa persuasivo funcionar. O verificador reprova jargão e frase empilhada; não discuta com ele, reescreva.

**Tangibilidade — é o foco do MVT e o que mais derruba oferta.** A pessoa precisa saber exatamente o que vai receber. Abstração mata: ninguém se anima com "guia", "curso", "método", "manual", "material" ou "conteúdo". O que convence é **número + coisa que dá pra ver**.

*O teste:* dá pra **contar** ou **desenhar** o item? Se não dá, não é entregável — é categoria.

Como os bônus campeões do usuário são escritos (todos seguem a mesma fôrma):

| Bônus real | Por que funciona |
|---|---|
| "O plano de **30 dias** para as primeiras **150 vendas**" | dois números, e o resultado no próprio título |
| "Mais **10 recheios** gourmet — com os 6 do produto, você fecha **16 sabores**" | conta o que ganha e o total que fica |
| "Mais de **30 fotos** prontas para você postar e vender" | objeto contável, uso explícito |
| "As **15 mensagens** que fecham venda no WhatsApp" | número + o que a mensagem faz |
| "Onde comprar polvilho e queijo pelo menor preço" | sem número, mas é uma lista que existe |
| "Seu certificado de produção artesanal — para imprimir e pendurar" | objeto físico, dá pra visualizar |

Duas regras que saem daí:

1. **Todo bônus tem duas linhas.** A primeira é o que é, com número. A segunda é o que a pessoa *faz* com aquilo, no verbo da ação: "Baixa, posta no status e já começa a receber pedido", "Copia, cola e manda", "Para imprimir e pendurar".
2. **O bloco do produto segue a mesma régua.** "A massa base que rende **67** pão de queijo", "Os **6** recheios: 3 doces e 3 salgados", "Os **3** tamanhos de pacote, com custo e lucro de cada um". Nunca "acesso ao conteúdo completo".

Se um item não tem número nem forma, ou você o reescreve até ter, ou ele sai da oferta.

**Em renda extra, pouca mão na massa é metade da oferta.** A pessoa não quer um segundo emprego na cozinha. O que vende é **faz uma vez, vende a semana inteira** — e os dois campeões do usuário prometem exatamente isso:

> Pão de Queijo: *"Você faz numa tarde e vende a semana inteira"* · pílula **"Pronto numa tarde"**
> Geleia: *"Você faz numa tarde e vende o ano inteiro"* · *"sem voltar pro fogão"*

Então, antes de fechar o mecanismo, pergunte: **dá pra produzir em lote e guardar?** Congelar cru, congelar pronto, esterilizar, secar, embalar a vácuo. Quase sempre dá, e quando dá, é isso que entra no hero.

Mecanismo que obriga a cozinhar todo dia é defeito de concepção, não detalhe de copy — derruba a oferta mesmo com a copy boa. Se o produto realmente não permitir lote, diga no `02-concepcao.md` por quê, e compense a facilidade em outro eixo (tempo de preparo, número de ingredientes, zero equipamento).

**Isto vale para renda extra.** Em oferta de **usar** (molde B) o eixo é outro: lá a facilidade é no consumo, não na produção.

**Quantas variações o produto leva: quem decide é o produto.** Não existe número padrão, e **não se copia o número de outra oferta**. O Pão de Queijo tem 6 recheios porque é o que a massa dele sustenta; a Geleia tem 8 pelo mesmo motivo. Sorvete gourmet pode passar de 20 ou 30 sem forçar nada. Outro produto pode fechar bem com 3.

Pesquise, para cada produto novo: quantas variações existem de verdade **em cima da mesma base** (se precisa de outra base, não conta) e quantas a compradora percebe como coisas diferentes de oferecer. O número sai daí.

**Ter um bônus que amplia as variações é o padrão** (o Pão de Queijo dobra de 6 pra 16, a Geleia de 8 pra 18) — ele existe pra aumentar o número sem inchar o produto principal. Mas o tamanho do bônus também vem do produto, não de uma tabela.

Número inflado com variação que ninguém pede é o oposto de tangível. Se sustenta 3 boas, entregue 3.

**A entrega é em app.** Priorize área de membros (a skill `anthropic-skills:app-entregavel-2-0` monta). PDF só quando o produto realmente pedir. **A página de vendas não precisa dizer "app"** — descreva pelo que a pessoa recebe e como acessa, não pela tecnologia.

**Preço — duas rotas, e só estas duas:**

| Rota | Quando | Peça |
|---|---|---|
| **Dois planos**, R$ 17,90 e R$ 27,90 | bônus fortes e em bom número: dá pra separar um básico de um completo sem o básico ficar capenga | `templates/blocos/planos-2-planos.html` |
| **Um plano só**, R$ 27,90 | cinco ou seis bônus medianos: dividir só enfraquece os dois lados | `templates/blocos/planos-1-plano.html` |

Escolher entre as duas é decisão de gate: registre no `DECISOES.md` com o motivo.

**Sempre, em todo produto, sem exceção:**

- **Acesso vitalício** — pagamento único, sem mensalidade
- **30 dias de garantia** — peça `templates/blocos/garantia-30dias.html`

### Etapa 3 — Conferir a concepção, antes de construir qualquer coisa

Pare e audite o que você acabou de criar, contra a Metodologia MVT. Saída em `03-auditoria-concepcao.md`. Você está procurando erro no seu próprio trabalho — seja duro.

| Item | Passa quando |
|---|---|
| **Nome** | quem lê só o nome sabe o que compra **e** o que ganha. Não é embalagem, ingrediente, metáfora nem mecanismo |
| **Recorte** | não é categoria. A pesquisa mostra poucos concorrentes naquele recorte exato |
| **Mecanismo** | tem nome, é simples de explicar e resolve o gargalo real — não é rótulo bonito |
| **Tangibilidade** | todo bônus e todo item do produto tem número ou forma. Zero "guia", "curso", "método", "material", "conteúdo" |
| **Bônus** | cada um tem as duas linhas: o que é (com número) e o que a pessoa faz com aquilo |
| **Preço** | numa das duas rotas, e a rota casa com a força dos bônus |
| **Vitalício e 30 dias** | os dois presentes |
| **Coerência** | promessa, mecanismo, bônus e preço contam a mesma história. Bônus que não serve à promessa é peso morto |
| **Critérios MVT** | digital, mecanismo simples, consumo rápido, DIY, mercado ciente do problema |

**Reprovou em algo? Volte e corrija a concepção antes de seguir** — não anote como pendência. Registre no `03-auditoria-concepcao.md` o que estava errado e o que virou. Só passe à etapa seguinte com tudo verde.

### Etapa 4 — Copy e página, de uma vez

**Não existe mais uma etapa só de copy.** Você escreve a copy **dentro do molde**, bloco a bloco, e a saída é `04-pagina.html`. Nada de `03-copy.md`.

Use `criador-de-pagina-mvt-2-0:agente-executor-copy-mvt` como régua do texto, mas **não** use o template Snackfit da `pagina-vendas-mvt`: o HTML vem dos moldes validados do usuário.

1. Leia **`templates/CATALOGO.md`** e escolha o molde. Em uma linha: a pessoa vai **vender** o que aprender → `templates/pão de queijo.html`; vai **usar** → `templates/snacks de la algria.html`. Em espanhol, os dois já estão no idioma.
2. **Copie o arquivo inteiro** para `04-pagina.html` e edite no lugar. Não gere HTML novo nem recrie a estrutura "inspirado" no molde.
3. **Misturar os moldes é permitido** — puxe um bloco de um pro outro quando a oferta pedir. Mas os dois usam **os mesmos nomes de variável com valores diferentes** (`--marrom` é `#3D2B1F` no A e `#5A3522` no B; `--px` é 17px e 22px). Cores e espaçamentos se adaptam sozinhos ao molde hospedeiro, o que é desejável. O que quebra é variável que **só existe numa família**: as peças em `templates/blocos/` trazem, no cabeçalho, a lista do que virar valor literal.
4. **Não toque**: `<style>` base, classes, nomes das `<section>`, fontes, scripts, animações, microcopy de interface.
5. **Troque sempre**:

   | O que | Como |
   |---|---|
   | Link de checkout | pelo da oferta nova. Sem link ainda → `{{CHECKOUT}}` e anote no `STATUS.md` |
   | Nome, promessa, mecanismo, preço, bônus | a concepção da Etapa 2 |
   | `<title>`, `<h1>`, todos os `<h2>` | a copy que você está escrevendo agora |
   | `lang` do `<html>` | se mudar de idioma |
   | Cada `<img src>` | vira `{{IMG:<bloco>:<n>}}`. Mantenha `class`, `width`, `height` e reescreva o `alt` dizendo o que a imagem precisa mostrar — o `alt` é o briefing das imagens |
   | Depoimentos | nome, resultado e foto viram marcador — o bloco fica |

6. **O bloco `dor` ataca os outros métodos, não a pessoa.** A dor não é "você está cansada e sem dinheiro" — é **o caminho que ela escolheria no seu lugar**. É ali que cai a maior objeção do mercado: *todo mundo vende a mesma coisa, então não adianta*.

   Copie a forma do `templates/pão de queijo.html`: manchete nomeando o concorrente óbvio, três parágrafos, imagem da feira lotada, dois parágrafos com a virada.

   - **Nomeie os rivais com nome próprio** — "brigadeiro e bolo de pote", nunca "outros produtos". Sem nome não há contraste, e sem contraste não há motivo pra trocar.
   - **Diga por que aquele caminho limita**, pelo mecanismo dele: brigadeiro depende de festa; pote tem cinco vendendo na mesma rua, então só sobra baixar o preço.
   - **Tire a culpa da pessoa**: "O problema não é você. É o produto." Ela escolheu mal, não trabalhou mal.
   - **A virada fecha o bloco** e tem que se sustentar na oferta de verdade.

   Em oferta de **usar**, o rival é o outro jeito de resolver aquilo — o que ela já tentou e não funcionou.

7. **Os dois mockups seguem a rota de preço.** A geração de imagens entrega dois: um **só com o produto** e um **com o produto mais os bônus**.

   | Rota | Onde vai cada um |
   |---|---|
   | **Dois planos** | o sem bônus no **básico**, o com bônus no **completo** |
   | **Um plano só** | **só o com bônus** — o outro se descarta, não entra em lugar nenhum |

   Vale também pro bloco `produto`: com um plano, quem aparece é sempre o pacote completo.

8. **A calculadora tem exatamente duas bolinhas.** O bloco `calc` existe pra pessoa brincar, não pra ela preencher um formulário. As duas, sempre:

   - **quantas ela vende por dia**
   - **por quanto ela vende**

   O **custo de produção é constante no código** (`const CUSTO = …` no molde), tirado da concepção. Nunca vira campo: a pessoa não sabe quanto custa a massa dela, e não é na página de vendas que ela vai descobrir.

   **Mexeu no campo, conserte o texto em volta.** Tirar um slider e deixar "mexa as três bolinhas" no subtítulo é o erro mais fácil de cometer e o mais bobo de entregar. O mesmo vale pro nome em CAIXA ALTA no bloco de planos, que escapa de qualquer troca feita só na forma capitalizada.

   *O sinal de que você errou:* se precisou escrever uma frase explicando como preencher um campo, o campo não devia existir. Apague o campo, não escreva a frase.

   O número em destaque é o **faturamento** — "Você recebe R$ X". O custo aparece como desconto discreto embaixo.

   Mexer nos limites dos sliders (`min`, `max`, `value`) para caber na realidade da oferta nova: pode e deve. Acrescentar um terceiro: não.

9. **Blocos obrigatórios, nunca removidos:**
   - **`acesso`** — "Como funciona o acesso", quatro passos: paga → chega no e-mail → baixa/abre → faz a primeira `<ação do produto>`. Só o quarto muda. O `snacks de la algria.html` **não tem** esse bloco: enxerte `templates/blocos/acesso-molde-a.html` ou `acesso-molde-b.html`, entre `autoridade` e `faq`.
   - **`garantia`** — 30 dias.
   - **`depoimentos`** — prova social. **O usuário sempre tem depoimento real**, então o bloco nunca sai. **A quantidade quem define é a página: deixe 8.** Nesta etapa a pasta do produto ainda está vazia — o Codex só gera as imagens na Etapa 6, lendo o carrossel que você montar aqui. Corte os itens que sobram do molde até ficarem 8. Se o usuário pedir outro número, vale o dele. Nome, resultado e foto são dele: deixe `{{DEPO_NOME_n}}`, `{{DEPO_RESULTADO_n}}` e `{{IMG:depoimentos:n}}` e anote no `STATUS.md`. **Nunca invente depoimento e nunca carregue o do molde** — os nomes que estão lá são de clientes reais de outro produto. Peça pronta: `templates/blocos/depoimentos-molde-a.html`.
   - **`autoridade`** — o expert. **Todas as páginas do usuário têm, e é sempre a mesma pessoa: Chef Mari Dias.** Ela **não tem credencial** — não invente diploma, curso, anos de mercado nem número de alunos. A foto é **sempre a mesma**, guardada em `templates/expert-mari-dias.webp` — o script de imagens usa ela sozinho, ninguém precisa gerar. Peças prontas: `templates/blocos/autoridade-molde-a.html` e `autoridade-molde-b.html`. **Apagar o bloco não é opção.**

     A fôrma do molde A tem três parágrafos e **os dois primeiros são fixos**, idênticos no Pão de Queijo e na Geleia:

     > Todo mês era a mesma coisa: o dinheiro apertava no fim e sempre faltava um pouco.
     >
     > Eu comecei vendendo doce barato no grupo do bairro. Trabalhava o fim de semana inteiro e via pouco sobrar. Até entender que o problema não era o meu preço, era o meu produto.

     Só o terceiro muda: `Quando troquei para <produto novo>, <o que mudou nas clientes>. Hoje eu faturo mais de R$7.000 por mês da minha cozinha, e coloquei aqui o que eu faço no dia a dia.` O título leva o nome: `Quem está por trás dos <Produto>:`.

     No molde B é terceira pessoa: `Mari Dias criou o <Produto> depois de perceber que <público> queria <objetivo>, mas travava sempre nos mesmos pontos: <três travas>.` Fecho fixo: `A ideia não é fazer você virar chef. É te ajudar a <benefício real>.`
   - **`planos`** — na rota de preço escolhida, com o acesso vitalício dito.
10. **Bloco sem conteúdo real se remove inteiro** — exceto os três acima. Sem depoimento, sem conta de lucro, sem autoridade: apague a `<section>`. Não deixe placeholder, não invente. Remover é decisão de gate.
10. Anote no `DECISOES.md` **qual molde usou, o que enxertou de onde e por quê**, e liste os `{{IMG:...}}` e `{{CHECKOUT}}` que sobraram.

### Etapa 5 — Conferir a página e corrigir

`criador-de-pagina-mvt-2-0:auditoria-copy-mvt` sobre `04-pagina.html`, mais os itens abaixo. Saída em `05-auditoria-pagina.md`.

| O que conferir | Como |
|---|---|
| **Tangível** | passe bloco a bloco: cada entrega tem número ou forma? Sobrou algum "guia", "curso", "método", "material", "conteúdo"? |
| **Objetiva** | tem bloco que não faz a pessoa avançar? Frase que repete a anterior? Corte |
| **Clara** | alguém que caiu de paraquedas entende o que é, pra quem é e quanto custa, sem reler |
| **Com contexto** | cada bloco puxa o seguinte. A promessa do topo é a mesma do checkout. O mecanismo aparece com o mesmo nome em todo lugar |
| **Espaçamentos** | os moldes já vêm certos. O que quebra é bloco enxertado: confira se ele usa a mesma escala do molde hospedeiro e se não encostou nos vizinhos |
| **Velocidade** | meça: peso do arquivo, número de imagens, CSS e scripts. Compare com o molde de origem — a página nova não deve ficar mais pesada que ele |
| **Copy persuasiva** | headline prende? A objeção morre antes do preço? O CTA diz a ação concreta? |

**Rode o verificador antes de qualquer julgamento seu:**

```
node scripts/conferir-pagina.mjs saidas/modelagem/<pasta>
```

Ele confere mecanicamente o que auto-avaliação não pega: bloco obrigatório ausente, número de bolinhas da calculadora, nome do produto usado de mais de um jeito, nome rival ocupando manchete, inglês em página pt-BR, vestígio do molde, peso e palavra abstrata.

**Enquanto ele listar PROBLEMA, a página não está pronta.** Corrija e rode de novo até sair limpo. Não discuta com ele no laudo, não justifique problema como escolha: conserte. Os `aviso` você julga — se discordar, explique no laudo.

**Desvio do molde é defeito, não melhoria.** Se você mudou algo que o molde fazia de outro jeito, o ônus é seu: ou o molde estava quebrado, ou você errou. "Melhorei" não é justificativa — aquelas páginas vendem e a sua ainda não vendeu nada. Liste cada desvio no laudo e justifique um por um; sem justificativa que se sustente, volte ao molde.

**Corrija o que der pra corrigir, na hora** — e liste cada ajuste no `05-auditoria-pagina.md`.

**Limite do ajuste:** você mexe em texto, em ordem de bloco e em bloco que sobra ou falta. Você **não** redesenha: nada de CSS novo, cor nova, fonte nova ou layout novo. Os moldes são páginas que já vendem — se a correção exigiria fugir deles, não faça, anote como recomendação e siga.

**A nota é de copy e contexto, e só.** A página sai sem imagem — os `{{IMG:...}}` entram depois, na Atomicat. Então avalie o que existe: texto, clareza, objetividade, encadeamento dos blocos, persuasão.

Não dê nota de execução visual, de prova visual nem de tangibilização por imagem — nada disso foi construído ainda, e nota de coisa que não existe é nota inventada. Diga no laudo, em uma linha, que a parte visual ficou de fora e que a nota vale para copy e contexto.

Tangibilidade aqui é a **do texto**: o bônus diz um número e uma coisa? O item tem forma? Isso dá pra julgar sem imagem nenhuma.

### Etapa 6 — Peça as imagens ao Codex

**Assim que o verificador zerar, chame o Codex.** Não espere o usuário pedir: página sem imagem não vai pro ar, e a geração do lote demora — quanto antes começar, melhor.

```
node scripts/pedir-imagens.mjs saidas/modelagem/<pasta>
```

Ele aciona a skill `producao-imagens-produto` do Codex, que **lê a página e conta sozinha** os bônus e os depoimentos — não repita essa conta no pedido, senão viram duas fontes de verdade pra divergir. A entrega cai em `imagens-novas/<produto>/`. Só uma exceção vale dizer: não gerar foto da expert, que é fixa do projeto.

**O script vai até o fim sozinho.** Como o `codex exec` é síncrono, quando ele volta o script já converte pra WebP, sobe pro GitHub Pages e troca os `{{IMG:...}}` pelas URLs. Se sobrar alguma imagem, ele chama o Codex de novo pedindo **só as que faltam**, com a descrição de cada uma, e publica outra vez. Duas tentativas; o que persistir ele lista pra alguém olhar.

Não precisa ficar esperando nem rodar `imagens.mjs` na mão.

### Etapa 7 — Preencha os depoimentos lendo os prints

As imagens chegaram; os `{{DEPO_NOME_n}}` e `{{DEPO_RESULTADO_n}}` continuam lá. **Ninguém preenche isso sozinho** — o `imagens.mjs` só troca `{{IMG:...}}`.

Cada `depoimentos-N` é uma captura de conversa ou de comentário, com **o nome na tela e o resultado dentro da mensagem**. Abra cada uma e leia:

```
Read imagens/<slug>/depoimentos-1.webp    (e assim por diante)
```

- **Nome:** como aparece na tela — o nome do perfil numa conversa, o `@` num comentário.
- **Resultado:** a frase mais curta que carrega o número. "18 unidades vendidas no grupo do condomínio", "35 encomendas produzindo só à noite", "R$ 620 no primeiro fim de semana". Sem número no print, o que ela conseguiu: "Primeira fornada vendida no mesmo dia".
- **`{{DEPO_TOTAL_ALUNAS}}` é sempre `17.800`.** Fixo, em toda página, sem recalcular.

A legenda existe pra repetir o que a compradora acabou de ler na imagem. Se as duas disserem coisas diferentes, o depoimento vira suspeito.

### Etapa 8 — Entregue o HTML e a ficha da Hotmart

**Junto com o arquivo, mande o que o usuário precisa pra criar o produto na Hotmart** — é o que destrava o `{{CHECKOUT}}`, o único marcador que ele preenche. Sem isso a página fica parada esperando um link que ninguém pediu.

Duas coisas, no corpo da mensagem, prontas pra copiar:

- **Nome do produto** — exatamente o da página, sem variar.
- **Descrição com mais de 200 caracteres** — escrita a partir do bloco `produto` e dos bônus: o que a pessoa recebe com número, como recebe, vitalício e 30 dias de garantia. Mesma régua de tangibilidade da página: número + coisa, nada de "material" ou "conteúdo completo". Conte os caracteres e diga quantos deu.

**Com as imagens no ar, mande o arquivo pro usuário** — não basta dizer que ficou pronto nem deixar o caminho no chat. É o HTML que ele leva pra publicar; o trabalho só termina quando ele está com o arquivo na mão.

Antes de mandar, rode o verificador uma última vez e diga o que ainda depende dele — tipicamente o `{{CHECKOUT}}`. Marcador que sobrou se avisa junto com a entrega, não depois.

**Se o verificador ainda acusar PROBLEMA, não chame o Codex** — gerar imagem para uma página que vai mudar é desperdício.

No fim, responda em 3 linhas: a oferta criada, a nota e o caminho da pasta.

## 4. Regras (valem nos dois modos)

- **Tudo em português do Brasil**, inclusive as frases que você escreve enquanto trabalha — o painel mostra ao vivo.
- **Criar, não clonar.** A oferta minerada prova demanda; promessa, mecanismo e recorte são seus.
- Respeite o `CLAUDE.md`: nada de nicho black, low-ticket digital, PT-BR falado.
- Os arquivos em `templates/` são ativo comercial e estão fora do git. **Nunca** carregue deles para a oferta nova: imagem, depoimento, número de aluno, print de resultado ou link de checkout.
