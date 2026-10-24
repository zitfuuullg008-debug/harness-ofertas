# Decisões — Jardim de Amigurumi (23/10/2026)

Todas escolhidas por ela no chat, na modelagem padrão, com o pedido "copy bem parecida com a dela, sem inventar a roda".

- **Oferta lastro:** Ateliê Próspero, "Plantas Prósperas Amigurumi" (plantas.atelieprospero.com). Pedido pela Central (concepcoes/cmvl64jeq).
- **Persona:** opção 1, mulher de 35 a 55 anos que faz crochê (ou quer começar) e quer renda extra em casa. Descartadas: mãe/dona de casa, aposentada, iniciante total, artesã que já vende.
- **Produto:** opção 1, coleção de plantinhas e suculentas em amigurumi para vender. Descartadas: só suculentas e cactos, plantas para presente, amigurumi em geral.
- **Mecanismo:** opção 1, a receita pronta, rodada a rodada (igual à original). Descartados: do mais fácil ao mais difícil, por tempo de feitura, por conjunto, sem mecanismo.
- **Nome:** "Jardim de Amigurumi" (opção 3; foi o que ela escolheu apesar de não dizer "para vender"). Descartados: "Plantinhas Lucrativas em Amigurumi", "Plantinhas de Crochê Lucrativas".
- **Produto principal:** opção "completa" (+150 plantinhas em 5 grupos de 30, 50% acima das 100 da original).
- **Entrega:** igual à da original (videoaulas, assistente de IA, comunidade e suporte), "nóis dá um jeito". Entrou 12 videoaulas como número; o nome da IA fica para definir.
- **Bônus:** 6 (3 da original em formato tangível + 3 novos da mesma natureza). Todos como na proposta.
- **Preço:** opção A, plano único R$ 27,90 (de R$ 97), igual à original.
- **Número na página:** "+200 plantinhas" na manchete (ela disse "fecha", sem escolher entre +200 e +150; usei a recomendação).
- **Pendente:** molde (ela escolhe no app, Modelagens prontas → Criar página) e paleta (7.5).

## Página (23/10/2026) — pedido da Central, sem perguntas
- **Molde:** Lanchinhos · layout moderno (escolhido por ela no app). Montado por `build-pagina.mjs` a partir de `templates/lanchinhos layout moderno.html` (CSS, scripts e blocos do molde; calculadora removida porque o molde não a traz nesta página).
- **Paleta:** a do molde, sem troca (regra dela: com o molde escolhido, só criar). Trocar depois é mexer só nos tokens.
- **Plano único:** só o bloco "recomendado" (R$ 27,90, de R$ 97); o plano básico e o aviso "atenção" saíram. O mockup de bônus vale para o produto e para o plano (`{{IMG:produto:1}}`).
- **Blocos que saíram:** `razoes` e `calc` (sem conta de lucro sustentável na concepção). Entrou o bloco `prat` com a imagem do app.
- **Chuva do topo:** emojis 🌵 e 🪴.
- **Autoridade:** assina "Fio Encantado" (nome da página que ela criou hoje para os moldes de crochê), sem credencial e sem número de alunas; foto = a da mulher fazendo crochê (`autoridade-1.webp`). Resolve a pendência "quem assina".
- **Depoimentos:** 8 espaços para ela e o Codex. Nada inventado.
- **Pendentes:** `{{CHECKOUT}}` (2×), 33 `{{IMG:…}}` (Codex), a entrega das videoaulas, do assistente de IA e da comunidade.

## Correções de 23/10 (tarde) — depois da reprovação dela
- **Paleta A** (verde-sálvia, creme, terracota): proposta a ela com 3 opções; aplicada nos tokens do molde e nas cores fixas (ver `PALETA`/`HEX` no `build-pagina.mjs`). Antes eu tinha usado a do molde sozinha: errado.
- **Topo:** mockup padrão da skill (celular + capas + placa com o nome, PNG transparente 600x600), pedido ao Codex pela skill `info-imagens`. A foto das tulipas do concorrente saiu.
- **Receitas de exemplo:** voltaram as 9 do Codex (com o nome Jardim de Amigurumi). As 5 folhas do concorrente ficam em `info/jardim-de-amigurumi/originais-concorrente/`.
- **Ícones "é para você que":** Flaticon sticker, meus (`icones/ideal-N.webp`, base64 na página). Os do Codex ficaram em `codex-trocadas/`.
- Para recolocar as imagens depois de reconstruir a página: `bash scratch/recolocar.sh`.
- **Bloco de dor removido** (pedido dela, 23/10): saiu do build; cópia antiga em build-pagina.com-dor.bak.

