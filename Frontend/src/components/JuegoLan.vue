<template>
  <div class="juego-lan">
    <!-- Background -->
    <img
      class="background-img"
      alt="Background"
      src="/assets/images/home.png"
    />

    <!-- Content Overlay -->
    <div class="content-wrapper">
      <!-- Header -->
      <header class="header">
        <div class="header-left">
          <button class="btn-back" @click="handleBack" title="Volver">
            <span class="icon">←</span>
          </button>
          <h1 class="title">⚔️ JUEGO LAN</h1>
        </div>
        <button class="btn-exit" @click="handleExit" title="Salir">
          <span class="icon">🔓</span>
        </button>
      </header>

      <!-- Main Content -->
      <div class="main-content">
        <section class="section left-section">
          <div class="card">
            <h2 class="card-title">Crear Partida</h2>
            <div class="card-content">
              <p class="description">Crea una nueva partida en tu red local.</p>
              
              <form @submit.prevent="handleCreateGame" class="form">
                <div class="form-group">
                  <label for="game-name">Nombre de la Partida</label>
                  <input
                    id="game-name"
                    v-model="gameName"
                    type="text"
                    placeholder="Mi Partida Épica"
                    class="input"
                  />
                </div>

                <div class="form-group">
                  <label for="player-name">Tu Nombre</label>
                  <input
                    id="player-name"
                    v-model="playerName"
                    type="text"
                    placeholder="Mi Nombre"
                    class="input"
                  />
                </div>

                <button type="submit" class="btn-submit">Crear Partida</button>
              </form>
            </div>
          </div>
        </section>

        <section class="section right-section">
          <div class="card">
            <h2 class="card-title">Unirse a Partida</h2>
            <div class="card-content">
              <p class="description">Busca y únete a una partida existente en tu red.</p>
              
              <div class="games-list">
                <div
                  v-if="availableGames.length === 0"
                  class="no-games"
                >
                  <p>No hay partidas disponibles</p>
                  <button
                    type="button"
                    @click="handleRefresh"
                    class="btn-refresh"
                  >
                    Actualizar
                  </button>
                </div>

                <div
                  v-for="game in availableGames"
                  :key="game.id"
                  class="game-item"
                  @click="handleJoinGame(game.id)"
                >
                  <div class="game-info">
                    <h3 class="game-name">{{ game.name }}</h3>
                    <p class="game-host">Host: {{ game.host }}</p>
                  </div>
                  <button type="button" class="btn-join">Unirse</button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const emit = defineEmits(['back', 'exit', 'create-game', 'join-game']);

/* Form State */
const gameName = ref('');
const playerName = ref('');

/* Games List */
const availableGames = ref([
  // Placeholder - será reemplazado por datos reales del servidor
]);

/* Handlers */
function handleBack() {
  emit('back');
}

function handleExit() {
  emit('exit');
}

function handleCreateGame() {
  if (gameName.value.trim() && playerName.value.trim()) {
    emit('create-game', {
      gameName: gameName.value,
      playerName: playerName.value,
    });
    gameName.value = '';
    playerName.value = '';
  }
}

function handleJoinGame(gameId) {
  emit('join-game', gameId);
}

function handleRefresh() {
  // Aquí iría la lógica para actualizar la lista de juegos disponibles
  console.log('Refreshing games...');
}
</script>

<style scoped>
/* ===== ROOT ===== */
.juego-lan {
  position: relative;
  width: 1280px;
  height: 1118px;
  margin: 0 auto;
  overflow: hidden;
  font-family: 'Poppins', Arial, sans-serif;
  color: white;
}

/* ===== BACKGROUND ===== */
.background-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 0;
}

/* ===== CONTENT WRAPPER ===== */
.content-wrapper {
  position: relative;
  z-index: 10;
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
}

/* ===== HEADER ===== */
.header {
  flex: 0 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 28px;
  background: linear-gradient(180deg, rgba(13, 14, 15, 0.95) 0%, rgba(13, 14, 15, 0.8) 100%);
  backdrop-filter: blur(8px);
  border-bottom: 2px solid;
  border-image: linear-gradient(90deg, rgba(138, 0, 255, 0.3), rgba(100, 150, 255, 0.3), rgba(138, 0, 255, 0.3)) 1;
  height: 80px;
  position: relative;
}

.header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(138, 0, 255, 0.5), transparent);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.btn-back,
.btn-exit {
  background: linear-gradient(135deg, rgba(138, 0, 255, 0.15), rgba(138, 0, 255, 0.05));
  border: 1px solid rgba(138, 0, 255, 0.4);
  padding: 12px 16px;
  border-radius: 10px;
  cursor: pointer;
  color: white;
  transition: all 300ms cubic-bezier(0.34, 1.56, 0.64, 1);
  font-size: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(138, 0, 255, 0.2);
  position: relative;
  overflow: hidden;
}

.btn-back::before,
.btn-exit::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at center, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
  opacity: 0;
  transition: opacity 300ms ease;
}

.btn-back:hover,
.btn-exit:hover {
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 8px 24px rgba(138, 0, 255, 0.4), inset 0 0 12px rgba(138, 0, 255, 0.2);
  border-color: rgba(138, 0, 255, 0.7);
}

