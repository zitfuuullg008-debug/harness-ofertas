#!/usr/bin/env node
/**
 * minerar.mjs — Minera ofertas escaladas na Biblioteca de Anúncios da Meta.
 *
 * Técnica (herdada do Ad Hunter): abre a busca da Ads Library num Chromium
 * headless, intercepta as respostas GraphQL que a própria página faz, extrai
 * os nós de anúncio (objetos com `ad_archive_id`), agrupa por anunciante e
 * pontua cada um pelos sinais de escala que a Meta expõe.
 *
 * Uso:
 *   node scripts/minerar.mjs                      # todos os nichos de config/nichos.json
 *   node scripts/minerar.mjs --nicho receitas     # só um nicho (ou vários: --nicho receitas,cristao)
 *   node scripts/minerar.mjs --max 20             # anúncios por keyword
 *   node scripts/minerar.mjs --sem-enrich         # pula a contagem total de anúncios por página
 *   node scripts/minerar.mjs --reaproveitar       # usa a coleta de hoje dos nichos já feitos e minera só os que faltam
 *   node scripts/minerar.mjs --headful            # mostra o navegador (debug)
 *   PROXY_URL=http://user:pass@host:port node scripts/minerar.mjs   # sai por proxy residencial (nuvem)
 *
 * O resumo é salvo a cada nicho concluído, então uma rodada interrompida (rate
 * limit, PC desligado) não perde nada — basta rodar de novo com --reaproveitar.
 *
 * Saída:
 *   data/raw/<AAAA-MM-DD>/<nicho>.json   — tudo que foi coletado (bruto normalizado)
 *   data/raw/<AAAA-MM-DD>/resumo.json    — top anunciantes por nicho, compacto, pro agente ler
 *   data/vistos.json                     — histórico de páginas já vistas (marca o que é novo)
 */

import { chromium } from "playwright";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const BROWSER_DATA_DIR = join(ROOT, ".browser-data");
const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

// ───────────────────────── args ─────────────────────────
const args = process.argv.slice(2);
const flag = (name) => args.includes(name);
const opt = (name, fallback) => {
  const i = args.indexOf(name);
  return i >= 0 && args[i + 1] ? args[i + 1] : fallback;
};

const config = JSON.parse(readFileSync(join(ROOT, "config/nichos.json"), "utf8"));
const soNicho = opt("--nicho", null);
const maxPorKeyword = Number(opt("--max", config.anunciosPorKeyword ?? 40));
const topPorNicho = Number(opt("--top", 8)); // quantas ofertas por nicho vão pro resumo
const enrichPorNicho = Number(opt("--enrich", config.enriquecerPorNicho ?? 5)); // páginas visitadas por nicho
const enrich = !flag("--sem-enrich");
const headful = flag("--headful");
const reaproveitar = flag("--reaproveitar");
const hoje = new Date().toISOString().slice(0, 10);
const outDir = join(ROOT, "data/raw", hoje);
mkdirSync(outDir, { recursive: true });

const idsPedidos = soNicho ? soNicho.split(",").map((s) => s.trim()).filter(Boolean) : null;
const nichos = config.nichos.filter((n) => !idsPedidos || idsPedidos.includes(n.id));
if (!nichos.length) {
  console.error(`Nicho "${soNicho}" não existe em config/nichos.json. Disponíveis: ${config.nichos.map((n) => n.id).join(", ")}`);
  process.exit(1);
}

// ───────────────────────── helpers ─────────────────────────
const log = (evento, extra = {}) =>
  console.log(`[${new Date().toISOString().slice(11, 19)}] ${evento}`, Object.keys(extra).length ? JSON.stringify(extra) : "");

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const jitter = (base, spread) => base + Math.floor(Math.random() * spread);

function buildSearchUrl({ keyword, exato, pais }) {
  const p = new URLSearchParams({
    active_status: "active",
    ad_type: "all",
    country: pais || "BR",
    is_targeted_country: "false",
    media_type: "all",
    q: keyword,
    search_type: exato ? "keyword_exact_phrase" : "keyword_unordered",
    "sort_data[mode]": "total_impressions",
    "sort_data[direction]": "desc",
  });
  return `https://www.facebook.com/ads/library/?${p}`;
}

function buildPageUrl(pageId, pais = "BR") {
  const p = new URLSearchParams({
    active_status: "active",
    ad_type: "all",
    country: pais,
    is_targeted_country: "false",
    media_type: "all",
    search_type: "page",
    view_all_page_id: pageId,
  });
  return `https://www.facebook.com/ads/library/?${p}`;
}

