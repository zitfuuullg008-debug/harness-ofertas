#!/usr/bin/env bash
# nuvem.sh — usado pela rotina do Claude na nuvem. A rotina NÃO minera: quem
# minera é o GitHub Actions (.github/workflows/minerar.yml), que roda com
# internet aberta + proxy residencial e comita data/raw/<data>/ no repositório.
# Este script só garante que a coleta de hoje está aqui; se não estiver,
# dispara o workflow e espera ele terminar.
#
# Uso (dentro da rotina):  bash scripts/nuvem.sh
# Variável opcional MINERAR_ARGS: repassada ao workflow em modo teste, no formato
#   MINERAR_ARGS="nichos=receitas,comida_caseira max=12 enrich=2 top=5"
set -euo pipefail
cd "$(dirname "$0")/.."

HOJE=$(date -u +%Y-%m-%d)
echo "== hoje: $HOJE"
npm install --no-audit --no-fund --ignore-scripts >/dev/null 2>&1 || true

git pull --rebase -q origin main || true
if [ -f "data/raw/$HOJE/resumo.json" ]; then
  echo "== coleta de hoje já está no repositório"
  exit 0
fi

echo "== coleta de hoje ainda não existe; disparando o workflow 'Minerar ofertas'"
CAMPOS=()
for kv in ${MINERAR_ARGS:-}; do CAMPOS+=(-f "$kv"); done
gh workflow run minerar.yml --ref main "${CAMPOS[@]}"
sleep 20

# Espera o run mais recente terminar (até ~60 min).
RUN_ID=$(gh run list --workflow=minerar.yml --limit 1 --json databaseId -q '.[0].databaseId')
echo "== acompanhando run $RUN_ID"
for i in $(seq 1 120); do
  STATUS=$(gh run view "$RUN_ID" --json status,conclusion -q '.status + "/" + (.conclusion // "")')
  case "$STATUS" in
    completed/success) echo "== workflow concluído"; break ;;
    completed/*) echo "== workflow terminou com: $STATUS"; gh run view "$RUN_ID" --log-failed | tail -40 || true; exit 2 ;;
  esac
  sleep 30
done

git pull --rebase -q origin main
if [ -f "data/raw/$HOJE/resumo.json" ]; then
  echo "== coleta de hoje disponível"
else
  echo "== workflow rodou mas não gerou data/raw/$HOJE/resumo.json"
  exit 2
fi
