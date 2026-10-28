#!/usr/bin/env node
/**
 * lancar.mjs — ferramenta das Paradas 9 a 12 do /modelar (página no ar e campanha no Facebook).
 * NÃO cria nada em checkout nenhum (ordem dela, 27/10/2026): produto, checkout, preço, entrega e pixel no
 * checkout ela cria à mão no Atomify e passa o link. Este script só publica página/app e fala com a Meta.
 *
 *   node scripts/lancar.mjs saidas/modelagem/<pasta> --checkout <URL> [--produto <ID>] [--slug <nome>] [--croche] [--ensaio]
 *      PÁGINA E APP: monta a página (04-pagina.html) com o link do checkout nos botões e o rastreador do Atomify
 *      (--produto = id do produto no Atomify), pega o app (app-*.html) e publica os dois no projeto "paginas".
 *      Endereço: <slug>.revitamulher.online (crochê: croche.revitamulher.online/<slug>); app = página + /app.
 *      --ensaio mostra o que mudaria, sem gravar nem publicar. Rodar de novo = atualizar.
 *
 *   node scripts/lancar.mjs saidas/modelagem/<pasta> --contas
 *      Lista as contas de anúncio que os tokens do .env.meta alcançam (a do amigo fica de fora). Só leitura.
 *
 *   node scripts/lancar.mjs saidas/modelagem/<pasta> --campanha --conta <ID> --pixel-id <ID> --criativos "<pasta>"
 *        --orcamento <valor na moeda da conta> [--pagina <PAGE_ID> --ig <IG_ID>] [--modelo-cj <ADSET_ID>]
 *        [--nome "..."] [--link <URL>] [--criar]
 *      Sem --criar: só confere (leituras na Meta) e mostra o que seria enviado.
 *      Com --criar: sobe vídeos/imagens direto na conta, espera os vídeos processarem e cria campanha, conjunto
 *      e anúncios com os textos de <pasta>/anuncios.json. A campanha nasce PAUSADA; quem liga é ela.
 *
 * Guarda o progresso em <pasta>/lancamento.json (não sobe o mesmo criativo duas vezes).
 * Token da Meta: .env.meta (fora do git; nunca mostrar).
 */

