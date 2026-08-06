<template>
  <div class="room-modal-overlay">
    <!-- Video de fondo -->
    <video
      class="bg-video"
      src="/assets/images/home.mp4"
      autoplay
      loop
      muted
      playsinline
    ></video>

    <!-- Overlay oscuro -->
    <div class="overlay"></div>

    <!-- Modal principal -->
    <div class="room-modal">
      <!-- Header -->
      <header class="modal-header">
        <div class="logo-section">
          <img src="/assets/images/logo.png" alt="Logo" class="logo" />
          <div>
            <h1>Elemental Battlecards</h1>
            <span class="username">Jugador: {{ authStore.user?.username || '' }}</span>
          </div>
        </div>
        <button type="button" class="btn-exit" @click="emit('cancel')">Salir</button>
      </header>

      <!-- Contenido -->
      <div class="modal-content">
        <!-- Panel izquierdo: Crear Sala -->
        <section class="panel create-room-panel">
          <h2>Crear Sala</h2>
          <p>Comparte el código con tu amigo para que se una.</p>

          <!-- Código de sala -->
          <div class="room-code-display" v-if="roomCode">
            <div class="code-box">{{ formattedRoomCode }}</div>
            <button type="button" class="btn-copy" @click="copyRoomCode" :disabled="!roomCode">
              {{ copyButtonText }}
            </button>
          </div>
          <div v-else class="room-code-display">
            <button type="button" class="btn-create-room" @click="createRoom" :disabled="isCreatingRoom">
              {{ isCreatingRoom ? 'Creando sala...' : 'Crear Sala' }}
            </button>
          </div>

          <!-- Estado de jugadores -->
          <h3>Jugadores en sala: {{ playersInRoom }}/2</h3>
          <div class="players-list">
            <div class="player-item host">
              <span class="player-name">{{ authStore.user?.username || 'Tú' }}</span>
              <span class="player-role">(Anfitrión)</span>
            </div>
            <div class="player-item" v-if="playersInRoom > 1">
              <span class="player-name">{{ guestPlayerName || 'Jugador conectado' }}</span>
              <span class="player-role">(Huésped)</span>
            </div>
            <div v-else class="player-item waiting">
              <span class="player-name">Esperando jugador...</span>
            </div>
          </div>

          <!-- Botón iniciar -->
          <button 
            type="button" 
            class="btn-start" 
            @click="startGame"
            :disabled="playersInRoom < 2 || isStartingGame"
          >
            {{ isStartingGame ? '¡Iniciando partida!' : '¡Jugar Ahora!' }}
          </button>

          <!-- Mensaje de error -->
          <div v-if="errorMessage" class="error-message">
            {{ errorMessage }}
          </div>
        </section>

        <!-- Panel derecho: Unirse a Sala -->
        <section class="panel join-room-panel">
          <h2>Unirse a sala</h2>
          <p v-if="!hasJoinedRoom">Ingresa el código que te compartieron.</p>
          <p v-else class="success-text">✅ ¡Unido exitosamente! Esperando que el anfitrión inicie...</p>

          <div class="join-form" v-if="!hasJoinedRoom">
            <input 
              v-model="joinCode" 
              type="text" 
              placeholder="XXX XXX" 
              class="input-room-code"
              @keyup.enter="joinRoom"
              :disabled="isJoiningRoom"
            />
            <button 
              type="button" 
              class="btn-join" 
              @click="joinRoom"
              :disabled="isJoiningRoom || !joinCode.trim()"
            >
              {{ isJoiningRoom ? 'Uniéndose...' : 'Unirse a sala' }}
            </button>
          </div>

          <!-- Mostrar código de sala cuando el guest se une -->
          <div v-else class="room-code-display">
            <div class="code-box">{{ formattedRoomCode }}</div>
            <p class="info-text">Esperando al anfitrión...</p>
          </div>

          <!-- Mensaje de error -->
          <div v-if="joinErrorMessage" class="error-message">
            {{ joinErrorMessage }}
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useAuthStore } from '../stores/authStore.js';
import { io } from 'socket.io-client';

