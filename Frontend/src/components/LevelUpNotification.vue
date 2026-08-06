<template>
  <Transition name="notification">
    <div v-if="show" class="notification-overlay">
      <div class="notification-card">
        <div class="notification-icon">⭐</div>
        <h2 class="notification-title">¡SUBISTE DE NIVEL!</h2>
        <div class="level-display">
          <span class="level-number">{{ level }}</span>
        </div>
        <p class="notification-message">
          {{ message }}
        </p>
        <button class="btn-close" @click="closeNotification">
          Continuar
        </button>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, watch } from 'vue';
import { usePlayerProfile } from '../composables/usePlayerProfile.js';

const { profile } = usePlayerProfile();

const show = ref(false);
const level = ref(1);
const message = ref('');
const previousLevel = ref(1);

// Observar cambios en el nivel del jugador
watch(() => profile.value?.level, (newLevel, oldLevel) => {
  if (newLevel && oldLevel && newLevel > oldLevel) {
    // El jugador subió de nivel
    level.value = newLevel;
    message.value = `Has alcanzado el nivel ${newLevel}. ¡Sigue así!`;
    showNotification();
  }
  
  if (newLevel) {
    previousLevel.value = newLevel;
  }
}, { immediate: true });

function showNotification() {
  show.value = true;
  
  // Cerrar automáticamente después de 5 segundos
  setTimeout(() => {
    closeNotification();
  }, 5000);
}

function closeNotification() {
  show.value = false;
}
</script>

<style scoped>
.notification-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  animation: fadeIn 0.3s ease;
}

.notification-card {
  background: linear-gradient(135deg, rgba(138, 0, 255, 0.95), rgba(90, 0, 160, 0.95));
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  padding: 40px;
  max-width: 400px;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  animation: slideUp 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.notification-icon {
  font-size: 64px;
  margin-bottom: 20px;
  animation: rotate 1s ease-in-out;
}

.notification-title {
  margin: 0 0 20px 0;
  font-size: 28px;
  font-weight: 900;
  color: #fff;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  letter-spacing: 2px;
}

.level-display {
  margin: 20px 0;
}

.level-number {
  display: inline-block;
  font-size: 72px;
  font-weight: 900;
  color: #ffd700;
  text-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
  animation: pulse 1s ease-in-out infinite;
}

.notification-message {
  margin: 20px 0;
  font-size: 16px;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.5;
}

.btn-close {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 12px 32px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 20px;
}

.btn-close:hover {
  background: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.5);
  transform: scale(1.05);
}

/* Animaciones */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    transform: translateY(50px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes rotate {
  0% {
    transform: rotate(0deg) scale(0.5);
    opacity: 0;
  }
  50% {
    transform: rotate(180deg) scale(1.2);
  }
  100% {
    transform: rotate(360deg) scale(1);
    opacity: 1;
  }
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

/* Transiciones */
.notification-enter-active {
  animation: fadeIn 0.3s ease;
}

.notification-leave-active {
  animation: fadeIn 0.3s ease reverse;
}
</style>
