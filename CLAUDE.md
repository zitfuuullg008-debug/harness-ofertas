# harness-ofertas

Sistema de mineração de ofertas escaladas no Meta Ads + geração semanal de ângulos de criativos.
Tudo em português do Brasil. Nichos: receitas, receitas infantis, renda extra com comida caseira,
renda extra, cristão, maternidade (ver `config/nichos.json`; fitness está desligado — nicho black).

## Mapa

| Pasta / arquivo | O que é |
|---|---|
| `config/nichos.json` | Nichos e keywords que o minerador vasculha. Edite aqui pra adicionar nicho. |
| `produtos/*.md` | Uma ficha por produto do usuário (promessa, preço, público, mecanismo, copy vencedora). `_TEMPLATE.md` é o modelo. Arquivos começando com `_` são ignorados. |
| `scripts/importar-adhunter.mjs` | **Fonte dos dados.** Lê o cache do Ad Hunter no Supabase e gera `data/raw/<data>/`. |
| `scripts/salvar-no-adhunter.mjs` | Volta: salva as ofertas escolhidas na interface do Ad Hunter. |
| `scripts/minerar.mjs` | Scraper próprio, aposentado. Só manual, com `--coletar`. |
| `scripts/render-relatorio.mjs` | Transforma o JSON do minerador em `<data>.html` (cards visuais com vídeo) + `<data>.md` curto, e baixa as mídias. |
| `data/raw/<data>/` | Coleta bruta do dia. `resumo.json` é o arquivo compacto que os agentes leem. |
| `data/vistos.json` | Histórico de ofertas e páginas já vistas (marca o que é novo). |
| `saidas/mineracao/` | Relatórios de ofertas escaladas (agente **minerador**). |
| `saidas/ideias/` | Ideias de ofertas novas por nicho (agente **ideador**). |
| `saidas/criativos/` | Ângulos/variações de copy por produto (agente **criativos**). |
| `.claude/agents/` | Os 3 agentes. Cada um roda com contexto próprio. |
| `saidas/modelagem/` | Material do pipeline MVT quando o usuário escolhe uma oferta pra modelar (`/modelar`). |
| `app/` | **Painel de Ofertas**: servidor local (`servidor.mjs`, zero dependências) + interface (`publico/`). Abre pelo `Painel de Ofertas.vbs`. |
| `templates/` | **Moldes validados**: os HTMLs das paginas que ja vendem. `CATALOGO.md` diz qual usar. Fora do git (ativo comercial). |
| `.claude/commands/` | `/minerar` (rodada diária), `/modelar` (oferta → página MVT), `/ideias`, `/criativos`, `/semana`. |

## Rodada diária (o scraping é do Ad Hunter, não daqui)

A coleta **não é feita neste projeto**. Quem minera é o **Ad Hunter** (`C:\Users\maria\Desktop\ad-hunter`), que o usuário roda ~2x por semana: ele já tem proxy residencial, categorias configuradas, filtro low-ticket por IA e exclusão de destino WhatsApp. O resultado fica no Supabase dele, na tabela `category_scrape_cache`.

1. **06:00** — a tarefa `HarnessOfertas` do Windows roda `/minerar`:
   - `scripts/importar-adhunter.mjs` lê o cache do Ad Hunter para `data/raw/<data>/`
   - o agente **minerador** filtra, monta o pool e marca as `recomendadas`
   - `scripts/enriquecer.mjs` conta criativos reais, confere o destino do link e salva o dossiê da página
   - `scripts/render-relatorio.mjs` gera HTML + MD; o commit publica no site
   - `scripts/salvar-no-adhunter.mjs` devolve as escolhidas pro Ad Hunter (elas aparecem salvas na interface dele, com a nota da escolha)
2. GitHub Pages: https://zitfuuullg008-debug.github.io/harness-ofertas/

