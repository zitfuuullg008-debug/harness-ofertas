#!/usr/bin/env node
/**
 * imagens.mjs — leva as imagens da oferta pro ar e preenche a página.
 *
 * O caminho curto: o repositório já publica no GitHub Pages. Então uma imagem
 * commitada em `imagens/<slug>/` vira URL pública em segundos, sem depender da
 * Atomicat e sem conta em serviço nenhum.
 *
 * Dois modos:
 *
 *   node scripts/imagens.mjs saidas/modelagem/<pasta>
 *      Escreve o BRIEFING: o que cada imagem precisa mostrar e com que nome o
 *      arquivo tem que ser salvo. É o que você entrega pro ChatGPT.
 *
 *   node scripts/imagens.mjs saidas/modelagem/<pasta> --publicar --de "<pasta com as imagens>"
 *      Copia, sobe pro GitHub, troca os {{IMG:...}} pelas URLs e confere se
 *      cada uma responde.
 */

import { execFileSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { basename, dirname, extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const pasta = resolve(args.find((a) => !a.startsWith("--")) ?? "");
const publicar = args.includes("--publicar");
const origem = (() => { const i = args.indexOf("--de"); return i >= 0 ? resolve(args[i + 1]) : null; })();

const BASE = "https://zitfuuullg008-debug.github.io/harness-ofertas";
const TETO_KB = 120;      // teto por imagem: acima disso a página fica lenta
const LARGURA_MAX = 1080; // página de vendas é mobile; além disso é peso à toa

if (!existsSync(pasta)) {
  console.error(`Não achei a pasta: ${pasta}`);
  process.exit(1);
}
const arqPagina = readdirSync(pasta).find((f) => /pagina.*\.html$/i.test(f));
if (!arqPagina) {
  console.error(`Não achei o HTML da página em ${pasta}`);
  process.exit(1);
}
const caminhoPagina = join(pasta, arqPagina);
let html = readFileSync(caminhoPagina, "utf8");
// Uma pasta por PRODUTO, com o nome dele — não com a data da mineração. Assim
// `imagens/rolinhos-gourmet-lucrativos/` fica legível na URL e duas rodadas do
// mesmo produto caem no mesmo lugar.
const titulo = (html.match(/<title[^>]*>([\s\S]*?)<\/title>/i) ?? [])[1] ?? "";
const slug = (titulo.split(/[—–|]/)[0].trim() || basename(pasta))
  .normalize("NFD").replace(/[̀-ͯ]/g, "")
  .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
  .slice(0, 60) || basename(pasta);

/* ---- que imagens a página pede, e o que cada uma mostra ---- */

const pedidos = [];
for (const m of html.matchAll(/<img\b[^>]*>/gi)) {
  const tag = m[0];
  const ph = tag.match(/\{\{IMG:([a-z]+):(\d+)\}\}/i);
  if (!ph) continue;
  const alt = (tag.match(/alt=["']([^"']*)["']/i) ?? [])[1] ?? "";
  pedidos.push({ bloco: ph[1].toLowerCase(), n: Number(ph[2]), marcador: ph[0], alt, arquivo: `${ph[1].toLowerCase()}-${ph[2]}.webp` });
}
if (!pedidos.length) {
  console.log("Essa página já está com todas as imagens preenchidas.");
  process.exit(0);
}

/* ---- modo briefing ---- */

if (!publicar) {
  const linhas = [
    `# Imagens da oferta — ${slug}`,
    "",
    `${pedidos.length} imagens. Gere cada uma e salve **com o nome exato** da última coluna.`,
    "**Pode mandar PNG normal, do tamanho que sair.** O painel converte pra WebP e comprime sozinho "
    + `(teto de ${TETO_KB} KB, largura ${LARGURA_MAX}). Só o nome do arquivo precisa estar certo.`,
    "",
    "| # | Onde entra | O que precisa mostrar | Salvar como |",
    "|---|---|---|---|",
    ...pedidos.map((p, i) => `| ${i + 1} | ${p.bloco} | ${p.alt.replace(/\|/g, "/")} | \`${p.arquivo}\` |`),
    "",
    "## Onde salvar",
    "",
    "Salve **todas** nesta pasta — ela já foi criada:",
    "",
    "```",
    join(RAIZ, "imagens-novas", slug),
    "```",
    "",
    "Depois é só clicar em **🖼 Imagens** no painel de novo. Ou:",
    "",
    "```",
    `node scripts/imagens.mjs ${pasta.replace(RAIZ + "\\", "").replace(/\\/g, "/")} --publicar --de "C:\\caminho\\da\\pasta"`,
    "```",
    "",
  ];
  mkdirSync(join(RAIZ, "imagens-novas", slug), { recursive: true });
  const saida = join(pasta, "IMAGENS.md");
  writeFileSync(saida, linhas.join("\n"), "utf8");
  console.log(`Briefing de ${pedidos.length} imagens escrito em ${saida}\n`);
  for (const p of pedidos) console.log(`  ${p.arquivo.padEnd(16)} ${p.alt.slice(0, 84)}`);
  process.exit(0);
}

/* ---- modo publicar ---- */

// Sem --de, procura no lugar combinado: imagens-novas/<produto>/
const padrao = join(RAIZ, "imagens-novas", slug);
const de = origem ?? padrao;
if (!existsSync(de)) {
  console.error(`Não achei a pasta das imagens.\n\nSalve os arquivos em:\n  ${padrao}\n\nOu passe outra com --de "C:\\caminho"`);
  process.exit(1);
}

const destino = join(RAIZ, "imagens", slug);
mkdirSync(destino, { recursive: true });

const disponiveis = readdirSync(de).filter((f) => /\.(webp|jpe?g|png)$/i.test(f));
const achaArquivo = (p) => {
  const base = `${p.bloco}-${p.n}`;
  return disponiveis.find((f) => basename(f, extname(f)).toLowerCase() === base)
    ?? disponiveis.find((f) => basename(f, extname(f)).toLowerCase().replace(/[_\s]/g, "-") === base);
};

/**
 * PNG entra, WebP leve sai. As imagens chegam grandes e sem compactar, e
 * imagem pesada derruba a página — então a conversão é parte do caminho, não
 * um passo à parte que alguém pode esquecer.
 *
 * Busca binária na qualidade: a maior que ainda cabe no teto. Assim cada
 * arquivo sai o mais bonito possível sem estourar o limite.
 */
function converteParaWebp(entrada, saida) {
  const roda = (q) => {
    execFileSync("ffmpeg", [
      "-hide_banner", "-loglevel", "error",
      "-i", entrada,
      "-vf", `scale='min(${LARGURA_MAX},iw)':-2`,
      "-c:v", "libwebp", "-quality", String(q), "-compression_level", "6",
      "-y", saida,
    ], { stdio: "pipe" });
    return statSync(saida).size;
  };

  let baixo = 30;
  let alto = 92;
  let melhor = null;
  roda(alto);
  if (statSync(saida).size <= TETO_KB * 1024) return { q: alto, bytes: statSync(saida).size };

  while (baixo <= alto) {
    const meio = Math.floor((baixo + alto) / 2);
    const bytes = roda(meio);
    if (bytes <= TETO_KB * 1024) { melhor = { q: meio, bytes }; baixo = meio + 1; }
    else alto = meio - 1;
  }
  if (melhor) { roda(melhor.q); return melhor; }
  // Nem na qualidade mínima coube: entrega o menor que deu.
  return { q: 30, bytes: roda(30), estourou: true };
}

const copiadas = [];
const faltando = [];
const avisosPeso = [];

for (const p of pedidos) {
  const achado = achaArquivo(p);
  if (!achado) { faltando.push(p); continue; }
  const caminhoDe = join(de, achado);
  const kbAntes = Math.round(statSync(caminhoDe).size / 1024);
  const nomeFinal = `${p.bloco}-${p.n}.webp`;
  const caminhoFinal = join(destino, nomeFinal);

  let kb = kbAntes;
  try {
    const r = converteParaWebp(caminhoDe, caminhoFinal);
    kb = Math.round(r.bytes / 1024);
    if (r.estourou) avisosPeso.push(`${nomeFinal} ficou ${kb}KB mesmo na qualidade mínima`);
    console.log(`  ${nomeFinal.padEnd(18)} ${String(kbAntes).padStart(5)}KB → ${String(kb).padStart(4)}KB  (q${r.q})`);
  } catch (e) {
    // Sem ffmpeg ou arquivo estranho: leva como está, mas avisa.
    copyFileSync(caminhoDe, join(destino, `${p.bloco}-${p.n}${extname(achado).toLowerCase()}`));
    avisosPeso.push(`${nomeFinal}: não consegui converter (${String(e.message).slice(0, 60)})`);
    copiadas.push({ ...p, nomeFinal: `${p.bloco}-${p.n}${extname(achado).toLowerCase()}`, kb: kbAntes, url: `${BASE}/imagens/${slug}/${p.bloco}-${p.n}${extname(achado).toLowerCase()}` });
    continue;
  }
  copiadas.push({ ...p, nomeFinal, kb, url: `${BASE}/imagens/${slug}/${nomeFinal}` });
}

console.log(`${copiadas.length} de ${pedidos.length} imagens encontradas.`);
if (faltando.length) {
  console.log(`\nFaltam ${faltando.length} — gere e salve com estes nomes:`);
  for (const p of faltando) console.log(`  ${p.arquivo.padEnd(16)} ${p.alt.slice(0, 80)}`);
}
if (avisosPeso.length) console.log(`\nAtenção:\n  ${avisosPeso.join("\n  ")}`);
if (!copiadas.length) process.exit(1);

/* ---- sobe pro GitHub ---- */

const git = (...a) => execFileSync("git", a, { cwd: RAIZ, encoding: "utf8" });
try {
  git("add", "--", `imagens/${slug}`);
  const mudou = git("status", "--porcelain", "--", `imagens/${slug}`).trim();
  if (mudou) {
    git("commit", "-m", `imagens: ${slug} (${copiadas.length})`);
    console.log("\ncommit feito");
  } else {
    console.log("\nnada novo pra commitar");
  }
  git("push", "origin", "HEAD:main");
  console.log("enviado pro GitHub");
} catch (e) {
  console.error(`\nNão consegui enviar pro GitHub: ${String(e.stdout ?? e.message).slice(0, 200)}`);
  console.error("As imagens estão copiadas em imagens/" + slug + " — dá pra subir na mão depois.");
}

/* ---- troca os marcadores pelas URLs ---- */

for (const c of copiadas) html = html.split(c.marcador).join(c.url);
writeFileSync(caminhoPagina, html, "utf8");
const restantes = (html.match(/\{\{IMG:[^}]*\}\}/g) ?? []).length;
console.log(`\npágina atualizada: ${copiadas.length} URLs trocadas, ${restantes} marcador(es) restante(s)`);

/* ---- confere se estão mesmo no ar ---- */

console.log("\nconferindo (o Pages leva ~1 min pra publicar)…");
const amostra = copiadas.slice(0, 3);
for (let tentativa = 1; tentativa <= 8; tentativa++) {
  const status = await Promise.all(amostra.map(async (c) => {
    try {
      const r = await fetch(c.url, { method: "HEAD", signal: AbortSignal.timeout(10000) });
      return r.status;
    } catch { return 0; }
  }));
  if (status.every((s) => s === 200)) {
    console.log(`  no ar ✓  ${amostra[0].url}`);
    break;
  }
  if (tentativa === 8) {
    console.log(`  ainda não apareceram (status ${status.join(",")}) — o Pages às vezes demora alguns minutos.`);
    console.log(`  confira depois: ${amostra[0].url}`);
    break;
  }
  await new Promise((r) => setTimeout(r, 15000));
}
