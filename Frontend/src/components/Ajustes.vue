<template>
  <div class="ajustes">
    <!-- Background -->
    <img
      class="background-img"
      alt="Background"
      src="/assets/images/home.png"
    />

    <!-- Header con botón volver -->
    <div class="header-section">
      <button class="btn-volver" @click="handleBack" title="Volver">
        <span class="btn-icon-back">⬅️</span>
        <span class="btn-text">VOLVER</span>
      </button>
    </div>

    <!-- Main Content -->
    <div class="main-content">
      <div class="settings-container">
        <!-- Sección Sonido -->
        <div class="settings-section">
          <div class="section-header">
            <span class="section-icon">🔊</span>
            <h2 class="section-title">SONIDO</h2>
          </div>

          <div class="settings-group">
            <!-- Música de Fondo -->
            <div class="setting-item">
              <div class="setting-label-container">
                <label class="setting-label">MÚSICA DE FONDO</label>
                <span class="setting-value">{{ backgroundMusicVolume }}%</span>
              </div>
              <div class="slider-container">
                <input
                  type="range"
                  v-model="backgroundMusicVolume"
                  min="0"
                  max="100"
                  class="slider"
                  @input="updateBackgroundMusic"
                />
              </div>
            </div>

            <!-- Efectos de Hechizo -->
            <div class="setting-item">
              <div class="setting-label-container">
                <label class="setting-label">EFECTOS DE HECHIZO</label>
                <span class="setting-value">{{ spellEffectsVolume }}%</span>
              </div>
              <div class="slider-container">
                <input
                  type="range"
                  v-model="spellEffectsVolume"
                  min="0"
                  max="100"
                  class="slider"
                  @input="updateSpellEffects"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Sección Cuenta -->
        <div class="settings-section">
          <div class="section-header">
            <span class="section-icon">👤</span>
            <h2 class="section-title">CUENTA</h2>
          </div>

          <div class="account-container">
            <div class="account-info">
              <label class="account-label">ESTADO DE LA CUENTA</label>
              <span class="account-status">{{ accountStatus }}</span>
            </div>

            <button class="btn-link-email" @click="handleLinkEmail">
              <span class="btn-email-text">VINCULAR CORREO</span>
            </button>
          </div>
        </div>

        <!-- Sección Gráficos (Opcional) -->
        <div class="settings-section">
          <div class="section-header">
            <span class="section-icon">🎮</span>
            <h2 class="section-title">GRÁFICOS</h2>
          </div>

          <div class="settings-group">
            <!-- Calidad de Gráficos -->
            <div class="setting-item">
              <div class="setting-label-container">
                <label class="setting-label">CALIDAD</label>
                <span class="setting-value">{{ graphicsQuality }}</span>
              </div>
              <div class="quality-buttons">
                <button
                  v-for="quality in ['BAJA', 'MEDIA', 'ALTA']"
                  :key="quality"
                  class="quality-btn"
                  :class="{ active: graphicsQuality === quality }"
                  @click="setGraphicsQuality(quality)"
                >
                  {{ quality }}
                </button>
              </div>
            </div>

            <!-- Efectos Visuales -->
            <div class="setting-item toggle-item">
              <label class="setting-label">EFECTOS VISUALES</label>
              <button
                class="toggle-btn"
                :class="{ active: visualEffects }"
                @click="visualEffects = !visualEffects"
              >
                <span class="toggle-indicator"></span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useAuthStore } from '../stores/authStore.js';

const authStore = useAuthStore();
const emit = defineEmits(['back', 'link-email']);

// Estado de Sonido
const backgroundMusicVolume = ref(80);
const spellEffectsVolume = ref(65);

// Estado de Gráficos
const graphicsQuality = ref('ALTA');
const visualEffects = ref(true);

// Estado de Cuenta
const accountStatus = ref('Invitado (ID: #48291)');

// Manejadores de eventos
const handleBack = () => {
  emit('back');
};

const handleLinkEmail = () => {
  emit('link-email');
};

