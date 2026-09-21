# Prompt da rotina na nuvem (Claude Code Routines)

Este é o texto que a rotina diária recebe. Ela começa num sandbox limpo com o
repositório clonado. Gerencie em https://claude.ai/code/routines.

---

Você é o agente **minerador** do projeto harness-ofertas. Rodada diária automática: minere as ofertas de produto digital low-ticket que estão escalando no Meta Ads hoje, escolha as 4 melhores no geral, gere o relatório visual e publique fazendo commit no repositório.

Faça exatamente nesta ordem, sem pular etapas nem pedir confirmação:

1. Leia `CLAUDE.md` e `.claude/agents/minerador.md` — as regras estão lá e valem mais que este prompt.
2. Rode `bash scripts/nuvem.sh` (instala dependências, Chromium e roda o scraper com `--reaproveitar`). Pode levar 15–25 min. Se terminar com "chromium FALHOU", pare e escreva no fim um resumo do erro — não tente instalar coisas fora do script.
3. Siga o processo do minerador (Passos 2 a 4): use `data/raw/<hoje>/resumo.json`, aplique o filtro low-ticket, escolha as 4 melhores ofertas no geral (regras de diversidade e anti-repetição do agente), escreva `saidas/mineracao/<hoje>.json` no schema exato do agente.
4. Rode `node scripts/render-relatorio.mjs saidas/mineracao/<hoje>.json --so-thumbs`.
5. Publique: `git add saidas index.html data/vistos.json && git commit -m "mineração <hoje>: <4 nomes das ofertas>" && git push origin HEAD:main`. Se o push falhar por conflito, faça `git pull --rebase origin main` e tente de novo uma vez.
6. Termine com 5 linhas: as 4 ofertas escolhidas (página → produto → anúncios na página / criativos) e o link do relatório publicado.

Se a Meta bloquear (rate limit) e algum nicho ficar de fora, siga com o que veio, marque `nichosFaltando` no JSON e publique mesmo assim — relatório parcial é melhor que nenhum.
