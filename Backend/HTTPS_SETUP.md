# Configuración HTTPS para Backend

## Por qué HTTPS es necesario

Cuando accedes a la aplicación frontend a través de HTTPS (como con DevTunnels), el navegador bloqueará automáticamente todas las solicitudes HTTP al backend por razones de seguridad (Mixed Content policy).

## Opción 1: Generar Certificados SSL Auto-firmados (Local)

### En Windows:

1. **Con WSL (recomendado):**
   ```powershell
   wsl openssl req -x509 -newkey rsa:2048 -nodes -keyout Backend\key.pem -out Backend\cert.pem -days 365
   ```

2. **O ejecutar el script Node:**
   ```powershell
   cd Backend
   npm run gen-certs
   ```

### En macOS / Linux:

```bash
cd Backend
openssl req -x509 -newkey rsa:2048 -nodes -keyout key.pem -out cert.pem -days 365
```

O usar el script:
```bash
npm run gen-certs
```

## Opción 2: Usar DevTunnels con HTTPS

Si usas DevTunnels para acceder a tu backend, puedes configurar:

1. **Instala mkcert para certificados locales confiables:**
   ```powershell
   choco install mkcert
   ```

2. **Genera certificados:**
   ```powershell
   mkcert -install
   mkcert localhost 127.0.0.1
   ```

3. **Copia los certificados al Backend:**
   ```powershell
   cp localhost.pem Backend/cert.pem
   cp localhost-key.pem Backend/key.pem
   ```

## Opción 3: Producción - Certificados Reales

Para producción, usa un proveedor de certificados confiables como:
- Let's Encrypt (gratuito)
- Comodo
- DigiCert

## Verificar Configuración

Después de generar los certificados:

1. **Verifica que existan:**
   ```powershell
   ls Backend/cert.pem Backend/key.pem
   ```

2. **Inicia el servidor:**
   ```powershell
   cd Backend
   npm start
   ```

3. **Verifica el log:**
   - Si ves "Servidor HTTPS inicializado" → ✅ HTTPS activo
   - Si ves "Servidor HTTP inicializado" → El archivo de certificados no se encontró

## Variables de Entorno

En `.env`, puedes especificar rutas personalizadas:

```env
CERT_FILE=./cert.pem
KEY_FILE=./key.pem
```

## Solución de Problemas

### "Mixed Content" error en navegador

**Causa:** Frontend (HTTPS) intenta conectar a Backend (HTTP)

**Solución:** 
1. Asegúrate de generar los certificados
2. Verifica que el Backend esté escuchando en HTTPS
3. El Frontend debe usar `https://` en lugar de `http://`

### "ERR_SSL_PROTOCOL_ERROR"

**Causa:** Certificado auto-firmado no es reconocido por el navegador

**Solución:** 
- En navegador Chrome, puedes ir a `https://localhost:3001/ping` y aceptar el certificado
- Para producción, obtén un certificado verificado

### "Certificados no encontrados"

**Causa:** Los archivos `cert.pem` y `key.pem` no existen

**Solución:** Ejecuta `npm run gen-certs` en la carpeta Backend

## Local vs Remote

- **Local (localhost):** HTTP funciona bien
- **DevTunnels/Remote:** HTTPS requerido → usa certificados SSL

## Próximos Pasos

Una vez configurado HTTPS:

1. ✅ El Frontend puede conectar sin Mixed Content errors
2. ✅ WebSocket (Socket.IO) también funciona por HTTPS
3. ✅ Listo para DevTunnels o cualquier dominio remoto
