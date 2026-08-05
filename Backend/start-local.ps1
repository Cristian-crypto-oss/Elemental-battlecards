# Script para iniciar el backend en modo LOCAL (HTTP)
Write-Host "🚀 Iniciando servidor backend en modo LOCAL (HTTP)..." -ForegroundColor Cyan

# Copiar configuración local
Copy-Item -Path ".env" -Destination ".env.backup" -Force -ErrorAction SilentlyContinue
$envContent = Get-Content ".env" -Raw
if ($envContent -notmatch "USE_HTTPS=false") {
    $envContent = $envContent -replace "USE_HTTPS=true", "USE_HTTPS=false"
    Set-Content ".env" -Value $envContent
}

Write-Host "✅ Configuración LOCAL aplicada (HTTP)" -ForegroundColor Green
Write-Host "📍 El servidor estará disponible en: http://localhost:3000" -ForegroundColor Yellow
Write-Host ""

# Iniciar servidor
node server.js
