# templates/ — as páginas que já vendem

Aqui ficam os HTMLs das páginas de vendas **validadas na operação** — as que deram lucro de
verdade, conferido no Termômetro (Utmify). Elas não são exemplo nem inspiração: são o molde.

## A regra

Quando o pipeline MVT chega na fase da página, ele **não gera HTML do zero e não usa o
template genérico da skill**. Ele pega o arquivo daqui que melhor casa com a oferta nova e
troca só o conteúdo: headline, mecanismo, bônus, preço, imagens, checkout.

Estrutura, ordem dos blocos, CSS, espaçamento, animações e microcopy de interface **ficam
idênticos**. O que já converte não se reinventa.

## Como colocar um template aqui

Salve o `.html` nesta pasta. Nome livre — o painel identifica a oferta lendo o arquivo e
cruza com o Termômetro. Se quiser facilitar, use o número da oferta:
`06-pao-de-queijo-lucrativo.html`.

Página single-file é o ideal. Se a sua depende de CSS/JS externo, traga a pasta inteira.

## O que é trocado, sempre

Nunca carregue para uma oferta nova, sem trocar:

| O que | Por quê |
|---|---|
| Link de checkout | senão a venda do produto novo cai no produto velho |
| Pixel / IDs de rastreio / UTMs fixas | mistura os dados de duas ofertas no Utmify |
| Nome do produto, promessa, preço, bônus | é a oferta nova |
| Imagens e `alt` | a prova visual é do produto novo |
| Depoimentos | depoimento de outro produto é invenção |

## Esta pasta não vai pro GitHub

O `.gitignore` bloqueia `templates/*` — o repositório é público e estas páginas são ativo
comercial. Só este README sobe.