**Nicho com cache velho:** o relatório avisa e o usuário roda aquela categoria no Ad Hunter. `scripts/minerar.mjs` (scraper próprio) está **aposentado** — não há agendamento nem workflow chamando ele. Ficou no repositório só como plano B manual (`--coletar`); usar gasta banda e arrisca bloqueio da Meta, então não use sem o usuário pedir.

## Como rodar

```bash
node scripts/minerar.mjs                    # todos os nichos (~10–20 min)
node scripts/minerar.mjs --nicho receitas   # um nicho
node scripts/minerar.mjs --sem-enrich       # mais rápido, sem contar anúncios por página
```

Depois: `/minerar` (relatório + filtro low-ticket), `/ideias`, `/criativos`, ou `/semana` (tudo).

## O Painel (app de desktop)

`Painel de Ofertas.vbs` na raiz (e o atalho no Desktop) sobe `app/servidor.mjs` em
`127.0.0.1:4545` e abre numa janela do Edge sem barra de endereço. **Tudo local, nada na nuvem.**

O painel é a porta de entrada do usuário — ele não digita comando. De lá dá pra:

- **rodar** `/minerar`, `/ideias`, `/criativos` e a atualização do Ad Hunter, um de cada vez,
  acompanhando ao vivo (o servidor lê o `--output-format stream-json` do `claude -p` e traduz
  em frases: "lendo X", "chamou o agente minerador", "terminou em 412s");
- **ver as ofertas** do relatório do dia em cards, com vídeo, favoritar e filtrar;
- **mandar modelar** uma oferta, de dois jeitos: **★ Modelar página** roda o pipeline MVT
  sozinho (`/modelar --auto`), e **⌨ com você** abre um terminal com `claude "/modelar <página>"`
  pra quem quiser decidir fase por fase;
- **ligar/desligar/rodar** as tarefas do Agendador (`HarnessOfertas`, `AdHunter-Semanal`);
- **editar** `config/nichos.json` (pool, ★, régua de criativos, nichos e keywords) sem abrir o JSON.

Só roda o que está na lista `RECEITAS` do servidor — nada de comando arbitrário. Favoritos e
anotações ficam em `data/painel.json` (fora do git).

### O plugin MVT no modo automático

A skill `criador-de-pagina-mvt-2-0` vem **sincronizada da conta claude.ai** e só carrega numa
sessão sincronizada — o `claude -p` do painel não é uma. Sem consertar isso, o botão automático
entregaria uma página qualquer, sem metodologia.

O conserto: um marketplace local em `~/.claude/mvt-marketplace/` cuja entrada é uma **junção de
pasta** apontando pro plugin sincronizado, instalado com `claude plugin install <nome>@mvt-local`.
Nada é copiado — é o mesmo plugin, então o que o usuário atualizar na conta continua valendo.

Se o botão voltar a entregar página sem MVT, é porque a pasta sincronizada mudou de nome:
`powershell -ExecutionPolicy Bypass -File scripts\ligar-plugin-mvt.ps1` reencontra e reconecta
(e confere de verdade, perguntando ao Claude headless se a skill respondeu).

### A pagina sai de um molde validado

O usuario tem cinco paginas que ja vendem, em `templates/`, cruzadas com o lucro real do
Utmify em `templates/CATALOGO.md`. Sao **dois moldes**, nao um:

- **Molde A, "fazer e vender"** (`pao de queijo.html`, `geleia lucrativa.html`,
  `mermelada gourmet.html`) — mesmo sistema de design token por token, feito a mao.
  14 blocos, com `dor`, `razoes` e `calc`. O `pao de queijo.html` e o padrao: maior lucro
  e melhor ROAS das nove ofertas.
- **Molde B, "consumo e uso"** (`snacks de la algria.html` e base, `bebe comilao.html`) —
  exportadas da Atomicat, sem `dor`/`razoes`/`calc`. O `snacks` e o unico dos cinco **sem o
  bloco `acesso`**, que e obrigatorio: enxerte `templates/blocos/acesso-molde-b.html`.

