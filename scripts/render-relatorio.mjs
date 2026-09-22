#!/usr/bin/env node
/**
 * render-relatorio.mjs — transforma o JSON que o agente minerador escreve em
 * um relatório visual (HTML com cards, no estilo do Ad Hunter) + um markdown
 * curto no mesmo formato. Também baixa thumbnail e vídeo de cada anúncio pra
 * `saidas/mineracao/midia/`, porque os links da Meta expiram em poucas horas.
 *
 * Uso:
 *   node scripts/render-relatorio.mjs saidas/mineracao/2026-09-21.json
 *   node scripts/render-relatorio.mjs saidas/mineracao/2026-09-21.json --sem-midia
 *   node scripts/render-relatorio.mjs saidas/mineracao/2026-09-21.json --so-thumbs   # nuvem: só thumbnails
 *
 * Também atualiza index.html na raiz do projeto (lista de relatórios, mais
 * recente primeiro) — é o site publicado pelo GitHub Pages.
 *
 * Gera, ao lado do JSON:  <data>.html  e  <data>.md
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync, statSync } from "node:fs";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const jsonPath = resolve(args.find((a) => !a.startsWith("--")) ?? "");
const semMidia = args.includes("--sem-midia");
const soThumbs = args.includes("--so-thumbs"); // nuvem: baixa só thumbnail (leve), sem vídeo
if (!jsonPath || !existsSync(jsonPath)) {
  console.error("Uso: node scripts/render-relatorio.mjs saidas/mineracao/<data>.json");
  process.exit(1);
}

const rel = JSON.parse(readFileSync(jsonPath, "utf8"));
const data = rel.data ?? basename(jsonPath, ".json");
const outDir = dirname(jsonPath);
const midiaDir = join(outDir, "midia");
mkdirSync(midiaDir, { recursive: true });

// ───────────── dados brutos do dia (pra achar mídia e texto do anúncio) ─────────────
const rawDir = join(ROOT, "data/raw", data);
const rawPorNicho = new Map();
function rawDoNicho(id) {
  if (!rawPorNicho.has(id)) {
    const p = join(rawDir, `${id}.json`);
    rawPorNicho.set(id, existsSync(p) ? JSON.parse(readFileSync(p, "utf8")) : null);
  }
  return rawPorNicho.get(id);
}
function acharAnuncio(nichoId, adId, paginaId) {
  const raw = rawDoNicho(nichoId);
  if (!raw) return null;
  // Formato atual: raw.ofertas (página + link). Formato antigo: raw.anunciantes.
  const grupos = raw.ofertas ?? raw.anunciantes ?? [];
  for (const g of grupos) {
    if (adId) {
      const ad = g.ads.find((a) => a.id === adId);
      if (ad) return { ad, pagina: g.pagina, oferta: g };
    }
  }
  if (paginaId) {
    const g = grupos.find((a) => a.pagina.id === paginaId);
    if (g) return { ad: g.principal, pagina: g.pagina, oferta: g };
  }
  return null;
}

// ───────────── download de mídia ─────────────
const MAX_VIDEO_MB = 30;
async function baixar(url, destino) {
  if (!url || existsSync(destino)) return existsSync(destino);
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 60000);
    const res = await fetch(url, { signal: ctrl.signal, headers: { "user-agent": "Mozilla/5.0" } });
    clearTimeout(t);
    if (!res.ok) return false;
    const len = Number(res.headers.get("content-length") ?? 0);
    if (len > MAX_VIDEO_MB * 1024 * 1024) return false;
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length > MAX_VIDEO_MB * 1024 * 1024) return false;
    writeFileSync(destino, buf);
    return true;
  } catch {
    return false;
  }
}

// ───────────── helpers ─────────────
const esc = (s) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
const lista = (v) => (Array.isArray(v) ? v : v ? [v] : []);
const dataExtenso = (() => {
  const d = new Date(`${data}T12:00:00`);
  return d.toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" });
})();
const urlPagina = (pid) =>
  `https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=BR&view_all_page_id=${pid}&search_type=page`;

// ───────────── monta os cards ─────────────
const cards = []; // { nicho, oferta, midia }
for (const nicho of rel.nichos ?? []) {
  for (const o of nicho.ofertas ?? []) {
    const achado = acharAnuncio(nicho.id, o.adId, o.paginaId);
    const ad = achado?.ad;
    const cr = ad?.criativos?.[0];
    const midia = { video: null, imagem: null, texto: ad?.texto ?? o.copy ?? null, curtidas: achado?.pagina?.curtidas ?? null };
    if (ad) {
      const base = join(midiaDir, `${ad.id}`);
      const thumbUrl = cr?.thumb ?? cr?.imagem;
      // Reaproveita o que já foi baixado; só busca na Meta se não tiver e não for --sem-midia.
      const temVideo = existsSync(`${base}.mp4`) || (!semMidia && !soThumbs && cr?.video && (await baixar(cr.video, `${base}.mp4`)));
      const temThumb = existsSync(`${base}.jpg`) || (!semMidia && thumbUrl && (await baixar(thumbUrl, `${base}.jpg`)));
      if (temVideo) midia.video = `midia/${ad.id}.mp4`;
      if (temThumb) midia.imagem = `midia/${ad.id}.jpg`;
      process.stdout.write(`  mídia ${o.pagina}: ${midia.video ? "vídeo " : ""}${midia.imagem ? "thumb" : ""}${!midia.video && !midia.imagem ? "— (sem mídia)" : ""}\n`);
    }
    // Normaliza campos antigos (anunciosAtivos/mesmoCriativo) pro formato por oferta.
    o.anunciosNaPagina ??= achado?.pagina?.anunciosNaPagina ?? o.anunciosAtivos ?? null;
    o.criativosDaOferta ??= achado?.oferta?.criativosDaOferta ?? achado?.oferta?.anunciosObservados ?? null;
    o.criativosEstimados ??= achado?.oferta?.criativosEstimados ?? null;
    o.ofertasNaPagina ??= achado?.pagina?.ofertasNaPagina ?? null;
    cards.push({ nicho, o, midia, ad, pagina: achado?.pagina });
  }
}

// ───────────── HTML ─────────────
function cardHtml({ nicho, o, midia, ad, pagina }) {
  const linkVenda = o.linkVenda ?? ad?.link ?? null;
  const pid = o.paginaId ?? pagina?.id ?? null;
  const urlBib = o.urlBiblioteca ?? ad?.urlBiblioteca ?? null;
  const media = midia.video
    ? `<video controls preload="metadata" ${midia.imagem ? `poster="${midia.imagem}"` : ""} src="${midia.video}"></video>`
    : midia.imagem
      ? `<a href="${esc(urlBib ?? "#")}" target="_blank" rel="noopener" title="Ver o vídeo no Ads Library"><img src="${midia.imagem}" alt=""><span class="play">▶</span></a>`
      : `<div class="sem-midia">sem mídia salva<br><small>abra no Ads Library</small></div>`;
  const badge = o.novo ? `<span class="badge novo">novo</span>` : `<span class="badge rec">recorrente · ${o.vezesVisto ?? "?"}ª vez</span>`;
  const estrela = o.recomendada ? `<span class="badge top">★ modelar</span>` : "";
  const stat = (n, l) => `<div class="stat"><b>${esc(n ?? "—")}</b><span>${l}</span></div>`;
  return `
<article class="card${o.recomendada ? " recomendada" : ""}">
  <header>
    <div class="quem">
      <strong>${esc(o.pagina)}</strong>
      <small>${midia.curtidas ? `${Number(midia.curtidas).toLocaleString("pt-BR")} curtidas · ` : ""}${esc(o.keyword ?? "")}</small>
    </div>
    <div class="badges">${estrela}${badge}</div>
  </header>
  <div class="media">${media}</div>
  <div class="stats">
    ${stat(o.anunciosNaPagina, "anúncios ativos na página")}
    ${stat(o.criativosEstimados && o.criativosEstimados > (o.criativosDaOferta ?? 0) ? `≈${o.criativosEstimados}` : o.criativosDaOferta, "criativos da oferta")}
    ${stat(o.diasRodando != null ? `${o.diasRodando}d` : null, "rodando")}
  </div>
  <dl>
    <dt>Produto${o.preco ? ` · <span class="preco">${esc(o.preco)}</span>` : ""}</dt><dd>${esc(o.produto)}</dd>
    ${o.promessa ? `<dt>Promessa</dt><dd>“${esc(o.promessa)}”</dd>` : ""}
    ${o.hook ? `<dt>Hook</dt><dd class="hook">“${esc(o.hook)}”</dd>` : ""}
    ${o.porqueRecomendada ? `<dt class="rec-dt">Por que modelar esta</dt><dd class="rec-dd">${esc(o.porqueRecomendada)}</dd>` : ""}
    <dt>Por que está escalando</dt><dd><ul>${lista(o.porqueEscala).map((b) => `<li>${esc(b)}</li>`).join("")}</ul></dd>
    <dt>Como modelar</dt><dd><ul class="modelar">${lista(o.comoModelar).map((b) => `<li>${esc(b)}</li>`).join("")}</ul></dd>
  </dl>
  ${midia.texto ? `<details><summary>Copy do anúncio</summary><pre>${esc(midia.texto)}</pre></details>` : ""}
  <footer>
    ${linkVenda ? `<a href="${esc(linkVenda)}" target="_blank" rel="noopener">Link de venda ↗</a>` : ""}
    ${pid ? `<a href="https://www.facebook.com/${pid}" target="_blank" rel="noopener">Perfil do Facebook</a>` : ""}
    ${urlBib ? `<a href="${esc(urlBib)}" target="_blank" rel="noopener">Ver no Ads Library ↗</a>` : ""}
    ${pid ? `<a href="${urlPagina(pid)}" target="_blank" rel="noopener">Todos os anúncios</a>` : ""}
  </footer>
</article>`;
}

const nichosHtml = (rel.nichos ?? [])
  .map((n) => {
    const cs = cards.filter((c) => c.nicho.id === n.id).sort((a, b) => Number(Boolean(b.o.recomendada)) - Number(Boolean(a.o.recomendada)));
    const desc = (n.descartados ?? []).map((d) => `<li><b>${esc(d.pagina)}</b> — ${esc(d.motivo)}</li>`).join("");
    return `
<section class="nicho" id="${n.id}">
  <h2>${esc(n.nome)} <small>${n.totalAnuncios ?? "?"} anúncios · ${n.totalAnunciantes ?? "?"} anunciantes · ${cs.length} ofertas</small></h2>
  <div class="grid">${cs.map(cardHtml).join("")}</div>
  ${desc ? `<details class="descartados"><summary>Descartados (${(n.descartados ?? []).length})</summary><ul>${desc}</ul></details>` : ""}
</section>`;
  })
  .join("");

const nav = (rel.nichos ?? []).map((n) => `<a href="#${n.id}">${esc(n.nome)}</a>`).join("");
const faltando = lista(rel.nichosFaltando);
const padroes = lista(rel.padroes);

const html = `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Ofertas escaladas — ${esc(dataExtenso)}</title>
<style>
  :root { --bg:#0f1115; --card:#171a21; --line:#262a33; --txt:#e8eaf0; --mut:#9aa1ad; --acc:#8b5cf6; --ok:#22c55e; --warn:#f59e0b; }
  * { box-sizing:border-box }
  body { margin:0; background:var(--bg); color:var(--txt); font:15px/1.5 system-ui,-apple-system,Segoe UI,Roboto,sans-serif; }
  .wrap { max-width:1280px; margin:0 auto; padding:24px 16px 80px; }
  h1 { font-size:26px; margin:0 0 4px } h1 small { color:var(--mut); font-weight:400; font-size:15px; display:block }
  .resumo { background:var(--card); border:1px solid var(--line); border-radius:12px; padding:14px 18px; margin:18px 0; }
  .aviso { border-color:var(--warn); color:#fcd34d }
  nav { display:flex; flex-wrap:wrap; gap:8px; margin:12px 0 28px }
  nav a { color:var(--txt); text-decoration:none; background:var(--card); border:1px solid var(--line); padding:6px 12px; border-radius:999px; font-size:13px }
  nav a:hover { border-color:var(--acc) }
  h2 { font-size:20px; margin:36px 0 14px; padding-top:12px; border-top:1px solid var(--line) } h2 small { color:var(--mut); font-size:13px; font-weight:400; margin-left:8px }
  .grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(340px,1fr)); gap:16px }
  .card { background:var(--card); border:1px solid var(--line); border-radius:14px; overflow:hidden; display:flex; flex-direction:column }
  .card header { display:flex; justify-content:space-between; align-items:flex-start; gap:8px; padding:14px 16px 10px }
  .quem strong { display:block; font-size:16px } .quem small { color:var(--mut); font-size:12px }
  .badge { font-size:11px; padding:3px 8px; border-radius:999px; white-space:nowrap; font-weight:600 }
  .badge.novo { background:rgba(34,197,94,.15); color:var(--ok) } .badge.rec { background:rgba(245,158,11,.15); color:var(--warn) }
  .badge.top { background:rgba(139,92,246,.2); color:#c4b5fd; border:1px solid var(--acc) }
  .badges { display:flex; flex-direction:column; gap:4px; align-items:flex-end }
  .card.recomendada { border-color:var(--acc); box-shadow:0 0 0 1px var(--acc) }
  .rec-dt { color:#c4b5fd !important } .rec-dd { color:#ddd6fe }
  .media { background:#000; aspect-ratio:4/5; display:flex; align-items:center; justify-content:center }
  .media video, .media img { width:100%; height:100%; object-fit:contain; display:block }
  .media a { position:relative; display:block; width:100%; height:100% }
  .media .play { position:absolute; inset:0; margin:auto; width:64px; height:64px; border-radius:50%; background:rgba(139,92,246,.85); color:#fff; font-size:26px; display:flex; align-items:center; justify-content:center; pointer-events:none }
  .sem-midia { color:var(--mut); text-align:center; font-size:13px }
  .stats { display:grid; grid-template-columns:repeat(3,1fr); border-top:1px solid var(--line); border-bottom:1px solid var(--line) }
  .stat { padding:10px 6px; text-align:center; border-right:1px solid var(--line) } .stat:last-child { border-right:0 }
  .stat b { display:block; font-size:18px; color:var(--acc) } .stat span { font-size:11px; color:var(--mut); text-transform:uppercase; letter-spacing:.03em }
  dl { margin:0; padding:14px 16px 4px; flex:1 }
  dt { font-size:11px; text-transform:uppercase; letter-spacing:.06em; color:var(--mut); margin-top:12px } dt:first-child { margin-top:0 }
  .preco { text-transform:none; letter-spacing:0; color:var(--ok); font-weight:600 }
  dd { margin:3px 0 0 } dd.hook { font-style:italic; color:#c4b5fd }
  dd ul { margin:0; padding-left:18px } dd li { margin:2px 0 } ul.modelar li::marker { color:var(--ok) }
  details { padding:0 16px 10px } summary { cursor:pointer; color:var(--mut); font-size:13px }
  pre { white-space:pre-wrap; font:13px/1.45 inherit; background:#0f1115; border:1px solid var(--line); border-radius:8px; padding:10px; margin:8px 0 0; max-height:260px; overflow:auto }
  footer { display:flex; flex-wrap:wrap; gap:8px; padding:12px 16px 16px; border-top:1px solid var(--line) }
  footer a { color:var(--txt); text-decoration:none; font-size:13px; background:#1f2330; border:1px solid var(--line); padding:8px 12px; border-radius:8px }
  footer a:hover { border-color:var(--acc) }
  .descartados { margin-top:14px; color:var(--mut) } .descartados ul { columns:2; gap:24px; font-size:13px } .descartados b { color:var(--txt); font-weight:500 }
  .padroes ul { margin:6px 0 0; padding-left:20px }
  @media (max-width:640px) { .descartados ul { columns:1 } }
</style>
</head>
<body><div class="wrap">
<h1>Ofertas escaladas <small>${esc(dataExtenso)} · ${cards.length} ofertas em ${(rel.nichos ?? []).length} nichos</small></h1>
${rel.resumo ? `<div class="resumo">${esc(rel.resumo)}</div>` : ""}
${faltando.length ? `<div class="resumo aviso">⚠ Nichos que não entraram nesta rodada: ${faltando.map(esc).join(", ")}. Rode <code>node scripts/minerar.mjs --reaproveitar</code> pra completar.</div>` : ""}
<nav>${nav}</nav>
${nichosHtml}
${padroes.length ? `<section class="resumo padroes"><strong>Padrões da semana</strong><ul>${padroes.map((p) => `<li>${esc(p)}</li>`).join("")}</ul></section>` : ""}
</div></body></html>`;

writeFileSync(join(outDir, `${data}.html`), html);

// ───────────── Markdown curto ─────────────
const md = [];
md.push(`# Ofertas escaladas — ${dataExtenso}`, "");
if (rel.resumo) md.push(rel.resumo, "");
if (faltando.length) md.push(`> ⚠ Faltaram nesta rodada: ${faltando.join(", ")} — \`node scripts/minerar.mjs --reaproveitar\``, "");
md.push(`📊 Versão visual com vídeos: [${data}.html](${data}.html)`, "");
for (const n of rel.nichos ?? []) {
  md.push(`## ${n.nome}`, "");
  const cs = cards.filter((c) => c.nicho.id === n.id);
  cs.forEach(({ o, ad, pagina }, i) => {
    const pid = o.paginaId ?? pagina?.id;
    md.push(`### ${i + 1}. ${o.pagina} ${o.recomendada ? "★ MODELAR" : ""} ${o.novo ? "🆕" : `🔁 ${o.vezesVisto ?? "?"}ª vez`}`);
    if (o.porqueRecomendada) md.push(`- **Por que modelar esta:** ${o.porqueRecomendada}`);
    const criat = o.criativosEstimados && o.criativosEstimados > (o.criativosDaOferta ?? 0) ? `≈${o.criativosEstimados}` : (o.criativosDaOferta ?? "—");
    md.push(`- **Anúncios ativos na página:** ${o.anunciosNaPagina ?? "—"} · **criativos desta oferta:** ${criat} · rodando há ${o.diasRodando ?? "—"} dias`);
    md.push(`- **Produto:** ${o.produto}${o.preco ? ` — ${o.preco}` : ""}`);
    if (o.hook) md.push(`- **Hook:** "${o.hook}"`);
    md.push(`- **Por que está escalando:**`);
    for (const b of lista(o.porqueEscala)) md.push(`  - ${b}`);
    md.push(`- **Como modelar:**`);
    for (const b of lista(o.comoModelar)) md.push(`  - ${b}`);
    const links = [];
    if (o.urlBiblioteca ?? ad?.urlBiblioteca) links.push(`[anúncio](${o.urlBiblioteca ?? ad.urlBiblioteca})`);
    if (pid) links.push(`[todos os anúncios](${urlPagina(pid)})`);
    if (o.linkVenda ?? ad?.link) links.push(`[link de venda](${o.linkVenda ?? ad.link})`);
    if (links.length) md.push(`- ${links.join(" · ")}`);
    md.push("");
  });
  if (n.descartados?.length) md.push(`<details><summary>Descartados (${n.descartados.length})</summary>`, "", ...n.descartados.map((d) => `- ${d.pagina} — ${d.motivo}`), "", `</details>`, "");
}
if (padroes.length) md.push(`## Padrões da semana`, "", ...padroes.map((p) => `- ${p}`), "");
writeFileSync(join(outDir, `${data}.md`), md.join("\n"));

// ───────────── índice do site (raiz do projeto) ─────────────
// index.html redireciona pro relatório mais recente e lista os anteriores.
// É o que o GitHub Pages publica quando o projeto está num repositório.
const { readdirSync } = await import("node:fs");
const relatorios = readdirSync(outDir)
  .filter((f) => /^\d{4}-\d{2}-\d{2}\.html$/.test(f))
  .sort()
  .reverse();
const itens = relatorios
  .map((f, i) => {
    const d = f.slice(0, 10);
    const ext = new Date(`${d}T12:00:00`).toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
    return `<li class="${i === 0 ? "ultimo" : ""}"><a href="saidas/mineracao/${f}">${esc(ext)}</a>${i === 0 ? " <span>mais recente</span>" : ""}</li>`;
  })
  .join("");
writeFileSync(
  join(ROOT, "index.html"),
  `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Ofertas escaladas</title>
<meta http-equiv="refresh" content="0; url=saidas/mineracao/${relatorios[0] ?? ""}">
<style>body{margin:0;background:#0f1115;color:#e8eaf0;font:16px/1.5 system-ui,sans-serif}.wrap{max-width:640px;margin:0 auto;padding:40px 16px}h1{font-size:24px}ul{list-style:none;padding:0}li{margin:8px 0}a{color:#c4b5fd}li.ultimo a{font-weight:700}li span{font-size:12px;color:#22c55e;margin-left:8px}</style></head>
<body><div class="wrap"><h1>Ofertas escaladas — relatórios</h1><p>Abrindo o mais recente…</p><ul>${itens}</ul></div></body></html>`,
);

console.log(`\nGerado:\n  ${join(outDir, `${data}.html`)}\n  ${join(outDir, `${data}.md`)}\n  ${join(ROOT, "index.html")} (índice do site)`);
