> **Criação de criativo, ao começar uma conversa nova:** leia antes `saidas/criativos/PENDENTES.md`. É o que ficou pela metade quando o histórico foi limpo (14/10). Apague cada item quando terminar.

> **👀 SEMPRE LER O QUE O CODEX ESTÁ FAZENDO (27/10/2026, ordem dela; vale por cima de "NÃO acompanhe" no bloco abaixo).** Depois de mandar QUALQUER pedido ao Codex, fique lendo o registro dele sem parar até terminar: `C:\Users\maria\.codex\sessions\AAAA\MM\DD\rollout-*.jsonl` (o mais novo; `task_complete` = acabou, `last_agent_message` = o que ele diz que fez). Diga a ela no chat, sem ela perguntar: o que ele está fazendo, se já deu certo ou não, e o que falta. Confira a pasta `saidas/criativos/info/<slug>/criativos/` e ABRA cada imagem (texto errado, letra trocada, algo cortado = pedir de novo só aquela). Se o `codex.exe` não estiver rodando ou o registro parou, avise e reenvie. Nunca diga "está com o Codex" e some.

> **🖼️ IMAGENS DO SITE PELA SKILL `info-imagens` DO CODEX (17/10/2026, ordem dela): quando a copy da página estiver pronta, mande UMA mensagem ao Codex (`node scripts/mandar-codex-info.mjs <pasta-modelagem> <slug>`), que é UMA frase ("Use a skill info-imagens para criar as imagens desse produto.") + o CÓDIGO (HTML) da página com os encaixes de imagem marcados, NÃO a copy, SEM cores, preço, nome, caminho nem quantidade; NÃO acompanhe o que ele faz. Ela e o Codex deixam as imagens em `saidas/criativos/info/<slug>/criativos/`; quando ela avisar, `node scripts/pegar-imagens-info.mjs <pasta-modelagem> <slug>` coloca no site (hero/produto/bônus, depoimentos, anúncios em `para-campanha/`). **Depois de mandar, vigie a pasta de 10 em 10 minutos (`node scripts/esperar-imagens-info.mjs <pasta-modelagem> <slug>` em segundo plano) e, quando vier COMPLETO, comece o site sem esperar ela avisar (a aprovação da página continua dela).** Eu nunca crio depoimento. Ofertas baratas saem em `info.revitamulher.online/<oferta>` (domínio `.online`, o `.br` não existe; CNAME `info` → `6d24bd65ded35237.vercel-dns-017.com`; falta o PAGES_HOST no checkout).**

> **🪙 PRODUTO BARATO (R$ 6,70 e bumps de R$ 3,90) NÃO PRECISA DE CAPRICHO EXAGERADO (17/10/2026, ordem dela): faça bom e rápido, uma passada, sem refinar detalhe nem refazer imagem. O essencial (números, nada cortado, texto legível) continua.**

> **⚡ IMAGENS DO APP NUNCA PELO CODEX (17/10/2026, ordem dela): o Codex demora. Nas imagens do app você cria tudo sozinho por código (SVG dos exercícios, foto do Pexels ou emoji para comida). O Codex só faz as imagens da página (mockups).**

> **🧩 ECOSSISTEMA (17/10/2026): opção 3 do menu de modelagem.** Produto de front a R$ 6,70 + **4 order bumps** a **R$ 3,90** (teste 3,60), do mesmo público = **5 páginas**. A escolha dos bumps é no começo (candidatos, com os produtos JÁ FEITOS oferecidos para reaproveitar); ela aprova as 5 páginas juntas; cada bump também pode virar principal (R$ 6,70). **Produto de público masculino (calistenia) nunca é bump.** Detalhes na skill `/modelar` e em `config/ecossistemas.json`. Não confirmei que o checkout Atomify tem order bump: conferir antes do primeiro.

> **👁️ CONFERÊNCIA VISUAL OBRIGATÓRIA (17/10/2026, ordem dela): antes de mostrar uma página ou um app, rode `node scripts/conferir-visual.mjs <pasta>` (celular e computador) e ABRA as fotos que ele tira, uma por uma: nada cortado, nada faltando, texto legível. Ela não consegue ver isso, então é sua responsabilidade.**

