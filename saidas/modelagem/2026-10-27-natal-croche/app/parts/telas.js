/* ===== telas ===== */
const $app=document.getElementById('app'),$top=document.getElementById('top');
let hist=[], rota={r:'home'};
const nomeG=id=>(AG.find(g=>g.id===id)||{}).nome;
function go(r,p,push=true){ if(push)hist.push(rota); rota={r,p}; draw(); window.scrollTo(0,0); }
document.getElementById('back').onclick=()=>{const a=hist.pop(); if(a){rota=a;draw();window.scrollTo(0,0)}else go('home',null,false)};
document.querySelectorAll('#nav button').forEach(b=>b.onclick=()=>{hist=[];go(b.dataset.r,null,false)});
function cardRec(r){const f=fav.has(r.id),ok=feitas.has(r.id);return `<div class="card" onclick="go('receita',${r.id})"><div class="art">${arte(r.desenho)}${ok?'<span class="badge ok">FEITO ✓</span>':(r.bump?'<span class="badge">BÔNUS</span>':'')}<button class="fav" onclick="event.stopPropagation();tfav(${r.id})">${f?'❤️':'🤍'}</button></div><div class="tx"><div class="tt">${esc(r.nome)}</div><div class="st">${r.tempo} · ${r.nivel}</div></div></div>`}
function tfav(id){fav.has(id)?fav.delete(id):fav.add(id);sv();draw(true)}
function cardGrupo(g,rot){const l=R.filter(x=>x.grupo===g.id);const fe=l.filter(x=>feitas.has(x.id)).length;return `<div class="card" onclick="go('grupo',${g.id})"><div class="art">${arte(l[0].desenho)}<span class="badge">${l.length} receitas</span></div><div class="tx"><div class="tt">${g.nome}</div><div class="st">${fe} feitas</div></div></div>`}
function home(){
  const base=R.filter(x=>!x.bump),fe=base.filter(x=>feitas.has(x.id)).length,nb=R.length-base.length;
  return `<div class="hello">Que bom ter você aqui 🎄 <b>Seu acesso é para sempre.</b></div>
  <div class="hero"><div><h1>Enfeites de Crochê Natalinos</h1><p>${base.length} enfeites de Natal em crochê, com a contagem de cada rodada, mais ${nb} peças de bônus.</p><div class="bar"><i style="width:${Math.round(fe/base.length*100)}%"></i></div><div class="prog">${fe} de ${base.length} enfeites feitos</div></div><img src="${IMG}produto-1.webp" alt="Enfeites de Crochê Natalinos" onerror="this.style.display='none'"></div>
  <div class="tiles">
    <div class="tile" onclick="go('bolinhas')"><div class="ic">🎈</div><div><b>Bolinhas engomadas</b><span>Passo a passo com bexiga e cola</span></div></div>
    <div class="tile" onclick="go('contador')"><div class="ic">🔢</div><div><b>Contador de pontos</b><span>Nunca perca a conta da carreira</span></div></div>
    <div class="tile" onclick="go('precos')"><div class="ic">💰</div><div><b>Calculadora de preços</b><span>Quanto cobrar, se quiser vender</span></div></div>
    <div class="tile" onclick="go('acabamento')"><div class="ic">🎀</div><div><b>Acabamento e embalagem</b><span>Para presentear e vender</span></div></div>
    <div class="tile" onclick="go('assistente')"><div class="ic">💡</div><div><b>Tire suas dúvidas</b><span>Respostas na hora</span></div></div>
  </div>
  <h2 class="sec">Seus enfeites</h2>
  <div class="grid">${G.map(g=>cardGrupo(g)).join('')}</div>
  <h2 class="sec">Bônus do seu acesso</h2>
  <div class="grid">${BONUS.map(bn=>`<div class="card" onclick="go('${bn.r}'${bn.p?','+bn.p:''})"><div class="art"><img src="${IMG}bonuses-${bn.n}.webp" alt="${esc(bn.t)}" onerror="this.outerHTML='<div style=font-size:40px>🎁</div>'"><span class="badge">BÔNUS ${bn.n}</span></div><div class="tx"><div class="tt">${bn.t}</div><div class="st">${bn.d}</div></div></div>`).join('')}</div>
  <div class="note">As contagens foram calculadas por rodada e as medidas são aproximadas (fio de algodão 8/6 e agulha de 2,5 mm). Faça sempre uma amostra pequena antes de começar a peça.</div>`;
}
let fG={q:'',t:'todas',n:'todos',fav:false,feita:false};
function grupo(id){
  const base=R.filter(x=>x.grupo===id);
  const l=base.filter(x=>(fG.q?x.nome.toLowerCase().includes(fG.q.toLowerCase()):true)&&(fG.t==='todas'||(fG.t==='r'&&x.min<=60)||(fG.t==='m'&&x.min>60&&x.min<=120)||(fG.t==='l'&&x.min>120))&&(fG.n==='todos'||x.nivel===fG.n)&&(!fG.fav||fav.has(x.id))&&(!fG.feita||feitas.has(x.id)));
  const ch=(k,v,t)=>`<button class="chip ${fG[k]===v?'on':''}" onclick="fG['${k}']='${v}';draw(true)">${t}</button>`;
  return `<h1 style="font-size:24px">${nomeG(id)}</h1><div class="note" style="margin:4px 0 0">${base.length} receitas</div>
  <div class="search"><span>🔍</span><input id="q" placeholder="Buscar enfeite..." value="${esc(fG.q)}" oninput="fG.q=this.value;draw(true,'q')"></div>
  <div class="chips">${ch('t','todas','Todos os tempos')}${ch('t','r','Até 1h')}${ch('t','m','1h a 2h')}${ch('t','l','Mais de 2h')}</div>
  <div class="chips">${ch('n','todos','Todos os níveis')}${ch('n','Iniciante','Iniciante')}${ch('n','Intermediário','Intermediário')}${ch('n','Avançado','Avançado')}<button class="chip ${fG.fav?'on':''}" onclick="fG.fav=!fG.fav;draw(true)">❤ Favoritos</button><button class="chip ${fG.feita?'on':''}" onclick="fG.feita=!fG.feita;draw(true)">✓ Feitos</button></div>
  ${l.length?`<div class="grid">${l.map(cardRec).join('')}</div>`:'<div class="empty">Nenhum enfeite com esses filtros.</div>'}`;
}
let qAll='';
function enfeites(){
  const q=qAll.trim().toLowerCase(),res=q?R.filter(x=>x.nome.toLowerCase().includes(q)):[];
  return `<h1 style="font-size:26px">Enfeites</h1><div class="note" style="margin:4px 0 0">Busque pelo nome ou escolha um grupo.</div>
  <div class="search"><span>🔍</span><input id="qe" placeholder="Buscar em todos os enfeites..." value="${esc(qAll)}" oninput="qAll=this.value;draw(true,'qe')"></div>
  ${q?(res.length?`<div class="note" style="margin:4px 0 10px">${res.length} encontrados</div><div class="grid">${res.map(cardRec).join('')}</div>`:'<div class="empty">Nenhum enfeite com esse nome.</div>'):`<div class="grid" style="margin-top:12px">${G.map(g=>cardGrupo(g)).join('')}</div><h2 class="sec">Peças dos bônus</h2><div class="grid">${GX.map(g=>cardGrupo(g)).join('')}</div>`}`;
}
function ferramentas(){
  const t=(r,ic,tt,s)=>`<div class="tile" onclick="go('${r}')"><div class="ic">${ic}</div><div><b>${tt}</b><span>${s}</span></div></div>`;
  return `<h1 style="font-size:26px">Ferramentas</h1><div class="note" style="margin:4px 0 12px">Tudo o que ajuda a fazer, embalar e, se quiser, vender.</div><div class="tiles">${t('bolinhas','🎈','Bolinhas engomadas','Passo a passo com bexiga e cola')}${t('contador','🔢','Contador de pontos','Nunca perca a conta da carreira')}${t('precos','💰','Calculadora de preços','Quanto cobrar por peça')}${t('acabamento','🎀','Acabamento e embalagem','Para presentear e vender')}${t('assistente','💡','Tire suas dúvidas','Respostas na hora')}</div>`;
}
function bolinhas(){
  const mat=['Fio de algodão fino (o da receita) e agulha de crochê 2,5 mm','Bexiga de festa pequena (1 por bolinha, mais 1 de reserva)','Cola branca (escolar ou de artesanato)','Água e um potinho para misturar','Pincel largo ou esponja','Plástico ou jornal para forrar a mesa','Barbante, varal e prendedores para pendurar','Agulha ou alfinete para furar a bexiga'];
  const pas=[['Faça a esfera aberta','Siga a receita da bolinha sem encher. Ela fica como uma redinha fechada, com uma abertura de 12 pontos no alto.'],['Coloque a bexiga dentro','Com a bexiga vazia, passe-a pela abertura. Encha até a esfera ficar esticada, mas sem deformar os pontos, e dê um nó. Prenda um barbante no nó para pendurar depois.'],['Misture a cola','Em um potinho, misture cola branca e água na mesma medida (1 para 1) e mexa até ficar uniforme. Se ficar mole demais depois de seca, use 2 de cola para 1 de água.'],['Passe a cola','Com a mesa forrada, passe a mistura com o pincel por toda a esfera, por fora e pelos furos, até o fio ficar bem molhado, sem escorrer.'],['Pendure para secar','Pendure pelo barbante num varal, com um papel embaixo. Deixe secar por 24 horas (até 48 horas em dia úmido ou frio), longe de gente e de bicho.'],['Fure a bexiga','Com a esfera bem dura e seca, fure a bexiga com a agulha. Ela murcha e sai pela abertura. Não puxe com força.'],['Dê a segunda camada, se precisar','Se algum ponto ainda estiver mole, passe mais cola só nele e deixe secar mais 12 horas.'],['Finalize','Costure o enfeite da receita (laço, estrela, azevinho ou flor) na abertura e prenda o cordão para pendurar.']];
  const err=[['Ficou mole','Faltou cola. Passe uma segunda camada e deixe secar mais. Na próxima, use 2 partes de cola para 1 de água.'],['A bexiga grudou','Passe uma camada fina de vaselina na bexiga antes de colocar dentro da esfera.'],['Ficou torta','A bexiga estava mal centrada ou muito cheia. Encha só até esticar a esfera e centralize pela abertura.'],['A cola escorreu e marcou','Passe menos cola de uma vez e tire o excesso com o pincel quase seco. Seca transparente.'],['Demorou a secar','Dias úmidos secam mais devagar. Deixe em local ventilado, ou use um ventilador a distância.']];
  return `<h1 style="font-size:26px">Bolinhas engomadas</h1><div class="note" style="margin:4px 0 10px">Como moldar o crochê na bexiga com a cola e deixar secar. Faça primeiro uma bolinha de teste: cada marca de cola seca de um jeito.</div>
  <div class="box"><h3>O que você precisa</h3>${mat.map(m=>`<div class="fio">• ${esc(m)}</div>`).join('')}</div>
  <div class="box"><h3>Passo a passo</h3><ol class="steps">${pas.map((p,i)=>`<li><i>${i+1}</i><span><b>${esc(p[0])}.</b> ${esc(p[1])}</span></li>`).join('')}</ol></div>
  <div class="box"><h3>Se deu errado</h3>${err.map(e=>`<div style="margin-bottom:10px"><b>${esc(e[0])}</b><div style="font-size:14px;line-height:1.55">${esc(e[1])}</div></div>`).join('')}</div>
  <div class="acts no-print"><button class="btn" onclick="go('grupo',1)">Ver as 20 bolinhas</button></div>`;
}
function acabamento(){
  const t=[['Fios soltos','Esconda todas as pontas passando a agulha de tapeçaria por dentro da peça por 3 cm, e corte rente.'],['Enchimento por igual','Encha em camadas pequenas, empurrando para os cantos primeiro. A peça deve ficar firme, sem marcar o ponto.'],['Peça que precisa de forma','Flocos, estrelas, sinos e guirlandas ficam firmes com cola branca e água (1 para 1). Seque sobre papel manteiga e prenda com alfinetes em papelão.'],['Fotos que vendem','Luz de janela, fundo liso e claro, a peça sozinha e depois na árvore. Tire 4 fotos: de frente, de lado, de cima e na mão.'],['Embalagem para presentear','Papel de seda, uma caixinha ou saquinho de papel kraft, um cartão escrito à mão e um laço de fio. Para peça frágil (bolinha engomada), coloque papel amassado em volta dentro da caixa.'],['Embalagem para enviar pelo correio','Caixa pequena, papel amassado em volta, peça no meio. Cole a etiqueta com o nome e o cuidado: não amassar.'],['Kit presente','Junte 3 peças que combinam (uma bolinha, uma estrela e um sino, por exemplo) e embale juntas. Fica mais bonito e vale mais.'],['Guardar depois do Natal','Embrulhe cada peça em papel de seda e guarde em caixa com tampa, em lugar seco. Assim elas duram muitos Natais.']];
  return `<h1 style="font-size:26px">Acabamento e embalagem</h1><div class="note" style="margin:4px 0 8px">Como deixar cada enfeite pronto para pendurar, presentear e vender.</div>${t.map(x=>`<div class="box"><h3>${x[0]}</h3><div style="font-size:14px;line-height:1.55">${x[1]}</div></div>`).join('')}`;
}
function bonus(){return `<h1 style="font-size:26px">Bônus</h1><div class="grid" style="margin-top:12px">${BONUS.map(bn=>`<div class="card" onclick="go('${bn.r}'${bn.p?','+bn.p:''})"><div class="art"><img src="${IMG}bonuses-${bn.n}.webp" alt="" onerror="this.outerHTML='<div style=font-size:40px>🎁</div>'"><span class="badge">BÔNUS ${bn.n}</span></div><div class="tx"><div class="tt">${bn.t}</div><div class="st">${bn.d}</div></div></div>`).join('')}</div>`}
