# Тигрёнок в лесу - Запуск игры
# Этот скрипт открывает игру в браузере

# Получаем путь к текущей папке
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$htmlFile = Join-Path $scriptPath "tiger_game_improved.html"

# Проверяем, существует ли файл
if (-not (Test-Path $htmlFile)) {
    [System.Windows.Forms.MessageBox]::Show(
        "Ошибка: Файл tiger_game_improved.html не найден!`n`nПуть: $htmlFile`n`nУбедитесь, что файл находится в той же папке, что и этот скрипт.",
        "Тигрёнок в лесу",
        [System.Windows.Forms.MessageBoxButtons]::OK,
        [System.Windows.Forms.MessageBoxIcon]::Error
    )
    exit 1
}

# Открываем файл в браузере по умолчанию
try {
    Start-Process $htmlFile
    
    # Показываем сообщение об успехе
    [System.Windows.Forms.MessageBox]::Show(
        "🐯 Тигрёнок в лесу`n`nИгра открывается в браузере...`n`nВведи своё имя и начни играть!",
        "Тигрёнок в лесу",
        [System.Windows.Forms.MessageBoxButtons]::OK,
        [System.Windows.Forms.MessageBoxIcon]::Information
    )
} catch {
    [System.Windows.Forms.MessageBox]::Show(
        "Ошибка при открытии файла: $_",
        "Тигрёнок в лесу",
        [System.Windows.Forms.MessageBoxButtons]::OK,
        [System.Windows.Forms.MessageBoxIcon]::Error
    )
    exit 1
}

exit 0