import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { basename, dirname, extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { RASTREADOR, copiarArquivos, diferencas, noAr, prepararPagina, publicarPaginas, sha } from "./publicar-paginas.mjs";

const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const flag = (n) => args.includes(`--${n}`);
const opt = (n) => { const i = args.indexOf(`--${n}`); return i >= 0 ? args[i + 1] : undefined; };
const COM_VALOR = new Set(["conta", "pixel-id", "criativos", "orcamento", "pagina", "ig", "modelo-cj", "nome", "slug", "checkout", "produto", "link"]);
const pasta = resolve(args.find((a, i) => !a.startsWith("--") && !(i > 0 && COM_VALOR.has(args[i - 1].slice(2)))) ?? "");
if (!["04-pagina.html", "02-concepcao.md", "ficha-hotmart.md"].some((n) => existsSync(join(pasta, n)))) {
  console.error("Uso: node scripts/lancar.mjs saidas/modelagem/<pasta> [--checkout URL --produto ID | --contas | --campanha --conta ID --pixel-id ID --criativos <pasta> --orcamento N]");
  process.exit(1);
}
for (const velho of ["pixel", "usar"]) {
  if (flag(velho)) { console.error(`--${velho} saiu (27/10/2026): o pixel ela cria no Facebook e põe no checkout à mão. Na campanha, use --pixel-id <ID>.`); process.exit(1); }
}

const ESTADO = join(pasta, "lancamento.json");
const estado = existsSync(ESTADO) ? JSON.parse(readFileSync(ESTADO, "utf8")) : {};
const salvar = () => writeFileSync(ESTADO, JSON.stringify(estado, null, 2));
const achar = (re) => readdirSync(pasta).filter((n) => re.test(n)).map((n) => join(pasta, n))[0];
const slugPadrao = () => opt("slug") ?? estado.slug ?? basename(pasta).replace(/^\d{4}-\d{2}-\d{2}-/, "");
const nomeProduto = () => {
  const f = join(pasta, "ficha-hotmart.md");
  return (existsSync(f) && readFileSync(f, "utf8").match(/\*\*Nome do produto:\*\*\s*(.+)/)?.[1]?.trim()) || slugPadrao().replace(/-/g, " ");
};

// ---------- etapa padrão: página e app no projeto "paginas" ----------
async function etapaPagina() {
  const ensaio = flag("ensaio");
  const slug = slugPadrao();
  if (!/^[a-z0-9][a-z0-9-]{1,60}$/.test(slug)) throw new Error(`slug inválido: "${slug}" (letras minúsculas, números e hífen; use --slug)`);
  const croche = flag("croche") || /croche/i.test(basename(pasta)) || estado.croche === true;
  const pagina = join(pasta, "04-pagina.html");
  const app = achar(/^app-.*\.html$/i);
  if (!existsSync(pagina) && !app) throw new Error("não achei 04-pagina.html nem app-*.html na pasta");

  // não pisar na página de outra oferta que já usa esse nome
  if (noAr(slug) !== null && estado.slug !== slug && !flag("substituir")) {
    throw new Error(`já existe uma página "${slug}" no projeto paginas, de outra oferta. Escolha outro --slug (ou --substituir, se for ela mesma).`);
  }

  const checkout = opt("checkout") ?? estado.checkoutLink;
  if (checkout && !/^https:\/\/\S+$/.test(checkout)) throw new Error("o --checkout precisa ser um link começando com https://");
  const produto = opt("produto") ?? estado.produtoAtomify;
  if (produto && !/^[a-z0-9]{10,40}$/i.test(produto)) throw new Error("o --produto é o id do produto no Atomify (letras e números)");
  const tracker = produto ? `${RASTREADOR}?p=${produto}` : null;

  const base = croche ? `https://croche.revitamulher.online/${slug}` : `https://${slug}.revitamulher.online`;
  const arquivos = {};
  const avisos = [];
  console.log(`Oferta: ${nomeProduto()}  (slug ${slug}${croche ? ", crochê" : ""})`);

  if (existsSync(pagina)) {
    const p = prepararPagina(readFileSync(pagina, "utf8"), checkout, tracker);
    const { html, copiados } = await copiarArquivos(p.html, ensaio);
    arquivos[slug] = html;
    console.log(`  página: 04-pagina.html  (${p.trocados} botão(ões) com o link do checkout)`);
    if (p.semLink) throw new Error(`a página tem ${p.semLink} botão(ões) sem link de checkout ({{CHECKOUT}} ou Hotmart). Rode com --checkout <link do checkout do Atomify>.`);
    if (!checkout && !p.trocados) avisos.push("sem --checkout: os botões ficaram com o link que já estava escrito na página");
    if (/revitamulher\.online\/pay\//.test(html)) avisos.push("a página aponta para o checkout ANTIGO (pagamento.revitamulher.online/pay/...)");
    if (!p.rastreado) avisos.push("SEM RASTREADOR: sem --produto <id do produto no Atomify> a página não tem o t.js, então o Pixel não dispara e as vendas não saem com campanha");
    if (p.sobras) avisos.push(`${p.sobras} marcador(es) {{...}} sobrando na página (imagem faltando?)`);
    if (p.hotmart) avisos.push(`a página ainda fala "Hotmart" ${p.hotmart} vez(es) no texto — troque por "checkout seguro" e rode de novo`);
    if (copiados.length) console.log(`  ${copiados.length} imagem(ns) do Storage antigo copiada(s) para /arquivos`);
  }
  if (app) {
    arquivos[`${slug}/app`] = readFileSync(app, "utf8");
    console.log(`  app: ${basename(app)}`);
  }

  // o que muda em relação ao que já está no projeto "paginas"
  let mudou = false;
  for (const [caminho, html] of Object.entries(arquivos)) {
    const d = diferencas(noAr(caminho), html);
    if (d.novo) { mudou = true; console.log(`  p/${caminho}: arquivo novo`); continue; }
    if (!d.entram.length && !d.saem.length) { console.log(`  p/${caminho}: igual ao que está no ar`); continue; }
    mudou = true;
    console.log(`  p/${caminho}: ${d.saem.length} linha(s) saem, ${d.entram.length} entram`);
    const curto = (l) => (l.trim().length > 150 ? l.trim().slice(0, 150) + "…" : l.trim());
    for (const l of d.saem.slice(0, 8)) console.log(`     - ${curto(l)}`);
    for (const l of d.entram.slice(0, 8)) console.log(`     + ${curto(l)}`);
  }
  for (const a of avisos) console.log(`  ATENÇÃO: ${a}`);

  if (ensaio) { console.log("\nEnsaio: nada foi gravado nem publicado."); return; }
  if (mudou) publicarPaginas(slug, arquivos);
  else console.log("\nNada mudou; não publiquei de novo.");

  Object.assign(estado, {
    slug, croche, pagina: base, app: arquivos[`${slug}/app`] ? `${base}/app` : estado.app,
    ...(checkout ? { checkoutLink: checkout } : {}), ...(produto ? { produtoAtomify: produto } : {}),
    publicadoEm: new Date().toISOString(),
  });
  salvar();

  if (!croche) await ligarSubdominio(`${slug}.revitamulher.online`);
  if (mudou) await conferirNoAr(base, arquivos[slug], arquivos[`${slug}/app`]);

  console.log(`\nPágina: ${base}`);
  if (arquivos[`${slug}/app`]) console.log(`App:    ${base}/app   ← este é o link de acesso (entrega) para pôr no produto do Atomify, à mão`);
}

// confere que o endereço público devolve exatamente o arquivo publicado
async function conferirNoAr(base, pagina, app) {
  for (const [url, html] of [[base, pagina], [`${base}/app`, app]]) {
    if (!html) continue;
    let ok = false, status = 0;
    for (let i = 0; i < 6 && !ok; i++) {
      if (i) await new Promise((r) => setTimeout(r, 10_000));
      const res = await fetch(`${url}?v=${Date.now()}`, { signal: AbortSignal.timeout(30_000) }).catch(() => null);
      status = res?.status ?? 0;
      ok = Boolean(res?.ok) && sha(await res.text()) === sha(html);
    }
    console.log(ok ? `  conferido no ar: ${url}` : `  ATENÇÃO: ${url} ainda não mostra o arquivo novo (status ${status || "sem resposta"})`);
  }
}

// ---------- subdomínio do produto na Vercel (14/10/2026) ----------
// Cada produto (fora crochê) tem a página em <slug>.revitamulher.online, servida pelo projeto "paginas" da Vercel.
// Aqui o nome entra no projeto "paginas", com o token do Vercel CLI já logado neste PC,
// e sai o CNAME exato que ela cria no DNS do revitamulher.online.
const VERCEL_PROJETO = "prj_UMFmyvT35YABKW2vvbUQqcvpbCrk";
const VERCEL_TIME = "team_3w4qc7WQ9v8EYIPLY0OniGUw";
const CNAME_PADRAO = "6d24bd65ded35237.vercel-dns-017.com";
async function ligarSubdominio(host) {
  if (!host.endsWith(".revitamulher.online") || /^(pagamento|painel|oferta|info|www|croche)\./.test(host)) return;
  const sub = host.slice(0, -".revitamulher.online".length);
  const authArq = join(process.env.APPDATA ?? "", "com.vercel.cli", "Data", "auth.json");
  const token = existsSync(authArq) ? JSON.parse(readFileSync(authArq, "utf8")).token : process.env.VERCEL_TOKEN;
  if (!token) { console.log(`\nATENÇÃO: sem login do Vercel CLI; cadastre ${host} no projeto paginas (npx vercel domains add ${host} paginas).`); return; }
  const h = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
  const add = await fetch(`https://api.vercel.com/v10/projects/${VERCEL_PROJETO}/domains?teamId=${VERCEL_TIME}`, { method: "POST", headers: h, body: JSON.stringify({ name: host }) });
  const j = await add.json().catch(() => ({}));
  if (!add.ok && j.error?.code !== "domain_already_in_use" && !/already/i.test(j.error?.message ?? "")) {
    console.log(`\nATENÇÃO: a Vercel recusou ${host}: ${j.error?.message ?? add.status}`); return;
  }
  let alvo = CNAME_PADRAO;
  const cfg = await fetch(`https://api.vercel.com/v6/domains/${host}/config?teamId=${VERCEL_TIME}`, { headers: h }).then((x) => x.json()).catch(() => ({}));
  const rec = cfg.recommendedCNAME?.find?.((c) => c.rank === 1)?.value ?? cfg.recommendedCNAME?.[0]?.value;
  if (rec) alvo = rec.replace(/\.$/, "");
  const certo = cfg.misconfigured === false;
  console.log(`\nSubdomínio: ${host} ${certo ? "(DNS já certo)" : "cadastrado no projeto paginas"}`);
  if (!certo) console.log(`  No DNS do revitamulher.online (Adicionar registro): CNAME  nome "${sub}"  valor "${alvo}". Até pegar, a página não abre nesse endereço.`);
}

// ---------- Meta (Graph API direto, com os tokens do .env.meta) ----------
const G = "https://graph.facebook.com/v21.0/";
const BLOQUEADA = /alivi/i; // conta do amigo: nunca entra no lançamento
const pausa = (ms) => new Promise((r) => setTimeout(r, ms));
function tokensMeta() {
  const f = join(RAIZ, ".env.meta");
  if (!existsSync(f)) throw new Error("falta o .env.meta com o token do Facebook");
  const env = Object.fromEntries(readFileSync(f, "utf8").split(/\r?\n/).filter((l) => l.includes("=") && !l.startsWith("#"))
    .map((l) => { const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, "")]; }));
  const t = Object.entries(env).filter(([k, v]) => /^META_TOKEN/.test(k) && v).map(([k, v]) => ({ nome: k.replace("META_TOKEN_", ""), token: v }));
  if (!t.length) throw new Error("nenhum META_TOKEN_* preenchido no .env.meta");
  return t;
}
const limite = (r) => r.error && (r.error.code === 17 || r.error.code === 80004 || /too many calls/i.test(r.error.message || ""));
async function graph(token, metodo, caminho, body) {
  for (let k = 0; ; k++) {
    const o = { method: metodo, headers: { Authorization: "Bearer " + token }, signal: AbortSignal.timeout(600_000) };
    if (body) o.body = body instanceof FormData ? body : new URLSearchParams(Object.entries(body).map(([a, v]) => [a, typeof v === "string" ? v : JSON.stringify(v)]));
    const r = await (await fetch(G + caminho, o)).json();
    if (limite(r) && k < 10) { console.log("  a Meta pediu para esperar (2 min)…"); await pausa(120_000); continue; }
    if (r.error) throw new Error(`${caminho.split("?")[0]}: ${r.error.error_user_title || ""} ${r.error.error_user_msg || r.error.message}`.trim());
    return r;
  }
}
const get = (token, caminho, q = {}) => graph(token, "GET", `${caminho}?${new URLSearchParams(q)}`);

