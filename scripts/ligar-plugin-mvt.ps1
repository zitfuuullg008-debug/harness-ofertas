# ligar-plugin-mvt.ps1 — deixa o plugin MVT visível pro `claude` de linha de comando.
#
# Por que isso existe: o plugin "criador-de-pagina-mvt-2-0" vem sincronizado da
# conta claude.ai e só carrega numa sessão sincronizada. O painel roda
# `claude -p` no terminal, que NÃO é sincronizado — lá o plugin não aparece e a
# modelagem automática sairia sem a metodologia.
#
# A solução: um "marketplace" local em ~/.claude/mvt-marketplace que aponta, por
# uma junção de pasta, pro plugin sincronizado. Nada é copiado — é o mesmo
# plugin, então o que você atualizar na conta continua valendo.
#
# Rode de novo se o Claude reinstalar/renomear a pasta sincronizada e o botão
# "★ Modelar página" começar a entregar página sem MVT:
#
#   powershell -ExecutionPolicy Bypass -File scripts\ligar-plugin-mvt.ps1

$ErrorActionPreference = "Stop"

$nomePlugin = "criador-de-pagina-mvt-2-0"
$mercado    = Join-Path $env:USERPROFILE ".claude\mvt-marketplace"
$sincDir    = Join-Path $env:USERPROFILE ".claude\plugins\synced"

# 1) Onde o Claude guardou o plugin sincronizado desta vez?
$origem = Get-ChildItem -Path $sincDir -Directory -Recurse -Depth 1 -ErrorAction SilentlyContinue |
  Where-Object { $_.Name -eq $nomePlugin -and (Test-Path (Join-Path $_.FullName ".claude-plugin\plugin.json")) } |
  Sort-Object LastWriteTime -Descending | Select-Object -First 1

if (-not $origem) {
  Write-Host "Nao achei o plugin '$nomePlugin' em $sincDir."
  Write-Host "Abra o Claude Code uma vez com a sua conta pra ele sincronizar, e rode isto de novo."
  exit 1
}
Write-Host "plugin encontrado: $($origem.FullName)"

# 2) Marketplace local com uma juncao apontando pro plugin
New-Item -ItemType Directory -Force -Path (Join-Path $mercado ".claude-plugin") | Out-Null
$link = Join-Path $mercado $nomePlugin
if (Test-Path $link) { cmd /c rmdir "$link" | Out-Null }
cmd /c mklink /J "$link" "$($origem.FullName)" | Out-Null

$manifesto = @{
  name    = "mvt-local"
  owner   = @{ name = $env:USERNAME }
  plugins = @(@{
    name        = $nomePlugin
    source      = "./$nomePlugin"
    description = "Pipeline MVT de oferta low ticket (o mesmo plugin da conta claude.ai, exposto pro CLI)"
  })
} | ConvertTo-Json -Depth 5
Set-Content -Path (Join-Path $mercado ".claude-plugin\marketplace.json") -Value $manifesto -Encoding utf8
Write-Host "marketplace local escrito em $mercado"

# 3) Registra e instala (se ja estiver, o Claude so atualiza)
& claude plugin marketplace add "$mercado" 2>&1 | Out-Null
& claude plugin marketplace update mvt-local 2>&1 | Out-Null
& claude plugin install "$nomePlugin@mvt-local" 2>&1 | Out-Null

# 4) Confere de verdade: a skill responde numa rodada headless?
Write-Host "conferindo se a skill carrega no modo headless..."
$resposta = & claude -p "Responda so com SIM ou NAO: a skill criador-de-pagina-mvt-2-0:oferta-completa-mvt esta disponivel pra voce?" --output-format text --max-turns 2 2>&1
if ($resposta -match "SIM") {
  Write-Host "pronto - o botao '* Modelar pagina' do painel ja usa a metodologia MVT."
} else {
  Write-Host "ainda nao carregou. Resposta do Claude: $resposta"
  exit 2
}
