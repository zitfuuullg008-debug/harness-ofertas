---
description: Pega uma oferta do relatório de mineração e entra no pipeline MVT (Raio-X → modelagem → copy → página de vendas). Uso: /modelar Roberta Carvalho  ou  /modelar 1
allowed-tools: Read, Glob, Grep, Skill, Bash, WebFetch, WebSearch, Write, Edit
---

O usuário escolheu uma oferta minerada pra transformar em produto dele usando a **Metodologia MVT**. Argumento: `$ARGUMENTS` (nome do anunciante, ou o número do card, ou vazio).

## 1. Ache a oferta

Leia o relatório mais recente em `saidas/mineracao/` (o `.json`). Case `$ARGUMENTS` com `pagina`; se for número, use a ordem dos cards; se vier vazio, liste as 3 `recomendada: true` numa linha cada e pergunte qual.

Monte a ficha da oferta escolhida: `pagina`, `produto`, `preco`, `promessa`, `hook`, `linkVenda`, `anunciosNaPagina`, `criativosDaOferta`, `diasRodando`, `porqueEscala`, `comoModelar`, `urlBiblioteca`.

## 2. Entre no pipeline MVT

Invoque a skill **`criador-de-pagina-mvt-2-0:oferta-completa-mvt`** (Skill tool) passando a ficha e o `linkVenda` como URL da concorrência. Ela orquestra: Raio-X → modelagem → copy → página HTML → imagens → auditoria, uma fase por vez, confirmando com o usuário entre as fases.

Se essa skill não estiver disponível, faça na mão, nesta ordem, cada uma com sua skill:
1. `criador-de-pagina-mvt-2-0:raio-x-mvt` — extrai a estrutura da oferta a partir de `linkVenda`
2. `criador-de-pagina-mvt-2-0:modelador-mvt` — transforma em oferta superior (não clona)
3. `criador-de-pagina-mvt-2-0:agente-executor-copy-mvt` — copy por bloco
4. `criador-de-pagina-mvt-2-0:pagina-vendas-mvt` — HTML single-file mobile-first
5. `criador-de-pagina-mvt-2-0:imagens-oferta-atomicat` e `auditoria-copy-mvt` — se o usuário quiser seguir até o fim

## 3. Regras

- **Modelar, não clonar.** A oferta minerada é lastro: mesma dor e mesmo público ciente, mecanismo e promessa próprios.
- Salve o material em `saidas/modelagem/<data>-<slug-do-anunciante>/`.
- Respeite as regras do `CLAUDE.md` (nada de nicho black; low-ticket digital; PT-BR falado).
- Antes de começar, diga em 1 linha qual oferta está sendo modelada e qual fase está rodando.