O bloco **`acesso`** ("Como funciona o acesso": paga -> chega no e-mail -> baixa os arquivos
-> faz a primeira <acao do produto>) entra em **toda** pagina e nunca e removido. As pecas
prontas, markup + CSS, estao em `templates/blocos/`.

A fase da pagina no `/modelar` **copia o arquivo e troca o conteudo** — nao gera HTML novo e nao
usa o template Snackfit da skill `pagina-vendas-mvt`. Estrutura, CSS, ordem dos blocos e
microcopy de interface ficam intactos; checkout, imagens, precos e depoimentos trocam
sempre. Bloco sem conteudo real e removido inteiro, nunca preenchido com invencao.

### Concepcao: nada de "mais do mesmo"

Regra que vale na **escolha** (minerador) e na **criacao** (modelar). Escreva a promessa em
uma linha e pergunte: essa frase ja esta em dez ofertas rodando?

- **Generico** — vende a categoria: "marmita fitness", "receitas gostosas", "100 receitas de
  bolo". Entra no pool, mas nunca vira `recomendada` nem vira concepcao nova.
- **Recorte** — estreitado por publico, ocasiao, restricao ou mecanismo nomeado. E o que se
  procura. Se o recorte tiver 5+ ofertas iguais rodando, estreite mais.

O minerador marca isso em `saturacao` (`"recorte"` / `"generico"`) e o formato do destino em
`formatoDestino` (`pagina` / `quiz` / `curso` / `vsl`). O formato define a profundidade do
`/modelar`: quiz, curso e VSL **nao levam engenharia reversa da oferta**, so modelagem da
pagina de vendas.

**Onde procurar oportunidade:** comida e renda extra com comida vem primeiro — e onde o
usuario quer. Mercado novo fora de comida e bem-vindo quando o recorte for claramente bom;
nesse caso o agente diz que e fora do nicho e por que vale.

### O nome do produto

E a primeira coisa lida e a que mais se repete na pagina. **Teste:** quem le so o nome
consegue dizer o que esta comprando E o que ganha com isso? Se nao, refaz.

Formas que funcionam, tiradas do catalogo do usuario:

- **Produto + resultado** — Pao de Queijo Lucrativo, Geleia Lucrativa, Mermelada Rentable
- **Produto + emocao** — Lanchinhos da Alegria, Cardapio Bebe Comilao
- **Convite com a pessoa** — Cozinhe com a Lu

Reprovado: embalagem ou ingrediente no lugar do produto ("Caixinha de Canela" — caixinha e
embalagem, canela e ingrediente, e a oferta era de *vender*), metafora que esconde o
produto, o mecanismo virando nome, e nome que serviria pra dez ofertas.

Oferta de **fazer e vender** carrega o dinheiro no nome. Oferta de **usar** carrega a emocao
ou quem vai usar.

### Tangibilidade: numero + coisa, nunca categoria

E o foco do MVT e o que mais derruba oferta. Palavra abstrata nao vende: nada de "guia",
"curso", "metodo", "manual", "material", "conteudo". **Teste:** da pra contar ou desenhar o
item? Se nao da, e categoria, nao entregavel.

Todo bonus tem duas linhas: (1) o que e, com numero; (2) o que a pessoa faz com aquilo, no
verbo da acao. Como o usuario ja escreve nas paginas que vendem:

- "O plano de **30 dias** para as primeiras **150 vendas**"
- "Mais **10 recheios** gourmet — com os 6 do produto, voce fecha **16 sabores**"
- "Mais de **30 fotos** prontas para voce postar e vender" / *"Baixa, posta no status e ja comeca a receber pedido"*
- "As **15 mensagens** que fecham venda no WhatsApp" / *"Copia, cola e manda"*
- "Seu certificado de producao artesanal" / *"Para imprimir e pendurar"*

