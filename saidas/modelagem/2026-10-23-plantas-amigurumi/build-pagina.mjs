// Monta 04-pagina.html a partir do molde "lanchinhos layout moderno" (molde escolhido por ela no app, 23/10/2026).
// node saidas/modelagem/2026-10-23-plantas-amigurumi/build-pagina.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const AQUI = dirname(fileURLToPath(import.meta.url));
const RAIZ = resolve(AQUI, "../../..");
const molde = readFileSync(join(RAIZ, "templates/lanchinhos layout moderno.html"), "utf8").split("\n");
// Paleta A (verde-sálvia, creme, terracota): troca só os tokens do :root do molde.
const PALETA = { "--creme": "#F6F1E4", "--creme-dark": "#EADFC6", "--creme-line": "#DCCDA9", "--laranja": "#C8683F", "--laranja-dark": "#9C4A28", "--laranja-mid": "#E5A582", "--laranja-soft": "#FBEADC", "--verde": "#5F8458", "--verde-dark": "#456A40" };
let css = molde[13]; // linha única com <style>…</style>
for (const [k, v] of Object.entries(PALETA)) css = css.replace(new RegExp(`${k}:#[0-9A-Fa-f]{6}`), `${k}:${v}`);
// cores fixas da camada "moderna" do molde -> paleta A
const HEX = { "#FF6B4A": "#C8683F", "#FF9F1C": "#D9A066", "#1A9940": "#5B8352", "#2B1220": "#33402E", "#F5C518": "#E3B65A", "#FFE9E2": "#F9E3D6", "#FFF0D6": "#F3ECD9", "#FFF6E3": "#F8F3E6", "#FFF9F0": "#FBF8EF", "#F6E7D3": "#EFE4CC" };
for (const [k, v] of Object.entries(HEX)) css = css.replace(new RegExp(k, "gi"), v);
const chuva = readFileSync(join(RAIZ, "templates/blocos/chuva-produto.html"), "utf8");
const NOME = "Jardim de Amigurumi";
const chuvaCss = (chuva.match(/<style>([\s\S]*?)<\/style>/) || [, ""])[1].trim();
const MARCA = "Fio Encantado";

// ---------- peças ----------
const CK = '<svg viewBox="0 0 12 10"><polyline points="1.5,5 4.5,8.5 10.5,1.5"/></svg>';
const li = (t) => `<li><span class="check-ico">${CK}</span><span>${t}</span></li>`;
const ul = (itens) => `<ul class="checklist">${itens.map(li).join("")}</ul>`;

const PRODUTO = [
  "<strong>+150 plantinhas e suculentas</strong> em amigurumi, em 5 grupos de 30: suculentas, cactos, flores, folhagens e vasinhos com mini jardins",
  "<strong>Em cada receita:</strong> os fios, as cores, o tamanho final, o tempo e a contagem rodada a rodada",
  "<strong>1 PDF por receita</strong>, para imprimir e deixar ao lado do crochê",
  "<strong>Aplicativo</strong> com busca, filtro por grupo e por tempo, favoritos e “marcar como feita”",
  "<strong>12 videoaulas curtas</strong> de técnica: anel mágico, aumentos, diminuições, montagem e acabamento",
  "<strong>Assistente de crochê com IA</strong> dentro do aplicativo, para tirar dúvidas a qualquer hora",
  "<strong>Comunidade das alunas</strong> e suporte",
  "<strong>Acabamento e embalagem:</strong> como montar e embalar cada peça para vender",
];
const BONUS = [
  ["Coleção Extra: +50 plantinhas", "Você soma às 150 do Jardim e fica com mais de 200 modelos para oferecer."],
  ["Tabela de preços das 150 plantinhas", "Você abre a tabela e já sabe quanto cobrar por peça."],
  ["Kit de papelaria digital: planilha de pedidos e de produção + 12 etiquetas e cartões", "Você imprime, organiza os pedidos e entrega com cara de loja."],
  ["30 mensagens prontas para vender", "Você copia, cola e manda no WhatsApp e no Instagram."],
  ["20 ideias de kit presente com plantinhas", "Você escolhe a ideia e vende por um valor maior."],
  ["Lista de materiais das 150 plantinhas", "Você compra fio, enchimento e vasinho de uma vez, sem sobra nem falta."],
];
const BONUS_LI = BONUS.map(([t]) => t);

