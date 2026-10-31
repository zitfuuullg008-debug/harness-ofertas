// Gera as receitas do app "Enfeites de Crochê Natalinos": 120 (6 grupos de 20) + 45 dos bônus (20 mesa posta, 15 meias e botinhas, 10 mini amigurumis),
// com a contagem de cada rodada CALCULADA por código.   node saidas/modelagem/2026-10-27-natal-croche/app/gerar-dados.mjs  ->  dados.json
// Abreviações: AM anel mágico · corr correntinha · pb ponto baixo · pma ponto meio alto · pa ponto alto · aum aumento (2 pb no mesmo ponto) · dim diminuição (2 pb juntos) · BLO só o laço de trás
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
const AQUI = dirname(fileURLToPath(import.meta.url));

export const COR = {
  vermelho: ["Vermelho", "#C0392B"], vinho: ["Vinho", "#8E2A3B"], verde: ["Verde-natal", "#2F6B3A"], verdeClaro: ["Verde-claro", "#6FA25B"], branco: ["Branco", "#FBFAF6"],
  creme: ["Creme", "#F1E6CE"], dourado: ["Dourado", "#D4A838"], prata: ["Prata", "#B9BDC4"], marrom: ["Marrom", "#7A5238"], bege: ["Bege", "#D9C3A0"], pele: ["Pêssego", "#F2C4A0"],
  preto: ["Preto", "#2B2B2B"], laranja: ["Laranja", "#E9843A"], azulClaro: ["Azul-gelo", "#A8CBE2"], rosa: ["Rosa-chá", "#E8B4B8"], cinza: ["Cinza", "#9A9A94"], amarelo: ["Amarelo", "#F2CB3B"],
};
const nomeCor = (k) => COR[k][0];

// ---------- contagem ----------
const comp = (lista) => {
  const out = []; let i = 0, r = 1;
  while (i < lista.length) {
    let j = i; while (j + 1 < lista.length && lista[j + 1].t === lista[i].t && lista[j + 1].n === lista[i].n) j++;
    const a = r, b = r + (j - i);
    out.push(a === b ? `R${a}: ${lista[i].t} (${lista[i].n})` : `R${a} a R${b} (${b - a + 1} voltas iguais): ${lista[i].t} (${lista[i].n})`);
    r = b + 1; i = j + 1;
  }
  return out;
};
const inc = (i) => (i === 1 ? { n: 6, t: "6 pb no anel mágico" } : i === 2 ? { n: 12, t: "aum em todos os pontos" } : { n: 6 * i, t: `(${i - 2} pb, aum) x6` });
const dec = (j) => (j === 1 ? { n: 6, t: "dim em todos os pontos" } : { n: 6 * j, t: `(${j - 1} pb, dim) x6` });
const soma = (l) => l.reduce((s, x) => s + x.n, 0);
const reta = (k) => ({ n: 6 * k, t: "1 pb em cada ponto" });

const disco = (k, extra = []) => { const l = []; for (let i = 1; i <= k; i++) l.push(inc(i)); extra.forEach((e) => l.push(e)); return { linhas: comp(l), pontos: soma(l) }; };
// esfera: sobe até 6m, s voltas retas e desce. modo "fechada" (enchida) ou "aberta" (para a bexiga: deixa 12 pontos)
const esfera = (m, s, modo = "fechada") => {
  const l = []; for (let i = 1; i <= m; i++) l.push(inc(i));
  for (let i = 0; i < s; i++) l.push(reta(m));
  const ate = modo === "aberta" ? 2 : 1;
  for (let j = m - 1; j >= ate; j--) l.push(dec(j));
  const linhas = comp(l);
  linhas.push(modo === "aberta" ? "Corte o fio, deixe a abertura de 12 pontos para a bexiga e esconda a ponta." : "Encha bem, feche o último furo com a agulha de tapeçaria e esconda o fio.");
  return { linhas, pontos: soma(l) };
};
const corpo = (m, s, fechado = true) => (fechado ? esfera(m, s) : (() => { const l = []; for (let i = 1; i <= m; i++) l.push(inc(i)); for (let i = 0; i < s; i++) l.push(reta(m)); const li = comp(l); li.push("Termine com 1 ponto baixíssimo e deixe um fio longo para costurar. Encha só no final."); return { linhas: li, pontos: soma(l) }; })());
const cupula = (m, s) => corpo(m, s, false);
// cone: cada volta de aumento é seguida de uma volta reta
const cone = (m) => { const l = []; for (let i = 1; i <= m; i++) { l.push(inc(i)); l.push(reta(i)); } const li = comp(l); li.push("Termine com 1 ponto baixíssimo, deixe um fio longo para costurar. Encha de leve."); return { linhas: li, pontos: soma(l) }; };
const tubo = (k, h) => { const l = []; for (let i = 1; i <= k; i++) l.push(inc(i)); for (let i = 0; i < h; i++) l.push(reta(k)); const li = comp(l); li.push("Termine com 1 ponto baixíssimo e esconda o fio."); return { linhas: li, pontos: soma(l) }; };
const folha = (n) => {
  const meio = n - 5; const lado = `1 pb, 1 pma, ${meio} pa, 1 pma, 1 pb`;
  return { linhas: [`Corr ${n}.`, `Na 2ª corr a partir da agulha: ${lado} (${n - 1} pontos).`, "Na última corr (base da folha): 3 pb, para arredondar.", `Volte pelo outro lado da corrente: ${lado} (${n - 1} pontos).`, "Feche com 1 ponto baixíssimo, corte o fio e esconda a ponta."], pontos: n + (n - 1) + 3 + (n - 1) };
};
const cordao = (n) => ({ linhas: [`Corr ${n + 1}.`, `Na 2ª corr a partir da agulha, 1 pb em cada corr (${n} pontos).`, "Corte o fio e esconda as pontas."], pontos: n + 1 + n });
const faixa = (w, h) => ({ linhas: [`Corr ${w + 1}.`, `Volta 1: 1 pb em cada corr a partir da 2ª (${w} pontos).`, `Voltas 2 a ${h}: 1 corr de virada e 1 pb em cada ponto (${w} pontos por volta).`, "Corte o fio e esconda as pontas."], pontos: w + 1 + w * h });
const concha = (n) => ({ linhas: [`Borda de conchinhas: (1 pb, 3 pa no mesmo ponto, pule 2 pontos) x${n / 3} (${(n / 3) * 4}).`, "Feche com 1 ponto baixíssimo, corte o fio e esconda a ponta."], pontos: (n / 3) * 4 });
const comBorda = (k) => { const d = disco(k); const b = concha(6 * k); return { linhas: [...d.linhas, ...b.linhas], pontos: d.pontos + b.pontos }; };
const triangulo = (w) => {
  const li = [`Corr ${w + 1}.`, `Volta 1: 1 pb em cada corr a partir da 2ª (${w} pontos).`]; let n = w, v = 2, pts = w + 1 + w;
  while (n > 1) { n -= 2; li.push(`Volta ${v}: 1 corr de virada, dim, 1 pb em cada ponto até restarem 2, dim (${n}).`); pts += n; v++; }
  li.push("Corte o fio e esconda as pontas."); return { linhas: li, pontos: pts };
};
const coracao = (k) => {
  const li = ["Corr 2.", "Volta 1: 3 pb na 2ª corr (3 pontos)."]; let w = 3, pts = 2 + 3;
  for (let r = 2; r <= k; r++) { w += 2; pts += w; li.push("Volta " + r + ": 1 corr de virada, aum, 1 pb em cada ponto até o último, aum (" + w + ").") }
  let v = k + 1, n = k, lobo = k;
  li.push("Lobo da esquerda, volta " + v + ": 1 corr de virada e 1 pb nos primeiros " + k + " pontos, deixe os outros parados (" + k + ").");
  while (n > 2) { n -= 1; v++; lobo += n; li.push("Volta " + v + ": 1 corr de virada, 1 pb em cada ponto com 1 dim no fim (" + n + ").") }
  li.push("Corte o fio. Lobo da direita: prenda o fio no ponto seguinte ao do meio (deixe 1 ponto parado entre os lobos) e repita as mesmas voltas do lobo da esquerda.");
  pts += lobo * 2; li.push("Corte o fio e esconda as pontas."); return { linhas: li, pontos: pts };
};
// meia ou botinha: duas peças planas (frente e costas)
const meiaPeca = (w, h, f, hp) => {
  const li = [`Corr ${w + 1}.`, `Volta 1: 1 pb em cada corr a partir da 2ª (${w}).`, `Voltas 2 a ${h} (${h - 1} voltas iguais): 1 corr de virada e 1 pb em cada ponto (${w}).`,
    `Volta ${h + 1} (começa o pé): 1 corr de virada, 1 pb em cada ponto e mais ${f} corr no fim (${w} pontos + ${f} corr).`, `Volta ${h + 2}: 1 corr de virada, 1 pb em cada corr e em cada ponto (${w + f}).`,
    `Voltas ${h + 3} a ${h + 2 + hp} (${hp} voltas iguais): 1 corr de virada e 1 pb em cada ponto (${w + f}).`, `Ponta do pé, 3 voltas: 1 corr de virada, 1 pb em cada ponto e 1 dim no fim de cada volta (${w + f - 1}, ${w + f - 2}, ${w + f - 3}).`, "Corte o fio e esconda as pontas."];
  const pts = w + 1 + w + w * (h - 1) + w + f + (w + f) + (w + f) * hp + (w + f - 1) + (w + f - 2) + (w + f - 3);
  return { linhas: li, pontos: pts };
};
// pétalas e folhas da poinsétia
const poinsetia = (cp, cv) => [P("Pétalas da poinsétia", cp, 8, folha(9)), P("Folhas verdes", cv, 5, folha(10)), P("Centro da flor", "dourado", 1, disco(2))];

