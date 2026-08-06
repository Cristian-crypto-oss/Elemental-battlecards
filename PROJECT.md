# PROJECT PROMPT — Elemental Battlecards
> Documento de contexto para agentes de IA. Léelo antes de tocar cualquier archivo.

---

## ¿Qué es este proyecto?

**Elemental Battlecards (EBC)** es un juego de cartas estratégico digital 1v1 inspirado en la **Teoría de Conjuntos**. Cada mecánica del sistema corresponde a una operación matemática formal (unión, intersección, diferencia, complemento). El stack es un híbrido **Vue 3 + Phaser 3** en el Frontend y **Node.js + Express + Socket.IO + Sequelize** en el Backend.

El proyecto está en medio de una **migración activa**: las pantallas de UI (login, registro, menú) se están moviendo de escenas Phaser puras a componentes Vue 3, mientras las escenas de juego real permanecen en Phaser.

---

## Estructura de Carpetas

```
Elemental-battlecards/
├── Backend/                        ← Servidor Node.js
│   ├── config/
│   │   ├── config.js               ← Lee variables de entorno (.env)
│   │   ├── config.json             ← Config de Sequelize por entorno
│   │   └── db.js                   ← Conexión Sequelize (SQLite local / PostgreSQL prod)
│   ├── controllers/
│   │   └── authController.js       ← Lógica de login y registro (bcrypt + JWT)
│   ├── migrations/
│   │   └── 20251208123257-create-users-table.js   ← Migración de la tabla users
│   ├── models/
│   │   ├── index.js                ← Carga y asocia todos los modelos Sequelize
│   │   └── user.js                 ← Modelo User (id, username, email, passwordHash)
│   ├── routes/
│   │   └── authRoutes.js           ← POST /api/auth/login   POST /api/auth/register
│   ├── server.js                   ← Punto de entrada: Express + Socket.IO + DB connect
│   ├── socketManager.js            ← Lógica de salas Socket.IO (crear/unirse/iniciar partida)
│   ├── .env.example                ← Variables de entorno requeridas
│   └── package.json                ← Express, Sequelize, bcryptjs, jsonwebtoken, socket.io
│
└── Frontend/                       ← Cliente Vite + Vue 3 + Phaser 3
    ├── index.html                  ← HTML raíz; monta <div id="app">
    ├── public/
    │   └── assets/
    │       └── images/
    │           ├── cartas/         ← PNGs de todas las cartas (carta-fuego-1.png … carta-espiritu-3.png)
    │           │                     + abajo.png (reverso), baraja-jugador.png, baraja-oponente.png
    │           ├── campo juego/    ← campo.mp4 + campo.png  (fondo del tablero)
    │           ├── inicio/         ← inicio.mp4 (video de fondo login/registro)
    │           ├── home.mp4        ← Video de fondo del menú principal
    │           ├── fondo.png       ← Imagen estática de fondo (Vue components)
    │           ├── logo.png        ← Logo circular del juego
    │           └── Logotipoletras.png  ← Logo con letras
    └── src/
        ├── main.js                 ← Crea la app Vue, monta Pinia, monta en #app
        ├── phaser-main.js          ← Instancia Phaser.Game con todas las escenas registradas
        ├── App.vue                 ← Root Vue: orquesta qué pantalla mostrar con currentScreen ref
        │
        ├── components/             ← Componentes Vue (pantallas de UI migradas desde Phaser)
        │   ├── LoginForm.vue       ← Pantalla de login (activa, conectada a /api/auth/login)
        │   ├── RegisterForm.vue    ← Pantalla de registro (activa, conectada a /api/auth/register)
        │   ├── MainMenu.vue        ← STUB — pendiente implementar
        │   ├── RoomCreateModal.vue ← STUB — pendiente implementar
        │   ├── PreloadScreen.vue   ← STUB — pendiente implementar
        │   └── AuthContainer.vue   ← Wrapper de autenticación (sin uso activo aún)
        │
        ├── stores/                 ← Pinia stores
        │   ├── authStore.js        ← user, token, isAuthenticated, setUser, logout
        │   └── gameStore.js        ← Estado de sala y partida actual
        │
        ├── scenes/                 ← Escenas Phaser 3
        │   ├── Preloader.js        ← Carga assets de cartas → luego va a LoginScene
        │   ├── bootScene.js        ← Boot inicial (vacío / pendiente)
        │   ├── preloaderScene.js   ← Variante del preloader (revisar duplicado)
        │   ├── LoginScene.js       ← Login completo en Phaser con DOM overlay
        │   ├── RegisterScene.updated.js  ← Registro en Phaser con DOM overlay
        │   ├── homeScenes.js       ← Menú principal: Jugar LAN, Jugar vs Bot, stats, modales
        │   ├── mainMenu.js         ← VACÍO — placeholder para nueva escena de menú
        │   ├── createRoomScene.js  ← Crear/unirse a sala + Socket.IO client
        │   ├── GameScene.js        ← Escena de juego principal (vs Bot y LAN)
        │   ├── GameSceneLAN.js     ← Variante LAN de la escena de juego
        │   └── uiScene.js          ← HUD: timer, turno, esencias, game-over overlay
        │
        ├── game_objects/           ← Clases del modelo de juego
        │   ├── card-definitions.js ← Definiciones de todas las cartas (tipo, nivel, stats)
        │   ├── card.js             ← Clase Card (Phaser.GameObjects.Image + datos)
        │   ├── deck.js             ← Clase Deck (baraja, robar, mezclar, cementerio)
        │   ├── player.js           ← Clase Player (mano, campo, esencias, lógica de robo)
        │   └── essences.js         ← Clase Essences (6 esencias elementales por jugador)
        │
        ├── services/               ← Servicios desacoplados (patrón DIP)
        │   ├── gameEngine.js       ← Motor de reglas: turnos, ataques, fusiones, victoria
        │   ├── botEngine.js        ← IA del bot: decide acción óptima cada turno
        │   └── networkManager.js   ← Abstracción Socket.IO (emit / on de eventos de juego)
        │
        └── helpers/                ← Utilidades puras
            ├── constants.js        ← CARD_TYPES, ELEMENT_ADVANTAGES, etc.
            ├── combat.js           ← resolveCombat(cardA, cardB) → resultado
            └── zone.js             ← calculateRowPositions() para layout del tablero
```