/** Percorre qualquer JSON coletando objetos que passam no predicado. */
function deepCollect(root, predicate) {
  const found = [];
  const seen = new Set();
  const stack = [root];
  while (stack.length) {
    const node = stack.pop();
    if (node === null || typeof node !== "object" || seen.has(node)) continue;
    seen.add(node);
    if (predicate(node)) found.push(node);
    for (const v of Array.isArray(node) ? node : Object.values(node)) stack.push(v);
  }
  return found;
}

const isAdNode = (o) =>
  o && typeof o === "object" && ("ad_archive_id" in o || "adArchiveID" in o) && ("snapshot" in o || "page_id" in o || "pageID" in o);

function parseGraphqlBodies(text) {
  const cleaned = text.replace(/^for\s*\(;;\);/, "").trim();
  if (!cleaned) return [];
  try {
    return [JSON.parse(cleaned)];
  } catch {}
  const out = [];
  for (const line of cleaned.split("\n")) {
    try {
      if (line.trim()) out.push(JSON.parse(line));
    } catch {}
  }
  return out;
}

const pick = (obj, ...keys) => {
  if (!obj) return null;
  for (const k of keys) {
    const v = obj[k];
    if (v !== undefined && v !== null && v !== "") return v;
  }
  return null;
};

const isTemplate = (v) => typeof v === "string" && /\{\{[^}]+\}\}/.test(v);
const semTemplate = (v) => (isTemplate(v) ? null : v);

function num(v) {
  if (v === null || v === undefined) return null;
  if (typeof v === "number") return Number.isFinite(v) ? v : null;
  const t = String(v).trim().replace(/,/g, "");
  const m = t.match(/^([\d.]+)\s*([KMB]?)/i);
  if (!m) {
    const n = Number(t);
    return Number.isFinite(n) ? n : null;
  }
  const mult = { K: 1e3, M: 1e6, B: 1e9 }[(m[2] || "").toUpperCase()] ?? 1;
  return Math.round(Number(m[1]) * mult);
}

function bounds(v) {
  if (!v) return null;
  if (typeof v === "object") {
    const lo = num(pick(v, "lower_bound", "lowerBound"));
    const hi = num(pick(v, "upper_bound", "upperBound"));
    return lo === null && hi === null ? null : { min: lo, max: hi };
  }
  const parts = String(v).split(/\s*[-–]\s*/);
  if (parts.length === 2) return { min: num(parts[0]), max: num(parts[1]) };
  const s = num(v);
  return s === null ? null : { min: s, max: s };
}

