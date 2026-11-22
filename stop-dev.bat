@echo off
setlocal EnableExtensions
title FotoIT - oprire
REM Opreste backend-ul (8080), frontend-ul (3000) si tunelul Cloudflare, daca ruleaza.

for %%P in (8080 3000) do (
    for /f "tokens=5" %%I in ('netstat -ano ^| findstr /r /c:":%%P .*LISTENING"') do (
        echo  Oprire proces %%I de pe portul %%P
        taskkill /PID %%I /T /F >nul 2>&1
    )
)

taskkill /FI "WINDOWTITLE eq FotoIT Tunnel*" /T /F >nul 2>&1 && echo  Tunel Cloudflare oprit
taskkill /FI "WINDOWTITLE eq FotoIT Backend*" /T /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq FotoIT Frontend*" /T /F >nul 2>&1

if exist "%~dp0backend\public-url.txt" del /q "%~dp0backend\public-url.txt"

echo  FotoIT oprit.
endlocal