const bonusCards = BONUS.map(([t, d], i) =>
  `  <div class="bonus-card"><div class="bonus-img-area"><img src="{{IMG:bonuses:${i + 1}}}" alt="Bônus ${i + 1}: ${t}" loading="lazy" decoding="async"></div><div class="bonus-body"><span class="bonus-num-tag">#${i + 1} · BÔNUS HOJE!</span><h3>${t}</h3><div class="bonus-divider"></div><p>${d}</p></div></div>`
).join("\n");

// Ícones do "é para você que": Flaticon (sticker), meus, embutidos em base64 (regra do /modelar).
import { readFileSync as _rf } from "node:fs";
const ICONE = (n) => "data:image/webp;base64," + _rf(join(AQUI, "icones", `ideal-${n}.webp`)).toString("base64");
const IDEAL = [
  ["Faz crochê por hobby e quer transformar em renda", "Você já faz peças bonitas, mas não sabe o que as pessoas compram. Aqui você começa por plantinhas que vendem."],
  ["Está começando agora e tem medo de errar a peça", "Cada receita traz os fios, as cores e a contagem de cada rodada. Você segue a receita e a peça sai igual à da foto."],
  ["Não tem tempo para inventar modelo", "As +150 receitas já estão prontas, em 5 grupos de 30. Você escolhe uma, abre a receita e começa."],
  ["Quer vender e não sabe quanto cobrar", "A tabela de preços das 150 plantinhas mostra quanto cobrar por peça. Você não precisa chutar."],
  ["Quer um presente que não murcha", "Plantinha de crochê não precisa de água nem de sol. É um presente fácil de vender e de entregar."],
];
const idealCards = IDEAL.map(([t, d], i) =>
  `  <div class="ideal-card-wrap"><div class="ideal-card"><div class="card-icon-img"><img src="${ICONE(i + 1)}" alt="Ícone: ${["crochê", "novelo", "relógio", "etiqueta de preço", "presente"][i]}" width="84" height="84" loading="lazy" decoding="async"></div><div><h3>${t}</h3><p>${d}</p></div></div></div>`
).join("\n");

import { createHash as _h } from "node:crypto";
const BASE = "https://zitfuuullg008-debug.github.io/harness-ofertas/imagens/jardim-de-amigurumi/";
const IMG = (n) => `${BASE}${n}?v=${_h("md5").update(_rf(join(RAIZ, "imagens/jardim-de-amigurumi", n))).digest("hex").slice(0, 8)}`;
const PLANTAS = ["Tulipa rosa", "Peônia coral", "Lavanda", "Miosótis azul", "Zínia laranja", "Margarida branca", "Amarílis vermelha", "Antúrio vermelho", "Capuchinha laranja", "Cravina rosa", "Flor-estrela vermelha", "Flores do campo", "Hibisco vermelho", "Hortênsia verde", "Mimosa amarela", "Papoula laranja"];
const DEMO = PLANTAS.map((n, i) => `      <div class="carousel-item"><img src="${IMG(`galeria-${String(i + 1).padStart(2, "0")}.webp`)}" alt="Plantinha de crochê em amigurumi: ${n.toLowerCase()}, em vasinho" loading="lazy" decoding="async" width="640" height="640"></div>`).join("\n");
const RECEITAS = Array.from({ length: 5 }, (_, i) => `      <div class="carousel-item"><img src="${IMG(`receita-${i + 1}.webp`)}" alt="Página de receita em PDF ilustrado, ${i + 1} de 5: fios, cores e contagem rodada a rodada" loading="lazy" decoding="async" width="720" height="1019"></div>`).join("\n");
const DEPO = Array.from({ length: 8 }, (_, i) => `      <div class="depo-carousel-item"><img src="{{IMG:depoimentos:${i + 1}}}" alt="Depoimento de aluna ${i + 1} de 8" loading="lazy" decoding="async"></div>`).join("\n");

