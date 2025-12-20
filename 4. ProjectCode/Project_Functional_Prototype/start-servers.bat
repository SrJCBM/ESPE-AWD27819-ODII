@echo off
echo Iniciando servidores de TravelBrain...
echo.

REM Verificar que PHP está instalado
where php >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: PHP no está instalado o no está en el PATH
    echo Por favor instala PHP o agrégalo al PATH del sistema
    pause
    exit /b 1
)

REM Iniciar servidor Node.js en segundo plano
echo [1/2] Iniciando servidor Node.js en puerto 3004...
start /B cmd /c "node index.js > node.log 2>&1"
timeout /t 2 /nobreak >nul

REM Iniciar servidor PHP en segundo plano  
echo [2/2] Iniciando servidor PHP en puerto 8000...
start /B cmd /c "php -S localhost:8000 -t public public/index.php > php.log 2>&1"
timeout /t 2 /nobreak >nul

echo.
echo ========================================
echo   Servidores iniciados correctamente
echo ========================================
echo.
echo   Node.js (APIs):  http://localhost:3004
echo   PHP (Frontend):  http://localhost:8000
echo.
echo   Google OAuth:    http://localhost:8000/auth/login
echo.
echo Presiona Ctrl+C para detener los servidores
echo.

REM Mantener la ventana abierta
pause
