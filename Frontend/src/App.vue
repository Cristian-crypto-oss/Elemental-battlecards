<template>
  <div class="app-container">
    <!-- Contenedor para Phaser (inicializado cuando se inicia el juego) -->
    <div id="game-container"></div>

    <!-- Overlay Vue para componentes de UI (controla el flujo de vistas) -->
    <div class="vue-overlay">
      <!-- PANTALLA DE PRELOAD (carga de assets inicial) -->
      <template v-if="currentScreen === 'preload'">
        <PreloadScreen @preload-complete="handlePreloadComplete" />
      </template>

      <!-- PANTALLA DE LOGIN -->
      <template v-else-if="currentScreen === 'login'">
        <LoginForm 
          @login-success="handleLoginSuccess"
          @register-click="handleRegisterClick"
        />
      </template>

      <!-- PANTALLA DE REGISTRO -->
      <template v-else-if="currentScreen === 'register'">
        <RegisterForm 
          @register-success="handleRegisterSuccess"
          @login-click="handleLoginClick"
        />
      </template>

      <!-- PANTALLA DE MENÚ PRINCIPAL -->
      <template v-else-if="currentScreen === 'menu'">
        <MainMenu
          @play-lan="handlePlayLAN"
          @play-bot="handlePlayBot"
          @logout="handleLogout"
          @view-mechanics="handleViewMechanics"
          @view-settings="handleViewSettings"
          @view-profile="handleViewProfile"
        />
      </template>

      <!-- PANTALLA DE VER PERFIL -->
      <template v-else-if="currentScreen === 'ver-perfil'">
        <VerPerfil
          @back="handleVerPerfilBack"
          @logout="handleLogout"
        />
      </template>

      <!-- PANTALLA DE JUEGO LAN -->
      <template v-else-if="currentScreen === 'juego-lan'">
        <JuegoLan
          @back="handleJuegoLanBack"
          @exit="handleLogout"
          @create-game="handleCreateGame"
          @join-game="handleJoinGame"
        />
      </template>

      <!-- PANTALLA DE MECÁNICAS DEL JUEGO -->
      <template v-else-if="currentScreen === 'mecanicas-juego'">
        <MecanicasJuego
          @back="handleMecanicasBack"
          @view-settings="handleViewSettings"
        />
      </template>

      <!-- PANTALLA DE AJUSTES -->
      <template v-else-if="currentScreen === 'ajustes'">
        <Ajustes
          @back="handleAjustesBack"
          @link-email="handleLinkEmail"
        />
      </template>

      <!-- PANTALLA DE CREACIÓN DE SALA (LAN) -->
      <template v-else-if="currentScreen === 'create-room'">
        <RoomCreateModal 
          @room-created="handleRoomCreated" 
          @cancel="handleCancelRoom" 
        />
      </template>

      <!-- DURANTE EL JUEGO: No hay overlay de Vue, Phaser tiene el control total -->
      <template v-else-if="currentScreen === 'game'">
        <!-- El contenedor de Phaser ocupa toda la pantalla -->
      </template>

      <!-- PANTALLA DE FIN DE JUEGO -->
      <template v-else-if="currentScreen === 'game-over'">
        <GameOverScreen 
          :winner="gameWinner"
          @return-to-menu="handleGameOverReturnToMenu"
          @rematch="handleGameOverRematch"
          @view-settings="handleViewSettings"
        />
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, onBeforeUnmount } from 'vue';
import { useAuthStore } from './stores/authStore.js';
import { useGameStore } from './stores/gameStore.js';

// Componentes Vue
import PreloadScreen from './components/PreloadScreen.vue';
import LoginForm from './components/LoginForm.vue';
import RegisterForm from './components/RegisterForm.vue';
import MainMenu from './components/MainMenu.vue';
import JuegoLan from './components/JuegoLan.vue';
import MecanicasJuego from './components/MecanicasJuego.vue';
import RoomCreateModal from './components/RoomCreateModal.vue';
import GameOverScreen from './components/GameOverScreen.vue';
import Ajustes from './components/Ajustes.vue';
import VerPerfil from './components/VerPerfil.vue';

