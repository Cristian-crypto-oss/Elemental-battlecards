<template>
  <div class="scene-root">
    <!-- Imagen de fondo del menú -->
    <img
      class="bg-image"
      src="/assets/images/home.png"
      alt="Fondo del menú"
    />

    <!-- HEADER -->
    <div class="header-top-app-bar">
      <div class="header-top-app-bar-overlay" />
      
      <div class="container-header">
        <div class="container-actions">
          <!-- Botón Salir -->
          <button class="btn-icon btn-exit-icon" @click="handleExit" title="Salir">
            <span class="icon">🚪</span>
          </button>
        </div>
      </div>
    </div>

    <!-- MAIN CONTENT -->
    <div class="main">
        <!-- Panel Usuario -->
        <section class="panel user-panel" @click="handleViewProfile">
          <div class="user-card">
            <div class="user-avatar">
              <img src="/assets/images/logo.png" alt="Avatar" />
            </div>
            <div class="user-info">
              <h2>{{ authStore.user?.username || 'Jugador' }}</h2>
              <span class="user-level">NIVEL 45</span>
            </div>
          </div>
          <div class="user-stats">
            <div class="stat">
              <div class="stat-icon">⚡</div>
              <div class="stat-content">
                <span class="stat-label">DIAMANTE IV</span>
                <div class="stat-bar">
                  <div class="stat-fill"></div>
                </div>
              </div>
            </div>
          </div>
          <div class="stats-grid">
            <span>Partidas jugadas</span>  <span>0</span>
            <span>Partidas ganadas</span>  <span>0</span>
            <span>Logros</span>            <span>0/50</span>
            <span>Tiempo Jugado</span>     <span>0h 0m</span>
          </div>
        </section>

        <!-- Tarjetas de Juego -->
        <section class="cards-section">
          <!-- Tarjeta Jugar en LAN -->
          <div class="game-card" @click="handlePlayLAN">
            <img src="/assets/images/mainmenu/lan.jpeg" alt="Jugar en LAN" class="card-image" />
            <div class="card-overlay">
              <h3 class="card-title">JUGAR EN LAN</h3>
              <p class="card-desc">Enfrenta a un amigo en la misma red.</p>
            </div>
          </div>

          <!-- Tarjeta Jugar con Bot -->
          <div class="game-card" @click="handlePlayBot">
            <img src="/assets/images/mainmenu/niveles.jpeg" alt="Jugar con Bot" class="card-image" />
            <div class="card-overlay">
              <h3 class="card-title">JUGAR CON BOT</h3>
              <p class="card-desc">Enfrenta a oponentes en distintos niveles.</p>
            </div>
          </div>

          <!-- Tarjeta Mecánicas -->
          <div class="game-card" @click="openMechanics">
            <img src="/assets/images/mainmenu/mecanicas.jpeg" alt="Mecánicas" class="card-image" />
            <div class="card-overlay">
              <h3 class="card-title">MECÁNICAS</h3>
              <p class="card-desc">Aprende las reglas y domina las estrategias.</p>
            </div>
          </div>
        </section>
      </div>

    <!-- MODAL OVERLAY -->
    <Transition name="modal-fade">
      <div
        v-if="modalVisible"
        class="modal-overlay"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="'modal-title'"
        @click.self="closeModal"
      >
        <div class="modal" :class="{ 'modal--tall': modalTall }">
          <div class="modal-title" id="modal-title">{{ modalTitle }}</div>
          <!-- eslint-disable-next-line vue/no-v-html -->
          <div class="modal-body" v-html="modalBody"></div>
          <div class="modal-actions">
            <button class="btn-close" @click="closeModal">Cerrar</button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useAuthStore } from '../stores/authStore.js';

const authStore = useAuthStore();

const emit = defineEmits(['play-lan', 'play-bot', 'logout', 'view-profile']);

/* ---------- modal state ---------- */
const modalVisible = ref(false);
const modalTall    = ref(false);
const modalTitle   = ref('');
const modalBody    = ref('');

function openModal(title, html = '', tall = false) {
  modalTitle.value  = title;
  modalBody.value   = html;
  modalTall.value   = tall;
  modalVisible.value = true;
}

function closeModal() {
  modalVisible.value = false;
  modalTall.value    = false;
}

/* ---------- ESC global ---------- */
function handleKeydown(e) {
  if (e.key === 'Escape') closeModal();
}
onMounted(() => window.addEventListener('keydown', handleKeydown));
onUnmounted(() => window.removeEventListener('keydown', handleKeydown));

/* ---------- botones header ---------- */
function handleExit() {
  emit('logout');
}