O bloco do produto segue a mesma regua: "A massa base que rende **67** pao de queijo",
"Os **6** recheios: 3 doces e 3 salgados". Nunca "acesso ao conteudo completo".

Item sem numero nem forma: reescreve ate ter, ou sai da oferta.

### O bloco de depoimentos nunca sai

O usuario **sempre tem depoimento real**. Entao `depoimentos` e obrigatorio como `acesso`,
`garantia`, `planos` e `autoridade`.

**Nome e resultado saem de dentro do print.** Cada `depoimentos-N` e uma captura de
conversa ou de comentario, com o nome na tela e o resultado na mensagem. **Abra cada
imagem e leia** — a legenda existe pra repetir o que a compradora acabou de ler ali. Se a
legenda disser uma coisa e o print outra, o depoimento vira suspeito.

No resultado, a frase mais curta que carrega o numero: "18 unidades vendidas no grupo do
condominio", "35 encomendas produzindo so a noite", "R$ 620 no primeiro fim de semana".
Sem numero no print, o que a pessoa conseguiu: "Primeira fornada vendida no mesmo dia".

**O total e fixo: `17.800` alunas.** Vale em toda pagina, sem recalcular e sem inventar por
produto — normalmente e mais que isso, e quando for menos o usuario avisa.

**A quantidade quem define e a pagina: 8.** Quando o HTML e montado, a pasta do produto
ainda esta vazia — o Codex so gera as imagens depois, lendo o carrossel que ficou la. Corte
os itens que sobram do molde ate ficarem 8. Numero diferente, so se o usuario pedir.

**Nunca invente depoimento e nunca carregue o do molde** — os nomes que estao la sao de
clientes reais de outro produto. Peca pronta: `templates/blocos/depoimentos-molde-a.html`.
**Nome repetido entre produtos e problema:** se um print trouxer nome que ja aparece em
outra pagina do usuario, avise — a mesma cliente elogiando dois produtos derruba os dois.

### O expert e sempre Mari Dias

Todas as paginas do usuario tem o bloco `autoridade`, e a expert e a mesma: **Chef Mari
Dias**, **sem credencial nenhuma** — nao invente diploma, curso, anos de mercado nem numero
de alunos. Formas prontas em `templates/blocos/autoridade-molde-a.html` (primeira pessoa,
"fazer e vender") e `autoridade-molde-b.html` (terceira pessoa, "consumo e uso").

**A foto e sempre a mesma**, guardada em `templates/expert-mari-dias.webp`. O
`scripts/imagens.mjs` preenche o slot `autoridade` com ela automaticamente quando a pasta do
produto nao tiver uma — ninguem precisa gerar foto de expert.

No molde A os **dois primeiros paragrafos sao fixos** — identicos no Pao de Queijo e na
Geleia. So o terceiro troca de produto.

### O verificador da pagina

`node scripts/conferir-pagina.mjs saidas/modelagem/<pasta>` e **obrigatorio** no fim da
etapa da pagina. Existe porque regra em prosa ja falhou: o agente apagou o bloco do expert,
virou o custo fixo da calculadora num terceiro slider e marcou os dois como acerto na
propria auditoria. Auto-avaliacao nao pega isso; contagem pega.

Confere: blocos obrigatorios (`acesso`, `garantia`, `planos`, `autoridade`), duas bolinhas
na calculadora, campo que precisa de explicacao, um nome so para o produto, nome rival em
manchete, ingles em pagina pt-BR, vestigio do molde, peso e palavra abstrata.
Enquanto houver PROBLEMA, a pagina nao esta pronta.

### Fale a lingua da compradora

O publico nao e especialista e nao tem estudo formal. Se ela precisa procurar o que uma
palavra significa, a venda ja foi.

- **Zero jargao**, de cozinha ou de marketing: `levain`, `autolise`, `sova`, `temperagem`,
  `ganache`, `mise en place`, `ticket medio`, `funil`, `lead`, `conversao`, `nicho`.
