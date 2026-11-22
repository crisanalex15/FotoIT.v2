@echo off
REM Porneste backend-ul (Spring Boot, port 8080) si frontend-ul (Next.js, port 3000)
REM fiecare in propria fereastra de consola.

set ROOT=%~dp0

echo Pornire backend (Spring Boot)...
start "FotoIT Backend" cmd /k "cd /d "%ROOT%backend" && mvnw.cmd spring-boot:run"

echo Pornire frontend (Next.js)...
if not exist "%ROOT%frontend\frontend\node_modules" (
    start "FotoIT Frontend" cmd /k "cd /d "%ROOT%frontend\frontend" && npm install && npm run dev"
) else (
    start "FotoIT Frontend" cmd /k "cd /d "%ROOT%frontend\frontend" && npm run dev"
)

echo.
echo Backend:  http://localhost:8080  (admin: /admin)
echo Frontend: http://localhost:3000
echo Inchide ferestrele deschise pentru a opri serverele.