const grams = (p) => Math.max(5, Math.ceil((p * 0.02) / 5) * 5);
const horas = (min) => (min >= 60 ? `${Math.floor(min / 60)}h${min % 60 ? String(min % 60).padStart(2, "0") : ""}` : `${min} min`);
function P(nome, cor, qtd, pc) { return { nome, cor, qtd, linhas: pc.linhas, pontos: pc.pontos }; }
const sz = (t, a) => (t === "P" ? a[0] : t === "G" ? a[2] : a[1]);

// ---------- peças-enfeite reaproveitadas ----------
const DECO = {
  flor: (c) => [P("Pétalas da flor", c, 5, folha(7)), P("Centro da flor", "dourado", 1, disco(2))],
  estrela: (c) => [P("Pontas da estrela", c, 5, folha(7)), P("Centro da estrela", c, 1, disco(2))],
  azevinho: (c) => [P("Folhas de azevinho", "verde", 3, folha(8)), P("Frutinhas", c, 3, corpo(2, 0))],
  laco: (c) => [P("Laço", c, 1, faixa(12, 3)), P("Centro do laço", c, 1, faixa(4, 3))],
  rena: () => [P("Cabeça da rena", "marrom", 1, corpo(3, 2)), P("Chifres", "marrom", 2, cordao(8)), P("Nariz", "vermelho", 1, corpo(2, 0))],
  papai: () => [P("Rostinho", "pele", 1, corpo(3, 2)), P("Gorro", "vermelho", 1, cupula(3, 1)), P("Pompom", "branco", 1, corpo(2, 0)), P("Barba", "branco", 1, disco(3))],
  neve: () => [P("Cabeça do boneco de neve", "branco", 1, corpo(3, 2)), P("Nariz", "laranja", 1, corpo(2, 0)), P("Cachecol", "vermelho", 1, faixa(14, 2))],
  arvore: (c) => [P("Mini árvore", "verde", 1, cone(2)), P("Estrelinha", "dourado", 1, disco(2))],
  presente: (c) => [P("Mini presente", c, 1, faixa(7, 7)), P("Fitinha", "dourado", 1, cordao(14))],
};
const MONT_DECO = {
  flor: "Costure a flor no porta-guardanapo, com o centro dourado no meio.", estrela: "Costure a estrela no meio da peça.", azevinho: "Costure as 3 folhas juntas e as 3 frutinhas no centro, na parte da frente.", laco: "Amarre o laço com o centro e costure na frente.",
  rena: "Costure a cabeça da rena, os chifres e o nariz vermelho na frente da peça.", papai: "Costure o gorro e a barba no rostinho, e o pompom na ponta do gorro.", neve: "Costure o nariz e o cachecolzinho na cabeça do boneco de neve.", arvore: "Costure a mini árvore e a estrelinha.", presente: "Costure o mini presente com a fita em cruz.",
};

// ---------- modelos ----------
// cada um devolve { partes:[{nome,cor,qtd,linhas,pontos}], mont:[passos], dicas:[], cm, olhos?, enche?, cola?, extrasEsp?:[] }
const M = {};

