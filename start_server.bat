@echo off
echo Запуск HTTP сервера...
echo.
echo Откройте браузер и перейдите на: http://127.0.0.1:8000/index.html
echo.
echo Для остановки сервера нажмите Ctrl+C
echo.
py -m http.server 8000 --bind 127.0.0.1
pause