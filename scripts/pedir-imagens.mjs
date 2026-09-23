#!/usr/bin/env node
/**
 * pedir-imagens.mjs — manda o Codex produzir o lote de imagens da oferta.
 *
 * Quando a página passa na auditoria, o que falta são as imagens. Quem gera é
 * o Codex, com a skill `producao-imagens-produto` — ela já lê a página, conta
 * os bônus reais e publica em `imagens-novas/<produto>/`, que é exatamente a
 * pasta que o `scripts/imagens.mjs` procura depois.
 *
 * Então o caminho fica: página pronta → aqui → Codex gera → `imagens.mjs`
 * converte, sobe pro GitHub e preenche a página.
 *
 * Uso:
 *   node scripts/pedir-imagens.mjs saidas/modelagem/<pasta>
 *   node scripts/pedir-imagens.mjs <pasta> --so-o-texto   (não chama, só mostra)
 */

import { spawn } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, readdirSync } from "node:fs";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const pasta = resolve(args.find((a) => !a.startsWith("--")) ?? "");
const soOTexto = args.includes("--so-o-texto");

const CODEX = "C:/Users/maria/AppData/Local/OpenAI/Codex/bin/d375f7df50d3b421/codex.exe";

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
const html = readFileSync(caminhoPagina, "utf8");

/* Mesmo slug que o imagens.mjs usa — é o que faz a skill achar a pasta certa. */
const titulo = (html.match(/<title[^>]*>([\s\S]*?)<\/title>/i) ?? [])[1] ?? "";
const produto = titulo.split(/[—–|]/)[0].trim() || basename(pasta);
const slug = produto.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
  .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60);

const destino = join(RAIZ, "imagens-novas", slug);

/* Curto de propósito: a skill lê a página e conta bônus e depoimentos sozinha.
   Repetir a conta aqui só cria uma segunda fonte de verdade pra divergir. */
const pedido = [
  `Use a skill producao-imagens-produto.`,
  ``,
  `A página de vendas é este arquivo local:`,
  `  ${caminhoPagina}`,
  ``,
  `Entregue as imagens em: ${destino}`,
  ``,
  `Não gere foto da expert: ela é fixa no projeto e já está resolvida.`,
  `Pode entregar PNG, sem converter e sem comprimir — quem faz isso é o projeto depois.`,
].join("\n");

console.log(`Produto: ${produto}`);
console.log(`Pasta de entrega: ${destino}\n`);

/** Roda um processo até o fim e devolve o código de saída. */
const rodaAteOFim = (cmd, argumentos) =>
  new Promise((ok) => spawn(cmd, argumentos, { cwd: RAIZ, stdio: "inherit" }).on("close", (c) => ok(c ?? 1)));

/**
 * Chama o Codex com permissão de escrever — e só onde precisa.
 *
 * Sem `-s workspace-write` ele roda em modo leitura: desenha a imagem, tenta
 * copiar pro projeto, toma "acesso negado" e o PNG morre na pasta interna dele.
 * O `-C` aponta a raiz de trabalho pra pasta de entrega, então a escrita fica
 * presa ali: ele não alcança a página, os scripts nem o resto do repositório.
 */
function chamaCodex(prompt) {
  mkdirSync(destino, { recursive: true });
  return rodaAteOFim(CODEX, ["exec", "-C", destino, "-s", "workspace-write", prompt]);
}