M.bola = (v) => {
  const m = sz(v.t, [6, 7, 8]), s = sz(v.t, [2, 3, 4]);
  const partes = [P("Esfera aberta", v.c1, 1, esfera(m, s, "aberta")), P("Cordão para pendurar", "dourado", 1, cordao(24))];
  if (v.topo === "laco") partes.push(...DECO.laco(v.c2));
  if (v.topo === "estrela") partes.push(...DECO.estrela(v.c2));
  if (v.topo === "folhas") partes.push(...DECO.azevinho("vermelho"));
  if (v.topo === "flor") partes.push(...DECO.flor(v.c2));
  if (v.topo === "faixas") partes.push(P("Faixas (cordões)", v.c2, 3, cordao(sz(v.t, [30, 36, 42]))));
  const cm = Math.round(m * 0.86);
  const mont = [`Faça a esfera inteira sem encher: ela fica como uma redinha fechada, com a abertura no alto (cerca de ${cm} cm).`, `Encha uma bexiga pequena até caber dentro da esfera, sem esticar os pontos (cerca de ${cm} cm).`,
    "Misture cola branca e água na mesma medida (1 para 1) e passe a mistura com o pincel por fora e por dentro da esfera, sem deixar escorrer. Para ficar firme, passe 2 camadas.", "Pendure a bolinha pelo cordão num varal e deixe secar por 24 horas, longe de umidade.",
    "Quando estiver dura, fure a bexiga com uma agulha e puxe-a pela abertura.", v.topo === "faixas" ? "Costure as 3 faixas em volta da bolinha, da abertura até a base." : `Costure o enfeite (${v.topo === "laco" ? "laço" : v.topo === "estrela" ? "estrela" : v.topo === "folhas" ? "azevinho" : "flor"}) na abertura e prenda o cordão por dentro.`];
  return { partes, mont, dicas: ["Faça primeiro uma bolinha de teste: a proporção de cola e água pode mudar conforme a marca. Se ficar mole, use 2 partes de cola para 1 de água.", "Passo a passo completo em Ferramentas, em Bolinhas engomadas."], cm, cola: true };
};
M.arvore = (v) => {
  const m = sz(v.t, [3, 4, 5]);
  const partes = [P("Cone da árvore", v.c1, 1, cone(m)), P("Tronco", "marrom", 1, corpo(2, 2, false)), P("Bolinhas de enfeite", v.c2, 6, corpo(2, 0)), P("Estrelinha do topo", "dourado", 1, disco(2))];
  return { partes, mont: ["Encha o cone de leve e costure o tronco na base.", "Costure as 6 bolinhas espalhadas pela árvore, de baixo para cima.", "Costure a estrelinha no topo.", "Prenda um cordão no topo para pendurar na árvore ou deixe em pé sobre a mesa."], dicas: ["Use um pouco de enchimento firme na base para a árvore ficar em pé."], cm: Math.round(m * 3.2), enche: true };
};
M.sino = (v) => {
  const m = sz(v.t, [3, 4, 5]);
  const copa = []; for (let i = 1; i <= m; i++) copa.push(inc(i)); for (let i = 0; i < 2; i++) copa.push(reta(m)); copa.push({ n: 9 * m, t: `(1 pb, aum) x${3 * m}` }); copa.push({ n: 9 * m, t: "1 pb em cada ponto" });
  const lin = comp(copa); lin.push("Termine com 1 ponto baixíssimo, corte o fio e esconda a ponta.");
  const partes = [P("Corpo do sino", v.c1, 1, { linhas: lin, pontos: soma(copa) }), P("Badalo", "dourado", 1, corpo(2, 1)), P("Laço", v.c2, 1, faixa(10, 3)), P("Cordão para pendurar", "dourado", 1, cordao(18))];
  return { partes, mont: ["Costure o badalo por dentro, preso no topo do sino por um fio de 3 cm.", "Prenda o cordão no topo e amarre o laço por cima.", "Se quiser o sino firme, passe uma camada de cola com água por dentro e deixe secar."], dicas: ["Para dar som, coloque um guizo pequeno no lugar do badalo."], cm: Math.round(m * 2.6) };
};
M.pacote = (v) => {
  const w = sz(v.t, [8, 10, 12]);
  const partes = [P("Frente e costas da caixinha", v.c1, 2, faixa(w, w)), P("Lateral da caixinha", v.c1, 1, faixa(w * 4, w / 2)), P("Fita em cruz", v.c2, 2, cordao(w * 2)), P("Laço", v.c2, 1, faixa(12, 3)), P("Centro do laço", v.c2, 1, faixa(4, 3))];
  return { partes, mont: ["Costure a lateral em anel e prenda a frente e as costas, deixando uma abertura para encher.", "Encha de leve e feche a abertura.", "Costure as 2 fitas em cruz sobre a caixinha e o laço no meio.", "Prenda um cordão para pendurar."], dicas: [], cm: Math.round(w * 0.55), enche: true };
};
M.coracao = (v) => {
  const k = sz(v.t, [5, 7, 9]);
  const partes = [P("Coração (frente e costas)", v.c1, 2, coracao(k)), P("Cordão para pendurar", v.c2, 1, cordao(20))];
  if (v.borda) partes.push(P("Contorno", v.borda, 1, cordao(k * 8)));
  return { partes, mont: ["Una a frente e as costas com pontos baixos em volta, encha de leve antes de fechar.", v.borda ? "Costure o contorno por cima da emenda." : "Esconda a emenda passando o fio por dentro.", "Prenda o cordão no vão entre os dois lobos."], dicas: [], cm: Math.round(k * 1.2), enche: true };
};
M.azevinho = (v) => ({ partes: [P("Folhas de azevinho", v.c1, 3, folha(10)), P("Frutinhas", v.c2, 3, corpo(2, 1)), P("Cordão para pendurar", "dourado", 1, cordao(18))], mont: ["Costure as 3 folhas pelas bases, abertas em leque.", "Costure as 3 frutinhas no centro, juntas.", "Prenda o cordão atrás."], dicas: ["Passe cola com água nas folhas e deixe secar sobre um papel para ficarem firmes."], cm: 8 });
M.bengala = (v) => ({ partes: [P(`Cordão ${nomeCor(v.c1).toLowerCase()}`, v.c1, 1, cordao(36)), P(`Cordão ${nomeCor(v.c2).toLowerCase()}`, v.c2, 1, cordao(36)), P("Laço", "vermelho", 1, faixa(10, 3))], mont: ["Una os dois cordões lado a lado e torça um sobre o outro, como uma trança de dois fios.", "Dobre a ponta em gancho, prenda com 1 ponto de fio e deixe secar com um pouquinho de cola e água.", "Amarre o laço na curva da bengala e prenda um cordão para pendurar."], dicas: ["Se quiser a bengala bem rígida, passe um arame fino encapado por dentro de um dos cordões."], cm: 10 });
M.meia = (v) => {
  const [w, h, f, hp] = { mini: [12, 10, 4, 5], P: [18, 24, 8, 8], M: [24, 34, 10, 10], G: [30, 44, 12, 12], pet: [14, 16, 6, 6], bota: [16, 10, 6, 8] }[v.t];
  const partes = [P(v.t === "bota" ? "Botinha (frente e costas)" : "Meia (frente e costas)", v.c1, 2, meiaPeca(w, h, f, hp)), P("Punho", v.c2, 1, faixa(2 * w, v.t === "bota" ? 4 : 5)), P("Cordão para pendurar", v.c2, 1, cordao(16))];
  if (v.pata) partes.push(P("Patinha de bordado", v.pata, 1, corpo(2, 1)));
  const mont = ["Una a frente e as costas com pontos baixos em volta, deixando o alto aberto.", "Feche o punho em anel e costure no alto da meia.", "Prenda o cordão no canto do punho para pendurar."];
  if (v.pata) mont.push("Costure a patinha na frente da meia.");
  return { partes, mont, dicas: [v.t === "bota" ? "Para a botinha de bebê, prenda os dois lados em cima com um botão." : "Encha de leve a ponta do pé com um pouco de papel de seda para a meia ficar com forma."], cm: Math.round(h * 0.45 + f * 0.45 + 4) };
};

