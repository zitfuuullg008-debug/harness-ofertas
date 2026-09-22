#!/usr/bin/env node
/**
 * enriquecer.mjs — abre a página de cada anunciante ESCOLHIDO no relatório e lê
 * quantos anúncios ela tem rodando no total (o "~N resultados" que a própria
 * Meta mostra), gravando isso de volta no JSON do relatório.
 *
 * Por que existe: o scraper visita poucas páginas por nicho pra economizar
 * tempo/banda, e nem sempre são as das ofertas que entram no relatório — daí
 * cards saíam com "—" em ANÚNCIOS NA PÁGINA. Aqui o custo é mínimo: uma visita
 * por card, só depois que o agente já decidiu quem entra.
 *
 * Uso:  node scripts/enriquecer.mjs saidas/mineracao/2026-09-22.json
 *
 * Conta TODOS os anúncios ativos da página, de qualquer produto — é o sinal de
 * tamanho do anunciante que o usuário quer ver.
 */

import { chromium } from "playwright";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const jsonPath = resolve(process.argv[2] ?? "");
if (!jsonPath || !existsSync(jsonPath)) {
  console.error("Uso: node scripts/enriquecer.mjs saidas/mineracao/<data>.json");
  process.exit(1);
}

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
const log = (m, e = {}) => console.log(`[${new Date().toISOString().slice(11, 19)}] ${m}`, Object.keys(e).length ? JSON.stringify(e) : "");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

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

/** Normaliza o destino de um anúncio pra agrupar criativos da MESMA oferta. */
function chaveDestino(link) {
  if (!link) return null;
  try {
    const u = new URL(link);
    if (u.hostname === "l.facebook.com" && u.searchParams.get("u")) return chaveDestino(u.searchParams.get("u"));
    if (/whatsapp|wa\.me/.test(u.hostname)) return `wa:${u.searchParams.get("phone") ?? u.pathname.replace(/\D/g, "")}`;
    return `${u.hostname.replace(/^www\./, "")}${u.pathname.replace(/\/+$/, "")}`.toLowerCase();
  } catch {
    return String(link).slice(0, 80);
  }
}

function urlPagina(pid, pais = "BR") {
  const p = new URLSearchParams({
    active_status: "active",
    ad_type: "all",
    country: pais,
    is_targeted_country: "false",
    media_type: "all",
    search_type: "page",
    view_all_page_id: pid,
  });
  return `https://www.facebook.com/ads/library/?${p}`;
}

function proxyConfig() {
  const raw = (process.env.PROXY_URL ?? "").trim().replace(/^PROXY_URL=/, "");
  if (!raw) return null;
  try {
    const u = new URL(raw);
    return {
      server: `${u.protocol}//${u.hostname}${u.port ? `:${u.port}` : ""}`,
      ...(u.username ? { username: decodeURIComponent(u.username), password: decodeURIComponent(u.password) } : {}),
    };
  } catch {
    return null;
  }
}

const rel = JSON.parse(readFileSync(jsonPath, "utf8"));
const cards = (rel.nichos ?? []).flatMap((n) => n.ofertas ?? []);
const alvos = [...new Map(cards.filter((o) => o.paginaId).map((o) => [o.paginaId, o])).values()];
if (!alvos.length) {
  console.log("Nenhuma oferta com paginaId — nada a enriquecer.");
  process.exit(0);
}

const context = await chromium.launchPersistentContext(join(ROOT, ".browser-data"), {
  headless: true,
  userAgent: USER_AGENT,
  locale: "pt-BR",
  viewport: { width: 1366, height: 900 },
  serviceWorkers: "block",
  args: ["--no-sandbox", "--disable-blink-features=AutomationControlled", "--disable-dev-shm-usage"],
  ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}),
  ...(proxyConfig() ? { proxy: proxyConfig() } : {}),
});
await context.addInitScript(() => {
  Object.defineProperty(navigator, "webdriver", { get: () => undefined });
});

