# DECISÕES — Caixinha de Canela

Rodada `--auto` de 2026-09-22. Cada linha abaixo é um ponto onde a skill teria parado e
perguntado "confirma?". Ninguém estava na frente do teclado, então decidi. **Este arquivo é
o gate.** Discorde de qualquer linha e me diga qual — a fase correspondente se refaz.

## Fase 1 — Pesquisa e Raio-X

| # | Decisão | Alternativa descartada | Por quê |
|---|---|---|---|
| 1 | Tratar a oferta como **doce** (cinnamon roll), contra o relatório do dia | Seguir o relatório, que classificou como "salgado único" | `og:title` da página é `cinnamonroll` e 5 thumbs inspecionados mostram rolo doce com cobertura |
| 2 | Não forçar a extração da página da concorrente | Insistir em decifrar o payload AES da Inlead | Sem navegador na sessão. Preço, bônus e garantia dela viraram "Não identificado" em vez de chute |
| 3 | Registrar que "Luciana Prado" é operador de mídia, não confeiteira | Tratar como expert do nicho | `og:url` da página é `app.saboneteslucrativos.site`, e o relatório do dia trouxe 2 ofertas de sabonete no mesmo nicho |
| 4 | Recorte **"fazer e vender"** | Recorte "aprender a fazer", igual ao da concorrente | Ela compra tráfego na keyword "aprenda a fazer dinheiro" e entrega promessa de hobby. É o buraco dela |

## Fase 2 — Modelagem

| # | Decisão | Alternativa descartada | Por quê |
|---|---|---|---|
| 5 | **Manter** o cinnamon roll (Eixo 1) | Deslocar para brownie de pote, pão de mel, bolo de pote ou rosca | Saturação baixa (1 oferta em 76 páginas mineradas) e nota 9. A regra da metodologia manda manter nesse caso. O gargalo era a concepção, não o produto |
| 6 | Mecanismo por **fusão**: Fornada Sortida | Usar só "uma massa, seis sabores" ou só "vende a caixinha" | Um resolve produção, o outro resolve preço, e há ligação causal: a massa única é o que torna a caixinha sortida possível |
| 7 | Formato **ebook + folha de preço pra imprimir** | Ebook puro | A folha é o único item que sai da tela e vira objeto na geladeira dela. Tangibilização barata |
| 8 | Persona 1 (já vende, cobra errado) a 70%, Persona 5 (nunca vendeu) a 30% | Escrever pra quem precisa de R$ 500 este mês | Persona 1 já provou que vende e já superou a vergonha. Converte mais barato |
| 9 | Nome **Caixinha de Canela**, diferente do mecanismo | Usar "Fornada Sortida" como nome do produto | Dois nomes = dois ativos. Um é o produto, o outro é o jeito de produzir |
| 10 | **4 bônus**, não 6 | Incluir "Fornada de Véspera" e "Lista de Compras" | A R$ 19,90 lista longa cheira a PLR. Os dois descartados viraram seção do produto principal |
| 11 | Preço **R$ 19,90** | R$ 9,90 (agressivo) ou R$ 37 (premium) | Teto da faixa do nicho hoje, e a oferta entrega mais que receita. R$ 37 sem autoridade e sem depoimento é cedo |

## Fase 3 — Copy

| # | Decisão | Alternativa descartada | Por quê |
|---|---|---|---|
| 12 | **Cortar o bloco de Depoimentos** e pôr Validação de Mercado no lugar | Manter o bloco com placeholder, ou inventar depoimento | Inventar é proibido pela skill e por bom senso. Seção de depoimento vazia é pior que ausente. O bloco novo prova o mercado com 4 dados e fonte |
| 13 | Prova social do hero = **R$ 32,90 da padaria**, sem estrelas | "+2.000 alunas" com 5 estrelas, como faz o nicho inteiro | Não temos aluna nenhuma. O número real ocupa o slot e é mais forte que um genérico |
| 14 | **Sem "de R$ 97 por R$ 19,90"** | Âncora riscada, padrão do template | Âncora inventada. Trocada por comparação factual com fonte |
| 15 | Placeholders em tudo que é dado de negócio | Assumir Hotmart, acesso vitalício, suporte por e-mail | Meio de entrega, condição de acesso e canal de suporte são decisão sua, não minha |

## Fase 4 — Página

| # | Decisão | Alternativa descartada | Por quê |
|---|---|---|---|
| 16 | **Plano único** a R$ 19,90 | Básico R$ 19,90 + Completo R$ 27,90 com os bônus | Dois planos elevariam o ticket médio, mas quebrariam a consistência de preço com a OA100K, que a checklist do pipeline exige. Variação de plano único é prevista na skill |
| 17 | Bridge ajustada para **4 BÔNUS** | Manter os 7 do template | Temos 4 |
| 18 | Ícones do bloco "Ideal" com **emoji no círculo** | Deixar `{{IMG:cards-ideal:N}}` | A regra da skill é explícita: placeholder ali renderiza 5 ícones quebrados numa seção muito visível |
| 19 | Checkout como `{{CHECKOUT}}` | Inventar uma URL de Kiwify ou Hotmart | Nunca inventar URL. Está listado como bloqueador na auditoria |

## Fase 6 — Auditoria

| # | Decisão | Alternativa descartada | Por quê |
|---|---|---|---|
| 20 | **Não dar nota de Execução visual** | Estimar uma nota pelo código | Sem imagens e sem navegador, qualquer número seria inventado. Média calculada só sobre os 4 mandamentos auditáveis |
| 21 | Auditar mesmo com a Fase 5 pulada, marcando o que ficou de fora | Pular a Fase 6 também | Copy, coerência, dicionário de termos e carga são auditáveis agora. Os 3 bloqueadores encontrados valem mais achados cedo que tarde |

## As duas coisas que eu mudaria se você me deixasse mudar

1. **Rodar a Fase 5 antes da 6.** A auditoria de hoje vale para copy e estrutura, e a nota
   real da oferta depende do visual que ainda não existe.
2. **Decidir o expert.** É a correção nº 3 da auditoria e é a única vantagem sobre a
   concorrente que a página ainda não materializou.