// ---- figuras (amigurumis) ----
const TOK = {
  gorro: (c, m) => [P("Gorro", c, 1, cupula(m, 2)), P("Pompom do gorro", "branco", 1, corpo(2, 0))],
  gorroAlto: (c, m) => [P("Gorro alto de gnomo", c, 1, cone(m + 2))],
  barba: (c, m) => [P("Barba", c, 1, disco(m))],
  nariz: (c) => [P("Nariz", c, 1, corpo(2, 0))],
  orelhas: (c) => [P("Orelhas", c, 2, disco(2))],
  orelhaPonta: (c) => [P("Orelhas pontudas", c, 2, folha(6))],
  chifres: (c) => [P("Chifres", c, 2, cordao(10))],
  cachecol: (c) => [P("Cachecol", c, 1, faixa(26, 3))],
  bracos: (c) => [P("Braços", c, 2, corpo(2, 3, false))],
  pes: (c) => [P("Pés", c, 2, corpo(2, 2))],
  botoes: (c) => [P("Botões", c, 3, corpo(2, 0))],
  asas: (c) => [P("Asas", c, 2, folha(10))],
  aureola: (c) => [P("Auréola", c, 1, cordao(22))],
  cinto: (c) => [P("Cinto", c, 1, faixa(20, 2))],
  rabo: (c) => [P("Rabo", c, 1, corpo(2, 2, false))],
  bico: (c) => [P("Bico", c, 1, cone(2))],
  cartola: (c) => [P("Copa da cartola", c, 1, disco(3, [reta(3), reta(3), reta(3)])), P("Aba da cartola", c, 1, disco(5))],
  barriga: (c, m) => [P("Barriga", c, 1, disco(m))],
  cabelo: (c, m) => [P("Cabelo", c, 1, cupula(m, 1))],
  focinho: (c) => [P("Focinho", c, 1, corpo(2, 1))],
  lacinho: (c) => [P("Lacinho", c, 1, faixa(10, 3))],
};
const MONT_TOK = {
  gorro: "Costure o gorro na cabeça e o pompom na ponta.", gorroAlto: "Costure o gorro alto na cabeça, cobrindo a testa.", barba: "Costure a barba na parte de baixo do rosto.", nariz: "Costure o nariz no meio do rosto.", orelhas: "Costure as orelhas nas laterais da cabeça.",
  orelhaPonta: "Costure as orelhas pontudas nas laterais da cabeça.", chifres: "Costure os chifres no alto da cabeça.", cachecol: "Enrole o cachecol no pescoço e dê um ponto atrás para prender.", bracos: "Costure os braços nas laterais do corpo.", pes: "Costure os pés na base do corpo.",
  botoes: "Costure os 3 botões em fila no meio do corpo.", asas: "Costure as asas nas costas.", aureola: "Feche o cordão em anel e costure sobre a cabeça.", cinto: "Dê a volta no corpo com o cinto e costure atrás.", rabo: "Costure o rabo atrás do corpo.", bico: "Costure o bico no meio do rosto.",
  cartola: "Costure a copa na aba e a aba na cabeça.", barriga: "Costure a barriga na frente do corpo.", cabelo: "Costure o cabelo na cabeça.", focinho: "Costure o focinho no meio do rosto.", lacinho: "Amarre o lacinho e costure no alto da cabeça.",
};
M.figura = (v) => {
  const [mh, sh, mb, sb] = { mini: [3, 1, 3, 2], P: [3, 2, 4, 2], M: [4, 2, 5, 3], G: [5, 3, 6, 4] }[v.t || "M"];
  const partes = [P("Cabeça", v.cabeca, 1, corpo(mh, sh)), P("Corpo", v.corpo, 1, corpo(mb, sb))];
  const mont = ["Encha a cabeça e o corpo bem firmes e feche os furos.", "Costure a cabeça no corpo, com pontos pequenos em volta."];
  Object.entries(v.tk).forEach(([k, c]) => { partes.push(...TOK[k](c, mh)); mont.push(MONT_TOK[k]); });
  mont.push("Bordado do rosto: 2 olhos de segurança (ou pontos de fio preto) e bochechas de blush rosa.");
  return { partes, mont, dicas: ["Faça as peças pequenas (nariz, botões) por último e costure com o fio da mesma cor."], cm: Math.round((mh + mb) * 0.86 + 1), olhos: true, enche: true };
};

// ---- peças de mesa ----
M.descanso = (v) => { const k = v.k || 10; return { partes: [P("Descanso redondo", v.c1, 1, comBorda(k)), ...(v.deco ? DECO[v.deco](v.c2) : [])], mont: ["Faça o disco inteiro, voltas de aumento até o tamanho e depois a borda de conchinhas.", ...(v.deco ? [MONT_DECO[v.deco]] : []), "Passe a peça a ferro morno, com um pano úmido por cima, para ficar plana."], dicas: ["Use fio de algodão: aguenta a água do copo e pode ser lavado."], cm: Math.round(k * 1.0) }; };
M.anel = (v) => ({ partes: [P("Faixa do porta-guardanapo", v.c1, 1, faixa(26, 6)), ...DECO[v.deco](v.c2)], mont: ["Feche a faixa em anel, costurando as pontas com ponto invisível.", MONT_DECO[v.deco], "Passe o guardanapo dobrado pelo anel."], dicas: ["Faça os 4 iguais da mesma cor para a ceia."], cm: 5 });
M.marcador = (v) => ({ partes: [P("Plaquinha do nome", v.c1, 1, faixa(14, 10)), P("Borda da plaquinha", v.c2, 1, cordao(48)), ...DECO[v.deco](v.c2)], mont: ["Costure a borda em volta da plaquinha.", MONT_DECO[v.deco], "Escreva o nome do convidado com caneta de tecido e dobre a plaquinha ao meio, em pé."], dicas: [], cm: 6 });
M.centro = (v) => { const k = v.k || 14; return { partes: [P("Base redonda", v.c1, 1, comBorda(k)), ...poinsetia(v.c2, "verde")], mont: ["Faça a base com a borda de conchinhas e passe a ferro morno.", "Costure as 5 folhas verdes em estrela no centro da base.", "Costure as 8 pétalas por cima, em duas camadas, e o centro dourado no meio."], dicas: ["Coloque uma vela de LED no meio, sem chama."], cm: Math.round(k * 1.0) }; };
M.americano = (v) => { const k = v.k || 30; return { partes: [P("Jogo americano redondo", v.c1, 1, comBorda(k))], mont: ["Faça o disco inteiro, sem fechar de uma vez: confira o tamanho a cada 5 voltas.", "Faça a borda de conchinhas.", "Passe a ferro morno com um pano úmido por cima."], dicas: ["Este tamanho é para prato raso; para sousplat use o modelo menor."], cm: Math.round(k * 0.9) }; };
M.caminho = (v) => ({ partes: [P("Caminho de mesa", v.c1, 1, faixa(32, 110)), P("Bolinhas das pontas", v.c2, 6, corpo(2, 1))], mont: ["Faça o retângulo em vai e volta, conferindo o comprimento a cada 20 voltas.", "Costure 3 bolinhas em cada ponta, igualmente espaçadas.", "Passe a ferro morno com um pano úmido por cima."], dicas: ["Para uma mesa maior, repita as voltas retas (a receita já mostra o total de cada volta)."], cm: 120 });
M.cesta = (v) => ({ partes: [P("Fundo da cesta", v.c1, 1, disco(5)), P("Parede da cesta", v.c1, 1, { linhas: ["R6: 1 pb em cada ponto, só no laço de trás (BLO), é essa volta que levanta a parede (30).", "R7 a R14 (8 voltas iguais): 1 pb em cada ponto (30).", "Termine com 1 ponto baixíssimo e esconda o fio."], pontos: 270 }), P("Alça", v.c2, 1, cordao(36)), ...v.deco.flatMap((d) => DECO[d]())], mont: ["Costure o fundo na parede (a parede já nasce do fundo na R6).", "Costure a alça nas laterais.", ...v.deco.map((d) => MONT_DECO[d])], dicas: ["Passe cola com água por dentro da cesta e deixe secar com um pote dentro para ficar firme."], cm: 12 });
M.bolso = (v) => ({ partes: [P("Bolso porta-talher", v.c1, 1, faixa(14, 18)), P("Borda", v.c2, 1, cordao(60)), ...DECO.azevinho("vermelho")], mont: ["Dobre o retângulo, deixando a frente mais baixa, e costure as laterais.", "Costure a borda no contorno.", MONT_DECO.azevinho], dicas: [], cm: 14 });
M.vela = (v) => ({ partes: [P("Capa da vela", v.c1, 1, tubo(5, 12)), P("Borda de cima", v.c2, 1, concha(30))], mont: ["Faça a capa com o fundo e as 12 voltas retas.", "Faça a borda de conchinhas em volta da abertura.", "Coloque um copinho de vidro com vela de LED dentro."], dicas: ["Use sempre vela de LED: o crochê não pode ficar perto de chama."], cm: 10 });
M.gorroGarrafa = (v) => ({ partes: [P("Gorro", v.c1, 1, cupula(5, 6)), P("Pompom", "branco", 1, corpo(2, 0)), P("Barra", v.c2, 1, faixa(30, 3))], mont: ["Costure o pompom na ponta do gorro.", "Feche a barra em anel e costure na abertura do gorro.", "Coloque sobre a tampa da garrafa."], dicas: [], cm: 14 });
M.cestaPaes = (v) => ({ partes: [P("Fundo", v.c1, 1, disco(8)), P("Parede", v.c1, 1, { linhas: ["R9: 1 pb em cada ponto, só no laço de trás (BLO) (48).", "R10 a R17 (8 voltas iguais): 1 pb em cada ponto (48).", "Termine com 1 ponto baixíssimo e esconda o fio."], pontos: 432 }), P("Borda", v.c2, 1, concha(48))], mont: ["Faça o fundo e a parede em uma peça só.", "Faça a borda de conchinhas na abertura.", "Forre com um guardanapo de tecido antes de colocar os pãezinhos."], dicas: [], cm: 14 });
M.argola = (v) => ({ partes: [P("Argola", v.c1, 1, cordao(24)), ...DECO.flor(v.c2)], mont: ["Feche o cordão em argola.", MONT_DECO.flor, "Passe pela haste da taça."], dicas: ["Faça uma cor diferente para cada convidado e ninguém troca de taça."], cm: 4 });