const emit = defineEmits(['room-created', 'cancel']);

const authStore = useAuthStore();

// Estado de creación de sala
const roomCode = ref(null);
const playersInRoom = ref(1);
const guestPlayerName = ref('');
const isCreatingRoom = ref(false);
const isStartingGame = ref(false);
const errorMessage = ref('');
const copyButtonText = ref('Copiar código');

// Estado de unión a sala
const joinCode = ref('');
const isJoiningRoom = ref(false);
const joinErrorMessage = ref('');
const hasJoinedRoom = ref(false); // Nueva variable para indicar que el guest se unió

// Socket.io
let socket = null;

// Configuración del backend
const getBackendUrl = () => {
  const params = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
  if (params.has('backend')) {
    console.log('[RoomCreateModal] Backend URL desde parámetro:', params.get('backend'));
    return params.get('backend');
  }
  if (typeof window !== 'undefined' && window.BACKEND_URL) {
    console.log('[RoomCreateModal] Backend URL desde window.BACKEND_URL:', window.BACKEND_URL);
    return window.BACKEND_URL;
  }
  
  if (typeof window !== 'undefined') {
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    
    console.log('[RoomCreateModal] Detectando backend - protocol:', protocol, 'hostname:', hostname);
    
    // Si estamos en DevTunnels, usar el subdominio correcto para el puerto 3000
    if (hostname.includes('devtunnels.ms')) {
      // Extraer el ID del túnel (ejemplo: x5v4c69f-5173 -> x5v4c69f)
      const parts = hostname.split('-');
      const tunnelId = parts[0];
      const backendUrl = `${protocol}//${tunnelId}-3000.use.devtunnels.ms`;
      console.log('[RoomCreateModal] Backend URL (DevTunnels):', backendUrl);
      return backendUrl;
    }
    
    // Para localhost o 127.0.0.1, forzar HTTP
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      const backendUrl = `http://${hostname}:3000`;
      console.log('[RoomCreateModal] Backend URL (localhost):', backendUrl);
      return backendUrl;
    }
    
    // Para LAN (192.168.x.x, 10.x.x.x, etc.) - usar el mismo hostname con puerto 3000
    // IMPORTANTE: El frontend y backend deben estar en la misma máquina o red
    const backendUrl = `http://${hostname}:3000`;
    console.log('[RoomCreateModal] Backend URL (LAN - mismo host):', backendUrl);
    return backendUrl;
  }
  console.log('[RoomCreateModal] Backend URL (fallback):', 'http://localhost:3000');
  return 'http://localhost:3000';
};

const formattedRoomCode = computed(() => {
  if (!roomCode.value) return '';
  const s = roomCode.value.toString().replace(/\s+/g, '');
  return s.slice(0, 3) + (s.length > 3 ? ' ' + s.slice(3) : '');
});