## App (23/10/2026)
- Feito pelo template `app/app-template.html` + `app/gerar-dados.mjs` (receitas por código, contagem calculada) + `app/montar-app.mjs`. Layout igual ao app do concorrente (barra marrom, fundo creme, aulas com Anterior/Próxima/Concluir), com a paleta A.
- 200 receitas (150 + 50 do bônus), todas com fios/gramas, mapa, rodadas com total, montagem e dicas. Contagem calculada, peças NÃO testadas fisicamente.
- Videoaulas: 8 vídeos públicos do YouTube (canal Onda Criativa), os mesmos do app do concorrente, por ordem dela. Página passou de "12 videoaulas curtas" para "8 videoaulas completas".
- Assistente: perguntas e respostas prontas (30), NÃO é IA. A página ainda diz "assistente de crochê com IA".
- Comunidade e suporte: `COMUNIDADE_URL` e `SUPORTE_URL` vazios no topo do script até ela mandar os links.
- Desenhos das plantinhas: SVG por código (não são fotos).
- **Pixel Atomify** (t.js?p=cmvlinupr0011jt08rvg7lsfd) colado no head da página a pedido dela. Conferir duplicidade com o rastreamento que o lancar.mjs injeta ao publicar.
- **Checkout** colado nos 2 botões: https://checkout.atomify.com.br/pay/JW2NNB4956 (produto já criado por ela no Atomify). Ao publicar, não deixar o lancar.mjs criar produto duplicado.

## PUBLICADO em 23/10/2026 (lancar.mjs --slug jardim)
- Checkout NOVO criado pelo lancar: https://pagamento.revitamulher.online/pay/92KQM3RHJQ (produto cmvln9uw20000kw07glbji4my). O link que ela tinha mandado (pay/JW2NNB4956) NÃO é o usado: aquele produto não tem PDF/app/banner.
- Página: https://pagamento.revitamulher.online/s/jardim (e jardim.revitamulher.online depois do CNAME: nome "jardim" → 6d24bd65ded35237.vercel-dns-017.com). App em /s/jardim/app.
- O lancar substituiu o pixel colado por um único t.js com o id do produto novo (sem duplicar).
- Falta: CNAME na GoDaddy; pixel da conta de anúncio (--pixel --conta ID); links COMUNIDADE_URL e SUPORTE_URL no app (depois rodar o lancar de novo); decidir "com IA".

## Endereço trocado de "jardim" para "croche" (23/10/2026, pedido dela)
- Republicado com `lancar.mjs --slug croche`: produto NOVO cmvlnmez80009kw0747zwrh0w, checkout https://pagamento.revitamulher.online/pay/YFZEMAGDT6, página https://croche.revitamulher.online, app /app. O PDF de acesso passou a apontar para croche.revitamulher.online/app.
- GoDaddy: criado CNAME croche → 6d24bd65ded35237.vercel-dns-017.com; removido o CNAME jardim (que eu tinha criado).
- SOBRAM no painel do Atomify dois produtos que não valem mais: o do slug "jardim" (cmvln9uw20000kw07glbji4my, checkout 92KQM3RHJQ) e o que ela criou à mão (pay/JW2NNB4956). O lancar não apaga produto.

## CORREÇÃO GRAVE (24/10/2026): botões quebrados no ar
- O rastreador do nosso checkout (croche.revitamulher.online/t.js) trocava, ao abrir a página, os botões para pagamento.revitamulher.online/pay/JW2NNB4956 ("Produto indisponível"). Eu só tinha conferido o HTML, não o que o navegador faz depois.
- Correção no projeto do checkout (src/lib/launch.ts, preparePageHtml): se a página traz um t.js de checkout de FORA (ex.: checkout.atomify.com.br), ele fica e o nosso não entra. Deploy em produção 24/10 00:47Z.
- Página publicada só com o script dela no head: <script src="https://checkout.atomify.com.br/t.js?p=cmvlinupr0011jt08rvg7lsfd" async></script>; botões em https://checkout.atomify.com.br/pay/JW2NNB4956 (conferido no navegador depois de carregar).