function toIso(v) {
  if (v === null || v === undefined || v === "") return null;
  if (typeof v === "number") {
    const d = new Date(v < 1e12 ? v * 1000 : v);
    return Number.isNaN(d.getTime()) ? null : d.toISOString();
  }
  const n = Number(v);
  if (Number.isFinite(n) && String(v).trim() !== "") return toIso(n);
  const d = new Date(String(v));
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

const asArray = (v) => (Array.isArray(v) ? v : v === null || v === undefined ? [] : [v]);

function mapCreatives(snapshot) {
  const out = [];
  for (const card of asArray(snapshot?.cards)) {
    const img = pick(card, "original_image_url", "resized_image_url", "image_url");
    const vid = pick(card, "video_hd_url", "video_sd_url", "watermarked_video_hd_url");
    out.push({ tipo: vid ? "video" : img ? "imagem" : "?", imagem: img, video: vid, thumb: pick(card, "video_preview_image_url"), titulo: pick(card, "title"), texto: pick(card?.body, "text") ?? pick(card, "body"), link: pick(card, "link_url") });
  }
  for (const img of asArray(snapshot?.images)) {
    out.push({ tipo: "imagem", imagem: pick(img, "original_image_url", "resized_image_url", "image_url"), video: null, thumb: null, titulo: pick(snapshot, "title"), texto: pick(snapshot?.body, "text"), link: pick(snapshot, "link_url") });
  }
  for (const vid of asArray(snapshot?.videos)) {
    out.push({ tipo: "video", imagem: null, video: pick(vid, "video_hd_url", "video_sd_url", "watermarked_video_hd_url"), thumb: pick(vid, "video_preview_image_url"), titulo: pick(snapshot, "title"), texto: pick(snapshot?.body, "text"), link: pick(snapshot, "link_url") });
  }
  return out;
}

function mapAd(raw) {
  const s = raw?.snapshot ?? {};
  const id = pick(raw, "ad_archive_id", "adArchiveID");
  const pageId = pick(raw, "page_id", "pageID") ?? pick(s, "page_id");
  const inicio = toIso(pick(raw, "start_date", "start_date_string", "ad_delivery_start_time"));
  return {
    id,
    pagina: {
      id: pageId,
      nome: pick(raw, "page_name") ?? pick(s, "page_name"),
      alias: pick(s, "page_alias", "page_username"),
      categorias: asArray(pick(s, "page_categories", "page_category")).map((c) => (typeof c === "string" ? c : pick(c, "name", "text"))).filter(Boolean),
      curtidas: num(pick(s, "page_like_count", "page_likes")),
      instagram: pick(s, "instagram_url", "ig_url"),
      seguidoresIg: num(pick(s, "instagram_followers", "ig_followers")),
      totalAnuncios: num(pick(raw, "ad_count", "total_ads", "total_active_ads")),
    },
    titulo: semTemplate(pick(s, "title")),
    texto: semTemplate(pick(s?.body, "text") ?? pick(s, "body")),
    descricaoLink: semTemplate(pick(s, "link_description")),
    cta: pick(s, "cta_text"),
    link: pick(s, "link_url"),
    criativos: mapCreatives(s),
    plataformas: asArray(pick(raw, "publisher_platform", "publisherPlatform")).map(String),
    inicio,
    fim: toIso(pick(raw, "end_date", "end_date_string", "ad_delivery_stop_time")),
    diasAtivo: inicio ? Math.max(0, Math.round((Date.now() - new Date(inicio).getTime()) / 86400000)) : null,
    // Meta agrupa anúncios com o mesmo criativo; collation_count = quantos usam esse criativo.
    collationCount: num(pick(raw, "collation_count", "collationCount")),
    impressoes: bounds(pick(raw, "impressions") ?? pick(raw?.impressions_with_index, "impressions_text")),
    gasto: bounds(pick(raw, "spend")),
    moeda: pick(raw, "currency"),
    ativo: typeof raw?.is_active === "boolean" ? raw.is_active : null,
    urlBiblioteca: id ? `https://www.facebook.com/ads/library/?id=${id}` : null,
  };
}

// ───────────────────────── browser ─────────────────────────
function proxyConfig() {
  // Tolera "PROXY_URL=..." colado inteiro no valor da variável (acontece).
  const raw = (process.env.PROXY_URL ?? "").trim().replace(/^PROXY_URL=/, "");
  if (!raw) return null;
  try {
    const u = new URL(raw);
    return {
      server: `${u.protocol}//${u.hostname}${u.port ? `:${u.port}` : ""}`,
      ...(u.username ? { username: decodeURIComponent(u.username), password: decodeURIComponent(u.password) } : {}),
    };
  } catch {
    log("proxy_invalido", { valor: raw.replace(/\/\/.*@/, "//***@") });
    return null;
  }
}

let context = null;
async function getContext() {
  if (context) return context;
  for (const lock of ["SingletonLock", "SingletonSocket", "SingletonCookie"]) {
    const p = join(BROWSER_DATA_DIR, lock);
    if (existsSync(p)) {
      try {
        (await import("node:fs")).rmSync(p, { force: true });
      } catch {}
    }
  }
  context = await chromium.launchPersistentContext(BROWSER_DATA_DIR, {
    headless: !headful,
    userAgent: USER_AGENT,
    locale: "pt-BR",
    viewport: { width: 1366, height: 900 },
    serviceWorkers: "block",
    args: ["--no-sandbox", "--disable-blink-features=AutomationControlled", "--disable-dev-shm-usage"],
    ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}),
    // PROXY_URL=http://user:pass@host:port — proxy residencial (a Meta bloqueia IP de datacenter;
    // na nuvem é obrigatório, em casa não precisa).
    ...(proxyConfig() ? { proxy: proxyConfig() } : {}),
  });
  await context.addInitScript(() => {
    Object.defineProperty(navigator, "webdriver", { get: () => undefined });
  });
  return context;
}

async function blockHeavy(page) {
  await page.route("**/*", (route) => {
    const t = route.request().resourceType();
    if (t === "image" || t === "media" || t === "font") return route.abort();
    return route.continue();
  });
}