const updateBackgroundMusic = () => {
  console.log('Música de fondo:', backgroundMusicVolume.value);
  // Aquí iría la lógica para cambiar el volumen de música
};

const updateSpellEffects = () => {
  console.log('Efectos de hechizo:', spellEffectsVolume.value);
  // Aquí iría la lógica para cambiar el volumen de efectos
};

const setGraphicsQuality = (quality) => {
  graphicsQuality.value = quality;
  console.log('Calidad de gráficos:', quality);
};
</script>

<style scoped>
/* ===== ROOT & BACKGROUND ===== */
.ajustes {
  align-items: center;
  display: flex;
  flex-direction: column;
  height: 100vh;
  position: relative;
  width: 100%;
  overflow: hidden;
  font-family: 'Poppins', 'Hanken Grotesk', Arial, sans-serif;
  color: white;
}

.background-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 0;
  opacity: 0.4;
}

/* ===== HEADER ===== */
.header-section {
  align-items: flex-start;
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 24px 32px;
  position: relative;
  z-index: 20;
}

.btn-volver {
  all: unset;
  align-items: center;
  display: inline-flex;
  gap: 8px;
  padding: 8px 16px;
  background: rgba(138, 0, 255, 0.1);
  border: 1px solid rgba(138, 0, 255, 0.3);
  border-radius: 8px;
  cursor: pointer;
  transition: all 200ms ease;
  color: #f2ca50;
  font-weight: 600;
  font-size: 14px;
  letter-spacing: 1px;
}

.btn-volver:hover {
  background: rgba(138, 0, 255, 0.2);
  border-color: rgba(138, 0, 255, 0.5);
  transform: translateX(-4px);
}

.btn-icon-back {
  font-size: 16px;
}

.btn-text {
  font-family: 'Libre Caslon Text', Helvetica, sans-serif;
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 1.4px;
}

/* ===== MAIN CONTENT ===== */
.main-content {
  flex: 1;
  width: 100%;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 20px;
  position: relative;
  z-index: 10;
  overflow-y: auto;
}

.settings-container {
  width: 100%;
  max-width: 900px;
  display: flex;
  flex-direction: column;
  gap: 32px;
  padding: 20px;
}

/* ===== SETTINGS SECTION ===== */
.settings-section {
  background: rgba(30, 32, 32, 0.85);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(77, 70, 53, 0.3);
  border-radius: 12px;
  padding: 32px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.section-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(77, 70, 53, 0.5);
}

.section-icon {
  font-size: 28px;
}

.section-title {
  margin: 0;
  color: #e2e2e2;
  font-family: 'Libre Caslon Text', Helvetica, sans-serif;
  font-size: 24px;
  font-weight: 700;
  letter-spacing: 1.2px;
}

