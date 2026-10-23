// Monta o app: dados das 200 receitas + aulas + mensagens + ideias + assistente -> app-jardim-de-amigurumi.html
// node saidas/modelagem/2026-10-23-plantas-amigurumi/app/montar-app.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { gerar } from "./gerar-dados.mjs";
const AQUI = dirname(fileURLToPath(import.meta.url));

// 8 videoaulas completas do canal Onda Criativa (YouTube), as mesmas do app do concorrente (a usuária autorizou em 23/10/2026)
const AULAS = [
  { id: "p4Faa30KQVI", t: "Suculenta" }, { id: "pUk7bkkGRuY", t: "Mini antúrio" }, { id: "Y3MUycMieJU", t: "Vasinho com flores" }, { id: "C8zMtDbhedY", t: "Plantinhas decorativas" },
  { id: "vzdgUg3vUMc", t: "Cactos" }, { id: "lsWopbqYIaE", t: "Vasinhos" }, { id: "Vi5ntzwAEAY", t: "Vaso com rosinhas diversificadas" }, { id: "zXQkQhPBiJw", t: "Girassol" },
];

const M = (c, t) => ({ c, t });
const MENSAGENS = [
  M("Primeiro contato", "Oi, [nome]! Tudo bem? Eu faço plantinhas de crochê que não murcham e não precisam de água. Posso te mandar as fotos das que estão prontas?"),
  M("Primeiro contato", "Oi, [nome]! Fiz umas suculentas de crochê e lembrei de você. Quer ver as fotos? Cada uma é feita à mão, uma por uma."),
  M("Primeiro contato", "Bom dia, [nome]! Estou com plantinhas de crochê novas, em vasinho. Se você gosta de plantas mas esquece de regar, essas são para você."),
  M("Primeiro contato", "Oi! Vi que você gosta de decoração. Faço plantinhas de crochê para mesa e prateleira. Quer dar uma olhada no catálogo?"),
  M("Primeiro contato", "Oi, [nome]! Você já viu planta de crochê? Fica linda na mesa do escritório e não dá trabalho nenhum. Te mando as fotos?"),
  M("Catálogo", "Separei as plantinhas que tenho prontas: suculentas, cactos, flores e vasinhos. Qual delas combina mais com a sua casa?"),
  M("Catálogo", "Tenho três tamanhos: pequeno (para mesa), médio (para prateleira) e grande (para o centro da mesa). Qual você procura?"),
  M("Catálogo", "Posso fazer na cor que você quiser. Me diz a cor do ambiente e eu escolho os fios que combinam."),
  M("Catálogo", "Essa plantinha eu faço com carinha ou sem carinha. Qual você prefere?"),
  M("Catálogo", "Também faço combinados: duas ou três plantinhas juntas, em um vaso maior. Fica um mini jardim. Quer ver?"),
  M("Preço", "A [plantinha] sai por R$ [valor]. Já vai embalada, com etiqueta e cartão de agradecimento."),
  M("Preço", "Para duas ou mais plantinhas eu faço um valor melhor. Me diz quantas você quer e eu calculo."),
  M("Preço", "O valor é de R$ [valor]. Pago no Pix ou no cartão, e eu começo a sua peça assim que o pagamento cair."),
  M("Prazo", "Ela fica pronta em [prazo]. Assim que terminar, eu te mando uma foto antes de embalar."),
  M("Prazo", "Faço sob encomenda, então o prazo é de [prazo]. Se for para presente, me conta a data que eu organizo."),
  M("Objeção", "Entendo que parece um valor alto. É que cada plantinha é feita à mão, ponto por ponto, e leva [tempo] de trabalho. E dura anos, porque não murcha."),
  M("Objeção", "Se você ficar na dúvida da cor, me manda uma foto do lugar onde vai ficar e eu sugiro as cores que combinam."),
  M("Objeção", "Posso mandar uma foto da peça pronta antes de você pagar o restante, assim você vê como ficou."),
  M("Presente", "Que tal presentear com uma plantinha de crochê? Eu faço o kit presente: a plantinha, o cartão e a caixinha. Para quem é?"),
  M("Presente", "Para o Dia das Mães, Dia das Professoras ou aniversário, a plantinha é um presente que dura. Me conta a ocasião e eu monto o kit."),
  M("Presente", "Faço lembrancinha em quantidade para festa e casamento. Me diz quantas peças e a data, e eu faço o orçamento."),
  M("Fechamento", "Então ficou assim: [plantinha] na cor [cor], por R$ [valor]. Posso reservar o seu pedido?"),
  M("Fechamento", "Posso reservar a sua? Faço poucas por semana, então prefiro já organizar a agenda."),
  M("Fechamento", "Fechado! Segue o Pix: [chave]. Assim que cair eu já começo e te aviso quando estiver pronta."),
  M("Pós-venda", "Oi, [nome]! A sua plantinha foi entregue? Fiquei curiosa para saber se você gostou."),
  M("Pós-venda", "Se puder, me manda uma foto da plantinha na sua casa. Eu adoro ver onde elas vão morar!"),
  M("Pós-venda", "Obrigada pela compra, [nome]! Se alguma amiga sua gostar de plantinhas de crochê, pode me indicar. Fico muito feliz."),
  M("Redes sociais", "Nova plantinha saindo do forno 🌵 Feita à mão, não murcha e não precisa de água. Chama no direct para encomendar!"),
  M("Redes sociais", "Quem aí esquece de regar planta? 🙋 As minhas plantinhas de crochê não murcham nunca. Quer uma? Me chama."),
  M("Redes sociais", "Bastidores: fazendo uma suculenta de crochê, rodada por rodada. Quer uma igual na sua casa? Comenta aqui."),
];
const I = (n, o, m, e) => ({ n, o, m, e });
const IDEIAS = [
  I("Kit Mesa de Trabalho", "Presente para colega de trabalho", "1 suculenta pequena + 1 cacto bola mini", "Caixinha com papel de seda e cartão"),
  I("Kit Dia das Mães", "Dia das Mães", "1 flor (tulipa ou margarida) + 1 vasinho com carinha", "Caixa pequena com laço e cartão escrito à mão"),
  I("Kit Professora", "Fim de ano, Dia dos Professores", "1 vasinho com carinha + 1 suculenta", "Saquinho kraft com etiqueta 'Obrigada por ensinar'"),
  I("Kit Casa Nova", "Chá de casa nova", "1 jiboia pendente + 1 suculenta", "Caixa de papelão com palha e cartão de boas-vindas"),
  I("Kit Boas-Vindas Bebê", "Maternidade", "1 vasinho gatinho ou ursinho + 1 vasinho coelhinho", "Caixa clara com tarja de papel e nome do bebê"),
  I("Kit Namorados", "Dia dos Namorados", "1 vasinho coração + 1 tulipa vermelha", "Caixa vermelha ou kraft com laço"),
  I("Kit Trio de Suculentas", "Qualquer data", "3 suculentas pequenas em cores diferentes", "Bandeja de papelão e fita"),
  I("Kit Jardim Zen", "Presente para quem gosta de calma", "Pedra viva + suculenta cinza + vaso cinza", "Caixa lisa e cartão com frase curta"),
  I("Kit Escritório", "Amigo secreto", "1 cacto mini + 1 planta-dinheiro", "Caixinha pequena com papel de seda"),
  I("Kit Primavera", "Início da primavera, Páscoa", "2 tulipas (rosa e amarela) + 1 margarida", "Cestinha com palha e cartão"),
  I("Kit Natal Verde", "Natal", "1 cacto de Natal + 1 vasinho natalino", "Caixa vermelha com fita verde"),
  I("Kit Cacto Fofo", "Aniversário infantil", "1 cacto gordinho com carinha + 1 vasinho orelhudo", "Saquinho transparente com laço"),
  I("Kit Lavanda e Calma", "Presente para quem precisa relaxar", "1 vaso de lavanda + cartão com dica de respiração", "Caixa roxa ou branca com fita"),
  I("Kit Mini Jardineira", "Presente de valor maior", "1 jardineira com 3 plantinhas", "Caixa grande com palha e cartão"),
  I("Kit Girassol", "Alegrar o dia de alguém", "1 girassol grande + 1 girassol mini", "Embrulho em papel kraft e fita amarela"),
  I("Kit Cesta de Suculentas", "Formatura, aniversário de 15 anos", "1 cesta com 3 suculentas", "Cesta embrulhada em papel celofane"),
  I("Kit Floresta de Cactos", "Presente para quem ama cactos", "1 floresta de cactos + 1 cacto bola", "Caixa de madeira ou papelão com palha"),
  I("Kit Pendentes", "Decoração de varanda", "2 plantas pendentes (jiboia e hera)", "Cabides já montados dentro de uma caixa"),
  I("Kit Lembrancinha de Festa", "Festas e casamentos", "10 vasinhos mini (chaveiro) ou suculentas pequenas", "Saquinhos individuais com etiqueta do evento"),
  I("Kit Pequeno Jardim de Mesa", "Aniversário de empresa, brinde", "1 mini jardim com 3 plantinhas", "Caixa grande com a marca da empresa"),
];
const S = (p, r) => ({ p, r });
const SABER = [
  S("O anel mágico abre quando eu puxo o fio. O que fazer?", "Depois de fazer os 6 pontos baixos, puxe o fio solto até o anel fechar por completo. Em seguida, faça um nó com as duas pontas, ou passe o fio por dentro de 2 a 3 pontos antes de cortar. Não corte rente: deixe 5 cm."),
  S("Como sei onde termina cada volta?", "Use um marcador de ponto no primeiro ponto da volta. Ao chegar nele, mova o marcador para o primeiro ponto da volta nova. Contar os pontos no fim de cada volta também ajuda: o total está escrito ao lado da volta, entre parênteses."),
  S("Como ler (2 pb, aum) x6?", "Quer dizer: faça 2 pontos baixos, depois 1 aumento (2 pontos baixos no mesmo ponto), e repita isso 6 vezes na volta. No fim da volta, o total de pontos bate com o número entre parênteses."),
  S("A minha volta ficou com pontos a mais ou a menos.", "Conte a volta antes de seguir. Se faltou ou sobrou, desmanche essa volta e refaça com calma. Uma volta errada vira uma peça torta. Use o marcador e conte de 6 em 6."),
  S("A peça ficou torta ou espiralada.", "Em amigurumi em espiral isso é normal: a volta sobe levemente. Para endireitar, aperte um pouco o fio e esconda o início da volta no lado de trás da peça."),
  S("Dá para ver o enchimento entre os pontos.", "O fio está largo para a agulha. Use agulha um número menor (2,0 mm), ou segure o fio mais firme. Cor de enchimento clara em peça escura também aparece, então use enchimento da cor do fio, quando puder."),
  S("Quanto de enchimento devo colocar?", "Encha em camadas pequenas, empurrando primeiro para as pontas. A peça deve ficar firme ao toque, sem marcar o ponto. Se amassar muito fácil, falta enchimento; se os pontos abrirem, é demais."),
  S("Como trocar de cor sem ficar feio?", "Termine o último ponto da cor antiga puxando a nova cor no último laço. Passe a ponta antiga por dentro da peça. Faça a troca sempre no primeiro ponto da volta."),
  S("Como escondo as pontas de fio?", "Passe a ponta com a agulha de tapeçaria por dentro da peça, por uns 3 cm, e saia por outro lado. Corte rente. Se for peça para vender, dê um pequeno nó antes."),
  S("Qual a diferença entre pb, pma e pa?", "Ponto baixo (pb) é o mais curto. Ponto meio alto (pma) é um pouco mais alto, e ponto alto (pa) é o mais alto. Cada um faz as folhas e pétalas ficarem mais cheias ou mais finas."),
  S("O que é BLO?", "É trabalhar só no laço de trás do ponto. Fica uma linha marcada, que levanta a parede do vaso e dá uma quina bonita."),
  S("Posso usar outro fio, além do algodão?", "Pode, mas o tamanho final muda. Fio mais grosso faz a peça maior e exige agulha maior. Algodão 8/6 com agulha de 2,5 mm é o que as receitas usam como medida."),
  S("Fio fofinho ou de algodão: qual é melhor para vender?", "Algodão é firme, aparece bem o ponto e não solta pelinhos, por isso é o mais usado em plantinhas. Fio fofinho serve para flores e bichinhos macios."),
  S("Como coloco o arame sem machucar?", "Dobre 1 cm da ponta do arame para não furar o crochê, e cubra com fio ou fita. Em peça para criança pequena, evite arame."),
  S("Como costuro as folhas no vaso sem aparecer o ponto?", "Costure por dentro, pegando só o laço da folha. Faça pontos pequenos e deixe o fio da mesma cor. Termine com nó e esconda a ponta."),
  S("Como deixo a peça em pé?", "Coloque enchimento mais firme na base e costure a terra bem esticada, sem folga. Se for peça alta, uma varetinha de churrasco cortada por dentro ajuda."),
  S("Como lavo a plantinha?", "Limpe com um pano úmido e deixe secar. Evite máquina de lavar. Se tiver arame dentro, não molhe muito para não enferrujar."),
  S("Como aumentar o tamanho da peça?", "Acrescente voltas de aumento no disco, de 6 em 6 pontos, e as mesmas voltas retas a mais na altura. Faça a conta: cada volta de aumento soma 6 pontos."),
  S("Como diminuir o tamanho da peça?", "Termine os aumentos uma volta antes e faça menos voltas retas. Cada volta a menos tira cerca de meio centímetro."),
  S("A folha ficou enrolada. O que fazer?", "Passe um ferro morno por cima de um pano úmido, sem apertar, e deixe esfriar. Em algodão isso desfaz a ondulação."),
  S("Como fazer as pétalas mais cheias?", "Troque o ponto baixo por ponto meio alto no meio da pétala, mantendo o total de pontos. A receita já indica a quantidade de cada ponto."),
  S("O que é amostra e por que fazer?", "É uma peça pequena, só para testar o fio e a agulha. Faça um disco de 3 voltas e confira se mede perto de 3 cm. Se estiver bem maior ou menor, troque a agulha."),
  S("Meu ponto baixo está apertado.", "Relaxe a mão e puxe o fio com menos força. Se ainda apertar, use uma agulha meio número maior. Ponto apertado dificulta fechar a volta."),
  S("Como faço o ponto baixíssimo para fechar?", "Insira a agulha no primeiro ponto da volta, puxe um laço e passe pelo laço que já estava na agulha. Corte o fio deixando uma ponta longa."),
  S("Quanto cobrar por uma plantinha?", "Use a Tabela de preços (bônus 2): ela soma o seu fio, os extras e a sua hora, e acrescenta a margem. Ajuste os 4 campos com os seus valores."),
  S("Como tirar boas fotos para vender?", "Luz de janela, fundo liso e claro, a peça sozinha. Tire de frente, de lado, de cima e na mão, para mostrar o tamanho."),
  S("Como embalo para enviar pelo correio?", "Envolva em papel de seda, ponha em uma caixa com enchimento de papel em volta, para não amassar. Cole a etiqueta com o nome e o cuidado."),
  S("Quanto tempo leva para fazer uma plantinha?", "Depende da receita: as pequenas levam cerca de 35 a 60 minutos e as maiores, de 2 a 3 horas. O tempo de cada uma está no alto da receita."),
  S("Preciso de agulha de crochê de qual medida?", "As receitas usam agulha de 2,5 mm com algodão 8/6. Se o seu fio for mais fino ou mais grosso, faça a amostra e ajuste a agulha."),
  S("Posso vender as plantinhas que eu fizer?", "Pode. As peças que você faz são suas e você vende onde quiser. Use as receitas, o kit de papelaria e as mensagens prontas dos bônus para organizar as vendas."),
];

const d = gerar();
let t = readFileSync(join(AQUI, "app-template.html"), "utf8");
const rep = (k, v) => { if (!t.includes(k)) throw new Error("não achei " + k); t = t.replace(k, () => JSON.stringify(v)); };
rep("/*DADOS*/null", d); rep("/*AULAS*/[]", AULAS); rep("/*MENSAGENS*/[]", MENSAGENS); rep("/*IDEIAS*/[]", IDEIAS); rep("/*SABER*/[]", SABER);
if (MENSAGENS.length !== 30) throw new Error("mensagens: " + MENSAGENS.length);
if (IDEIAS.length !== 20) throw new Error("ideias: " + IDEIAS.length);
const out = join(AQUI, "..", "app-jardim-de-amigurumi.html");
writeFileSync(out, t);
console.log("app:", (t.length / 1024).toFixed(0), "KB · receitas", d.receitas.length, "· aulas", AULAS.length, "· mensagens", MENSAGENS.length, "· ideias", IDEIAS.length, "· assistente", SABER.length);
