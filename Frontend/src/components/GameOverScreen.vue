<template>
  <div class="scene-root">
    <!-- Imagen de fondo -->
    <img
      class="bg-image"
      src="/assets/images/fondo-preload.png"
      alt="Fondo de juego"
    />

    <!-- Overlay oscuro para mejorar legibilidad -->
    <div class="dark-overlay"></div>

    <!-- Contenedor central -->
    <div class="game-over-container">
      <!-- Resultado del juego -->
      <div class="result-section">
        <h1 v-if="isWin" class="result-title win">
          ¡VICTORIA!
        </h1>
        <h1 v-else class="result-title lose">
          DERROTA
        </h1>

        <p class="result-text">
          {{ resultMessage }}
        </p>
      </div>

      <!-- Estadísticas de la partida -->
      <div class="stats-section">
        <div class="stat-item">
          <span class="stat-label">Jugador:</span>
          <span class="stat-value">{{ displayName }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Ganador:</span>
          <span class="stat-value">{{ winner === 'player' ? 'Tú' : 'Oponente' }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Modo de juego:</span>
          <span class="stat-value">{{ gameMode === 'bot' ? 'vs Bot' : 'Multijugador' }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Nivel actual:</span>
          <span class="stat-value">{{ profile?.level || 1 }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Total de victorias:</span>
          <span class="stat-value">{{ profile?.stats?.matchesWon || 0 }}</span>
        </div>
      </div>

      <!-- Botones de acción -->
      <div class="actions-section">
        <button class="btn-primary btn-menu" @click="handleReturnToMenu">
          Volver al Menú
        </button>
        <button v-if="gameMode === 'bot'" class="btn-primary btn-rematch" @click="handleRematch">
          Nueva Partida
        </button>
      </div>
    </div>
    <!-- Settings Button -->
    <SettingsButton @click="handleOpenSettings" />
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { useGameStore } from '../stores/gameStore.js';
import { usePlayerProfile } from '../composables/usePlayerProfile.js';
import SettingsButton from './SettingsButton.vue';

const gameStore = useGameStore();
const { profile, displayName, recordMatch, addExperience, addRankPoints } = usePlayerProfile();

const emit = defineEmits(['return-to-menu', 'rematch', 'view-settings']);

// Props
const props = defineProps({
  winner: {
    type: String,
    required: true, // 'player' o 'opponent'
  },
});

// Computados
const gameMode = computed(() => gameStore.gameMode);

const isWin = computed(() => props.winner === 'player');

const resultMessage = computed(() => {
  if (props.winner === 'player') {
    return `¡Felicidades ${displayName.value || 'Jugador'}! Has derrotado a tu oponente y ganado la partida.`;
  } else {
    return `${displayName.value || 'Jugador'}, tu oponente te ha derrotado. ¡Intenta nuevamente!`;
  }
});

// Actualizar estadísticas cuando se monta el componente
onMounted(() => {
  console.log('[GameOverScreen] Actualizando estadísticas del jugador...');
  
  const won = props.winner === 'player';
  
  // Registrar resultado de la partida
  recordMatch({
    won: won,
    gameType: gameMode.value, // 'bot' o 'lan'
    difficulty: 'medium', // TODO: obtener dificultad real del gameStore
    duration: 0 // TODO: obtener duración real de la partida
  });
  
  // Añadir experiencia y puntos de rango
  if (won) {
    addExperience(100); // +100 XP por ganar
    addRankPoints(25);  // +25 puntos de rango
    console.log('[GameOverScreen] Victoria: +100 XP, +25 puntos de rango');
  } else {
    addExperience(50);   // +50 XP por perder
    addRankPoints(-10);  // -10 puntos de rango
    console.log('[GameOverScreen] Derrota: +50 XP, -10 puntos de rango');
  }
  
  console.log('[GameOverScreen] Estadísticas actualizadas:', {
    totalPartidas: profile.value?.stats?.matchesPlayed,
    victorias: profile.value?.stats?.matchesWon,
    nivel: profile.value?.level,
    experiencia: profile.value?.experience
  });
});

// Métodos
const handleReturnToMenu = () => {
  emit('return-to-menu');
};

const handleRematch = () => {
  emit('rematch');
};

const handleOpenSettings = () => {
  emit('view-settings');
};
</script>

<style scoped>
/* ---- ROOT ---- */
.scene-root {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  font-family: Poppins, Arial, sans-serif;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* ---- VIDEO BG ---- */
.bg-image {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 0;
}

/* ---- DARK OVERLAY ---- */
.dark-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  z-index: 1;
}

/* ---- GAME OVER CONTAINER ---- */
.game-over-container {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 40px;
  text-align: center;
  padding: 40px;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  box-shadow: 0 0 30px rgba(0, 0, 0, 0.8);
  max-width: 600px;
  width: 90%;
}

/* ---- RESULT SECTION ---- */
.result-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.result-title {
  margin: 0;
  font-size: 56px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 2px;
  animation: resultPulse 0.6s ease-out;
}

.result-title.win {
  color: #00ff00;
  text-shadow: 0 0 20px rgba(0, 255, 0, 0.6);
}

.result-title.lose {
  color: #ff4444;
  text-shadow: 0 0 20px rgba(255, 68, 68, 0.6);
}

.result-text {
  margin: 0;
  font-size: 18px;
  opacity: 0.9;
  line-height: 1.5;
}

/* ---- STATS SECTION ---- */
.stats-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
  padding: 20px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 16px;
}

.stat-label {
  opacity: 0.7;
}

.stat-value {
  font-weight: bold;
  color: #00ffff;
}

/* ---- ACTIONS SECTION ---- */
.actions-section {
  display: flex;
  gap: 16px;
  width: 100%;
  flex-wrap: wrap;
  justify-content: center;
}

/* ---- BUTTONS ---- */
.btn-primary {
  padding: 14px 28px;
  border: none;
  border-radius: 8px;
  color: white;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  flex: 1;
  min-width: 180px;
}

.btn-menu {
  background: linear-gradient(135deg, #8a00ff, #5b0099);
}

.btn-menu:hover {
  background: linear-gradient(135deg, #9900ff, #6b00aa);
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(138, 0, 255, 0.4);
}

.btn-rematch {
  background: linear-gradient(135deg, #00cc00, #009900);
}

.btn-rematch:hover {
  background: linear-gradient(135deg, #00dd00, #00aa00);
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 204, 0, 0.4);
}

/* ---- ANIMATIONS ---- */
@keyframes resultPulse {
  0% {
    transform: scale(0.8);
    opacity: 0;
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}
</style>