.btn-back:hover {
  background: linear-gradient(135deg, rgba(100, 150, 255, 0.3), rgba(100, 150, 255, 0.15));
  border-color: rgba(100, 150, 255, 0.7);
  box-shadow: 0 8px 24px rgba(100, 150, 255, 0.4), inset 0 0 12px rgba(100, 150, 255, 0.2);
}

.btn-exit:hover {
  background: linear-gradient(135deg, rgba(185, 0, 0, 0.3), rgba(185, 0, 0, 0.15));
  border-color: rgba(185, 0, 0, 0.7);
  box-shadow: 0 8px 24px rgba(185, 0, 0, 0.4), inset 0 0 12px rgba(185, 0, 0, 0.2);
}

.btn-back:active,
.btn-exit:active {
  transform: translateY(0) scale(0.98);
  box-shadow: 0 2px 8px rgba(138, 0, 255, 0.3), inset 0 0 8px rgba(138, 0, 255, 0.15);
}

.title {
  font-size: 28px;
  font-weight: 700;
  letter-spacing: 2px;
  margin: 0;
  color: #e9c349;
}

/* ===== MAIN CONTENT ===== */
.main-content {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  padding: 24px 28px;
  overflow-y: auto;
}

.section {
  display: flex;
  flex-direction: column;
  height: fit-content;
  max-height: 100%;
}

/* ===== CARDS ===== */
.card {
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(138, 0, 255, 0.2);
  border-radius: 16px;
  padding: 28px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
}

.card-title {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
  color: #e9c349;
  letter-spacing: 1px;
}

.card-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.description {
  margin: 0;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.6;
}

/* ===== FORM ===== */
.form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-size: 13px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  letter-spacing: 0.5px;
}

.input {
  padding: 12px 14px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(138, 0, 255, 0.3);
  border-radius: 8px;
  color: white;
  font-size: 14px;
  font-family: 'Poppins', Arial, sans-serif;
  transition: all 200ms ease;
}

.input::placeholder {
  color: rgba(255, 255, 255, 0.4);
}

.input:focus {
  outline: none;
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(138, 0, 255, 0.6);
  box-shadow: 0 0 16px rgba(138, 0, 255, 0.2);
}

/* ===== BUTTONS ===== */
.btn-submit {
  padding: 12px;
  background: linear-gradient(135deg, #8a00ff, #5a00cc);
  border: none;
  border-radius: 8px;
  color: white;
  font-weight: 700;
  cursor: pointer;
  font-size: 14px;
  letter-spacing: 0.8px;
  transition: all 200ms ease;
  text-transform: uppercase;
  margin-top: 8px;
}

.btn-submit:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(138, 0, 255, 0.4);
}

.btn-submit:active {
  transform: translateY(0px);
}

/* ===== GAMES LIST ===== */
.games-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 400px;
  overflow-y: auto;
  padding-right: 8px;
}

.games-list::-webkit-scrollbar {
  width: 6px;
}

.games-list::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 3px;
}

.games-list::-webkit-scrollbar-thumb {
  background: rgba(138, 0, 255, 0.3);
  border-radius: 3px;
}

.games-list::-webkit-scrollbar-thumb:hover {
  background: rgba(138, 0, 255, 0.5);
}

.no-games {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 40px 20px;
  text-align: center;
  opacity: 0.7;
}

.no-games p {
  margin: 0;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
}

.btn-refresh {
  padding: 10px 16px;
  background: rgba(138, 0, 255, 0.15);
  border: 1px solid rgba(138, 0, 255, 0.4);
  border-radius: 6px;
  color: #e9c349;
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
  transition: all 200ms ease;
}

.btn-refresh:hover {
  background: rgba(138, 0, 255, 0.25);
  border-color: rgba(138, 0, 255, 0.6);
}

.game-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px;
  background: rgba(138, 0, 255, 0.08);
  border: 1px solid rgba(138, 0, 255, 0.25);
  border-radius: 10px;
  cursor: pointer;
  transition: all 200ms ease;
}

.game-item:hover {
  background: rgba(138, 0, 255, 0.15);
  border-color: rgba(138, 0, 255, 0.5);
  transform: translateX(4px);
}

.game-info {
  flex: 1;
}

.game-name {
  margin: 0 0 4px 0;
  font-size: 14px;
  font-weight: 700;
  color: #e9c349;
}

.game-host {
  margin: 0;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
}

.btn-join {
  padding: 8px 14px;
  background: rgba(138, 0, 255, 0.2);
  border: 1px solid rgba(138, 0, 255, 0.4);
  border-radius: 6px;
  color: white;
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
  transition: all 200ms ease;
  white-space: nowrap;
  margin-left: 12px;
}

.btn-join:hover {
  background: #8a00ff;
  border-color: #8a00ff;
  transform: scale(1.05);
}

/* ===== RESPONSIVE ===== */
@media (max-width: 1024px) {
  .juego-lan {
    width: 100%;
    height: auto;
    min-height: 100vh;
  }

  .main-content {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .title {
    font-size: 24px;
  }
}

@media (max-width: 640px) {
  .header {
    padding: 16px 16px;
    height: 70px;
  }

  .title {
    font-size: 20px;
  }

  .card {
    padding: 20px;
  }

  .main-content {
    padding: 16px;
  }
}
</style>
