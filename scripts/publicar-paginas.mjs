// Publica a página de vendas e o app de uma oferta no projeto "paginas" da Vercel (C:\Users\maria\Desktop\paginas).
// Desde 27/10/2026 (ordem dela) nada disso passa por checkout: a página é montada AQUI, a partir do 04-pagina.html
// da pasta da oferta, com o link do checkout que ela criou à mão no Atomify e o rastreador do produto.
// Fica em paginas/public/p/<slug>/index.html (app em p/<slug>/app/index.html), com commit naquela pasta e deploy.
//
//   uso pelo lancar.mjs (etapa padrão); sozinho não roda.
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { execFileSync, execSync } from "node:child_process";

export const PASTA_PAGINAS = "C:/Users/maria/Desktop/paginas";
export const RASTREADOR = "https://checkout.atomify.com.br/t.js";
const STORAGE_ANTIGO = "https://ypplpvmjcptwomkncdbd.supabase.co/storage/v1/object/public/";

const HOTMART_PAY = /https?:\/\/pay\.hotmart\.com\/[^"'\s<>)]+/g;
const TJS_TAG = /<script\b[^>]*\bsrc=["'][^"']*\/t\.js[^"']*["'][^>]*>\s*<\/script>\s*/gi;

// Mesma lógica do preparePageHtml do checkout antigo (src/lib/launch.ts, só lido), adaptada:
// troca {{CHECKOUT}} e os links da Hotmart pelo link do checkout, tira rastreadores velhos e põe o do Atomify.
//   trackerSrc = null: sem rastreador novo; um t.js do Atomify que já esteja na página fica.
export function prepararPagina(html, checkoutUrl, trackerSrc) {
  let trocados = 0;
  let out = html;
  if (checkoutUrl) {
    out = out.replace(/\{\{CHECKOUT\}\}/g, () => (trocados++, checkoutUrl));
    out = out.replace(HOTMART_PAY, () => (trocados++, checkoutUrl));
  }
  const semLink = (out.match(/\{\{CHECKOUT\}\}/g) ?? []).length + (out.match(HOTMART_PAY) ?? []).length;
  // t.js do checkout antigo (*.revitamulher.online) sempre sai: ele devolve os botões para o checkout antigo.
  // Com rastreador novo, sai qualquer t.js (dois juntos brigam); sem, o do Atomify que já estiver fica.
  let rastreado = false;
  out = out.replace(TJS_TAG, (tag) => {
    const src = tag.match(/\bsrc=["']([^"']+)["']/i)?.[1] ?? "";
    let host = "";
    try { host = new URL(src, "https://x.invalid").hostname; } catch {}
    if (!trackerSrc && /(^|\.)atomify\.com\.br$/i.test(host)) { rastreado = true; return tag; }
    return "";
  });
  if (trackerSrc) {
    // no começo do <head>: o rastreador e o Pixel começam a baixar antes do CSS e das fontes
    out = out.replace(/<link[^>]*connect\.facebook\.net[^>]*>\s*/gi, "");
    const tag =
      `<link rel="preconnect" href="https://connect.facebook.net" crossorigin>\n` +
      `<link rel="preload" href="https://connect.facebook.net/en_US/fbevents.js" as="script">\n` +
      `<script src="${trackerSrc}" async></script>\n`;
    const head = out.match(/<head[^>]*>/i);
    out = head ? out.replace(head[0], `${head[0]}\n${tag}`) : tag + out;
    rastreado = true;
  }
  const sobras = (out.match(/\{\{[A-Z]+:[^}]*\}\}/g) ?? []).length; // {{IMG:...}} que sobraram
  const hotmart = (out.replace(/<[^>]+>/g, " ").match(/hotmart/gi) ?? []).length; // texto que ainda fala da Hotmart
  return { html: out, trocados, semLink, sobras, hotmart, rastreado };
}

// imagens que ainda estejam no Storage do checkout antigo viram cópia em /arquivos (só leitura lá)
export async function copiarArquivos(html, ensaio) {
  const pegar = [];
  const novo = html.replace(/https:\/\/ypplpvmjcptwomkncdbd\.supabase\.co\/storage\/v1\/object\/public\/([^"'()\s>]+)/g, (tudo, resto) => {
    if (!/\.[a-z0-9]{2,5}$/i.test(resto)) return tudo; // prefixo que o app completa: fica como está
    pegar.push(resto);
    return "/arquivos/" + resto;
  });
  if (ensaio) return { html: novo, copiados: [...new Set(pegar)] };
  for (const resto of new Set(pegar)) {
    const arq = join(PASTA_PAGINAS, "public", "arquivos", decodeURIComponent(resto));
    if (existsSync(arq)) continue;
    const res = await fetch(STORAGE_ANTIGO + resto);
    if (!res.ok) { console.log(`  ATENÇÃO: imagem não copiada (${res.status}): ${resto}`); continue; }
    mkdirSync(dirname(arq), { recursive: true });
    writeFileSync(arq, Buffer.from(await res.arrayBuffer()));
  }
  return { html: novo, copiados: [...new Set(pegar)] };
}

const arquivoDe = (caminho) => join(PASTA_PAGINAS, "public", "p", caminho, "index.html");
export const noAr = (caminho) => (existsSync(arquivoDe(caminho)) ? readFileSync(arquivoDe(caminho), "utf8") : null);
export const sha = (txt) => createHash("sha256").update(txt).digest("hex");

// o que muda em relação ao arquivo que já está no projeto "paginas" (linhas que entram e que saem)
export function diferencas(antigo, novo) {
  if (antigo === null) return { novo: true, entram: [], saem: [] };
  const a = antigo.split(/\r?\n/), b = novo.split(/\r?\n/);
  const conta = (l) => l.reduce((m, x) => m.set(x, (m.get(x) ?? 0) + 1), new Map());
  const ca = conta(a), cb = conta(b);
  const entram = b.filter((x) => { const n = ca.get(x) ?? 0; if (n > 0) { ca.set(x, n - 1); return false; } return true; });
  const saem = a.filter((x) => { const n = cb.get(x) ?? 0; if (n > 0) { cb.set(x, n - 1); return false; } return true; });
  return { novo: false, entram, saem };
}

// grava os arquivos, faz commit só deles na pasta "paginas" e publica aquele projeto
export function publicarPaginas(slug, arquivos) {
  if (!existsSync(join(PASTA_PAGINAS, "vercel.json"))) throw new Error(`não achei o projeto de páginas em ${PASTA_PAGINAS}`);
  for (const [caminho, html] of Object.entries(arquivos)) {
    mkdirSync(dirname(arquivoDe(caminho)), { recursive: true });
    writeFileSync(arquivoDe(caminho), html);
  }
  try { // histórico no git do projeto de páginas (sem remoto); sem mudança, o commit só não acontece
    execFileSync("git", ["add", "--", `public/p/${slug}`, "public/arquivos"], { cwd: PASTA_PAGINAS, stdio: "ignore" });
    execFileSync("git", ["commit", "-q", "-m", `lançamento: ${slug}`, "--", `public/p/${slug}`, "public/arquivos"], { cwd: PASTA_PAGINAS, stdio: "ignore" });
  } catch {}
  console.log(`\nPublicando no projeto "paginas"…`);
  execSync("npx -y vercel@65.4.0 deploy --prod --yes --scope lucas-1ba0", { cwd: PASTA_PAGINAS, stdio: ["ignore", "ignore", "inherit"] });
  console.log("  publicado.");
}
