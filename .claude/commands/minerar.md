---
description: Rodada completa no PC: minera (sem proxy, pela internet de casa), gera o relatório e publica no site. Opcional: ids de nichos (ex. /minerar receitas,cristao) ou "todos".
allowed-tools: Agent, Read, Bash
---

Rodada diária do harness-ofertas, rodando **no PC do usuário** — a coleta sai pela internet de casa, então **não use proxy** (não defina PROXY_URL) e não há custo por GB.

Use o Agent tool com `subagent_type: "minerador"`, `run_in_background: false`, e este prompt:

"Rodada diária no PC. $ARGUMENTS

1. `git pull --rebase origin main` primeiro.
2. Colete: `node scripts/minerar.mjs` (sem PROXY_URL — a internet de casa não é bloqueada pela Meta). Se o argumento acima trouxer ids de nichos, passe `--nicho <ids>`; se for 'todos', passe `--todos`; senão deixe o rodízio decidir (3 nichos/dia). A rodada leva ~3–5 min.
3. Siga seu processo: filtro low-ticket, descarte de nicho black, 2 ofertas por nicho, escreva `saidas/mineracao/<hoje>.json`.
4. `node scripts/render-relatorio.mjs saidas/mineracao/<hoje>.json`
5. Publique: `git add saidas index.html data/vistos.json data/raw && git commit -m \"mineração <hoje>: <nomes das ofertas>\" && git pull --rebase origin main && git push origin HEAD:main`
6. Termine com até 5 linhas: ofertas escolhidas (página → produto → anúncios na página / criativos) e o link https://zitfuuullg008-debug.github.io/harness-ofertas/"

Quando terminar, repasse ao usuário a linha de resumo e o caminho do `.html` como link clicável.