// ---- guirlandas e portas ----
M.coroa = (v) => {
  const H = sz(v.t, [95, 140, 195]), d = sz(v.t, [12, 18, 25]);
  const partes = [P("Tubo da guirlanda", v.c1, 1, tubo(4, H - 4))];
  const dec = v.deco || [];
  if (dec.includes("bolinhas")) partes.push(P("Bolinhas vermelhas", "vermelho", 12, corpo(2, 1)));
  if (dec.includes("laco")) partes.push(...DECO.laco("vermelho"));
  if (dec.includes("folhas")) partes.push(P("Folhas", "verde", 12, folha(9)));
  if (dec.includes("azevinho")) partes.push(...DECO.azevinho("vermelho"));
  if (dec.includes("estrelas")) partes.push(P("Estrelinhas", "dourado", 6, folha(6)));
  if (dec.includes("coracoes")) partes.push(P("Corações pequenos", "vermelho", 6, coracao(4)));
  if (dec.includes("flocos")) partes.push(P("Flocos pequenos", "branco", 6, { linhas: ["Corr 7, feche em anel.", "Em cada ponto: 1 pb, corr 4, 1 pb de volta (6 braços).", "Termine com 1 ponto baixíssimo."], pontos: 7 + 6 * 7 }));
  return { partes, mont: ["Encha o tubo com enchimento, em camadas finas, até ficar firme.", `Feche o tubo em anel de cerca de ${d} cm e costure as pontas com ponto invisível.`, ...(dec.length ? ["Costure os enfeites espalhados pelo anel, com fio da mesma cor."] : []), "Prenda um cordão no alto para pendurar na porta."], dicas: ["Faça o tubo mais firme com uma volta de arame fino encapado no meio do enchimento."], cm: d, enche: true };
};
M.bandeirola = (v) => ({ partes: [P("Bandeirinhas", v.c1, 5, triangulo(11)), P("Cordão do varal", v.c2, 1, cordao(120))], mont: ["Passe a ferro as 5 bandeirinhas com um pano úmido por cima.", "Costure cada uma no cordão, com 6 cm de distância entre elas.", "Faça um nó em cada ponta para pendurar."], dicas: ["Para um varal maior, faça mais bandeirinhas e um cordão mais comprido."], cm: 150 });
M.lacao = (v) => ({ partes: [P("Laço grande", v.c1, 1, faixa(50, 16)), P("Centro do laço", v.c1, 1, faixa(10, 8)), P("Caudas", v.c1, 2, faixa(14, 30))], mont: ["Dobre o retângulo grande ao meio e franza no centro.", "Envolva o centro com a tira pequena e costure atrás.", "Costure as duas caudas por baixo, em V.", "Passe cola com água e deixe secar sobre a mesa para o laço ficar em pé."], dicas: [], cm: 30 });
M.pendente = (v) => {
  const itens = { sino: () => [P("Sininhos", "dourado", 3, corpo(3, 2, false))], bola: () => [P("Bolinhas", v.c1, 3, corpo(3, 3))], estrela: () => [P("Estrelas", "dourado", 3, folha(8))], floco: () => [P("Flocos", "branco", 3, { linhas: ["Corr 7, feche em anel.", "Em cada ponto: 1 pb, corr 4, 1 pb de volta (6 braços).", "Termine com 1 ponto baixíssimo."], pontos: 7 + 6 * 7 })] }[v.item]();
  return { partes: [P("Cordão principal", v.c2, 1, cordao(60)), ...itens, P("Laço do alto", "vermelho", 1, faixa(10, 3))], mont: ["Costure os 3 enfeites no cordão, um abaixo do outro, com 8 cm de distância.", "Amarre o laço no alto e faça uma alça para a maçaneta."], dicas: [], cm: 40 };
};

// ---- flocos e estrelas ----
M.floco = (v) => {
  const [a, nb, r] = v.f;
  const braco = { linhas: [`Corr ${a + 1}.`, `Na 2ª corr a partir da agulha, 1 pb em cada corr (${a} pontos).`, `Ramos: em ${nb} pontos da haste, de cada lado, faça corr ${r + 1} e volte com 1 pb em cada corr (${r} pontos).`, "Corte o fio e esconda as pontas."], pontos: a + 1 + a + nb * 2 * (r + 1 + r) };
  return { partes: [P("Centro do floco", v.c1, 1, disco(2)), P("Braços do floco", v.c1, 6, braco)], mont: ["Costure os 6 braços em volta do centro, igualmente espaçados.", "Passe cola com água, estique o floco sobre um papel manteiga e deixe secar por 12 horas.", "Prenda um fio fino no topo para pendurar na árvore ou na janela."], dicas: ["Prenda com alfinetes sobre papelão enquanto seca, para as pontas ficarem retas."], cm: a + r + 2, cola: true };
};
M.estrela = (v) => {
  const n = v.n || 5, len = v.len || 9;
  const partes = v.fofa ? [P("Centro da estrela", v.c1, 1, corpo(3, 1)), P("Pontas da estrela", v.c1, n, cone(2))] : [P("Centro da estrela", v.c1, 1, disco(3)), P("Pontas da estrela", v.c1, n, folha(len))];
  return { partes, mont: v.fofa ? ["Encha o centro e costure as pontas em volta, com um pouco de enchimento em cada uma.", "Prenda um cordão para pendurar."] : [`Costure as ${n} pontas em volta do centro, com as bases coladas.`, "Passe cola com água e deixe secar sobre papel, para ficar firme.", "Prenda um cordão para pendurar."], dicas: [], cm: Math.round(len * 0.9 + 3), enche: !!v.fofa, cola: !v.fofa };
};