// Inicialización de Phaser
import { initializePhaserGame } from './phaser-main.js';

// Stores
const authStore = useAuthStore();
const gameStore = useGameStore();

// Estado actual de la pantalla
const currentScreen = ref('login');

// Referencia al juego de Phaser
let phaserGame = null;

// Ganador cuando termina el juego
const gameWinner = ref(null);

/**
 * Ciclo de vida: Componente montado
 * - Si el usuario está autenticado, vamos al menú
 * - Si no está autenticado, vamos al login
 */
onMounted(() => {
  console.log('[App.vue] Aplicación montada');
  
  // Determinar pantalla inicial
  if (authStore.isAuthenticated && authStore.user) {
    console.log('[App.vue] Usuario autenticado, ir a menú');
    currentScreen.value = 'menu';
  } else {
    console.log('[App.vue] Usuario no autenticado, ir a login');
    currentScreen.value = 'login';
  }
});

/**
 * Ciclo de vida: Desmontaje del componente
 * - Limpiar referencias de Phaser si existen
 */
onBeforeUnmount(() => {
  console.log('[App.vue] Desmontando aplicación');
  if (phaserGame) {
    phaserGame.destroy(true);
    phaserGame = null;
  }
});

/**
 * Inicializar el Preloader de Phaser (carga de assets del juego)
 * Este paso es importante para que los assets estén listos cuando se inicie el juego
 * Se llama SOLO cuando el usuario hace clic en "Jugar"
 */
const initPreloader = () => {
  if (!phaserGame) {
    console.log('[App.vue] Inicializando Phaser y cargando assets...');
    phaserGame = initializePhaserGame();
    currentScreen.value = 'preload';
    
    // Esperar a que Phaser esté listo e iniciar PreloaderScene
    phaserGame.scene.start('Preloader');
  }
};

/**
 * EVENTOS DE AUTENTICACIÓN
 */

const handleLoginSuccess = (userData) => {
  console.log('[App.vue] Login exitoso:', userData);
  authStore.setUser(userData);
  // Ir directo al menú, sin preload
  currentScreen.value = 'menu';
};

const handlePreloadComplete = () => {
  console.log('[App.vue] Preload completado, assets cargados');
  
  // Determinar a dónde ir basado en el estado previo
  // Si el usuario vino del botón "Jugar vs Bot", ir directo al juego
  if (gameStore.gameMode === 'bot') {
    console.log('[App.vue] Iniciando juego vs Bot...');
    currentScreen.value = 'game';
    
    if (phaserGame) {
      // Iniciar GameScene en modo vs Bot
      phaserGame.scene.start('GameScene', {
        vsBot: true,
        playerData: authStore.user
      });
      
      // Escuchar evento de fin de juego desde el evento global de Phaser
      setupGameOverListener();
    }
  } else if (gameStore.gameMode === 'lan') {
    // Si fue "Jugar en LAN", ir a la pantalla de crear/unirse a sala
    console.log('[App.vue] Ir a crear/unirse a sala LAN');
    currentScreen.value = 'create-room';
  } else {
    // Default: ir al menú
    console.log('[App.vue] Volviendo al menú');
    currentScreen.value = 'menu';
  }
};

const handleRegisterSuccess = (userData) => {
  console.log('[App.vue] Registro exitoso:', userData);
  authStore.setUser(userData);
  currentScreen.value = 'login';
};

const handleRegisterClick = () => {
  console.log('[App.vue] Ir a pantalla de registro');
  currentScreen.value = 'register';
};

const handleLoginClick = () => {
  console.log('[App.vue] Ir a pantalla de login');
  currentScreen.value = 'login';
};

/**
 * Configurar listener para evento de fin de juego
 * Escucha eventos emitidos por GameScene usando el sistema de eventos global de Phaser
 */
