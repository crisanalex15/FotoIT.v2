@echo off
setlocal EnableExtensions
title FotoIT - pornire
REM ===================================================================
REM  Porneste toata aplicatia FotoIT:
REM    - backend  Spring Boot  -> http://localhost:8080  (admin: /admin)
REM    - frontend Next.js      -> http://localhost:3000
REM  Rulare: dublu-click sau din terminal:  start-dev.bat
REM  Oprire: stop-dev.bat (sau inchide cele doua ferestre deschise)
REM
REM  Variabile optionale (ADMIN_PASSWORD, GOOGLE_CREDENTIALS_JSON, ...)
REM  se pun in backend\local.env, cate una pe linie: CHEIE=valoare
REM ===================================================================

set "ROOT=%~dp0"
set "BACKEND=%ROOT%backend"
set "FRONTEND=%ROOT%frontend\frontend"

echo.
echo  FotoIT - pornire mediu de dezvoltare
echo  ------------------------------------

REM --- Verificari -----------------------------------------------------
where java >nul 2>&1
if errorlevel 1 (
    echo  [EROARE] Java nu este instalat sau nu este in PATH. Este necesar Java 21.
    goto :fail
)
where npm >nul 2>&1
if errorlevel 1 (
    echo  [EROARE] Node.js / npm nu este instalat sau nu este in PATH.
    goto :fail
)

REM --- Porturi deja ocupate? ------------------------------------------
call :port_in_use 8080
if not errorlevel 1 (
    echo  [ATENTIE] Portul 8080 este deja folosit - probabil backend-ul ruleaza deja.
    echo            Ruleaza stop-dev.bat daca vrei sa il repornesti.
    set "SKIP_BACKEND=1"
)
call :port_in_use 3000
if not errorlevel 1 (
    echo  [ATENTIE] Portul 3000 este deja folosit - probabil frontend-ul ruleaza deja.
    set "SKIP_FRONTEND=1"
)

REM --- Variabile locale pentru backend --------------------------------
if exist "%BACKEND%\local.env" (
    echo  Se incarca variabilele din backend\local.env
    for /f "usebackq eol=# tokens=1,* delims==" %%A in ("%BACKEND%\local.env") do set "%%A=%%B"
)
if not defined ADMIN_PASSWORD (
    echo  [INFO] ADMIN_PASSWORD nu e setata: parola de admin se genereaza la pornire
    echo         si apare in fereastra backend-ului.
)

REM --- Configurare frontend -------------------------------------------
if not exist "%FRONTEND%\.env.local" (
    echo  Se creeaza frontend\frontend\.env.local din .env.example
    copy /y "%FRONTEND%\.env.example" "%FRONTEND%\.env.local" >nul
)

REM --- Pornire --------------------------------------------------------
if not defined SKIP_BACKEND (
    echo  Pornire backend  ^(fereastra "FotoIT Backend"^)...
    start "FotoIT Backend" /d "%BACKEND%" cmd /k "mvnw.cmd spring-boot:run"
)

if not defined SKIP_FRONTEND (
    echo  Pornire frontend ^(fereastra "FotoIT Frontend"^)...
    if exist "%FRONTEND%\node_modules" (
        start "FotoIT Frontend" /d "%FRONTEND%" cmd /k "npm run dev"
    ) else (
        echo  Prima rulare: se instaleaza dependintele npm, poate dura cateva minute.
        start "FotoIT Frontend" /d "%FRONTEND%" cmd /k "npm install && npm run dev"
    )
)

REM --- Asteptare pana raspund serverele, apoi deschidere browser ------
echo.
echo  Se asteapta pornirea serverelor (maxim 3 minute)...
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$deadline=(Get-Date).AddMinutes(3);" ^
  "function Up($u){ try { $r=Invoke-WebRequest -Uri $u -UseBasicParsing -TimeoutSec 3 -MaximumRedirection 0 -ErrorAction Stop; return $true } catch { if($_.Exception.Response){ return $true }; return $false } }" ^
  "$be=$false;$fe=$false;" ^
  "while((Get-Date) -lt $deadline -and -not ($be -and $fe)){" ^
  "  if(-not $be -and (Up 'http://localhost:8080/api/gallery/thumbnail/x')){ $be=$true; Write-Host '  [OK] Backend pornit:  http://localhost:8080' };" ^
  "  if(-not $fe -and (Up 'http://localhost:3000/api/health')){ $fe=$true; Write-Host '  [OK] Frontend pornit: http://localhost:3000' };" ^
  "  if(-not ($be -and $fe)){ Start-Sleep -Seconds 2 } };" ^
  "if(-not $be){ Write-Host '  [ATENTIE] Backend-ul nu raspunde inca - verifica fereastra FotoIT Backend.' };" ^
  "if(-not $fe){ Write-Host '  [ATENTIE] Frontend-ul nu raspunde inca - verifica fereastra FotoIT Frontend.' };" ^
  "if($fe){ Start-Process 'http://localhost:3000' }"

echo.
echo  Site:        http://localhost:3000
echo  Admin:       http://localhost:8080/admin
echo  API docs:    http://localhost:8080/swagger-ui.html  (necesita login admin)
echo  Oprire:      stop-dev.bat
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
