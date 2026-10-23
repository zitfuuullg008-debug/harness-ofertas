// Gera as receitas do Jardim de Amigurumi (150 + 50 do bônus) com a contagem de cada rodada CALCULADA.
// node saidas/modelagem/2026-10-23-plantas-amigurumi/app/gerar-dados.mjs  ->  dados.json
// Abreviações: AM anel mágico · corr correntinha · pb ponto baixo · pma ponto meio alto · pa ponto alto · aum aumento (2 pb no mesmo ponto) · dim diminuição (2 pb juntos) · BLO só o laço de trás
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
const AQUI = dirname(fileURLToPath(import.meta.url));

// ---------- cores (nome do fio + cor do desenho) ----------
export const COR = {
  verdeSalvia: ["Verde-sálvia", "#8FA98A"], verdeMusgo: ["Verde-musgo", "#5F7A4B"], verdeFolha: ["Verde-folha", "#4E8A3E"], verdeClaro: ["Verde-claro", "#A9CC8E"],
  rosaCha: ["Rosa-chá", "#E8B4B8"], rosaPink: ["Rosa-pink", "#D9547A"], terracota: ["Terracota", "#C8683F"], creme: ["Creme", "#F1E6CE"], marrom: ["Marrom", "#6B4A32"],
  mostarda: ["Amarelo-mostarda", "#D9A833"], amarelo: ["Amarelo", "#F2CB3B"], lilas: ["Lilás", "#B79AD0"], roxo: ["Roxo", "#6E4A8E"], azulAcinz: ["Azul-acinzentado", "#7C9DB0"],
  vermelho: ["Vermelho", "#C93B3B"], laranja: ["Laranja", "#E9843A"], branco: ["Branco", "#FBFAF6"], bege: ["Bege", "#D9C3A0"], cinza: ["Cinza", "#9A9A94"], pessego: ["Pêssego", "#F2B48F"], azul: ["Azul", "#4C86C6"],
};
const nomeCor = (k) => COR[k][0];

