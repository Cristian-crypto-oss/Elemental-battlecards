<template>
  <div class="preload-screen">
    <!-- Imagen de fondo -->
    <div class="background-image"></div>

    <!-- Overlay oscuro -->
    <div class="overlay"></div>

    <!-- Contenedor de carga -->
    <div class="preload-container">
      <!-- Logo -->
      <div class="logo-section">
        <img src="/assets/images/logo.png" alt="Elemental Battlecards" class="logo" />
      </div>

      <!-- Barra de progreso -->
      <div class="progress-section">
        <div class="progress-bar-wrapper">
          <div 
            class="progress-bar-fill" 
            :style="{ width: progress + '%' }"
          ></div>
        </div>
        <div class="progress-text">{{ Math.round(progress) }}%</div>
      </div>

      <!-- Texto de carga -->
      <div class="loading-text">
        {{ loadingMessages[currentMessageIndex] }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useGameStore } from '../stores/gameStore.js';

const gameStore = useGameStore();
const emit = defineEmits(['preload-complete']);

const progress = ref(0);
const currentMessageIndex = ref(0);
const loadingMessages = [
  'Inicializando dimensión elemental...',
  'Cargando cristales de poder...',
  'Despertando guardianes...',
  'Equilibrando elementos...',
  'Preparando el campo de batalla...',
  'Activando defensas...',
  'Sincronizando magia...'
];

const messageChangeInterval = ref(null);
const progressInterval = ref(null);

// Watcher para detectar cuando el preload está completo (Phaser terminó de cargar)
watch(() => progress.value, (newVal) => {
  // Cuando llegamos a 100%, la UI emite el evento
  if (newVal >= 100) {
    console.log('[PreloadScreen] Assets cargados al 100%');
  }
});

onMounted(() => {
  console.log('[PreloadScreen] Iniciando animación de preload');
  
  // Cambiar mensaje cada 800ms
  messageChangeInterval.value = setInterval(() => {
    currentMessageIndex.value = (currentMessageIndex.value + 1) % loadingMessages.length;
  }, 800);

  // Animar progreso con variación aleatoria
  progressInterval.value = setInterval(() => {
    const increment = Math.random() * 15 + 5; // Entre 5 y 20
    const newProgress = Math.min(progress.value + increment, 95); // Máximo 95%
    progress.value = newProgress;

    // Si llegamos a 90%, simular carga más lenta
    if (progress.value >= 90) {
      progress.value = Math.min(progress.value + Math.random() * 2, 95);
    }

    // Completar al 100% después de 4 segundos
    if (progress.value >= 95) {
      clearInterval(progressInterval.value);
      setTimeout(() => {
        progress.value = 100;
        setTimeout(() => {
          console.log('[PreloadScreen] Emitiendo evento preload-complete');
          clearInterval(messageChangeInterval.value);
          emit('preload-complete');
        }, 500);
      }, 800);
    }
  }, 400);
});

// Limpiar intervalos al desmontar
const cleanup = () => {
  if (messageChangeInterval.value) clearInterval(messageChangeInterval.value);
  if (progressInterval.value) clearInterval(progressInterval.value);
};

// Usar hook onUnmounted si está disponible
import { onBeforeUnmount } from 'vue';
onBeforeUnmount(cleanup);
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Libre+Caslon+Text:wght@400&family=Hanken+Grotesk:wght@400;700&display=swap');

* {
  box-sizing: border-box;
}

/* Pantalla completa */
.preload-screen {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1000;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #0a0a0a;
  overflow: hidden;
}

/* Imagen de fondo */
.background-image {
  position: absolute;
  width: 100%;
  height: 100%;
  background: url('/assets/images/fondo-preload.png') center / cover no-repeat;
  z-index: 1;
  opacity: 0.8;
}

/* Overlay oscuro */
.overlay {
  position: absolute;
  width: 100%;
  height: 100%;
  background: radial-gradient(ellipse 80% 80% at 50% 50%, rgba(10, 10, 10, 0.3) 0%, rgba(10, 10, 10, 0.8) 100%);
  z-index: 2;
  pointer-events: none;
}

/* Contenedor principal */
.preload-container {
  position: relative;
  z-index: 3;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 40px;
}

/* Sección del logo */
.logo-section {
  display: flex;
  justify-content: center;
  align-items: center;
  animation: logoFloat 3s ease-in-out infinite;
}

.logo {
  width: 200px;
  height: 200px;
  filter: drop-shadow(0 0 30px rgba(242, 202, 80, 0.5));
  object-fit: contain;
}

@keyframes logoFloat {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-20px);
  }
}

/* Sección de progreso */
.progress-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  width: 300px;
}

.progress-bar-wrapper {
  width: 100%;
  height: 6px;
  background: rgba(77, 70, 53, 0.3);
  border-radius: 3px;
  overflow: hidden;
  box-shadow: 0 0 20px rgba(242, 202, 80, 0.2) inset;
}

.progress-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #00d4ff, #0099ff, #00d4ff);
  border-radius: 3px;
  transition: width 0.3s ease;
  box-shadow: 0 0 15px rgba(0, 212, 255, 0.6);
}

.progress-text {
  font-family: 'Hanken Grotesk', sans-serif;
  font-size: 14px;
  font-weight: 700;
  color: #F2CA50;
  letter-spacing: 1px;
}

/* Texto de carga */
.loading-text {
  font-family: 'Hanken Grotesk', sans-serif;
  font-size: 14px;
  font-weight: 400;
  color: #D0C5AF;
  text-align: center;
  letter-spacing: 0.5px;
  min-height: 20px;
  animation: fadeInOut 0.8s ease-in-out infinite;
}

@keyframes fadeInOut {
  0%, 100% {
    opacity: 0.6;
  }
  50% {
    opacity: 1;
  }
}

/* Responsive */
@media (max-width: 768px) {
  .logo {
    width: 150px;
    height: 150px;
  }

  .progress-section {
    width: 250px;
  }

  .preload-container {
    gap: 30px;
  }
}
</style>
