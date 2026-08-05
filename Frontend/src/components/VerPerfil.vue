<template>
  <div class="perfil-jugador">
    <!-- Background -->
    <img class="background-img" alt="Background" src="/assets/images/home.png" />

    <!-- HEADER -->
    <div class="header-top-app-bar">
      <div class="header-top-app-bar-overlay" />
      
      <div class="container-header">
        <div class="container-actions">
          <!-- Botón Volver -->
          <button class="btn-icon btn-back-icon" @click="handleBack" title="Volver">
            <span class="icon">⬅️</span>
          </button>
          <!-- Botón Salir -->
          <button class="btn-icon btn-exit-icon" @click="handleExit" title="Salir">
            <span class="icon">🚪</span>
          </button>
        </div>
      </div>
    </div>

    <!-- MAIN CONTENT -->
    <div class="main-content">
      <!-- PERFIL SECTION -->
      <div class="perfil-container">
        <!-- HEADER DEL PERFIL -->
        <div class="perfil-header">
          <h1 class="perfil-title">PERFIL</h1>
          <div class="header-divider"></div>
        </div>

        <!-- CONTENIDO DEL PERFIL -->
        <div class="perfil-content">
          <!-- Avatar y Info Principal -->
          <div class="perfil-info-main">
            <img class="profile-avatar" src="/assets/images/logo.png" alt="Avatar" />
            <div class="profile-text">
              <h2 class="profile-name">{{ authStore.user?.username || 'Jugador' }}</h2>
              <span class="profile-level">NIVEL 45</span>
            </div>
          </div>

          <!-- Rango y Progreso -->
          <div class="profile-rank-section">
            <div class="rank-icon">⚡</div>
            <div class="rank-info">
              <span class="rank-label">RANGO: DIAMANTE IV</span>
              <div class="rank-bar">
                <div class="rank-fill"></div>
              </div>
              <span class="rank-progress">1250 / 2000 Puntos</span>
            </div>
          </div>

          <!-- Estadísticas -->
          <div class="stats-container">
            <div class="stats-grid">
              <div class="stat-card">
                <span class="stat-icon">🎮</span>
                <span class="stat-label">Partidas Jugadas</span>
                <span class="stat-value">0</span>
              </div>
              <div class="stat-card">
                <span class="stat-icon">🏆</span>
                <span class="stat-label">Partidas Ganadas</span>
                <span class="stat-value">0</span>
              </div>
              <div class="stat-card">
                <span class="stat-icon">⭐</span>
                <span class="stat-label">Tasa de Victoria</span>
                <span class="stat-value">0%</span>
              </div>
              <div class="stat-card">
                <span class="stat-icon">⏱️</span>
                <span class="stat-label">Tiempo Jugado</span>
                <span class="stat-value">0h 0m</span>
              </div>
              <div class="stat-card">
                <span class="stat-icon">🎯</span>
                <span class="stat-label">Logros</span>
                <span class="stat-value">0/50</span>
              </div>
              <div class="stat-card">
                <span class="stat-icon">💎</span>
                <span class="stat-label">Rachas Ganadoras</span>
                <span class="stat-value">0</span>
              </div>
            </div>
          </div>

          <!-- Sección de Logros -->
          <div class="achievements-section">
            <h3 class="section-title">LOGROS RECIENTES</h3>
            <div class="achievements-list">
              <div class="achievement-item">
                <span class="achievement-icon">🌟</span>
                <div class="achievement-info">
                  <span class="achievement-name">Primer Juego</span>
                  <span class="achievement-desc">Juega tu primera partida</span>
                </div>
              </div>
              <div class="achievement-item">
                <span class="achievement-icon">🔥</span>
                <div class="achievement-info">
                  <span class="achievement-name">En Fuego</span>
                  <span class="achievement-desc">Gana 5 partidas seguidas</span>
                </div>
              </div>
              <div class="achievement-item">
                <span class="achievement-icon">👑</span>
                <div class="achievement-info">
                  <span class="achievement-name">Rey de la Arena</span>
                  <span class="achievement-desc">Alcanza rango Diamante</span>
                </div>
              </div>
            </div>
          </div>


        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '../stores/authStore.js';

const authStore = useAuthStore();
const emit = defineEmits(['back', 'logout']);

