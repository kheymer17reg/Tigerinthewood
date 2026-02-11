' Тигрёнок в лесу - Запуск игры
' Этот скрипт открывает игру в браузере без черного окна

Set objShell = CreateObject("WScript.Shell")
Set objFSO = CreateObject("Scripting.FileSystemObject")

' Получаем путь к текущей папке
strScriptPath = objFSO.GetParentFolderName(WScript.ScriptFullName)
strHTMLFile = strScriptPath & "\tiger_game_improved.html"

' Если путь пуст, используем текущую директорию
If strScriptPath = "" Then
    strScriptPath = objShell.CurrentDirectory
    strHTMLFile = strScriptPath & "\tiger_game_improved.html"
End If

' Проверяем, существует ли файл
If Not objFSO.FileExists(strHTMLFile) Then
    MsgBox "Ошибка: Файл tiger_game_improved.html не найден!" & vbCrLf & vbCrLf & "Путь: " & strHTMLFile & vbCrLf & vbCrLf & "Убедитесь, что файл находится в той же папке, что и этот скрипт.", vbCritical, "Тигрёнок в лесу"
    WScript.Quit 1
End If

' Открываем файл в браузере по умолчанию
On Error Resume Next
objShell.Run """" & strHTMLFile & """", 0, False
If Err.Number <> 0 Then
    MsgBox "Ошибка при открытии файла: " & Err.Description, vbCritical, "Тигрёнок в лесу"
    WScript.Quit 1
End If
On Error GoTo 0

' Показываем сообщение об успехе
MsgBox "🐯 Тигрёнок в лесу" & vbCrLf & vbCrLf & "Игра открывается в браузере..." & vbCrLf & vbCrLf & "Введи своё имя и начни играть!", vbInformation, "Тигрёнок в лесу"

WScript.Quit 0
