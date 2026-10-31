/* ===== CONFIGURAÇÃO ===== */
const SUPORTE_URL = "";      /* link do WhatsApp de suporte */
const IMG = "https://zitfuuullg008-debug.github.io/harness-ofertas/imagens/enfeites-de-natal-lucrativos/";
const DADOS = /*DADOS*/null;
const MENSAGENS = /*MENSAGENS*/[];
const SABER = /*SABER*/[];
const COR = DADOS.cores, G = DADOS.grupos, R = DADOS.receitas, GX = DADOS.colecoes || [];
const AG = [...G, ...GX];
const BONUS = [
  {n:1,r:"grupo",p:7,t:"20 peças de mesa posta para o Natal",d:"Porta-guardanapo, sousplat, centro de mesa e mais."},
  {n:2,r:"grupo",p:8,t:"15 meias e botinhas de lareira",d:"Uma para cada pessoa da casa, e uma para o pet."},
  {n:3,r:"grupo",p:9,t:"10 mini amigurumis para pendurar na árvore",d:"Papai Noel, rena, boneco de neve e mais."},
  {n:4,r:"precos",t:"Tabela de preços dos 120 enfeites",d:"Quanto cobrar por peça, calculado com o seu fio e a sua hora."},
  {n:5,r:"mensagens",t:"30 mensagens prontas para vender",d:"Copie, cole e mande no WhatsApp e no Instagram."}
];
/* ===== armazenamento (só neste aparelho) ===== */
const ls = {get(k,d){try{const v=localStorage.getItem('nat_'+k);return v?JSON.parse(v):d}catch(e){return d}},set(k,v){try{localStorage.setItem('nat_'+k,JSON.stringify(v))}catch(e){}}};
let fav=new Set(ls.get('fav',[])), feitas=new Set(ls.get('feitas',[])), voltas=new Set(ls.get('voltas',[]));
const sv=()=>{ls.set('fav',[...fav]);ls.set('feitas',[...feitas]);ls.set('voltas',[...voltas])};
const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const brl=n=>'R$ '+Number(n).toFixed(2).replace('.',',');
