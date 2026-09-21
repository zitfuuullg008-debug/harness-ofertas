#!/usr/bin/env bash
# nuvem.sh — preparação + coleta quando o projeto roda numa rotina na nuvem
# (Claude Code Routines). O sandbox começa vazio: instala dependências, garante
# o Chromium do Playwright e roda o scraper. A classificação (agente minerador),
# a renderização e o commit ficam a cargo do prompt da rotina.
#
# Uso (dentro da rotina):  bash scripts/nuvem.sh
set -euo pipefail
cd "$(dirname "$0")/.."

echo "== node $(node --version) / npm $(npm --version)"
npm install --no-audit --no-fund --ignore-scripts

# Tenta instalar só o navegador; se faltar biblioteca do sistema, tenta com deps.
if ! npx playwright install chromium; then
  echo "== instalando dependências de sistema do Chromium"
  npx playwright install --with-deps chromium || sudo npx playwright install --with-deps chromium
fi

# Teste rápido: o Chromium abre?
node -e '
import("playwright").then(async ({ chromium }) => {
  const b = await chromium.launch({ args: ["--no-sandbox"] });
  await b.close();
  console.log("== chromium ok");
}).catch((e) => { console.error("== chromium FALHOU:", e.message.split("\n")[0]); process.exit(2); });
'

# Coleta. --reaproveitar: se a rotina foi reexecutada no mesmo dia, não repete o que já veio.
node scripts/minerar.mjs --reaproveitar
