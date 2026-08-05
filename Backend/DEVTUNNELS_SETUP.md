# Configuración de DevTunnels para Backend

## Problema
Cuando usas DevTunnels, el frontend y backend deben estar en subdominios diferentes:
- Frontend: `https://x5v4c69f-5173.use.devtunnels.ms`
- Backend: `https://x5v4c69f-3000.use.devtunnels.ms`

Además, el backend debe usar **HTTPS** para DevTunnels.

## Solución Rápida

### Opción 1: Usar scripts PowerShell (Recomendado)

#### Para desarrollo LOCAL (HTTP):
```powershell
cd Backend
.\start-local.ps1
```

#### Para desarrollo con DEVTUNNELS (HTTPS):
```powershell
cd Backend
.\start-devtunnel.ps1
```

### Opción 2: Manual

1. **Editar `.env` y cambiar**:
   ```
   USE_HTTPS=true
   ```

2. **Reiniciar el servidor**:
   ```powershell
   node server.js
   ```

3. **Exponer el puerto 3000 con DevTunnels**:
   ```powershell
   # En otra terminal
   devtunnel port create -p 3000
   ```

## Verificar que funciona

1. El servidor debe mostrar: `Servidor HTTPS inicializado`
2. Debes tener dos túneles activos:
   - Puerto 5173 (Frontend)
   - Puerto 3000 (Backend)

3. En el navegador, la URL del backend construida debe ser:
   ```
   https://x5v4c69f-3000.use.devtunnels.ms
   ```

## Comandos de DevTunnels útiles

```powershell
# Listar túneles activos
devtunnel list

# Crear túnel para el puerto 3000
devtunnel port create -p 3000

# Eliminar túnel
devtunnel delete [tunnel-id]

# Ver puertos expuestos
devtunnel port list
```

## Logs para debugging

El backend ahora tiene logs detallados. Busca en la consola:
```
[CORS] Request from origin: https://x5v4c69f-5173.use.devtunnels.ms
```

Si ves esto, significa que el CORS está funcionando correctamente.

## Volver a desarrollo local

Simplemente ejecuta:
```powershell
.\start-local.ps1
```

O edita `.env` y cambia:
```
USE_HTTPS=false
```
