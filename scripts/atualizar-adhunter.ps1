# atualizar-adhunter.ps1 — roda TODAS as categorias no Ad Hunter e atualiza o cache.
#
# É o único passo que ainda gasta proxy (é o Ad Hunter minerando de verdade).
# Por isso roda 1x por semana, não todo dia. O harness lê esse cache diariamente.
#
# O script garante que a API do Ad Hunter esteja no ar antes de chamar: se a
# porta 8080 não responder, sobe `npm run dev` em segundo plano e espera.
#
# Uso manual:
#   powershell -ExecutionPolicy Bypass -File scripts\atualizar-adhunter.ps1
#   ... -Categorias "receitas,renda_extra"    # só algumas
#
# Agendamento: scripts\agendar-adhunter.ps1 registra a tarefa semanal.
param(
  [string]$Categorias = "",          # vazio = todas
  [int]$TimeoutMin    = 60,          # tempo máximo esperando a coleta
  [string]$AdHunter   = "C:\Users\maria\Desktop\ad-hunter"
)

$ErrorActionPreference = "Continue"
$raiz = Split-Path -Parent $PSScriptRoot
$logDir = Join-Path $raiz "logs"
New-Item -ItemType Directory -Force -Path $logDir | Out-Null
$log = Join-Path $logDir ("{0}_adhunter.log" -f (Get-Date -Format "yyyy-MM-dd_HH-mm"))

function Escreve($msg) {
  $linha = "[{0}] {1}" -f (Get-Date -Format "HH:mm:ss"), $msg
  Write-Host $linha
  $linha | Out-File -FilePath $log -Append -Encoding utf8
}

function ApiNoAr {
  try {
    $r = Invoke-WebRequest -Uri "http://localhost:8080/health" -TimeoutSec 5 -UseBasicParsing
    return $r.StatusCode -eq 200
  } catch { return $false }
}

Escreve "atualizacao semanal do Ad Hunter"

# 1) API no ar?
if (-not (ApiNoAr)) {
  Escreve "API fora do ar - subindo 'npm run dev' em $AdHunter"
  Start-Process -FilePath "cmd.exe" -ArgumentList "/c npm run dev" -WorkingDirectory $AdHunter -WindowStyle Hidden
  $ok = $false
  foreach ($i in 1..30) {
    Start-Sleep -Seconds 4
    if (ApiNoAr) { $ok = $true; break }
  }
  if (-not $ok) { Escreve "ERRO: a API nao subiu em 2 min. Abortando."; exit 2 }
  Escreve "API no ar"
} else {
  Escreve "API ja estava no ar"
}

# 2) Chama /scrape/all com dados frescos e filtro low-ticket ligado.
#    categoryConcurrency 2 = duas categorias por vez (o Ad Hunter ja controla o resto).
$corpo = @{
  fetchFreshData      = $true
  filterLowTicketMvt  = $true
  categoryConcurrency = 2
}
if ($Categorias) { $corpo["categories"] = $Categorias.Split(",") | ForEach-Object { $_.Trim() } }

$apiKey = ""
$envPath = Join-Path $AdHunter ".env"
if (Test-Path $envPath) {
  $linha = Get-Content $envPath | Where-Object { $_ -match "^API_KEY=" } | Select-Object -First 1
  if ($linha) { $apiKey = ($linha -replace "^API_KEY=", "").Trim().Trim('"') }
}
$headers = @{ "content-type" = "application/json" }
if ($apiKey) { $headers["X-Api-Key"] = $apiKey }

Escreve ("chamando /scrape/all" + $(if ($Categorias) { " (categorias: $Categorias)" } else { " (todas)" }))
$inicio = Get-Date
try {
  $resp = Invoke-RestMethod -Uri "http://localhost:8080/scrape/all" -Method Post -Headers $headers `
    -Body ($corpo | ConvertTo-Json) -TimeoutSec ($TimeoutMin * 60)
  $min = [math]::Round(((Get-Date) - $inicio).TotalMinutes, 1)
  Escreve "coleta concluida em $min min"
  foreach ($c in $resp.categories) {
    $n = 0
    foreach ($r in $c.results) { $n += $r.returnedAds }
    Escreve ("  {0}: {1} anuncios" -f $c.category, $n)
  }
  if ($resp.costUsd) { Escreve ("custo do filtro de IA: US$ {0}" -f $resp.costUsd) }
} catch {
  Escreve ("ERRO na coleta: " + $_.Exception.Message)
  exit 2
}

Escreve "pronto - o harness ja pode importar (roda todo dia as 6h)"