const semTags = (s) => s.replace(/<[^>]*>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();

/**
 * O que a página ainda pede — e onde cada uma entra.
 *
 * O `alt` diz o que desenhar; o bloco e o texto em volta dizem por que aquela
 * imagem existe ali. Levar os dois é o que dispensa o Codex de abrir o HTML.
 */
function oQueFalta() {
  const atual = readFileSync(caminhoPagina, "utf8");
  return [...atual.matchAll(/<img\b[^>]*>/gi)]
    .map((m) => {
      const ph = m[0].match(/\{\{IMG:([a-z]+):(\d+)\}\}/i);
      if (!ph) return null;
      const alt = (m[0].match(/alt=["']([^"']*)["']/i) ?? [])[1] ?? "";

      /* Do começo da seção até a própria imagem: é o que a leitora já viu
         quando bate o olho nela. */
      const iniSecao = atual.slice(0, m.index).lastIndexOf("<section");
      const trecho = iniSecao < 0 ? "" : atual.slice(iniSecao, m.index);
      const bloco = (trecho.match(/class=["']([a-z-]+)["']/i) ?? [])[1] ?? ph[1].toLowerCase();
      const cabeca = semTags((trecho.match(/<h[12][^>]*>([\s\S]*?)<\/h[12]>/i) ?? [])[1] ?? "");
      const textos = [...trecho.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)]
        .map((p) => semTags(p[1])).filter(Boolean).slice(-3);

      return { arquivo: `${ph[1].toLowerCase()}-${ph[2]}`, alt, bloco, cabeca, textos };
    })
    .filter(Boolean);
}

const publicar = () => rodaAteOFim(process.execPath, [join(RAIZ, "scripts", "imagens.mjs"), pasta, "--publicar"]);

/** Uma imagem do lote que já ficou pronta, pra servir de referência de estilo. */
function referencia(arquivo) {
  if (!existsSync(destino)) return null;
  const prontas = readdirSync(destino).filter((f) => /\.(png|webp|jpe?g)$/i.test(f));
  if (!prontas.length) return null;
  const familia = arquivo.replace(/-\d+$/, "");
  return prontas.find((f) => f.startsWith(familia)) ?? prontas.find((f) => f.startsWith("hero")) ?? prontas[0];
}

/**
 * Pedido de remendo: leva o contexto mastigado, não o caminho da página.
 *
 * Mandar o HTML por causa de uma imagem só sai quase tão caro quanto o lote
 * inteiro — a skill varre a página, reconta bônus e depoimentos e reanalisa a
 * oferta antes de desenhar. Tudo que ela descobriria lá já vai escrito aqui.
 */
function pedidoParcial(lista) {
  const uma = lista.length === 1;
  const ref = referencia(lista[0].arquivo);

  const linhas = [
    `Use a skill producao-imagens-produto, mas NÃO leia nenhuma página de vendas:`,
    `o lote já foi gerado e publicado. Faltou ${uma ? "só 1 imagem" : `só ${lista.length} imagens`},`,
    `e está tudo descrito aqui embaixo.`,
    ``,
    `Produto: ${produto}`,
    `Salve em: ${destino}`,
  ];
  if (ref) linhas.push(`Referência de estilo, luz e proporção: ${join(destino, ref)}`);
  linhas.push(``, `Gere ${uma ? "este arquivo" : "estes arquivos"} e mais nada:`, ``);

  for (const f of lista) {
    linhas.push(`### ${f.arquivo}.png`);
    linhas.push(`O que desenhar: ${f.alt}`);
    linhas.push(`Onde entra: bloco "${f.bloco}"${f.cabeca ? `, logo abaixo do título "${f.cabeca}"` : ""}.`);
    for (const t of f.textos) linhas.push(`Texto ao redor: ${t}`);
    linhas.push(``);
  }

  linhas.push(
    `Regras: PNG, sem texto na imagem, sem marca d'água, sem converter e sem comprimir`,
    `(o projeto faz isso depois). Não regere nenhuma outra imagem da pasta e não mexa em`,
    `arquivo nenhum do projeto — só salve ${uma ? "o PNG pedido" : "os PNGs pedidos"}.`,
  );
  return linhas.join("\n");
}

/** Dos slots que faltam, os que já têm PNG esperando na pasta. */
function jaEstaNoDisco(lista) {
  if (!existsSync(destino)) return [];
  const arquivos = readdirSync(destino).map((a) => a.replace(/\.[^.]+$/, ""));
  return lista.filter((f) => arquivos.includes(f.arquivo));
}

/* Página que já tem imagem publicada é conserto, não lote novo: pedir tudo de
   novo custa caro e ainda por cima substitui o que já estava bom. */
const jaTemImagens = /imagens\/[^"']+\/[a-z]+-\d+\.webp/i.test(html);
let pendentes = oQueFalta();

if (soOTexto) {
  console.log("— o que seria mandado ao Codex —\n");
  console.log(jaTemImagens && pendentes.length ? pedidoParcial(pendentes) : pedido);
  process.exit(0);
}

/* PNG parado na pasta pra um slot que a página ainda pede é trabalho já feito.
   Publicar primeiro é barato; pedir ao Codex o que está no disco é dinheiro
   jogado fora — e ainda troca uma imagem boa por outra. */
const noDisco = jaEstaNoDisco(pendentes);
if (noDisco.length) {
  console.log(`${noDisco.length} já ${noDisco.length === 1 ? "está" : "estão"} na pasta. Publicando antes de chamar o Codex.\n`);
  await publicar();
  pendentes = oQueFalta();
}

if (!pendentes.length) {
  console.log("\nNada faltando: a página está com todas as imagens no ar.");
  process.exit(0);
}

if (!existsSync(CODEX)) {
  console.error(`Não achei o Codex em ${CODEX}.`);
  console.error(`Rode com --so-o-texto e cole o pedido na janela do Codex.`);
  process.exit(1);
}

if (jaTemImagens) {
  console.log(`A página já está montada; falta${pendentes.length === 1 ? "" : "m"} ${pendentes.length}. Pedindo só isso.\n`);
  for (const f of pendentes) console.log(`  ${f.arquivo}: ${f.alt.slice(0, 80)}`);
  console.log("");
  if (await chamaCodex(pedidoParcial(pendentes)) !== 0) {
    console.error("\nO Codex não terminou bem.");
    process.exit(1);
  }
} else {
  console.log("chamando o Codex… (a geração do lote leva bastante tempo)\n");
  if (await chamaCodex(pedido) !== 0) {
    console.error("\nO Codex não terminou bem. As imagens que ele já salvou continuam na pasta.");
    process.exit(1);
  }
}

console.log("\n— Codex terminou. Convertendo e publicando —\n");
await publicar();

/* Faltou alguma? Pede só as que faltam, com a descrição de cada uma, e
   publica de novo. Uma tentativa: se persistir, é caso pra olho humano. */
let faltam = oQueFalta();
if (faltam.length) {
  console.log(`\n— ainda falta${faltam.length === 1 ? "" : "m"} ${faltam.length}; pedindo só isso ao Codex —\n`);
  if (await chamaCodex(pedidoParcial(faltam)) === 0) {
    console.log("\n— publicando as que faltavam —\n");
    await publicar();
    faltam = oQueFalta();
  }
}

const quantas = existsSync(destino)
  ? readdirSync(destino).filter((f) => /\.(png|webp|jpe?g)$/i.test(f)).length
  : 0;
console.log(`\n${"=".repeat(60)}`);
console.log(`Imagens geradas: ${quantas}  ·  na pasta ${destino}`);
if (faltam.length) {
  console.log(`\nAinda falta${faltam.length === 1 ? "" : "m"} ${faltam.length} — o Codex tentou duas vezes:`);
  for (const f of faltam) console.log(`  ${f.arquivo}: ${f.alt.slice(0, 80)}`);
} else {
  console.log(`\nA página está com todas as imagens no ar.`);
}