> **🚫 NUNCA PUBLICAR NA ATOMICAT (16/10/2026, ordem dela): publica-se na VERCEL.** Página, app e PDF de oferta nova vão ao ar pelo `node scripts/lancar.mjs <pasta> --slug <nome>` (`<nome>.revitamulher.online`, app em `/app`). Não use `atomicat_publish_page`, `create_*`, `upload_media` nem `update_*` para oferta nova; as ferramentas `atomicat_*` só servem para ler/capturar páginas de concorrente. Isso vale sobre qualquer trecho mais antigo deste arquivo que mande publicar ou hospedar na Atomicat.

> **🚫 NUNCA PUBLICAR NEM MANDAR O LINK `pagamento.revitamulher.online/s/<nome>` (ordem dela, 27/10/2026, depois do Natal).** Esse endereço é o reserva do checkout e ela não quer página de venda nele. Página de oferta só vai ao ar no endereço que ELA pedir (`<nome>.revitamulher.online` ou o que ela disser); se o `lancar.mjs` publicar no reserva, diga a ela que está lá e despublique (apagar a linha da página em `SitePage` do banco do checkout, path `<nome>`), nunca mande esse link como prévia. Para ela ver a página antes de aprovar, mande o `previa.html` (arquivo com as imagens dentro), não link publicado.

> **🧶 PRODUTO DE CROCHÊ SAI SEMPRE EM `croche.revitamulher.online/<produto>` (ordem dela, 27/10/2026).** Todo produto de crochê usa esse endereço e só muda o nome depois da barra (o Jardim é a raiz e o Natal é `/natal`). Publique com `node scripts/lancar.mjs <pasta> --slug <produto>` e dê a ela `croche.revitamulher.online/<produto>` (app em `/<produto>/app`). Isso depende da regra `CROCHE_SUB` no `middleware.ts` do projeto checkout (já no ar). Nunca crie subdomínio novo para crochê.

> **🔀 MODELAGEM, SEMPRE DUAS OPÇÕES (16/10/2026, pedido dela):** toda vez que ela for modelar uma oferta, antes de qualquer outra coisa, mostre no chat: **1. Modelagem padrão** (a do `/modelar`, com paradas e molde escolhido por ela no app) ou **2. Modelagem rápida** (você decide tudo sozinho e devolve a página pronta, no template curto fixo `templates/molde-rapido.html`, a R$ 6,70; só muda a paleta, que você também escolhe, com `scripts/paleta-rapida.mjs`). Os detalhes estão no topo de `.claude/commands/modelar.md`. A rápida é a única exceção às leis 1, 2 e 3 abaixo, e só porque ela escolheu o modo; entrega a página, as imagens e o aplicativo (o produto é sempre app), sempre aumentando a quantidade do original, **sem perguntar nada**, com preço fixo R$ 6,70; revisa se está tangível e chamativo. **Uma parada só: ela aprova a página (com as imagens da página) antes de você criar o app, as imagens do app, o checkout, o pixel ou publicar qualquer coisa.** Aprovada, faz **app, imagens, checkout, publicação na Vercel e pixel**, sempre na conta de anúncios **CA - BACKUP (1012779914899671, `config/rapida.json`)**. Não liga campanha (precisa dos criativos dela) nem cadastra cartão.

> **⛔ LEIS INEGOCIÁVEIS DELA (15/10/2026), valem sobre tudo neste arquivo e no `/modelar`:** (1) um passo por vez: fez, ficou pronto → **lança na Central Criativa** (grava no app) e avisa no chat; só então o próximo; (2) **o molde quem escolhe é ela**, em Modelagens prontas → Criar página; nunca escolher molde, nunca começar página sem o molde vir dela; se ela pedir a página sem molde, responda numa linha "vai em Modelagens prontas, clica em Criar página e escolhe o molde"; (3) o passo seguinte só começa quando ela mandar; (4) tudo no chat, o app é registro; (5) fiel ao original, sem invenção, nunca "ficha", nada que ela não pediu (funil, página, imagem). O texto completo está no topo de `.claude/commands/modelar.md`.

