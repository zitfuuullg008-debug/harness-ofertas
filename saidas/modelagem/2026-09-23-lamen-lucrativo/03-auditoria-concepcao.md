# 03 — Auditoria da concepção

Conferência de `02-concepcao.md` contra a Metodologia MVT, antes de construir a página.
Procurando erro no meu próprio trabalho.

## Resultado

| Item | Veredito | Por quê |
|---|---|---|
| **Nome** — Lámen Lucrativo | ✅ | Só com o nome ela sabe o que compra (lámen) e o que ganha (lucro). Não é embalagem, ingrediente, metáfora nem mecanismo. Em português, na grafia que ela pronuncia |
| **Recorte** — kit de lámen congelado pra vender | ✅ | 0 concorrentes no recorte exato; 1 anunciante de comida japonesa em toda a coleta paga do dia, e a promessa dele é consumo |
| **Mecanismo** — Panelão da Semana | ✅ depois da correção 3 | Tem nome, cabe numa frase, e resolve os dois gargalos reais: 10 horas de caldo (vira 1h30 na pressão) e lámen que não viaja (vira kit em partes) |
| **Tangibilidade** | ✅ | Todo item do produto e todo bônus tem número ou forma: 12 kits, 6 temperos, 5 coberturas, 4 saquinhos, 3 tamanhos, 150 kits, 10 sabores, 6 guiozas, 30 fotos, 15 mensagens, etiqueta. Zero palavra abstrata |
| **Bônus** — duas linhas cada | ✅ | Os 6 têm "o que é, com número" e "o que ela faz", no verbo da ação |
| **Preço** | ✅ | Um plano de R$ 27,90 com 6 bônus. Os bônus de venda (1, 4, 5) não podem sair de um básico sem ele virar a receita de consumo que o lastro já vende a R$ 9,90 |
| **Vitalício e 30 dias** | ✅ | Os dois presentes |
| **Coerência** | ✅ depois da correção 1 | Promessa (vender kit o mês), mecanismo (panelada congelada), bônus (vender mais e mais caro) e preço contam a mesma história |
| **Critérios MVT** | ✅ | Digital, simples, consumo rápido, sem equipamento além da panela de pressão, mercado ciente |
| **Lote** ("faz numa tarde, vende a semana") | ✅ com ressalva | Caldo 2–3 meses e macarrão até 6 meses congelados, com fonte. O ovo não congela e saiu do kit pra virar adicional opcional |

## O que reprovou e o que virou

### 1. Bônus 2 repetia um sabor do produto — REPROVADO, corrigido

**Estava:** "kimchi, alho tostado, manteiga com milho e **limão com pimenta**". O produto já
tem **frango com limão**. A compradora lê "limão" duas vezes e conta 9, não 10: variação que
ninguém percebe como diferente é o oposto de tangível.

**Virou:** **tomate** no lugar. Existe no Japão, é novidade aqui, e é diferente de tudo que já
está na lista. 10 sabores de verdade.

### 2. O teste do nome do mecanismo era ilegível — REPROVADO, corrigido

**Estava:** "diminutivo invertido que ela usa". Frase que precisa de segunda leitura, no
arquivo que justifica justamente a clareza do nome.

**Virou:** "É a palavra que ela já usa na cozinha ('fiz um panelão de feijão')."

### 3. O mecanismo prometia o mês, a conta dava a semana — REPROVADO, corrigido

**Estava:** "Panelão do Mês" e a promessa "vende kit de lámen o mês inteiro". Mas uma
panelada rende 12 kits e a calculadora parte de 5 por dia: o mês pede 150 kits, ou 12
paneladas. Nome que promete mais do que a conta entrega é a primeira coisa que a compradora
desconfia.

**Virou:** **Panelão da Semana** — três paneladas numa tarde de sábado dão 36 kits, a semana
inteira a 5 por dia. É a mesma promessa de esforço do molde campeão ("faz numa tarde e vende
a semana inteira"). O caldo aguentar 2 a 3 meses congelado continua como argumento de
folga, não de promessa.

## O que passou, mas é risco (não é defeito de concepção)

| Risco | Por que não reprova | Onde fica registrado |
|---|---|---|
| **12 kits por panelada** | Coerente com panela de pressão comum (~4,5 L úteis em porções de ~350 ml), mas ninguém cozinhou | `DECISOES.md` — testar antes de subir |
| **R$ 30 o kit** | Inferência ancorada na tigela mais barata encontrada (R$ 29,90). Não há kit congelado artesanal com preço publicado | `02-concepcao.md`, conta de lucro; a bolinha vai de R$ 20 a R$ 45 |
| **R$ 11 de custo** | Macarrão, missô e shoyu com fonte; caldo, cobertura e embalagem estimados, arredondados pra cima | idem |
| **Lámen fora das capitais** | Cidade pequena pode não conhecer. A mensagem 2 do bônus 5 responde "o que é lámen?" em uma linha | `01-pesquisa.md`, contraponto |

## Tudo verde. Segue para a página.
