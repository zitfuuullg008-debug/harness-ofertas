---
description: Rodada diária: importa as ofertas que o Ad Hunter já minerou, escolhe as melhores, enriquece e publica no site. Opcional: "--coletar" força o scraper próprio (raro).
allowed-tools: Agent, Read, Bash
---

Rodada diária do harness-ofertas.

**A coleta vem do Ad Hunter**, que o usuário roda ~2x por semana com o proxy residencial dele. Aqui a gente só lê o cache — zero scraping, zero proxy, zero bloqueio.

Use o Agent tool com `subagent_type: "minerador"`, `run_in_background: false`, e este prompt:

"Rodada diária. $ARGUMENTS

1. `git pull --rebase origin main`
2. `node scripts/importar-adhunter.mjs` — traz as ofertas do cache do Ad Hunter pra `data/raw/<hoje>/`. Se algum nicho aparecer com cache velho (mais de ~7 dias) ou não vier nada, **diga isso no `resumo`** pro usuário saber que precisa rodar aquela categoria no Ad Hunter. **Não rode `scripts/minerar.mjs`** a não ser que o argumento acima contenha `--coletar`.
3. Siga seu processo: filtro low-ticket, descarte de nicho black, só página de vendas, pool com as melhores e `recomendadas` marcadas.
4. `node scripts/enriquecer.mjs saidas/mineracao/<hoje>.json` — conta criativos reais por oferta, checa o destino final do link e salva o dossiê de cada página. Aplique a régua de `minCriativosDaOferta` e troque os cards pela oferta dominante quando fizer sentido.
5. `node scripts/render-relatorio.mjs saidas/mineracao/<hoje>.json`
6. `node scripts/salvar-no-adhunter.mjs saidas/mineracao/<hoje>.json` — devolve as escolhidas pro Ad Hunter, pra aparecerem salvas na interface dele com a nota da escolha. Se a API do Ad Hunter estiver fora do ar (porta 8080), só avise no fim — não é motivo pra parar a rodada.
7. `git add saidas index.html data/vistos.json data/raw && git commit -m \"mineração <hoje>: <nomes>\" && git pull --rebase origin main && git push origin HEAD:main`
8. Termine com as recomendadas (página → 1 frase) e o link https://zitfuuullg008-debug.github.io/harness-ofertas/"

Quando terminar, repasse a linha de resumo e o caminho do `.html` como link clicável.