# harness-ofertas

Sistema de mineração de ofertas escaladas no Meta Ads + geração semanal de ângulos de criativos.
Tudo em português do Brasil. Nichos: receitas, receitas infantis, renda extra com comida caseira,
renda extra, cristão, maternidade (ver `config/nichos.json`; fitness está desligado — nicho black).

## Como começa uma conversa aqui

**É no chat que as coisas acontecem.** O painel continua no ar e continua bom no que ele é bom:
ver as ofertas mineradas em card, com vídeo, e favoritar. Mas ele não conduz mais o trabalho.
Criar oferta é conversa — o usuário muda de ideia no meio, pede pra ver um arquivo, chama um
conector. Publicar depois pelo painel está ótimo; **decidir é aqui**.

O usuário abre uma **conversa nova** para cada oferta. Quando a primeira mensagem for só uma
abertura — "oi", "vamos lá", "bom dia" — sem tarefa dentro, **a primeira coisa é perguntar qual
dos dois caminhos**:

1. **Concepção do zero** — ele tem uma ideia e quer construir em cima dela.
2. **Modelar uma oferta** — existe uma oferta de fora servindo de lastro de demanda.

**Se for do zero:** pergunte qual é a ideia e construa a partir dela. A ideia dele é o lastro, e
some com a pesquisa feita na hora — é ela que diz quantos concorrentes o recorte tem. Sem
mineração no meio, o resto do caminho é o mesmo do `/modelar`, da Etapa 2 em diante: concepção →
auditoria da concepção → página no molde (só a copy) → verificador → auditoria da página com nota
→ HTML para ela levar ao Codex (imagens) → página volta pronta → app → PDF → Hotmart.
As nove paradas (oito + a da paleta, antes da página) continuam valendo (ver `.claude/commands/modelar.md`).

**Se for modelar:** a segunda pergunta é **de onde vem a oferta** — da mineração (o relatório do
dia ou a fila do painel) ou de fora (um link, um print, o nome de um anunciante). Da mineração,
`/modelar` acha sozinho. De fora, peça o link e trate igual: lastro de demanda, nunca modelo pra
copiar.

**Terminou uma tarefa? Pergunte o próximo passo (01/10/2026).** Feche sempre com um
`AskUserQuestion` "Qual o próximo passo?" com 2-4 opções concretas tiradas do que está
pendente (a mais natural primeiro, marcada como recomendada). Ela não quer ter que lembrar
sozinha o que vem depois.

**Mensagem que já traz a tarefa não leva pergunta nenhuma.** "Modela a Companhia Cozinhando Bem"
ou "quero fazer uma oferta de geleia de pimenta" já respondeu as duas — vá direto.

## Mapa

| Pasta / arquivo | O que é |
|---|---|
| `config/nichos.json` | Nichos e keywords que o minerador vasculha. Edite aqui pra adicionar nicho. |
| `produtos/*.md` | Uma ficha por produto do usuário (promessa, preço, público, mecanismo, copy vencedora). `_TEMPLATE.md` é o modelo. Arquivos começando com `_` são ignorados. |
| `scripts/importar-adhunter.mjs` | **Fonte dos dados.** Lê o cache do Ad Hunter no Supabase e gera `data/raw/<data>/`. |
| `scripts/salvar-no-adhunter.mjs` | Volta: salva as ofertas escolhidas na interface do Ad Hunter. |
| `scripts/sync-mineracao-central.mjs` | Leva o cache do Ad Hunter (e as ofertas salvas) pra aba Mineração do Central Instagram, no visual do AdHunter. O artifact não carrega nada de fora — nem API nem imagem do Facebook — então o script baixa e comprime as imagens (ffmpeg → webp embutido) e gera `data/mineracao-central/lotes.json` pro ArtifactData. Cada rodada só cria documentos novos; `--confirmar <runId>` marca a rodada no ar. |
| `scripts/otimizar-pagina.mjs` | Deixa a página rápida: topo carrega na hora (preload), resto sob demanda, preconnect só do que usa, fontes num pedido. O `imagens.mjs` roda sempre; o verificador reprova página lenta. |
| `scripts/depoimentos.py` | Desenha os 8 prints de depoimento sempre no molde dos modelos dela (DM e comentário), a partir de `<pasta>/depoimentos.json`. É o plano B: quem faz depoimento é o Codex, sempre com os 9 prints originais dela (`Documents/Prompt depoimentos`). Peças em `templates/depoimentos/`. |
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

