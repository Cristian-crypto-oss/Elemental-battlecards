# 🎮 Cómo Jugar en LAN - Elemental Battlecards

Esta guía te ayudará a configurar y jugar **Elemental Battlecards** en una red local (LAN) con un amigo.

---

## 📋 Requisitos Previos

- **Node.js** versión 14 o superior instalado en ambas computadoras
- Ambas computadoras conectadas a la **misma red local** (WiFi o Ethernet)
- Puertos **3000** (Backend) y **5173** (Frontend) disponibles

---

## 🖥️ Configuración del Servidor (Anfitrión)

### 1. Preparar el Backend

```powershell
cd Backend
npm install
```

### 2. Configurar Variables de Entorno

Verifica que el archivo `Backend/.env` existe con la configuración correcta:

```env
PORT=3000
DB_USE_SQLITE=true
DB_SQLITE_PATH=./elemental_battlecards.sqlite
JWT_SECRET=tu_secreto_super_secreto_y_largo
USE_HTTPS=false
FORCE_HTTP=false
```

### 3. Iniciar el Servidor Backend

```powershell
cd Backend
npm start
```

Deberías ver el mensaje:
```
[SERVER] Servidor escuchando en 0.0.0.0:3000
```

### 4. Obtener la IP Local del Servidor

**En Windows (PowerShell):**
```powershell
ipconfig
```

Busca la línea **"Dirección IPv4"** en tu adaptador de red activo. Por ejemplo:
```
Dirección IPv4. . . . . . . . . . . : 192.168.1.100
```

**En Linux/Mac:**
```bash
ifconfig
```
o
```bash
ip addr show
```

Anota esta IP, por ejemplo: **`192.168.1.100`**

### 5. Iniciar el Frontend

En otra terminal:

```powershell
cd Frontend
npm install
npm run dev
```

El servidor de desarrollo mostrará:
```
Local:   http://localhost:5173
Network: http://192.168.1.100:5173
```

---

## 👥 Cómo Conectarse (Ambos Jugadores)

### **Jugador 1 (Anfitrión - Host)**

1. Abre el navegador en `http://localhost:5173`
2. Inicia sesión o regístrate
3. En el menú principal, selecciona **"Juego en Red (LAN)"**
4. Haz clic en **"Crear Sala"**
5. Se generará un código de 6 dígitos (ej: **123 456**)
6. **Comparte este código** con el Jugador 2
7. Espera a que el segundo jugador se una
8. El juego iniciará automáticamente cuando ambos estén conectados

### **Jugador 2 (Invitado - Guest)**

1. Abre el navegador en `http://[IP_DEL_ANFITRION]:5173`
   - Por ejemplo: `http://192.168.1.100:5173`
2. Inicia sesión o regístrate
3. En el menú principal, selecciona **"Juego en Red (LAN)"**
4. En el panel derecho, ingresa el **código de 6 dígitos** que te compartió el anfitrión
5. Haz clic en **"Unirse a Sala"**
6. El juego iniciará automáticamente

---

## 🎯 Sistema de Turnos

- El **anfitrión (host)** siempre comienza primero
- Los turnos se alternan automáticamente
- Cada jugador tiene **12 segundos** por turno
- Las acciones realizadas se sincronizan en tiempo real

---

## 🔧 Solución de Problemas

### ❌ "No se puede conectar al servidor"

**Causa:** El Frontend no encuentra el Backend.

**Solución:**
1. Verifica que el Backend esté corriendo en el puerto 3000
2. Comprueba que ambas computadoras están en la misma red
3. Asegúrate de usar la IP correcta del anfitrión
4. Verifica que el firewall no bloquee los puertos 3000 y 5173

**Para configurar el firewall en Windows:**
```powershell
# Permitir puerto 3000 (Backend)
netsh advfirewall firewall add rule name="Elemental Battlecards Backend" dir=in action=allow protocol=TCP localport=3000

# Permitir puerto 5173 (Frontend)
netsh advfirewall firewall add rule name="Elemental Battlecards Frontend" dir=in action=allow protocol=TCP localport=5173
```

### ❌ "Sala no encontrada"

**Causa:** El código ingresado es incorrecto o la sala fue eliminada.

**Solución:**
1. Verifica que el código de 6 dígitos sea correcto
2. Asegúrate de que el anfitrión haya creado la sala antes de intentar unirte
3. Si el anfitrión cerró su navegador, deberá crear una nueva sala