// ---------- finalização ----------
const nivelDe = (pontos, partes) => (pontos < 450 && partes <= 5 ? "Iniciante" : pontos < 1200 ? "Intermediário" : "Avançado");
function finalizar(id, grupo, nome, modelo, v) {
  const r = M[modelo](v);
  const pontos = r.partes.reduce((a, p) => a + p.pontos * p.qtd, 0);
  const min = Math.max(20, Math.round((pontos / 16 + 12 + r.partes.length * 2) / 5) * 5);
  const porCor = {}; r.partes.forEach((p) => { porCor[p.cor] = (porCor[p.cor] || 0) + p.pontos * p.qtd; });
  const fios = Object.entries(porCor).map(([c, pts]) => ({ cor: nomeCor(c), hex: COR[c][1], g: grams(pts), pontos: pts })).sort((a, b) => b.g - a.g);
  const extras = ["Agulha de crochê 2,5 mm", "Agulha de tapeçaria", "Marcador de ponto", "Tesoura pequena"];
  if (r.enche) extras.splice(1, 0, "Enchimento acrílico (cerca de " + Math.max(10, Math.round(pontos * 0.012 / 5) * 5) + " g)");
  if (r.cola) extras.push("Cola branca, água e pincel", ...(modelo === "bola" ? ["1 bexiga pequena", "Varal e prendedores para secar"] : ["Papel manteiga ou plástico para forrar"]));
  if (r.olhos) extras.push("2 olhos de segurança de 6 mm e blush rosa");
  const mapa = r.partes.map((p) => `${p.qtd > 1 ? p.qtd + "x " : ""}${p.nome}`);
  return { id, grupo, nome, tipo: modelo, nivel: nivelDe(pontos, r.partes.length), min, tempo: horas(min) + (modelo === "bola" || modelo === "floco" ? " + secagem" : ""), cm: r.cm, pontos, fios, extras, mapa, partes: r.partes, mont: r.mont, dicas: r.dicas, desenho: { tipo: modelo, ...v } };
}