## A rodada de mineração (o scraping é do Ad Hunter, não daqui)

> **REGRA DELA (11/10/2026), vale por cima do resto desta seção:** "sempre que eu pedir pra atualizar o Ad Hunter, priorize você pesquisar, manualmente, **sem o Decodo**, pra não gastar nada". Quando ela pedir pra atualizar o Ad Hunter, a mineração, ou "mais ofertas", **use o coletor próprio `scripts/minerar.mjs`** (direto da internet de casa, sem proxy, sem token): o `scripts/rodada-completa.ps1` já faz isso por padrão (o botão **↻ Atualizar** da aba chama ele) e o `sync-mineracao-central.mjs` manda pra aba o que o coletor próprio achou junto com o cache do Ad Hunter. O Ad Hunter com proxy pago (Decodo) **só se ela pedir explicitamente** (`-ComAdHunter`). Detalhes, palavras de curso/infoproduto e as lições de 11/10 (várias cópias do Ad Hunter brigando pelo navegador, proxy bloqueado) estão em `.claude/commands/minerar.md`. O parágrafo abaixo sobre `minerar.mjs` "aposentado" fica superado por esta regra.

A coleta **não é feita neste projeto**. Quem minera é o **Ad Hunter** (`C:\Users\maria\Desktop\ad-hunter`): ele já tem proxy residencial, categorias configuradas, filtro low-ticket por IA e exclusão de destino WhatsApp. O resultado fica no Supabase dele, na tabela `category_scrape_cache`.