const totais = new Map();
const porDestino = new Map(); // paginaId -> Map(chaveDestino -> nº de anúncios)
for (const o of alvos) {
  const page = await context.newPage();
  const destinos = new Map();
  const vistos = new Set();
  const anunciosDaPagina = [];
  await page.route("**/*", (r) => (["image", "media", "font"].includes(r.request().resourceType()) ? r.abort() : r.continue()));
  // Conta quantos anúncios da página levam a cada destino — é o "criativos desta oferta" de verdade.
  page.on("response", (res) => {
    const u = res.url();
    if (!u.includes("/api/graphql/") && !u.includes("/graphql")) return;
    res
      .text()
      .then((body) => {
        for (const payload of parseGraphqlBodies(body)) {
          for (const node of deepCollect(payload, isAdNode)) {
            const id = node.ad_archive_id ?? node.adArchiveID;
            if (!id || vistos.has(id)) continue;
            vistos.add(id);
            const snap = node.snapshot ?? {};
            const link = snap.link_url ?? snap.cards?.[0]?.link_url ?? null;
            const k = chaveDestino(link);
            if (k) destinos.set(k, (destinos.get(k) ?? 0) + 1);
            const ini = node.start_date ?? node.start_date_string ?? null;
            anunciosDaPagina.push({
              id,
              destino: k,
              link,
              titulo: snap.title ?? null,
              texto: (snap.body?.text ?? snap.body ?? null)?.toString().slice(0, 700) ?? null,
              cta: snap.cta_text ?? null,
              inicio: ini ? new Date((Number(ini) < 1e12 ? Number(ini) * 1000 : Number(ini)) || Date.parse(ini)).toISOString() : null,
              video: snap.videos?.[0]?.video_hd_url ?? snap.videos?.[0]?.video_sd_url ?? snap.cards?.[0]?.video_hd_url ?? null,
              thumb: snap.videos?.[0]?.video_preview_image_url ?? snap.images?.[0]?.original_image_url ?? snap.cards?.[0]?.original_image_url ?? null,
              urlBiblioteca: `https://www.facebook.com/ads/library/?id=${id}`,
            });
          }
        }
      })
      .catch(() => {});
  });
  try {
    await page.goto(urlPagina(o.paginaId), { waitUntil: "domcontentloaded", timeout: 40000 });
    await sleep(2500);
    // Páginas pequenas trazem os anúncios no HTML inicial, sem GraphQL.
    const blobs = await page
      .evaluate(() =>
        [...document.querySelectorAll('script[type="application/json"]')]
          .map((x) => x.textContent ?? "")
          .filter((t) => t.includes("ad_archive_id")),
      )
      .catch(() => []);
    for (const b of blobs) {
      for (const payload of parseGraphqlBodies(b)) {
        for (const node of deepCollect(payload, isAdNode)) {
          const id = node.ad_archive_id ?? node.adArchiveID;
          if (!id || vistos.has(id)) continue;
          vistos.add(id);
          const snap = node.snapshot ?? {};
          const link = snap.link_url ?? snap.cards?.[0]?.link_url ?? null;
          const k = chaveDestino(link);
          if (k) destinos.set(k, (destinos.get(k) ?? 0) + 1);
          anunciosDaPagina.push({
            id,
            destino: k,
            link,
            titulo: snap.title ?? null,
            texto: (snap.body?.text ?? snap.body ?? null)?.toString().slice(0, 700) ?? null,
            cta: snap.cta_text ?? null,
            inicio: null,
            video: snap.videos?.[0]?.video_hd_url ?? snap.cards?.[0]?.video_hd_url ?? null,
            thumb: snap.videos?.[0]?.video_preview_image_url ?? snap.images?.[0]?.original_image_url ?? null,
            urlBiblioteca: `https://www.facebook.com/ads/library/?id=${id}`,
          });
        }
      }
    }

    // Rola pra ver todos os anúncios da página (até ~120) — no PC não custa banda paga.
    for (let r = 0; r < 12 && vistos.size < 120; r++) {
      const antes = vistos.size;
      await page.mouse.wheel(0, 4000).catch(() => {});
      await sleep(900);
      if (vistos.size === antes && r > 2) break;
    }
    const textos = await page
      .evaluate(() => [...document.querySelectorAll('[role="heading"], h1, h2, h3, h4')].map((h) => h.textContent ?? ""))
      .catch(() => []);
    let total = null;
    for (const t of textos) {
      const m = t.match(/~?\s*([\d.,]+)\s*(mil)?\s*(resultados?|results?)/i);
      if (m) {
        let n = Number(m[1].replace(/\./g, "").replace(",", "."));
        if (m[2]) n *= 1000;
        if (Number.isFinite(n)) {
          total = Math.round(n);
          break;
        }
      }
    }
    totais.set(o.paginaId, total ?? (vistos.size || null));
    porDestino.set(o.paginaId, destinos);
    // Dossiê da página: o agente usa isso pra montar o card na oferta certa
    // (a que tem mais criativos), com texto e criativo de verdade.
    const pastaPaginas = join(ROOT, "data/raw", rel.data ?? "", "paginas");
    mkdirSync(pastaPaginas, { recursive: true });
    writeFileSync(
      join(pastaPaginas, `${o.paginaId}.json`),
      JSON.stringify(
        {
          pagina: o.pagina,
          paginaId: o.paginaId,
          anunciosNaPagina: total ?? vistos.size,
          anunciosVistos: vistos.size,
          porDestino: [...destinos.entries()].map(([destino, criativos]) => ({ destino, criativos })).sort((a, b) => b.criativos - a.criativos),
          anuncios: anunciosDaPagina,
        },
        null,
        2,
      ),
    );
    const topo = [...destinos.entries()].sort((a, b) => b[1] - a[1])[0];
    log("pagina", { anunciante: o.pagina, anunciosNaPagina: total ?? vistos.size, anunciosVistos: vistos.size, ofertaTopo: topo ? `${topo[0]} (${topo[1]})` : "—" });
  } catch (e) {
    log("pagina_erro", { anunciante: o.pagina, erro: String(e?.message ?? e).split("\n")[0] });
  } finally {
    await page.close().catch(() => {});
  }
  await sleep(2000 + Math.floor(Math.random() * 2000));
}