async function dismissCookies(page) {
  const sels = [
    '[data-testid="cookie-policy-manage-dialog-accept-button"]',
    '[data-cookiebanner="accept_button"]',
    'div[aria-label="Permitir todos os cookies"]',
    'div[aria-label="Allow all cookies"]',
  ];
  for (const s of sels) {
    const el = page.locator(s).first();
    if (await el.isVisible({ timeout: 500 }).catch(() => false)) {
      await el.click().catch(() => {});
      return;
    }
  }
}

/**
 * Abre uma URL da Ads Library, escuta o GraphQL e rola até juntar `max` anúncios
 * ou a página parar de entregar. Devolve os anúncios normalizados.
 */
/**
 * Abre uma URL da Ads Library, lê os anúncios embutidos no HTML inicial, escuta
 * o GraphQL e rola até juntar `max` anúncios ou a página parar de entregar.
 * Devolve { ads, totalResultados } — totalResultados é o "~N resultados" que a
 * própria Meta mostra no topo (exato mesmo quando a página tem 500 anúncios).
 */
async function coletar(url, max, rotulo, timeoutMs = 60000) {
  const ctx = await getContext();
  const page = await ctx.newPage();
  const coletados = new Map();
  let gqlCount = 0;
  let rateLimited = false;
  let totalResultados = null;

  const absorver = (payload) => {
    for (const err of asArray(payload?.errors)) {
      if (String(err?.message ?? "").toLowerCase().includes("rate limit") || err?.code === 1675004) rateLimited = true;
    }
    for (const node of deepCollect(payload, isAdNode)) {
      const ad = mapAd(node);
      const key = ad.id ?? `${ad.pagina.id}:${ad.titulo}:${coletados.size}`;
      if (!coletados.has(key)) coletados.set(key, ad);
    }
  };

  await blockHeavy(page);
  page.on("response", (res) => {
    const u = res.url();
    if (!u.includes("/api/graphql/") && !u.includes("/graphql")) return;
    gqlCount++;
    res
      .text()
      .then((body) => parseGraphqlBodies(body).forEach(absorver))
      .catch(() => {});
  });

  // Quando a página tem poucos anúncios, eles vêm embutidos no HTML e o GraphQL
  // nem dispara. Lemos os <script type="application/json"> da página.
  const lerEmbutidos = async () => {
    const blobs = await page
      .evaluate(() =>
        [...document.querySelectorAll('script[type="application/json"]')]
          .map((s) => s.textContent ?? "")
          .filter((t) => t.includes("ad_archive_id")),
      )
      .catch(() => []);
    for (const b of blobs) parseGraphqlBodies(b).forEach(absorver);
  };

  const lerTotal = async () => {
    const textos = await page
      .evaluate(() => [...document.querySelectorAll('[role="heading"], h1, h2, h3, h4')].map((h) => h.textContent ?? ""))
      .catch(() => []);
    for (const t of textos) {
      const m = t.match(/~?\s*([\d.,]+)\s*(mil)?\s*(resultados?|results?)/i);
      if (m) {
        let n = Number(m[1].replace(/\./g, "").replace(",", "."));
        if (m[2]) n *= 1000;
        if (Number.isFinite(n)) return Math.round(n);
      }
    }
    return null;
  };

  try {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: timeoutMs });
    await sleep(jitter(1800, 1000));
    await dismissCookies(page);
    await lerEmbutidos();
    totalResultados = await lerTotal();

    const deadline = Date.now() + timeoutMs;
    let ultimo = -1;
    let estagnado = 0;
    let rodada = 0;
    const alvo = totalResultados !== null ? Math.min(max, totalResultados) : max;
    while (coletados.size < alvo && Date.now() < deadline && !rateLimited) {
      await page.mouse.wheel(0, 4000).catch(() => {});
      await sleep(jitter(700, 500));
      rodada++;
      if (totalResultados === null) totalResultados = await lerTotal();
      if (coletados.size === ultimo) {
        estagnado++;
        const limite = gqlCount === 0 ? 5 : 3;
        if (estagnado >= limite) break;
      } else {
        estagnado = 0;
        ultimo = coletados.size;
      }
    }
    log("coleta_fim", { rotulo, anuncios: coletados.size, total: totalResultados, rodadas: rodada, gql: gqlCount, rateLimited });
  } catch (e) {
    log("coleta_erro", { rotulo, erro: String(e?.message ?? e).split("\n")[0] });
  } finally {
    await page.close().catch(() => {});
  }
  // A Meta limita o GraphQL (scroll) antes de bloquear o HTML inicial. Se ainda
  // veio anúncio, é limite leve: pausa curta e segue. Bloqueio real = veio nada.
  if (rateLimited && coletados.size > 0) {
    log("rate_limit_leve", { rotulo, anuncios: coletados.size, acao: "pausando 20s" });
    await sleep(20000);
  } else if (rateLimited) {
    rateLimitSeguidos++;
    // 90s → 3min → 6min. Depois de 3 seguidos a Meta não vai soltar tão cedo:
    // abortamos a rodada e o que já foi coletado fica salvo (use --reaproveitar depois).
    if (rateLimitSeguidos >= 3) {
      log("rate_limit_abortar", { rotulo, seguidos: rateLimitSeguidos });
      throw new RateLimitAbort();
    }
    const pausa = 90000 * 2 ** (rateLimitSeguidos - 1);
    log("rate_limit", { rotulo, seguidos: rateLimitSeguidos, acao: `pausando ${Math.round(pausa / 1000)}s` });
    await sleep(pausa);
  } else if (coletados.size > 0) {
    rateLimitSeguidos = 0;
  }
  return { ads: [...coletados.values()], totalResultados };
}