1. **Só manual por enquanto** (30/09/2026: a usuária pediu pra desligar a automação; ela religa quando quiser). A tarefa `HarnessOfertas` (segunda e quinta 05:00, criada por `scripts/agendar-rodada.ps1`) está **desativada** — não religue sem ela pedir. `scripts/rodada-completa.ps1` encadeia:
   - `scripts/atualizar-adhunter.ps1`: o Ad Hunter minera as 4 categorias da aba ao mesmo tempo (usa proxy, ~7 min; sobe a API dele sozinho se estiver fora do ar). Se falhar, a rodada segue com o cache que existir
   - `scripts/sync-central.ps1`: `contar-anuncios.mjs` conta os anúncios ativos das páginas sem número (navegador, sem token) e a aba atualiza (~2-5 min)
   - **só com `-ComRecomendadas`**: `/minerar` (os passos abaixo) e outro sync. Gasta tokens (~20 min), então não roda por padrão. A tarefa `AdHunter-Semanal` fica desligada
   - `/minerar` → `scripts/importar-adhunter.mjs` lê o cache do Ad Hunter para `data/raw/<data>/`
   - o agente **minerador** filtra, monta o pool e marca as `recomendadas`
   - `scripts/enriquecer.mjs` conta criativos reais, confere o destino do link e salva o dossiê da página
   - `scripts/render-relatorio.mjs` gera HTML + MD; o commit publica no site
   - `scripts/salvar-no-adhunter.mjs` devolve as escolhidas pro Ad Hunter (elas aparecem salvas na interface dele, com a nota da escolha)
   - por último, `scripts/sync-central.ps1` atualiza a aba Mineração do Central Instagram (https://claude.ai/artifact/8oDsogtHFH1avbpUUMgJSq), pra ela ver o resultado sem o PC ligado: `sync-mineracao-central.mjs` gera os lotes, um `claude -p` separado manda com `ArtifactData` e o script confirma. **Escrever no banco do artifact pede permissão**, e de madrugada ninguém aprova — por isso esse Claude roda em `bypassPermissions`, mas sem Bash, sem editar arquivo e sem internet (`--disallowedTools`). O `/minerar` não faz esse passo
   - O botão **↻ Atualizar <categoria>** da aba (AdHunter) manda `[Painel] Atualizar mineração` com UMA categoria: rode `scripts/rodada-completa.ps1 -Categorias <id>` **em segundo plano**, sem `-ComRecomendadas`, e avise quando terminar. Nunca atualize todas de uma vez por esse botão (pedido dela, 05/10); as outras ficam com o cache que já tinham. Recomendadas novas só se ela pedir. A aba recarrega sozinha quando a rodada nova chega
   - **Escalado = 12+ anúncios ativos na página** (regra dela, 07/10; baixou de 15 pra 12 em 15/10). NÃO ligue `minAdsPerPage` no Ad Hunter: ele abre cada página pelo proxy pago e a rodada fica longa e cara (ela parou uma em 07/10: "vai gastar todos os meus créditos"). O filtro sai de graça: o `contar-anuncios.mjs` conta pelo navegador local e o `sync-mineracao-central.mjs` manda pros rejeitados quem tem menos de 15 ("Não está escalado") e deixa só uma oferta por página. Ela quer pelo menos 20 ofertas escaladas por categoria e variedade: as palavras-chave ficam na tabela `categories` do Supabase do Ad Hunter. Receitas ficou com 9 palavras em 07/10 (cada palavra a mais é mais proxy) (backup em `config/categoria-receitas.bak-1007.json`).
   - A aba mostra **★ Recomendadas**: as `recomendada` do último relatório (com `porqueRecomendada`, `porqueEscala` e `comoModelar`) e o resto do pool. Todo card tem **✦ Modelar esta oferta** (toque duplo pra confirmar): cria o doc em `concepcoes` com o link no `pedido`, manda `[Painel] Nova modelagem` e abre a aba Modelagem
   - Na aba, **Receitas** é só receita pra comer e **Renda Extra** só fazer e vender (receita pra vender vai pra Renda Extra). O sync separa pelo texto do anúncio, tira saúde/emagrecimento (nicho black) e mostra o que saiu, com o motivo, em "anúncios rejeitados" no fim de cada categoria — junto com os que o filtro do Ad Hunter recusou
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

O painel é a vitrine e o painel de controle, não o lugar onde a oferta nasce (ver **Como
começa uma conversa aqui**). De lá dá pra:

- **rodar** `/minerar` e a atualização do Ad Hunter, um de cada vez,
  acompanhando ao vivo (o servidor lê o `--output-format stream-json` do `claude -p` e traduz
  em frases: "lendo X", "chamou o agente minerador", "terminou em 412s");
- **ver as ofertas** do relatório do dia em cards, com vídeo, favoritar e filtrar;
- **mandar modelar** uma oferta: **★ Modelar no Claude Code** enfileira o pedido, copia o
  comando e abre um chat novo na aba Code — a modelagem inteira acontece lá, conversando;
- **ligar/desligar/rodar** as tarefas do Agendador (`HarnessOfertas`, `AdHunter-Semanal`);
- **editar** `config/nichos.json` (pool, ★, régua de criativos, nichos e keywords) sem abrir o JSON.

Só roda o que está na lista `RECEITAS` do servidor — nada de comando arbitrário. Favoritos e
anotações ficam em `data/painel.json` (fora do git).

### O plugin MVT no modo automático

A skill `criador-de-pagina-mvt-2-0` vem **sincronizada da conta claude.ai** e só carrega numa
sessão sincronizada — o `claude -p` do painel não é uma. Sem consertar isso, o botão do painel
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

**Todo topo de página (01/10/2026):** chuva do produto no fundo (`templates/blocos/chuva-produto.html`,
emojis do produto, ~1,2 KB) e imagem do topo sem moldura. Detalhes no `/modelar`, Etapa 4.

**Opção de visual no molde A: `molde-a-visual-2.html`.** Mesma estrutura e copy, pele nova
(fonte, cartões, movimento), mais o bloco `prat` ("a conta fecha", com a imagem do app) depois
da calculadora e a barra de preço que aparece só depois da oferta. Foi ao ar, o usuário testou e aprovou: é o **padrão
dos próximos produtos do molde A**. O `pão de queijo.html` fica como alternativa, só se ele pedir. A imagem do app tem prompt em
`templates/blocos/prat-app-imagem.md`. Detalhes e dados em `templates/CATALOGO.md`.

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

### O mecanismo tem que ser intuitivo, nao um termo de negocio

**Teste:** a pessoa le o nome do mecanismo uma vez e ja entende o que ele faz, sem
explicacao do lado? Se precisa de uma frase pra traduzir o proprio nome, ele falhou.

**Cuidado especial em oferta de usar (Molde B), pra familia.** O mecanismo nao pode pegar
emprestado o vocabulario do rival que a oferta ataca. "A Conta por Pessoa" foi reprovado
assim: rodizio de restaurante e cobrado "por pessoa" — o proprio termo que a oferta quer
substituir. Reforcou o jeito de pensar do concorrente em vez do jeito de casa e familia.
Prefira linguagem literal e caseira: "quantidade certa pra familia" antes de qualquer termo
que soe a conta, fatura, ticket ou preco por cabeca — isso e vocabulario de Molde A.

**Nem todo produto precisa de um mecanismo inventado.** Forcar um nome de sistema
("Quantidade Certa pra Familia", "A Conta da Bandeja") quando o produto ja e simples de
explicar sozinho e o erro oposto: complexidade que ninguem pediu. Se a coisa que a pessoa
recebe — um cardapio, uma lista de receita — ja resolve e ja se explica sozinha, chame pelo
nome dela mesma ("o cardapio japones") em vez de embrulhar num conceito com nome proprio.
Teste: se o usuario disser "por que voce nao chama so de X" e X for mais simples e mais
obvio, X e a resposta certa.

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

**O depoimento fala de venda, nunca de preparo.** O que a compradora duvida nao e que a
receita fica boa — e que alguem paga por ela. Print que para em "achei facil", "ficou uma
delicia" ou "material bem explicado" ocupa espaco sem provar nada. Dos 8, pelo menos 6
fecham num resultado de venda com numero e prazo, como no Pao de Queijo ("R$5.300 no
primeiro mes", "23 pacotes vendidos na primeira semana"); os outros 2 podem ser o comeco,
ainda apontando pra venda ("11 encomendas antes da primeira fornada"). A mesma regra esta
na skill do Codex, em `prompt-05-depoimentos-ilustrativos.md`.

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
**Nome nao e assunto.** Em print ilustrativo gerado, nome que se repete entre produtos nao
e motivo pra refazer nada nem pra avisar — o usuario ja decidiu isso. Nome so vira conversa
quando o print e real e o nome esta errado.

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

**A dor pode — e deve — usar numero real. So a manchete que nao usa.** O que doi mais que
"economize" ou "cuide melhor" e a conta feita: quanto custa hoje, quantas vezes isso se
repete por mes ou por ano, quanto vira no fim de tudo. Dois exemplos, um de cada molde:

- *Rodizio Japones em Casa* (usar): "Um rodizio custa uns R$180 por pessoa. Se o seu filho
  pedir pra repetir duas vezes no mes, isso ja e quase R$800 saindo de casa — dinheiro que
  dava pra fazer a mesma fartura em casa."
- *Lanchinhos da Alegria* (usar): "Seu filho vai pra escola umas 200 vezes por ano. Cada vez
  que ele come um industrializado, e isso que entra no corpo dele, bem na fase em que ele
  mais precisa crescer bem."

O numero mora no bloco `dor` (ou no `demo`), nunca no H1 — e vale nos dois moldes, mesmo
quando a manchete do molde B nao pode levar reais.

### A headline de "fazer e vender" promete o mes

Ninguem quer vender uma caixa por R$30 — quer faturar no fim do mes. A manchete carrega
**quanto entra por mes**, nunca o preco da unidade. Forma: `<produto> para <faturar|lucrar>
R$X <prazo>`, como nos moldes ("para lucrar R$3.000 ja no primeiro mes"). O valor precisa
ser sustentado pela calculadora da propria pagina, dentro do alcance das bolinhas.

Em oferta de **usar** (molde B) nao vale: la a manchete carrega a transformacao.

**So renda extra promete dinheiro na manchete — todo o resto e emocional.** E fazer e
vender (Molde A) que quer faturar, entao so ali o R$ entra no H1. Qualquer outra oferta —
economia domestica, alimentacao da familia, lanche escolar, seja qual for o nicho — quer
outro resultado: comer melhor, ter mais tempo, o filho nao comer besteira, nao gastar com
delivery. A manchete carrega **essa** transformacao, em frase persuasiva, nunca em numero
nem reais. Referencia de tom: `templates/snacks de la algria.html` e `lanchinhos da
alegria` (mesmo fora do catalogo ativo, valem de exemplo de manchete que vende sem numero).

**Cuidado pra nao misturar o padrao de renda extra com oferta de outro resultado.** E o
erro mais facil de cometer: copiar a formula do Pao de Queijo ("para lucrar R$X") pro
produto errado so porque ela funciona bem no molde A. Antes de escrever o H1, pergunte:
essa compradora quer faturar, ou quer outra coisa? A resposta decide se tem reais na
manchete.

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

### O bonus tem que ser da natureza da oferta — nao emprestado de renda extra

Bonus de venda (lista de compra calibrada por cliente, mensagens que fecham venda no
WhatsApp, fotos pra postar e vender, certificado de producao) sao de **Molde A, fazer e
vender** — servem pra quem revende. Numa oferta de **usar** (Molde B), a compradora nao
esta montando negocio nem convidando cliente: ela quer aproveitar mais o que ja comprou.
O bonus certo ali e **mais conteudo dentro do mesmo tema** — mais receitas, mais variacao,
mais sobremesa, mais acompanhamento — nunca ferramenta de logistica ou de venda.

Exemplo do erro: numa oferta de comida japonesa caseira, "lista de compras calibrada por
convidado" e "mensagens pra chamar o grupo e dividir a conta" sao logica de Pao de Queijo
(vender), nao de Bebe Comilao (usar). O que cabe ali e "+10 receitas de temaki", "+15
receitas de sobremesas japonesas", "+12 receitas de acompanhamento" — cada um contavel, na
mesma regua de numero + verbo de acao da secao de tangibilidade.

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

### As etapas do /modelar

**Cada coisa criada e conferida antes de virar insumo da seguinte** — concepcao torta vira
pagina torta, e descobrir no fim custa a pagina inteira. Copy **nao e mais uma etapa**: e
escrita dentro do molde, junto com a montagem do HTML.

`01-pesquisa.md` -> `02-concepcao.md` -> `03-auditoria-concepcao.md` -> `04-pagina.html`
-> `05-auditoria-pagina.md`, mais `DECISOES.md` e `STATUS.md`. Com o verificador zerado e a
auditoria escrita com a nota, **mande o `04-pagina.html` completo, so com a copy**: ela leva pro
Codex, que faz as imagens e finaliza (07/10/2026). Imagem nao e mais com voce.

**Terminar e entregar o arquivo.** Com o verificador zerado (fora `{{IMG}}` e `{{CHECKOUT}}`)
e a auditoria com nota, **mande o `04-pagina.html` pro usuario** — e o que ela leva pro Codex.
Dizer que ficou pronto, ou deixar o caminho no chat, nao conta como entrega. Marcador que
sobrou (tipicamente `{{CHECKOUT}}`) se avisa junto, na mesma mensagem.

**O MOLDE QUEM ESCOLHE E ELA, NO APP (regra dela, 15/10/2026). Nunca escolha molde sozinho.**
O caminho certo: terminou a modelagem → ela vai em **Modelagens prontas**, clica em **Criar
pagina** e **escolhe o molde** → o pedido chega aqui com o molde escolhido. So entao voce cria a
pagina. Se ela disser "quero fazer a pagina" sem ter escolhido o molde, **nao comece**: responda
em uma linha "vai em Modelagens prontas, clica em Criar pagina e escolhe o molde" (ou, se ela
disser o molde no chat, use esse). Em 13 e 15/10 eu escolhi o molde padrao sozinho e ela reclamou.

**Escolhido o molde, so crie (regra dela, 13/10/2026).** Depois que a concepcao esta confirmada, o
molde veio dela e ela diz "crie a pagina", **nao pergunte mais nada**: decida sozinho visual
padrao, paleta padrao e qualquer detalhe do briefing, anote a escolha no `DECISOES.md`
e entregue o `04-pagina.html` pronto. Ela ficou duas horas esperando e reclamou das perguntas.
So pare se faltar algo que **impede** a pagina de existir (e nesse caso diga o que impediu).
Numero ou frase que ela ja disse pra manter (ex.: "+17.800 alunas", "faturo mais de R$7.000"
da Chef Mari Dias) **fica**, sem reabrir a duvida. Avisos e conferencias vao **no fim**, numa
lista curta, nunca como pergunta antes de criar.

**A ordem do fim (combinada em 01/10/2026, atualizada em 07/10/2026):** pagina so com a copy →
auditoria com nota → HTML pra ela → Codex faz as imagens → ela traz a pagina pronta de volta →
**app** (area de membros) → **PDF de acesso** → **ficha da Hotmart**
(nome + descricao de mais de 200 caracteres) com a pergunta "posso atualizar a Central?" →
ela cria o produto e manda o **link do checkout** → voce troca o `{{CHECKOUT}}` no site e
atualiza a Central. A ficha nunca vai antes do PDF: a Hotmart pede o entregavel. Detalhes nas
Etapas 6 e 10-13 do `/modelar`.

**Imagem e depoimento sao dela e do Codex (07/10/2026).** Nao gere, nao confira, nao reprove,
nao opine sobre imagem nem sobre de onde veio um depoimento. Quando a pagina volta pronta,
confira so o que e seu: copy, numeros e checkout.

A **auditoria da concepcao** confere nome, recorte, mecanismo, tangibilidade, bonus, preco,
vitalicio/garantia e coerencia; reprovou, corrige antes de construir. A **auditoria da
pagina** confere tangivel, objetiva, clara, com contexto, espacamentos, velocidade e copy
persuasiva — e corrige na hora, **sem redesenhar**: texto, ordem e presenca de bloco sim;
CSS, cor, fonte e layout nao. Os moldes ja vendem.

### O botão Modelar entrega a oferta pro Claude Code

Modelar é conversa, não tarefa: o usuário muda de ideia no meio, quer ver um arquivo, quer usar
um conector. Já foram três jeitos, e os três tiravam isso dele — decidir tudo sozinho, parar em
toda fase, e a janelinha do painel, que não tem histórico nem conector. Terminal também não:
janela preta separada, longe de onde ele trabalha.

Hoje o painel só passa o bastão. **★ Modelar no Claude Code** faz três coisas:

1. enfileira o pedido em `data/pedidos-modelagem.json`;
2. copia `/modelar <página>` (a cópia é do navegador, no clique — servidor sem janela não
   consegue mexer na área de transferência do Windows);
3. abre um **chat novo** na aba Code, por `claude://code/new?cwd=<projeto>&t=<agora>`. Os dois
   parâmetros são obrigatórios na prática: sem `cwd` o chat nasce num rascunho, longe dos
   arquivos; sem o `t` diferente a cada vez o app descarta o link como repetido e o segundo
   clique não abre nada.

Lá, `/modelar` sem argumento pega o pedido mais novo da fila e marca como atendido. As oito
paradas continuam existindo — persona, que produto, mecanismo, que nome, produto principal,
os bônus, fecha assim, pode gerar as imagens — só que agora **perguntadas no chat**, não
escritas em `data/gate.json`.

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