---

## Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend UI | Vue 3 (Composition API) + Pinia |
| Frontend Juego | Phaser 3.90 |
| Build tool | Vite 5 |
| HTTP Client | Axios |
| Tiempo real | Socket.IO Client 4.7 |
| Backend | Node.js + Express 4 |
| ORM | Sequelize 6 |
| DB (local) | SQLite3 |
| DB (prod) | PostgreSQL |
| Autenticación | bcryptjs + JWT (jsonwebtoken) |
| Tiempo real BE | Socket.IO 4.7 |
| Dev runner | nodemon |

---

## Flujo de Pantallas

```
Preloader (Phaser)
    └─► LoginScene (Phaser DOM)  ◄──────────────────────────────┐
            │ SUMMON (login ok)                                  │
            │ FORGE ACCOUNT → RegisterScene (Phaser DOM)         │
            ↓                                                    │
        HomeScenes (Phaser DOM)   ← menú principal              │
            ├─► CreateRoomScene (Phaser DOM) → GameSceneLAN      │
            ├─► GameScene (vs Bot)                               │
            ├─► MainMenuScene.js  ← NUEVA                        │
            ├─► ProfileScene.js   ← NUEVA                        │
            ├─► SettingsScene.js  ← NUEVA                        │
            └─► CreditsScene.js   ← NUEVA                        │
                                                                 │
    [Todas las escenas anteriores pueden volver a LoginScene] ───┘

App.vue gestiona un ref `currentScreen` con los valores:
  'login' | 'register' | 'preload' | 'menu' | 'create-room' | 'game'
Las escenas Phaser se lanzan SOLO cuando currentScreen === 'game'.
```

---

## API Backend

### Autenticación
| Método | Ruta | Body | Respuesta |
|--------|------|------|-----------|
| POST | `/api/auth/register` | `{ username, email, password }` | `{ token, user }` |
| POST | `/api/auth/login` | `{ username, password }` | `{ token, user }` |
| GET | `/ping` | — | `{ ok: true, time, host }` |

### Socket.IO (eventos de sala)
| Evento (emit) | Payload | Respuesta (callback) |
|---------------|---------|----------------------|
| `create_room` | — | `{ success, code, role: 'host' }` |
| `join_room` | `{ code }` | `{ success, code, role: 'guest' }` |

| Evento (on) | Payload |
|-------------|---------|
| `room_created` | `{ code }` |
| `player_joined` | `{ players, canStart }` |
| `game_start` | datos de inicio de partida |
| `player_left` | — |
| `game_event` | payload de acción de juego |

---

## Variables de Entorno (Backend)

```env
PORT=3001
DB_ENABLED=false          # true para habilitar auth con BD
DB_DIALECT=sqlite         # sqlite | postgres
DB_STORAGE=./database.sqlite  # solo SQLite
# PostgreSQL:
DB_HOST=
DB_PORT=5432
DB_NAME=
DB_USER=
DB_PASS=
DB_REQUIRE_SSL=false
JWT_SECRET=tu_secreto_aqui
```

---

## Mecánicas del Juego (resumen)

