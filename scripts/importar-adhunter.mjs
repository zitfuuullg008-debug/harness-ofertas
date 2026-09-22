#!/usr/bin/env node
/**
 * importar-adhunter.mjs — traz pro harness as ofertas que o Ad Hunter já minerou.
 *
 * Por que existe: o Ad Hunter (C:\Users\maria\Desktop\ad-hunter) já roda com
 * proxy residencial, já tem as categorias configuradas, já filtra low-ticket com
 * IA e já exclui destino WhatsApp. Ele guarda o resultado de cada categoria na
 * tabela `category_scrape_cache` do Supabase. Então aqui a gente só LÊ esse
 * cache — zero scraping, zero proxy, zero risco de bloqueio.
 *
 * Fluxo: você roda o Ad Hunter ~2x por semana (atualiza as categorias) e o
 * harness lê o cache todo dia pra montar o relatório.
 *
 * Uso:
 *   node scripts/importar-adhunter.mjs              # importa tudo que está no cache
 *   node scripts/importar-adhunter.mjs --maxDias 7  # ignora cache mais velho que 7 dias
 *
 * Credenciais: lê SUPABASE_URL/SUPABASE_ANON_KEY do .env do Ad Hunter
 * (../ad-hunter/.env) ou do ambiente. Nada é copiado pra este repositório.
 *
 * Saída: data/raw/<AAAA-MM-DD>/{<nicho>.json, resumo.json} — mesmo formato que o
 * scraper próprio gerava, então o agente minerador não muda em nada.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const opt = (n, f) => {
  const i = args.indexOf(n);
  return i >= 0 && args[i + 1] ? args[i + 1] : f;
};
const maxDias = Number(opt("--maxDias", 10));
const hoje = new Date().toISOString().slice(0, 10);
const outDir = join(ROOT, "data/raw", hoje);

// Categoria do Ad Hunter -> nicho daqui. O que não está aqui é ignorado
// ("whatsapp" é a categoria de destino WhatsApp; "fitness" é nicho black).
const MAPA = {
  receitas: { id: "receitas", nome: "Receitas", prioridade: 1 },
  renda_extra: { id: "renda_extra", nome: "Renda extra", prioridade: 1 },
  familia_maternidade: { id: "maternidade", nome: "Maternidade e educação infantil", prioridade: 1 },
  espiritualidade: { id: "cristao", nome: "Cristão / Espiritualidade", prioridade: 3 },
};

function credenciais() {
  let url = process.env.SUPABASE_URL;
  let key = process.env.SUPABASE_ANON_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    const envAdHunter = process.env.ADHUNTER_ENV ?? resolve(ROOT, "..", "ad-hunter", ".env");
    if (existsSync(envAdHunter)) {
      for (const linha of readFileSync(envAdHunter, "utf8").split(/\r?\n/)) {
        const m = linha.match(/^(SUPABASE_URL|SUPABASE_ANON_KEY|SUPABASE_SERVICE_ROLE_KEY)=(.*)$/);
        if (!m) continue;
        const v = m[2].trim().replace(/^["']|["']$/g, "");
        if (m[1] === "SUPABASE_URL") url ??= v;
        else key ??= v;
      }
    }
  }
  if (!url || !key) {
    console.error("Não achei SUPABASE_URL/SUPABASE_ANON_KEY. Defina no ambiente ou deixe o .env do Ad Hunter em ../ad-hunter/.env");
    process.exit(1);
  }
  return { url: url.replace(/\/+$/, ""), key };
}

const { url, key } = credenciais();
const resposta = await fetch(`${url}/rest/v1/category_scrape_cache?select=category,fetched_at,response`, {
  headers: { apikey: key, Authorization: `Bearer ${key}` },
});
if (!resposta.ok) {
  console.error(`Supabase respondeu ${resposta.status}. Confira as credenciais do Ad Hunter.`);
  process.exit(1);
}
const linhas = await resposta.json();

const diasAtras = (iso) => Math.floor((Date.now() - Date.parse(iso)) / 86400000);

/** Normaliza o destino pra agrupar anúncios da MESMA oferta. */
function chaveOferta(link) {
  if (!link) return null;
  try {
    const u = new URL(link);
    if (u.hostname === "l.facebook.com" && u.searchParams.get("u")) return chaveOferta(u.searchParams.get("u"));
    if (/whatsapp|wa\.me/.test(u.hostname)) return `wa:${u.searchParams.get("phone") ?? u.pathname.replace(/\D/g, "")}`;
    return `${u.hostname.replace(/^www\./, "")}${u.pathname.replace(/\/+$/, "")}`.toLowerCase();
  } catch {
    return String(link).slice(0, 80);
  }
}