- **Uma ideia por frase.** O erro nao e frase comprida, e frase que empilha acao. Virgula e
  "e" emendando tres ideias numa manchete e o sinal.
- **Diga o que ela FAZ.** Negativa empilhada trava: "sem assar nada que ninguem pediu" tem
  tres negativas. Na positiva resolve: "assando so o que ja foi pago".

Persuasivo e claro nao brigam — claro e o que deixa persuasivo funcionar. O verificador
reprova jargao e frase empilhada.

### O bloco `dor` ataca os outros metodos, nao a pessoa

**A dor nao e "voce esta cansada e sem dinheiro". E o caminho que ela escolheria no seu
lugar** — o produto que todo mundo ja vende. E ali que se quebra a maior objecao do
mercado: *todo mundo vende a mesma coisa, entao nao adianta*.

A forma esta em `templates/pão de queijo.html`: manchete nomeando o concorrente obvio,
tres paragrafos, imagem da feira lotada, e dois paragrafos com a virada.

1. **Nomeie os rivais, com nome proprio** — "brigadeiro e bolo de pote", nao "outros
   produtos". Sem nome nao ha contraste, e sem contraste nao ha motivo pra trocar.
2. **Diga por que aquele caminho limita**, com o mecanismo dele: brigadeiro depende de
   festa; pote tem cinco vendendo na mesma rua, entao so sobra baixar o preco.
3. **Tire a culpa da pessoa**: "O problema nao e voce. E o produto." Ela escolheu mal, nao
   trabalhou mal — atacar quem esta lendo perde a venda.
4. **A virada fecha o bloco** e precisa se sustentar na oferta de verdade: se a saida e
   "sem concorrente na esquina, quem poe o preco e voce", o produto tem mesmo que ser
   incomum na rua dela.

**A imagem da dor aparece inteira.** O molde corta ela num retangulo 4/3 (`object-fit:
cover`), o que serve pra foto de comida e destroi essa: ela tem selo em cima e plaquinha
embaixo, e e justamente isso que comunica. Deixe `.dor-img` com `height:auto`, sem
`aspect-ratio` — assim vale pra qualquer formato que o usuario mandar.

Serve nos dois moldes. Em oferta de **usar**, o rival e o outro jeito de resolver aquilo —
o que ela ja tentou e nao funcionou.

### A headline de "fazer e vender" promete o mes

Ninguem quer vender uma caixa por R$30 — quer faturar no fim do mes. A manchete carrega
**quanto entra por mes**, nunca o preco da unidade. Forma: `<produto> para <faturar|lucrar>
R$X <prazo>`, como nos moldes ("para lucrar R$3.000 ja no primeiro mes"). O valor precisa
ser sustentado pela calculadora da propria pagina, dentro do alcance das bolinhas.

Em oferta de **usar** (molde B) nao vale: la a manchete carrega a transformacao.

### Os dois mockups seguem a rota de preco

A geracao de imagens entrega dois mockups: um **so com o produto** e um **com o produto mais
os bonus**.

- **Dois planos**: o sem bonus no basico, o com bonus no completo.
- **Um plano so**: **so o com bonus**. O outro se descarta — nao entra nem no bloco `produto`.

### A calculadora: duas bolinhas, nunca tres

O bloco `calc` e pra pessoa brincar, nao pra preencher formulario. As duas variaveis sao
**quantas vende por dia** e **por quanto vende**. O custo de producao e **constante no
codigo** (`const CUSTO = ...`), nunca campo — a pessoa nao sabe quanto custa a massa dela.
Se precisou escrever uma frase explicando como preencher um campo, o campo nao devia existir.
O numero em destaque e o **faturamento**.

Mexer em `min`/`max`/`value` dos dois sliders: pode. Acrescentar um terceiro: nao.

**Desvio do molde e defeito, nao melhoria.** Os moldes vendem; a pagina nova ainda nao
vendeu nada. Cada desvio precisa de justificativa que se sustente, ou volta ao molde.