/* ---------- botones de juego ---------- */
function handlePlayLAN() {
  emit('play-lan');
}

function handlePlayBot() {
  emit('play-bot');
}

function handleViewProfile() {
  emit('view-profile');
}

/* ---------- modales de acciones ---------- */
function openConfig() {
  openModal('Configuración');
}

function openAbout() {
  openModal(
    'Acerca de',
    `<p>Este proyecto es un juego de cartas estratégico digital inspirado en la Teoría de Conjuntos, donde cada mecánica del sistema corresponde a una operación matemática formal.</p>
    <p>El objetivo del jugador es vencer al oponente mediante combate, o completar el conjunto total de esencias y elementos activos en el campo.</p>
    <p>El sistema de juego se basa en los siguientes principios matemáticos:</p>
    <ul>
      <li><strong>Unión (A ∪ B ∪ C):</strong> Representada por la obtención simultánea de los 6 tipos elementales en tu lado del campo o la colección completa de las 6 esencias.</li>
      <li><strong>Intersección (A ∩ A):</strong> La fusión de dos cartas idénticas para crear cartas de nivel superior.</li>
      <li><strong>Diferencia (A − B):</strong> El sistema de ventajas elementales, donde un elemento supera al que "resta".</li>
      <li><strong>Complemento (Aᶜ):</strong> Cartas de nivel 3 que quedan fuera de la relación elemental y anulan ventajas y desventajas.</li>
    </ul>
    <p>Durante la partida, el jugador administra recursos (esencias), controla un campo de seis espacios, invoca cartas, realiza fusiones, interactúa con el rival mediante ataques y construye estrategias basadas en combinaciones elementales y operaciones matemáticas.</p>
    <p>El resultado es un TCG elegante, educativo y competitivo, con una identidad visual basada en iconografía elemental, colores definidos y un layout claro optimizado para pantallas modernas.</p>`
  );
}

