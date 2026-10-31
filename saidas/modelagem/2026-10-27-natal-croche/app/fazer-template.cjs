// Monta app-template.html (Natal) a partir do template do Jardim + as peças novas em parts/.  node fazer-template.cjs
const fs = require("fs"), path = require("path");
const AQUI = __dirname;
const J = fs.readFileSync(path.join(AQUI, "..", "..", "2026-10-23-plantas-amigurumi", "app", "app-template.html"), "utf8");
const parts = (n) => fs.readFileSync(path.join(AQUI, "parts", n), "utf8");
const cut = (s, a, b) => { const i = s.indexOf(a); const j = b ? s.indexOf(b, i) : s.length; if (i < 0 || j < 0) throw new Error("marcador não achado: " + a + " / " + b); return s.slice(i, j); };

// cabeça (CSS) com a paleta de Natal
let head = J.slice(0, J.indexOf("<body>"));
head = head.replace("<title>Jardim de Amigurumi</title>", "<title>Enfeites de Crochê Natalinos</title>").replace('content="#7A5233"', 'content="#1F4D2E"');
head = head.replace(/:root\{[^}]*\}/, ":root{--bg:#F6EFE3;--bg2:#EADCC3;--card:#FFFBF2;--brown:#1F4D2E;--brown-d:#143822;--ink:#33241A;--soft:#7A6650;--terra:#B8352B;--terra-d:#8E241C;--sage:#2F6B3A;--sage-l:#DCE9D6;--line:rgba(20,56,34,.15);--r:18px;--sh:0 6px 20px -10px rgba(20,56,34,.45)}");
head = head.replace(".bar i{display:block;height:100%;background:#F2CB8A;border-radius:99px}", ".bar i{display:block;height:100%;background:#E8C766;border-radius:99px}");
head = head.replace("</style>", ".card .art svg,.rec-art svg{filter:drop-shadow(0 1px 1.4px rgba(40,25,15,.5))}</style>");
const body = `<body>
<div class="top" id="top"><button class="back" id="back" aria-label="Voltar">←</button><div class="logo">Enfeites de Crochê Natalinos</div></div>
<div class="wrap" id="app"></div>
<nav class="bottom" id="nav">
  <button data-r="home"><i>🏠</i>Início</button>
  <button data-r="enfeites"><i>🎄</i>Enfeites</button>
  <button data-r="ferramentas"><i>🧰</i>Ferramentas</button>
  <button data-r="bonus"><i>🎁</i>Bônus</button>
</nav>
<script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
<script>
`;
const palavras = (s) => s.replace(/Plantinha feita/g, "Enfeite feito").replace(/plantinhas/g, "enfeites").replace(/Plantinha/g, "Enfeite").replace(/plantinha/g, "enfeite").replace(/#F3E9D2/g, "#F6EFE3");
let receita = palavras(cut(J, "function receita(id){", "function aulas(){"));
let assist = palavras(cut(J, "let qa='';", "function comunidade(){"));
let precos = palavras(cut(J, "const PR=", "function papelaria(){")).replace("${G.map(g=>`<button class=\"chip ${fGp===g.id", "${AG.map(g=>`<button class=\"chip ${fGp===g.id");
let msgs = cut(J, "function mensagens(){", "function ideias(){");
let cont = palavras(cut(J, "const CT=", "let selM=")).replace("Ex.: Suculenta rosa, vaso bege", "Ex.: Bolinha vermelha com laço dourado");
if (!precos.includes("AG.map")) throw new Error("chips de preço não trocados");
const draw = `
let fGm=1;
function draw(keep,focusId){
  const r=rota; let h='';
  if(r.r==='home')h=home();else if(r.r==='enfeites')h=enfeites();else if(r.r==='grupo')h=grupo(r.p);else if(r.r==='receita')h=receita(r.p);else if(r.r==='ferramentas')h=ferramentas();
  else if(r.r==='bolinhas')h=bolinhas();else if(r.r==='assistente')h=assistente();else if(r.r==='acabamento')h=acabamento();else if(r.r==='bonus')h=bonus();
  else if(r.r==='precos')h=precos(r.p);else if(r.r==='mensagens')h=mensagens();else if(r.r==='contador')h=contador();
  const y=window.scrollY;$app.innerHTML=h;
  $top.classList.toggle('has-back',r.r!=='home');
  const ehBonus=r.r==='receita'?!!(R.find(x=>x.id===r.p)||{}).bump:(r.r==='grupo'&&r.p>6);
  const ativo=['home','enfeites','ferramentas','bonus'].includes(r.r)?r.r:(r.r==='receita'||r.r==='grupo')?(ehBonus?'bonus':'enfeites'):['precos','mensagens'].includes(r.r)?'bonus':'ferramentas';
  document.querySelectorAll('#nav button').forEach(b=>b.classList.toggle('on',b.dataset.r===ativo));
  if(keep)window.scrollTo(0,y);
  if(focusId){const el=document.getElementById(focusId);if(el){el.focus();const v=el.value;try{el.setSelectionRange(v.length,v.length)}catch(e){}}}
}
draw();
</script>
</body>
</html>
`;
const out = head + body + parts("config.js") + parts("arte.js") + parts("telas.js") + "\n" + receita + "\n" + assist + "\n" + precos + "\n" + msgs + "\n" + cont + draw;
fs.writeFileSync(path.join(AQUI, "app-template.html"), out);
console.log("template:", (out.length / 1024).toFixed(0), "KB");
