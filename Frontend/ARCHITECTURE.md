# Arquitectura del Frontend - Elemental Battlecards

## Flujo de Vistas y Responsabilidades

Esta aplicación implementa una **separación clara entre Vue (vistas) y Phaser (juego)**.

### Flujo Principal

```
Login (Vue)
  ↓
Registro (Vue) [opcional]
  ↓
Preload (Phaser cargando assets)
  ↓
Menú Principal (Vue)
  ↓
Crear Sala LAN (Vue) ← → Unirse a Sala LAN (Vue)
  ↓
Juego (Phaser)
  ↓
Fin de Partida
  ↓
Menú Principal (Vue)
```

## Responsabilidades

### Vue (Vistas y Navegación)

Vue se encarga de **toda la navegación y cambios de vistas**:

1. **App.vue** - Orquestador central
   - Controla el estado de la pantalla actual (`currentScreen`)
   - Maneja transiciones entre vistas
   - Inicializa Phaser solo cuando es necesario

2. **Componentes de Vistas**
   - `LoginForm.vue` - Autenticación
   - `RegisterForm.vue` - Creación de cuenta
   - `PreloadScreen.vue` - Carga de assets
   - `MainMenu.vue` - Menú principal
   - `RoomCreateModal.vue` - Crear/Unirse a sala LAN

3. **Stores (Pinia)**
   - `authStore.js` - Estado de autenticación y usuario
   - `gameStore.js` - Estado del juego (datos de sala, turnos, etc.)

### Phaser (Juego)

Phaser se encarga **solo de la lógica y visualización del juego**:

1. **Scenes**
   - `Preloader.js` - Carga inicial de assets del juego
   - `GameScene.js` - Escena principal del juego (vs Bot o LAN)
   - `GameSceneLAN.js` - Escena de transición para juego multijugador
   - `UIScene.js` - UI overlay para información de juego

2. **Responsabilidades de GameScene**
   - Renderizar el tablero, cartas y elementos visuales
   - Gestionar la lógica de turnos
   - Manejar interacciones del usuario (clics en cartas)
   - Comunicarse con el backend mediante socket.io (si es LAN)
   - Emitir eventos (`game-over`, `update-timer`, etc.) **pero NO cambiar de escena**

## Arquitectura de Ficheros

```
src/
├── App.vue                    # Contenedor principal (orquestador de vistas)
├── main.js                    # Entrada de Vue
├── phaser-main.js             # Configuración de Phaser
├── components/
│   ├── LoginForm.vue
│   ├── RegisterForm.vue
│   ├── PreloadScreen.vue
│   ├── MainMenu.vue
│   └── RoomCreateModal.vue
├── scenes/
│   ├── Preloader.js           # Carga de assets
│   ├── GameScene.js           # Juego principal
│   ├── GameSceneLAN.js        # Transición LAN
│   └── uiScene.js             # UI overlay
├── stores/
│   ├── authStore.js
│   └── gameStore.js
├── services/                  # Servicios de lógica
├── helpers/                   # Utilidades
└── game_objects/              # Clases de objetos del juego
```

## Inicialización de Phaser

Phaser **NO se inicializa automáticamente**. Se inicializa en tres momentos:

1. **Después del Login** → Va a PreloadScreen.vue
2. **En PreloadScreen.vue → Se inicia Preloader de Phaser**
   - Carga todos los assets del juego
   - No inicia ninguna otra escena automáticamente
   
3. **Cuando el usuario elige jugar:**
   - **Vs Bot** → GameScene inicia directamente
   - **LAN** → GameSceneLAN inicia (transición) → luego GameScene

## Comunicación entre Vue y Phaser

### Vue → Phaser
- Vue inicia scenes de Phaser pasando datos en el `init()` method
- Datos incluyen: `playerData`, `roomCode`, `socket`, `isLAN`, etc.

### Phaser → Vue
- GameScene emite eventos internos (`game-over`, `update-timer`, etc.)
- UIScene listening a estos eventos para actualizar la UI
- **GameScene NO cambia vistas**, emite eventos que Vue escucha

### Socket.io
- **RoomCreateModal.vue** maneja creación/unión a salas
- Socket se pasa a GameScene para recibir eventos del juego
- GameScene envía/recibe eventos del juego mediante el socket

## Dependencias Dinámicas del Backend

Los componentes Vue detectan el backend desde (en orden):

1. Parámetro de query: `?backend=http://IP:PORT`
2. Variable global: `window.BACKEND_URL`
3. Hostname actual: `http://hostname:3001`
4. Fallback: `http://localhost:3001`

Esto permite ejecutar la app en diferentes máquinas sin recompilar.

## Buenas Prácticas Implementadas

✅ **Separación de responsabilidades:** Vue maneja vistas, Phaser maneja juego
✅ **Inicialización lazy de Phaser:** Solo se crea cuando es necesario
✅ **Comunicación explícita:** Eventos, no referencias cruzadas
✅ **Estado centralizado:** Stores de Pinia para sincronización
✅ **Configuración dinámica del backend:** Soporta múltiples entornos
✅ **Ciclo de vida limpio:** Destrucción correcta de Phaser en logout
✅ **Comentarios documentados:** Cada componente explica su responsabilidad

## Próximos Pasos (Recomendaciones)

1. **Implementar listeners en App.vue** para eventos de GameScene:
   ```javascript
   gameScene.events.on('game-over', (winner) => {
     // Volver a menú o mostrar pantalla de fin de partida
   });
   ```

2. **Crear componente de fin de partida** (Vue) que se muestre cuando `gameStore.gameState === 'ended'`

3. **Agregar más servicios** desacoplados para bot AI, cálculos de combate, etc.

4. **Tests unitarios** para GameEngine, BotEngine, lógica de combate

5. **Pruebas de integración** entre Vue y Phaser