// ---------- catálogo ----------
const b = (nome, c1, c2, t, topo) => [nome, "bola", { c1, c2, t, topo }];
const G1 = [
  b("Bolinha Vermelha Clássica", "vermelho", "dourado", "M", "laco"), b("Bolinha Branca com Laço Vermelho", "branco", "vermelho", "M", "laco"), b("Bolinha Verde com Estrela Dourada", "verde", "dourado", "M", "estrela"), b("Bolinha Dourada com Azevinho", "dourado", "vermelho", "M", "folhas"),
  b("Bolinha Listrada Vermelha e Branca", "vermelho", "branco", "M", "faixas"), b("Bolinha Listrada Verde e Branca", "verde", "branco", "M", "faixas"), b("Bolinha Prata com Flor", "prata", "azulClaro", "M", "flor"), b("Bolinha Azul-gelo com Estrela", "azulClaro", "branco", "M", "estrela"),
  b("Bolinha Rosa-chá Delicada", "rosa", "branco", "M", "flor"), b("Bolinha Creme com Azevinho", "creme", "vermelho", "M", "folhas"), b("Bolinha Pequena Vermelha", "vermelho", "dourado", "P", "laco"), b("Bolinha Pequena Branca", "branco", "dourado", "P", "estrela"),
  b("Bolinha Pequena Verde", "verde", "vermelho", "P", "laco"), b("Bolinha Pequena Dourada", "dourado", "branco", "P", "flor"), b("Bolinha Grande Vermelha", "vermelho", "dourado", "G", "laco"), b("Bolinha Grande Branca", "branco", "vermelho", "G", "folhas"),
  b("Bolinha Grande Verde", "verde", "dourado", "G", "estrela"), b("Bolinha Grande Dourada", "dourado", "vermelho", "G", "laco"), b("Bolinha Vinho com Flor", "vinho", "rosa", "M", "flor"), b("Bolinha Cinza com Estrela", "cinza", "branco", "M", "estrela"),
];
const G2 = [
  ["Arvorezinha Verde com Estrela", "arvore", { c1: "verde", c2: "vermelho", t: "M" }], ["Arvorezinha Branca de Neve", "arvore", { c1: "branco", c2: "prata", t: "M" }], ["Arvorezinha Vermelha", "arvore", { c1: "vermelho", c2: "dourado", t: "M" }],
  ["Arvorezinha Pequena Verde", "arvore", { c1: "verde", c2: "dourado", t: "P" }], ["Arvorezinha Grande Verde", "arvore", { c1: "verde", c2: "vermelho", t: "G" }],
  ["Sino Dourado com Laço", "sino", { c1: "dourado", c2: "vermelho", t: "M" }], ["Sino Vermelho", "sino", { c1: "vermelho", c2: "dourado", t: "M" }], ["Sino Branco com Laço Verde", "sino", { c1: "branco", c2: "verde", t: "M" }],
  ["Presentinho Vermelho com Fita Dourada", "pacote", { c1: "vermelho", c2: "dourado", t: "M" }], ["Presentinho Verde com Fita Vermelha", "pacote", { c1: "verde", c2: "vermelho", t: "M" }], ["Presentinho Branco com Fita Verde", "pacote", { c1: "branco", c2: "verde", t: "M" }],
  ["Coração Vermelho", "coracao", { c1: "vermelho", c2: "dourado", t: "M" }], ["Coração Branco com Contorno Vermelho", "coracao", { c1: "branco", c2: "vermelho", borda: "vermelho", t: "M" }], ["Coração Verde Pequeno", "coracao", { c1: "verde", c2: "dourado", t: "P" }],
  ["Azevinho com Frutinhas", "azevinho", { c1: "verde", c2: "vermelho" }], ["Azevinho Branco de Neve", "azevinho", { c1: "branco", c2: "vermelho" }],
  ["Bengala Vermelha e Branca", "bengala", { c1: "vermelho", c2: "branco" }], ["Bengala Verde e Branca", "bengala", { c1: "verde", c2: "branco" }],
  ["Meinha de Árvore Vermelha", "meia", { c1: "vermelho", c2: "branco", t: "mini" }], ["Meinha de Árvore Verde", "meia", { c1: "verde", c2: "vermelho", t: "mini" }],
];
const f = (nome, t, corpoC, cabecaC, tk) => [nome, "figura", { t, corpo: corpoC, cabeca: cabecaC, tk }];
const FIG = {
  papai: (t, nome) => f(nome, t, "vermelho", "pele", { gorro: "vermelho", barba: "branco", nariz: "pele", bracos: "vermelho", pes: "preto", cinto: "preto" }),
  mamae: (t, nome) => f(nome, t, "vermelho", "pele", { gorro: "vermelho", cabelo: "branco", bracos: "vermelho", pes: "preto", lacinho: "verde" }),
  rena: (t, nome, c = "marrom") => f(nome, t, c, c, { chifres: "marrom", orelhas: c, nariz: "vermelho", cachecol: "vermelho", pes: "marrom" }),
  renaBranca: (t, nome) => f(nome, t, "branco", "branco", { chifres: "bege", orelhas: "branco", nariz: "vermelho", cachecol: "verde", pes: "bege" }),
  neve: (t, nome, cach = "vermelho") => f(nome, t, "branco", "branco", { cartola: "preto", cachecol: cach, nariz: "laranja", botoes: "preto", bracos: "marrom" }),
  neveSem: (t, nome) => f(nome, t, "branco", "branco", { cachecol: "vermelho", nariz: "laranja", botoes: "preto", bracos: "marrom" }),
  gnomo: (t, nome, c, barba = "branco") => f(nome, t, c, "pele", { gorroAlto: c, barba, nariz: "pele" }),
  anjo: (t, nome, c) => f(nome, t, c, "pele", { cabelo: "amarelo", asas: "branco", aureola: "dourado", pes: "pele" }),
  gengibre: (t, nome, laco) => f(nome, t, "marrom", "marrom", { botoes: "branco", lacinho: laco, bracos: "marrom", pes: "marrom" }),
  pinguim: (t, nome) => f(nome, t, "preto", "preto", { barriga: "branco", bico: "laranja", asas: "preto", gorro: "vermelho", pes: "laranja" }),
  urso: (t, nome) => f(nome, t, "marrom", "marrom", { orelhas: "marrom", focinho: "bege", nariz: "preto", gorro: "vermelho", cachecol: "verde" }),
  elfo: (t, nome) => f(nome, t, "verde", "pele", { gorroAlto: "verde", orelhaPonta: "pele", cinto: "vermelho", pes: "vermelho" }),
  raposa: (t, nome) => f(nome, t, "laranja", "laranja", { orelhaPonta: "laranja", focinho: "branco", nariz: "preto", rabo: "laranja", cachecol: "vermelho" }),
  coruja: (t, nome) => f(nome, t, "marrom", "marrom", { orelhaPonta: "marrom", bico: "laranja", asas: "bege", barriga: "bege", gorro: "vermelho" }),
};
const G3 = [
  FIG.papai("M", "Papai Noel"), FIG.papai("P", "Papai Noel Pequeno"), FIG.mamae("M", "Mamãe Noel"), FIG.rena("M", "Rena do Nariz Vermelho"), FIG.renaBranca("P", "Rena Branca de Cachecol Verde"),
  FIG.neve("M", "Boneco de Neve de Cartola"), FIG.neveSem("P", "Boneco de Neve de Cachecol Vermelho"), FIG.neve("G", "Boneco de Neve Grande", "verde"), FIG.gnomo("M", "Gnomo Vermelho", "vermelho"), FIG.gnomo("M", "Gnomo Verde", "verde"),
  FIG.gnomo("P", "Gnomo Cinza de Barba Longa", "cinza"), FIG.anjo("M", "Anjinho de Asas Brancas", "branco"), FIG.anjo("P", "Anjinho Dourado", "dourado"), FIG.gengibre("M", "Biscoito de Gengibre", "vermelho"), FIG.gengibre("M", "Biscoito de Gengibre com Laço Rosa", "rosa"),
  FIG.pinguim("M", "Pinguim de Gorro"), FIG.urso("M", "Urso de Gorro Vermelho"), FIG.elfo("M", "Elfo Ajudante"), FIG.raposa("M", "Raposa de Cachecol"), FIG.coruja("M", "Coruja de Natal"),
];
const d = (nome, c1, c2, deco, k) => [nome, "descanso", { c1, c2, deco, k }];
const G4 = [
  d("Descanso de Copo Vermelho", "vermelho", "branco", null, 10), d("Descanso de Copo Verde", "verde", "branco", null, 10), d("Descanso de Copo Branco", "branco", "vermelho", null, 10), d("Descanso de Copo Dourado", "dourado", "vermelho", null, 10), d("Descanso de Copo Azul-gelo", "azulClaro", "branco", null, 10),
  ["Porta-guardanapo com Flor Vermelha", "anel", { c1: "verde", c2: "vermelho", deco: "flor" }], ["Porta-guardanapo com Estrela Dourada", "anel", { c1: "branco", c2: "dourado", deco: "estrela" }], ["Porta-guardanapo com Azevinho", "anel", { c1: "vermelho", c2: "vermelho", deco: "azevinho" }], ["Porta-guardanapo com Laço", "anel", { c1: "creme", c2: "vermelho", deco: "laco" }],
  ["Marcador de Lugar com Árvore", "marcador", { c1: "creme", c2: "verde", deco: "arvore" }], ["Marcador de Lugar com Estrela", "marcador", { c1: "creme", c2: "dourado", deco: "estrela" }], ["Marcador de Lugar com Presente", "marcador", { c1: "creme", c2: "vermelho", deco: "presente" }],
  ["Jogo Americano Redondo Vermelho", "americano", { c1: "vermelho", k: 30 }], ["Jogo Americano Redondo Branco", "americano", { c1: "branco", k: 30 }],
  ["Centro de Mesa Poinsétia Vermelha", "centro", { c1: "creme", c2: "vermelho", k: 14 }], ["Centro de Mesa Poinsétia Branca", "centro", { c1: "verde", c2: "branco", k: 14 }], ["Centro de Mesa Poinsétia Rosa", "centro", { c1: "creme", c2: "rosa", k: 14 }],
  ["Caminho de Mesa de Natal", "caminho", { c1: "creme", c2: "vermelho" }],
  ["Cestinha de Rena", "cesta", { c1: "marrom", c2: "bege", deco: ["rena"] }], ["Cestinha de Papai Noel", "cesta", { c1: "vermelho", c2: "branco", deco: ["papai"] }],
];
const co = (nome, c1, t, deco) => [nome, "coroa", { c1, t, deco }];
const G5 = [
  co("Guirlanda Verde com Bolinhas Vermelhas", "verde", "M", ["bolinhas"]), co("Guirlanda Verde com Laço Vermelho", "verde", "M", ["laco"]), co("Guirlanda Branca de Neve", "branco", "M", ["flocos"]), co("Guirlanda Pequena Verde", "verde", "P", ["bolinhas"]), co("Guirlanda Grande Verde", "verde", "G", ["laco", "bolinhas"]),
  co("Guirlanda Vermelha com Folhas", "vermelho", "M", ["folhas"]), co("Guirlanda Dourada", "dourado", "M", ["laco"]), co("Guirlanda de Azevinho", "verde", "M", ["azevinho"]), co("Guirlanda de Estrelas Douradas", "verde", "M", ["estrelas"]), co("Guirlanda de Corações", "verde", "M", ["coracoes"]),
  ["Varal de Bandeirinhas Vermelhas", "bandeirola", { c1: "vermelho", c2: "branco" }], ["Varal de Bandeirinhas Verdes", "bandeirola", { c1: "verde", c2: "branco" }], ["Varal de Bandeirinhas Brancas", "bandeirola", { c1: "branco", c2: "vermelho" }],
  ["Laço Grande Vermelho para Porta", "lacao", { c1: "vermelho" }], ["Laço Grande Verde para Porta", "lacao", { c1: "verde" }], ["Laço Grande Dourado para Porta", "lacao", { c1: "dourado" }],
  ["Pingente de Porta com Sininhos", "pendente", { item: "sino", c1: "dourado", c2: "verde" }], ["Pingente de Porta com Bolinhas", "pendente", { item: "bola", c1: "vermelho", c2: "verde" }], ["Pingente de Porta com Estrelas", "pendente", { item: "estrela", c1: "dourado", c2: "vermelho" }], ["Pingente de Porta com Flocos", "pendente", { item: "floco", c1: "branco", c2: "azulClaro" }],
];
const fl = (nome, c1, f) => [nome, "floco", { c1, f }];
const es = (nome, c1, extra = {}) => [nome, "estrela", { c1, ...extra }];
const G6 = [
  fl("Floco de Neve Simples", "branco", [10, 1, 3]), fl("Floco de Neve com Ramos", "branco", [12, 2, 3]), fl("Floco de Neve Grande", "branco", [16, 3, 4]), fl("Floco de Neve Prata", "prata", [12, 2, 3]), fl("Floco de Neve Azul-gelo", "azulClaro", [12, 2, 3]),
  fl("Floco de Neve Dourado", "dourado", [12, 2, 3]), fl("Floco de Neve Pequeno", "branco", [7, 1, 2]), fl("Floco de Neve Cristal", "branco", [14, 2, 4]), fl("Floco de Neve Delicado Creme", "creme", [10, 2, 3]), fl("Floco de Neve Gigante de Janela", "branco", [22, 4, 5]),
  es("Estrela Dourada de 5 Pontas", "dourado", { n: 5, len: 9 }), es("Estrela Branca de 5 Pontas", "branco", { n: 5, len: 9 }), es("Estrela Vermelha de 5 Pontas", "vermelho", { n: 5, len: 9 }), es("Estrela Prata de 6 Pontas", "prata", { n: 6, len: 9 }), es("Estrela Dourada de 6 Pontas", "dourado", { n: 6, len: 9 }),
  es("Estrela Grande para o Topo da Árvore", "dourado", { n: 5, len: 14 }), es("Estrela Fofinha Amarela", "amarelo", { n: 5, fofa: true }), es("Estrela Fofinha Branca", "branco", { n: 5, fofa: true }), es("Estrela Pequena Vermelha", "vermelho", { n: 5, len: 6 }), es("Estrela Dourada de 8 Pontas", "dourado", { n: 8, len: 10 }),
];
// bônus 1: mesa posta
const B1 = [
  ["Sousplat Vermelho", "descanso", { c1: "vermelho", c2: "branco", deco: null, k: 18 }], ["Sousplat Verde", "descanso", { c1: "verde", c2: "branco", deco: null, k: 18 }], ["Sousplat Branco", "descanso", { c1: "branco", c2: "dourado", deco: null, k: 18 }],
  ["Porta-talher em Bolso Vermelho", "bolso", { c1: "vermelho", c2: "branco" }], ["Porta-talher em Bolso Verde", "bolso", { c1: "verde", c2: "branco" }], ["Porta-talher em Bolso Branco", "bolso", { c1: "branco", c2: "verde" }],
  ["Descanso de Panela com Poinsétia", "descanso", { c1: "verde", c2: "vermelho", deco: "flor", k: 11 }], ["Descanso de Panela com Árvore", "descanso", { c1: "creme", c2: "verde", deco: "arvore", k: 11 }],
  ["Porta-guardanapo de Rena", "anel", { c1: "marrom", c2: "marrom", deco: "rena" }], ["Porta-guardanapo de Papai Noel", "anel", { c1: "vermelho", c2: "branco", deco: "papai" }], ["Porta-guardanapo de Boneco de Neve", "anel", { c1: "azulClaro", c2: "branco", deco: "neve" }],
  ["Capa de Vela Vermelha", "vela", { c1: "vermelho", c2: "branco" }], ["Capa de Vela Branca", "vela", { c1: "branco", c2: "dourado" }],
  ["Gorro de Garrafa Vermelho", "gorroGarrafa", { c1: "vermelho", c2: "branco" }], ["Gorro de Garrafa Verde", "gorroGarrafa", { c1: "verde", c2: "branco" }],
  ["Árvore de Mesa Verde", "arvore", { c1: "verde", c2: "vermelho", t: "G" }], ["Árvore de Mesa Branca", "arvore", { c1: "branco", c2: "dourado", t: "G" }],
  ["Cesta de Pães Vermelha", "cestaPaes", { c1: "vermelho", c2: "branco" }], ["Cesta de Pães Verde", "cestaPaes", { c1: "verde", c2: "branco" }],
  ["Argola Marcador de Taça", "argola", { c1: "verde", c2: "vermelho" }],
];
const mm = (nome, c1, c2, t, extra = {}) => [nome, "meia", { c1, c2, t, ...extra }];
const B2 = [
  mm("Meia de Natal Vermelha com Punho Branco", "vermelho", "branco", "M"), mm("Meia de Natal Verde com Punho Vermelho", "verde", "vermelho", "M"), mm("Meia de Natal Branca com Punho Verde", "branco", "verde", "M"), mm("Meia Grande da Família", "vermelho", "branco", "G"), mm("Meia Pequena de Criança", "verde", "branco", "P"),
  mm("Meia Dourada com Punho Vermelho", "dourado", "vermelho", "M"), mm("Meia Vinho com Punho Branco", "vinho", "branco", "M"), mm("Meia Cinza com Punho Branco", "cinza", "branco", "M"), mm("Meia Azul-gelo com Punho Branco", "azulClaro", "branco", "M"),
  mm("Botinha do Papai Noel", "vermelho", "branco", "bota"), mm("Botinha de Bebê Vermelha", "vermelho", "branco", "bota"), mm("Botinha de Bebê Branca", "branco", "vermelho", "bota"), mm("Botinha Verde de Elfo", "verde", "vermelho", "bota"),
  mm("Meia do Pet Vermelha", "vermelho", "branco", "pet", { pata: "branco" }), mm("Meia do Pet Verde", "verde", "branco", "pet", { pata: "vermelho" }),
];
const B3 = [FIG.papai("mini", "Mini Papai Noel"), FIG.rena("mini", "Mini Rena"), FIG.neve("mini", "Mini Boneco de Neve"), FIG.pinguim("mini", "Mini Pinguim"), FIG.gnomo("mini", "Mini Gnomo", "vermelho"), FIG.anjo("mini", "Mini Anjinho", "branco"), FIG.gengibre("mini", "Mini Biscoito de Gengibre", "verde"), FIG.urso("mini", "Mini Urso de Gorro"), FIG.elfo("mini", "Mini Elfo"), FIG.raposa("mini", "Mini Raposa")];