async function todasContas() {
  const contas = new Map();
  for (const { nome, token } of tokensMeta()) {
    let r;
    // o nome da BM (onde aparece a do amigo) só vem com business_management; sem ela, vai só o nome da conta
    try { r = await get(token, "me/adaccounts", { fields: "account_id,name,currency,account_status,business{name}", limit: "200" }); }
    catch {
      try { r = await get(token, "me/adaccounts", { fields: "account_id,name,currency,account_status", limit: "200" }); }
      catch (e) { console.log(`  ATENÇÃO: o token ${nome} não respondeu (${e.message})`); continue; }
    }
    for (const a of r.data ?? []) {
      if (BLOQUEADA.test(`${a.name} ${a.business?.name ?? ""}`) || contas.has(a.account_id)) continue;
      contas.set(a.account_id, { id: a.account_id, nome: a.name, moeda: a.currency, ativa: a.account_status === 1, bm: a.business?.name ?? "", token, portfolio: nome });
    }
  }
  return [...contas.values()];
}

async function etapaContas() {
  const contas = await todasContas();
  for (const a of contas.filter((a) => a.ativa)) console.log(`${a.id}  ${a.nome}  (${a.moeda}${a.bm ? `, ${a.bm}` : ""}, token ${a.portfolio})`);
  const inativas = contas.filter((a) => !a.ativa);
  if (inativas.length) console.log(`\n+ ${inativas.length} conta(s) desativada(s) na Meta: ${inativas.map((a) => a.nome).join(", ")}`);
  console.log("\nPara ver quais servem num produto novo (dólar, nada rodando, com cartão): node scripts/contas-livres.mjs");
}