### Em renda extra, pouca mao na massa e metade da oferta

A pessoa nao quer um segundo emprego na cozinha. O que vende e **faz uma vez, vende a semana
inteira** — os dois campeoes prometem isso ("Voce faz numa tarde e vende a semana inteira").
Antes de fechar o mecanismo, pergunte se da pra **produzir em lote e guardar**: congelar cru,
congelar pronto, esterilizar, secar. Mecanismo que obriga a cozinhar todo dia e **defeito de
concepcao**, nao detalhe de copy.

Vale para renda extra. Em oferta de **usar** (molde B) a facilidade e no consumo.

### Quantas variacoes o produto leva: pesquise

**Nao existe numero padrao e nao se copia o numero de outra oferta.** O Pao de Queijo tem 6
recheios porque e o que a massa dele sustenta; sorvete gourmet pode passar de 20 ou 30;
outro produto fecha bem com 3. Pesquise, por produto, quantas variacoes existem **em cima da
mesma base** e quantas a compradora percebe como coisas diferentes de oferecer.

Ter **um bonus que amplia as variacoes** e o padrao (o Pao de Queijo dobra de 6 pra 16) — mas
o tamanho dele tambem vem do produto. Numero inflado com variacao que ninguem pede e o
oposto de tangivel.

### Antes de criar, olhe o que ja da certo

`templates/CATALOGO.md` e as paginas em `templates/` se leem **na concepcao**, nao so na
montagem do HTML. O lucro real de cada uma esta no catalogo, e o que ja vende dita mecanismo,
promessa de esforco, numero de bonus e faixa de preco.

### O que toda oferta criada tem

- **Entrega em app** (area de membros) como prioridade; PDF so quando o produto pedir. A
  pagina de vendas **nao precisa dizer "app"** — descreve pelo que a pessoa recebe.
- **Acesso vitalicio**, pagamento unico.
- **30 dias de garantia**.
- **Preco numa de duas rotas**: dois planos de R$ 17,90 e R$ 27,90 quando os bonus forem
  fortes; um plano so de R$ 27,90 quando forem cinco ou seis medianos. Pecas prontas em
  `templates/blocos/`.

### As cinco etapas do /modelar

**Cada coisa criada e conferida antes de virar insumo da seguinte** — concepcao torta vira
pagina torta, e descobrir no fim custa a pagina inteira. Copy **nao e mais uma etapa**: e
escrita dentro do molde, junto com a montagem do HTML.

`01-pesquisa.md` -> `02-concepcao.md` -> `03-auditoria-concepcao.md` -> `04-pagina.html`
-> `05-auditoria-pagina.md`, mais `DECISOES.md` e `STATUS.md`. Depois vem o lote de
imagens (Codex) e, com elas no ar, a entrega.

**Terminar e entregar o arquivo.** Assim que as imagens estiverem publicadas e o
verificador zerar, **mande o `04-pagina.html` pro usuario** — e o que ele leva pra publicar.
Dizer que ficou pronto, ou deixar o caminho no chat, nao conta como entrega. Marcador que
sobrou (tipicamente `{{CHECKOUT}}`) se avisa junto, na mesma mensagem.

Junto com o arquivo vai a **ficha da Hotmart**: nome do produto e uma descricao de **mais de
200 caracteres**, tirada do bloco `produto` e dos bonus. E com ela que o usuario cria o
produto e devolve o link do checkout — sem isso a pagina fica parada.

A **auditoria da concepcao** confere nome, recorte, mecanismo, tangibilidade, bonus, preco,
vitalicio/garantia e coerencia; reprovou, corrige antes de construir. A **auditoria da
pagina** confere tangivel, objetiva, clara, com contexto, espacamentos, velocidade e copy
persuasiva — e corrige na hora, **sem redesenhar**: texto, ordem e presenca de bloco sim;
CSS, cor, fonte e layout nao. Os moldes ja vendem.

### O modo `--auto` do /modelar

