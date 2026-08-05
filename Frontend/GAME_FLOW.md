# Flujo del Juego - Elemental Battlecards

## Cómo Finaliza una Partida y Vuelve al Menú

### Flujo Técnico

```
1. GameEngine (lógica) detecta que un jugador ganó
   ↓
2. GameEngine emite evento 'game-over'
   ↓
3. GameScene recibe evento en handleEngineEvent()
   ↓
4. GameScene llama endGame(winner)
   ↓
5. endGame() emite 'game-over' en scene.events
   ↓
6. App.vue escucha el evento (via setupGameOverListener)
   ↓
7. App.vue detiene UIScene y GameScene
   ↓
8. App.vue cambia currentScreen a 'menu'
   ↓
9. MainMenu.vue se renderiza
```

### Implementación en Código

#### En App.vue

**setupGameOverListener()** - Configura el listener para el evento game-over:
- Se llama después de iniciar GameScene (en handlePlayBot y handleRoomCreated)
- Escucha el evento 'game-over' emitido por GameScene
- Detiene las escenas de Phaser (UIScene y GameScene)
- Cambia la pantalla actual a 'menu'

**handlePlayBot()** - Inicia juego vs Bot:
1. Cambia pantalla a 'game'
2. Inicializa Phaser si no existe
3. Inicia GameScene con modo vsBot
4. Configura listener para fin de juego

**handleRoomCreated()** - Inicia juego multijugador LAN:
1. Cambia pantalla a 'game'
2. Inicializa Phaser si no existe
3. Inicia GameSceneLAN (que internamente inicia GameScene)
4. Configura listener después de 1.5s (tiempo para que GameScene esté listo)

#### En GameScene.js

**endGame(winner)**:
```javascript
endGame(winner) {
    if (this.turnTimer) this.turnTimer.destroy();
    this.events.emit('update-timer', 0);
    this.input.enabled = false;
    this.events.emit('game-over', winner);  // ← Emite el evento
}
```

### Condiciones de Fin de Partida

Según la lógica del juego (en GameEngine), la partida termina cuando:
1. Un jugador logra tener los 6 tipos elementales distintos en su campo
2. Un jugador logra llenar las 6 esencias elementales
3. Un jugador gana por combate (oponente sin cartas y sin esencias)

### Timeline de Eventos

```
Segundo 0: Usuario hace clic en "Jugar" o "Crear Sala"
Segundo 1-2: GameScene se inicializa, UIScene se lanza
Segundo 2-5: Juego está en progreso
Segundo N: Condición de fin de partida se cumple
Segundo N+0: GameEngine emite 'game-over'
Segundo N+0.1: GameScene recibe evento y llama endGame()
Segundo N+0.2: GameScene emite 'game-over' en scene.events
Segundo N+0.3: App.vue recibe evento
Segundo N+1.3: App.vue cambia pantalla a 'menu'
Segundo N+2: MainMenu aparece en pantalla
```

### Verificación de Funcionamiento

Para verificar que todo funcione:
1. Abre la consola del navegador (F12)
2. Inicia una partida (vs Bot o LAN)
3. Espera a que termine o fuerza el fin (en pruebas)
4. En la consola deberías ver:
   - `[App.vue] Configurando listener para game-over en GameScene`
   - `[GameScene] [listener] Recibido evento: case 'game-over'`
   - `[App.vue] ✓ Evento game-over recibido. Ganador: ...`
   - `[App.vue] Deteniendo escenas de Phaser...`
   - `[App.vue] UIScene detenida`
   - `[App.vue] GameScene detenida`
   - `[App.vue] Cambiando a pantalla de menú`

### Posibles Problemas y Soluciones

**Problema**: La partida no vuelve al menú cuando termina
**Solución**: 
- Verifica en la consola que el evento 'game-over' se esté emitiendo
- Asegúrate de que setupGameOverListener() se está llamando
- Aumenta el delay en handleRoomCreated si usas LAN

**Problema**: El MainMenu aparece pero el juego sigue en segundo plano
**Solución**:
- Se detiene UIScene y GameScene, pero Phaser sigue en memoria
- Esto es intencional (permite reiniciar sin recargar)
- El z-index del vue-overlay debe ser mayor que el de Phaser

**Problema**: Al volver al menú, las animaciones se ven entrecortadas
**Solución**:
- Aumenta el delay en setupGameOverListener antes de cambiar currentScreen
- El delay actual es 1000ms, prueba con 1500ms o 2000ms