// UTM padrão dela (igual ao da Utmify)
const UTM = "utm_source=FB&utm_campaign={{campaign.name}}|{{campaign.id}}&utm_medium={{adset.name}}|{{adset.id}}&utm_content={{ad.name}}|{{ad.id}}&utm_term={{placement}}" +
  "&xcod=FBhQwK21wXxR{{campaign.name}}|{{campaign.id}}hQwK21wXxR{{adset.name}}|{{adset.id}}hQwK21wXxR{{ad.name}}|{{ad.id}}hQwK21wXxR{{placement}}";
// os "extras automáticos" da Meta ficam todos desligados (texto por cima, música, recortes...)
const OPT_OUT = ["adapt_to_placement", "add_text_overlay", "advantage_plus_creative", "audio", "creative_stickers", "cv_transformation",
  "description_automation", "dha_optimization", "biz_ai", "ads_with_benefits", "enable_ncs_testimonials", "dynamic_partner_content"];
const PUBLICO_PADRAO = { geo_locations: { countries: ["BR"] }, age_min: 18, age_max: 65, targeting_automation: { advantage_audience: 1 } };
const SEM_CENTAVOS = new Set(["JPY", "KRW", "CLP", "COP", "HUF", "ISK", "TWD", "VND", "IDR", "PYG"]);