/* ===== SETTINGS GROUP ===== */
.settings-group {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.setting-item {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.setting-item.toggle-item {
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}

.setting-label-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.setting-label {
  color: #d0c5af;
  font-family: 'Hanken Grotesk', Helvetica, sans-serif;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

.setting-value {
  color: #ffe088;
  font-family: 'Hanken Grotesk', Helvetica, sans-serif;
  font-size: 14px;
  font-weight: 700;
}

/* ===== SLIDER ===== */
.slider-container {
  display: flex;
  align-items: center;
  width: 100%;
}

.slider {
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: #333535;
  outline: none;
  -webkit-appearance: none;
  appearance: none;
  cursor: pointer;
}

.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #f2ca50;
  border: 2px solid #3c2f00;
  cursor: pointer;
  box-shadow: 0px 0px 10px rgba(242, 202, 80, 0.5);
}

.slider::-moz-range-thumb {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #f2ca50;
  border: 2px solid #3c2f00;
  cursor: pointer;
  box-shadow: 0px 0px 10px rgba(242, 202, 80, 0.5);
}

/* ===== ACCOUNT SECTION ===== */
.account-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #1a1c1c;
  border: 1px solid rgba(77, 70, 53, 0.3);
  border-radius: 8px;
  padding: 20px;
  gap: 16px;
}

.account-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.account-label {
  color: #d0c5af;
  font-family: 'Hanken Grotesk', Helvetica, sans-serif;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0;
  text-transform: uppercase;
}

.account-status {
  color: #e2e2e2;
  font-family: 'Hanken Grotesk', Helvetica, sans-serif;
  font-size: 16px;
  font-weight: 700;
}

.btn-link-email {
  all: unset;
  background: #f2ca50;
  border: 1px solid #574500;
  border-radius: 12px;
  padding: 12px 24px;
  cursor: pointer;
  transition: all 200ms ease;
  color: #3c2f00;
  font-family: 'Hanken Grotesk', Helvetica, sans-serif;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0;
  white-space: nowrap;
  flex-shrink: 0;
  position: relative;
  box-shadow: 0px 4px 6px -4px rgba(242, 202, 80, 0.2), 0px 10px 15px -3px rgba(242, 202, 80, 0.2);
}

.btn-link-email:hover {
  background: #f2d670;
  box-shadow: 0px 4px 6px -4px rgba(242, 202, 80, 0.4), 0px 10px 15px -3px rgba(242, 202, 80, 0.4);
  transform: translateY(-2px);
}

.btn-email-text {
  font-size: 12px;
  font-weight: 700;
}

/* ===== GRAPHICS QUALITY ===== */
.quality-buttons {
  display: flex;
  gap: 12px;
  width: 100%;
}

.quality-btn {
  all: unset;
  flex: 1;
  padding: 10px 16px;
  background: #333535;
  border: 1px solid rgba(138, 0, 255, 0.2);
  border-radius: 8px;
  cursor: pointer;
  transition: all 200ms ease;
  color: #d0c5af;
  font-family: 'Hanken Grotesk', Helvetica, sans-serif;
  font-size: 12px;
  font-weight: 700;
  text-align: center;
}

.quality-btn:hover {
  border-color: rgba(138, 0, 255, 0.5);
  background: rgba(138, 0, 255, 0.1);
}

.quality-btn.active {
  background: rgba(138, 0, 255, 0.3);
  border-color: rgba(138, 0, 255, 0.8);
  color: #e9c349;
}

/* ===== TOGGLE SWITCH ===== */
.toggle-btn {
  all: unset;
  width: 50px;
  height: 28px;
  background: #333535;
  border: 1px solid rgba(138, 0, 255, 0.2);
  border-radius: 14px;
  cursor: pointer;
  transition: all 200ms ease;
  position: relative;
  display: flex;
  align-items: center;
  padding: 2px;
}

.toggle-btn.active {
  background: rgba(138, 0, 255, 0.3);
  border-color: rgba(138, 0, 255, 0.8);
}

.toggle-indicator {
  width: 22px;
  height: 22px;
  background: #f2ca50;
  border-radius: 50%;
  position: absolute;
  left: 3px;
  transition: all 200ms ease;
}

.toggle-btn.active .toggle-indicator {
  left: 25px;
}

/* ===== SCROLLBAR ===== */
.main-content::-webkit-scrollbar {
  width: 8px;
}

.main-content::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
}

.main-content::-webkit-scrollbar-thumb {
  background: rgba(138, 0, 255, 0.3);
  border-radius: 4px;
}

.main-content::-webkit-scrollbar-thumb:hover {
  background: rgba(138, 0, 255, 0.5);
}

/* ===== RESPONSIVE ===== */
@media (max-width: 768px) {
  .header-section {
    padding: 16px 20px;
  }

  .settings-container {
    max-width: 100%;
    gap: 20px;
    padding: 12px;
  }

  .settings-section {
    padding: 24px;
    gap: 18px;
  }

  .section-title {
    font-size: 20px;
  }

  .account-container {
    flex-direction: column;
    align-items: flex-start;
  }

  .btn-link-email {
    width: 100%;
    text-align: center;
  }

  .quality-buttons {
    flex-direction: column;
  }

  .quality-btn {
    width: 100%;
  }

  .main-content {
    padding: 12px;
  }
}
</style>