const setupGameOverListener = () => {
  console.log('[App.vue] setupGameOverListener() - Registrando listeners globales de Phaser');
  
  if (!phaserGame) {
    console.error('[App.vue] ✗ setupGameOverListener: phaserGame no existe');
    return;
  }
  
  // Limpiar listeners previos para evitar duplicados
  phaserGame.events.off('game-over');
  phaserGame.events.off('return-to-menu');
  
  // Escuchar evento de fin de juego desde cualquier escena
  phaserGame.events.on('game-over', (winner) => {
    console.log('[App.vue] ✓ EVENTO game-over RECIBIDO. Ganador:', winner);
    
    // Guardar ganador y mostrar pantalla de Game Over
    gameWinner.value = winner;
    currentScreen.value = 'game-over';
    
    // Detener escenas pero sin cambiar de pantalla (el usuario hace clic en el botón)
    setTimeout(() => {
      console.log('[App.vue] Preparando para detener escenas...');
      
      if (phaserGame && phaserGame.scene) {
        // No detener las escenas aún, dejar que las animaciones terminen
        // Se detendrán cuando el usuario haga clic en "Volver al Menú"
      }
    }, 500);
  });
  
  // Escuchar evento de retorno a menú
  phaserGame.events.on('return-to-menu', () => {
    console.log('[App.vue] ✓ EVENTO return-to-menu RECIBIDO');
    gameWinner.value = null;
    currentScreen.value = 'game-over';
  });
  
  console.log('[App.vue] ✓ Listeners globales de Phaser ACTIVOS y LISTOS');
};

/**
 * EVENTOS DEL MENÚ PRINCIPAL
 */

const handlePlayLAN = () => {
  console.log('[App.vue] Jugador seleccionó: Jugar en LAN');
  currentScreen.value = 'juego-lan';
};

const handleJuegoLanBack = () => {
  console.log('[App.vue] Volver al menú desde Juego LAN');
  currentScreen.value = 'menu';
};

const handleMecanicasBack = () => {
  console.log('[App.vue] Volver al menú desde Mecánicas');
  currentScreen.value = 'menu';
};

const handleViewMechanics = () => {
  console.log('[App.vue] Ir a pantalla de Mecánicas');
  currentScreen.value = 'mecanicas-juego';
};

const handleViewSettings = () => {
  console.log('[App.vue] Ir a pantalla de Ajustes');
  currentScreen.value = 'ajustes';
};

const handleAjustesBack = () => {
  console.log('[App.vue] Volver del menú desde Ajustes');
  currentScreen.value = 'menu';
};

const handleVerPerfilBack = () => {
  console.log('[App.vue] Volver del menú desde Ver Perfil');
  currentScreen.value = 'menu';
};

const handleViewProfile = () => {
  console.log('[App.vue] Ir a pantalla Ver Perfil');
  currentScreen.value = 'ver-perfil';
};

const handleLinkEmail = () => {
  console.log('[App.vue] Vincular correo');
  // Aquí iría la lógica para vincular correo
};

const handleCreateGame = (gameData) => {
  console.log('[App.vue] Crear juego LAN:', gameData);
  gameStore.setGameMode('lan');
  gameStore.setGameData(gameData);
  currentScreen.value = 'preload';
  initPreloader();
};

const handleJoinGame = (gameId) => {
  console.log('[App.vue] Unirse a juego LAN:', gameId);
  gameStore.setGameMode('lan');
  gameStore.setGameId(gameId);
  currentScreen.value = 'preload';
  initPreloader();
};

const handlePlayBot = () => {
  console.log('[App.vue] Jugador seleccionó: Jugar vs Bot');
  gameStore.setGameMode('bot');
  // Mostrar preload mientras se cargan los assets
  currentScreen.value = 'preload';
  initPreloader();
};

/**
 * EVENTOS DE CREACIÓN DE SALA (LAN)
 */