const FAQ = [
  ["Preciso saber crochê para começar?", "Se você sabe fazer o ponto baixo, já consegue. As 12 videoaulas ensinam o anel mágico, os aumentos, as diminuições, a montagem e o acabamento, e cada receita traz a contagem de cada rodada."],
  ["Leva muito tempo para fazer uma plantinha?", "Depende da peça. Cada receita traz o tempo de feitura, e no aplicativo você filtra pelas mais rápidas para começar."],
  ["Que material eu preciso comprar?", "Cada receita lista os fios, as cores e o tamanho final. A lista de materiais das 150 plantinhas (bônus) mostra o que comprar de uma vez: fio, enchimento e vasinho."],
  ["Posso vender as peças que eu fizer?", "Pode. As peças são suas e você vende onde quiser. Os bônus trazem a tabela de preços, as 30 mensagens prontas, o kit de papelaria e as 20 ideias de kit presente."],
  ["Preciso saber costurar?", "Não. A montagem de cada peça está explicada na receita e nas videoaulas de montagem e acabamento."],
  ["Como funciona o assistente de crochê com IA?", "Ele fica dentro do aplicativo. Se você travar numa rodada, pergunta e recebe a resposta na hora, a qualquer hora do dia."],
  ["Como recebo o acesso?", "Assim que o pagamento é confirmado, o acesso chega no seu e-mail. Você abre pelo celular ou pelo computador e o acesso é vitalício, sem mensalidade."],
  ["Posso imprimir as receitas?", "Sim. Cada receita tem o seu PDF, feito para imprimir. A papelaria digital (bônus) também: você imprime as etiquetas e os cartões."],
  ["E se eu não gostar?", "Você tem 30 dias para testar. Se sentir que não é para você, é só pedir o reembolso e devolvemos o valor inteiro."],
];
const faqHtml = FAQ.map(([q, a]) => `  <div class="faq-item"><button class="faq-question">${q}<span class="faq-arrow">▼</span></button><div class="faq-answer">${a}</div></div>`).join("\n");

const SVG_GAR = (d) => `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
const SELO = (d, t) => `<div class="selo-item"><svg viewBox="0 0 24 24">${d}</svg>${t}</div>`;
const PASSO = (n, ico, h, p) => `    <div class="passo">\n      <span class="passo-ico"><svg viewBox="0 0 24 24">${ico}</svg></span>\n      <div class="passo-txt"><span class="passo-num">Passo ${n}</span><h3>${h}</h3><p>${p}</p></div>\n    </div>`;

// ---------- cabeça ----------
const cabeca = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="theme-color" content="#C8683F">
<meta http-equiv="x-dns-prefetch-control" content="on">
<title>${NOME} — +200 plantinhas e suculentas de crochê para vender</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,800&display=swap">
${css}
<style>.hero-img{border:none;box-shadow:none;background:none;border-radius:0;object-fit:contain}.passo-num{color:var(--laranja-mid)}.urgencia-bar,.urgencia-bar span{color:#fff}.hero{position:relative;isolation:isolate;overflow:hidden}${chuvaCss}@media (prefers-reduced-motion:reduce){.rv{opacity:1!important;transform:none!important}}</style>
</head>`;