function openMechanics() {
  openModal(
    'Mecánicas del juego',
    `<ol>
      <li><strong>Objetivo del Juego:</strong>
        <ul>
          <li><strong>Principal:</strong> El primer jugador que logre tener los 6 tipos de cartas distintos en su campo gana la partida.</li>
          <li><strong>Secundario:</strong> El jugador que logre llenar las esencias elementales, gana.</li>
        </ul>
      </li>

      <li><strong>Tipos y Ventajas:</strong>
        <p>El sistema está dividido en dos triángulos independientes:</p>
        <h3>Triángulo 1:</h3>
        <ul>
          <li>Fuego vence a Planta</li>
          <li>Planta vence a Agua</li>
          <li>Agua vence a Fuego</li>
        </ul>
        <h3>Triángulo 2:</h3>
        <ul>
          <li>Luz vence a Sombra</li>
          <li>Sombra vence a Espíritu</li>
          <li>Espíritu vence a Luz</li>
        </ul>
        <p><strong>Relación entre triángulos:</strong> Todos los tipos de un triángulo son neutrales contra los del otro triángulo.</p>
      </li>

      <li><strong>Niveles de Carta:</strong>
        <p>Las cartas pueden tener 3 niveles:</p>
        <ul>
          <li><strong>⭐ Nivel 1 (base)</strong></li>
          <li><strong>⭐⭐ Nivel 2 (fusión de dos cartas nivel 1 iguales)</strong></li>
          <li><strong>⭐⭐⭐ Nivel 3 (fusión de dos cartas nivel 2 iguales)</strong></li>
        </ul>
        <p><strong>Efecto de los niveles en el combate:</strong></p>
        <ul>
          <li>Mismo nivel: se aplica ventaja de tipo normal.</li>
          <li>1 nivel arriba: se vuelve neutral al tipo que tiene desventaja, le gana al tipo que es neutral.</li>
          <li>2 niveles arriba: ganará siempre.</li>
        </ul>
      </li>

      <li><strong>Turnos:</strong>
        <p>El juego es por turnos, 1v1. En cada turno el jugador puede realizar 1 sola acción:</p>
        <ul>
          <li>Poner una carta en el campo.</li>
          <li>Atacar con una carta.</li>
          <li>Fusionar (si cumple requisitos).</li>
        </ul>
        <p>Después de realizar la acción, el turno termina.</p>
      </li>

      <li><strong>Regla de Ataque Obligatorio:</strong>
        <p>Cada jugador debe atacar al menos una vez cada 3 turnos propios. Puedes atacar antes si quieres. Si atacas antes (por ejemplo, en tu turno 2), el contador se reinicia. Si llegas al turno 3 sin atacar, ese turno obligatoriamente debes atacar.</p>
        <p><strong>Otros casos:</strong></p>
        <ul>
          <li>Si tienes que atacar obligatoriamente y tu oponente no tiene cartas en el campo, podrás llenar una Esencia elemental (atacando).</li>
          <li>Si tienes que atacar obligatoriamente y no tienes cartas, saltará el turno y el contador se reiniciará.</li>
        </ul>
      </li>

      <li><strong>Campo y Mano:</strong>
        <p>Cada jugador tiene 6 espacios en el campo. Se puede tener máximo 1 carta por espacio. Se inicia con 4 cartas en la mano. Cuando colocas una carta en el campo, robas una nueva del mazo.</p>
      </li>

      <li><strong>Robos y Mazo:</strong>
        <p>Cada jugador inicia con 48 cartas (8 copias de cada tipo). Cuando pones una carta, robas una del mazo (para mantener 4 en la mano). Si el mazo se queda sin cartas, se baraja automáticamente el cementerio (ver Regla 10).</p>
      </li>

      <li><strong>Colocar Cartas:</strong>
        <p>Las cartas siempre se colocan boca abajo (ocultas para el rival). Se revelan en tres casos:</p>
        <ul>
          <li>Cuando atacan.</li>
          <li>Cuando son atacadas.</li>
          <li>Cuando se fusionan.</li>
        </ul>
        <p>Una vez reveladas, permanecen boca arriba para el resto de la partida.</p>
      </li>

      <li><strong>Combate:</strong>
        <p><strong>Cómo se realiza:</strong></p>
        <ul>
          <li>El jugador atacante elige una de sus cartas.</li>
          <li>Elige una carta del oponente.</li>
        </ul>
        <p><strong>Resultados:</strong></p>
        <ul>
          <li>Si tu carta gana → la carta enemiga muere.</li>
          <li>Si tu carta pierde → tu carta muere.</li>
          <li>Si son neutrales → ninguna muere.</li>
        </ul>
      </li>

      <li><strong>Muertes y Cementerio:</strong>
        <p>Cuando una carta muere, va al cementerio. Cuando las 48 cartas del mazo se acaban, las del cementerio se revuelven y se crea un nuevo mazo.</p>
      </li>

      <li><strong>Fusiones:</strong>
        <p><strong>Requisitos:</strong> Tener 2 cartas iguales (tipo y nivel) en el campo. Fusionar consume tu acción del turno.</p>
        <p><strong>Efecto:</strong> Se forma una sola carta del mismo tipo y sube un nivel. La carta fusionada se revela.</p>
      </li>

      <li><strong>Restricciones de Ataques según Nivel:</strong>
        <ul>
          <li>⭐ Nivel 1 → puede atacar cada turno (sin límites).</li>
          <li>⭐⭐ Nivel 2 → puede atacar 2 turnos seguidos luego debe descansar 1 turno.</li>
          <li>⭐⭐⭐ Nivel 3 → puede atacar 1 turno, luego debe descansar 1 turno.</li>
        </ul>
      </li>

      <li><strong>Esencias Elementales:</strong>
        <p>Cada jugador tiene 6 esencias, una por cada tipo elemental. Todas las esencias comienzan vacías. Se llenan cuando se cumplen las condiciones de atacar y no haber cartas del oponente para defender.</p>
      </li>

      <li><strong>Revelación:</strong>
        <p>Las cartas boca abajo se revelan solo cuando:</p>
        <ul>
          <li>Atacan.</li>
          <li>Son atacadas.</li>
          <li>Se fusionan (la resultante entra boca arriba).</li>
        </ul>
      </li>

      <li><strong>Límites de Tiempo:</strong>
        <p>Cada turno tiene un máximo de 12 segundos. Si el jugador no realiza acción → pierde el turno.</p>
      </li>

      <li><strong>Fin del Juego:</strong>
        <p>Un jugador gana si:</p>
        <ul>
          <li>Logra colocar los 6 tipos distintos en su campo (no importa el orden ni si están ocultas).</li>
          <li>Logra llenar las esencias elementales (no importa el orden).</li>
          <li>Por abandono: Si un jugador no actúa durante 3 turnos seguidos → se considera rendido. A los 3 turnos sin acción, derrota automática.</li>
        </ul>
      </li>
    </ol>`,
    true /* modal--tall */
  );
}
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

/* ---- WRAP ---- */
.wrap {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  z-index: 1;
  transition: filter 160ms ease;
}
.wrap.blurred {
  filter: blur(6px);
}