let rateLimitSeguidos = 0;
class RateLimitAbort extends Error {}

// ───────────────────────── ofertas, agregação e score ─────────────────────────
/**
 * Uma OFERTA = página + destino do anúncio (link de venda). Dois anúncios da
 * mesma página que mandam pro mesmo link são criativos da mesma oferta; se a
 * página vende 5 produtos em 5 links, são 5 ofertas.
 */
function chaveOferta(ad) {
  const link = ad.link ?? ad.criativos?.[0]?.link ?? null;
  if (!link) return `sem-link:${(ad.titulo ?? ad.texto ?? "").slice(0, 60).toLowerCase()}`;
  try {
    const u = new URL(link);
    // Meta às vezes embrulha o destino em l.facebook.com/l.php?u=...
    if (u.hostname === "l.facebook.com" && u.searchParams.get("u")) return chaveOferta({ link: u.searchParams.get("u"), criativos: [] });
    if (/whatsapp|wa\.me/.test(u.hostname)) {
      const phone = u.searchParams.get("phone") ?? u.pathname.replace(/\D/g, "");
      return `wa:${phone || "sem-numero"}`;
    }
    return `${u.hostname.replace(/^www\./, "")}${u.pathname.replace(/\/+$/, "")}`.toLowerCase();
  } catch {
    return `link:${link.slice(0, 80)}`;
  }
}

function fingerprint(ad) {
  const c = ad.criativos[0];
  return [ad.titulo ?? "", (ad.texto ?? "").slice(0, 120), c?.video ?? c?.imagem ?? ""].join("|");
}

function mediana(arr) {
  if (!arr.length) return null;
  const s = [...arr].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : Math.round((s[m - 1] + s[m]) / 2);
}

function escolherPrincipal(ads) {
  return [...ads].sort(
    (a, b) =>
      (b.collationCount ?? 0) - (a.collationCount ?? 0) ||
      (b.impressoes?.max ?? 0) - (a.impressoes?.max ?? 0) ||
      (b.diasAtivo ?? 0) - (a.diasAtivo ?? 0),
  )[0];
}

/** Agrupa anúncios em ofertas (página + link). Devolve lista plana de ofertas. */
function agregar(ads) {
  const porPagina = new Map();
  for (const ad of ads) {
    const pk = ad.pagina.id ?? ad.pagina.alias ?? ad.pagina.nome ?? "?";
    if (!porPagina.has(pk)) porPagina.set(pk, { pagina: ad.pagina, ofertas: new Map() });
    const pg = porPagina.get(pk);
    const ok = chaveOferta(ad);
    if (!pg.ofertas.has(ok)) pg.ofertas.set(ok, []);
    pg.ofertas.get(ok).push(ad);
  }

  const ofertas = [];
  for (const { pagina, ofertas: mapa } of porPagina.values()) {
    const totalGraphql = pagina.totalAnuncios ?? [...mapa.values()].flat().map((a) => a.pagina.totalAnuncios).find((n) => n !== null) ?? null;
    const anunciosNoLote = [...mapa.values()].reduce((s, l) => s + l.length, 0);
    const paginaInfo = {
      ...pagina,
      anunciosNaPagina: totalGraphql,
      fonteContagem: totalGraphql !== null ? "graphql" : "observado",
      anunciosNoLote,
      ofertasNaPagina: mapa.size,
    };
    for (const [chave, lista] of mapa) {
      const principal = escolherPrincipal(lista);
      const fp = fingerprint(principal);
      ofertas.push({
        chave,
        link: principal.link ?? principal.criativos?.[0]?.link ?? null,
        pagina: paginaInfo,
        criativosNoLote: lista.length,
        criativosDaOferta: lista.length, // refinado no enrich com a página inteira
        mesmoCriativoNoLote: lista.filter((a) => fingerprint(a) === fp).length,
        collationMax: Math.max(0, ...lista.map((a) => a.collationCount ?? 0)),
        diasAtivoMax: Math.max(0, ...lista.map((a) => a.diasAtivo ?? 0)),
        diasAtivoMediana: mediana(lista.map((a) => a.diasAtivo).filter((n) => n !== null)),
        impressoesMax: Math.max(0, ...lista.map((a) => a.impressoes?.max ?? 0)),
        principal,
        ads: lista,
      });
    }
  }
  return ofertas;
}