const corpo = `<body>
<div class="progress-bar" id="progressBar"></div>
<div class="urgencia-bar">
  <span class="urgencia-dot"></span>
  <span id="urgencia-txt">🪴 Pagamento único · acesso imediato · 30 dias de garantia</span>
  <span class="urgencia-dot"></span>
</div>

<!-- ============ 1 · VENDA IMEDIATA ============ -->
<section class="hero">
${chuva.replace(/<!--[\s\S]*?-->\s*/, "").replace(/<style>[\s\S]*?<\/style>\s*/, "").replace(/🥖/g, "🌵").replace(/🍞/g, "🪴").trim()}
  <h1>Faça e venda <em>+200 plantinhas e suculentas de crochê</em>, com a receita pronta, rodada a rodada.</h1>
  <div class="hero-pills">
    <div class="hero-pill"><i class="emo">🧶</i><span>Receita rodada a rodada</span></div>
    <div class="hero-pill"><i class="emo">🎥</i><span>12 videoaulas de técnica</span></div>
    <div class="hero-pill"><i class="emo">🪴</i><span>Peças que não murcham</span></div>
    <div class="hero-pill"><i class="emo">💰</i><span>Tabela de preços incluída</span></div>
  </div>
  <img class="hero-img" src="{{IMG:hero:1}}" alt="Mockup do Jardim de Amigurumi: celular com o aplicativo, capas das receitas e plantinhas de crochê com a placa do nome" loading="eager" decoding="async" fetchpriority="high" width="600" height="600">
  <p class="hero-sub">O <strong>${NOME}</strong> traz <strong>+150 receitas de plantinhas e suculentas</strong> em amigurumi para você fazer e vender, cada uma com os fios, as cores e a contagem de cada rodada, e mais <strong>50 plantinhas de bônus</strong>, <strong>mesmo se você está começando agora</strong>.</p>
  <a href="#plano-completo" class="btn">QUERO AS PLANTINHAS AGORA</a>
  <ul class="trust"><li>🔒 Compra segura</li><li>⚡ Acesso imediato</li><li>🛡️ 30 dias de garantia</li></ul>
</section>

<!-- ============ 2 · DEMONSTRATIVO ============ -->
<section class="demo">
  <div class="demo-inner">
    <p class="demo-topo">Suculentas · Cactos · Flores · Folhagens · Mini jardins</p>
    <h2>Plantinhas de crochê que não murcham e vendem.</h2>
    <p class="demo-sub">Em cada receita você vê os fios, as cores, o tamanho final e <strong>a contagem de cada rodada</strong>, do anel mágico ao acabamento.</p>
  </div>
  <p class="demo-eyebrow">Veja algumas das +150 plantinhas do ${NOME}</p>
  <div class="carousel-wrapper">
    <div class="carousel-track" id="carouselTrack" style="animation-duration:46s">
${DEMO}
    </div>
  </div>
  <div class="demo-cta"><a href="#plano-completo" class="btn">QUERO AS PLANTINHAS AGORA</a></div>
</section>

<!-- ============ 4 · IDEAL PARA VOCÊ ============ -->
<section class="ideal">
  <h2 class="ideal-titulo">Ideal para você que:</h2>
${idealCards}
  <div class="ideal-cta"><a href="#plano-completo" class="btn">QUERO COMEÇAR HOJE</a></div>
</section>

<!-- ============ A ROTINA RESOLVIDA ============ -->
<section class="prat">
  <h2>Receita, videoaula e assistente. <em>Tudo no seu celular.</em></h2>
  <p class="prat-sub">Você abre o aplicativo, busca a plantinha, vê os fios e a contagem de cada rodada e começa. <strong>Se travar</strong>, assiste à videoaula ou pergunta ao assistente de crochê.</p>
  <div class="prat-img"><img src="{{IMG:app:1}}" alt="Tela do aplicativo com a busca de plantinhas, a receita rodada a rodada e as videoaulas" loading="lazy" decoding="async" width="900" height="900"></div>
  <a href="#plano-completo" class="btn">QUERO AS PLANTINHAS</a>
</section>

<!-- ============ 4b · A RECEITA POR DENTRO ============ -->
<section class="demo demo-receitas">
  <div class="demo-inner">
    <h2>Cada plantinha vem explicada assim.</h2>
    <p class="demo-sub">Cada plantinha tem a <strong>receita completa em PDF ilustrado</strong>, com os fios, as cores e a contagem rodada a rodada. Dê uma olhada numa <strong>prévia</strong> do que você vai receber:</p>
  </div>
  <div class="carousel-wrapper">
    <div class="carousel-track" id="carouselTrack2" style="animation-duration:26s">
${RECEITAS}
    </div>
  </div>
  <div class="demo-cta"><a href="#plano-completo" class="btn">QUERO AS PLANTINHAS AGORA</a></div>
</section>

<!-- ============ 5 · TUDO O QUE VOCÊ VAI RECEBER ============ -->
<section class="produto">
  <p class="produto-eyebrow">VOCÊ VAI RECEBER ACESSO IMEDIATO A:</p>
  <div class="produto-inner">
    <img src="{{IMG:produto:1}}" alt="${NOME}: +150 plantinhas e suculentas e os 6 bônus" loading="lazy" decoding="async" class="produto-img" width="784" height="784">
    <p class="produto-nome">${NOME}</p>
    <div class="produto-divider"></div>
    ${ul(PRODUTO)}
  </div>
</section>

<!-- ============ 6 · BÔNUS ============ -->
<div class="bonus-bridge">
  <p class="bridge-eyebrow">E NÃO PARA POR AÍ</p>
  <p class="bridge-sub">você também vai receber…</p>
  <h3 class="bridge-titulo">6 BÔNUS<br>EXCLUSIVOS</h3>
</div>
<section class="bonuses">
${bonusCards}
</section>

<!-- ============ 7 · PROVA SOCIAL ============ -->
<section class="depoimentos">
  <div class="depo-topo">
    <h2>Veja a opinião das alunas que usam o ${NOME}</h2>
  </div>
  <div class="depo-carousel-wrapper">
    <div class="depo-carousel-track" id="depoCarouselTrack">
${DEPO}
    </div>
  </div>
  <div class="depo-cta"><a href="#plano-completo" class="btn">QUERO COMEÇAR HOJE</a></div>
</section>

<!-- ============ 8 · OFERTA ============ -->
<div class="planos-bridge">
  <p><strong>COMECE HOJE</strong> a montar o seu jardim de amigurumi:</p>
  <span class="arrow-bounce">↓</span>
</div>
<section class="planos" id="oferta">
  <div class="plano-recomendado-wrap" id="plano-completo">
    <span class="plano-rec-badge">🌵 Acesso completo</span>
    <div class="plano-rec-card">
      <div class="plano-rec-titulo">JARDIM DE<br>AMIGURUMI</div>
      <div class="plano-body">
        <img src="{{IMG:produto:1}}" alt="${NOME}: as +150 plantinhas e os 6 bônus" loading="lazy" decoding="async" class="mockup-completo">
        <p class="plano-sub">Tudo que você recebe, com <strong>+200 plantinhas ao todo</strong> (150 + 50 do bônus):</p>
        ${ul([...PRODUTO, ...BONUS_LI.map((b) => "<strong>Bônus:</strong> " + b)])}
        <div class="preco-stack">
          <div class="preco-de">De R$ 97,00</div>
          <div class="preco-hoje-label">Por apenas</div>
          <div class="preco-valor"><span class="preco-moeda">R$</span><span class="preco-num">27</span><span class="preco-cent">,90</span></div>
          <p class="preco-ancora">Você economiza R$ 69,10 e ainda leva 6 bônus de presente.</p>
        </div>
        <a href="{{CHECKOUT}}" class="btn btn-laranja btn-shimmer btn-pulse" target="_blank" rel="noopener">QUERO O JARDIM DE AMIGURUMI</a>
        <div class="selos">
          ${SELO('<rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>', "Compra 100% segura")}
          ${SELO('<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>', "Acesso imediato no seu e-mail")}
          ${SELO('<path d="M12 21s7-3.5 7-9V5l-7-2.5L5 5v7c0 5.5 7 9 7 9z"/>', "Garantia de 30 dias")}
        </div>
      </div>
    </div>
  </div>
</section>

<!-- ============ 9 · GARANTIA ============ -->
<section class="garantia">
  <div class="garantia-selo">
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s7-3.5 7-9V5l-7-2.5L5 5v7c0 5.5 7 9 7 9z"/></svg>
    <span>Garantia de 30 dias</span>
  </div>
  <h2>Teste o ${NOME}<br>sem risco</h2>
  <p>Você tem 30 dias para provar sem preocupação. Se por qualquer motivo sentir que o ${NOME} não é para você, basta pedir seu dinheiro de volta dentro do prazo de garantia. Simples assim.</p>
  <div class="gar-lista">
    <div class="gar-item"><div class="gar-ico">${SVG_GAR('<path d="M20 6L9 17l-5-5"/>')}</div><div><strong>100% do valor devolvido</strong><span>O valor volta integral</span></div></div>
    <div class="gar-item"><div class="gar-ico">${SVG_GAR('<circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16h.01"/>')}</div><div><strong>Sem perguntas complicadas</strong><span>Não precisa dizer por que desistiu</span></div></div>
    <div class="gar-item"><div class="gar-ico">${SVG_GAR('<rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>')}</div><div><strong>Sem burocracia</strong><span>Uma mensagem e o pedido é feito</span></div></div>
  </div>
</section>

<!-- ============ 10 · AUTORIDADE ============ -->
<section class="autoridade">
  <div class="autoridade-inner">
    <img src="{{IMG:autoridade:1}}" alt="Criadora do ${NOME}, segurando um novelo de fio vermelho" loading="lazy" decoding="async">
    <div class="autoridade-text">
      <p class="autoridade-eyebrow">Quem criou o ${NOME}:</p>
      <p class="autoridade-nome">${MARCA}</p>
      <p class="autoridade-bio">O ${MARCA} criou o ${NOME} depois de perceber que muitas mulheres faziam crochê por prazer, mas travavam sempre nos mesmos pontos: não saber o que vender, não saber quanto cobrar e não ter uma receita pronta para seguir.</p>
      <p class="autoridade-bio">Por isso reuniu +150 plantinhas e suculentas com a contagem de cada rodada, videoaulas curtas e a tabela de preços, tudo num aplicativo só.</p>
      <p class="autoridade-bio">A ideia não é te transformar em profissional. É te dar receitas que funcionam e um jeito simples de vender o que você faz.</p>
    </div>
  </div>
</section>

<!-- ============ COMO FUNCIONA O ACESSO ============ -->
<section class="acesso">
  <h2>Como funciona o acesso</h2>
  <p class="acesso-sub">Da hora que você paga até a primeira plantinha.</p>

  <div class="passos">
${PASSO(1, '<path d="M3 4h2l2.4 10.5a2 2 0 0 0 2 1.5h7.2a2 2 0 0 0 2-1.5L21 7H6"/><circle cx="10" cy="20" r="1.2"/><circle cx="17" cy="20" r="1.2"/>', "Você paga", "No <b>Pix ou no cartão</b>. No Pix a confirmação sai na hora.")}

${PASSO(2, '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>', "O acesso chega no seu e-mail", "Na hora em que o pagamento é confirmado. <b>Sem espera.</b>")}

${PASSO(3, '<path d="M12 3v11"/><path d="M8 11l4 4 4-4"/><path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"/>', "Você entra e começa", "Abre pelo celular ou pelo computador. <b>É seu para sempre</b>, sem mensalidade.")}

${PASSO(4, '<circle cx="12" cy="12" r="9"/><path d="M9 12l2 2 4-4"/>', "Faz a primeira plantinha", "Escolha uma suculenta, siga a <b>contagem rodada a rodada</b> e tenha a primeira peça pronta para vender.")}
  </div>
</section>

<!-- ============ 11 · FAQ ============ -->
<section class="faq">
  <h2>Perguntas Frequentes</h2>
${faqHtml}
  <div class="demo-cta">
    <a href="#plano-completo" class="btn btn-laranja btn-shimmer btn-pulse">QUERO O ${NOME.toUpperCase()}</a>
  </div>
</section>

<footer>
  <strong>Copyright 2026 | ${NOME} · ${MARCA}</strong><br><br>
  Todos os direitos sobre a obra “${NOME}” são reservados, nos termos da Lei nº 9.610/98 (Lei de Direitos Autorais). A reprodução não autorizada desta publicação, no todo ou em parte, por quaisquer meios, constitui violação dos direitos autorais (Art. 184 do Código Penal e Lei 9.610/98), sujeitando os infratores às sanções civis e criminais previstas na legislação aplicável.
</footer>
`;

// ---------- scripts do molde (sem a calculadora, que não existe nesta página) ----------
let fim = molde.slice(molde.findIndex((l) => l.trim() === "</footer>") + 1);
let scripts = fim.join("\n");
scripts = scripts.replace(/\(function\(\)\{\n  const v=document\.getElementById\('calcVendas'\)[\s\S]*?\n\}\)\(\);\n/, "");
scripts = scripts.replace(/<div class="stick" id="stick">.*\n/, `<div class="stick" id="stick"><div><b>R$ 27,90</b>Acesso completo · vitalício</div><a href="{{CHECKOUT}}" class="btn btn-laranja" target="_blank" rel="noopener">QUERO O COMPLETO</a></div>\n`);

const html = cabeca + "\n" + corpo + "\n" + scripts;
writeFileSync(join(AQUI, "04-pagina.html"), html);
console.log("04-pagina.html:", (html.length / 1024).toFixed(1), "KB");
