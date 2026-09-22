#!/usr/bin/env bash
# nuvem.sh — preparação + coleta quando o projeto roda numa rotina na nuvem
# (Claude Code Routines). O sandbox começa vazio: instala dependências, acha
# um Chromium e roda o scraper. A classificação (agente minerador), a
# renderização e o commit ficam a cargo do prompt da rotina.
#
# Requisito do ambiente na nuvem: acesso de rede liberado pra www.facebook.com
# (configuração do ambiente em claude.ai/code → Environments → Network access).
#
# Uso (dentro da rotina):  bash scripts/nuvem.sh
set -euo pipefail
cd "$(dirname "$0")/.."

echo "== node $(node --version) / npm $(npm --version)"
# --ignore-scripts: não roda o postinstall do playwright (o download do CDN é bloqueado na nuvem)
npm install --no-audit --no-fund --ignore-scripts

# 1) Chromium: o sandbox da Anthropic já traz um em $PLAYWRIGHT_BROWSERS_PATH
#    (ex.: /opt/pw-browsers/chromium-1194/chrome-linux/chrome). Usa ele.
#    Só tenta baixar se não achar nenhum.
if [ -z "${CHROMIUM_PATH:-}" ]; then
  for base in "${PLAYWRIGHT_BROWSERS_PATH:-/opt/pw-browsers}" "$HOME/.cache/ms-playwright"; do
    achado=$(find "$base" -maxdepth 3 -type f \( -name chrome -o -name headless_shell \) 2>/dev/null | sort | tail -1 || true)
    if [ -n "$achado" ]; then CHROMIUM_PATH="$achado"; break; fi
  done
fi
if [ -z "${CHROMIUM_PATH:-}" ]; then
  echo "== nenhum Chromium pré-instalado; tentando baixar"
  npx playwright install chromium || npx playwright install --with-deps chromium
else
  echo "== usando Chromium pré-instalado: $CHROMIUM_PATH"
  export CHROMIUM_PATH
fi

# 2) Teste rápido: o Chromium abre e a Meta responde?
CHROMIUM_PATH="${CHROMIUM_PATH:-}" node -e '
import("playwright").then(async ({ chromium }) => {
  const b = await chromium.launch({ args: ["--no-sandbox"], ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}) });
  const p = await b.newPage();
  const r = await p.goto("https://www.facebook.com/ads/library/", { waitUntil: "domcontentloaded", timeout: 30000 });
  console.log("== chromium ok; facebook respondeu", r?.status());
  await b.close();
}).catch((e) => { console.error("== chromium FALHOU:", e.message.split("\n")[0]); process.exit(2); });
'

# 3) Coleta. --reaproveitar: se a rotina foi reexecutada no mesmo dia, não repete o que já veio.
node scripts/minerar.mjs --reaproveitar