/**
 * Score de escala da OFERTA. Sinais (na ordem de peso):
 *   - criativos rodando pra essa oferta (quem escala testa 10, 30, 80 criativos)
 *   - total de anúncios ativos da página (tamanho do anunciante)
 *   - collation_count (mesmo criativo replicado em N anúncios)
 *   - tempo rodando (criativo que roda há semanas está dando lucro)
 *   - impressões (quando a Meta expõe)
 */
function score(o) {
  const naPagina = o.pagina.anunciosNaPagina ?? o.pagina.anunciosNoLote;
  return (
    Math.min(o.criativosDaOferta, 100) * 3 +
    Math.min(naPagina, 150) * 1.5 +
    Math.min(o.collationMax, 60) * 2 +
    o.mesmoCriativoNoLote * 1.5 +
    Math.min(o.diasAtivoMediana ?? 0, 120) / 4 +
    Math.min(o.impressoesMax / 50000, 20)
  );
}

/**
 * Abre a visão "todos os anúncios desta página": lê o "~N resultados" (contagem
 * exata) e agrupa os anúncios da página por oferta pra saber quantos criativos
 * cada oferta tem de verdade. Uma visita por página, compartilhada entre ofertas.
 */
const paginasEnriquecidas = new Map();
async function enriquecerPagina(pagina, pais) {
  const pid = pagina.id;
  if (!pid) return null;
  if (paginasEnriquecidas.has(pid)) return paginasEnriquecidas.get(pid);
  const { ads, totalResultados } = await coletar(buildPageUrl(pid, pais), 120, `pagina:${pagina.nome}`, 35000);
  const porOferta = new Map();
  for (const ad of ads) {
    const k = chaveOferta(ad);
    porOferta.set(k, (porOferta.get(k) ?? 0) + 1);
  }
  const info = {
    amostra: ads.length,
    total: totalResultados ?? (ads.length || null),
    fonte: totalResultados !== null ? "meta_resultados" : ads.length ? "view_all_page" : null,
    porOferta,
    ofertasNaPagina: porOferta.size || null,
    collationMax: Math.max(0, ...ads.map((a) => a.collationCount ?? 0)),
    diasMediana: mediana(ads.map((a) => a.diasAtivo).filter((n) => n !== null)),
  };
  paginasEnriquecidas.set(pid, info);
  return info;
}

function aplicarEnrich(oferta, info) {
  if (!info) return;
  if (info.total !== null) {
    oferta.pagina.anunciosNaPagina = Math.max(info.total, oferta.pagina.anunciosNoLote);
    oferta.pagina.fonteContagem = info.fonte;
  }
  if (info.ofertasNaPagina) oferta.pagina.ofertasNaPagina = Math.max(info.ofertasNaPagina, oferta.pagina.ofertasNaPagina);
  const naPagina = info.porOferta.get(oferta.chave) ?? 0;
  oferta.criativosDaOferta = Math.max(oferta.criativosNoLote, naPagina);
  // Amostra menor que a página (ex.: 30 de 500): estima pela proporção da oferta na amostra.
  if (info.total && info.amostra && info.total > info.amostra && naPagina > 0) {
    oferta.criativosEstimados = Math.max(oferta.criativosDaOferta, Math.round((naPagina / info.amostra) * info.total));
  }
  oferta.collationMax = Math.max(oferta.collationMax, info.collationMax);
  if (info.diasMediana !== null && oferta.ads.length < 3) oferta.diasAtivoMediana = info.diasMediana;
}

