#!/usr/bin/env bash
# nuvem.sh — preparação + coleta quando o projeto roda numa rotina na nuvem
# (Claude Code Routines). O sandbox começa vazio: instala dependências, acha
# um Chromium, faz ele confiar na CA do proxy do sandbox e roda o scraper.
# A classificação (agente minerador), a renderização e o commit ficam a
# cargo do prompt da rotina.
#
# Requisitos do ambiente na nuvem (claude.ai/code → seletor de ambiente → engrenagem):
#   - Acesso à rede: Completo (ou Personalizado com facebook.com, *.facebook.com, *.fbcdn.net)
#   - Variável PROXY_URL=http://user:pass@host:port — proxy RESIDENCIAL. A Meta
#     bloqueia IP de datacenter na primeira busca; sem proxy a nuvem não minera.
#   - Opcional: MINERAR_ARGS="--nicho receitas,comida_caseira --max 12" pra rodada leve.
#
# Uso (dentro da rotina):  bash scripts/nuvem.sh
set -euo pipefail
cd "$(dirname "$0")/.."

# Tolera "PROXY_URL=..." colado inteiro no valor da variável.
if [ -n "${PROXY_URL:-}" ]; then export PROXY_URL="${PROXY_URL#PROXY_URL=}"; fi

echo "== node $(node --version) / npm $(npm --version)"
# --ignore-scripts: não roda o postinstall do playwright (o download do CDN é bloqueado na nuvem)
npm install --no-audit --no-fund --ignore-scripts

if [ -z "${PROXY_URL:-}" ]; then
  echo "== AVISO: PROXY_URL não definido. A Meta costuma bloquear o IP da nuvem; configure um proxy residencial no ambiente."
fi

# 1) Chromium: o sandbox da Anthropic já traz um em $PLAYWRIGHT_BROWSERS_PATH.
if [ -z "${CHROMIUM_PATH:-}" ]; then
  for base in "${PLAYWRIGHT_BROWSERS_PATH:-/opt/pw-browsers}" "$HOME/.cache/ms-playwright"; do
    achado=$(find "$base" -maxdepth 3 -type f -name chrome 2>/dev/null | sort | tail -1 || true)
    if [ -n "$achado" ]; then CHROMIUM_PATH="$achado"; break; fi
  done
fi
if [ -z "${CHROMIUM_PATH:-}" ]; then
  echo "== nenhum Chromium pré-instalado; tentando baixar"
  npx playwright install chromium || npx playwright install --with-deps chromium
else
  echo "== usando Chromium pré-instalado: $CHROMIUM_PATH"
fi
export CHROMIUM_PATH="${CHROMIUM_PATH:-}"

# 2) O sandbox re-termina o TLS num proxy próprio e pede que TODA ferramenta
#    confie no bundle em /root/.ccr/ca-bundle.crt (ver /root/.ccr/README.md).
#    Node/curl já confiam via variáveis de ambiente; o Chromium lê o banco NSS
#    do usuário, então importamos o bundle lá com o certutil.
CA_BUNDLE="${CCR_CA_BUNDLE:-/root/.ccr/ca-bundle.crt}"
if [ -f "$CA_BUNDLE" ]; then
  if ! command -v certutil >/dev/null 2>&1; then
    echo "== instalando libnss3-tools (certutil)"
    (sudo apt-get update -qq && sudo apt-get install -y -qq libnss3-tools) >/dev/null 2>&1 || \
    (apt-get update -qq && apt-get install -y -qq libnss3-tools) >/dev/null 2>&1 || true
  fi
  if command -v certutil >/dev/null 2>&1; then
    NSSDB="$HOME/.pki/nssdb"
    mkdir -p "$NSSDB"
    [ -f "$NSSDB/cert9.db" ] || certutil -d "sql:$NSSDB" -N --empty-password
    tmp=$(mktemp -d)
    csplit -s -z -f "$tmp/ca-" -b "%02d.pem" "$CA_BUNDLE" '/-----BEGIN CERTIFICATE-----/' '{*}'
    n=0
    for f in "$tmp"/ca-*.pem; do
      n=$((n+1))
      certutil -d "sql:$NSSDB" -A -t "C,," -n "sandbox-proxy-ca-$n" -i "$f" 2>/dev/null || true
    done
    echo "== $n certificado(s) do proxy do sandbox importados no NSS do Chromium"
  else
    echo "== certutil indisponível; o Chromium pode não confiar no proxy do sandbox"
  fi
fi

# 3) Teste rápido: o Chromium abre e a Meta responde?
node -e '
import("playwright").then(async ({ chromium }) => {
  const proxy = process.env.PROXY_URL ? (() => { const u = new URL(process.env.PROXY_URL); return { server: `${u.protocol}//${u.hostname}:${u.port}`, username: decodeURIComponent(u.username), password: decodeURIComponent(u.password) }; })() : undefined;
  const b = await chromium.launch({ args: ["--no-sandbox"], ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}), ...(proxy ? { proxy } : {}) });
  const p = await b.newPage();
  const r = await p.goto("https://www.facebook.com/ads/library/", { waitUntil: "domcontentloaded", timeout: 45000 });
  console.log("== chromium ok; facebook respondeu", r?.status(), "| título:", (await p.title()).slice(0, 40), "| proxy:", proxy ? "sim" : "não");
  await b.close();
}).catch((e) => { console.error("== chromium FALHOU:", e.message.split("\n")[0]); process.exit(2); });
'

# 4) Coleta. --reaproveitar: rodada repetida no mesmo dia não refaz o que já veio.
#    MINERAR_ARGS permite rodada leve (ex.: --nicho receitas --max 12 --enrich 2).
# shellcheck disable=SC2086
node scripts/minerar.mjs --reaproveitar ${MINERAR_ARGS:-}
