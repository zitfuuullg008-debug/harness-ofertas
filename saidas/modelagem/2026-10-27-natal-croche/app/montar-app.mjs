// Monta o app: 165 receitas + 30 mensagens + assistente -> ../app-enfeites-de-croche-natalinos.html
// node saidas/modelagem/2026-10-27-natal-croche/app/montar-app.mjs   (antes: node fazer-template.cjs)
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { gerar } from "./gerar-dados.mjs";
const AQUI = dirname(fileURLToPath(import.meta.url));

const M = (c, t) => ({ c, t });
const MENSAGENS = [
  M("Primeiro contato", "Oi, [nome]! Tudo bem? Estou fazendo enfeites de Natal em crochê, feitos à mão. Posso te mandar as fotos dos que já estão prontos?"),
  M("Primeiro contato", "Oi, [nome]! Fiz bolinhas de crochê para a árvore e lembrei de você. Quer ver as fotos? Cada uma é feita à mão, uma por uma."),
  M("Primeiro contato", "Bom dia, [nome]! Estou com enfeites de Natal novos: guirlandas, estrelas e mini amigurumis. Se você quer uma decoração diferente este ano, olha só."),
  M("Primeiro contato", "Oi! Vi que você gosta de decorar a casa. Faço enfeites de Natal em crochê para árvore, porta e mesa. Quer dar uma olhada no catálogo?"),
  M("Primeiro contato", "Oi, [nome]! Você já viu enfeite de Natal de crochê? Dura anos, não quebra e fica lindo na árvore. Te mando as fotos?"),
  M("Catálogo", "Separei o que tenho pronto: bolinhas, enfeites de árvore, amigurumis natalinos, peças de mesa, guirlandas, flocos e estrelas. Qual combina mais com a sua casa?"),
  M("Catálogo", "Faço em três tamanhos: pequeno (para a árvore), médio (para a mesa) e grande (para a porta). Qual você procura?"),
  M("Catálogo", "Posso fazer na cor que você quiser. Me diz as cores da sua decoração e eu escolho os fios que combinam."),
  M("Catálogo", "Também faço o conjunto da mesa posta: porta-guardanapo, sousplat e centro de mesa na mesma cor. Quer ver?"),
  M("Catálogo", "Tem a meia de lareira com o nome de cada pessoa da casa, e uma pequena para o pet. Quantas você precisa?"),
  M("Preço", "A [peça] sai por R$ [valor]. Já vai embalada, com cartão e laço."),
  M("Preço", "Para duas ou mais peças eu faço um valor melhor. Me diz quantas você quer e eu calculo."),
  M("Preço", "O valor é de R$ [valor]. Pago no Pix ou no cartão, e eu começo a sua peça assim que o pagamento cair."),
  M("Prazo", "Ela fica pronta em [prazo]. Assim que terminar, eu te mando uma foto antes de embalar."),
  M("Prazo", "Faço sob encomenda, então o prazo é de [prazo]. Para o Natal, me conta a data que você precisa e eu organizo a agenda."),
  M("Objeção", "Entendo que parece um valor alto. É que cada peça é feita à mão, ponto por ponto, e leva [tempo] de trabalho. E dura muitos Natais."),
  M("Objeção", "Se você ficar na dúvida da cor, me manda uma foto da árvore ou do cantinho onde vai ficar e eu sugiro as cores que combinam."),
  M("Objeção", "Posso mandar uma foto da peça pronta antes de você pagar o restante, assim você vê como ficou."),
  M("Presente", "Que tal presentear com um enfeite de crochê? Eu faço o kit presente: o enfeite, o cartão e a caixinha. Para quem é?"),
  M("Presente", "Para amigo secreto, sogra ou professora, o enfeite de crochê é um presente que fica para sempre. Me conta quem é e eu sugiro o modelo."),
  M("Presente", "Faço lembrancinha em quantidade para a ceia da empresa ou da família. Me diz quantas peças e a data, e eu faço o orçamento."),
  M("Fechamento", "Então ficou assim: [peça] na cor [cor], por R$ [valor]. Posso reservar o seu pedido?"),
  M("Fechamento", "Posso reservar a sua? Faço poucas por semana, então prefiro já organizar a agenda do Natal."),
  M("Fechamento", "Fechado! Segue o Pix: [chave]. Assim que cair eu já começo e te aviso quando estiver pronta."),
  M("Pós-venda", "Oi, [nome]! O seu enfeite foi entregue? Fiquei curiosa para saber se você gostou."),
  M("Pós-venda", "Se puder, me manda uma foto do enfeite na sua árvore. Eu adoro ver onde eles vão morar!"),
  M("Pós-venda", "Obrigada pela compra, [nome]! Se alguma amiga sua gostar de enfeites de crochê, pode me indicar. Fico muito feliz."),
  M("Redes sociais", "Mais um enfeite saindo da agulha 🎄 Feito à mão, ponto por ponto. Quer um igual na sua árvore? Chama no direct para encomendar!"),
  M("Redes sociais", "Quem aí quer uma árvore diferente neste Natal? 🙋 Meus enfeites de crochê não quebram e duram anos. Quer um? Me chama."),
  M("Redes sociais", "Bastidores: fazendo uma bolinha de crochê com cola e bexiga, passo a passo. Quer uma igual? Comenta aqui."),
];
const S = (p, r) => ({ p, r });
const SABER = [
  S("O anel mágico abre quando eu puxo o fio. O que fazer?", "Depois de fazer os 6 pontos baixos, puxe o fio solto até o anel fechar por completo. Em seguida, faça um nó com as duas pontas, ou passe-as por dentro da peça com a agulha de tapeçaria."),
  S("Como sei onde termina cada volta?", "Use um marcador de ponto no primeiro ponto da volta. Ao chegar nele, mova o marcador para o primeiro ponto da volta nova. Contar os pontos no fim de cada volta evita erro."),
  S("Como ler (2 pb, aum) x6?", "Quer dizer: faça 2 pontos baixos, depois 1 aumento (2 pontos baixos no mesmo ponto), e repita isso 6 vezes na volta. No fim da volta, o total de pontos bate com o número entre parênteses."),
  S("A minha volta ficou com pontos a mais ou a menos.", "Conte a volta antes de seguir. Se faltou ou sobrou, desmanche essa volta e refaça com calma. Uma volta errada vira uma peça torta."),
  S("Quanto de cola e de água uso nas bolinhas engomadas?", "Comece com cola branca e água na mesma medida (1 para 1). Se a bolinha secar mole, use 2 partes de cola para 1 de água. Faça uma bolinha de teste antes, porque a cola muda de uma marca para outra."),
  S("Quanto tempo a bolinha engomada leva para secar?", "Cerca de 24 horas em dia seco. Em dia úmido ou frio, até 48 horas. Pendure em lugar ventilado e só fure a bexiga quando a bolinha estiver bem dura."),
  S("A bexiga grudou no crochê. E agora?", "Fure a bexiga e puxe devagar, em pedaços. Na próxima, passe uma camada fina de vaselina na bexiga antes de colocar dentro da esfera."),
  S("A bolinha ficou mole depois de seca.", "Faltou cola. Passe uma segunda camada só nos pontos moles e deixe secar mais 12 horas. Na próxima, use 2 partes de cola para 1 de água."),
  S("Posso usar linha em vez de fio de algodão?", "Pode, mas o tamanho final muda. Fio mais fino faz a peça menor e fica mais delicado. Faça uma amostra e ajuste a agulha. As receitas usam algodão 8/6 com agulha de 2,5 mm."),
  S("Como deixo a estrela e o floco firmes?", "Passe cola branca com água (1 para 1) com o pincel, estique a peça sobre papel manteiga e prenda com alfinetes em papelão. Deixe secar por 12 horas."),
  S("Como pendurar o enfeite na árvore?", "Prenda um cordão de crochê no alto da peça (a receita já traz o cordão), dê um nó e passe pelo galho. Para peça pesada, use um gancho de metal junto."),
  S("Posso lavar os enfeites?", "As peças feitas só com crochê (amigurumis, meias) podem ser lavadas à mão com sabão neutro. As peças engomadas com cola não devem molhar: limpe só com um pano seco."),
  S("Como escolho as cores do Natal?", "A combinação clássica é vermelho, verde e branco, com um detalhe dourado. Para uma árvore mais delicada, use branco, prata e azul-gelo. Cada receita mostra os fios de cada cor."),
  S("Como aumentar o tamanho da peça?", "Acrescente voltas de aumento no disco, de 6 em 6 pontos, e as mesmas voltas retas a mais na altura. Faça a conta: cada volta de aumento soma 6 pontos."),
  S("Como diminuir o tamanho da peça?", "Termine os aumentos uma volta antes e faça menos voltas retas. Cada volta a menos tira cerca de meio centímetro."),
  S("Como escondo as pontas de fio?", "Passe a ponta com a agulha de tapeçaria por dentro da peça, por uns 3 cm, e saia por outro lado. Corte rente. Para peça de venda, dê um pequeno nó antes."),
  S("Quanto de enchimento devo colocar?", "Encha em camadas pequenas, empurrando primeiro para as pontas. A peça deve ficar firme ao toque, sem marcar o ponto. Se amassar muito fácil, falta enchimento."),
  S("Posso colocar olhos de segurança em peça para criança?", "Para criança pequena, prefira bordar os olhos com fio preto: olho de plástico pode soltar. Para enfeite de árvore fora do alcance, o olho de segurança fica bonito e firme."),
  S("Como faço a meia ficar com forma?", "Encha a ponta do pé com um pouco de papel de seda enquanto estiver pendurada, ou passe uma camada fina de cola com água por dentro e deixe secar com um pote pequeno dentro."),
  S("Como costuro as peças sem aparecer o ponto?", "Costure por dentro, pegando só o laço da peça. Faça pontos pequenos e use o fio da mesma cor. Termine com nó e esconda a ponta."),
  S("Como faço o ponto baixíssimo para fechar?", "Insira a agulha no primeiro ponto da volta, puxe um laço e passe pelo laço que já estava na agulha. Corte o fio deixando uma ponta longa."),
  S("O que é BLO?", "É trabalhar só no laço de trás do ponto. Fica uma linha marcada, que levanta a parede da cesta ou do vaso e dá uma quina bonita."),
  S("Quanto cobrar por um enfeite?", "Use a Calculadora de preços: ela soma o seu fio, os extras e a sua hora, e acrescenta a margem. Ajuste os 4 campos com os seus valores."),
  S("Como tirar boas fotos para vender?", "Luz de janela, fundo liso e claro, a peça sozinha. Tire de frente, de lado, de cima e na mão, para mostrar o tamanho. Uma foto pendurada na árvore também ajuda."),
  S("Como embalo para enviar pelo correio?", "Envolva em papel de seda, ponha em uma caixa com papel amassado em volta, para não amassar. Cole a etiqueta com o nome e o cuidado."),
  S("Quanto tempo leva para fazer um enfeite?", "Depende da receita: as pequenas levam cerca de 30 a 60 minutos e as maiores, de 2 a 3 horas. O tempo de cada uma está no alto da receita (as engomadas precisam de mais 24 horas de secagem)."),
  S("Posso vender os enfeites que eu fizer?", "Pode. As peças que você faz são suas e você vende onde quiser. Use a Tabela de preços e as mensagens prontas dos bônus para organizar."),
  S("Como guardo os enfeites depois do Natal?", "Embrulhe cada peça em papel de seda e guarde em caixa com tampa, em lugar seco e longe de sol. As bolinhas engomadas vão em caixa com papel amassado em volta."),
  S("Preciso de agulha de crochê de qual medida?", "As receitas usam agulha de 2,5 mm com algodão 8/6. Se o seu fio for mais fino ou mais grosso, faça a amostra e ajuste a agulha."),
];

const d = gerar();
let t = readFileSync(join(AQUI, "app-template.html"), "utf8");
const rep = (k, v) => { if (!t.includes(k)) throw new Error("não achei " + k); t = t.replace(k, () => JSON.stringify(v)); };
rep("/*DADOS*/null", d); rep("/*MENSAGENS*/[]", MENSAGENS); rep("/*SABER*/[]", SABER);
if (MENSAGENS.length !== 30) throw new Error("mensagens: " + MENSAGENS.length);
const out = join(AQUI, "..", "app-enfeites-de-croche-natalinos.html");
writeFileSync(out, t);
console.log("app:", (t.length / 1024).toFixed(0), "KB · receitas", d.receitas.length, "· mensagens", MENSAGENS.length, "· assistente", SABER.length);