// ───────────────────────── main ─────────────────────────
const vistosPath = join(ROOT, "data/vistos.json");
const vistos = existsSync(vistosPath) ? JSON.parse(readFileSync(vistosPath, "utf8")) : { paginas: {}, ofertas: {} };
vistos.ofertas ??= {};
const resumoPath = join(outDir, "resumo.json");
// Com --reaproveitar, parte do resumo já salvo hoje e só substitui os nichos que rodarem agora.
const resumo =
  reaproveitar && existsSync(resumoPath)
    ? JSON.parse(readFileSync(resumoPath, "utf8"))
    : { data: hoje, geradoEm: new Date().toISOString(), nichos: [] };

function salvarProgresso() {
  resumo.geradoEm = new Date().toISOString();
  writeFileSync(resumoPath, JSON.stringify(resumo, null, 2));
  writeFileSync(vistosPath, JSON.stringify(vistos, null, 2));
}

/** Coleta (ou carrega do cache do dia) e devolve as ofertas agregadas e pontuadas de um nicho. */
async function processarNicho(nicho) {
  const cachePath = join(outDir, `${nicho.id}.json`);
  if (reaproveitar && existsSync(cachePath)) {
    const cache = JSON.parse(readFileSync(cachePath, "utf8"));
    // Nicho que ficou vazio (bloqueio, proxy fora) NÃO conta como feito: tenta de novo.
    if (cache.ofertas && cache.totalAnuncios > 0) {
      log("nicho_cache", { nicho: nicho.id, anuncios: cache.totalAnuncios, ofertas: cache.totalOfertas });
      return { totalAnuncios: cache.totalAnuncios, ofertas: cache.ofertas };
    }
    log("nicho_cache_antigo", { nicho: nicho.id, acao: "formato antigo (por anunciante) — recoletando" });
  }

  log("nicho_inicio", { nicho: nicho.id, keywords: nicho.keywords.length });
  let abortou = false;
  const todos = [];
  for (const kw of nicho.keywords) {
    const { ads } = await coletar(buildSearchUrl(kw), kw.max ?? maxPorKeyword, `${nicho.id}/${kw.keyword}`);
    for (const ad of ads) ad._keyword = kw.keyword;
    todos.push(...ads);
    await sleep(jitter(2500, 2500));
  }

  // dedup por id do anúncio entre keywords
  const unicos = [...new Map(todos.map((a) => [a.id ?? Math.random(), a])).values()];
  let ofertas = agregar(unicos);
  ofertas.forEach((o) => (o.score = score(o)));
  ofertas.sort((a, b) => b.score - a.score);

  if (enrich) {
    // Enriquece as páginas das melhores ofertas (uma visita por página).
    const alvo = ofertas.slice(0, Math.min(topPorNicho, enrichPorNicho));
    const paginas = [...new Map(alvo.map((o) => [o.pagina.id ?? o.pagina.nome, o.pagina])).values()];
    log("enrich_inicio", { nicho: nicho.id, paginas: paginas.length });
    try {
      for (const pg of paginas) {
        const info = await enriquecerPagina(pg, nicho.keywords[0]?.pais ?? "BR");
        for (const o of ofertas) if ((o.pagina.id ?? o.pagina.nome) === (pg.id ?? pg.nome)) aplicarEnrich(o, info);
        await sleep(jitter(5000, 5000)); // pausa longa entre páginas: menos bloqueio
      }
    } catch (e) {
      // Bloqueio no meio do enrich: guarda o nicho com o que já foi enriquecido.
      if (!(e instanceof RateLimitAbort)) throw e;
      abortou = true;
    }
    ofertas.forEach((o) => (o.score = score(o)));
    ofertas.sort((a, b) => b.score - a.score);
  }

  writeFileSync(cachePath, JSON.stringify({ nicho, coletadoEm: new Date().toISOString(), totalAnuncios: unicos.length, totalOfertas: ofertas.length, ofertas }, null, 2));
  return { totalAnuncios: unicos.length, ofertas, abortou };
}