function handleBack() {
  console.log('[VerPerfil.vue] Volviendo al menú');
  emit('back');
}

function handleExit() {
  console.log('[VerPerfil.vue] Usuario cerrando sesión');
  emit('logout');
}
</script>

<style scoped>
/* ===== ROOT & BACKGROUND ===== */
.perfil-jugador {
  align-items: center;
  display: flex;
  flex-direction: column;
  height: 100vh;
  position: relative;
  width: 100%;
  overflow: hidden;
  font-family: 'Poppins', Arial, sans-serif;
  color: white;
}

.background-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 0;
}

/* ===== HEADER ===== */
.header-top-app-bar {
  align-items: flex-start;
  align-self: stretch;
  background: linear-gradient(180deg, rgba(13, 14, 15, 0.95) 0%, rgba(13, 14, 15, 0.8) 100%);
  border-bottom: 2px solid;
  border-image: linear-gradient(90deg, rgba(138, 0, 255, 0.3), rgba(100, 150, 255, 0.3), rgba(138, 0, 255, 0.3)) 1;
  display: flex;
  flex: 0 0 auto;
  flex-direction: column;
  position: relative;
  width: 100%;
  z-index: 100;
}

.header-top-app-bar::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(138, 0, 255, 0.5), transparent);
}

.header-top-app-bar-overlay {
  background: radial-gradient(ellipse 80% 100% at 50% 0%, rgba(138, 0, 255, 0.05) 0%, transparent 70%);
  box-shadow: 0px 4px 16px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05);
  position: absolute;
  inset: 0;
  width: 100%;
}

.container-header {
  align-items: center;
  display: flex;
  justify-content: flex-end;
  height: 72px;
  padding: 0px 24px;
  position: relative;
  width: 100%;
  max-width: 1440px;
  margin: 0 auto;
}

.container-actions {
  align-items: center;
  display: inline-flex;
  gap: 16px;
  position: relative;
}

/* ===== BUTTONS ===== */
.btn-icon {
  background: linear-gradient(135deg, rgba(138, 0, 255, 0.15), rgba(138, 0, 255, 0.05));
  border: 1px solid rgba(138, 0, 255, 0.4);
  cursor: pointer;
  padding: 12px 16px;
  border-radius: 10px;
  transition: all 300ms cubic-bezier(0.34, 1.56, 0.64, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(138, 0, 255, 0.2);
}

.btn-icon::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(138, 0, 255, 0.3) 0%, transparent 70%);
  opacity: 0;
  transition: opacity 300ms ease;
}

.btn-icon:hover {
  background: linear-gradient(135deg, rgba(138, 0, 255, 0.3), rgba(138, 0, 255, 0.15));
  border-color: rgba(138, 0, 255, 0.7);
  box-shadow: 0 8px 24px rgba(138, 0, 255, 0.4), inset 0 0 12px rgba(138, 0, 255, 0.2);
  transform: translateY(-2px) scale(1.05);
}

.btn-icon:active {
  transform: translateY(0) scale(0.98);
  box-shadow: 0 2px 8px rgba(138, 0, 255, 0.3), inset 0 0 8px rgba(138, 0, 255, 0.15);
}

.btn-icon .icon {
  font-size: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
  z-index: 1;
}

.btn-back-icon {
  border-color: rgba(100, 150, 255, 0.4);
  background: linear-gradient(135deg, rgba(100, 150, 255, 0.15), rgba(100, 150, 255, 0.05));
  box-shadow: 0 4px 12px rgba(100, 150, 255, 0.2);
}

.btn-back-icon:hover {
  border-color: rgba(100, 150, 255, 0.7);
  background: linear-gradient(135deg, rgba(100, 150, 255, 0.3), rgba(100, 150, 255, 0.15));
  box-shadow: 0 8px 24px rgba(100, 150, 255, 0.4), inset 0 0 12px rgba(100, 150, 255, 0.2);
}

.btn-exit-icon {
  border-color: rgba(185, 0, 0, 0.4);
  background: linear-gradient(135deg, rgba(185, 0, 0, 0.15), rgba(185, 0, 0, 0.05));
  box-shadow: 0 4px 12px rgba(185, 0, 0, 0.2);
}