/* ---- HEADER ---- */
.header {
  flex: 0 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 28px;
}
.logo-box {
  display: flex;
  align-items: center;
  gap: 12px;
}
.logo {
  width: 50px;
  height: 50px;
}
.game-title {
  margin: 0;
  font-size: 22px;
}
.user {
  font-size: 14px;
  opacity: 0.85;
}
.btn-exit {
  background: #b90000;
  padding: 10px 16px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  color: white;
  font-weight: bold;
}

/* ---- MAIN ---- */
.main {
  flex: 1;
  display: flex;
  padding: 2.5vh 3vw;
  gap: 5vw;
  overflow: hidden;
  justify-content: center;
  align-items: center;
}

/* ---- PANELS ---- */
.panel {
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(8px);
  border-radius: 14px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 0 12px rgba(0, 0, 0, 0.55);
  max-height: 100%;
}

.panel-title {
  margin: 0 0 20px 0;
  font-size: 28px;
}

/* ---- STATS GRID ---- */
.stats-grid {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 8px 15px;
  margin-bottom: 24px;
}

/* ---- USER PANEL ---- */
.user-panel {
  width: 25%;
  min-width: 280px;
  height: 60%;
  min-height: 300px;
  cursor: pointer;
  transition: all 300ms ease;
}

.user-panel:hover {
  transform: translateY(-8px);
  box-shadow: 0 8px 24px rgba(138, 0, 255, 0.4);
  background: rgba(138, 0, 255, 0.1);
  border: 1px solid rgba(138, 0, 255, 0.3);
}

.user-card {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 20px;
  border-bottom: 2px solid rgba(138, 0, 255, 0.3);
  padding-bottom: 16px;
}

.user-avatar {
  width: 60px;
  height: 60px;
  border: 3px solid #8a00ff;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-info h2 {
  margin: 0;
  font-size: 18px;
}

.user-level {
  font-size: 12px;
  color: #8a00ff;
  font-weight: bold;
}

.user-stats {
  margin-bottom: 20px;
}

.stat {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 10px;
}

.stat-icon {
  font-size: 24px;
}

.stat-content {
  flex: 1;
}

.stat-label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 4px;
}

.stat-bar {
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  overflow: hidden;
}

.stat-fill {
  height: 100%;
  width: 60%;
  background: linear-gradient(90deg, #8a00ff, #ff6600);
}

/* ---- CARDS SECTION ---- */
.cards-section {
  flex: 1;
  display: flex;
  gap: 25px;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
}

/* ---- GAME CARDS ---- */
.game-card {
  position: relative;
  width: 240px;
  height: 300px;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 300ms ease;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
  flex-shrink: 0;
}

.game-card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 12px 32px rgba(138, 0, 255, 0.3);
}

.card-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.card-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.2) 0%, rgba(0, 0, 0, 0.8) 100%);
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 20px;
  color: white;
  transition: all 300ms ease;
}

.game-card:hover .card-overlay {
  background: linear-gradient(180deg, rgba(138, 0, 255, 0.3) 0%, rgba(0, 0, 0, 0.95) 100%);
}

.card-title {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.card-desc {
  margin: 0;
  font-size: 13px;
  opacity: 0.9;
  line-height: 1.4;
}

/* ---- MODAL OVERLAY ---- */
.modal-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.45);
  z-index: 10000;
  backdrop-filter: blur(2px);
}

.modal {
  background: rgba(10, 10, 10, 0.95);
  color: white;
  padding: 20px;
  border-radius: 10px;
  max-width: 720px;
  width: 90%;
  max-height: 90vh;
  overflow: visible;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.6);
}

.modal--tall {
  max-height: 80vh;
  overflow: auto;
}
.modal--tall .modal-body {
  max-height: calc(80vh - 80px);
  overflow: auto;
}

.modal-title {
  font-weight: 700;
  font-size: 20px;
  margin-bottom: 8px;
}
.modal-body {
  margin-bottom: 16px;
}
.modal-actions {
  display: flex;
  justify-content: flex-end;
}
.btn-close {
  padding: 8px 12px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  background: #666;
  color: white;
}

/* ---- MODAL TRANSITION ---- */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 160ms ease;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

/* ---- MODAL CONTENT STYLES (v-html) ---- */
.modal-body :deep(p)  { margin: 0 0 10px 0; }
.modal-body :deep(ul),
.modal-body :deep(ol) { padding-left: 20px; margin: 0 0 10px 0; }
.modal-body :deep(li) { margin-bottom: 4px; }
.modal-body :deep(h3) { margin: 10px 0 6px 0; }
</style>
