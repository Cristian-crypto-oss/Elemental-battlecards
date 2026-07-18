<template>
  <div class="app-container">
    <!-- Contenedor para Phaser -->
    <div id="game-container"></div>

    <!-- Overlay Vue para componentes de UI -->
    <div class="vue-overlay">
      <!-- Mostrar componentes según el estado actual -->
      <template v-if="currentScreen === 'preload'">
        <PreloadScreen @preload-complete="handlePreloadComplete" />
      </template>

      <template v-else-if="currentScreen === 'login'">
        <LoginForm 
          @login-success="handleLoginSuccess"
          @register-click="handleRegisterClick"
        />
      </template>

      <template v-else-if="currentScreen === 'register'">
        <RegisterForm 
          @register-success="handleRegisterSuccess"
          @login-click="handleLoginClick"
        />
      </template>

      <template v-else-if="currentScreen === 'menu'">
        <MainMenu @play-clicked="handlePlayClicked" @logout="handleLogout" />
      </template>

      <template v-else-if="currentScreen === 'create-room'">
        <RoomCreateModal @room-created="handleRoomCreated" @cancel="handleCancelRoom" />
      </template>

      <template v-else-if="currentScreen === 'game'">
        <!-- Durante el juego, Phaser se encarga de todo -->
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useAuthStore } from './stores/authStore.js';
import { useGameStore } from './stores/gameStore.js';
import PreloadScreen from './components/PreloadScreen.vue';
import LoginForm from './components/LoginForm.vue';
import RegisterForm from './components/RegisterForm.vue';
import MainMenu from './components/MainMenu.vue';
import RoomCreateModal from './components/RoomCreateModal.vue';
import { initializePhaserGame } from './phaser-main.js';

const authStore = useAuthStore();
const gameStore = useGameStore();

const currentScreen = ref('login');

onMounted(() => {
  console.log('[App.vue] Aplicación montada');
  
  // Si el usuario está autenticado, ir al menú
  if (authStore.isAuthenticated) {
    currentScreen.value = 'menu';
  }
});

const handleLoginSuccess = (userData) => {
  console.log('[App.vue] Login exitoso:', userData);
  authStore.setUser(userData);
  currentScreen.value = 'preload';
};

const handlePreloadComplete = () => {
  console.log('[App.vue] Preload completado');
  currentScreen.value = 'menu';
};

const handleRegisterSuccess = (userData) => {
  console.log('[App.vue] Registro exitoso:', userData);
  authStore.setUser(userData);
  currentScreen.value = 'login';
};

const handleRegisterClick = () => {
  console.log('[App.vue] Ir a registro');
  currentScreen.value = 'register';
};

const handleLoginClick = () => {
  console.log('[App.vue] Ir a login');
  currentScreen.value = 'login';
};

const handlePlayClicked = () => {
  console.log('[App.vue] Play clicked');
  currentScreen.value = 'create-room';
};

const handleRoomCreated = (roomData) => {
  console.log('[App.vue] Sala creada:', roomData);
  gameStore.setRoomData(roomData);
  currentScreen.value = 'game';
  
  // Inicializar Phaser cuando entramos al juego
  if (!window.__phaserGame) {
    window.__phaserGame = initializePhaserGame();
  }
};

const handleCancelRoom = () => {
  console.log('[App.vue] Crear sala cancelado');
  currentScreen.value = 'menu';
};

const handleLogout = () => {
  console.log('[App.vue] Logout');
  authStore.logout();
  currentScreen.value = 'login';
};

// Watchers para sincronizar cambios de estado
watch(() => authStore.isAuthenticated, (newVal) => {
  if (!newVal && currentScreen.value !== 'login') {
    currentScreen.value = 'login';
  }
});
</script>

<style scoped>
.app-container {
  width: 100vw;
  height: 100vh;
  position: relative;
  background-color: #1a1a1a;
  overflow: hidden;
}

.vue-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 100;
  pointer-events: none;
}

.vue-overlay > * {
  pointer-events: auto;
}
</style>
