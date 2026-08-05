# Script para iniciar el backend en modo DEVTUNNELS (HTTPS)
Write-Host "🚀 Iniciando servidor backend en modo DEVTUNNELS (HTTPS)..." -ForegroundColor Cyan

# Hacer backup del .env actual
Copy-Item -Path ".env" -Destination ".env.backup" -Force -ErrorAction SilentlyContinue

# Copiar configuración DevTunnels
if (Test-Path ".env.devtunnels") {
    Copy-Item -Path ".env.devtunnels" -Destination ".env" -Force
    Write-Host "✅ Configuración DEVTUNNELS aplicada (HTTPS)" -ForegroundColor Green
} else {
    Write-Host "⚠️ Archivo .env.devtunnels no encontrado" -ForegroundColor Yellow
    Write-Host "Aplicando configuración HTTPS manualmente..." -ForegroundColor Yellow
    
    $envContent = Get-Content ".env" -Raw
    $envContent = $envContent -replace "USE_HTTPS=false", "USE_HTTPS=true"
    Set-Content ".env" -Value $envContent
}

Write-Host ""
Write-Host "📍 IMPORTANTE: Debes exponer el puerto 3000 con DevTunnels" -ForegroundColor Yellow
Write-Host "   Ejecuta en otra terminal: devtunnel port create -p 3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "🌐 El servidor estará disponible en: https://[tu-tunnel-id]-3000.use.devtunnels.ms" -ForegroundColor Green
Write-Host ""

# Iniciar servidor
node server.js