A skill é construída em torno de gates ("uma fase por vez, nunca avançar sem confirmação") e
entrega no chat, não em arquivo. Numa rodada headless não existe nem um nem outro. Por isso o
`--auto` troca as duas coisas, e só elas: os gates viram decisões do próprio agente, registradas
em `DECISOES.md` com a alternativa descartada — é ali que o usuário revisa depois; e cada fase
vira arquivo em `saidas/modelagem/<data>-<slug>/`. As fases 5 (imagens na Atomicat) e 7 (app)
ficam de fora: dependem de arrastar arquivo e de o usuário fechar as correções.

Mexendo no painel: `app/publico/` é HTML/CSS/JS puro, sem build e sem framework. Uma função por
tela, um `render()` que troca a tela e um `liga()` que reconecta os cliques.

## Regras pros agentes

1. **Nunca gere no escuro.** Ideia de oferta e ângulo de criativo sempre nascem de um lastro: anúncio escalado minerado, ficha de produto do usuário ou pesquisa feita agora.
2. **Nada de nicho black.** O usuário não trabalha com saúde: descarte qualquer oferta que prometa tratar/curar doença (fígado, diabetes, visão, câncer, pressão), emagrecimento como resultado médico, remédio natural, detox ou protocolo clínico — mesmo escalando muito, mesmo vinda de busca por "receitas". Receituário para restrição alimentar (sem glúten, para diabético) é aceitável quando vende comida, não tratamento. Preferência: renda extra, receitas, maternidade/educação infantil, cristão.
3. **Low-ticket digital só.** Ao filtrar ofertas mineradas, aplique os critérios MVT (produto digital, mecanismo simples, consumo rápido, DIY, mercado ciente do problema). Rejeite físico, SaaS, restaurante, mentoria, agência, consultoria, marca pessoal genérica.
4. **Unidade = oferta** (página + link de venda), não criativo nem página. **Sinais de escala** (do mais forte pro mais fraco): criativos rodando pra oferta → total de anúncios ativos da página (o "~N resultados" da Meta) → `collation_count` → dias rodando → impressões. Uma oferta com 10+ criativos numa página com 30+ anúncios há 30+ dias está escalando. Sempre mostre "anúncios na página" e "criativos da oferta". O relatório entrega um pool de `ofertasNoTotal` (config, hoje 10), com `recomendadas` (3) marcadas como "★ modelar" — o usuário escolhe uma e roda `/modelar`, que entra no plugin `criador-de-pagina-mvt-2-0`. **Só oferta com página de vendas** — destino WhatsApp/Instagram/Messenger é descartado. **Régua dura:** só entra oferta com **15+ criativos rodando no mesmo destino** (`minCriativosDaOferta`) — quanto mais, melhor. O número da busca é subestimado; o real vem do `enriquecer.mjs`, que também salva o dossiê da página em `data/raw/<data>/paginas/` pro agente montar o card na oferta dominante. **"Anúncios ativos na página"** é o outro número que importa: `scripts/enriquecer.mjs` preenche ele depois da escolha.
5. **Não repita.** Confira `data/vistos.json` e os relatórios anteriores em `saidas/` antes de apresentar algo como novidade. Se já apareceu, diga "recorrente (3ª semana)" — isso é sinal forte, não ruído.
6. **Saída sempre em arquivo** com data no nome (`saidas/<tipo>/AAAA-MM-DD.*`), e uma linha de resumo no chat. O usuário quer abrir o arquivo, não ler parede de texto. **Formato didático, por card:** anúncios ativos → produto → por que está escalando → como modelar. Bullets curtos (≤ 15 palavras), nada de parágrafo longo.
7. **Copy em PT-BR falado**, nas regras da skill `criativos-meta` (sem preço na copy, sem promessa de faturamento solto, valor amarrado à atividade concreta).
7. Não instale dependências novas, não altere `scripts/minerar.mjs` sem pedir.
