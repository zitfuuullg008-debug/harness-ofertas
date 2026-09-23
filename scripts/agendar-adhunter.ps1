# agendar-adhunter.ps1 — registra a atualização semanal do Ad Hunter no Agendador.
#
# Padrão: todo DOMINGO às 04:00 roda todas as categorias no Ad Hunter, deixando
# o cache fresco antes da rodada diária do harness (06:00). É o único passo que
# consome proxy — por isso 1x por semana.
#
# Rode UMA vez:
#   powershell -ExecutionPolicy Bypass -File scripts\agendar-adhunter.ps1
#
# Outro dia/hora:
#   ... -Dia Wednesday -Hora "03:00"
#
# Duas vezes por semana: rode de novo com outro -Dia e outro -Nome, ex.:
#   ... -Dia Wednesday -Nome "AdHunter-Semanal-2"
#
# Remover:
#   Unregister-ScheduledTask -TaskName "AdHunter-Semanal" -Confirm:$false
param(
  [string]$Dia  = "Sunday",
  [string]$Hora = "04:00",
  [string]$Nome = "AdHunter-Semanal"
)

$raiz   = Split-Path -Parent $PSScriptRoot
$script = Join-Path $raiz "scripts\atualizar-adhunter.ps1"

$action = New-ScheduledTaskAction -Execute "powershell.exe" `
  -Argument "-NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File `"$script`"" `
  -WorkingDirectory $raiz

$trigger = New-ScheduledTaskTrigger -Weekly -DaysOfWeek $Dia -At $Hora

# StartWhenAvailable: se o PC estava desligado, roda quando ligar.
# WakeToRun: acorda da suspensão. 3h de limite (a coleta completa é demorada).
$settings = New-ScheduledTaskSettingsSet -StartWhenAvailable -WakeToRun `
  -ExecutionTimeLimit (New-TimeSpan -Hours 3) -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries

Register-ScheduledTask -TaskName $Nome -Action $action -Trigger $trigger -Settings $settings `
  -Description "Ad Hunter: atualiza todas as categorias (usa proxy) para o harness ler a semana toda" -Force | Out-Null

Write-Host "Tarefa '$Nome' registrada: toda $Dia as $Hora"
Write-Host "Proxima execucao: $((Get-ScheduledTaskInfo -TaskName $Nome).NextRunTime)"
