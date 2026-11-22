@echo off
setlocal EnableExtensions
title FotoIT - site public (Cloudflare Tunnel)
REM ===================================================================
REM  Pune site-ul FotoIT online de pe acest PC, printr-un link public
REM  https://<ceva>.trycloudflare.com (gratuit, fara domeniu).
REM
REM  - frontend-ul ruleaza in modul de productie (mai rapid decat dev)
REM  - doar site-ul e public; panoul de admin ramane doar pe acest PC:
REM      http://localhost:8080/admin
REM  - link-ul se schimba la fiecare pornire
REM  - site-ul e online doar cat timp PC-ul e pornit si fereastra
REM    "FotoIT Tunnel" e deschisa
REM
REM  Oprire: stop-dev.bat
REM ===================================================================

set "ROOT=%~dp0"
set "BACKEND=%ROOT%backend"
set "FRONTEND=%ROOT%frontend\frontend"
set "TUNNEL_LOG=%BACKEND%\cloudflared.log"
set "URL_FILE=%BACKEND%\public-url.txt"

echo.
echo  FotoIT - pornire site public
echo  ----------------------------

REM --- Verificari -----------------------------------------------------
where java >nul 2>&1 || (echo  [EROARE] Java nu este instalat. & goto :fail)
where npm  >nul 2>&1 || (echo  [EROARE] Node.js / npm nu este instalat. & goto :fail)

REM cloudflared poate fi instalat dar inca absent din PATH-ul terminalului curent
for %%D in ("%ProgramFiles(x86)%\cloudflared" "%ProgramFiles%\cloudflared" "%LOCALAPPDATA%\Microsoft\WinGet\Links") do (
    if exist "%%~D\cloudflared.exe" set "PATH=%%~D;%PATH%"
)

where cloudflared >nul 2>&1
if errorlevel 1 (
    echo  cloudflared ^(programul Cloudflare pentru tunel^) nu este instalat.
    choice /c DN /m " Il instalez acum cu winget (pachetul oficial Cloudflare.cloudflared)"
    if errorlevel 2 goto :fail
    winget install --id Cloudflare.cloudflared -e --accept-source-agreements --accept-package-agreements
    if errorlevel 1 (echo  [EROARE] Instalarea a esuat. & goto :fail)
    REM PATH-ul nou nu e vizibil in fereastra curenta: cautam executabilul instalat
    for %%D in ("%ProgramFiles%\cloudflared" "%ProgramFiles(x86)%\cloudflared" "%LOCALAPPDATA%\Microsoft\WinGet\Links") do (
        if exist "%%~D\cloudflared.exe" set "PATH=%%~D;%PATH%"
    )
    where cloudflared >nul 2>&1 || (echo  cloudflared s-a instalat. Inchide si redeschide terminalul, apoi ruleaza din nou scriptul. & goto :fail)
)

REM --- Variabile locale backend ---------------------------------------
if exist "%BACKEND%\local.env" (
    for /f "usebackq eol=# tokens=1,* delims==" %%A in ("%BACKEND%\local.env") do set "%%A=%%B"
)

REM --- Backend --------------------------------------------------------
call :port_in_use 8080
if errorlevel 1 (
    echo  Pornire backend ^(fereastra "FotoIT Backend"^)...
    start "FotoIT Backend" /d "%BACKEND%" cmd /k "call .\mvnw.cmd spring-boot:run"
) else (
    echo  Backend-ul ruleaza deja.
)

REM --- Frontend in modul productie ------------------------------------
call :port_in_use 3000
if not errorlevel 1 (
    echo  Opresc serverul de dezvoltare de pe portul 3000...
    for /f "tokens=5" %%I in ('netstat -ano ^| findstr /r /c:":3000 .*LISTENING"') do taskkill /PID %%I /T /F >nul 2>&1
    taskkill /FI "WINDOWTITLE eq FotoIT Frontend*" /T /F >nul 2>&1
)
if not exist "%FRONTEND%\.env.local" copy /y "%FRONTEND%\.env.example" "%FRONTEND%\.env.local" >nul

pushd "%FRONTEND%"
if not exist node_modules (
    echo  Instalare dependinte npm...
    call npm install || (popd & echo  [EROARE] npm install a esuat. & goto :fail)
)
echo  Construire frontend pentru productie (dureaza ~1 minut)...
call npm run build >"%FRONTEND%\build.log" 2>&1
if errorlevel 1 (
    popd
    echo  [EROARE] Build-ul a esuat. Detalii in frontend\frontend\build.log
    goto :fail
)
popd
echo  Pornire frontend ^(fereastra "FotoIT Frontend"^)...
start "FotoIT Frontend" /d "%FRONTEND%" cmd /k "npm run start"

REM --- Asteptare servere ----------------------------------------------
echo  Se asteapta pornirea serverelor...
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$d=(Get-Date).AddMinutes(3); foreach($u in 'http://localhost:8080/login','http://localhost:3000/api/health'){ while((Get-Date) -lt $d){ try{ Invoke-WebRequest $u -UseBasicParsing -TimeoutSec 3 | Out-Null; break } catch { if($_.Exception.Response){break}; Start-Sleep 2 } } }"

REM --- Tunel ----------------------------------------------------------
if exist "%TUNNEL_LOG%" del /q "%TUNNEL_LOG%"
if exist "%URL_FILE%" del /q "%URL_FILE%"
taskkill /FI "WINDOWTITLE eq FotoIT Tunnel*" /T /F >nul 2>&1
echo  Pornire tunel Cloudflare ^(fereastra "FotoIT Tunnel"^)...
start "FotoIT Tunnel" cmd /k "cloudflared tunnel --no-autoupdate --url http://localhost:3000 --logfile "%TUNNEL_LOG%""

REM Asteapta link-ul public din log, il salveaza pentru admin si il copiaza in clipboard
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$d=(Get-Date).AddSeconds(60); $url=$null;" ^
  "while(-not $url -and (Get-Date) -lt $d){ Start-Sleep 1; if(Test-Path '%TUNNEL_LOG%'){ $m=Select-String -Path '%TUNNEL_LOG%' -Pattern 'https://(?!api\.)[a-z0-9-]+\.trycloudflare\.com' | Select-Object -First 1; if($m){ $url=$m.Matches[0].Value } } };" ^
  "if($url){ Set-Content -Path '%URL_FILE%' -Value $url -NoNewline -Encoding ascii; Set-Clipboard $url;" ^
  "  Write-Host ''; Write-Host '  ================================================================' -ForegroundColor Yellow;" ^
  "  Write-Host ('   SITE PUBLIC:  ' + $url) -ForegroundColor Green;" ^
  "  Write-Host '   (link-ul a fost copiat in clipboard)' -ForegroundColor DarkGray;" ^
  "  Write-Host '  ================================================================' -ForegroundColor Yellow;" ^
  "  Start-Sleep 4; Start-Process $url }" ^
  "else { Write-Host '  [ATENTIE] Link-ul nu a aparut inca - verifica fereastra FotoIT Tunnel.' -ForegroundColor Yellow }"

echo.
echo  Admin ^(doar pe acest PC^): http://localhost:8080/admin
echo  Link-urile copiate din admin folosesc automat adresa publica.
echo  Oprire: stop-dev.bat
echo.
endlocal
exit /b 0

:port_in_use
netstat -ano | findstr /r /c:":%1 .*LISTENING" >nul 2>&1
exit /b %errorlevel%

:fail
echo.
pause
endlocal
exit /b 1