let abortado = false;
for (const nicho of nichos) {
  let totalAnuncios, ofertas, abortou;
  try {
    ({ totalAnuncios, ofertas, abortou } = await processarNicho(nicho));
  } catch (e) {
    if (e instanceof RateLimitAbort) {
      abortado = true;
      break;
    }
    throw e;
  }

  const top = ofertas.slice(0, topPorNicho);
  const entrada = {
    id: nicho.id,
    nome: nicho.nome,
    totalAnuncios,
    totalOfertas: ofertas.length,
    totalPaginas: new Set(ofertas.map((o) => o.pagina.id ?? o.pagina.nome)).size,
    top: top.map((o) => {
      const pid = o.pagina.id ?? o.pagina.nome;
      const ok = `${pid}|${o.chave}`;
      const jaVisto = vistos.ofertas[ok];
      // Só conta uma "vez" por dia — reaproveitar a coleta não infla o histórico.
      const novoHoje = !jaVisto || jaVisto.ultimaVez !== hoje;
      vistos.ofertas[ok] = { pagina: o.pagina.nome, link: o.link, primeiraVez: jaVisto?.primeiraVez ?? hoje, ultimaVez: hoje, vezes: (jaVisto?.vezes ?? 0) + (novoHoje ? 1 : 0) };
      vistos.paginas[pid] = { nome: o.pagina.nome, primeiraVez: vistos.paginas[pid]?.primeiraVez ?? hoje, ultimaVez: hoje };
      return {
        pagina: o.pagina.nome,
        paginaId: o.pagina.id,
        instagram: o.pagina.instagram,
        oferta: { chave: o.chave, link: o.link },
        novo: !jaVisto || jaVisto.primeiraVez === hoje,
        vezesVisto: vistos.ofertas[ok].vezes,
        score: Math.round(o.score),
        sinais: {
          anunciosNaPagina: o.pagina.anunciosNaPagina,
          fonteContagem: o.pagina.fonteContagem,
          ofertasNaPagina: o.pagina.ofertasNaPagina,
          criativosDaOferta: o.criativosDaOferta,
          criativosEstimados: o.criativosEstimados ?? null,
          criativosNoLote: o.criativosNoLote,
          collationMax: o.collationMax,
          mesmoCriativoNoLote: o.mesmoCriativoNoLote,
          diasAtivoMediana: o.diasAtivoMediana,
          diasAtivoMax: o.diasAtivoMax,
          impressoesMax: o.impressoesMax || null,
        },
        keywordsOndeApareceu: [...new Set(o.ads.map((x) => x._keyword))],
        anuncioPrincipal: {
          id: o.principal.id,
          titulo: o.principal.titulo,
          texto: (o.principal.texto ?? "").slice(0, 900),
          cta: o.principal.cta,
          link: o.principal.link,
          tipoCriativo: o.principal.criativos[0]?.tipo ?? "?",
          video: o.principal.criativos[0]?.video ?? null,
          imagem: o.principal.criativos[0]?.imagem ?? o.principal.criativos[0]?.thumb ?? null,
          diasAtivo: o.principal.diasAtivo,
          urlBiblioteca: o.principal.urlBiblioteca,
        },
        outrosTextos: o.ads
          .filter((x) => x.id !== o.principal.id && x.texto)
          .slice(0, 3)
          .map((x) => (x.texto ?? "").slice(0, 300)),
      };
    }),
  };
  const idx = resumo.nichos.findIndex((n) => n.id === nicho.id);
  if (idx >= 0) resumo.nichos[idx] = entrada;
  else resumo.nichos.push(entrada);
  salvarProgresso();
  log("nicho_fim", { nicho: nicho.id, anuncios: totalAnuncios, ofertas: ofertas.length, enrichIncompleto: Boolean(abortou) });
  if (abortou) {
    abortado = true;
    break;
  }
}

if (context) await context.close().catch(() => {});

if (abortado) {
  const feitos = new Set(resumo.nichos.map((n) => n.id));
  const faltam = nichos.filter((n) => !feitos.has(n.id)).map((n) => n.id);
  console.log(`\n⚠ Meta bloqueou (rate limit 3x seguidas). Salvo o que deu: ${[...feitos].join(", ")}.`);
  console.log(`  Faltam: ${faltam.join(", ")}. Daqui a algumas horas rode:  node scripts/minerar.mjs --reaproveitar`);
}

console.log("\n══════════ RESUMO ══════════");
for (const n of resumo.nichos) {
  console.log(`\n▶ ${n.nome} — ${n.totalAnuncios} anúncios, ${n.totalOfertas ?? "?"} ofertas em ${n.totalPaginas ?? "?"} páginas`);
  for (const t of n.top.slice(0, 5)) {
    const s = t.sinais;
    console.log(`   ${t.novo ? "🆕" : "  "} [${t.score}] ${t.pagina} → ${t.oferta?.chave ?? "?"}  |  ${s.criativosDaOferta} criativos · página ${s.anunciosNaPagina ?? "?"} anúncios · ${s.diasAtivoMediana ?? "?"}d`);
  }
}
console.log(`\nArquivos em: ${outDir}`);