.btn-exit-icon:hover {
  border-color: rgba(185, 0, 0, 0.7);
  background: linear-gradient(135deg, rgba(185, 0, 0, 0.3), rgba(185, 0, 0, 0.15));
  box-shadow: 0 8px 24px rgba(185, 0, 0, 0.4), inset 0 0 12px rgba(185, 0, 0, 0.2);
}


.main-content {
  display: flex;
  justify-content: center;
  align-items: center;
  flex: 1;
  width: 100%;
  padding: 20px;
  position: relative;
  z-index: 10;
  overflow-y: auto;
  height: calc(100vh - 72px);
}

.perfil-container {
  background: linear-gradient(0deg, rgba(0, 0, 0, 0.45), rgba(0, 0, 0, 0.45));
  backdrop-filter: blur(8px);
  border: 1px solid rgba(138, 0, 255, 0.2);
  border-radius: 16px;
  padding: 40px;
  width: 100%;
  max-width: 910px;
  min-height: 900px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

/* ===== PERFIL HEADER ===== */
.perfil-header {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  gap: 24px;
  padding: 12px 0;
  border-bottom: 1px solid rgba(138, 0, 255, 0.2);
  margin-bottom: 12px;
}

.perfil-title {
  margin: 0;
  font-family: 'Cinzel', serif;
  font-style: normal;
  font-weight: 700;
  font-size: 36px;
  line-height: 49px;
  letter-spacing: 4px;
  color: #C59B6C;
}

.header-divider {
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, transparent, #8C6A46, transparent);
  opacity: 0.4;
}

/* ===== PERFIL CONTENT ===== */
.perfil-content {
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.perfil-info-main {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 16px;
  background: rgba(138, 0, 255, 0.05);
  border-radius: 12px;
  border: 1px solid rgba(138, 0, 255, 0.15);
}

.profile-avatar {
  width: 80px;
  height: 80px;
  border: 3px solid #C59B6C;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

.profile-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.profile-name {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
  color: #e9c349;
}

.profile-level {
  font-size: 13px;
  color: #C59B6C;
  font-weight: 600;
  letter-spacing: 1px;
}

/* ===== RANK SECTION ===== */
.profile-rank-section {
  display: flex;
  gap: 16px;
  align-items: flex-start;
  padding: 16px;
  background: rgba(197, 155, 108, 0.05);
  border-radius: 12px;
  border: 1px solid rgba(197, 155, 108, 0.2);
}

.rank-icon {
  font-size: 32px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background: rgba(197, 155, 108, 0.1);
  border-radius: 8px;
}

.rank-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.rank-label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #C59B6C;
  letter-spacing: 1px;
}

.rank-bar {
  height: 12px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid rgba(197, 155, 108, 0.3);
}

.rank-fill {
  height: 100%;
  width: 62%;
  background: linear-gradient(90deg, #C59B6C, #e9c349);
  border-radius: 6px;
}

.rank-progress {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.7);
}

/* ===== STATS CONTAINER ===== */
.stats-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.stat-card {
  background: rgba(138, 0, 255, 0.08);
  border: 1px solid rgba(138, 0, 255, 0.2);
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  transition: all 200ms ease;
  cursor: pointer;
}

.stat-card:hover {
  background: rgba(138, 0, 255, 0.15);
  border-color: rgba(138, 0, 255, 0.4);
  transform: translateY(-2px);
}

.stat-icon {
  font-size: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-label {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.7);
  text-align: center;
  font-weight: 600;
}

.stat-value {
  font-size: 18px;
  font-weight: 700;
  color: #e9c349;
}

/* ===== ACHIEVEMENTS SECTION ===== */
.achievements-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-top: 16px;
  border-top: 1px solid rgba(138, 0, 255, 0.2);
}

/* ===== RESPONSIVE ===== */
@media (max-width: 1024px) {
  .perfil-container {
    max-width: 95%;
    min-height: auto;
    padding: 24px;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .perfil-container {
    max-width: 100%;
    padding: 16px;
  }

  .perfil-title {
    font-size: 28px;
    line-height: 40px;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .perfil-info-main {
    flex-direction: column;
    text-align: center;
  }

  .actions-section {
    flex-direction: column;
  }

  .btn-primary,
  .btn-secondary {
    width: 100%;
    justify-content: center;
  }
}
</style>
