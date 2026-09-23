/* Painel de Ofertas — toda a interface.
   Sem framework: um estado, uma função por tela, e um render() que troca a tela. */

const $ = (s) => document.querySelector(s);
const esc = (t) => String(t ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const num = (n) => (n == null ? "—" : Number(n).toLocaleString("pt-BR"));

const TELAS = [
  { id: "inicio", ic: "🏠", nome: "Início" },
  { id: "ativas", ic: "📈", nome: "Ofertas ativas", conta: () => estado.info?.ofertasAtivas },
  { id: "ofertas", ic: "🎯", nome: "Ofertas mineradas", conta: () => estado.info?.ofertas },
  { id: "paginas", ic: "📄", nome: "Páginas", conta: () => estado.info?.modelagens },
  { id: "criativos", ic: "🎬", nome: "Criativos", conta: () => estado.info?.criativos },
  { id: "ideias", ic: "💡", nome: "Ideias", conta: () => estado.info?.ideias },
  { id: "automacoes", ic: "⏰", nome: "Automações" },
  { id: "ajustes", ic: "⚙️", nome: "Ajustes" },
];

const estado = {
  tela: "inicio",
  info: null,
  relatorio: null,
  filtroNicho: "todos",
  periodo: "7d",
  soEstrelas: false,
  soFavoritas: false,
  cfg: null,
  listas: {},
  lendo: null,
  rodando: null,
};

/* ------------------------------------------------------------------ rede */

async function api(rota, opcoes) {
  const r = await fetch(rota, {
    ...opcoes,
    headers: opcoes?.corpo ? { "content-type": "application/json" } : undefined,
    body: opcoes?.corpo ? JSON.stringify(opcoes.corpo) : undefined,
    method: opcoes?.corpo ? "POST" : (opcoes?.method ?? "GET"),
  });
  const txt = await r.text();
  let dado;
  try { dado = JSON.parse(txt); } catch { dado = txt; }
  if (!r.ok) throw new Error(dado?.erro ?? `erro ${r.status}`);
  return dado;
}

function avisa(msg) {
  const t = $("#torrada");
  t.textContent = msg;
  t.classList.add("ver");
  clearTimeout(avisa.tm);
  avisa.tm = setTimeout(() => t.classList.remove("ver"), 3200);
}

/* ------------------------------------------------------------------ ações */

async function rodar(acao, argumento, rotulo) {
  try {
    const t = await api("/api/trabalho", { corpo: { acao, argumento } });
    estado.rodando = t;
    abreConsole(t);
    avisa(`Começou: ${rotulo ?? t.rotulo}`);
  } catch (e) {
    avisa(e.message);
  }
}

async function abrir(o) {
  try { await api("/api/abrir", { corpo: o }); } catch (e) { avisa(e.message); }
}

async function recarrega() {
  estado.info = await api("/api/estado");
  estado.rodando = estado.info.rodando;
  desenhaNav();
  pintaStatus();
}

/* ------------------------------------------------------------------ etapas */

/* As etapas de cada trabalho, com o que denuncia que ela começou. A pista mais
   confiável é o arquivo sendo escrito; o texto do agente serve de reforço. */
const ETAPAS = {
  modelar: [
    { nome: "Pesquisa", re: /01-pesquisa|raio-x-mvt|escrevendo a pesquisa|pesquisa de mercado/i },
    { nome: "Concepção", re: /02-concepcao|modelador-mvt|concep[çc][ãa]o/i },
    { nome: "Conferindo", re: /03-auditoria-concepcao|confer[iê]ncia da concep/i },
    { nome: "Página", re: /04-pagina|pagina-vendas-mvt|montando a p[áa]gina|executor-copy/i },
    { nome: "Auditoria", re: /05-auditoria|auditoria-copy-mvt|auditoria da p[áa]gina/i },
  ],
  minerar: [
    { nome: "Importando", re: /importar-adhunter|importa(ndo|das)/i },
    { nome: "Escolhendo", re: /agente minerador|filtro|escolh/i },
    { nome: "Enriquecendo", re: /enriquecer/i },
    { nome: "Publicando", re: /render-relatorio|commit|push/i },
    { nome: "Ad Hunter", re: /salvar-no-adhunter/i },
  ],
  termometro: [
    { nome: "Lendo ofertas", re: /get_dashboards|dashboards/i },
    { nome: "Puxando 7 dias", re: /7 dias|7d/i },
    { nome: "Puxando 30 dias", re: /30 dias|30d/i },
    { nome: "Gravando", re: /ultimo\.json|escrevendo/i },
  ],
  semana: [
    { nome: "Minerando", re: /minerador|minera/i },
    { nome: "Ideias", re: /ideador|ideias/i },
    { nome: "Criativos", re: /criativos-meta|criativos/i },
  ],
};

let etapaAtual = -1;

function montaEtapas(chave) {
  const lista = ETAPAS[chave];
  const alvo = $("#etapas");
  etapaAtual = -1;
  if (!lista) { alvo.innerHTML = ""; alvo.classList.add("esconde"); return; }
  alvo.classList.remove("esconde");
  alvo.innerHTML = lista
    .map((e, i) => `<div class="et" data-i="${i}"><i>${i + 1}</i><span>${e.nome}</span></div>`)
    .join("");
}

/** Só avança, nunca volta: uma menção solta a "pesquisa" na fase da página não retrocede. */
function marcaEtapa(chave, texto) {
  const lista = ETAPAS[chave];
  if (!lista) return;
  for (let i = lista.length - 1; i > etapaAtual; i--) {
    if (lista[i].re.test(texto)) {
      etapaAtual = i;
      $("#etapas").querySelectorAll(".et").forEach((el, k) => {
        el.classList.toggle("feita", k < i);
        el.classList.toggle("agora", k === i);
      });
      $("#console-etapa").textContent = lista[i].nome;
      return;
    }
  }
}

/* ------------------------------------------------------------------ console */

function abreConsole(trabalho) {
  const c = $("#console");
  c.classList.remove("escondido", "minimo");
  $("#console-titulo").textContent = trabalho?.rotulo ?? "Trabalhando…";
  $("#console-etapa").textContent = "começando…";
  montaEtapas(trabalho?.chave);
  $("#console-corpo").innerHTML = "";
  $("#btn-parar").classList.remove("esconde");
  tiqueBarra();
}

function linhaConsole({ hora, nivel, texto }) {
  marcaEtapa(estado.rodando?.chave ?? estado.ultimaChave, texto);
  const corpo = $("#console-corpo");
  const perto = corpo.scrollTop + corpo.clientHeight > corpo.scrollHeight - 60;
  const d = document.createElement("div");
  d.className = `evt ${nivel}`;
  d.innerHTML = `<span class="h">${esc(hora)}</span><span class="t">${esc(texto)}</span>`;
  corpo.appendChild(d);
  while (corpo.children.length > 400) corpo.removeChild(corpo.firstChild);
  if (perto) corpo.scrollTop = corpo.scrollHeight;
}

function tiqueBarra() {
  clearInterval(tiqueBarra.tm);
  tiqueBarra.tm = setInterval(() => {
    const t = estado.rodando;
    if (!t || t.status !== "rodando") { clearInterval(tiqueBarra.tm); return; }
    const seg = (Date.now() - t.inicio) / 1000;
    const pct = Math.min(96, (seg / (t.minutos * 60)) * 100);
    $("#barra").style.width = `${pct}%`;
    $("#status-texto").textContent = `${t.rotulo} · ${Math.floor(seg / 60)}min`;
  }, 1000);
}

/* ------------------------------------------------------------------ gate */

/* A pergunta que a fase deixou antes de encerrar o turno. Aparece na mesma
   tela da régua: o trabalho não terminou, só está esperando a sua decisão. */
function mostraGate(trabalho) {
  const g = trabalho?.pergunta;
  const caixa = $("#gate");
  if (!g) { caixa.classList.add("esconde"); caixa.innerHTML = ""; return; }

  estado.gate = trabalho;
  caixa.classList.remove("esconde");
  caixa.innerHTML = `
    <div class="gate-pergunta">${esc(g.pergunta)}</div>
    ${g.contexto ? `<div class="gate-contexto">${esc(g.contexto)}</div>` : ""}
    <div class="gate-opcoes">
      ${(g.opcoes ?? []).map((o) => `<button class="btn pequeno" data-resposta="${esc(o)}">${esc(o)}</button>`).join("")}
    </div>
    <div class="gate-livre">
      <input id="gate-texto" placeholder="ou escreva o que você quer mudar…" autocomplete="off">
      <button class="btn pequeno principal" id="gate-enviar">Responder</button>
    </div>`;

  caixa.querySelectorAll("[data-resposta]").forEach((b) => {
    b.onclick = () => responde(b.dataset.resposta);
  });
  const campo = $("#gate-texto");
  $("#gate-enviar").onclick = () => responde(campo.value);
  campo.onkeydown = (e) => { if (e.key === "Enter") responde(campo.value); };
  campo.focus();
}

async function responde(texto) {
  const t = String(texto ?? "").trim();
  if (!t) return avisa("Escreva a resposta ou escolha uma opção.");
  $("#gate").classList.add("esconde");
  try {
    const novo = await api("/api/responder", { corpo: { resposta: t } });
    estado.rodando = novo;
    estado.gate = null;
    linhaConsole({ hora: new Date().toLocaleTimeString("pt-BR"), nivel: "fala", texto: `Você: ${t}` });
    pintaStatus();
    tiqueBarra();
  } catch (e) {
    avisa(e.message);
    mostraGate(estado.gate);   // devolve a pergunta: nada se perdeu
  }
}

function pintaStatus() {
  const t = estado.rodando;
  const p = $("#status");
  if (t && t.status === "rodando") {
    p.classList.add("vivo");
    $("#status-texto").textContent = t.rotulo;
  } else {
    p.classList.remove("vivo");
    $("#status-texto").textContent = "tudo parado";
  }
}

function ligaEventos() {
  const es = new EventSource("/api/eventos");
  es.addEventListener("ola", (e) => {
    const d = JSON.parse(e.data);
    if (d.rodando) { estado.rodando = d.rodando; estado.ultimaChave = d.rodando.chave; abreConsole(d.rodando); carregaSaida(d.rodando.id); }
    pintaStatus();
  });
  es.addEventListener("inicio", (e) => {
    estado.rodando = JSON.parse(e.data);
    estado.ultimaChave = estado.rodando.chave;
    abreConsole(estado.rodando);
    pintaStatus();
  });
  es.addEventListener("linha", (e) => linhaConsole(JSON.parse(e.data)));
  // Gate: a fase parou pra perguntar. Nada terminou — a barra fica onde está
  // e a pergunta aparece logo abaixo da régua de etapas.
  es.addEventListener("pergunta", (e) => {
    const t = JSON.parse(e.data);
    estado.rodando = null;
    estado.ultimaChave = t.chave;
    $("#btn-parar").classList.add("esconde");
    $("#console-titulo").textContent = `${t.rotulo} — esperando você`;
    $("#console-etapa").textContent = "sua vez";
    $("#console").classList.remove("minimo");
    mostraGate(t);
    pintaStatus();
    avisa("A modelagem parou pra te perguntar uma coisa.");
  });
  es.addEventListener("fim", async (e) => {
    mostraGate(null);
    const t = JSON.parse(e.data);
    estado.rodando = null;
    $("#barra").style.width = "100%";
    $("#btn-parar").classList.add("esconde");
    $("#console-titulo").textContent = `${t.rotulo} — ${t.status === "ok" ? "pronto" : t.status}`;
    $("#console-etapa").textContent = t.status === "ok" ? "terminado" : t.status;
    if (t.status === "ok") $("#etapas").querySelectorAll(".et").forEach((el) => { el.classList.add("feita"); el.classList.remove("agora"); });
    pintaStatus();
    avisa(t.status === "ok" ? "Terminou ✓" : `Terminou: ${t.status}`);
    await recarrega();
    if (["ofertas", "inicio", "paginas", "criativos", "ideias"].includes(estado.tela)) render();
  });
  es.onerror = () => { $("#status-texto").textContent = "servidor caiu?"; };
}

async function carregaSaida(id) {
  const d = await api(`/api/saida?id=${id}`);
  estado.ultimaChave = d.trabalho?.chave ?? estado.ultimaChave;
  montaEtapas(estado.ultimaChave);
  $("#console-corpo").innerHTML = "";
  for (const l of d.linhas) linhaConsole(l);
}

/* ------------------------------------------------------------------ navegação */

function desenhaNav() {
  $("#nav").innerHTML = TELAS.map((t) => {
    const c = t.conta?.();
    return `<button class="nav-item ${estado.tela === t.id ? "ativo" : ""}" data-tela="${t.id}">
      <span class="ic">${t.ic}</span> ${t.nome}
      ${c ? `<span class="conta">${c}</span>` : ""}
    </button>`;
  }).join("");
  $("#nav").querySelectorAll("[data-tela]").forEach((b) => {
    b.onclick = () => { estado.tela = b.dataset.tela; desenhaNav(); render(); };
  });
}

function cabecalho(titulo, texto, acoes = "") {
  return `<div class="topo">
    <div><h2>${titulo}</h2><p>${texto}</p></div>
    <div class="acoes">${acoes}</div>
  </div>`;
}

function vazio(ic, titulo, texto, botao = "") {
  return `<div class="vazio-geral"><span class="ic">${ic}</span><b>${titulo}</b>${texto}<div style="margin-top:14px">${botao}</div></div>`;
}

/* ------------------------------------------------------------------ telas */

async function telaInicio() {
  const i = estado.info;
  const ocupado = !!estado.rodando;
  const tarefas = i.tarefas ?? [];
  const quando = (t) => (t.proxima ? new Date(t.proxima).toLocaleString("pt-BR", { weekday: "short", day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }) : "—");

  const hist = (i.historico ?? []).slice(0, 5).map((h) => `<div class="linha">
      <span class="tag ${h.status === "ok" ? "verde" : h.status === "erro" ? "vermelho" : ""}">${h.status === "ok" ? "✓" : h.status === "erro" ? "✕" : "■"}</span>
      <div><b>${esc(h.rotulo)}</b><div class="meta">${new Date(h.inicio).toLocaleString("pt-BR")} · ${h.segundos}s</div></div>
    </div>`).join("") || `<p style="color:var(--texto-2);font-size:13px">Nada rodou ainda por aqui.</p>`;

  return `
  ${cabecalho("Bom te ver 👋", `Hoje é ${new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}. Aqui você dispara tudo sem digitar nada.`)}

  <div class="grade c4" style="margin-bottom:22px">
    ${[
      ["Ofertas no relatório", i.ofertas ?? 0, i.ultimoRelatorio ? `de ${i.ultimoRelatorio}` : "nenhum ainda", "azul"],
      ["Páginas criadas", i.modelagens, "pipeline MVT", "roxo"],
      ["Criativos", i.criativos, `${i.produtos} produto(s)`, "verde"],
      ["Favoritas", i.favoritos, "marcadas por você", "ambar"],
    ].map(([r, n, s]) => `<div class="cartao"><div class="numero">${num(n)}</div><div class="rotulo">${r}</div><div class="meta" style="color:var(--texto-3);font-size:11.5px;margin-top:2px">${s}</div></div>`).join("")}
  </div>

  <h3 style="font-size:13px;text-transform:uppercase;letter-spacing:.07em;color:var(--texto-3);margin:0 0 11px">O que você quer fazer</h3>
  <div class="grade c2" style="margin-bottom:26px">
    <button class="atalho" data-rodar="minerar" ${ocupado ? "disabled" : ""}>
      <span class="ic">🎯</span>
      <span><b>Minerar ofertas agora</b><span>Lê o cache do Ad Hunter, escolhe as melhores e monta o relatório. ~15 min. Não gasta proxy.</span></span>
    </button>
    <button class="atalho verde" data-rodar="criativos" ${ocupado ? "disabled" : ""}>
      <span class="ic">🎬</span>
      <span><b>Gerar criativos</b><span>Ângulos e variações de copy pra cada produto em <code>produtos/</code>.${i.produtos ? "" : " <b style='color:var(--ambar)'>Falta cadastrar produto.</b>"}</span></span>
    </button>
    <button class="atalho roxo" data-rodar="ideias" ${ocupado ? "disabled" : ""}>
      <span class="ic">💡</span>
      <span><b>Gerar ideias de oferta</b><span>Usa a mineração mais recente pra sugerir o que você poderia lançar.</span></span>
    </button>
    <button class="atalho ambar" data-rodar="adhunter" ${ocupado ? "disabled" : ""}>
      <span class="ic">📡</span>
      <span><b>Atualizar o Ad Hunter</b><span>Minera todas as categorias de novo. <b>É o único passo que gasta proxy.</b> ~40 min.</span></span>
    </button>
  </div>

  <div class="grade c2">
    <div class="cartao">
      <h3>Automações</h3>
      <p class="sub">Rodam sozinhas, com o PC ligado ou em suspensão.</p>
      ${tarefas.length ? tarefas.map((t) => `<div class="linha" style="margin-bottom:8px">
          <span class="tag ${t.cor === "ambar" ? "ambar" : "azul"}">${t.cor === "ambar" ? "proxy" : "grátis"}</span>
          <div><b>${esc(t.rotulo ?? t.nome)}</b><div class="meta">${t.ligada ? `próxima: ${quando(t)}` : "desligada"}</div></div>
        </div>`).join("") : `<p style="color:var(--texto-2);font-size:13px">Nenhuma tarefa registrada.</p>`}
      <button class="btn pequeno" data-ir="automacoes" style="margin-top:6px">Gerenciar →</button>
    </div>
    <div class="cartao">
      <h3>Últimas rodadas</h3>
      <p class="sub">O que o Claude fez por aqui.</p>
      ${hist}
    </div>
  </div>`;
}

function cartaoOferta(o, n) {
  const midia = o.video
    ? `<video src="${o.video}" ${o.imagem ? `poster="${o.imagem}"` : ""} controls preload="metadata"></video>`
    : o.imagem ? `<img src="${o.imagem}" alt="">`
      : `<span class="vazio">sem mídia salva</span>`;
  return `<article class="oferta ${o.recomendada ? "estrela" : ""}" data-ad="${o.adId}">
    <div class="midia">
      ${o.recomendada ? `<span class="selo">★ modelar</span>` : ""}
      <button class="fav ${o.favorita ? "on" : ""}" data-fav="${o.adId}" title="Favoritar">${o.favorita ? "★" : "☆"}</button>
      ${midia}
    </div>
    <div class="corpo">
      <div>
        <div class="cabeca">
          <span class="pag">${n}. ${esc(o.pagina)}</span>
          <span class="tag" style="margin-left:auto">${esc(o.nicho)}</span>
        </div>
        <div class="prod">${esc(o.produto ?? "")}</div>
        ${o.saturacao || o.formatoDestino ? `<div style="display:flex;gap:6px;margin-top:7px;flex-wrap:wrap">
          ${o.saturacao === "recorte" ? `<span class="tag verde" title="Recorte estreitado: dá pra modelar sem virar mais do mesmo">◆ recorte</span>` : ""}
          ${o.saturacao === "generico" ? `<span class="tag" title="Vende a categoria inteira — não vira recomendada">○ genérico</span>` : ""}
          ${o.formatoDestino && o.formatoDestino !== "pagina" ? `<span class="tag roxo" title="Modelagem rasa: só a página de vendas">${esc(o.formatoDestino)}</span>` : ""}
        </div>` : ""}
      </div>

      <div class="stats">
        <div class="stat ${o.urlPagina ? "clicavel" : ""}" ${o.urlPagina ? `data-link="${esc(o.urlPagina)}" title="Abrir a biblioteca de anúncios desta página"` : ""}>
          <b>${num(o.anunciosNaPagina)}</b><span>anúncios ativos na página</span>
        </div>
        <div class="stat"><b>${num(o.criativosDaOferta)}</b><span>criativos desta oferta</span></div>
        <div class="stat"><b>${o.diasRodando ?? "—"}d</b><span>rodando</span></div>
      </div>

      ${o.urlPagina ? `<button class="btn pequeno biblioteca" data-link="${esc(o.urlPagina)}">
        📚 Biblioteca de anúncios${o.anunciosNaPagina ? ` — ver os ${num(o.anunciosNaPagina)}` : ""}
      </button>` : ""}

      ${o.porqueEscala?.length ? `<div><div class="bloco-titulo">Por que está escalado</div>
        <ul class="lista-curta">${o.porqueEscala.slice(0, 4).map((x) => `<li>${esc(x)}</li>`).join("")}</ul></div>` : ""}

      ${o.comoModelar?.length ? `<div><div class="bloco-titulo">Como modelar</div>
        <ul class="lista-curta">${o.comoModelar.slice(0, 4).map((x) => `<li>${esc(x)}</li>`).join("")}</ul></div>` : ""}

      ${o.recomendada && o.porqueRecomendada ? `<div class="porque-modelar"><b>★ Por que esta:</b> ${esc(o.porqueRecomendada)}</div>` : ""}

      ${o.preco ? `<div style="font-size:12.5px;color:var(--texto-2)"><b>Preço:</b> ${esc(o.preco)}</div>` : ""}

      <div class="pes">
        <button class="btn pequeno principal" data-modelar="${esc(o.pagina)}" title="Roda o pipeline MVT sozinho e grava tudo em saidas/modelagem/">★ Modelar página</button>
        <button class="btn pequeno" data-modelar-junto="${esc(o.pagina)}" title="Mesma tela do automático, mas parando em cada fase pra você decidir">💬 com você</button>
        ${o.linkVenda ? `<button class="btn pequeno fantasma" data-link="${esc(o.linkVenda)}">Página de vendas</button>` : ""}
        ${o.urlBiblioteca ? `<button class="btn pequeno fantasma" data-link="${esc(o.urlBiblioteca)}">Este anúncio</button>` : ""}
      </div>
    </div>
  </article>`;
}

async function telaOfertas() {
  let r = estado.relatorio;
  if (!r) {
    try { r = estado.relatorio = await api("/api/relatorio"); } catch { r = null; }
  }
  if (!r) {
    return cabecalho("Ofertas", "As melhores ofertas escaladas que o harness encontrou.")
      + vazio("🎯", "Nenhum relatório ainda", "Rode uma mineração pra ver as ofertas aqui.",
        `<button class="btn principal" data-rodar="minerar">Minerar agora</button>`);
  }

  let ofertas = (r.nichos ?? []).flatMap((n) => n.ofertas ?? []);
  const nichos = [...new Set(ofertas.map((o) => o.nicho))];
  if (estado.filtroNicho !== "todos") ofertas = ofertas.filter((o) => o.nicho === estado.filtroNicho);
  if (estado.soEstrelas) ofertas = ofertas.filter((o) => o.recomendada);
  if (estado.soFavoritas) ofertas = ofertas.filter((o) => o.favorita);

  const opcoes = (estado.info.relatorios ?? []).map((d) => `<option value="${d}" ${d === r.data ? "selected" : ""}>${d}</option>`).join("");

  return cabecalho("Ofertas escaladas",
    esc(r.resumo ?? "Unidade de análise é a oferta: página + link de venda."),
    `<select id="sel-data" class="btn">${opcoes}</select>
     ${r.temHtml ? `<button class="btn" data-abrir="saidas/mineracao/${r.data}.html">Abrir relatório</button>` : ""}
     <button class="btn principal" data-rodar="minerar">Minerar de novo</button>`)
    + (r.nichosFaltando?.length ? `<div class="aviso"><span>⚠️</span><div><b>Cache velho:</b> ${esc(Array.isArray(r.nichosFaltando) ? r.nichosFaltando.join(", ") : r.nichosFaltando)}. Rode <b>Atualizar o Ad Hunter</b> pra essas categorias voltarem.</div></div>` : "")
    + `<div class="filtros">
        <button class="chip ${estado.filtroNicho === "todos" ? "ativo" : ""}" data-nicho="todos">Todos</button>
        ${nichos.map((n) => `<button class="chip ${estado.filtroNicho === n ? "ativo" : ""}" data-nicho="${esc(n)}">${esc(n)}</button>`).join("")}
        <span style="width:10px"></span>
        <button class="chip ${estado.soEstrelas ? "ativo" : ""}" data-alterna="soEstrelas">★ só as recomendadas</button>
        <button class="chip ${estado.soFavoritas ? "ativo" : ""}" data-alterna="soFavoritas">☆ minhas favoritas</button>
      </div>`
    + (ofertas.length
      ? `<div class="ofertas">${ofertas.map((o, k) => cartaoOferta(o, k + 1)).join("")}</div>`
      : vazio("🔍", "Nada com esse filtro", "Tire um filtro pra ver o resto."));
}

async function telaAtivas() {
  // O Termômetro é a página inteira do artifact, servida pelo painel. Vai num
  // iframe de propósito: o tema escuro e o CSS dele ficam isolados do resto.
  let quando = null;
  try { quando = (await api("/api/utmify/estado")).atualizadoEm; } catch { /* ainda sem cache */ }
  return `<div style="position:absolute;inset:0;display:flex;flex-direction:column">
      <iframe src="/termometro.html" title="Termômetro das Ofertas"
        style="flex:1;width:100%;border:0;background:#0b0f14"></iframe>
    </div>`;
}

async function telaPaginas() {
  const lista = await api("/api/modelagens");
  return cabecalho("Páginas de venda (MVT)",
    "Cada pasta é uma oferta que você mandou modelar: pesquisa, Raio-X, modelagem, copy, página e auditoria. Como o pipeline roda sozinho, <b>O que ele decidiu</b> mostra cada escolha e a alternativa descartada.",
    `<button class="btn" data-ir="ofertas">Escolher uma oferta →</button>`)
    + (lista.length ? lista.map((m) => `<div class="linha">
        <span class="tag ${m.nota ? "verde" : "roxo"}">${m.nota ? `nota ${esc(m.nota)}` : "MVT"}</span>
        <div><b>${esc(m.nome)}</b><div class="meta">${m.arquivos} arquivo(s) · ${new Date(m.mexido).toLocaleString("pt-BR")}</div></div>
        <div class="dir">
          ${m.pagina ? `<button class="btn pequeno principal" data-pagina="${esc(m.nome)}/${esc(m.pagina.split("/").pop())}">Ver a página</button>` : ""}
          ${m.concepcao ? `<button class="btn pequeno" data-ler="${esc(m.concepcao)}" title="A oferta antes de virar página">Concepção</button>` : ""}
          ${m.auditoria ? `<button class="btn pequeno" data-ler="${esc(m.auditoria)}" title="Conferência da página, com os ajustes feitos">Auditoria</button>` : ""}
          ${m.decisoes ? `<button class="btn pequeno fantasma" data-ler="${esc(m.decisoes)}" title="O que o Claude decidiu sozinho e o que descartou">Decisões</button>` : ""}
          ${m.auditoriaConcepcao ? `<button class="btn pequeno fantasma" data-ler="${esc(m.auditoriaConcepcao)}" title="Conferência da concepção, antes de construir">Conferência 1</button>` : ""}
          ${m.imagensFaltando ? `<button class="btn pequeno ambar" data-imagens="${esc(m.caminho)}" title="${m.imagensFaltando} imagens por preencher">🖼 Imagens (${m.imagensFaltando})</button>` : ""}
          ${m.briefingImagens ? `<button class="btn pequeno fantasma" data-ler="${esc(m.briefingImagens)}" title="O que cada imagem precisa mostrar">Briefing</button>` : ""}
          <button class="btn pequeno" data-rodar="conferir" data-arg="${esc(m.caminho)}" title="Roda o verificador mecânico">✓ Conferir</button>
          <button class="btn pequeno" data-rodar="corrigir" data-arg="${esc(m.caminho)}" title="O Claude corrige o que o verificador apontar">Corrigir</button>
          <button class="btn pequeno" data-rodar="auditar" data-arg="${esc(m.caminho)}" title="Refaz o laudo sobre a página atual">Refazer auditoria</button>
          <button class="btn pequeno fantasma" data-abrir="${esc(m.caminho)}">Pasta</button>
          <button class="btn pequeno perigo" data-excluir="${esc(m.nome)}" title="Manda pra lixeira: dá pra recuperar">Excluir</button>
        </div>
      </div>`).join("")
      : vazio("📄", "Nenhuma página ainda", "Vá em Ofertas, escolha uma e clique em <b>★ Modelar página</b>.",
        `<button class="btn principal" data-ir="ofertas">Ver as ofertas</button>`));
}

async function telaCriativos() {
  const [prods, arqs] = await Promise.all([api("/api/produtos"), api("/api/criativos")]);
  const ocupado = !!estado.rodando;
  return cabecalho("Criativos",
    "Ângulos novos e variações de copy pra cada produto seu, nas regras da skill <code>criativos-meta</code>.",
    `<button class="btn principal" data-rodar="criativos" ${ocupado ? "disabled" : ""}>Gerar pra todos</button>`)
    + (prods.length ? "" : `<div class="aviso"><span>⚠️</span><div><b>Nenhum produto cadastrado.</b> O agente de criativos precisa de uma ficha por produto em <code>produtos/</code> (promessa, preço, público, copy que já funciona). Copie o <code>_TEMPLATE.md</code> e preencha.
      <div style="margin-top:9px"><button class="btn pequeno" data-abrir="produtos">Abrir a pasta produtos</button></div></div></div>`)
    + `<h3 style="font-size:13px;text-transform:uppercase;letter-spacing:.07em;color:var(--texto-3);margin:0 0 11px">Seus produtos</h3>`
    + (prods.length ? prods.map((p) => `<div class="linha">
        <span class="tag verde">produto</span>
        <div><b>${esc(p.titulo)}</b><div class="meta">${esc(p.nome)}</div></div>
        <div class="dir">
          <button class="btn pequeno" data-ler="${esc(p.caminho)}">Ver ficha</button>
          <button class="btn pequeno principal" data-rodar="criativos" data-arg="${esc(p.slug)}" ${ocupado ? "disabled" : ""}>Gerar só deste</button>
        </div>
      </div>`).join("") : "")
    + `<h3 style="font-size:13px;text-transform:uppercase;letter-spacing:.07em;color:var(--texto-3);margin:26px 0 11px">Criativos gerados</h3>`
    + (arqs.length ? arqs.map((a) => `<div class="linha">
        <span class="tag">🎬</span>
        <div><b>${esc(a.nome)}</b><div class="meta">${new Date(a.mexido).toLocaleString("pt-BR")}</div></div>
        <div class="dir"><button class="btn pequeno" data-ler="${esc(a.caminho)}">Ler</button></div>
      </div>`).join("")
      : vazio("🎬", "Nada gerado ainda", "Cadastre um produto e clique em <b>Gerar pra todos</b>."));
}

async function telaIdeias() {
  const arqs = await api("/api/ideias");
  const ocupado = !!estado.rodando;
  return cabecalho("Ideias de oferta",
    "O que você poderia lançar, partindo do que já está escalando na mineração.",
    `<button class="btn principal" data-rodar="ideias" ${ocupado ? "disabled" : ""}>Gerar ideias</button>`)
    + (arqs.length ? arqs.map((a) => `<div class="linha">
        <span class="tag roxo">💡</span>
        <div><b>${esc(a.nome)}</b><div class="meta">${new Date(a.mexido).toLocaleString("pt-BR")}</div></div>
        <div class="dir"><button class="btn pequeno" data-ler="${esc(a.caminho)}">Ler</button></div>
      </div>`).join("")
      : vazio("💡", "Nenhuma ideia ainda", "Gere a partir da mineração mais recente.",
        `<button class="btn principal" data-rodar="ideias">Gerar ideias</button>`));
}

async function telaAutomacoes() {
  const tarefas = estado.info.tarefas ?? [];
  const quando = (t) => (t.proxima ? new Date(t.proxima).toLocaleString("pt-BR", { weekday: "long", day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }) : "—");

  return cabecalho("Automações",
    "Tarefas do Windows que rodam sozinhas. Com o PC em suspensão elas acordam a máquina; com ele desligado, rodam assim que você ligar.")
    + tarefas.map((t) => `<div class="cartao" style="margin-bottom:12px">
      <div style="display:flex;gap:12px;align-items:flex-start">
        <span class="tag ${t.cor === "ambar" ? "ambar" : "azul"}">${t.cor === "ambar" ? "usa proxy" : "de graça"}</span>
        <div style="flex:1">
          <h3>${esc(t.rotulo ?? t.nome)}</h3>
          <p class="sub" style="margin-bottom:8px">${esc(t.explica ?? "")}</p>
          <div style="font-size:12.5px;color:var(--texto-2)">
            <b>Quando:</b> ${esc(t.quando ?? "")} ·
            <b>Próxima:</b> ${t.ligada ? quando(t) : "desligada"}
            ${t.ultima ? ` · <b>Rodou:</b> ${new Date(t.ultima).toLocaleString("pt-BR")}` : " · <b>ainda não rodou</b>"}
          </div>
        </div>
        <div style="display:flex;gap:9px;align-items:center;flex:none">
          <button class="btn pequeno" data-tarefa="${esc(t.nome)}" data-acao="rodar">Rodar agora</button>
          <button class="chave ${t.ligada ? "on" : ""}" data-tarefa="${esc(t.nome)}" data-acao="${t.ligada ? "desligar" : "ligar"}" title="${t.ligada ? "desligar" : "ligar"}"></button>
        </div>
      </div>
    </div>`).join("")
    + `<div class="cartao">
        <h3>Como o ciclo funciona</h3>
        <p class="sub">Pra você não precisar lembrar.</p>
        <ol style="margin:0;padding-left:18px;display:grid;gap:7px;font-size:13px;color:var(--texto-2)">
          <li><b style="color:var(--ambar)">Domingo, 4h</b> — o Ad Hunter minera todas as categorias com o proxy residencial. É o único gasto de banda da semana.</li>
          <li><b style="color:var(--azul)">Todo dia, 6h</b> — o harness lê esse cache (3 segundos, zero proxy), filtra low-ticket, corta nicho black e destino WhatsApp, e escolhe as melhores.</li>
          <li><b style="color:var(--azul)">Logo em seguida</b> — conta os criativos reais de cada oferta e confere se o link é mesmo página de vendas.</li>
          <li><b style="color:var(--verde)">No fim</b> — publica o relatório e devolve as escolhidas pro Ad Hunter, marcadas.</li>
          <li><b style="color:var(--roxo)">Você</b> — abre o painel, escolhe uma e clica em <b>★ Modelar página</b>.</li>
        </ol>
      </div>`;
}

async function telaAjustes() {
  const c = estado.cfg ?? (estado.cfg = await api("/api/config"));
  return cabecalho("Ajustes", "O que o minerador procura e quanta coisa ele entrega.",
    `<button class="btn principal" id="salvar-cfg">Salvar</button>`)
    + `<div class="grade c3" style="margin-bottom:22px">
      ${[
        ["ofertasNoTotal", "Ofertas no relatório", "Tamanho do pool que aparece pra você escolher."],
        ["recomendadas", "Marcadas com ★", "Quantas vêm destacadas como 'modele esta'."],
        ["minCriativosDaOferta", "Mínimo de criativos", "Régua dura: só entra oferta com pelo menos isso rodando no mesmo link."],
      ].map(([k, r, d]) => `<div class="cartao"><div class="campo" style="margin:0">
        <label>${r}<div class="dica">${d}</div></label>
        <input type="number" min="1" value="${c[k] ?? ""}" data-cfg="${k}">
      </div></div>`).join("")}
    </div>

    <h3 style="font-size:13px;text-transform:uppercase;letter-spacing:.07em;color:var(--texto-3);margin:0 0 11px">Nichos e palavras-chave</h3>
    <p style="color:var(--texto-2);font-size:13px;margin:0 0 14px">Desligue um nicho pra tirar ele do rodízio. Clique numa palavra pra editar; use o <b>+</b> pra adicionar.</p>
    ${(c.nichos ?? []).map((n, i) => `<div class="nicho-linha">
        <button class="chave ${n.ativo !== false ? "on" : ""}" data-nicho-i="${i}"></button>
        <div style="flex:1">
          <b>${esc(n.nome)}</b>
          <div class="meta" style="color:var(--texto-3);font-size:11.5px">${esc(n.id)}${n.prioridade ? ` · prioridade ${n.prioridade}` : ""}${n._nota ? ` · ${esc(n._nota)}` : ""}</div>
        </div>
        <div class="kws">
          ${(n.keywords ?? []).map((k, j) => `<span class="kw">
            <input value="${esc(k.keyword)}" data-kw="${i}.${j}" size="${Math.max(8, k.keyword.length)}">
            <button data-tira-kw="${i}.${j}" title="tirar">×</button>
          </span>`).join("")}
          <button class="btn pequeno fantasma" data-add-kw="${i}">+ palavra</button>
        </div>
      </div>`).join("")}

    <div class="cartao" style="margin-top:22px">
      <h3>Onde as coisas ficam</h3>
      <p class="sub">Tudo no seu PC, nada na nuvem.</p>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <button class="btn pequeno" data-abrir="saidas/mineracao">Relatórios</button>
        <button class="btn pequeno" data-abrir="produtos">Produtos</button>
        <button class="btn pequeno" data-abrir="saidas/modelagem">Páginas MVT</button>
        <button class="btn pequeno" data-abrir="saidas/criativos">Criativos</button>
        <button class="btn pequeno" data-abrir="logs">Registros</button>
        <button class="btn pequeno" data-abrir="config/nichos.json">nichos.json</button>
      </div>
      <p style="color:var(--texto-3);font-size:11.5px;margin:12px 0 0">${esc(estado.info?.raiz ?? "")}</p>
    </div>`;
}

async function telaLeitor() {
  const txt = await fetch(`/api/arquivo?p=${encodeURIComponent(estado.lendo)}`).then((r) => r.text());
  return cabecalho(estado.lendo.split("/").pop(), esc(estado.lendo),
    `<button class="btn" id="voltar-leitor">← Voltar</button>`)
    + `<div class="leitor">${esc(txt)}</div>`;
}

/* ------------------------------------------------------------------ render */

async function render() {
  const tela = $("#tela");
  tela.classList.toggle("cheia", estado.tela === "ativas" && !estado.lendo);
  tela.innerHTML = `<p style="color:var(--texto-3)">carregando…</p>`;
  try {
    if (estado.lendo) tela.innerHTML = await telaLeitor();
    else if (estado.tela === "inicio") tela.innerHTML = await telaInicio();
    else if (estado.tela === "ativas") tela.innerHTML = await telaAtivas();
    else if (estado.tela === "ofertas") tela.innerHTML = await telaOfertas();
    else if (estado.tela === "paginas") tela.innerHTML = await telaPaginas();
    else if (estado.tela === "criativos") tela.innerHTML = await telaCriativos();
    else if (estado.tela === "ideias") tela.innerHTML = await telaIdeias();
    else if (estado.tela === "automacoes") tela.innerHTML = await telaAutomacoes();
    else if (estado.tela === "ajustes") tela.innerHTML = await telaAjustes();
  } catch (e) {
    tela.innerHTML = vazio("⚠️", "Deu problema", esc(e.message));
  }
  liga();
}

/* Um só lugar pra ligar os cliques, porque as telas são recriadas do zero. */
function liga() {
  const tela = $("#tela");

  tela.querySelectorAll("[data-rodar]").forEach((b) => {
    b.onclick = () => rodar(b.dataset.rodar, b.dataset.arg || null);
  });
  tela.querySelectorAll("[data-ir]").forEach((b) => {
    b.onclick = () => { estado.tela = b.dataset.ir; estado.lendo = null; desenhaNav(); render(); };
  });
  tela.querySelectorAll("[data-abrir]").forEach((b) => {
    b.onclick = () => abrir({ caminho: b.dataset.abrir });
  });
  tela.querySelectorAll("[data-excluir]").forEach((b) => {
    // Confirma sempre: a fileira é cheia de botões e o dedo escorrega.
    b.onclick = async () => {
      const nome = b.dataset.excluir;
      if (!confirm(`Excluir a modelagem "${nome}"?\n\nEla vai para saidas/modelagem/.lixeira/ e pode ser recuperada de lá.`)) return;
      try {
        await api("/api/excluir-modelagem", { corpo: { nome } });
        avisa(`"${nome}" foi pra lixeira.`);
        await recarrega();
        render();
      } catch (e) { avisa(e.message); }
    };
  });
  tela.querySelectorAll("[data-imagens]").forEach((b) => {
    // Um botão só: o script publica o que já está em imagens-novas/<produto>/,
    // vê o que ainda falta e só então chama o Codex. Escolher entre "gerar" e
    // "publicar" era decisão que ele toma melhor do que quem está olhando a tela.
    b.onclick = () => rodar("pedirImagens", b.dataset.imagens);
  });
  tela.querySelectorAll("[data-pagina]").forEach((b) => {
    // Servida pelo próprio painel: abre renderizada, com o JS da calculadora vivo.
    b.onclick = () => window.open(`/pagina/${b.dataset.pagina}`, "_blank");
  });
  tela.querySelectorAll("[data-link]").forEach((b) => {
    b.onclick = () => abrir({ link: b.dataset.link });
  });
  tela.querySelectorAll("[data-ler]").forEach((b) => {
    b.onclick = () => { estado.lendo = b.dataset.ler; render(); };
  });
  const voltar = $("#voltar-leitor");
  if (voltar) voltar.onclick = () => { estado.lendo = null; render(); };

  tela.querySelectorAll("[data-periodo]").forEach((b) => {
    b.onclick = () => { estado.periodo = b.dataset.periodo; render(); };
  });
  tela.querySelectorAll("[data-nicho]").forEach((b) => {
    b.onclick = () => { estado.filtroNicho = b.dataset.nicho; render(); };
  });
  tela.querySelectorAll("[data-alterna]").forEach((b) => {
    b.onclick = () => { estado[b.dataset.alterna] = !estado[b.dataset.alterna]; render(); };
  });

  const sel = $("#sel-data");
  if (sel) sel.onchange = async () => {
    estado.relatorio = await api(`/api/relatorio?data=${sel.value}`);
    render();
  };

  tela.querySelectorAll("[data-fav]").forEach((b) => {
    b.onclick = async () => {
      const r = await api("/api/favorito", { corpo: { adId: b.dataset.fav } });
      b.classList.toggle("on", r.favorita);
      b.textContent = r.favorita ? "★" : "☆";
      const o = (estado.relatorio?.nichos ?? []).flatMap((n) => n.ofertas).find((x) => String(x.adId) === b.dataset.fav);
      if (o) o.favorita = r.favorita;
      recarrega();
    };
  });

  tela.querySelectorAll("[data-modelar]").forEach((b) => {
    b.onclick = () => rodar("modelar", b.dataset.modelar);
  });
  tela.querySelectorAll("[data-modelar-junto]").forEach((b) => {
    // Mesma tela do automático, mas parando pra perguntar: a cada fase o
    // pipeline deixa a pergunta e o console mostra com botões de resposta.
    b.onclick = () => rodar("modelarJunto", b.dataset.modelarJunto);
  });

  tela.querySelectorAll("[data-tarefa]").forEach((b) => {
    b.onclick = async () => {
      try {
        await api("/api/tarefa", { corpo: { nome: b.dataset.tarefa, acao: b.dataset.acao } });
        avisa(b.dataset.acao === "rodar" ? "Mandei rodar." : "Pronto.");
        await recarrega();
        render();
      } catch (e) { avisa(e.message); }
    };
  });

  /* ajustes */
  tela.querySelectorAll("[data-cfg]").forEach((i) => {
    i.onchange = () => { estado.cfg[i.dataset.cfg] = Number(i.value); };
  });
  tela.querySelectorAll("[data-nicho-i]").forEach((b) => {
    b.onclick = () => {
      const n = estado.cfg.nichos[Number(b.dataset.nichoI)];
      n.ativo = n.ativo === false;
      render();
    };
  });
  tela.querySelectorAll("[data-kw]").forEach((i) => {
    i.onchange = () => {
      const [a, j] = i.dataset.kw.split(".").map(Number);
      estado.cfg.nichos[a].keywords[j].keyword = i.value.trim();
    };
  });
  tela.querySelectorAll("[data-tira-kw]").forEach((b) => {
    b.onclick = () => {
      const [a, j] = b.dataset.tiraKw.split(".").map(Number);
      estado.cfg.nichos[a].keywords.splice(j, 1);
      render();
    };
  });
  tela.querySelectorAll("[data-add-kw]").forEach((b) => {
    b.onclick = () => {
      estado.cfg.nichos[Number(b.dataset.addKw)].keywords.push({ keyword: "nova palavra", exato: false, pais: "BR" });
      render();
    };
  });
  const salvar = $("#salvar-cfg");
  if (salvar) salvar.onclick = async () => {
    try { await api("/api/config", { corpo: estado.cfg }); avisa("Ajustes salvos ✓"); }
    catch (e) { avisa(e.message); }
  };
}

/* ------------------------------------------------------------------ chrome */

$("#btn-tema").onclick = () => {
  const escuro = document.documentElement.dataset.tema === "escuro";
  document.documentElement.dataset.tema = escuro ? "claro" : "escuro";
  localStorage.setItem("tema", document.documentElement.dataset.tema);
  $("#btn-tema").innerHTML = `<span class="ic">◐</span> Tema ${escuro ? "escuro" : "claro"}`;
};
$("#btn-pasta").onclick = () => abrir({ caminho: "." });
$("#btn-parar").onclick = async () => { await api("/api/parar", { corpo: {} }); avisa("Parando…"); };
$("#btn-minimizar").onclick = (e) => { e.stopPropagation(); $("#console").classList.toggle("minimo"); };
$("#console-topo").onclick = () => $("#console").classList.toggle("minimo");

(function inicia() {
  // O cabeçalho do console ganha o nome da etapa, e a régua de etapas entra
  // logo abaixo da barra de tempo.
  const topo = $("#console-topo");
  const etapa = document.createElement("span");
  etapa.id = "console-etapa";
  etapa.className = "etapa-agora";
  topo.querySelector("b").after(etapa);
  const regua = document.createElement("div");
  regua.id = "etapas";
  regua.className = "etapas esconde";
  $("#barra").closest("div").parentElement.after(regua);

  // A caixa do gate: fica entre a régua e o corpo, escondida até ele chegar.
  const caixa = document.createElement("div");
  caixa.id = "gate";
  caixa.className = "gate esconde";
  regua.after(caixa);

  const t = localStorage.getItem("tema");
  if (t) {
    document.documentElement.dataset.tema = t;
    $("#btn-tema").innerHTML = `<span class="ic">◐</span> Tema ${t === "escuro" ? "claro" : "escuro"}`;
  }
  recarrega().then(async () => {
    // quantas ofertas o relatório mais recente tem — pro contador da lateral
    try {
      estado.relatorio = await api("/api/relatorio");
      estado.info.ofertas = (estado.relatorio.nichos ?? []).reduce((s, n) => s + (n.ofertas?.length ?? 0), 0);
    } catch { estado.info.ofertas = 0; }
    desenhaNav();
    render();
    ligaEventos();
  });
})();
