@echo off
setlocal EnableExtensions
title FotoIT - oprire
REM Opreste procesele care asculta pe porturile backend-ului (8080) si frontend-ului (3000).

for %%P in (8080 3000) do (
    for /f "tokens=5" %%I in ('netstat -ano ^| findstr /r /c:":%%P .*LISTENING"') do (
        echo  Oprire proces %%I de pe portul %%P
        taskkill /PID %%I /T /F >nul 2>&1
    )
)

REM Inchide si ferestrele de consola ramase deschise
taskkill /FI "WINDOWTITLE eq FotoIT Backend*" /T /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq FotoIT Frontend*" /T /F >nul 2>&1

echo  FotoIT oprit.
endlocal
