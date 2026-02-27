@echo off
title MKT SLIM GAME B2B Simulator
color 0B
echo.
echo  ================================================
echo   MKT SLIM GAME B2B Simulator
echo   Motor de Simulacion de Marketing Estrategico
echo  ================================================
echo.

:: Verificar si Node.js está instalado
where node >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo  [OK] Node.js detectado. Iniciando servidor Express...
    echo  Abre tu navegador en: http://localhost:3000
    echo  Presiona Ctrl+C para detener el servidor.
    echo.
    node server.js
) else (
    echo  [INFO] Node.js no encontrado. Usando servidor Python...
    where python >nul 2>nul
    if %ERRORLEVEL% EQU 0 (
        echo  Abre tu navegador en: http://localhost:8765
        echo  Presiona Ctrl+C para detener el servidor.
        echo.
        python -m http.server 8765
    ) else (
        echo  [ERROR] No se encontro Node.js ni Python instalados.
        echo  Por favor instala Node.js desde https://nodejs.org
        pause
        exit /b 1
    )
)

pause
