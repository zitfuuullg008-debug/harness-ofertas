#!/usr/bin/env node
/**
 * salvar-no-adhunter.mjs — devolve pro Ad Hunter as ofertas que entraram no
 * relatório, pra elas aparecerem salvas na interface dele.
 *
 * Fecha o ciclo: o Ad Hunter minera → o harness escolhe as melhores → as
 * escolhidas voltam pro Ad Hunter marcadas, com uma nota explicando por quê.
 *
 * Como funciona: o `POST /offers` do Ad Hunter recebe o `resultId` (o id que o
 * scrape dele gerou), procura no `category_scrape_cache` e salva na tabela
 * `offers`. Aqui a gente acha esse resultId pelo `adArchiveId` do card.
 *
 * Uso:
 *   node scripts/salvar-no-adhunter.mjs saidas/mineracao/2026-09-22.json
 *   node scripts/salvar-no-adhunter.mjs saidas/mineracao/2026-09-22.json --so-recomendadas
 *
 * Precisa da API do Ad Hunter no ar (npm run dev na pasta ad-hunter, porta 8080).
 */

import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const jsonPath = resolve(args.find((a) => !a.startsWith("--")) ?? "");
const soRecomendadas = args.includes("--so-recomendadas");
const API = (process.env.ADHUNTER_API ?? "http://localhost:8080").replace(/\/+$/, "");

if (!jsonPath || !existsSync(jsonPath)) {
  console.error("Uso: node scripts/salvar-no-adhunter.mjs saidas/mineracao/<data>.json [--so-recomendadas]");
  process.exit(1);
}

function doEnvDoAdHunter() {
  const env = process.env.ADHUNTER_ENV ?? resolve(ROOT, "..", "ad-hunter", ".env");
  const out = {};
  if (existsSync(env)) {
    for (const linha of readFileSync(env, "utf8").split(/\r?\n/)) {
      const m = linha.match(/^(SUPABASE_URL|SUPABASE_ANON_KEY|SUPABASE_SERVICE_ROLE_KEY|API_KEY)=(.*)$/);
      if (m) out[m[1]] = m[2].trim().replace(/^["']|["']$/g, "");
    }
  }
  return out;
}

const env = doEnvDoAdHunter();
const supaUrl = (process.env.SUPABASE_URL ?? env.SUPABASE_URL ?? "").replace(/\/+$/, "");
const supaKey = process.env.SUPABASE_ANON_KEY ?? env.SUPABASE_ANON_KEY ?? env.SUPABASE_SERVICE_ROLE_KEY;
const apiKey = process.env.ADHUNTER_API_KEY ?? env.API_KEY ?? "";
if (!supaUrl || !supaKey) {
  console.error("Não achei as credenciais do Supabase do Ad Hunter (../ad-hunter/.env).");
  process.exit(1);
}

// Mapa adArchiveId -> resultId, varrendo o cache de todas as categorias.
const r = await fetch(`${supaUrl}/rest/v1/category_scrape_cache?select=category,response`, {
  headers: { apikey: supaKey, Authorization: `Bearer ${supaKey}` },
});
if (!r.ok) {
  console.error(`Supabase respondeu ${r.status}.`);
  process.exit(1);
}
const porAdId = new Map();
const porPagina = new Map(); // fallback: qualquer anúncio da mesma página serve pra marcar a oferta
for (const linha of await r.json()) {
  for (const bloco of linha.response?.results ?? []) {
    for (const item of bloco.results ?? []) {
      const adId = item.ad?.adArchiveId;
      const pid = item.page?.id;
      const ref = { resultId: item.id, categoria: linha.category, link: item.ad?.linkUrl ?? null };
      if (adId && item.id) porAdId.set(String(adId), ref);
      if (pid && item.id && !porPagina.has(String(pid))) porPagina.set(String(pid), []);
      if (pid && item.id) porPagina.get(String(pid)).push(ref);
    }
  }
}

/** Normaliza o destino pra casar o card com o anúncio certo da mesma página. */
function chaveDestino(link) {
  if (!link) return null;
  try {
    const u = new URL(link);
    return `${u.hostname.replace(/^www\./, "")}${u.pathname.replace(/\/+$/, "")}`.toLowerCase();
  } catch {
    return null;
  }
}

const rel = JSON.parse(readFileSync(jsonPath, "utf8"));
let cards = (rel.nichos ?? []).flatMap((n) => (n.ofertas ?? []).map((o) => ({ ...o, nicho: n.nome })));
if (soRecomendadas) cards = cards.filter((o) => o.recomendada);
if (!cards.length) {
  console.log("Nenhuma oferta pra salvar.");
  process.exit(0);
}

let salvas = 0;
let semResultId = 0;
for (const o of cards) {
  // 1) pelo anúncio exato; 2) por outro anúncio da mesma página com o mesmo
  // destino (o agente troca o card pela oferta dominante); 3) qualquer um da página.
  let achado = porAdId.get(String(o.adId));
  let via = "anúncio";
  if (!achado && o.paginaId) {
    const daPagina = porPagina.get(String(o.paginaId)) ?? [];
    const alvo = chaveDestino(o.linkVenda);
    achado = daPagina.find((x) => alvo && chaveDestino(x.link) === alvo);
    via = achado ? "mesma oferta" : via;
    if (!achado && daPagina.length) {
      achado = daPagina[0];
      via = "mesma página";
    }
  }
  if (!achado) {
    console.log(`  ⚠ ${o.pagina}: não achei no cache do Ad Hunter — rode essa categoria lá.`);
    semResultId++;
    continue;
  }
  const nota = [
    o.recomendada ? "★ RECOMENDADA pelo harness" : "Selecionada pelo harness",
    `${rel.data}`,
    o.produto ? `Produto: ${o.produto}` : null,
    o.criativosDaOferta ? `${o.criativosDaOferta} criativos na oferta` : null,
    o.anunciosNaPagina ? `${o.anunciosNaPagina} anúncios na página` : null,
    o.porqueRecomendada ? `Por que modelar: ${o.porqueRecomendada}` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  const resp = await fetch(`${API}/offers`, {
    method: "POST",
    headers: { "content-type": "application/json", ...(apiKey ? { "X-Api-Key": apiKey } : {}) },
    body: JSON.stringify({ resultId: achado.resultId, notes: nota.slice(0, 2000) }),
  }).catch((e) => ({ ok: false, status: 0, text: async () => String(e.message) }));

  if (resp.ok) {
    console.log(`  ✓ ${o.pagina}${o.recomendada ? " ★" : ""} → ${achado.categoria} (via ${via})`);
    salvas++;
  } else {
    const corpo = await resp.text().catch(() => "");
    console.log(`  ✗ ${o.pagina}: ${resp.status} ${corpo.slice(0, 120)}`);
  }
}

console.log(`\n${salvas} de ${cards.length} oferta(s) salvas no Ad Hunter.`);
if (semResultId) console.log(`${semResultId} sem correspondência no cache (normal se o Ad Hunter rodou de novo depois do relatório).`);
if (!salvas) console.log(`A API do Ad Hunter está no ar? (npm run dev em ../ad-hunter, porta 8080)`);