export function gerar() {
  const grupos = [
    { id: 1, nome: "Bolinhas engomadas", lista: G1 }, { id: 2, nome: "Enfeites de árvore", lista: G2 }, { id: 3, nome: "Amigurumis natalinos", lista: G3 },
    { id: 4, nome: "Peças de mesa", lista: G4 }, { id: 5, nome: "Guirlandas e portas", lista: G5 }, { id: 6, nome: "Flocos e estrelas", lista: G6 },
  ];
  const colecoes = [{ id: 7, nome: "20 peças de mesa posta", chave: "mesa", lista: B1, n: 20 }, { id: 8, nome: "15 meias e botinhas de lareira", chave: "meias", lista: B2, n: 15 }, { id: 9, nome: "10 mini amigurumis para a árvore", chave: "minis", lista: B3, n: 10 }];
  const rec = []; let id = 1; const nomes = new Set();
  const add = (g, lista, esperado) => {
    if (lista.length !== esperado) throw new Error(`${g.nome} tem ${lista.length}, precisa de ${esperado}`);
    lista.forEach(([nome, tipo, spec]) => { if (nomes.has(nome)) throw new Error("nome repetido: " + nome); nomes.add(nome); const r = finalizar(id++, g.id, nome, tipo, spec); if (g.chave) r.bump = g.chave; rec.push(r); });
  };
  grupos.forEach((g) => add(g, g.lista, 20)); colecoes.forEach((c) => add(c, c.lista, c.n));
  return { colecoes: colecoes.map((c) => ({ id: c.id, nome: c.nome, chave: c.chave, n: c.lista.length })), grupos: grupos.map((g) => ({ id: g.id, nome: g.nome })), cores: Object.fromEntries(Object.entries(COR).map(([k, v]) => [k, v[1]])), nomes: Object.fromEntries(Object.entries(COR).map(([k, v]) => [k, v[0]])), receitas: rec };
}
if (process.argv[1] && process.argv[1].endsWith("gerar-dados.mjs")) {
  const dd = gerar();
  writeFileSync(join(AQUI, "dados.json"), JSON.stringify(dd));
  const pontos = dd.receitas.map((r) => r.pontos);
  console.log("receitas:", dd.receitas.length, "· principais:", dd.receitas.filter((r) => !r.bump).length, "· bônus:", dd.receitas.filter((r) => r.bump).length);
  console.log("pontos min/máx:", Math.min(...pontos), Math.max(...pontos), "· tempo min/máx (min):", Math.min(...dd.receitas.map((r) => r.min)), Math.max(...dd.receitas.map((r) => r.min)));
  const n = {}; dd.receitas.forEach((r) => (n[r.nivel] = (n[r.nivel] || 0) + 1)); console.log("níveis:", n);
}
