# agendar-terca.ps1 — registra (ou atualiza) a tarefa semanal no Agendador do Windows.
# Padrão: toda TERÇA às 08:30 roda /semana (minerar → ideias → criativos), então
# às 9h os criativos já estão em saidas/criativos/.
#
# Rode UMA vez (PowerShell normal, não precisa de admin):
#   powershell -ExecutionPolicy Bypass -File scripts\agendar-terca.ps1
#
# Pra trocar o comando/horário:
#   powershell -ExecutionPolicy Bypass -File scripts\agendar-terca.ps1 -Comando "/criativos" -Hora "09:00"
#
# Pra remover:
#   Unregister-ScheduledTask -TaskName "HarnessOfertas-Semana" -Confirm:$false
param(
  [string]$Comando = "/semana",
  [string]$Hora    = "08:30",
  [string]$Dia     = "Tuesday",
  [string]$Nome    = "HarnessOfertas-Semana"
)

$root   = Split-Path -Parent $PSScriptRoot
$runner = Join-Path $root "scripts\rodar.ps1"

$action  = New-ScheduledTaskAction -Execute "powershell.exe" `
  -Argument "-NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File `"$runner`" -Comando `"$Comando`"" `
  -WorkingDirectory $root

if ($Dia) { $trigger = New-ScheduledTaskTrigger -Weekly -DaysOfWeek $Dia -At $Hora }
else      { $trigger = New-ScheduledTaskTrigger -Daily -At $Hora }

# StartWhenAvailable: se o PC estava desligado às 8:30, roda assim que ligar.
# ExecutionTimeLimit 2h: o /semana com scraper pode levar 30–60 min.
$settings = New-ScheduledTaskSettingsSet -StartWhenAvailable -ExecutionTimeLimit (New-TimeSpan -Hours 2) `
  -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -WakeToRun

Register-ScheduledTask -TaskName $Nome -Action $action -Trigger $trigger -Settings $settings `
  -Description "harness-ofertas: roda $Comando $(if ($Dia) { "toda $Dia" } else { 'todo dia' }) as $Hora" -Force | Out-Null

$t = Get-ScheduledTask -TaskName $Nome
Write-Host "Tarefa '$Nome' registrada: $(if ($Dia) { $Dia } else { 'todo dia' }) $Hora -> $Comando"
Write-Host "Proxima execucao: $((Get-ScheduledTaskInfo -TaskName $Nome).NextRunTime)"