// ---------- peças (cada uma devolve linhas + pontos exatos) ----------
const comp = (lista) => {
  // junta voltas iguais seguidas: [{n,t}] -> linhas "R4 a R7 (4 voltas): ... (n)"
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

// disco liso de k voltas (base do vaso, terra, centro de flor, folha redonda)
export const disco = (k, extra = []) => { const l = []; for (let i = 1; i <= k; i++) l.push(inc(i)); extra.forEach((e) => l.push(e)); return { linhas: comp(l), pontos: soma(l) }; };
// esfera / cilindro: sobe até 6m, s voltas retas, desce até 6 (m>=2)
export const corpo = (m, s, fechado = true) => {
  const l = []; for (let i = 1; i <= m; i++) l.push(inc(i));
  for (let i = 0; i < s; i++) l.push({ n: 6 * m, t: "1 pb em cada ponto" });
  if (fechado) for (let j = m - 1; j >= 1; j--) l.push(dec(j));
  const linhas = comp(l); if (fechado) linhas.push("Encha bem com enchimento antes de fechar, feche o último furo com a agulha de tapeçaria e esconda o fio.");
  return { linhas, pontos: soma(l) };
};
export const cupula = (m, s) => { const p = corpo(m, s, false); p.linhas.push("Termine com 1 ponto baixíssimo e deixe um fio longo para costurar. Encha só no final, depois de costurar."); return p; };
// vaso: base k voltas + parede (h+1 voltas) em BLO na primeira
export const vaso = (k, h, barra = null) => {
  const l = []; for (let i = 1; i <= k; i++) l.push(inc(i));
  l.push({ n: 6 * k, t: "1 pb em cada ponto, só no laço de trás (BLO), é essa volta que levanta a parede" });
  for (let i = 0; i < h; i++) l.push({ n: 6 * k, t: "1 pb em cada ponto" });
  if (barra) { l.push({ n: 6 * k, t: `troque para o fio ${barra}: 1 pb em cada ponto` }); l.push({ n: 6 * k, t: `1 pb em cada ponto (barrinha ${barra})` }); }
  const linhas = comp(l); linhas.push("Termine com 1 ponto baixíssimo, corte o fio e esconda-o por dentro.");
  return { linhas, pontos: soma(l) };
};
// folha / pétala: corrente n, duas faces
export const folha = (n) => {
  const meio = n - 5; const lado = `1 pb, 1 pma, ${meio} pa, 1 pma, 1 pb`;
  return { linhas: [`Corr ${n}.`, `Na 2ª corr a partir da agulha: ${lado} (${n - 1} pontos).`, "Na última corr (base da folha): 3 pb, para arredondar.", `Volte pelo outro lado da corrente: ${lado} (${n - 1} pontos).`, "Ponto baixíssimo no primeiro ponto, corte o fio deixando uma ponta longa para costurar."], pontos: n + 2 * (n - 1) + 3 };
};
// folha redonda (disco de k voltas com contorno)
export const folhaRedonda = (k, contorno = null) => { const e = contorno ? [{ n: 6 * k, t: `troque para o fio ${contorno}: 1 pb em cada ponto (contorno)` }] : []; const p = disco(k, e); p.linhas.push("Ponto baixíssimo e arremate, deixando um fio para costurar na haste."); return p; };
// cordão: corr n + pb de volta
export const cordao = (n) => ({ linhas: [`Corr ${n + 1}.`, `Na 2ª corr a partir da agulha, 1 pb em cada corr (${n} pontos).`, "Corte o fio e esconda as pontas."], pontos: n + 1 + n });
// folhinha de samambaia: corr 4 e 3 pb de volta
export const pinha = (pares) => ({ linhas: ["Corr 31 (haste).", "Na 2ª corr a partir da agulha: 1 pb em cada corr (30 pontos).", `Em cada 2º ponto da haste, ${pares} vezes de cada lado: corr 4 e, voltando, 3 pb nessas corr (cada folinha).`, "Cada folinha dá 3 pb; costure o conjunto em arame encapado."], pontos: 31 + 30 + pares * 2 * (4 + 3) });
// retângulo vai-e-volta (jardineira)
export const retangulo = (w, h) => ({ linhas: [`Corr ${w + 1}.`, `Volta 1: 1 pb em cada corr a partir da 2ª (${w} pontos).`, `Voltas 2 a ${h}: 1 corr de virada e 1 pb em cada ponto (${w} pontos por volta, ${h - 1} voltas).`, "Arremate."], pontos: w + 1 + w * h });
export const arame = (cm) => ({ linhas: [`Corte ${cm} cm de arame encapado verde.`, "Dobre 1 cm da ponta para não furar o crochê e cubra com 1 volta de fio verde ou fita verde."], pontos: 0 });

const grams = (p) => Math.max(5, Math.ceil((p * 0.02) / 5) * 5);
const horas = (min) => (min >= 60 ? `${Math.floor(min / 60)}h${min % 60 ? String(min % 60).padStart(2, "0") : ""}` : `${min} min`);

// ---------- montadores por tipo ----------
// cada um devolve { partes:[{nome,cor,qtd,linhas,pontos}], mont:[passos], dicas:[], desenho:{...}, cm, olhos }
const P = (nome, cor, qtd, pc) => ({ nome, cor, qtd, linhas: pc.linhas, pontos: pc.pontos });
const VASO = { P: [4, 5, "pequeno"], M: [5, 7, "médio"], G: [6, 9, "grande"], GG: [7, 11, "gigante"] };
function potParts(sz, corVaso, corTerra = "marrom", barra = null, carinha = false) {
  const [k, h] = VASO[sz]; const nb = barra ? nomeCor(barra) : null;
  const out = [P(`Vaso ${VASO[sz][2]}`, corVaso, 1, vaso(k, h, nb)), P("Terra (disco)", corTerra, 1, disco(k))];
  return { out, k, h };
}
const cmVaso = (k) => (k * 0.86).toFixed(0);

const T = {};
T.rosette = (s) => {
  const { out, k } = potParts(s.vaso || "M", s.pot, "marrom", s.barra);
  const partes = [...out];
  s.camadas.forEach(([q, n], i) => partes.push(P(`Camada ${i + 1}: folhas de ${n} corr`, i === 0 ? s.c2 : s.c1, q, folha(n))));
  const total = s.camadas.reduce((a, [q]) => a + q, 0);
  return { partes, mont: ["Costure a terra por dentro do vaso, na altura da borda.", "Faça uma bolinha de enchimento e coloque dentro do vaso, cobrindo a terra.", "Costure a camada 1 no centro, com as pontas para cima.", "Costure as camadas seguintes de dentro para fora, cada folha entre duas da camada de baixo, abrindo como uma rosa.", `Confira se as ${total} folhas ficaram bem distribuídas e dê um ponto escondido em cada base.`], dicas: ["Arrume as folhas com a ponta da agulha antes de dar o ponto definitivo.", "Para uma cor degradê, deixe a camada de fora uma cor mais clara."], desenho: { tipo: "rosette", camadas: s.camadas.length, c1: s.c1, c2: s.c2, pot: s.pot }, cm: Number(cmVaso(k)) + 4, nFolhas: total };
};
T.tall = (s) => {
  const { out, k } = potParts(s.vaso || "M", s.pot, "marrom", s.barra);
  const partes = [...out, P(`Folha comprida (${s.n} corr)`, s.c1, s.q, folha(s.n))];
  if (s.borda) partes.push(P("Listra da borda (corrente)", s.borda, s.q, cordao(s.n)));
  return { partes, mont: ["Costure a terra por dentro do vaso.", `Costure as ${s.q} folhas pelas bases em volta de uma bolinha de enchimento, uma ao lado da outra, inclinando cada uma um pouco.`, s.borda ? "Costure a listra da borda ao longo de cada folha." : "Dê um ponto de fio claro no meio de cada folha para marcar a nervura.", "Prenda o conjunto dentro do vaso com pontos escondidos."], dicas: ["Dobre levemente as pontas das folhas para dar movimento."], desenho: { tipo: "tall", q: s.q, c1: s.c1, c2: s.borda || s.c1, pot: s.pot }, cm: Number(cmVaso(k)) + Math.round(s.n * 0.6), nFolhas: s.q };
};
T.beans = (s) => {
  const { out, k } = potParts(s.vaso || "M", s.pot, "marrom", s.barra);
  const partes = [...out, P("Bolinha (feijãozinho)", s.c1, s.q, corpo(2, 1))];
  if (s.pendente) partes.push(P("Cordão para pendurar", s.c2 || "marrom", 3, cordao(60)));
  return { partes, mont: ["Costure a terra por dentro do vaso.", `Faça ${s.q} bolinhas, encha pouco e feche.`, "Costure as bolinhas em grupos, umas apoiadas nas outras, começando pelo centro.", s.pendente ? "Trance os 3 cordões, prenda a ponta nas bordas do vaso e pendure." : "Prenda o conjunto dentro do vaso com pontos escondidos."], dicas: ["Varie levemente o tamanho: encha algumas bolinhas um pouco mais."], desenho: { tipo: "beans", q: s.q, c1: s.c1, pot: s.pot }, cm: Number(cmVaso(k)) + 3, nFolhas: s.q };
};
T.lithops = (s) => {
  const { out, k } = potParts(s.vaso || "P", s.pot, "marrom");
  const partes = [...out];
  for (let i = 1; i <= s.pedras; i++) { partes.push(P(`Pedra ${i}: metade A`, s.c1, 1, cupula(3, 2))); partes.push(P(`Pedra ${i}: metade B`, s.c1, 1, cupula(3, 2))); }
  return { partes, mont: ["Costure a terra por dentro do vaso.", "Una cada par de metades pela borda aberta, deixando uma fenda no meio (a fenda é a marca da pedra viva).", "Encha antes de fechar a última parte da costura.", "Costure as pedras sobre a terra, bem juntinhas."], dicas: ["Bordar pintinhas com fio mais escuro deixa a pedra mais real."], desenho: { tipo: "lithops", q: s.pedras, c1: s.c1, pot: s.pot }, cm: Number(cmVaso(k)) + 3, nFolhas: s.pedras * 2 };
};
T.jade = (s) => {
  const { out, k } = potParts(s.vaso || "M", s.pot, "marrom", s.barra);
  const partes = [...out, P("Folhinha gordinha", s.c1, 14, cupula(2, 1)), P("Galho de arame", "verdeMusgo", 3, arame(9))];
  return { partes, mont: ["Costure a terra por dentro do vaso.", "Cubra os 3 arames com fio marrom-esverdeado, enrolando bem juntinho.", "Costure 4 a 5 folhinhas em cada galho, em pares opostos, da ponta para baixo.", "Prenda os 3 galhos dentro do vaso, em leque, com um bocado de enchimento por baixo."], dicas: ["Folhas menores na ponta do galho e maiores na base ficam mais naturais."], desenho: { tipo: "jade", c1: s.c1, pot: s.pot }, cm: Number(cmVaso(k)) + 8, nFolhas: 14 };
};
T.ball = (s) => {
  const { out, k } = potParts(s.vaso || "M", s.pot, "marrom", s.barra);
  const partes = [...out, P("Corpo do cacto", s.c1, 1, corpo(s.m, s.s))];
  if (s.flor) { partes.push(P("Flor do topo: centro", s.flor, 1, disco(2))); partes.push(P("Flor do topo: pétala", s.flor, 5, folha(6))); }
  if (s.topo) partes.push(P("Topo colorido (cúpula)", s.topo, 1, cupula(3, 0)));
  return { partes, mont: ["Costure a terra por dentro do vaso.", "Borde 8 linhas verticais do topo à base com fio claro, com pontinhos de 1 cm: elas marcam as costelas do cacto.", s.flor ? "Costure o centro da flor no topo e as 5 pétalas em volta, sobrepondo um pouco." : s.topo ? "Costure o topo colorido por cima do corpo." : "Dê pontinhos brancos em cruz para fazer os espinhos.", "Costure o corpo dentro do vaso, na altura da borda."], dicas: ["Para o cacto ficar em pé, ponha uma pedrinha ou bolinha de enchimento mais firme na base."], desenho: { tipo: "ball", c1: s.c1, flor: s.flor, topo: s.topo, pot: s.pot, m: s.m, rosto: !!s.rosto }, cm: Number(cmVaso(k)) + Math.round(s.m * 0.9 + s.s * 0.4), olhos: !!s.rosto };
};
T.coluna = (s) => {
  const { out, k } = potParts(s.vaso || "M", s.pot, "marrom", s.barra);
  const partes = [...out, P("Corpo principal", s.c1, 1, corpo(3, s.s))];
  for (let i = 0; i < s.bracos; i++) partes.push(P(`Braço ${i + 1}`, s.c1, 1, corpo(2, 5)));
  if (s.flor) { partes.push(P("Florzinha: centro", s.flor, 1, disco(2))); partes.push(P("Florzinha: pétala", s.flor, 5, folha(6))); }
  return { partes, mont: ["Costure a terra por dentro do vaso.", s.bracos ? `Costure os ${s.bracos} braços de lado no corpo, em ângulo, a mais ou menos 2/3 da altura.` : "Marque 6 linhas verticais com fio claro.", "Borde pontinhos de espinho em fio claro.", s.flor ? "Costure a florzinha no topo." : "Se quiser, faça uma bolinha de fio no topo.", "Costure o corpo dentro do vaso, com um pouco de enchimento firme na base."], dicas: ["Um palito de churrasco cortado dentro do corpo (opcional) mantém o cacto alto em pé."], desenho: { tipo: "coluna", c1: s.c1, bracos: s.bracos, flor: s.flor, pot: s.pot, s: s.s }, cm: Number(cmVaso(k)) + Math.round(s.s * 0.6 + 4) };
};
T.palma = (s) => {
  const { out, k } = potParts(s.vaso || "M", s.pot, "marrom", s.barra);
  const partes = [...out];
  for (let i = 1; i <= s.q; i++) { const kk = i === 1 ? 5 : 4; partes.push(P(`Raquete ${i}: frente`, s.c1, 1, disco(kk))); partes.push(P(`Raquete ${i}: costas`, s.c1, 1, disco(kk))); }
  if (s.flor) partes.push(P("Florzinha (pétala)", s.flor, 3, folha(6)));
  return { partes, mont: ["Costure a terra por dentro do vaso.", "Una frente e costas de cada raquete pela borda, enchendo levemente antes de fechar.", "Costure as raquetes uma na outra, a maior embaixo.", s.flor ? "Costure as pétalas na ponta da raquete de cima." : "Borde pontinhos de espinho em fio claro.", "Costure a primeira raquete dentro do vaso."], dicas: ["Deixe as raquetes um pouco achatadas: encha menos do que parece."], desenho: { tipo: "palma", q: s.q, c1: s.c1, flor: s.flor, pot: s.pot }, cm: Number(cmVaso(k)) + 4 + s.q * 3 };
};
T.cluster = (s) => {
  const { out, k } = potParts(s.vaso || "M", s.pot, "marrom", s.barra);
  const partes = [...out];
  s.itens.forEach(([m, sv, q, cor], i) => partes.push(P(`Cacto ${i + 1} (${m * 6} pontos na parte mais larga)`, cor, q, corpo(m, sv))));
  return { partes, mont: ["Costure a terra por dentro do vaso.", "Borde as costelas e os espinhos de cada cacto antes de montar.", "Costure os maiores no fundo e os menores na frente, bem juntos.", "Prenda o grupo dentro do vaso com pontos escondidos."], dicas: ["Varie a altura: o grupo fica mais bonito com 3 alturas diferentes."], desenho: { tipo: "cluster", itens: s.itens.length, c1: s.itens[0][3], pot: s.pot }, cm: Number(cmVaso(k)) + 6 };
};
// flores: centro + pétalas costuradas + haste
T.flor = (s) => {
  const { out, k } = potParts(s.vaso || "M", s.pot, "marrom", s.barra);
  const partes = [...out, P("Centro da flor", s.centro, 1, disco(s.k || 3)), P(`Pétala (${s.n} corr)`, s.cor, s.p, folha(s.n)), P("Haste de arame", "verdeFolha", 1, arame(s.haste || 14)), P("Folha (8 corr)", s.verde || "verdeFolha", s.fo || 2, folha(8))];
  if (s.p2) partes.splice(4, 0, P(`Pétala de trás (${s.n + 2} corr)`, s.cor2 || s.cor, s.p2, folha(s.n + 2)));
  return { partes, mont: ["Costure a terra por dentro do vaso.", "Cubra o arame com fio verde, enrolando bem juntinho de baixo para cima.", `Costure as ${s.p2 ? s.p2 + " pétalas de trás e depois as " : ""}${s.p} pétalas em volta do centro, bases para dentro, sobrepondo uma na outra.`, "Costure a flor na ponta do arame.", `Costure as ${s.fo || 2} folhas na haste e prenda o arame dentro do vaso, com enchimento ao redor.`], dicas: ["Dobre a haste levemente: uma flor torta parece mais natural do que uma reta."], desenho: { tipo: "flor", p: s.p, cor: s.cor, centro: s.centro, pot: s.pot, big: s.p2 ? 1 : 0 }, cm: Number(cmVaso(k)) + (s.haste || 14) - 2 };
};
T.tulipa = (s) => {
  const { out, k } = potParts(s.vaso || "M", s.pot, "marrom", s.barra);
  const partes = [...out, P("Copa da tulipa", s.cor, 1, cupula(3, 3)), P("Pétala frontal", s.cor, 3, folha(7)), P("Haste de arame", "verdeFolha", 1, arame(14)), P("Folha comprida (12 corr)", "verdeFolha", 2, folha(12))];
  return { partes, mont: ["Costure a terra por dentro do vaso.", "Encha a copa até ficar firme e costure na ponta do arame já coberto.", "Costure as 3 pétalas na copa, uma cobrindo a emenda da outra.", "Costure as 2 folhas compridas na base da haste e prenda dentro do vaso."], dicas: ["Para uma tulipa semiaberta, dobre a ponta das pétalas para fora."], desenho: { tipo: "tulipa", cor: s.cor, pot: s.pot }, cm: Number(cmVaso(k)) + 12 };
};
T.girassol = (s) => {
  const { out, k } = potParts(s.vaso || "G", s.pot, "marrom", s.barra);
  const partes = [...out, P("Miolo do girassol", "marrom", 1, disco(s.k)), P("Pétala (8 corr)", "mostarda", s.p, folha(8)), P("Haste de arame", "verdeFolha", 1, arame(s.haste)), P("Folha (10 corr)", "verdeFolha", 2, folha(10))];
  return { partes, mont: ["Costure a terra por dentro do vaso.", `Costure as ${s.p} pétalas por trás do miolo, uma ao lado da outra, formando o círculo.`, "Borde pontinhos em fio mais claro no miolo para dar textura.", "Cubra o arame, costure o girassol na ponta e as folhas na haste.", "Prenda dentro do vaso com enchimento."], dicas: ["Pétalas em dois tamanhos (8 e 10 corr) deixam o girassol mais cheio."], desenho: { tipo: "flor", p: s.p, cor: "mostarda", centro: "marrom", pot: s.pot, big: 1 }, cm: Number(cmVaso(k)) + s.haste };
};
T.lavanda = (s) => {
  const { out, k } = potParts(s.vaso || "M", s.pot, "marrom", s.barra);
  const partes = [...out, P("Espiga de lavanda", s.cor, s.q, corpo(2, 3)), P("Haste de arame", "verdeSalvia", s.q, arame(14)), P("Folha fina (9 corr)", "verdeSalvia", 4, folha(9))];
  return { partes, mont: ["Costure a terra por dentro do vaso.", "Encha cada espiga e feche.", "Cubra cada arame com fio verde-sálvia.", "Costure uma espiga na ponta de cada arame.", `Una as ${s.q} hastes em buquê com um fio e prenda dentro do vaso, com as 4 folhas finas na base.`], dicas: ["Hastes com alturas diferentes (de 10 a 14 cm) dão mais volume ao buquê."], desenho: { tipo: "lavanda", q: s.q, cor: s.cor, pot: s.pot }, cm: Number(cmVaso(k)) + 12 };
};
T.hortensia = (s) => {
  const { out, k } = potParts(s.vaso || "G", s.pot, "marrom", s.barra);
  const partes = [...out, P("Florzinha (pétala 5 corr)", s.cor, s.q * 4, folha(5)), P("Miolo da florzinha", s.centro || "amarelo", s.q, disco(2)), P("Bola de enchimento (base do buquê)", s.cor, 1, corpo(5, 3)), P("Folha (9 corr)", "verdeFolha", 4, folha(9))];
  return { partes, mont: ["Costure a terra por dentro do vaso.", `Monte ${s.q} florzinhas: 4 pétalas em volta de cada miolo.`, "Cubra a bola de enchimento com as florzinhas, bem juntas, sem deixar espaço.", "Costure as 4 folhas por baixo e prenda a bola dentro do vaso."], dicas: ["Misture dois tons do mesmo azul ou rosa nas florzinhas: o efeito é de hortênsia de verdade."], desenho: { tipo: "hortensia", cor: s.cor, pot: s.pot }, cm: Number(cmVaso(k)) + 8 };
};
// folhagens
T.leque = (s) => {
  const { out, k } = potParts(s.vaso || "G", s.pot, "marrom", s.barra);
  const partes = [...out];
  s.folhas.forEach(([n, q, cor]) => partes.push(P(`Folha grande (${n} corr)`, cor, q, folha(n))));
  partes.push(P("Haste de arame", "verdeFolha", s.folhas.reduce((a, f) => a + f[1], 0), arame(12)));
  const tot = s.folhas.reduce((a, f) => a + f[1], 0);
  return { partes, mont: ["Costure a terra por dentro do vaso.", "Cubra cada arame com fio verde.", `Costure cada uma das ${tot} folhas na ponta de um arame, pela base.`, "Una os arames em leque, as folhas maiores atrás, e prenda dentro do vaso com enchimento.", s.nervura ? "Borde a nervura central de cada folha com fio claro." : "Dobre levemente as folhas para os lados."], dicas: ["Use arame mais firme (1,5 mm) nas folhas maiores para elas não caírem."], desenho: { tipo: "leque", q: tot, c1: s.folhas[0][2], pot: s.pot }, cm: Number(cmVaso(k)) + 14 };
};
T.redonda = (s) => {
  const { out, k } = potParts(s.vaso || "M", s.pot, "marrom", s.barra);
  const partes = [...out, P(`Folha redonda (${s.k} voltas)`, s.c1, s.q, folhaRedonda(s.k, s.contorno)), P("Haste de arame", "verdeFolha", s.q, arame(10))];
  return { partes, mont: ["Costure a terra por dentro do vaso.", "Cubra cada arame com fio verde.", `Costure cada uma das ${s.q} folhas redondas na ponta de um arame, ligeiramente inclinada.`, "Una as hastes com alturas diferentes e prenda dentro do vaso."], dicas: ["Folhas de tamanhos diferentes (uma volta a menos nas menores) deixam a planta natural."], desenho: { tipo: "redonda", q: s.q, c1: s.c1, c2: s.contorno || s.c1, pot: s.pot }, cm: Number(cmVaso(k)) + 12 };
};
T.vine = (s) => {
  const { out, k } = potParts(s.vaso || "M", s.pot, "marrom", s.barra);
  const partes = [...out, P(`Rama (${s.comp} pontos)`, "verdeMusgo", s.ramas, cordao(s.comp)), P(`Folha (${s.n} corr)`, s.c1, s.ramas * s.folhasPorRama, folha(s.n))];
  if (s.cabide) partes.push(P("Cordão do cabide", "bege", 3, cordao(90)));
  return { partes, mont: ["Costure a terra por dentro do vaso.", `Costure ${s.folhasPorRama} folhas em cada uma das ${s.ramas} ramas, de 4 em 4 cm, com a ponta da folha para baixo.`, "Prenda as ramas na borda do vaso, deixando-as caírem.", s.cabide ? "Trance os 3 cordões do cabide, prenda nas bordas do vaso em três pontos e faça um laço no alto." : "Se preferir, deixe as ramas subirem em um suporte de arame."], dicas: ["Ramas de comprimentos diferentes ficam mais naturais do que todas iguais."], desenho: { tipo: "vine", q: s.ramas, c1: s.c1, pot: s.pot, cabide: !!s.cabide }, cm: Number(cmVaso(k)) + Math.round(s.comp * 0.45) };
};
T.fern = (s) => {
  const { out, k } = potParts(s.vaso || "G", s.pot, "marrom", s.barra);
  const partes = [...out, P(`Fronde de samambaia (${s.pares} pares de folinhas)`, s.c1, s.q, pinha(s.pares))];
  return { partes, mont: ["Costure a terra por dentro do vaso.", "Dobre cada fronde em arco suave.", `Una as ${s.q} frondes pela base, em leque, e prenda dentro do vaso com enchimento.`], dicas: ["Faça as frondes de fora mais compridas e as de dentro mais curtas."], desenho: { tipo: "fern", q: s.q, c1: s.c1, pot: s.pot }, cm: Number(cmVaso(k)) + 12 };
};
T.sprout = (s) => {
  const { out, k } = potParts(s.vaso || "M", s.pot, "marrom", s.barra, true);
  const partes = [...out, P("Folhinha do brotinho (7 corr)", s.c1 || "verdeFolha", 2, folha(7))];
  if (s.orelhas) partes.push(P("Orelhinha", s.pot, 2, cupula(2, 0)));
  if (s.laco) partes.push(P("Laço", s.laco, 1, cordao(24)));
  return { partes, mont: ["Costure a terra por dentro do vaso.", "Prenda os 2 olhos de segurança entre a 4ª e a 5ª volta da parede, com 6 pontos de distância, e bordar a boquinha em fio marrom.", "Passe um pouquinho de blush rosa nas bochechas.", "Costure as 2 folhinhas no centro da terra, em V.", s.orelhas ? "Costure as orelhinhas nas laterais da borda." : s.laco ? "Dê um nó no laço e costure ao lado da carinha." : "Se quiser, borde bolinhas ou listras no vaso."], dicas: ["Olhos de segurança sempre antes de fechar a peça; para crianças pequenas, bordar os olhos."], desenho: { tipo: "sprout", c1: s.c1 || "verdeFolha", pot: s.pot, orelhas: !!s.orelhas, laco: s.laco || null }, cm: Number(cmVaso(k)) + 4, olhos: true };
};
// jardineira: caixa retangular com plantinhas
T.jardineira = (s) => {
  const w = s.w, d = Math.round(w / 2.5), h = 7;
  const partes = [P("Base", s.pot, 1, retangulo(w, d)), P("Frente e costas", s.pot, 2, retangulo(w, h)), P("Laterais", s.pot, 2, retangulo(d, h)), P("Terra", "marrom", 1, retangulo(w - 2, d - 2))];
  s.itens.forEach((it, i) => { const sub = T[it.t](it.s); sub.partes.slice(2).forEach((pt) => partes.push({ ...pt, nome: `Planta ${i + 1}: ${pt.nome}` })); });
  return { partes, mont: ["Costure a base nas 4 laterais pelas bordas, formando a caixa.", "Coloque a terra por dentro e costure no meio da altura.", "Faça cada plantinha seguindo as partes indicadas (sem o vaso, só a parte da planta).", "Costure as plantas na terra, as maiores atrás, as menores na frente.", "Dê pontos de acabamento nos cantos da caixa."], dicas: ["Monte as plantas fora da caixa primeiro, para decidir a posição antes de costurar."], desenho: { tipo: "jardineira", q: s.itens.length, pot: s.pot, c1: s.cor1 || "verdeSalvia", c2: s.cor2 || "rosaCha" }, cm: Math.round(w * 0.45) + 8 };
};
// mini jardim: vaso grande com 3 plantinhas de outras receitas
T.mini = (s) => {
  const { out, k } = potParts(s.vaso || "GG", s.pot, "marrom", s.barra);
  const partes = [...out];
  s.itens.forEach((it, i) => { const sub = T[it.t](it.s); sub.partes.slice(2).forEach((pt) => partes.push({ ...pt, nome: `Planta ${i + 1}: ${pt.nome}` })); });
  return { partes, mont: ["Costure a terra por dentro do vaso grande.", "Monte cada plantinha pelas partes indicadas (sem o vaso, só a parte da planta).", "Costure as plantas na terra, uma ao lado da outra, com alturas diferentes.", "Prenda cada uma por baixo, com pontos escondidos, e termine com pedrinhas de crochê ou musgo de fio verde."], dicas: ["Faça primeiro a maior planta e deixe as menores para a frente."], desenho: { tipo: "mini", q: s.itens.length, pot: s.pot, c1: s.cor1 || "verdeSalvia", c2: s.cor2 || "rosaCha" }, cm: Number(cmVaso(k)) + 9 };
};

// ---------- finalização de cada receita ----------
const nivelDe = (pontos, partes) => (pontos < 700 && partes <= 5 ? "Iniciante" : pontos < 1500 ? "Intermediário" : "Avançado");
function finalizar(id, grupo, extra, nome, tipo, spec) {
  const r = T[tipo](spec);
  const pontos = r.partes.reduce((a, p) => a + p.pontos * p.qtd, 0);
  const min = Math.max(20, Math.round((pontos / 16 + 12 + r.partes.length * 2) / 5) * 5);
  const porCor = {}; r.partes.forEach((p) => { porCor[p.cor] = (porCor[p.cor] || 0) + p.pontos * p.qtd; });
  const fios = Object.entries(porCor).map(([c, pts]) => ({ cor: nomeCor(c), hex: COR[c][1], g: grams(pts), pontos: pts })).sort((a, b) => b.g - a.g);
  const enchimento = Math.max(10, Math.round(pontos * 0.012 / 5) * 5);
  const extras = ["Agulha de crochê 2,5 mm", "Enchimento acrílico (cerca de " + enchimento + " g)", "Agulha de tapeçaria", "Marcador de ponto", "Tesoura pequena"];
  if (r.partes.some((p) => p.nome.includes("arame") || p.nome.includes("Haste"))) extras.push("Arame encapado fino e alicate");
  if (r.olhos) extras.push("2 olhos de segurança de 6 mm e blush rosa");
  const mapa = r.partes.map((p) => `${p.qtd > 1 ? p.qtd + "x " : ""}${p.nome}`);
  return { id, grupo, extra, nome, tipo, nivel: nivelDe(pontos, r.partes.length), min, tempo: horas(min), cm: r.cm, pontos, fios, extras, mapa, partes: r.partes, mont: r.mont, dicas: r.dicas, desenho: r.desenho };
}

// ---------- catálogo ----------
const V = (pot, barra) => ({ pot, barra });
const G1 = [
  ["Echeveria Rosada", "rosette", { camadas: [[5, 6], [6, 8], [8, 10]], c1: "verdeSalvia", c2: "rosaCha", ...V("creme", "rosaCha") }],
  ["Echeveria Azulada", "rosette", { camadas: [[5, 6], [6, 8], [8, 10]], c1: "azulAcinz", c2: "verdeClaro", ...V("bege") }],
  ["Echeveria Lilás", "rosette", { camadas: [[5, 6], [7, 8], [9, 10]], c1: "lilas", c2: "verdeSalvia", ...V("creme") }],
  ["Echeveria Pérola", "rosette", { camadas: [[5, 6], [6, 8], [8, 9]], c1: "bege", c2: "verdeClaro", ...V("terracota") }],
  ["Rosa de Pedra", "rosette", { camadas: [[5, 7], [7, 9], [9, 11]], c1: "verdeFolha", c2: "verdeClaro", ...V("terracota") }],
  ["Sempervivum Verde", "rosette", { camadas: [[6, 6], [8, 8], [10, 9]], c1: "verdeMusgo", c2: "verdeFolha", ...V("cinza") }],
  ["Graptopetalum Rosado", "rosette", { camadas: [[5, 6], [6, 7], [8, 9]], c1: "rosaCha", c2: "pessego", ...V("creme", "verdeSalvia") }],
  ["Pachyphytum Lilás", "rosette", { camadas: [[4, 6], [5, 7], [6, 8]], c1: "lilas", c2: "cinza", ...V("bege") }],
  ["Aeonium Roxo", "rosette", { camadas: [[5, 6], [7, 8], [9, 10]], c1: "roxo", c2: "verdeMusgo", ...V("creme") }],
  ["Aeonium Verde-Limão", "rosette", { camadas: [[5, 6], [7, 8], [9, 10]], c1: "verdeClaro", c2: "amarelo", ...V("terracota") }],
  ["Haworthia Listrada", "tall", { n: 10, q: 7, c1: "verdeFolha", borda: "branco", ...V("cinza") }],
  ["Haworthia Transparente", "rosette", { camadas: [[6, 6], [8, 7], [10, 8]], c1: "verdeClaro", c2: "branco", ...V("creme") }],
  ["Aloe Mini", "tall", { n: 12, q: 6, c1: "verdeSalvia", ...V("terracota") }],
  ["Gasteria Pintadinha", "tall", { n: 12, q: 6, c1: "verdeMusgo", borda: "branco", ...V("bege") }],
  ["Sansevieria Mini", "tall", { n: 14, q: 5, c1: "verdeFolha", borda: "mostarda", ...V("cinza") }],
  ["Agave Azul", "tall", { n: 12, q: 8, c1: "azulAcinz", ...V("terracota") }],
  ["Planta-Zebra", "tall", { n: 11, q: 6, c1: "verdeMusgo", borda: "creme", ...V("creme") }],
  ["Faucária Dentadinha", "rosette", { camadas: [[4, 6], [6, 7]], c1: "verdeSalvia", c2: "verdeClaro", vaso: "P", ...V("bege") }],
  ["Cotilédone Azulada", "rosette", { camadas: [[5, 6], [6, 8]], c1: "azulAcinz", c2: "rosaCha", ...V("creme") }],
  ["Jade Bebê", "jade", { c1: "verdeFolha", ...V("terracota") }],
  ["Pagode de Cristal", "jade", { c1: "verdeSalvia", ...V("creme", "verdeSalvia") }],
  ["Dedinho de Moça", "beans", { q: 7, c1: "verdeClaro", ...V("terracota") }],
  ["Feijãozinho Vermelho", "beans", { q: 8, c1: "verdeFolha", ...V("creme") }],
  ["Orelha de Gato", "tall", { n: 8, q: 5, c1: "cinza", borda: "marrom", vaso: "P", ...V("bege") }],
  ["Pedra Viva", "lithops", { pedras: 1, c1: "cinza", ...V("creme") }],
  ["Pedra Viva Dupla", "lithops", { pedras: 2, c1: "bege", vaso: "M", ...V("terracota") }],
  ["Rabo de Burro (pendente)", "beans", { q: 10, c1: "verdeSalvia", pendente: true, c2: "bege", ...V("creme") }],
  ["Echeveria Pavão", "rosette", { camadas: [[5, 6], [7, 8], [9, 10]], c1: "azulAcinz", c2: "lilas", ...V("cinza") }],
  ["Echeveria Príncipe Negro", "rosette", { camadas: [[5, 6], [7, 8], [9, 10]], c1: "cinza", c2: "roxo", ...V("terracota") }],
  ["Rosa de Pedra Gigante", "rosette", { camadas: [[6, 7], [8, 9], [10, 11], [12, 12]], c1: "verdeSalvia", c2: "verdeClaro", vaso: "G", ...V("bege", "terracota") }],
];
const G2 = [
  ["Cacto Bola Verde", "ball", { m: 5, s: 3, c1: "verdeMusgo", ...V("terracota") }],
  ["Cacto Bola com Flor Rosa", "ball", { m: 5, s: 3, c1: "verdeFolha", flor: "rosaPink", ...V("creme") }],
  ["Cacto Bola Pequeno", "ball", { m: 4, s: 2, c1: "verdeSalvia", vaso: "P", ...V("terracota") }],
  ["Cacto Barril", "ball", { m: 6, s: 4, c1: "verdeMusgo", flor: "amarelo", vaso: "G", ...V("bege") }],
  ["Mamilária Branquinha", "ball", { m: 4, s: 3, c1: "branco", flor: "rosaCha", ...V("terracota") }],
  ["Cacto Coluna", "coluna", { s: 9, bracos: 0, c1: "verdeFolha", ...V("terracota") }],
  ["Cacto Coluna Alto", "coluna", { s: 14, bracos: 0, c1: "verdeMusgo", ...V("creme") }],
  ["Saguaro de Dois Braços", "coluna", { s: 11, bracos: 2, c1: "verdeFolha", vaso: "G", ...V("terracota") }],
  ["Saguaro de Um Braço", "coluna", { s: 10, bracos: 1, c1: "verdeSalvia", ...V("bege") }],
  ["Cacto Candelabro", "coluna", { s: 10, bracos: 3, c1: "verdeMusgo", vaso: "G", ...V("cinza") }],
  ["Trio de Cactos Mini", "cluster", { itens: [[3, 2, 1, "verdeFolha"], [3, 1, 1, "verdeSalvia"], [2, 2, 1, "verdeMusgo"]], vaso: "G", ...V("terracota") }],
  ["Cacto Espinhoso", "ball", { m: 5, s: 4, c1: "verdeSalvia", ...V("creme", "terracota") }],
  ["Cacto Chapéu Rosa", "ball", { m: 5, s: 2, c1: "verdeMusgo", flor: "rosaChaX", ...V("bege") }],
  ["Cacto Gordinho com Carinha", "ball", { m: 5, s: 3, c1: "verdeSalvia", rosto: true, ...V("rosaCha") }],
  ["Cacto Fofo de Óculos", "ball", { m: 5, s: 2, c1: "verdeFolha", rosto: true, ...V("mostarda") }],
  ["Palma Simples", "palma", { q: 2, c1: "verdeFolha", ...V("terracota") }],
  ["Palma Tripla", "palma", { q: 3, c1: "verdeSalvia", vaso: "G", ...V("creme") }],
  ["Palma com Flores", "palma", { q: 3, c1: "verdeMusgo", flor: "amarelo", vaso: "G", ...V("bege") }],
  ["Palma Roxa", "palma", { q: 2, c1: "roxo", ...V("cinza") }],
  ["Cacto Lua Rosa", "ball", { m: 4, s: 2, c1: "verdeSalvia", topo: "rosaPink", vaso: "P", ...V("creme") }],
  ["Cacto Lua Amarelo", "ball", { m: 4, s: 2, c1: "verdeSalvia", topo: "amarelo", vaso: "P", ...V("terracota") }],
  ["Cacto Lua Laranja", "ball", { m: 4, s: 2, c1: "verdeSalvia", topo: "laranja", vaso: "P", ...V("bege") }],
  ["Cacto Dedinhos", "cluster", { itens: [[2, 4, 3, "verdeFolha"], [2, 3, 2, "verdeSalvia"]], ...V("terracota") }],
  ["Cacto Bolinhas", "cluster", { itens: [[3, 1, 3, "verdeSalvia"], [2, 1, 2, "verdeMusgo"]], vaso: "G", ...V("creme") }],
  ["Cacto Rabo-de-Rato", "coluna", { s: 12, bracos: 0, c1: "verdeSalvia", ...V("bege", "verdeSalvia") }],
  ["Cacto Estrela", "rosette", { camadas: [[5, 6], [5, 7]], c1: "verdeFolha", c2: "verdeClaro", ...V("terracota") }],
  ["Cacto Torre", "cluster", { itens: [[3, 6, 1, "verdeMusgo"], [2, 6, 1, "verdeFolha"]], vaso: "G", ...V("cinza") }],
  ["Floresta de Cactos", "cluster", { itens: [[3, 7, 1, "verdeFolha"], [3, 4, 1, "verdeSalvia"], [2, 3, 1, "verdeMusgo"]], vaso: "GG", ...V("terracota") }],
  ["Cacto de Natal", "ball", { m: 5, s: 2, c1: "verdeFolha", topo: "vermelho", ...V("branco", "vermelho") }],
  ["Cacto Flor do Deserto", "ball", { m: 5, s: 3, c1: "verdeSalvia", flor: "pessego", ...V("terracota", "creme") }],
];
const fl = (nome, tipo, s) => [nome, tipo, s];
const G3 = [
  fl("Tulipa Rosa", "tulipa", { cor: "rosaCha", ...V("creme") }), fl("Tulipa Amarela", "tulipa", { cor: "amarelo", ...V("terracota") }), fl("Tulipa Vermelha", "tulipa", { cor: "vermelho", ...V("bege") }), fl("Tulipa Roxa", "tulipa", { cor: "roxo", ...V("creme") }),
  fl("Margarida Branca", "flor", { p: 10, n: 7, cor: "branco", centro: "amarelo", k: 3, ...V("terracota") }), fl("Margarida Amarela", "flor", { p: 10, n: 7, cor: "amarelo", centro: "marrom", k: 3, ...V("creme") }),
  fl("Girassol Grande", "girassol", { k: 5, p: 14, haste: 18, ...V("terracota") }), fl("Girassol Mini", "girassol", { k: 3, p: 10, haste: 12, vaso: "M", ...V("creme") }),
  fl("Lavanda Roxa", "lavanda", { q: 7, cor: "roxo", ...V("creme") }), fl("Lavanda Lilás", "lavanda", { q: 7, cor: "lilas", ...V("terracota") }),
  fl("Papoula Laranja", "flor", { p: 5, n: 8, cor: "laranja", centro: "marrom", k: 2, ...V("bege") }), fl("Papoula Vermelha", "flor", { p: 5, n: 8, cor: "vermelho", centro: "marrom", k: 2, ...V("creme") }),
  fl("Peônia Coral", "flor", { p: 6, p2: 6, n: 8, cor: "pessego", cor2: "laranja", centro: "amarelo", k: 2, vaso: "G", ...V("bege") }), fl("Peônia Rosa", "flor", { p: 6, p2: 6, n: 8, cor: "rosaCha", cor2: "rosaPink", centro: "amarelo", k: 2, vaso: "G", ...V("creme") }),
  fl("Hortênsia Azul", "hortensia", { q: 9, cor: "azul", ...V("creme") }), fl("Hortênsia Rosa", "hortensia", { q: 9, cor: "rosaCha", ...V("terracota") }),
  fl("Hibisco Vermelho", "flor", { p: 5, n: 10, cor: "vermelho", centro: "amarelo", k: 2, vaso: "G", ...V("creme") }), fl("Hibisco Rosa", "flor", { p: 5, n: 10, cor: "rosaPink", centro: "mostarda", k: 2, vaso: "G", ...V("bege") }),
  fl("Cosmos Rosa", "flor", { p: 8, n: 7, cor: "rosaCha", centro: "mostarda", k: 2, ...V("creme") }), fl("Cosmos Branco", "flor", { p: 8, n: 7, cor: "branco", centro: "mostarda", k: 2, ...V("terracota") }),
  fl("Gérbera Laranja", "flor", { p: 12, n: 8, cor: "laranja", centro: "marrom", k: 3, ...V("bege") }), fl("Gérbera Rosa", "flor", { p: 12, n: 8, cor: "rosaPink", centro: "marrom", k: 3, ...V("creme") }),
  fl("Violeta Roxa", "flor", { p: 5, n: 6, cor: "roxo", centro: "amarelo", k: 2, haste: 8, fo: 4, vaso: "P", ...V("creme") }), fl("Violeta Lilás", "flor", { p: 5, n: 6, cor: "lilas", centro: "amarelo", k: 2, haste: 8, fo: 4, vaso: "P", ...V("terracota") }),
  fl("Amarílis Vermelha", "flor", { p: 6, n: 12, cor: "vermelho", centro: "mostarda", k: 2, haste: 20, vaso: "G", ...V("bege") }), fl("Miosótis Azul", "flor", { p: 5, n: 5, cor: "azul", centro: "amarelo", k: 2, haste: 8, fo: 3, vaso: "P", ...V("creme") }),
  fl("Cravina Rosa", "flor", { p: 7, n: 6, cor: "rosaChaX", centro: "rosaPink", k: 2, haste: 12, ...V("terracota") }), fl("Copo-de-Leite", "flor", { p: 1, n: 14, cor: "branco", centro: "amarelo", k: 2, haste: 20, fo: 3, vaso: "G", ...V("bege") }),
  fl("Flor-Estrela Vermelha", "flor", { p: 8, n: 9, cor: "vermelho", centro: "branco", k: 2, ...V("creme") }), fl("Mimosa Amarela", "lavanda", { q: 6, cor: "amarelo", ...V("terracota") }),
];
const G4 = [
  ["Costela-de-Adão", "leque", { folhas: [[14, 3, "verdeFolha"], [12, 2, "verdeMusgo"]], nervura: true, vaso: "G", ...V("creme") }],
  ["Jiboia Pendente", "vine", { comp: 70, ramas: 3, folhasPorRama: 14, n: 7, c1: "verdeFolha", cabide: true, ...V("creme") }],
  ["Jiboia Dourada", "vine", { comp: 70, ramas: 3, folhasPorRama: 14, n: 7, c1: "mostarda", cabide: true, ...V("terracota") }],
  ["Samambaia", "fern", { q: 7, pares: 10, c1: "verdeFolha", ...V("terracota") }],
  ["Samambaia Americana", "fern", { q: 9, pares: 12, c1: "verdeClaro", vaso: "GG", ...V("bege") }],
  ["Maranta", "redonda", { k: 5, q: 6, c1: "verdeFolha", contorno: "verdeClaro", ...V("creme") }],
  ["Calatéia Rosa", "redonda", { k: 5, q: 5, c1: "verdeMusgo", contorno: "rosaCha", ...V("bege") }],
  ["Zamioculca", "leque", { folhas: [[9, 7, "verdeMusgo"]], vaso: "G", ...V("terracota") }],
  ["Planta-Dinheiro", "redonda", { k: 3, q: 9, c1: "verdeFolha", vaso: "P", ...V("creme") }],
  ["Pilea", "redonda", { k: 3, q: 10, c1: "verdeClaro", ...V("terracota") }],
  ["Lírio-da-Paz", "leque", { folhas: [[11, 5, "verdeFolha"], [9, 2, "branco"]], vaso: "G", ...V("creme") }],
  ["Antúrio Vermelho", "leque", { folhas: [[8, 3, "vermelho"], [11, 3, "verdeFolha"]], vaso: "G", ...V("bege") }],
  ["Antúrio Rosa", "leque", { folhas: [[8, 3, "rosaCha"], [11, 3, "verdeFolha"]], vaso: "G", ...V("creme") }],
  ["Columeia Florida", "vine", { comp: 60, ramas: 3, folhasPorRama: 12, n: 6, c1: "verdeMusgo", cabide: true, ...V("terracota") }],
  ["Fita (Planta-Aranha)", "leque", { folhas: [[16, 8, "verdeClaro"]], vaso: "G", ...V("creme") }],
  ["Trapoeraba Roxa", "vine", { comp: 60, ramas: 4, folhasPorRama: 10, n: 7, c1: "roxo", cabide: true, ...V("bege") }],
  ["Dólar Pendente", "vine", { comp: 60, ramas: 3, folhasPorRama: 16, n: 6, c1: "verdeSalvia", ...V("creme") }],
  ["Peperômia", "redonda", { k: 4, q: 6, c1: "verdeSalvia", contorno: "creme", ...V("terracota") }],
  ["Hera Pendente", "vine", { comp: 80, ramas: 3, folhasPorRama: 16, n: 6, c1: "verdeFolha", cabide: true, ...V("creme") }],
  ["Filodendro Coração", "vine", { comp: 70, ramas: 3, folhasPorRama: 12, n: 8, c1: "verdeMusgo", cabide: true, ...V("cinza") }],
  ["Singônio", "leque", { folhas: [[8, 6, "verdeClaro"]], vaso: "M", ...V("terracota") }],
  ["Tinhorão", "leque", { folhas: [[12, 4, "verdeFolha"], [10, 2, "rosaCha"]], nervura: true, vaso: "G", ...V("bege") }],
  ["Alocásia", "leque", { folhas: [[14, 3, "verdeMusgo"], [10, 2, "verdeFolha"]], nervura: true, vaso: "G", ...V("creme") }],
  ["Palmeira Areca Mini", "leque", { folhas: [[12, 9, "verdeSalvia"]], vaso: "G", ...V("terracota") }],
  ["Bambu-da-Sorte", "leque", { folhas: [[7, 8, "verdeClaro"]], vaso: "M", ...V("cinza") }],
  ["Begônia Rex", "redonda", { k: 5, q: 5, c1: "vinho", contorno: "verdeClaro", ...V("creme") }],
  ["Calatéia Zebrina", "leque", { folhas: [[10, 6, "verdeFolha"]], nervura: true, vaso: "G", ...V("bege") }],
  ["Rabo-de-Macaco Pendente", "vine", { comp: 90, ramas: 2, folhasPorRama: 18, n: 5, c1: "verdeSalvia", cabide: true, ...V("terracota") }],
  ["Folha-de-Figo Mini", "leque", { folhas: [[9, 5, "verdeMusgo"]], vaso: "M", ...V("creme") }],
  ["Costela-de-Adão Variegada", "leque", { folhas: [[14, 3, "verdeFolha"], [12, 2, "creme"]], nervura: true, vaso: "G", ...V("terracota") }],
];
const sp = (nome, orelhas, laco, pot, c1, vaso) => [nome, "sprout", { orelhas, laco, c1, vaso: vaso || "M", ...V(pot) }];
const suc = { t: "rosette", s: { camadas: [[5, 6], [6, 8]], c1: "verdeSalvia", c2: "rosaCha", vaso: "M", ...V("creme") } };
const cac = { t: "ball", s: { m: 4, s: 2, c1: "verdeFolha", vaso: "M", ...V("creme") } };
const flo = { t: "flor", s: { p: 6, n: 7, cor: "rosaCha", centro: "mostarda", k: 2, haste: 10, vaso: "M", ...V("creme") } };
const G5 = [
  ["Jardineira de Suculentas", "jardineira", { w: 20, itens: [suc, { t: "rosette", s: { camadas: [[5, 6], [6, 8]], c1: "azulAcinz", c2: "verdeClaro", vaso: "M", ...V("creme") } }, { t: "beans", s: { q: 5, c1: "verdeClaro", vaso: "M", ...V("creme") } }], pot: "bege", cor1: "verdeSalvia", cor2: "rosaCha" }],
  ["Jardineira de Cactos", "jardineira", { w: 20, itens: [cac, { t: "coluna", s: { s: 8, bracos: 0, c1: "verdeSalvia", vaso: "M", ...V("creme") } }, { t: "ball", s: { m: 3, s: 1, c1: "verdeMusgo", vaso: "M", ...V("creme") } }], pot: "terracota" }],
  ["Jardineira de Flores", "jardineira", { w: 22, itens: [flo, { t: "tulipa", s: { cor: "amarelo", vaso: "M", ...V("creme") } }, { t: "lavanda", s: { q: 5, cor: "lilas", vaso: "M", ...V("creme") } }], pot: "creme", cor2: "rosaCha" }],
  ["Cesta de Suculentas", "mini", { itens: [suc, { t: "rosette", s: { camadas: [[5, 6], [6, 8]], c1: "lilas", c2: "verdeSalvia", vaso: "M", ...V("creme") } }, { t: "jade", s: { c1: "verdeFolha", vaso: "M", ...V("creme") } }], pot: "bege", barra: "marrom", vaso: "GG" }],
  ["Vaso Gigante de Cactos", "mini", { itens: [cac, { t: "coluna", s: { s: 11, bracos: 1, c1: "verdeFolha", vaso: "M", ...V("creme") } }, { t: "palma", s: { q: 2, c1: "verdeSalvia", vaso: "M", ...V("creme") } }], pot: "terracota", vaso: "GG" }],
  ["Cesto de Flores do Campo", "mini", { itens: [flo, { t: "flor", s: { p: 8, n: 7, cor: "branco", centro: "amarelo", k: 3, vaso: "M", ...V("creme") } }, { t: "lavanda", s: { q: 5, cor: "roxo", vaso: "M", ...V("creme") } }], pot: "bege", barra: "mostarda", vaso: "GG" }],
  ["Terrário de Suculentas", "mini", { itens: [suc, cac, { t: "beans", s: { q: 5, c1: "verdeClaro", vaso: "M", ...V("creme") } }], pot: "branco", vaso: "GG" }],
  ["Jardim Zen", "mini", { itens: [{ t: "lithops", s: { pedras: 2, c1: "cinza", vaso: "M", ...V("creme") } }, suc, { t: "lithops", s: { pedras: 1, c1: "bege", vaso: "M", ...V("creme") } }], pot: "cinza", vaso: "GG" }],
  ["Dupla de Suculentas", "mini", { itens: [suc, { t: "rosette", s: { camadas: [[5, 6], [6, 8]], c1: "azulAcinz", c2: "rosaCha", vaso: "M", ...V("creme") } }], pot: "creme", vaso: "G" }],
  ["Trio de Cactos no Vaso", "mini", { itens: [cac, { t: "ball", s: { m: 3, s: 1, c1: "verdeSalvia", vaso: "M", ...V("creme") } }, { t: "ball", s: { m: 4, s: 3, c1: "verdeMusgo", vaso: "M", ...V("creme") } }], pot: "terracota", vaso: "G" }],
  ["Cesto de Suculentas Rosas", "mini", { itens: [{ t: "rosette", s: { camadas: [[5, 6], [6, 8]], c1: "rosaCha", c2: "pessego", vaso: "M", ...V("creme") } }, { t: "rosette", s: { camadas: [[5, 6], [6, 8]], c1: "lilas", c2: "rosaCha", vaso: "M", ...V("creme") } }, suc], pot: "rosaCha", vaso: "GG" }],
  ["Vaso de Flores e Folhas", "mini", { itens: [flo, { t: "redonda", s: { k: 4, q: 5, c1: "verdeFolha", vaso: "M", ...V("creme") } }, { t: "tulipa", s: { cor: "rosaCha", vaso: "M", ...V("creme") } }], pot: "creme", vaso: "GG" }],
  sp("Vasinho com Carinha", false, null, "rosaCha", "verdeFolha"), sp("Vasinho Orelhudo", true, null, "bege", "verdeFolha"), sp("Vasinho Gatinho", true, null, "cinza", "verdeSalvia"), sp("Vasinho Ursinho", true, null, "marrom", "verdeFolha"),
  sp("Vasinho com Laço Rosa", false, "rosaCha", "creme", "verdeFolha"), sp("Vasinho com Laço Vermelho", false, "vermelho", "creme", "verdeSalvia"), sp("Vasinho Azul", false, null, "azulAcinz", "verdeClaro"), sp("Vasinho Mostarda", false, null, "mostarda", "verdeFolha"),
  sp("Vasinho Lilás", false, null, "lilas", "verdeClaro"), sp("Vasinho Pêssego", false, "pessego", "pessego", "verdeFolha"), sp("Vasinho Gigante com Carinha", false, null, "creme", "verdeFolha", "G"), sp("Vasinho Mini Chaveiro", false, null, "rosaCha", "verdeSalvia", "P"),
  sp("Vasinho Coelhinho", true, null, "branco", "verdeClaro"), sp("Vasinho Panda", true, null, "branco", "verdeFolha"),
  sp("Vasinho Abelhinha", false, null, "amarelo", "verdeFolha"), sp("Vasinho Joaninha", false, null, "vermelho", "verdeClaro"), sp("Vasinho Dinossauro", true, null, "verdeClaro", "verdeFolha"), sp("Vasinho Unicórnio", false, "rosaCha", "branco", "verdeSalvia"),
];
// extras (bônus +50): 10 por grupo, variações novas
const E1 = [
  ["Echeveria Pêssego", "rosette", { camadas: [[5, 6], [6, 8], [8, 10]], c1: "pessego", c2: "verdeClaro", ...V("creme") }], ["Echeveria Cinza", "rosette", { camadas: [[5, 6], [6, 8], [8, 10]], c1: "cinza", c2: "azulAcinz", ...V("bege") }],
  ["Sedum Ponta de Rosa", "beans", { q: 9, c1: "rosaCha", ...V("creme") }], ["Aloe Azulada", "tall", { n: 13, q: 6, c1: "azulAcinz", borda: "creme", ...V("terracota") }],
  ["Haworthia Branca", "tall", { n: 9, q: 8, c1: "verdeClaro", borda: "branco", vaso: "P", ...V("cinza") }], ["Jade Rosada", "jade", { c1: "rosaCha", ...V("creme") }],
  ["Rosa de Pedra Lilás", "rosette", { camadas: [[5, 7], [7, 9], [9, 11]], c1: "lilas", c2: "azulAcinz", ...V("bege") }], ["Pedra Viva Rosa", "lithops", { pedras: 1, c1: "rosaCha", ...V("creme") }],
  ["Aeonium Rosa-Café", "rosette", { camadas: [[5, 6], [7, 8], [9, 10]], c1: "marrom", c2: "rosaCha", ...V("creme") }], ["Echeveria Amarelada", "rosette", { camadas: [[5, 6], [6, 8]], c1: "mostarda", c2: "verdeClaro", ...V("terracota") }],
];
const E2 = [
  ["Cacto Bola Azulado", "ball", { m: 5, s: 3, c1: "azulAcinz", ...V("terracota") }], ["Cacto Lua Roxo", "ball", { m: 4, s: 2, c1: "verdeSalvia", topo: "roxo", vaso: "P", ...V("creme") }],
  ["Cacto Fofo Rosado", "ball", { m: 5, s: 3, c1: "rosaCha", rosto: true, ...V("creme") }], ["Saguaro Verde-Claro", "coluna", { s: 11, bracos: 2, c1: "verdeClaro", vaso: "G", ...V("bege") }],
  ["Cacto Coluna com Flor", "coluna", { s: 10, bracos: 0, c1: "verdeFolha", flor: "rosaPink", ...V("terracota") }], ["Palma Azulada", "palma", { q: 3, c1: "azulAcinz", vaso: "G", ...V("creme") }],
  ["Cacto Barril Dourado", "ball", { m: 6, s: 4, c1: "mostarda", vaso: "G", ...V("creme") }], ["Dupla de Cactos Mini", "cluster", { itens: [[3, 2, 1, "verdeFolha"], [2, 2, 1, "verdeSalvia"]], ...V("terracota") }],
  ["Cacto Neve", "ball", { m: 4, s: 3, c1: "branco", ...V("bege") }], ["Cacto Pimenta", "coluna", { s: 8, bracos: 0, c1: "vermelho", ...V("creme") }],
];
const E3 = [
  ["Rosa Miniatura", "flor", { p: 6, p2: 5, n: 7, cor: "vermelho", cor2: "rosaPink", centro: "rosaPink", k: 2, vaso: "M", ...V("creme") }], ["Margarida Rosa", "flor", { p: 10, n: 7, cor: "rosaCha", centro: "amarelo", k: 3, ...V("creme") }],
  ["Tulipa Laranja", "tulipa", { cor: "laranja", ...V("bege") }], ["Tulipa Branca", "tulipa", { cor: "branco", ...V("terracota") }], ["Girassol Branco", "flor", { p: 12, n: 8, cor: "creme", centro: "marrom", k: 4, haste: 16, vaso: "G", ...V("terracota") }],
  ["Lavanda Branca", "lavanda", { q: 7, cor: "branco", ...V("creme") }], ["Hortênsia Lilás", "hortensia", { q: 9, cor: "lilas", ...V("creme") }], ["Papoula Rosa", "flor", { p: 5, n: 8, cor: "rosaPink", centro: "marrom", k: 2, ...V("bege") }],
  ["Gérbera Amarela", "flor", { p: 12, n: 8, cor: "amarelo", centro: "marrom", k: 3, ...V("terracota") }], ["Peônia Branca", "flor", { p: 6, p2: 6, n: 8, cor: "branco", cor2: "creme", centro: "amarelo", k: 2, vaso: "G", ...V("bege") }],
];
const E4 = [
  ["Jiboia Variegada", "vine", { comp: 70, ramas: 3, folhasPorRama: 14, n: 7, c1: "verdeClaro", cabide: true, ...V("creme") }], ["Samambaia Pendente", "vine", { comp: 80, ramas: 4, folhasPorRama: 18, n: 5, c1: "verdeFolha", cabide: true, ...V("terracota") }],
  ["Maranta Roxa", "redonda", { k: 5, q: 6, c1: "roxo", contorno: "rosaCha", ...V("creme") }], ["Zamioculca Clara", "leque", { folhas: [[9, 7, "verdeClaro"]], vaso: "G", ...V("bege") }],
  ["Pilea Rosada", "redonda", { k: 3, q: 10, c1: "rosaCha", ...V("creme") }], ["Palmeira Ráfis Mini", "leque", { folhas: [[12, 10, "verdeMusgo"]], vaso: "G", ...V("terracota") }],
  ["Hera Dourada Pendente", "vine", { comp: 80, ramas: 3, folhasPorRama: 16, n: 6, c1: "mostarda", cabide: true, ...V("creme") }], ["Fita Variegada", "leque", { folhas: [[16, 8, "verdeSalvia"], [14, 2, "creme"]], vaso: "G", ...V("bege") }],
  ["Antúrio Branco", "leque", { folhas: [[8, 3, "branco"], [11, 3, "verdeFolha"]], vaso: "G", ...V("terracota") }], ["Samambaia de Mesa", "fern", { q: 6, pares: 9, c1: "verdeSalvia", ...V("creme") }],
];
const E5 = [
  sp("Vasinho Raposa", true, null, "laranja", "verdeFolha"), sp("Vasinho Porquinho", true, null, "rosaCha", "verdeClaro"), sp("Vasinho Pintinho", true, null, "amarelo", "verdeFolha"), sp("Vasinho Leãozinho", true, null, "mostarda", "verdeFolha"),
  sp("Vasinho com Laço Azul", false, "azulAcinz", "creme", "verdeClaro"), sp("Vasinho Verde-Água", false, null, "verdeClaro", "verdeFolha"), sp("Vasinho Coração", false, "vermelho", "rosaCha", "verdeSalvia"), sp("Vasinho Natalino", false, "vermelho", "verdeMusgo", "verdeClaro"),
  ["Jardineira Zen", "jardineira", { w: 18, itens: [{ t: "lithops", s: { pedras: 1, c1: "cinza", vaso: "M", ...V("creme") } }, suc], pot: "cinza" }], ["Cesta de Primavera", "mini", { itens: [flo, { t: "tulipa", s: { cor: "amarelo", vaso: "M", ...V("creme") } }, { t: "tulipa", s: { cor: "rosaCha", vaso: "M", ...V("creme") } }], pot: "bege", barra: "verdeClaro", vaso: "GG" }],
];
// corrige cores "X" que não existem na paleta
const fix = (s) => { for (const k of Object.keys(s)) { if (s[k] === "rosaChaX") s[k] = "rosaPink"; if (s[k] === "vinho") s[k] = "roxo"; } return s; };

export function gerar() {
  const grupos = [
    { id: 1, nome: "Suculentas", lista: G1 }, { id: 2, nome: "Cactos", lista: G2 }, { id: 3, nome: "Flores", lista: G3 }, { id: 4, nome: "Folhagens e pendentes", lista: G4 }, { id: 5, nome: "Mini jardins e vasinhos", lista: G5 },
  ];
  const extras = [E1, E2, E3, E4, E5];
  const rec = []; let id = 1; const nomes = new Set();
  grupos.forEach((g) => {
    if (g.lista.length !== 30) throw new Error(`Grupo ${g.nome} tem ${g.lista.length}, precisa de 30`);
    g.lista.forEach(([nome, tipo, spec]) => { if (nomes.has(nome)) throw new Error("nome repetido: " + nome); nomes.add(nome); fix(spec); rec.push(finalizar(id++, g.id, false, nome, tipo, spec)); });
  });
  extras.forEach((lista, gi) => {
    if (lista.length !== 10) throw new Error(`Extra ${gi + 1} tem ${lista.length}`);
    lista.forEach(([nome, tipo, spec]) => { if (nomes.has(nome)) throw new Error("nome repetido: " + nome); nomes.add(nome); fix(spec); rec.push(finalizar(id++, gi + 1, true, nome, tipo, spec)); });
  });
  return { grupos: grupos.map((g) => ({ id: g.id, nome: g.nome })), cores: Object.fromEntries(Object.entries(COR).map(([k, v]) => [k, v[1]])), nomes: Object.fromEntries(Object.entries(COR).map(([k, v]) => [k, v[0]])), receitas: rec };
}
if (process.argv[1] && process.argv[1].endsWith("gerar-dados.mjs")) {
  const d = gerar();
  writeFileSync(join(AQUI, "dados.json"), JSON.stringify(d));
  const pontos = d.receitas.map((r) => r.pontos);
  console.log("receitas:", d.receitas.length, "· principais:", d.receitas.filter((r) => !r.extra).length, "· extras:", d.receitas.filter((r) => r.extra).length);
  console.log("pontos min/máx:", Math.min(...pontos), Math.max(...pontos), "· tempo min/máx (min):", Math.min(...d.receitas.map((r) => r.min)), Math.max(...d.receitas.map((r) => r.min)));
  const n = {}; d.receitas.forEach((r) => (n[r.nivel] = (n[r.nivel] || 0) + 1)); console.log("níveis:", n);
}