- **6 tipos elementales**: Fuego, Agua, Planta, Luz, Sombra, Espíritu
- **2 triángulos de ventaja**: Fuego>Planta>Agua>Fuego | Luz>Sombra>Espíritu>Luz
- **3 niveles de carta**: Nivel 1 (base) → Nivel 2 (fusión de 2×N1) → Nivel 3 (fusión de 2×N2)
- **1 acción por turno**: jugar carta, atacar, o fusionar
- **Turnos de 12 segundos**: si el jugador no actúa, el turno pasa automáticamente
- **Ataque obligatorio**: cada 3 turnos sin atacar, el jugador debe atacar sí o sí
- **Cartas boca abajo**: se revelan solo al atacar, ser atacadas, o fusionarse
- **Victoria**: completar los 6 tipos distintos en el campo, llenar las 6 esencias, o derrota por abandono (3 turnos sin acción)

---

## Convenciones de Código

### Phaser (escenas)
- Toda escena extiende `Phaser.Scene` y tiene `constructor`, `preload`, `create`, y opcionalmente `update`/`resize`
- Los videos de fondo siempre se configuran así:
  ```js
  this.bg = this.add.video(width/2, height/2, 'key').setOrigin(0.5);
  this.bg.setDepth(-1);
  this.bg.on('play', () => {
      const scale = Math.max(width/this.bg.width, height/this.bg.height);
      this.bg.setScale(scale);
  });
  this.bg.play(true);
  ```
- Los overlays HTML se crean con `this.add.dom(0,0).createFromHTML(html).setOrigin(0,0)`
- Los nodos DOM siempre se posicionan con `style.position="absolute"`, `left=0`, `top=0`, `width/height` explícitos
- Navegación entre escenas: `this.scene.start('NombreEscena', { datos })` o `this.scene.switch`
- Colores del tema: naranja `#ff5b26`, dorado `#F2CA50`, fondo oscuro `#121414`, acento rojo `#ffaba2`
- Fuentes: `Cinzel` (títulos), `Montserrat` (cuerpo), `Libre Caslon Text`, `Hanken Grotesk`

### Vue (componentes)
- Todos usan `<script setup>` (Composition API)
- Los eventos hacia el padre se emiten con `defineEmits` y `emit()`
- El estado global (auth, game) va en stores de Pinia en `src/stores/`
- Las llamadas HTTP usan `axios`, la URL base es `http://localhost:3001`

### Backend
- CommonJS (`require`/`module.exports`), NO ES modules
- Los controladores reciben `(req, res)` y responden con `res.json()`
- Las contraseñas se hashean con `bcryptjs.hash(password, 10)` antes de guardar
- Los tokens JWT se firman con `jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' })`

---

## Estado Actual de la Migración

| Pantalla | Estado | Archivo activo |
|---------|--------|----------------|
| Login | ✅ Funciona (doble impl.) | `LoginScene.js` (Phaser) + `LoginForm.vue` (Vue) |
| Registro | ✅ Funciona (doble impl.) | `RegisterScene.updated.js` (Phaser) + `RegisterForm.vue` (Vue) |
| Menú Principal | ✅ Phaser completo | `homeScenes.js` |
| Crear Sala | ✅ Phaser completo | `createRoomScene.js` |
| Juego | ✅ Phaser completo | `GameScene.js` / `GameSceneLAN.js` |
| MainMenu Vue | 🚧 STUB | `MainMenu.vue` (vacío) |
| Perfil | ❌ No existe | pendiente |
| Configuración | ❌ No existe | pendiente |
| Créditos | ❌ No existe | pendiente |

---

## Tareas Pendientes Prioritarias

1. Completar los stubs Vue: `MainMenu.vue`, `RoomCreateModal.vue`, `PreloadScreen.vue`
2. Crear `ProfileScene.js`, `SettingsScene.js`, `CreditsScene.js` como escenas Phaser
3. Unificar las dobles implementaciones (Phaser + Vue) de Login y Registro
4. Implementar persistencia real de estadísticas (partidas jugadas, ganadas, tiempo)
5. Agregar sistema de logros
6. Implementar recuperación de contraseña
7. Agregar sonidos y música de fondo
8. Tests automatizados

---

## Notas para el Agente

- **Siempre lee un archivo antes de editarlo**. Nunca asumas su contenido.
- Los assets de imágenes están en `Frontend/public/assets/images/`. Se acceden desde la raíz (`/assets/images/...`).
- El Backend **no necesita estar activo** para el modo vs Bot. Solo se necesita para login/registro y modo LAN.
- `DB_ENABLED=false` deshabilita las rutas de auth; el servidor sigue funcionando para Socket.IO.
- La escena `Preloader.js` es el punto de entrada Phaser real; carga assets de cartas y luego salta a `LoginScene`.
- `phaser-main.js` es el archivo donde se registran **todas** las escenas Phaser. Si creas una nueva escena, agrégala ahí.
- `App.vue` controla qué componente Vue se muestra; si agregas una pantalla Vue nueva, edita el `currentScreen` y el template.
- Para pasar datos entre escenas Phaser usa el segundo argumento de `this.scene.start('Escena', { datos })` y recíbelos en `init(data)`.