// Inicializar Socket.io
onMounted(() => {
  console.log('[RoomCreateModal] Componente montado');
  
  const backendUrl = getBackendUrl();
  console.log('[RoomCreateModal] ====================================');
  console.log('[RoomCreateModal] Conectando a backend:', backendUrl);
  console.log('[RoomCreateModal] Frontend URL:', window.location.href);
  console.log('[RoomCreateModal] ====================================');
  
  socket = io(backendUrl, {
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    timeout: 10000
  });

  socket.on('connect', () => {
    console.log('[RoomCreateModal] ✅ Socket conectado exitosamente! ID:', socket.id);
    console.log('[RoomCreateModal] Backend URL:', backendUrl);
  });

  socket.on('connect_error', (error) => {
    console.error('[RoomCreateModal] ❌ Error de conexión:', error.message);
    console.error('[RoomCreateModal] Backend URL intentada:', backendUrl);
    console.error('[RoomCreateModal] Verifica que el backend esté corriendo en:', backendUrl);
    errorMessage.value = `No se puede conectar al servidor: ${backendUrl}`;
    joinErrorMessage.value = `No se puede conectar al servidor: ${backendUrl}`;
  });

  socket.on('disconnect', (reason) => {
    console.warn('[RoomCreateModal] ⚠️ Socket desconectado. Razón:', reason);
  });

  socket.on('room_created', ({ code, role }) => {
    console.log('[RoomCreateModal] Sala creada:', code, 'rol:', role);
    roomCode.value = code;
    playersInRoom.value = 1;
    guestPlayerName.value = '';
    errorMessage.value = '';
    isCreatingRoom.value = false;
  });

  socket.on('player_joined', ({ players, playerName }) => {
    console.log('[RoomCreateModal] Jugador se unió. Total:', players);
    playersInRoom.value = players || 2;
    guestPlayerName.value = playerName || 'Jugador conectado';
  });

  socket.on('player_left', () => {
    console.log('[RoomCreateModal] Jugador salió de la sala');
    playersInRoom.value = 1;
    guestPlayerName.value = '';
  });

  socket.on('game_start', (data) => {
    console.log('[RoomCreateModal] ✅ Juego iniciando...', data);
    isStartingGame.value = false;
    
    // Determinar el rol basado en el socket ID
    let playerRole = 'host';
    if (data.guestId && data.guestId === socket.id) {
      playerRole = 'guest';
    } else if (data.hostId && data.hostId === socket.id) {
      playerRole = 'host';
    }
    
    console.log('[RoomCreateModal] Mi rol:', playerRole, '(Socket ID:', socket.id, ')');
    
    const roomData = {
      roomCode: roomCode.value,
      socket: socket,
      playerData: authStore.user,
      playerRole: playerRole,
      gameStartData: data,
      isLAN: true
    };
    
    console.log('[RoomCreateModal] Emitiendo room-created con roomData:', roomData);
    emit('room-created', roomData);
  });

  socket.on('error', (error) => {
    console.error('[RoomCreateModal] Error de socket:', error);
    errorMessage.value = error.message || 'Error de conexión';
    isCreatingRoom.value = false;
    isJoiningRoom.value = false;
  });
});

// Limpiar socket al desmontar SOLO si no se está usando en el juego
onBeforeUnmount(() => {
  // NO desconectar el socket aquí porque se pasa al juego
  // El juego será responsable de gestionar la conexión
  console.log('[RoomCreateModal] Componente desmontado (socket se mantiene para el juego)');
});

// Métodos
const createRoom = () => {
  if (isCreatingRoom.value || !socket) return;
  
  isCreatingRoom.value = true;
  errorMessage.value = '';
  
  socket.emit('create_room', (response) => {
    if (response && response.success && response.code) {
      console.log('[RoomCreateModal] Sala creada exitosamente:', response.code);
      roomCode.value = response.code;
      playersInRoom.value = 1;
      isCreatingRoom.value = false;
    } else {
      console.error('[RoomCreateModal] Error al crear sala:', response);
      errorMessage.value = response?.message || 'Error al crear sala. Intenta nuevamente.';
      isCreatingRoom.value = false;
    }
  });
};

const copyRoomCode = async () => {
  if (!roomCode.value) return;
  
  try {
    await navigator.clipboard.writeText(roomCode.value);
    copyButtonText.value = 'Copiado!';
    setTimeout(() => {
      copyButtonText.value = 'Copiar código';
    }, 2000);
  } catch (e) {
    console.error('Error copiando código:', e);
    // Fallback para navegadores antiguos
    const input = document.createElement('input');
    input.value = roomCode.value;
    document.body.appendChild(input);
    input.select();
    document.execCommand('copy');
    document.body.removeChild(input);
    copyButtonText.value = 'Copiado!';
    setTimeout(() => {
      copyButtonText.value = 'Copiar código';
    }, 2000);
  }
};

const startGame = () => {
  if (playersInRoom.value < 2 || isStartingGame.value || !socket) return;
  
  isStartingGame.value = true;
  console.log('[RoomCreateModal] Iniciando juego desde anfitrión');
  
  socket.emit('start_game', (response) => {
    if (!response || !response.success) {
      console.error('[RoomCreateModal] Error iniciando juego:', response);
      errorMessage.value = response?.message || 'Error al iniciar juego';
      isStartingGame.value = false;
    }
  });
};