async function etapaCampanha() {
  const criar = flag("criar");
  const conta = (opt("conta") ?? "").replace(/^act_/, "");
  const pixelId = opt("pixel-id");
  const dir = opt("criativos");
  const orcamento = Number(String(opt("orcamento") ?? "").replace(",", "."));
  const link = opt("link") ?? estado.pagina;
  if (!/^\d+$/.test(conta)) throw new Error("diga a conta: --conta <ID>");
  if (!/^\d+$/.test(pixelId ?? "")) throw new Error("diga o pixel que ela criou no Facebook: --pixel-id <ID>");
  if (!dir || !existsSync(dir)) throw new Error('diga a pasta dos criativos: --criativos "<pasta>"');
  if (!(orcamento > 0)) throw new Error("diga o orçamento diário na moeda da conta: --orcamento <valor> (ex.: 6 = US$ 6 numa conta em dólar)");
  if (!/^https:\/\//.test(link ?? "")) throw new Error("a página ainda não foi publicada (rode a etapa padrão) ou diga --link <URL>");
  const textos = JSON.parse(readFileSync(join(pasta, "anuncios.json"), "utf8"));
  if (!textos.bodies?.length || !textos.titles?.length) throw new Error("anuncios.json precisa de bodies[] e titles[]");
  const arquivos = readdirSync(dir).filter((n) => /\.(mp4|mov|jpe?g|png|webp)$/i.test(n)).sort((a, b) => a.localeCompare(b, "pt-BR", { numeric: true }));
  if (!arquivos.length) throw new Error("nenhum vídeo/imagem na pasta dos criativos");

  // conta + token que a alcança (só leituras até aqui)
  const conta_ = (await todasContas()).find((a) => a.id === conta);
  if (!conta_) throw new Error("essa conta não aparece nos tokens do .env.meta (ou é a do amigo, que não pode)");
  if (!conta_.ativa) throw new Error(`a conta ${conta_.nome} está desativada na Meta`);
  const T = conta_.token, A = `act_${conta}`;
  const pixels = (await get(T, `${A}/adspixels`, { fields: "id,name", limit: "100" })).data ?? [];
  const pixel = pixels.find((p) => p.id === pixelId);
  if (!pixel) throw new Error(`o pixel ${pixelId} não aparece na conta ${conta_.nome} (pixels dela: ${pixels.map((p) => `${p.name} ${p.id}`).join(", ") || "nenhum"})`);

  // página + Instagram: os que essa conta já usa, se ela não disser outros
  let pageId = opt("pagina"), instagramId = opt("ig");
  if (!pageId) {
    const ads = (await get(T, `${A}/ads`, { fields: "creative{object_story_spec{page_id,instagram_user_id,instagram_actor_id}}", limit: "30" })).data ?? [];
    const uso = new Map();
    for (const a of ads) {
      const st = a.creative?.object_story_spec;
      if (!st?.page_id) continue;
      const ig = st.instagram_user_id ?? st.instagram_actor_id ?? null;
      const k = `${st.page_id}|${ig}`;
      uso.set(k, { pageId: st.page_id, instagramId: ig, n: (uso.get(k)?.n ?? 0) + 1 });
    }
    const usual = [...uso.values()].sort((a, b) => b.n - a.n)[0];
    if (!usual) throw new Error("essa conta não tem anúncio para eu copiar a página; diga --pagina <ID> --ig <ID>");
    pageId = usual.pageId; instagramId ??= usual.instagramId ?? undefined;
  }

  // público e atribuição: do conjunto indicado ou do que mais gastou nos últimos 14 dias nessa conta
  let targeting = PUBLICO_PADRAO, attribution = null, publico = "Brasil, 18-65+, público Advantage (conta sem conjunto com gasto)";
  const modelo = opt("modelo-cj") ?? (await get(T, `${A}/insights`, { level: "adset", date_preset: "last_14d", fields: "adset_id,spend", sort: "spend_descending", limit: "1" })).data?.[0]?.adset_id;
  if (modelo) {
    try {
      const m = await get(T, modelo, { fields: "name,targeting,attribution_spec" });
      if (m.targeting) { targeting = m.targeting; attribution = m.attribution_spec ?? null; publico = `copiado do conjunto "${m.name}"`; }
    } catch (e) { publico = `Brasil, 18-65+, público Advantage (não deu para copiar o do conjunto ${modelo}: ${e.message})`; }
  }

  const hoje = new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", timeZone: "America/Sao_Paulo" }).replace("/", "-");
  const nome = opt("nome") ?? `${nomeProduto().toUpperCase()} - TESTE ${hoje}`;
  const unidades = Math.round(orcamento * (SEM_CENTAVOS.has(conta_.moeda) ? 1 : 100));
  const anuncios = arquivos.map((n, i) => ({
    arquivo: n, video: /\.(mp4|mov)$/i.test(n), nome: `AD ${String(i + 1).padStart(2, "0")} - ${basename(n, extname(n))}`.slice(0, 200),
    texto: textos.bodies[i % textos.bodies.length], titulo: textos.titles[i % textos.titles.length],
  }));

  console.log(`Conta:     ${conta_.nome} (${conta}, ${conta_.moeda})`);
  console.log(`Pixel:     ${pixel.name} (${pixel.id})`);
  console.log(`Página FB: ${pageId}${instagramId ? `  ·  Instagram ${instagramId}` : "  ·  sem Instagram"}`);
  console.log(`Campanha:  "${nome}"  ·  vendas (compra), CBO, ${orcamento} ${conta_.moeda}/dia  ·  nasce PAUSADA`);
  console.log(`Conjunto:  "CJ 01 ${hoje}"  ·  público ${publico}`);
  console.log(`Link:      ${link}  (+ UTM padrão)`);
  console.log(`Anúncios:  ${anuncios.length}`);
  for (const a of anuncios) console.log(`  · ${a.nome}  [${a.video ? "vídeo" : "imagem"}]  título "${a.titulo}"  ·  texto "${a.texto.split("\n")[0].slice(0, 60)}…"`);
  if (!criar) { console.log("\nSó conferi (nada foi enviado nem criado). Com o ok dela, rode o mesmo comando com --criar."); return; }

  // 1. criativos direto na biblioteca da conta (uma vez só por arquivo)
  estado.meta ??= {};
  const subidos = [];
  for (const a of anuncios) {
    const buf = readFileSync(join(dir, a.arquivo));
    const chave = `${conta}:${createHash("sha256").update(buf).digest("hex").slice(0, 32)}`;
    if (!estado.meta[chave]) {
      if (a.video) {
        const fd = new FormData();
        fd.append("name", a.arquivo.slice(0, 200));
        fd.append("source", new Blob([buf]), a.arquivo);
        estado.meta[chave] = { videoId: (await graph(T, "POST", `${A}/advideos`, fd)).id };
      } else {
        const r = await graph(T, "POST", `${A}/adimages`, { bytes: buf.toString("base64") });
        const hash = Object.values(r.images ?? {})[0]?.hash;
        if (!hash) throw new Error(`a Meta não devolveu a imagem ${a.arquivo}`);
        estado.meta[chave] = { imageHash: hash };
      }
      salvar();
    }
    subidos.push({ ...a, ...estado.meta[chave] });
    console.log(`  enviado: ${a.arquivo}`);
  }

  // 2. vídeos: espera a Meta processar e pega a capa
  for (const c of subidos.filter((c) => c.videoId)) {
    for (let i = 0; ; i++) {
      const v = await get(T, c.videoId, { fields: "status,thumbnails{uri,is_preferred}" });
      const st = v.status?.video_status;
      const capa = (v.thumbnails?.data ?? []).find((t) => t.is_preferred) ?? v.thumbnails?.data?.[0];
      if (st === "ready" && capa?.uri) { c.capa = capa.uri; break; }
      if (st === "error") throw new Error(`a Meta recusou o vídeo ${c.arquivo}`);
      if (i > 90) throw new Error(`o vídeo ${c.arquivo} demorou demais para processar; rode de novo daqui a pouco`);
      if (i === 0) console.log(`  esperando a Meta processar ${c.arquivo}…`);
      await pausa(10_000);
    }
  }

  // 3. campanha PAUSADA (CBO); conjunto e anúncios ficam prontos para rodar quando ela ligar
  const log = [];
  const campanha = await graph(T, "POST", `${A}/campaigns`, {
    name: nome, objective: "OUTCOME_SALES", status: "PAUSED", special_ad_categories: [],
    bid_strategy: "LOWEST_COST_WITHOUT_CAP", daily_budget: String(unidades),
  });
  try {
    const conjunto = await graph(T, "POST", `${A}/adsets`, {
      name: `CJ 01 ${hoje}`, campaign_id: campanha.id, status: "ACTIVE", billing_event: "IMPRESSIONS", optimization_goal: "OFFSITE_CONVERSIONS",
      promoted_object: { pixel_id: pixel.id, custom_event_type: "PURCHASE" }, targeting, ...(attribution ? { attribution_spec: attribution } : {}),
    });
    const cta = { type: textos.cta ?? "LEARN_MORE", value: { link } };
    const ads = [];
    let extrasOk = true;
    for (const c of subidos) {
      const story = { page_id: pageId, ...(instagramId ? { instagram_user_id: instagramId } : {}) };
      if (c.videoId) story.video_data = { video_id: c.videoId, image_url: c.capa, message: c.texto, title: c.titulo, ...(textos.description ? { link_description: textos.description } : {}), call_to_action: cta };
      else story.link_data = { image_hash: c.imageHash, link, message: c.texto, name: c.titulo, ...(textos.description ? { description: textos.description } : {}), call_to_action: cta };
      const baseCr = { name: c.nome, object_story_spec: story, url_tags: UTM };
      let criativo;
      try {
        criativo = await graph(T, "POST", `${A}/adcreatives`, extrasOk
          ? { ...baseCr, degrees_of_freedom_spec: { creative_features_spec: Object.fromEntries(OPT_OUT.map((k) => [k, { enroll_status: "OPT_OUT" }])) } }
          : baseCr);
      } catch (e) {
        if (!extrasOk) throw e;
        extrasOk = false; // a Meta recusou a lista de "extras": cria sem ela e avisa
        log.push(`a Meta não aceitou desligar os extras automáticos (${e.message}); confira no Gerenciador`);
        criativo = await graph(T, "POST", `${A}/adcreatives`, baseCr);
      }
      const ad = await graph(T, "POST", `${A}/ads`, { name: c.nome, adset_id: conjunto.id, creative: { creative_id: criativo.id }, status: "ACTIVE" });
      ads.push({ id: ad.id, nome: c.nome });
    }
    (estado.campanhas ??= []).push({ conta, nome, pixelId: pixel.id, campaignId: campanha.id, adsetId: conjunto.id, ads, criadaEm: new Date().toISOString() });
    salvar();
    console.log(`\nCampanha criada PAUSADA: ${nome}`);
    console.log(`  ${ads.length} anúncio(s) no conjunto ${conjunto.id}`);
    for (const l of log) console.log(`  · ${l}`);
    console.log(`  Gerenciador: https://adsmanager.facebook.com/adsmanager/manage/campaigns?act=${conta}&selected_campaign_ids=${campanha.id}`);
    console.log("  Ela confere e liga quando quiser.");
  } catch (e) {
    // deu erro no meio: apaga a campanha pela metade para não ficar lixo na conta
    await graph(T, "POST", campanha.id, { status: "DELETED" }).catch(() => {});
    throw e;
  }
}

try {
  if (flag("contas")) await etapaContas();
  else if (flag("campanha")) await etapaCampanha();
  else await etapaPagina();
} catch (e) {
  console.error(`\nERRO: ${e.message}`);
  process.exit(1);
}