### ❌ "Sala llena"

**Causa:** Ya hay 2 jugadores en la sala.

**Solución:**
- Cada sala solo admite 2 jugadores
- El anfitrión debe crear una nueva sala para diferentes jugadores

### ❌ Las acciones no se sincronizan

**Causa:** Problema de conexión o latencia de red.

**Solución:**
1. Verifica la estabilidad de tu conexión de red
2. Comprueba los logs de la consola del navegador (F12)
3. Reinicia el Backend y reconecta ambos clientes

---

## 📊 Estados del Juego

| Estado | Descripción |
|--------|-------------|
| **Esperando jugador...** | La sala tiene solo 1 jugador |
| **Jugador conectado!** | Ambos jugadores están en la sala |
| **Tu turno** | Es tu turno para jugar |
| **Turno del oponente** | Espera a que el oponente termine su turno |

---

## 🎮 Controles del Juego

- **Clic izquierdo:** Seleccionar carta
- **Arrastrar carta de la mano a un slot:** Jugar carta
- **Clic en carta del campo + clic en carta enemiga:** Atacar
- **Clic en dos cartas propias del campo:** Fusionar (mismo tipo y nivel)

---

## 📝 Notas Importantes

- **No cierres la pestaña del navegador** durante la partida
- Si un jugador se desconecta, la partida terminará
- Las partidas se guardan solo mientras los jugadores están conectados
- Cada sala tiene un código único de 6 dígitos

---

## 🚀 Ejecución Rápida (Para Desarrollo)

**Terminal 1 (Backend):**
```powershell
cd Backend
npm run dev
```

**Terminal 2 (Frontend):**
```powershell
cd Frontend
npm run dev
```

---

## 📞 Soporte

Si encuentras problemas:
1. Verifica los logs de la consola (F12 en el navegador)
2. Comprueba que el Backend esté corriendo (`http://[IP]:3000/ping`)
3. Revisa que ambas máquinas estén en la misma red local

---

## 🎉 ¡Disfruta el Juego!

¡Ahora estás listo para disfrutar de **Elemental Battlecards** en LAN con tus amigos!


---

## ⚠️ Notas Técnicas

### Puertos Utilizados
- **Backend:** Puerto 3000 (HTTP)
- **Frontend:** Puerto 5173 (Vite dev server)

### Configuración del Socket

**IMPORTANTE:** El frontend se conecta automáticamente al backend detectando la URL desde la cual se accede:

- **Host (anfitrión):** Si accedes desde `http://localhost:5173` → Backend: `http://localhost:3000` ✅
- **Invitado (guest):** Si accedes desde `http://192.168.1.12:5173` → Backend: `http://192.168.1.12:3000` ✅

**Esto significa que el frontend y backend DEBEN estar en la misma máquina.**

### ⚠️ Problema Común: "Se queda uniéndose"

Si el invitado ingresa el código y se queda en "Uniéndose...", probablemente es porque:

1. **El backend no está accesible desde la IP del invitado**
   - Verifica que el firewall permita las conexiones (ver comandos arriba)
   - Prueba hacer ping: `ping 192.168.1.12`
   - Prueba acceder manualmente: Abre `http://192.168.1.12:3000/ping` en el navegador del invitado

2. **El backend está corriendo solo en localhost**
   - El archivo `server.js` debe escuchar en `0.0.0.0` (todas las interfaces)
   - Verifica en los logs del backend: `[SERVER] Servidor escuchando en 0.0.0.0:3000`

3. **Puerto bloqueado**
   - Ejecuta los comandos del firewall (ver sección de Solución de Problemas)

### Verificación Rápida (Invitado)

Antes de intentar unirte a una sala, abre la consola del navegador (F12) y verifica:

```
[RoomCreateModal] ✅ Socket conectado exitosamente! ID: xxxxx
[RoomCreateModal] Backend URL: http://192.168.1.12:3000
```

Si ves `❌ Error de conexión`, el backend no es accesible desde esa IP.

### Sistema de Salas
- Las salas se identifican con códigos de 6 dígitos numéricos
- Máximo 2 jugadores por sala
- El anfitrión (host) siempre es el Jugador 1
- El invitado (guest) siempre es el Jugador 2
- Las salas se eliminan automáticamente cuando ambos jugadores se desconectan
