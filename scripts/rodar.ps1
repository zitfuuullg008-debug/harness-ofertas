# rodar.ps1 — executa um comando do harness em modo headless (sem interface).
# Usado pelo Agendador de Tarefas do Windows. Também pode ser chamado na mão:
#   powershell -ExecutionPolicy Bypass -File scripts\rodar.ps1 -Comando "/criativos"
param(
  [string]$Comando = "/semana"
)

$ErrorActionPreference = "Continue"
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

$stamp = Get-Date -Format "yyyy-MM-dd_HH-mm"
$slug  = ($Comando -replace '[^a-zA-Z0-9]', '')
$logDir = Join-Path $root "logs"
New-Item -ItemType Directory -Force -Path $logDir | Out-Null
$log   = Join-Path $logDir "$stamp`_$slug.log"

"[$(Get-Date -Format s)] iniciando: $Comando" | Out-File -FilePath $log -Encoding utf8

# --permission-mode acceptEdits: escreve arquivos sem perguntar. Bash de scripts/ e
# Write em saidas/ e data/ já estão liberados em .claude/settings.json.
# --max-turns alto porque o /semana encadeia 3 agentes e o scraper demora.
& claude -p $Comando `
    --permission-mode acceptEdits `
    --max-turns 120 `
    --output-format text 2>&1 | Tee-Object -FilePath $log -Append

$exit = $LASTEXITCODE
"[$(Get-Date -Format s)] fim (exit $exit)" | Out-File -FilePath $log -Append -Encoding utf8

# Entrega: abre no navegador todo relatório HTML gerado nesta rodada (mineração,
# ideias, criativos). Se nada foi gerado, abre o log pra você ver o que houve.
$desde = (Get-Date).AddHours(-3)
$novos = Get-ChildItem -Path (Join-Path $root "saidas") -Recurse -Filter *.html -ErrorAction SilentlyContinue |
  Where-Object { $_.LastWriteTime -gt $desde } | Sort-Object LastWriteTime
if ($novos) {
  foreach ($f in $novos) { Start-Process $f.FullName }
} else {
  Start-Process notepad.exe $log
}
exit $exit
