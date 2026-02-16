@echo off
echo Проверка Python...
py --version
if %errorlevel% equ 0 (
    echo ✅ Python установлен!
) else (
    echo ❌ Python не найден!
    echo Установи Python с https://www.python.org/downloads/
)
pause