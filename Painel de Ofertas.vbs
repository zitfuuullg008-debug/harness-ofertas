' Painel de Ofertas - clique duas vezes neste arquivo.
'
' Sobe o servidor local (sem janela preta), espera ele responder e abre o
' painel numa janela propria do Edge, sem barra de endereco - parece um app.
' Se o servidor ja estiver no ar, so abre a janela.

Option Explicit

Dim sh, fso, raiz, porta, url, i, http, ok

Set sh  = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

raiz  = fso.GetParentFolderName(WScript.ScriptFullName)
porta = 4545
url   = "http://localhost:" & porta

sh.CurrentDirectory = raiz

' 1) O servidor ja esta rodando?
ok = Responde(url)

' 2) Se nao, sobe escondido (0 = janela invisivel, False = nao espera)
If Not ok Then
  sh.Run "cmd /c node """ & raiz & "\app\servidor.mjs""", 0, False

  ' espera ate 12s ele subir
  For i = 1 To 40
    WScript.Sleep 300
    If Responde(url) Then
      ok = True
      Exit For
    End If
  Next
End If

If Not ok Then
  MsgBox "Nao consegui subir o painel." & vbCrLf & vbCrLf & _
         "Verifique se o Node esta instalado (abra o Prompt e digite: node -v).", _
         vbExclamation, "Painel de Ofertas"
  WScript.Quit 1
End If

' 3) Abre numa janela propria do Edge. Se nao tiver Edge, abre no navegador padrao.
On Error Resume Next
sh.Run "msedge.exe --app=" & url & " --window-size=1460,940", 1, False
If Err.Number <> 0 Then
  Err.Clear
  sh.Run url, 1, False
End If
On Error GoTo 0


' --- o servidor responde? ---
Function Responde(endereco)
  Dim req
  Responde = False
  On Error Resume Next
  Set req = CreateObject("MSXML2.XMLHTTP")
  req.Open "GET", endereco & "/api/estado", False
  req.Send
  If Err.Number = 0 And req.Status = 200 Then Responde = True
  Err.Clear
  On Error GoTo 0
End Function
