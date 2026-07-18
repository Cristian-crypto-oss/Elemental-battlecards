# 📖 Guía de Instalación - Elemental Battlecards en Otro PC

## Requisitos Previos
Antes de comenzar, asegúrate de tener instalado en tu PC:
- **Node.js** v18 o superior: https://nodejs.org/
- **PostgreSQL** v12 o superior: https://www.postgresql.org/download/
- **pnpm**: Instala con `npm install -g pnpm`

---

## 🚀 Paso 1: Copiar el Proyecto

### Usar Git (si tienes el repositorio)
```powershell
git clone <URL_DEL_REPOSITORIO>
cd Elemental-battlecards
```

---

## ⚙️ Paso 2: Instalar Dependencias del Backend

```powershell
# Navega a la carpeta Backend
cd Backend

# Instala las dependencias
pnpm install

# Verifica que se instaló correctamente
pnpm --version
```

**Tiempo estimado:** 2-3 minutos

**✓ Completado cuando:** Ves la carpeta `node_modules` creada

---

## 🗄️ Paso 3: Configurar la Base de Datos PostgreSQL

### 3.1 Verificar que PostgreSQL esté instalado
```powershell
# Abre PowerShell y ejecuta:
psql --version
```

### 3.2 Crear el archivo `.env`

En la carpeta **Backend**, crea un archivo llamado `.env` con el siguiente contenido:

```env
DB_ENABLED=true
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASS=123456.
DB_NAME=elemental_battlecards
DB_USE_SQLITE=false
DB_REQUIRE_SSL=false
JWT_SECRET=tu_secreto_super_seguro
NODE_ENV=development
```

**⚠️ Importante:** 
- Cambia `DB_PASS` si tu contraseña de PostgreSQL es diferente
- El puerto 5432 es el puerto por defecto de PostgreSQL

### 3.3 Verificar conexión a PostgreSQL
```powershell
# Desde la carpeta Backend:
psql -U postgres -c "SELECT 1;"

# Si funciona, verás:
# ?column?
# ----------
#        1
```

---

## 🔄 Paso 4: Sincronizar la Base de Datos

```powershell
# Desde la carpeta Backend:
node sync-db.js
```

**Esperado ver:**
```
🔄 Sincronizando base de datos...
✓ Base de datos sincronizada correctamente
📝 Creando usuario admin...
✓ Usuario admin creado:
  Email: admin@admin.com
  Contraseña: 12345678

✓✓✓ Sincronización completada ✓✓✓
```

**✓ Completado cuando:** El script termina sin errores

---

## 🎮 Paso 5: Instalar Dependencias y Ejecutar Frontend

### 5.1 Instalar dependencias
```powershell
# Abre una NUEVA terminal PowerShell
# Navega a la carpeta Frontend
cd Frontend

# Instala las dependencias
pnpm install
```

**Tiempo estimado:** 2-3 minutos

### 5.2 Iniciar el servidor Frontend
```powershell
# Desde la carpeta Frontend:
pnpm dev
```

**Esperado ver:**
```
  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

**✓ Completado cuando:** El servidor está ejecutándose sin errores

---

## 🔌 Paso 6: Ejecutar Backend y Probar

### 6.1 Iniciar el servidor Backend

```powershell
# Abre una NUEVA terminal PowerShell
# Navega a la carpeta Backend
cd Backend

# Inicia el servidor
pnpm dev
```

**Esperado ver:**
```
[nodemon] starting `node server.js`
DB conectado (connectDB) y SSL: true
Rutas de autenticación habilitadas
============================================================
🌐 SERVIDOR BACKEND INICIADO
============================================================
📍 Direcciones disponibles:
   Local:     http://localhost:3001
   Local:     http://127.0.0.1:3001
```

### 6.2 Acceder a la aplicación
1. Abre tu navegador
2. Ve a: **http://localhost:5173/**
3. Deberías ver la pantalla de Login

### 6.3 Probar Login
- **Usuario:** `admin`
- **Contraseña:** `12345678`

O **Registrar una nueva cuenta**

**✓ Sistema completamente funcional cuando:**
- ✅ Puedes hacer login con `admin` / `12345678`
- ✅ Puedes registrar un nuevo usuario
- ✅ La PreloadScreen aparece después de login
- ✅ Accedes al MainMenu

---

## 🐛 Solución de Problemas

### Error: "Port 3001 already in use"
```powershell
# Cambia el puerto en Backend/.env:
PORT=3002
```

### Error: "Cannot connect to PostgreSQL"
```powershell
# Verifica que PostgreSQL esté corriendo:
# En Windows, abre Services y busca "PostgreSQL"
# Debe estar en estado "Running"
```

### Error: "Table users doesn't exist"
```powershell
# Ejecuta de nuevo:
cd Backend
node sync-db.js
```

### Error: "Cannot find module"
```powershell
# Limpia e instala nuevamente:
rm -r node_modules package-lock.yaml
pnpm install
```

---

## 📊 Verificar que Todo Funciona

### Test 1: Backend accesible
```powershell
# Abre una terminal y ejecuta:
curl http://localhost:3001/ping

# Deberías ver una respuesta JSON
```

### Test 2: Frontend cargando
```powershell
# Abre en tu navegador:
http://localhost:5173/

# Deberías ver la pantalla de Login
```

### Test 3: Autenticación funciona
```powershell
# Desde la carpeta Backend:
node test-auth.js

# Deberías ver todas las pruebas en verde ✓
```

---

## 📱 Acceder desde Otra Máquina en la Red

Si quieres que otros en tu red accedan al proyecto:

### 1. Obtén tu IP LAN
```powershell
ipconfig

# Busca "IPv4 Address" (ejemplo: 192.168.1.2)
```

### 2. Accede desde otra máquina
- Frontend: `http://192.168.1.2:5173/`
- Backend API: `http://192.168.1.2:3001/`

### 3. Actualizar URLs del Frontend (si es necesario)
Edita estos archivos si usas una IP diferente a `localhost`:
- `Frontend/src/components/LoginForm.vue` - línea 125
- `Frontend/src/components/RegisterForm.vue` - línea 137

Cambia:
```javascript
// De:
const API_URL = 'http://localhost:3001/api/auth/login';

// A:
const API_URL = 'http://192.168.1.2:3001/api/auth/login';
```

---

## ✅ Checklist Final

Marca cada paso conforme lo completes:

- [ ] Node.js instalado (`node --version`)
- [ ] PostgreSQL instalado y corriendo
- [ ] pnpm instalado (`pnpm --version`)
- [ ] Proyecto copiado a tu PC
- [ ] Paso 1: Carpeta copiada ✓
- [ ] Paso 2: Dependencias Backend instaladas ✓
- [ ] Paso 3: Archivo `.env` configurado ✓
- [ ] Paso 4: Base de datos sincronizada ✓
- [ ] Paso 5: Dependencias Frontend instaladas ✓
- [ ] Paso 5: Frontend ejecutándose en puerto 5173 ✓
- [ ] Paso 6: Backend ejecutándose en puerto 3001 ✓
- [ ] Login con admin funciona ✓
- [ ] Registro de usuario funciona ✓
- [ ] PreloadScreen aparece ✓
- [ ] MainMenu se muestra ✓

---

## 🆘 ¿Necesitas Ayuda?

Si encuentras algún problema:
1. Revisa el archivo `Backend/test-auth.js` para verificar endpoints
2. Revisa la consola del navegador (F12) para errores Frontend
3. Revisa la terminal del Backend para errores de conexión

---

**¡Listo! Disfruta Elemental Battlecards 🎮**