const joinRoom = () => {
  if (!socket) {
    joinErrorMessage.value = 'Socket no conectado. Verifica la conexión al servidor.';
    console.error('[RoomCreateModal] Socket no está disponible');
    return;
  }
  
  if (!socket.connected) {
    joinErrorMessage.value = 'Esperando conexión al servidor...';
    console.warn('[RoomCreateModal] Socket no está conectado aún');
    return;
  }
  
  if (isJoiningRoom.value || !joinCode.value.trim()) return;
  
  const code = joinCode.value.replace(/\s+/g, '');
  
  if (code.length !== 6 || isNaN(code)) {
    joinErrorMessage.value = 'El código debe tener 6 dígitos';
    return;
  }
  
  isJoiningRoom.value = true;
  joinErrorMessage.value = '';
  
  console.log('[RoomCreateModal] ====================================');
  console.log('[RoomCreateModal] Intentando unirse a sala:', code);
  console.log('[RoomCreateModal] Socket ID:', socket.id);
  console.log('[RoomCreateModal] Socket conectado:', socket.connected);
  console.log('[RoomCreateModal] ====================================');
  
  // Timeout de seguridad por si no hay respuesta
  const timeoutId = setTimeout(() => {
    if (isJoiningRoom.value) {
      console.error('[RoomCreateModal] ⏱️ Timeout al unirse a la sala');
      joinErrorMessage.value = 'Tiempo de espera agotado. Verifica el código y la conexión.';
      isJoiningRoom.value = false;
    }
  }, 10000);
  
  socket.emit('join_room', { code }, (response) => {
    clearTimeout(timeoutId);
    
    console.log('[RoomCreateModal] Respuesta de join_room:', response);
    
    if (response && response.success) {
      console.log('[RoomCreateModal] ✅ Unido a sala exitosamente:', response.code);
      console.log('[RoomCreateModal] Esperando evento game_start...');
      
      // NO emitir 'room-created' aquí
      // Esperar a que llegue el evento 'game_start' del servidor
      isJoiningRoom.value = false;
      hasJoinedRoom.value = true; // Indicar que nos unimos exitosamente
      
      // Actualizar el UI para mostrar que estamos esperando
      joinErrorMessage.value = '';
      joinCode.value = ''; // Limpiar el input
      
      // Guardar el código de sala para cuando llegue game_start
      roomCode.value = response.code;
    } else {
      console.error('[RoomCreateModal] ❌ Error al unirse a sala:', response);
      joinErrorMessage.value = response?.message || 'No se pudo unir a la sala';
      isJoiningRoom.value = false;
    }
  });
};
</script>
<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Libre+Caslon+Text:wght@400&family=Hanken+Grotesk:wght@400;700&display=swap');

* {
  box-sizing: border-box;
}

/* Overlay principal */
.room-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  overflow: hidden;
}

/* Video de fondo */
.bg-video {
  position: absolute;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 0;
}

/* Overlay oscuro */
.overlay {
  position: absolute;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1;
  pointer-events: none;
}

/* Modal principal */
.room-modal {
  position: relative;
  z-index: 2;
  width: 90%;
  max-width: 1200px;
  height: 90%;
  max-height: 700px;
  background: rgba(20, 20, 20, 0.95);
  border-radius: 8px;
  border: 2px rgba(242, 202, 80, 0.20) solid;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.7);
}