const handleRoomCreated = (roomData) => {
  console.log('[App.vue] Sala creada:', roomData);
  gameStore.setRoomData(roomData);
  currentScreen.value = 'game';
  
  // El socket y la información de la sala ya están en roomData
  // Iniciar el juego con los datos de la sala
  if (!phaserGame) {
    phaserGame = initializePhaserGame();
  }
  
  console.log('[App.vue] Iniciando GameSceneLAN para juego multijugador');
  
  // Iniciar GameSceneLAN con los datos de la sala
  phaserGame.scene.start('GameSceneLAN', {
    roomCode: roomData.roomCode,
    socket: roomData.socket,
    playerData: roomData.playerData,
    playerRole: roomData.playerRole,
    gameStartData: roomData.gameStartData,
    isLAN: true
  });
  
  // GameSceneLAN iniciará GameScene internamente
  // Configurar listeners globales de Phaser para eventos de fin de juego
  console.log('[App.vue] Configurando listeners para eventos de juego');
  setupGameOverListener();
};

const handleCancelRoom = () => {
  console.log('[App.vue] Creación de sala cancelada, volviendo al menú');
  currentScreen.value = 'menu';
};

/**
 * EVENTOS DE FIN DE JUEGO
 */

const handleGameOverReturnToMenu = () => {
  console.log('[App.vue] Usuario volviendo al menú desde Game Over');
  
  // Detener escenas
  if (phaserGame && phaserGame.scene) {
    if (phaserGame.scene.isActive('UIScene')) {
      phaserGame.scene.stop('UIScene');
      console.log('[App.vue] ✓ UIScene detenida');
    }
    if (phaserGame.scene.isActive('GameScene')) {
      phaserGame.scene.stop('GameScene');
      console.log('[App.vue] ✓ GameScene detenida');
    }
  }
  
  gameWinner.value = null;
  currentScreen.value = 'menu';
};

const handleGameOverRematch = () => {
  console.log('[App.vue] Usuario solicitando nueva partida');
  
  // Detener escenas
  if (phaserGame && phaserGame.scene) {
    if (phaserGame.scene.isActive('UIScene')) {
      phaserGame.scene.stop('UIScene');
    }
    if (phaserGame.scene.isActive('GameScene')) {
      phaserGame.scene.stop('GameScene');
    }
  }
  
  // Reiniciar juego vs Bot
  gameWinner.value = null;
  currentScreen.value = 'preload';
  gameStore.setGameMode('bot');
  initPreloader();
};

/**
 * LOGOUT
 */

const handleLogout = () => {
  console.log('[App.vue] Usuario cerrando sesión');
  authStore.logout();
  gameStore.reset();
  
  // Destruir juego de Phaser si existe
  if (phaserGame) {
    phaserGame.destroy(true);
    phaserGame = null;
  }
  
  currentScreen.value = 'login';
};

/**
 * WATCHERS: Sincronizar cambios de estado global
 */

// Si el usuario se desautentica desde otra parte, volver al login
watch(() => authStore.isAuthenticated, (newVal) => {
  if (!newVal && currentScreen.value !== 'login') {
    console.log('[App.vue] Usuario desautenticado desde otra parte, ir a login');
    currentScreen.value = 'login';
    
    if (phaserGame) {
      phaserGame.destroy(true);
      phaserGame = null;
    }
  }
});
</script>

<style scoped>
/* Contenedor principal */
.app-container {
  width: 100vw;
  height: 100vh;
  position: relative;
  background-color: #1a1a1a;
  overflow: hidden;
  font-family: 'Poppins', Arial, sans-serif;
}

/* Contenedor de Phaser (renderiza el juego) */
#game-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
}

/* Overlay de Vue (renderiza las vistas) */
.vue-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 100;
  pointer-events: none;
}

/* Los componentes dentro del overlay necesitan recibir eventos */
.vue-overlay > * {
  pointer-events: auto;
}
</style>
