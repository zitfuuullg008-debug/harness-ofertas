#!/usr/bin/env node
/**
 * conferir-pagina.mjs — o corretor mecânico da página gerada.
 *
 * Existe porque regra escrita em prosa já falhou: o agente removeu o bloco do
 * expert, virou o custo fixo da calculadora num terceiro slider e depois
 * marcou os dois como acerto na própria auditoria. Auto-avaliação não pega
 * isso; contagem pega.
 *
 * Roda no fim da etapa da página e devolve uma lista de problemas. Enquanto
 * houver PROBLEMA, a página não está pronta.
 *
 * Uso:
 *   node scripts/conferir-pagina.mjs saidas/modelagem/<pasta>
 *   node scripts/conferir-pagina.mjs <pasta> --nome "Rolinho Lucrativo"
 */

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { basename, join, resolve } from "node:path";

const args = process.argv.slice(2);
const alvo = resolve(args.find((a) => !a.startsWith("--")) ?? "");
const nomeArg = (() => {
  const i = args.indexOf("--nome");
  return i >= 0 ? args[i + 1] : null;
})();

const RAIZ = resolve(new URL("..", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1"));
const TPL = join(RAIZ, "templates");

/* ------------------------------------------------------------------ */

const problemas = [];
const avisos = [];
const oks = [];
const erro = (t) => problemas.push(t);
const aviso = (t) => avisos.push(t);
const ok = (t) => oks.push(t);

if (!existsSync(alvo)) {
  console.error(`Não achei a pasta: ${alvo}`);
  process.exit(1);
}
const pagina = readdirSync(alvo).find((f) => /pagina.*\.html$/i.test(f));
if (!pagina) {
  console.error(`Não achei o HTML da página em ${alvo}`);
  process.exit(1);
}
const caminho = join(alvo, pagina);
const html = readFileSync(caminho, "utf8");

const blocosDe = (t) =>
  [...t.matchAll(/<section\b[^>]*?(?:class|id)=["']([^"']+)["']/gi)].map((m) => m[1].split(/\s+/)[0]);

const semTags = (t) => t.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");

const blocos = blocosDe(html);
const texto = semTags(html);

/* ---- 1. qual molde é o pai? o de maior parentesco de blocos ---- */

const moldes = readdirSync(TPL).filter((f) => f.endsWith(".html"));
let molde = null;
let melhor = -1;
for (const m of moldes) {
  const b = blocosDe(readFileSync(join(TPL, m), "utf8"));
  const comuns = b.filter((x) => blocos.includes(x)).length;
  if (comuns > melhor) { melhor = comuns; molde = m; }
}
const htmlMolde = readFileSync(join(TPL, molde), "utf8");
const blocosMolde = blocosDe(htmlMolde);
ok(`molde de origem: ${molde} (${melhor} blocos em comum)`);

/* ---- 2. blocos ---- */

const OBRIGATORIOS = {
  acesso: "como a pessoa recebe o produto",
  garantia: "30 dias",
  planos: "preço",
  autoridade: "o expert — TODAS as páginas do usuário têm",
  depoimentos: "prova social — o usuário SEMPRE tem depoimento real, então o bloco nunca sai",
};

for (const [b, porque] of Object.entries(OBRIGATORIOS)) {
  if (blocos.includes(b)) ok(`bloco "${b}" presente`);
  else erro(`bloco "${b}" AUSENTE — ${porque}. Nunca se remove; enxerte de templates/blocos/ ou do molde.`);
}

const faltando = blocosMolde.filter((b) => !blocos.includes(b) && !OBRIGATORIOS[b]);
if (faltando.length) aviso(`blocos do molde que saíram: ${faltando.join(", ")} — se foi por falta de conteúdo real, tudo bem; justifique no laudo`);

/* ---- 3. calculadora: exatamente duas bolinhas ---- */

const iCalc = html.search(/<section[^>]*\bcalc\b[^>]*>/i);
if (iCalc >= 0) {
  const bloco = html.slice(iCalc, html.indexOf("</section>", iCalc));
  const sliders = (bloco.match(/<input[^>]*type=["']range["'][^>]*>/gi) ?? []).length;
  if (sliders === 2) ok("calculadora com 2 bolinhas");
  else erro(`calculadora com ${sliders} bolinha(s) — têm que ser exatamente 2 (quanto vende por dia e por quanto vende). O custo é constante no código, nunca campo.`);

  if (/não sabe quanto|nao sabe quanto|descubra (o seu|esse número)|se você não souber/i.test(semTags(bloco))) {
    erro("a calculadora explica como preencher um campo — sinal de que o campo não devia existir. Tire o campo, não a frase.");
  }

  // O texto tem que combinar com o número de bolinhas que sobrou na tela.
  const porExtenso = { uma: 1, duas: 2, três: 3, tres: 3, quatro: 4 };
  const diz = semTags(bloco).match(/(uma|duas|tr[êe]s|quatro)\s+bolinhas?/i);
  if (diz && porExtenso[diz[1].toLowerCase()] !== sliders) {
    erro(`a calculadora diz "${diz[0]}" mas tem ${sliders} — o texto ficou pra trás depois de mexer nos campos.`);
  }
}

/* ---- 3b. a headline promete o resultado do mês, não o preço da unidade ---- */

// Só vale onde existe calculadora — é o que marca a oferta de "fazer e vender".
if (iCalc >= 0) {
  const h1 = semTags((html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i) ?? [])[1] ?? "");
  const valores = [...h1.matchAll(/R\$\s?([\d.]+)/g)].map((m) => Number(m[1].replace(/\./g, "")));
  const temMensal = valores.some((v) => v >= 1000);
  const temUnitario = valores.some((v) => v < 200);
  if (!valores.length) {
    erro(`a headline não promete resultado nenhum: "${h1.slice(0, 90)}"
           Em oferta de fazer e vender, a manchete carrega quanto a pessoa fatura no mês. O molde faz assim: "para lucrar R$3.000 já no primeiro mês".`);
  } else if (!temMensal && temUnitario) {
    erro(`a headline promete preço de unidade (R$${valores[0]}), não faturamento do mês.
           Ninguém quer vender uma caixa por R$30; quer faturar no mês. Troque pelo total mensal.`);
  } else ok(`headline promete resultado do mês (R$${valores.find((v) => v >= 1000)})`);
}

/* ---- 3c. renda extra: a oferta promete pouca mão na massa? ---- */

if (iCalc >= 0) {
  const topo = semTags(html.slice(0, html.search(/<section[^>]*\bproduto\b[^>]*>/i) + 1 || 9000));
  const lote = /numa tarde|uma tarde|uma vez (por|na) semana|de uma vez|em lote|congel|a semana inteira|o mês (todo|inteiro)|o ano (todo|inteiro)/i.test(topo);
  // "vende todo dia" é ótimo; "assa todo dia" é o defeito. O marcador de
  // frequência só pesa quando está colado num verbo de TRABALHO.
  const TRAB = "assa|faz|cozinh|enrol|prepar|amass|bate|fornada|forno|mão na massa";
  const FREQ = "todo dia|toda noite|todas as manhãs|diariamente";
  const diario = new RegExp(`(${FREQ})[^.!?]{0,40}(${TRAB})|(${TRAB})[^.!?]{0,40}(${FREQ})|à noite[^.!?]{0,40}de manhã`, "i").test(topo);
  if (!lote || diario) {
    aviso("o topo não promete produzir em lote — em renda extra, \"faz numa tarde e vende a semana\" é metade da oferta"
      + (diario ? " (e ainda fala em trabalho diário)" : "")
      + ".\n           Se o produto realmente não permite lote, justifique no laudo e compense a facilidade em outro eixo.");
  } else ok("promete produzir em lote (pouca mão na massa)");
}

/* ---- 4. o nome do produto tem que ser UM só ---- */

const titulo = (html.match(/<title[^>]*>([\s\S]*?)<\/title>/i) ?? [])[1] ?? "";
const nome = (nomeArg ?? titulo.split(/[—–|-]/)[0]).trim();
if (!nome) {
  erro("não consegui achar o nome do produto (nem no <title> nem em --nome)");
} else {
  const conta = (t) => (texto.match(new RegExp(t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi")) ?? []).length;
  ok(`nome canônico: "${nome}" (${conta(nome)}×)`);

  // Candidatas a nome: frases capitalizadas de 2 a 4 palavras. Fora CTA e grito.
  const CTA = /^(quero|comprar|garantir|ver|sim|acessar|baixar|comece|come[çc]ar|pegar|clique)/i;
  const freq = new Map();
  for (const m of texto.matchAll(/\b([A-ZÁÂÃÉÊÍÓÔÕÚÇ][\wÀ-ÿ]+(?:\s+(?:de|da|do|e)?\s*[A-ZÁÂÃÉÊÍÓÔÕÚÇ][\wÀ-ÿ]+){1,3})\b/g)) {
    const f = m[1].trim();
    // Caixa alta não é motivo pra ignorar: o nome do produto aparece gritado no
    // bloco de planos, e foi assim que "CINNAMON ROLL LUCRATIVO" passou batido.
    if (CTA.test(f)) continue;
    freq.set(f, (freq.get(f) ?? 0) + 1);
  }
  const vezesNome = conta(nome);

  // (a) nada que nomeie o produto pode aparecer MAIS que o nome dele.
  const maisQueONome = [...freq.entries()]
    .filter(([f, n]) => n > vezesNome && f.toLowerCase() !== nome.toLowerCase())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // (b) o mecanismo não disputa: nome rival dentro de h1, subtítulo do hero ou h2.
  const destaques = [
    ...html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi),
    ...html.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/gi),
    ...html.matchAll(/class=["'][^"']*hero-sub[^"']*["'][^>]*>([\s\S]*?)</gi),
  ].map((m) => semTags(m[1]));
  const primeiraDoNome = nome.split(/\s+/)[0].toLowerCase();
  const rivaisEmDestaque = [...freq.entries()]
    .filter(([f, n]) => n >= 3 && !f.toLowerCase().includes(primeiraDoNome))
    .filter(([f]) => destaques.some((d) => d.includes(f)))
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  if (maisQueONome.length) {
    erro(`o produto é chamado de mais de um jeito — o nome "${nome}" aparece ${vezesNome}×, menos que:\n` +
      maisQueONome.map(([f, n]) => `           "${f}" (${n}×)`).join("\n") +
      `\n           Escolha UM nome e troque o resto.`);
  } else ok(`nome é a expressão mais repetida (${vezesNome}×)`);

  if (rivaisEmDestaque.length) {
    erro(`outro nome disputa o destaque com o produto (aparece em h1/h2/subtítulo do hero):\n` +
      rivaisEmDestaque.map(([f, n]) => `           "${f}" (${n}×)`).join("\n") +
      `\n           Mecanismo explica como funciona; quem ocupa manchete é o nome do produto.`);
  } else ok("nenhum nome rival ocupando manchete");

  // O nome tem que aparecer onde a pessoa decide. Procure a SEÇÃO, não a
  // primeira menção no arquivo — senão o CSS `.planos{...}` responde primeiro.
  const raiz = nome.split(/\s+/)[0].replace(/s$/i, "");   // "Rolinhos" casa com "Rolinho"
  for (const [onde, re] of [
    ["<title>", /<title[^>]*>/i],
    ["hero", /<section[^>]*\bhero\b[^>]*>/i],
    ["planos", /<section[^>]*\bplanos\b[^>]*>/i],
  ]) {
    const i = html.search(re);
    if (i < 0) continue;
    const fim = html.indexOf("</section>", i);
    const trecho = semTags(html.slice(i, fim > i ? fim : i + 2500));
    if (!new RegExp(raiz, "i").test(trecho)) aviso(`o nome não aparece no bloco ${onde}`);
  }
}

/* ---- 4b. página em português fala português ---- */

const lang = (html.match(/<html[^>]*lang=["']([^"']+)["']/i) ?? [])[1] ?? "";
if (/^pt/i.test(lang)) {
  // O produto ser chamado em inglês numa página pt-BR é o caso concreto que
  // apareceu: "cinnamon roll" 22× ao lado de "rolinho de canela" 3×.
  const ESTRANGEIRAS = /\b(cinnamon|roll|rolls|cookie|cookies|snack|snacks|box|boxes|cake|cakes|bakery|homemade|lovers|money|business|kit off|checkout)\b/gi;
  const conta2 = new Map();
  for (const m of texto.matchAll(ESTRANGEIRAS)) {
    const k = m[0].toLowerCase();
    conta2.set(k, (conta2.get(k) ?? 0) + 1);
  }
  const fortes = [...conta2.entries()].filter(([, n]) => n >= 2).sort((a, b) => b[1] - a[1]);
  if (fortes.length) {
    erro(`página em ${lang} chamando as coisas em inglês: ` +
      fortes.map(([p, n]) => `"${p}" (${n}×)`).join(", ") +
      `\n           A compradora precisa pronunciar o nome. Use o termo em português, um só, na página inteira.`);
  } else ok(`vocabulário em português`);
}

/* ---- 4c. clareza: o público não é especialista ---- */

// Palavra que a compradora não usa no dia a dia. Se ela precisa procurar o que
// significa, já perdeu. Dá pra crescer esta lista conforme aparecer.
const JARGAO = {
  levain: "fermento natural — ou tire a menção",
  autólise: "descanso da massa",
  sova: "amassar",
  biga: "—", poolish: "—", "pré-fermento": "fermento pronto",
  temperagem: "derreter e esfriar o chocolate",
  emulsificar: "misturar até ficar liso",
  ganache: "creme de chocolate",
  "mise en place": "deixar tudo separado antes",
  hidratação: "quantidade de água",
  "glúten desenvolvido": "massa no ponto",
  chantili: "creme batido",
  "ticket médio": "quanto cada cliente paga",
  funil: "—", lead: "cliente interessado", "tráfego pago": "anúncio",
  conversão: "venda", copy: "texto", "nicho": "público", ROI: "retorno",
  escalabilidade: "crescer", "recorrência": "cliente que volta",
};

const achadosJargao = Object.keys(JARGAO).filter((p) =>
  new RegExp(`\\b${p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i").test(texto));
if (achadosJargao.length) {
  erro(`palavra que a compradora não entende: ` +
    achadosJargao.map((p) => `"${p}"${JARGAO[p] !== "—" ? ` → ${JARGAO[p]}` : ""}`).join(", ") +
    `\n           O público não é especialista. Se precisa procurar o que significa, já perdeu a venda.`);
} else ok("sem jargão");

// Manchete é manchete: curta. O subtítulo fica de fora porque lá cabe enumerar
// o que vem na oferta — o Bebê Comilão vende com 26 palavras ali.
const LIMITE = 22;
const compridas = [];
for (const [onde, re] of [
  ["h1", /<h1[^>]*>([\s\S]*?)<\/h1>/gi],
  ["h2", /<h2[^>]*>([\s\S]*?)<\/h2>/gi],
  ["pílula do hero", /class=["'][^"']*hero-pill[^"']*["'][^>]*>([\s\S]*?)<\/div>/gi],
]) {
  for (const m of html.matchAll(re)) {
    for (const frase of semTags(m[1]).split(/(?<=[.!?])\s+/)) {
      const n = frase.trim().split(/\s+/).filter(Boolean).length;
      if (n > LIMITE) compridas.push(`${onde}: ${n} palavras — "${frase.trim().slice(0, 80)}…"`);
    }
  }
}
if (compridas.length) {
  erro(`frase longa demais onde a pessoa decide (máx. ${LIMITE} palavras):\n` +
    compridas.slice(0, 5).map((c) => `           ${c}`).join("\n") +
    `\n           Uma ideia por frase. Quebre em frases curtas.`);
} else ok(`nenhuma frase acima de ${LIMITE} palavras no topo`);

// Frase curta também confunde quando empilha ação: o problema não é o tamanho,
// é a pessoa ter que segurar três coisas na cabeça ao mesmo tempo.
const empilhadas = [];
for (const [onde, re] of [
  ["h1", /<h1[^>]*>([\s\S]*?)<\/h1>/gi],
  ["subtítulo do hero", /class=["'][^"']*hero-sub[^"']*["'][^>]*>([\s\S]*?)<\/p>/gi],
  ["h2", /<h2[^>]*>([\s\S]*?)<\/h2>/gi],
]) {
  for (const m of html.matchAll(re)) {
    for (const frase of semTags(m[1]).split(/(?<=[.!?])\s+/)) {
      const f = frase.trim();
      if (f.split(/\s+/).length < 8) continue;
      // Lista de atributos não pesa — "crocante por fora, recheado por dentro" a
      // pessoa lê e solta. O que pesa é AÇÃO EM SEQUÊNCIA NO TEMPO: obriga a
      // montar uma linha do tempo na cabeça enquanto lê.
      const emendas = (f.match(/,|\s+e\s+|;/g) ?? []).length;
      // Sem \b: em JS ele só enxerga letra ASCII, e "à noite" / "de manhã"
      // ficavam de fora justamente por causa do acento.
      const tempos = (f.match(/(à noite|de manhã|de tarde|à tarde|de madrugada|depois que|depois|antes de|antes|enquanto|no dia seguinte|em seguida|na hora que|assim que)/gi) ?? []).length;
      if (emendas >= 2 && tempos >= 2) {
        empilhadas.push(`${onde}: ${tempos} momentos diferentes numa frase só — "${f.slice(0, 90)}…"`);
      }
    }
  }
}
if (empilhadas.length) {
  erro(`frase com ação empilhada — a pessoa tem que segurar coisa demais de uma vez:\n` +
    empilhadas.slice(0, 5).map((c) => `           ${c}`).join("\n") +
    `\n           Separe em frases de uma ação cada. Vírgula e "e" emendando três ideias é o sinal.`);
} else ok("nenhuma frase com ação empilhada");

// Negativa empilhada: "sem assar nada que ninguém pediu" tem três — sem, nada,
// ninguém. A pessoa precisa desfazer as três pra descobrir que a ideia é boa.
// Diga o que ela FAZ: "assando só o que já foi pago".
const negativadas = [];
for (const [onde, re] of [
  ["h1", /<h1[^>]*>([\s\S]*?)<\/h1>/gi],
  ["h2", /<h2[^>]*>([\s\S]*?)<\/h2>/gi],
  ["subtítulo do hero", /class=["'][^"']*hero-sub[^"']*["'][^>]*>([\s\S]*?)<\/p>/gi],
  ["pílula do hero", /class=["'][^"']*hero-pill[^"']*["'][^>]*>([\s\S]*?)<\/div>/gi],
]) {
  for (const m of html.matchAll(re)) {
    for (const frase of semTags(m[1]).split(/(?<=[.!?])\s+/)) {
      const f = frase.trim();
      const n = (f.match(/(^|\s)(não|nada|ninguém|nunca|nenhum|nenhuma|jamais|sem)(\s|$|,|\.)/gi) ?? []).length;
      if (n >= 3) negativadas.push(`${onde}: ${n} negativas — "${f.slice(0, 85)}…"`);
    }
  }
}
if (negativadas.length) {
  erro(`negativa empilhada — a pessoa desfaz três vezes antes de entender:\n` +
    negativadas.slice(0, 4).map((c) => `           ${c}`).join("\n") +
    `\n           Diga o que ela FAZ, não o que deixa de fazer. "sem assar nada que ninguém pediu" → "assando só o que já foi pago".`);
} else ok("nenhuma negativa empilhada");

/* ---- 5. tangibilidade: palavra abstrata ---- */

const BANIDAS = /\b(guia|curso|m[ée]todo|manual|material|conte[úu]do|m[óo]dulos?|e-?book)\b/gi;
const achadas = [...new Set((texto.match(BANIDAS) ?? []).map((x) => x.toLowerCase()))];
if (achadas.length) aviso(`palavra abstrata na página: ${achadas.join(", ")} — troque por número + coisa, ou confirme que é uso legítimo`);
else ok("nenhuma palavra abstrata banida");

/* ---- 6. vestígios do molde ---- */

const vestigios = [];
for (const m of moldes) {
  const h = readFileSync(join(TPL, m), "utf8");
  const t = (h.match(/<title[^>]*>([\s\S]*?)<\/title>/i) ?? [])[1] ?? "";
  const produto = t.split(/[—–|-]/)[0].trim();
  if (produto && produto.length > 4 && texto.toLowerCase().includes(produto.toLowerCase())) vestigios.push(`nome "${produto}" (de ${m})`);
  for (const ck of new Set([...h.matchAll(/pay\.hotmart\.com\/([A-Z0-9]+)/gi)].map((x) => x[1]))) {
    if (html.includes(ck)) vestigios.push(`checkout ${ck} (de ${m})`);
  }
}
if (vestigios.length) erro(`sobrou conteúdo do molde na página: ${[...new Set(vestigios)].join(", ")}`);
else ok("nada do molde vazou pra oferta nova");

/* ---- 7. peso ---- */

const kb = (t) => Math.round(Buffer.byteLength(t, "utf8") / 1024);
const pNova = kb(html);
const pMolde = kb(htmlMolde);
if (pNova > pMolde * 1.15) erro(`a página ficou ${pNova}KB contra ${pMolde}KB do molde (+${Math.round((pNova / pMolde - 1) * 100)}%) — não deve ficar mais pesada que a que já vende`);
else ok(`peso ${pNova}KB (molde: ${pMolde}KB)`);

/* ---- 8. o que falta preencher ---- */

const imgs = (html.match(/\{\{IMG:[^}]*\}\}/g) ?? []).length;
const checkout = (html.match(/\{\{CHECKOUT\}\}/g) ?? []).length;
if (imgs) aviso(`${imgs} imagem(ns) por preencher — normal, entram na Atomicat`);
if (checkout) aviso(`${checkout} link(s) de checkout por preencher`);

/* Antes daqui só se contava IMG e CHECKOUT — e uma página cheia de
   {{DEPO_NOME_n}} passava com zero problema, porque ninguém olhava. Marcador
   que sobrou não é detalhe: é texto que vai pro ar com chave e tudo. */
const outros = [...new Set(html.match(/\{\{(?!IMG:|CHECKOUT\}\})[^}]*\}\}/g) ?? [])];
if (outros.length) {
  erro(`${outros.length} marcador(es) sem preencher: ${outros.slice(0, 6).join(" ")}${outros.length > 6 ? " …" : ""}`);
}

/* ------------------------------------------------------------------ */

console.log(`\nConferência de ${basename(alvo)}/${pagina}\n`);
for (const t of oks) console.log(`  ok      ${t}`);
for (const t of avisos) console.log(`  aviso   ${t}`);
for (const t of problemas) console.log(`  PROBLEMA ${t}`);
console.log(`\n${problemas.length} problema(s), ${avisos.length} aviso(s).`);
if (problemas.length) console.log("A página não está pronta. Corrija e rode de novo.\n");
process.exit(problemas.length ? 2 : 0);
