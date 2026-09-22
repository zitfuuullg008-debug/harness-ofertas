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
import { existsSync, readFileSync, writeFileSync } from "node:fs";
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
for (const o of alvos) {
  const page = await context.newPage();
  await page.route("**/*", (r) => (["image", "media", "font"].includes(r.request().resourceType()) ? r.abort() : r.continue()));
  try {
    await page.goto(urlPagina(o.paginaId), { waitUntil: "domcontentloaded", timeout: 40000 });
    await sleep(2500);
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
    totais.set(o.paginaId, total);
    log("pagina", { anunciante: o.pagina, anunciosNaPagina: total ?? "não achou" });
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
    o.destinoFinal = await destinoFinal(o.linkVenda);
    if (o.destinoFinal && o.destinoFinal !== "pagina") {
      log("destino_suspeito", { anunciante: o.pagina, destinoFinal: o.destinoFinal });
    }
  }
}
writeFileSync(jsonPath, JSON.stringify(rel, null, 2));
await context.close().catch(() => {});

const fora = (rel.nichos ?? []).flatMap((n) => n.ofertas ?? []).filter((o) => o.destinoFinal && o.destinoFinal !== "pagina");
console.log(`\n${atualizados} card(s) com "anúncios na página" preenchido.`);
if (fora.length) {
  console.log(`⚠ ${fora.length} oferta(s) NÃO levam a página de vendas: ${fora.map((o) => `${o.pagina} (${o.destinoFinal})`).join(", ")}`);
  console.log(`  Troque cada uma por outra do mesmo nicho e rode este script de novo.`);
}
console.log(`Agora rode o render-relatorio.mjs.`);
