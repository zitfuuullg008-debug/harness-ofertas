# STATUS — Caixinha de Canela

**Slug:** `2026-09-22-luciana-prado` · **Última atualização:** 2026-09-22
**Modo da rodada:** `/modelar --auto Luciana Prado` (headless, sem gates)
**Oferta-lastro:** Luciana Prado, "rolinhos gourmet" → `https://inlead.digital/rolinhos-gourmet`

Para retomar: `claude "/modelar continua Caixinha de Canela"` ou abra `DECISOES.md` e diga
qual linha você quer mudar.

## Onde parou

| Fase | Skill | Situação | Arquivo |
|---|---|---|---|
| 1. Pesquisa + Raio-X | `raio-x-mvt` | ✅ Concluída | `01-pesquisa-raio-x.md` |
| 2. Modelagem + OA100K | `modelador-mvt` | ✅ Concluída | `02-modelagem-oa100k.md` |
| 3. Copy | `agente-executor-copy-mvt` | ✅ Concluída | `03-copy.md` |
| 4. Página HTML | `pagina-vendas-mvt` | ✅ Concluída, com 14 placeholders de imagem | `04-pagina.html` |
| 5. Imagens na Atomicat | `imagens-oferta-atomicat` | ⏸️ **Pendente** — exige arrastar arquivo na janela | — |
| 6. Auditoria | `auditoria-copy-mvt` | ⚠️ Rodada **parcial**: copy, estrutura e carga. Visual não auditado | `06-auditoria.md` |
| 7. App entregável | `app-entregavel-2-0` | ⏸️ **Pendente** — só depois de fechadas as correções | — |

**Nota da auditoria: 7,25/10** nos 4 mandamentos auditáveis. Execução visual não pontuada.
**3 bloqueadores em aberto** — a página não pode receber tráfego. Ver `06-auditoria.md`.

## Decisões travadas (imutáveis daqui pra frente)

| Campo | Valor |
|---|---|
| Nicho | Renda extra com comida caseira |
| Subnicho | Cinnamon roll |
| Nome do produto | **Caixinha de Canela** |
| Mecanismo | **Fornada Sortida** |
| Promessa | Uma massa só, 24 rolinhos, 6 caixinhas pra vender, sem CNPJ, sem equipamento e sem curso caro |
| Persona | Mulher 35 a 50, com filhos, que já faz doce por encomenda e cobra abaixo do que vale |
| Formato | Ebook PDF pro celular + folha de preço pra imprimir |
| Preço | **R$ 19,90** |
| CTA | Quero minha Caixinha de Canela |
| Garantia | 7 dias, incondicional |
| Bônus | 30 Mensagens Prontas · Chega Inteira · Rótulo pra Imprimir · Forno de Fogão Comum |

Nome, promessa e preço têm que sair idênticos daqui até o app entregável.

## Bloqueadores (resolver antes de qualquer tráfego)

1. **`{{CHECKOUT}}`** no único botão de compra. Nenhum caminho da página termina numa venda.
2. **14 placeholders de imagem.** Publicada assim, renderiza 14 caixas quebradas.
3. **Bloco de autoridade vazio.** É a mesma fraqueza que derrubou a concorrente no Raio-X.

## Decisões que só você pode tomar

| # | Pendência | Onde aparece no HTML |
|---|---|---|
| 1 | Quem assina o produto (nome, foto, 3 parágrafos de bio, frase de fecho) | `{{NOME_AUTORIDADE}}`, `{{BIO_1..3}}`, `{{FRASE_DE_FECHO}}`, `{{IMG:autor:1}}` |
| 2 | URL do checkout | `{{CHECKOUT}}` |
| 3 | Meio de entrega (e-mail, WhatsApp, área de membros) | `{{MEIO_DE_ENTREGA}}` |
| 4 | Acesso é vitalício? | `{{CONDICAO_DE_ACESSO}}` |
| 5 | Canal de suporte | `{{CANAL_DE_SUPORTE}}` |
| 6 | Razão social / nome no copyright | `{{EMPRESA}}` |

## Briefing da Fase 5 — as 14 imagens

Lista extraída do `04-pagina.html`. É o que a `imagens-oferta-atomicat` vai pedir.

| # | Placeholder | Bloco | O que precisa mostrar | Proporção |
|---|---|---|---|---|
| 1 | `{{IMG:hero:1}}` | Primeira dobra | A caixinha de 4 montada, 4 sabores visíveis. **Teto de 150KB** | 1:1 |
| 2 | `{{IMG:demo:1}}` | Carrossel | Página interna do PDF: a massa base | livre, altura igual |
| 3 | `{{IMG:demo:2}}` | Carrossel | Página interna: um dos sabores | idem |
| 4 | `{{IMG:demo:3}}` | Carrossel | **A folha de preço da fornada** (a peça mais importante do produto) | idem |
| 5 | `{{IMG:demo:4}}` | Carrossel | Página da montagem da caixinha | idem |
| 6 | `{{IMG:demo:5}}` | Carrossel | Página do roteiro da primeira venda | idem |
| 7 | `{{IMG:demo:6}}` | Carrossel | Sumário ou índice, pra dar volume | idem |
| 8 | `{{IMG:mockup-principal:1}}` | Produto | PDF aberto no celular + a folha impressa ao lado | 1:1 |
| 9 | `{{IMG:bonus:1}}` | Bônus 1 | Capa: As 30 Mensagens Prontas | contida, ~250px de altura |
| 10 | `{{IMG:bonus:2}}` | Bônus 2 | Capa: Chega Inteira | idem |
| 11 | `{{IMG:bonus:3}}` | Bônus 3 | Capa: Rótulo pra Imprimir | idem |
| 12 | `{{IMG:bonus:4}}` | Bônus 4 | Capa: Forno de Fogão Comum | idem |
| 13 | `{{IMG:plano-completo:1}}` | Oferta | Composição com tudo junto: PDF, folha, rótulo, 4 capas | 1:1 |
| 14 | `{{IMG:autor:1}}` | Autoridade | Foto de quem assina | vertical, `object-fit:contain` |

Faltam também os 6 `alt` do carrossel: `{{ALT:demo:1}}` a `{{ALT:demo:6}}`.

Os 5 ícones do bloco "Ideal para você" estão com emoji dentro do círculo branco, não com
placeholder. Funcionam, mas valem ser trocados por ícone de traço quando houver arte.

## O que fazer na ordem, quando você voltar

1. Preencher as 6 pendências de negócio da tabela acima
2. Verificar o rendimento real da receita: a headline promete **24 rolinhos** e esse é o único
   número da página sem lastro
3. Rodar a **Fase 5** com as 14 imagens
4. Rodar a **Fase 6 de novo, do zero**, com a página renderizada em 430px. A nota de hoje vale
   só para copy e estrutura
5. Fechar as correções da auditoria
6. Só então a **Fase 7**, o app entregável, que reaproveita as capas já publicadas

## Correção pendente fora desta pasta

O card da Luciana Prado em `saidas/mineracao/2026-09-22.json` descreve o produto como
**"receita de salgado único"**. É doce. Vale corrigir o `produto` e o `porqueEscala` antes
que a leitura errada volte na próxima rodada.