const dias = (iso) => (iso ? Math.max(0, Math.round((Date.now() - Date.parse(iso)) / 86400000)) : null);

mkdirSync(outDir, { recursive: true });
const vistosPath = join(ROOT, "data/vistos.json");
const vistos = existsSync(vistosPath) ? JSON.parse(readFileSync(vistosPath, "utf8")) : { paginas: {}, ofertas: {} };
vistos.ofertas ??= {};
vistos.paginas ??= {};

const resumo = { data: hoje, geradoEm: new Date().toISOString(), fonte: "ad-hunter", nichos: [] };
let totalOfertas = 0;

for (const linha of linhas) {
  const alvo = MAPA[linha.category];
  if (!alvo) continue;
  const idade = diasAtras(linha.fetched_at);
  if (idade > maxDias) {
    console.log(`  ${linha.category}: cache de ${idade} dias — ignorado (rode o Ad Hunter pra atualizar)`);
    continue;
  }

  // Agrupa todos os anúncios da categoria por oferta (página + destino).
  const porOferta = new Map();
  for (const bloco of linha.response?.results ?? []) {
    for (const item of bloco.results ?? []) {
      const ad = item.ad ?? {};
      const pg = item.page ?? {};
      const link = ad.linkUrl ?? ad.creatives?.[0]?.linkUrl ?? null;
      const chave = `${pg.id ?? pg.name}|${chaveOferta(link)}`;
      if (!porOferta.has(chave)) porOferta.set(chave, { pagina: pg, link, ads: [], keywords: new Set() });
      const g = porOferta.get(chave);
      g.ads.push(ad);
      if (bloco.keyword) g.keywords.add(bloco.keyword);
    }
  }

  const ofertas = [...porOferta.values()]
    .map(({ pagina, link, ads, keywords }) => {
      const principal = [...ads].sort((a, b) => Date.parse(a.startDate ?? 0) - Date.parse(b.startDate ?? 0))[0];
      return {
        chave: chaveOferta(link),
        link,
        pagina: {
          ...pagina,
          anunciosNaPagina: pagina.totalAdsCount ?? pagina.observedAdsInBatch ?? null,
          fonteContagem: pagina.totalAdsCount != null ? "ad_hunter" : "observado",
        },
        criativosNoLote: ads.length,
        // O Ad Hunter conta quantos anúncios do lote usam o mesmo criativo.
        criativosDaOferta: Math.max(ads.length, pagina.sameCreativeAdsInBatch ?? 0),
        diasAtivoMediana: dias(principal?.startDate),
        diasAtivoMax: Math.max(0, ...ads.map((a) => dias(a.startDate) ?? 0)),
        keywords: [...keywords],
        principal,
        ads,
      };
    })
    .sort((a, b) => (b.pagina.anunciosNaPagina ?? 0) - (a.pagina.anunciosNaPagina ?? 0) || b.criativosDaOferta - a.criativosDaOferta);

  const nicho = { id: alvo.id, nome: alvo.nome, keywords: (linha.response?.keywords ?? []).map((k) => ({ keyword: k.keyword })) };
  writeFileSync(
    join(outDir, `${alvo.id}.json`),
    JSON.stringify(
      {
        nicho,
        fonte: "ad-hunter",
        categoriaAdHunter: linha.category,
        coletadoEm: linha.fetched_at,
        idadeEmDias: idade,
        totalAnuncios: ofertas.reduce((s, o) => s + o.ads.length, 0),
        totalOfertas: ofertas.length,
        ofertas: ofertas.map((o) => ({
          ...o,
          principal: {
            id: o.principal?.adArchiveId,
            titulo: o.principal?.title ?? null,
            texto: o.principal?.bodyText ?? null,
            cta: o.principal?.ctaText ?? null,
            link: o.link,
            criativos: (o.principal?.creatives ?? []).map((c) => ({
              tipo: c.type,
              imagem: c.imageUrl,
              video: c.videoUrl,
              thumb: c.videoPreviewImageUrl,
              link: c.linkUrl,
            })),
            diasAtivo: dias(o.principal?.startDate),
            urlBiblioteca: o.principal?.adLibraryUrl,
          },
        })),
      },
      null,
      2,
    ),
  );

  const top = ofertas.slice(0, 12);
  resumo.nichos.push({
    id: alvo.id,
    nome: alvo.nome,
    prioridade: alvo.prioridade,
    fonte: "ad-hunter",
    coletadoEm: linha.fetched_at,
    idadeEmDias: idade,
    totalAnuncios: ofertas.reduce((s, o) => s + o.ads.length, 0),
    totalOfertas: ofertas.length,
    top: top.map((o) => {
      const pid = o.pagina.id ?? o.pagina.name;
      const ok = `${pid}|${o.chave}`;
      const jaVisto = vistos.ofertas[ok];
      const novoHoje = !jaVisto || jaVisto.ultimaVez !== hoje;
      vistos.ofertas[ok] = {
        pagina: o.pagina.name,
        link: o.link,
        primeiraVez: jaVisto?.primeiraVez ?? hoje,
        ultimaVez: hoje,
        vezes: (jaVisto?.vezes ?? 0) + (novoHoje ? 1 : 0),
      };
      vistos.paginas[pid] = { nome: o.pagina.name, primeiraVez: vistos.paginas[pid]?.primeiraVez ?? hoje, ultimaVez: hoje };
      return {
        pagina: o.pagina.name,
        paginaId: o.pagina.id,
        instagram: o.pagina.instagramUrl,
        oferta: { chave: o.chave, link: o.link },
        novo: !jaVisto || jaVisto.primeiraVez === hoje,
        vezesVisto: vistos.ofertas[ok].vezes,
        sinais: {
          anunciosNaPagina: o.pagina.anunciosNaPagina,
          fonteContagem: o.pagina.fonteContagem,
          criativosDaOferta: o.criativosDaOferta,
          criativosNoLote: o.criativosNoLote,
          diasAtivoMediana: o.diasAtivoMediana,
          diasAtivoMax: o.diasAtivoMax,
          curtidasPagina: o.pagina.likes ?? null,
          seguidoresIg: o.pagina.instagramFollowers ?? null,
        },
        keywordsOndeApareceu: o.keywords,
        anuncioPrincipal: {
          id: o.principal?.adArchiveId,
          titulo: o.principal?.title,
          texto: (o.principal?.bodyText ?? "").slice(0, 900),
          cta: o.principal?.ctaText,
          link: o.link,
          tipoCriativo: o.principal?.creatives?.[0]?.type ?? "?",
          video: o.principal?.creatives?.[0]?.videoUrl ?? null,
          imagem: o.principal?.creatives?.[0]?.imageUrl ?? o.principal?.creatives?.[0]?.videoPreviewImageUrl ?? null,
          diasAtivo: dias(o.principal?.startDate),
          urlBiblioteca: o.principal?.adLibraryUrl,
        },
        outrosTextos: o.ads
          .filter((a) => a.adArchiveId !== o.principal?.adArchiveId && a.bodyText)
          .slice(0, 3)
          .map((a) => a.bodyText.slice(0, 300)),
      };
    }),
  });
  totalOfertas += ofertas.length;
  console.log(`  ${alvo.id.padEnd(14)} ${String(ofertas.length).padStart(3)} ofertas · coleta de ${idade}d atrás (${linha.category})`);
}

resumo.nichos.sort((a, b) => (a.prioridade ?? 9) - (b.prioridade ?? 9));
writeFileSync(join(outDir, "resumo.json"), JSON.stringify(resumo, null, 2));
writeFileSync(vistosPath, JSON.stringify(vistos, null, 2));

console.log(`\n${totalOfertas} ofertas de ${resumo.nichos.length} nichos importadas do Ad Hunter.`);
if (!resumo.nichos.length) console.log("⚠ Nenhum cache recente. Rode as categorias no Ad Hunter e tente de novo.");
console.log(`Arquivos em: ${outDir}`);