/**
 * Segue o link de venda até o destino final usando o próprio navegador (muitas
 * páginas de venda bloqueiam requisição simples com 406, e algumas só redirecionam
 * via JS). Link de domínio próprio que leva ao WhatsApp — comum em oferta de R$ 1 —
 * não serve pra modelar página de vendas, então o agente precisa saber.
 */
const ehWhats = (h) => /(^|\.)wa\.me$|whatsapp\.com|api\.whatsapp|chat\.whatsapp/i.test(h);
const ehSocial = (h) => /instagram\.com|messenger\.com|m\.me|t\.me|telegram\.me/i.test(h);

async function destinoFinal(url) {
  if (!url) return null;
  try {
    if (ehWhats(new URL(url).hostname)) return "whatsapp";
  } catch {
    return null;
  }
  const page = await context.newPage();
  await page.route("**/*", (r) => (["image", "media", "font"].includes(r.request().resourceType()) ? r.abort() : r.continue()));
  try {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
    await sleep(3000); // dá tempo de um redirect por JS acontecer
    const host = new URL(page.url()).hostname;
    if (ehWhats(host)) return "whatsapp";
    if (ehSocial(host)) return "social";
    // Página que abre: o botão principal leva pra onde?
    const info = await page
      .evaluate(() => {
        const hrefs = [...document.querySelectorAll("a[href]")].map((a) => a.href);
        const whats = hrefs.filter((h) => /wa\.me|whatsapp\.com/i.test(h)).length;
        const checkout = hrefs.filter((h) => /hotmart|kiwify|braip|monetizze|pay\.|checkout|cakto|ticto|perfectpay/i.test(h)).length;
        return { total: hrefs.length, whats, checkout, temForm: !!document.querySelector("form") };
      })
      .catch(() => null);
    if (info && info.whats > 0 && info.checkout === 0 && !info.temForm) return "whatsapp";
    return "pagina";
  } catch {
    return null; // não deu pra checar: o agente decide pelo link mesmo
  } finally {
    await page.close().catch(() => {});
  }
}

let atualizados = 0;
for (const n of rel.nichos ?? []) {
  for (const o of n.ofertas ?? []) {
    const t = totais.get(o.paginaId);
    if (t != null) {
      o.anunciosNaPagina = t;
      atualizados++;
    }
    // Criativos DESTA oferta: quantos anúncios da página levam ao mesmo destino.
    const destinos = porDestino.get(o.paginaId);
    if (destinos && destinos.size) {
      const k = chaveDestino(o.linkVenda);
      const n = k ? destinos.get(k) : null;
      if (n != null) o.criativosDaOferta = Math.max(n, o.criativosDaOferta ?? 0);
      const topo = [...destinos.entries()].sort((a, b) => b[1] - a[1])[0];
      o.ofertaDominante = topo ? { destino: topo[0], criativos: topo[1] } : null;
    }
    o.destinoFinal = await destinoFinal(o.linkVenda);
    if (o.destinoFinal && o.destinoFinal !== "pagina") {
      log("destino_suspeito", { anunciante: o.pagina, destinoFinal: o.destinoFinal });
    }
  }
}
writeFileSync(jsonPath, JSON.stringify(rel, null, 2));
await context.close().catch(() => {});

const MIN_CRIATIVOS = Number(process.env.MIN_CRIATIVOS ?? 15);
const fracos = (rel.nichos ?? []).flatMap((n) => n.ofertas ?? []).filter((o) => (o.criativosDaOferta ?? 0) < MIN_CRIATIVOS);
const fora = (rel.nichos ?? []).flatMap((n) => n.ofertas ?? []).filter((o) => o.destinoFinal && o.destinoFinal !== "pagina");
console.log(`\n${atualizados} card(s) com "anúncios na página" preenchido.`);
if (fora.length) {
  console.log(`⚠ ${fora.length} oferta(s) NÃO levam a página de vendas: ${fora.map((o) => `${o.pagina} (${o.destinoFinal})`).join(", ")}`);
  console.log(`  Troque cada uma por outra do mesmo nicho e rode este script de novo.`);
}
if (fracos.length) {
  console.log(`⚠ ${fracos.length} oferta(s) com menos de ${MIN_CRIATIVOS} criativos: ${fracos.map((o) => `${o.pagina} (${o.criativosDaOferta ?? 0})`).join(", ")}`);
  console.log(`  Troque por outra do nicho. Dica: o campo "ofertaDominante" de cada card mostra qual oferta daquela página tem mais criativos.`);
}
console.log(`Agora rode o render-relatorio.mjs.`);
