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

import { execFile, execFileSync } from "node:child_process";
import { promisify } from "node:util";
import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, statSync, unlinkSync, writeFileSync } from "node:fs";
import { basename, dirname, extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";

const execArq = promisify(execFile);
const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const pasta = resolve(args.find((a) => !a.startsWith("--")) ?? "");
const publicar = args.includes("--publicar");
const origem = (() => { const i = args.indexOf("--de"); return i >= 0 ? resolve(args[i + 1]) : null; })();

const BASE = "https://zitfuuullg008-debug.github.io/harness-ofertas";
const TETO_KB = 140;      // teto por imagem, combinado com o usuário
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

// A expert é sempre a mesma pessoa, então a foto dela é do projeto, não da
// oferta: fica em templates/ e serve toda página sem ninguém ter que gerar.
const EXPERT = join(RAIZ, "templates", "expert-mari-dias.webp");

/* A skill do Codex nomeia pelo conteúdo ("03-dobra-2-canela-classica.png"),
   não pelo slot. Traduz uma coisa na outra, na ordem em que os arquivos vêm —
   senão alguém teria que renomear 27 arquivos na mão a cada oferta. */
const PADROES = [
  [/primeira-dobra/i, "hero"],
  [/dobra-?2|segunda-dobra/i, "demo"],
  [/mockup-principal/i, "produto"],
  [/pack-completo/i, "planos"],
  [/\bbonus\b|b[oô]nus/i, "bonus"],
  [/depoimento/i, "depoimentos"],
  [/expert|autoridade|mari/i, "autoridade"],
];
const porBloco = {};
for (const f of [...disponiveis].sort()) {
  const nome = basename(f, extname(f)).toLowerCase();
  if (/^[a-z]+-\d+$/.test(nome)) continue;          // já está no nosso padrão
  const achado = PADROES.find(([re]) => re.test(nome));
  if (!achado) continue;
  (porBloco[achado[1]] ??= []).push(f);
}

const achaArquivo = (p) => {
  const base = `${p.bloco}-${p.n}`;
  const naPasta = disponiveis.find((f) => basename(f, extname(f)).toLowerCase() === base)
    ?? disponiveis.find((f) => basename(f, extname(f)).toLowerCase().replace(/[_\s]/g, "-") === base);
  if (naPasta) return join(de, naPasta);

  // Pela convenção da skill: o n-ésimo arquivo daquele bloco, em ordem.
  const pelaOrdem = porBloco[p.bloco]?.[p.n - 1];
  if (pelaOrdem) return join(de, pelaOrdem);

  if (p.bloco === "autoridade" && existsSync(EXPERT)) return EXPERT;
  return null;
};

/**
 * PNG entra, WebP leve sai. As imagens chegam grandes e sem compactar, e
 * imagem pesada derruba a página — então a conversão é parte do caminho, não
 * um passo à parte que alguém pode esquecer.
 *
 * Busca binária na qualidade: a maior que ainda cabe no teto. Assim cada
 * arquivo sai o mais bonito possível sem estourar o limite.
 */
async function converteParaWebp(entrada, saida) {
  const teto = TETO_KB * 1024;

  /* A busca gasta várias passadas de encoder por imagem. Duas coisas cortam
     esse tempo sem mudar o resultado:

     1. Reduzir a imagem UMA vez, num arquivo temporário, e procurar a
        qualidade em cima dele. Sem isso, cada tentativa re-decodifica um PNG
        de 2 MB e redimensiona de novo.
     2. Procurar com `compression_level 1` (rápido, tamanho parecido) e só a
        passada final usar `6`, que é a lenta e a que vale. */
  const menor = saida.replace(/\.webp$/i, ".base.png");
  await execArq("ffmpeg", [
    "-hide_banner", "-loglevel", "error", "-i", entrada,
    "-vf", `scale='min(${LARGURA_MAX},iw)':-2`, "-y", menor,
  ]);

  const roda = async (q, nivel, destinoArq) => {
    await execArq("ffmpeg", [
      "-hide_banner", "-loglevel", "error", "-i", menor,
      "-c:v", "libwebp", "-quality", String(q), "-compression_level", String(nivel),
      "-y", destinoArq,
    ]);
    return statSync(destinoArq).size;
  };

  const sonda = saida.replace(/\.webp$/i, ".sonda.webp");
  let baixo = 30;
  let alto = 92;
  let melhorQ = null;
  if (await roda(92, 1, sonda) <= teto) melhorQ = 92;
  else {
    while (baixo <= alto) {
      const meio = Math.floor((baixo + alto) / 2);
      if (await roda(meio, 1, sonda) <= teto) { melhorQ = meio; baixo = meio + 1; }
      else alto = meio - 1;
    }
  }

  const q = melhorQ ?? 30;
  let bytes = await roda(q, 6, saida);
  // O nível 6 comprime mais que o 1, então cabe. Se por acaso não couber,
  // desce um degrau e aceita.
  if (bytes > teto && q > 30) bytes = await roda(q - 8, 6, saida);
  for (const lixo of [menor, sonda]) { try { unlinkSync(lixo); } catch { /* já foi */ } }
  return { q, bytes, estourou: bytes > teto };
}

/* Imagem trocada mantendo o mesmo nome fica invisivel: o navegador ja tem aquela
   URL em cache e serve a antiga por dez minutos. A assinatura do conteudo no fim
   da URL resolve — muda o arquivo, muda o endereco. */
const assinatura = (caminho) => createHash("sha1").update(readFileSync(caminho)).digest("hex").slice(0, 8);

const copiadas = [];
const faltando = [];
const avisosPeso = [];

// Seis por vez: a máquina tem 8 núcleos e o ffmpeg usa um por processo.
// Sequencial, 20 imagens levavam minutos; em paralelo é a mesma conta dividida.
const AO_MESMO_TEMPO = 6;
const fila = [...pedidos];
async function trabalhador() {
  while (fila.length) {
    const p = fila.shift();
    const caminhoDe = achaArquivo(p);
    if (!caminhoDe) { faltando.push(p); continue; }
    const achado = basename(caminhoDe);
    const kbAntes = Math.round(statSync(caminhoDe).size / 1024);
    const nomeFinal = `${p.bloco}-${p.n}.webp`;
    try {
      const r = await converteParaWebp(caminhoDe, join(destino, nomeFinal));
      const kb = Math.round(r.bytes / 1024);
      if (r.estourou) avisosPeso.push(`${nomeFinal} ficou ${kb}KB mesmo na qualidade mínima`);
      console.log(`  ${nomeFinal.padEnd(18)} ${String(kbAntes).padStart(5)}KB → ${String(kb).padStart(4)}KB  (q${r.q})`);
      copiadas.push({ ...p, nomeFinal, kb, url: `${BASE}/imagens/${slug}/${nomeFinal}?v=${assinatura(join(destino, nomeFinal))}` });
    } catch (e) {
      const alt = `${p.bloco}-${p.n}${extname(achado).toLowerCase()}`;
      copyFileSync(caminhoDe, join(destino, alt));
      avisosPeso.push(`${alt}: não consegui converter (${String(e.message).slice(0, 60)})`);
      copiadas.push({ ...p, nomeFinal: alt, kb: kbAntes, url: `${BASE}/imagens/${slug}/${alt}?v=${assinatura(join(destino, alt))}` });
    }
  }
}
await Promise.all(Array.from({ length: AO_MESMO_TEMPO }, trabalhador));
copiadas.sort((a, b) => a.bloco.localeCompare(b.bloco) || a.n - b.n);

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