/* Header del modal */
.modal-header {
  flex: 0 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-bottom: 1px rgba(242, 202, 80, 0.10) solid;
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo {
  width: 50px;
  height: 50px;
  border-radius: 4px;
}

.logo-section h1 {
  margin: 0;
  font-size: 18px;
  color: #F2CA50;
  font-family: 'Libre Caslon Text', serif;
}

.username {
  font-size: 12px;
  opacity: 0.8;
  display: block;
}

.btn-exit {
  background: #b90000;
  padding: 8px 16px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  color: white;
  font-weight: bold;
  font-size: 12px;
  transition: all 0.2s;
}

.btn-exit:hover {
  background: #d60000;
}

/* Contenido del modal */
.modal-content {
  flex: 1;
  display: flex;
  gap: 20px;
  padding: 24px;
  overflow: auto;
}

/* Paneles */
.panel {
  flex: 1;
  background: rgba(30, 32, 32, 0.5);
  border-radius: 8px;
  padding: 20px;
  border: 1px rgba(242, 202, 80, 0.10) solid;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.panel h2 {
  margin: 0;
  font-size: 20px;
  color: #F2CA50;
  font-family: 'Libre Caslon Text', serif;
}

.panel p {
  margin: 0;
  font-size: 14px;
  opacity: 0.8;
}

.panel h3 {
  margin: 8px 0 12px 0;
  font-size: 14px;
  color: #D0C5AF;
}

/* Código de sala */
.room-code-display {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 6px;
}

.code-box {
  background: rgba(0, 0, 0, 0.5);
  border: 2px #F2CA50 solid;
  padding: 16px;
  text-align: center;
  font-size: 24px;
  font-weight: bold;
  color: #F2CA50;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  letter-spacing: 4px;
}

/* Botones */
.btn-create-room,
.btn-copy,
.btn-start,
.btn-join {
  padding: 12px 16px;
  background: #8a00ff;
  border-radius: 6px;
  border: none;
  color: white;
  cursor: pointer;
  font-weight: bold;
  font-size: 14px;
  transition: all 0.2s;
}

.btn-copy {
  background: #0066cc;
}

.btn-start {
  background: #00aa44;
  margin-top: auto;
}

.btn-join {
  background: #0066cc;
}

.btn-create-room:hover:not(:disabled),
.btn-copy:hover:not(:disabled),
.btn-start:hover:not(:disabled),
.btn-join:hover:not(:disabled) {
  opacity: 0.9;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 255, 255, 0.1);
}

.btn-create-room:disabled,
.btn-copy:disabled,
.btn-start:disabled,
.btn-join:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Lista de jugadores */
.players-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.player-item {
  padding: 12px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 4px;
  border-left: 3px #F2CA50 solid;
  display: flex;
  justify-content: space-between;
  font-size: 14px;
}

.player-item.host {
  border-left-color: #00aa44;
}

.player-item.waiting {
  border-left-color: #666;
  opacity: 0.6;
}

.player-name {
  color: #F2CA50;
  font-weight: bold;
}

.player-role {
  font-size: 12px;
  opacity: 0.7;
}

/* Formulario de unión */
.join-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.input-room-code {
  padding: 12px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px #F2CA50 solid;
  border-radius: 4px;
  color: #F2CA50;
  font-size: 18px;
  text-align: center;
  font-family: 'Courier New', monospace;
  letter-spacing: 2px;
  transition: all 0.2s;
}

.input-room-code:focus {
  outline: none;
  border-color: #FFD700;
  box-shadow: 0 0 10px rgba(242, 202, 80, 0.3);
}

.input-room-code::placeholder {
  color: rgba(242, 202, 80, 0.4);
}

/* Mensajes de error */
.error-message {
  padding: 12px;
  background: rgba(255, 107, 107, 0.1);
  border: 1px rgba(255, 107, 107, 0.3) solid;
  border-radius: 4px;
  color: #ff6b6b;
  font-size: 13px;
  text-align: center;
}

/* Mensajes de éxito e info */
.success-text {
  color: #4ade80;
  font-weight: 600;
}

.info-text {
  margin: 12px 0 0 0;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  text-align: center;
  font-style: italic;
}

/* Responsive */
@media (max-width: 768px) {
  .modal-content {
    flex-direction: column;
    gap: 12px;
  }

  .panel {
    min-height: auto;
  }

  .code-box {
    font-size: 18px;
  }
}
</style>
