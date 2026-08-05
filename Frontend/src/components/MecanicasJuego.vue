<template>
  <div class="mecanicas-juego">
    <!-- Background -->
    <img
      class="background-img"
      alt="Background"
      src="/assets/images/home.png"
    />

    <!-- Content Wrapper -->
    <div class="content-wrapper">
      <!-- Header Fijo -->
      <header class="header">
        <div class="header-left">
          <button class="btn-back" @click="handleBack" title="Volver">
            <span class="icon">←</span>
          </button>
          <h1 class="title">MECÁNICAS DEL JUEGO</h1>
        </div>
      </header>

      <!-- Main Content Scrolleable -->
      <div class="main-content">
        <!-- Scroll Indicator -->
        <div class="scroll-indicator" v-if="scrollProgress < 100">
          <div class="scroll-container">
            <span class="scroll-text">SCROLL</span>
          </div>
          <div class="scroll-icon">↓</div>
        </div>

        <!-- Contenedor de secciones -->
        <div class="sections-container">
          <!-- Sección 1: Objetivo del Juego -->
          <section class="section">
            <div class="section-header">
              <span class="section-icon">🎯</span>
              <h2 class="section-title">Objetivo del Juego</h2>
            </div>
            <div class="section-content">
              <div class="subsection">
                <h3 class="subsection-title">PRINCIPAL</h3>
                <p class="subsection-text">
                  Derrotar al oponente recolectando 6 tipos distintos de cartas elementales (Fuego, Planta, Agua, Luz, Sombra, Espíritu).
                </p>
              </div>
              <div class="subsection">
                <h3 class="subsection-title">SECUNDARIO</h3>
                <p class="subsection-text">
                  Llenar las Esencias Elementales mediante acciones específicas durante el combate para obtener ventajas definitivas.
                </p>
              </div>
            </div>
          </section>

          <!-- Sección 2: Tipos y Ventajas -->
          <section class="section">
            <div class="section-header">
              <span class="section-icon">⚔️</span>
              <h2 class="section-title">Tipos y Ventajas</h2>
            </div>
            <div class="section-content two-columns">
              <div class="column">
                <h3 class="column-title">Triángulo 1</h3>
                <ul class="list">
                  <li>🔥 Fuego vence a Planta</li>
                  <li>🌿 Planta vence a Agua</li>
                  <li>💧 Agua vence a Fuego</li>
                </ul>
              </div>
              <div class="column">
                <h3 class="column-title">Triángulo 2</h3>
                <ul class="list">
                  <li>✨ Luz vence a Sombra</li>
                  <li>🌑 Sombra vence a Espíritu</li>
                  <li>🌀 Espíritu vence a Luz</li>
                </ul>
              </div>
              <div class="full-width note">
                <span class="border-left"></span>
                <p>Todos los tipos de un triángulo son neutrales contra los del otro triángulo.</p>
              </div>
            </div>
          </section>

          <!-- Sección 3: Niveles de Carta -->
          <section class="section">
            <div class="section-header">
              <span class="section-icon">⭐</span>
              <h2 class="section-title">Niveles de Carta</h2>
            </div>
            <div class="section-content">
              <div class="level-item">
                <span class="level-badge">⭐</span>
                <div class="level-info">
                  <p class="level-desc">Nivel 1 (base) - Puede atacar cada turno sin límites.</p>
                </div>
              </div>
              <div class="level-item">
                <span class="level-badge">⭐⭐</span>
                <div class="level-info">
                  <p class="level-desc">Nivel 2 (fusión) - Puede atacar 2 turnos seguidos luego debe descansar 1 turno.</p>
                </div>
              </div>
              <div class="level-item">
                <span class="level-badge">⭐⭐⭐</span>
                <div class="level-info">
                  <p class="level-desc">Nivel 3 (fusión) - Puede atacar 1 turno, luego debe descansar 1 turno.</p>
                </div>
              </div>
            </div>
          </section>

          <!-- Sección 4: Turnos y Acciones -->
          <section class="section">
            <div class="section-header">
              <span class="section-icon">🔄</span>
              <h2 class="section-title">Turnos y Acciones</h2>
            </div>
            <div class="section-content">
              <p class="description">El duelo es 1v1. Cada jugador dispone de 1 acción por turno, eligiendo entre:</p>
              <div class="actions-row">
                <div class="action-box">
                  <span class="action-icon">🎴</span>
                  <span class="action-text">COLOCAR</span>
                </div>
                <div class="action-box">
                  <span class="action-icon">⚡</span>
                  <span class="action-text">ATACAR</span>
                </div>
                <div class="action-box">
                  <span class="action-icon">🔗</span>
                  <span class="action-text">FUSIONAR</span>
                </div>
              </div>
            </div>
          </section>

          <!-- Sección 5: Regla de Ataque Obligatorio (Destacada) -->
          <section class="section section-highlight">
            <div class="section-header">
              <span class="section-icon">⚠️</span>
              <h2 class="section-title">Regla de Ataque Obligatorio</h2>
            </div>
            <div class="section-content highlight-content">
              <p class="highlight-text">
                La pasividad es castigada. Es obligatorio realizar al menos un ataque cada 3 turnos. De lo contrario, se penalizará la esencia del jugador.
              </p>
            </div>
          </section>

          <!-- Sección 6: Campo, Mano y Mazo -->
          <section class="section">
            <div class="section-header">
              <span class="section-icon">📦</span>
              <h2 class="section-title">Campo, Mano y Mazo</h2>
            </div>
            <div class="section-content">
              <div class="resource-items">
                <div class="resource-box">
                  <span class="resource-number">6</span>
                  <span class="resource-label">CAMPO</span>
                </div>
                <div class="resource-box">
                  <span class="resource-number">4</span>
                  <span class="resource-label">MANO</span>
                </div>
                <div class="resource-box">
                  <span class="resource-number">48</span>
                  <span class="resource-label">MAZO</span>
                </div>
              </div>
            </div>
          </section>

          <!-- Sección 7: Colocación y Combate -->
          <section class="section">
            <div class="section-header">
              <span class="section-icon">⚔️</span>
              <h2 class="section-title">Colocación y Combate</h2>
            </div>
            <div class="section-content">
              <ul class="list-detailed">
                <li><strong>Colocación:</strong> Las cartas se colocan boca abajo (ocultas para el rival).</li>
                <li><strong>Revelación:</strong> Se revelan solo cuando atacan, son atacadas o se fusionan.</li>
                <li><strong>Combate:</strong> Compara fuerzas. Gana quien tenga ventaja o nivel superior.</li>
              </ul>
            </div>
          </section>

          <!-- Sección 8: Fusiones y Restricciones -->
          <section class="section">
            <div class="section-header">
              <span class="section-icon">🔗</span>
              <h2 class="section-title">Fusiones y Restricciones</h2>
            </div>
            <div class="section-content">
              <p class="description">Para fusionar, se requieren dos cartas del mismo tipo y nivel en el campo.</p>
              <div class="fusion-note">
                <p>La fusión crea una carta de nivel superior del mismo tipo. La carta fusionada se revela.</p>
              </div>
            </div>
          </section>

          <!-- Sección 9: Esencias y Tiempo -->
          <section class="section">
            <div class="section-header">
              <span class="section-icon">✨</span>
              <h2 class="section-title">Esencias y Tiempo</h2>
            </div>
            <div class="section-content">
              <div class="essence-box">
                <h3 class="essence-title">ESENCIAS</h3>
                <p class="essence-text">Las Esencias Elementales se cargan con cada victoria. Al completarse, otorgan un efecto global trascendental.</p>
              </div>
            </div>
          </section>

          <!-- Sección 10: Fin del Juego -->
          <section class="section">
            <div class="section-header">
              <span class="section-icon">🏁</span>
              <h2 class="section-title">Fin del Juego</h2>
            </div>
            <div class="section-content">
              <ul class="list-end">
                <li><strong>Condición 1:</strong> Logra colocar los 6 tipos distintos en tu campo.</li>
                <li><strong>Condición 2:</strong> Logra llenar las esencias elementales de tu lado.</li>
                <li><strong>Derrota:</strong> Sin acciones durante 3 turnos seguidos = rendición automática.</li>
              </ul>
            </div>
          </section>
        </div>
      </div>

      <!-- Settings Button -->
      <SettingsButton @click="handleOpenSettings" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import SettingsButton from './SettingsButton.vue';

const emit = defineEmits(['back', 'view-settings']);
const scrollProgress = ref(0);

const handleBack = () => {
  emit('back');
};

const handleOpenSettings = () => {
  emit('view-settings');
};

const handleScroll = (event) => {
  const element = event.target;
  const scrollTop = element.scrollTop;
  const scrollHeight = element.scrollHeight - element.clientHeight;
  scrollProgress.value = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
};

onMounted(() => {
  const mainContent = document.querySelector('.main-content');
  if (mainContent) {
    mainContent.addEventListener('scroll', handleScroll);
  }
});

onUnmounted(() => {
  const mainContent = document.querySelector('.main-content');
  if (mainContent) {
    mainContent.removeEventListener('scroll', handleScroll);
  }
});
</script>

<style scoped>
/* ===== ROOT ===== */
.mecanicas-juego {
  position: relative;
  width: 1280px;
  height: 100vh;
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
  padding: 16px 48px;
  background: rgba(18, 20, 20, 0.95);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid #4d4635;
  height: 65px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.btn-back {
  background: transparent;
  border: 1px solid rgba(242, 202, 80, 0.3);
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  color: #f2ca50;
  transition: all 200ms ease;
  font-size: 16px;
}

.btn-back:hover {
  background: rgba(242, 202, 80, 0.1);
  border-color: rgba(242, 202, 80, 0.6);
}

.title {
  font-size: 24px;
  font-weight: 700;
  letter-spacing: 2.4px;
  margin: 0;
  color: #f2ca50;
  text-transform: uppercase;
}

/* ===== MAIN CONTENT ===== */
.main-content {
  flex: 1;
  overflow-y: scroll;
  overflow-x: hidden;
  padding: 96px 208px 128px;
  position: relative;
}

/* ===== SCROLL INDICATOR ===== */
.scroll-indicator {
  position: absolute;
  bottom: 113px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  opacity: 0.5;
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateX(-50%) translateY(0); }
  50% { transform: translateX(-50%) translateY(8px); }
}

.scroll-container {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 15px;
}

.scroll-text {
  font-size: 10px;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: #f2ca50;
  font-weight: 400;
}

.scroll-icon {
  width: 12px;
  height: 13.4px;
  background: #f2ca50;
  clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
}

/* ===== SECTIONS CONTAINER ===== */
.sections-container {
  display: flex;
  flex-direction: column;
  gap: 32px;
  width: 100%;
  max-width: 864px;
}

/* ===== SECTION BASE ===== */
.section {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 24px;
  background: linear-gradient(105.56deg, rgba(26, 54, 93, 0.4) 0%, rgba(15, 23, 42, 0.8) 100%),
    url('/assets/images/home.png');
  background-blend-mode: overlay;
  border: 1px solid rgba(43, 108, 176, 0.5);
  border-radius: 8px;
  box-shadow: 0px 0px 20px rgba(26, 54, 93, 0.3);
}

.section-highlight {
  background: linear-gradient(100.28deg, rgba(66, 153, 225, 0.3) 0%, rgba(66, 153, 225, 0.15) 100%),
    url('/assets/images/home.png');
  border: 2px solid #4299e1;
  box-shadow: 0px 0px 25px rgba(66, 153, 225, 0.4);
}

/* ===== SECTION HEADER ===== */
.section-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-bottom: 8px;
}

.section-icon {
  font-size: 20px;
}

.section-title {
  margin: 0;
  font-size: 24px;
  font-weight: 400;
  letter-spacing: 1px;
  color: #f2ca50;
  font-family: 'Libre Caslon Text', Helvetica, sans-serif;
}

/* ===== SECTION CONTENT ===== */
.section-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
  background: rgba(18, 20, 20, 0.6);
  border: 1px solid rgba(242, 202, 80, 0.2);
  border-radius: 6px;
  backdrop-filter: blur(4px);
}

.section-content.two-columns {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.section-content.highlight-content {
  background: rgba(66, 153, 225, 0.15);
  border-color: rgba(66, 153, 225, 0.4);
}

/* ===== SUBSECTION ===== */
.subsection {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.subsection-title {
  margin: 0;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.7px;
  text-transform: uppercase;
  color: #f2ca50;
}

.subsection-text {
  margin: 0;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.85);
  line-height: 1.6;
}

/* ===== COLUMNS ===== */
.column {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(242, 202, 80, 0.2);
  border-radius: 4px;
  backdrop-filter: blur(2px);
}

.column-title {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: #f2ca50;
}

.list {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.list li {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.6;
}

.full-width {
  grid-column: 1 / -1;
}

.note {
  display: flex;
  gap: 12px;
  padding: 12px;
  background: rgba(66, 153, 225, 0.1);
  border: 1px solid rgba(66, 153, 225, 0.3);
  border-radius: 4px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.75);
  font-style: italic;
}

.border-left {
  width: 2px;
  background: #f2ca50;
  flex-shrink: 0;
}

.note p {
  margin: 0;
}

/* ===== LEVEL ITEMS ===== */
.level-item {
  display: flex;
  gap: 16px;
  align-items: flex-start;
  padding: 12px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(242, 202, 80, 0.2);
  border-radius: 4px;
  backdrop-filter: blur(2px);
}

.level-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 40px;
  height: 40px;
  background: rgba(66, 153, 225, 0.2);
  border: 1px solid rgba(66, 153, 225, 0.4);
  border-radius: 4px;
  font-size: 16px;
  font-weight: 700;
  color: #f2ca50;
}

.level-info {
  flex: 1;
}

.level-desc {
  margin: 0;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.85);
  line-height: 1.6;
}

/* ===== DESCRIPTION ===== */
.description {
  margin: 0;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.85);
  line-height: 1.6;
}

/* ===== ACTIONS ROW ===== */
.actions-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-top: 12px;
}

.action-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 12px;
  gap: 4px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(242, 202, 80, 0.2);
  border-radius: 4px;
  min-height: 65px;
  backdrop-filter: blur(2px);
}

.action-icon {
  font-size: 20px;
}

.action-text {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  color: #f2ca50;
  text-align: center;
}

/* ===== HIGHLIGHT TEXT ===== */
.highlight-text {
  margin: 0;
  font-size: 14px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.6;
}

/* ===== RESOURCE ITEMS ===== */
.resource-items {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-top: 12px;
}

.resource-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 12px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(242, 202, 80, 0.2);
  border-radius: 4px;
  min-height: 65px;
  gap: 4px;
  backdrop-filter: blur(2px);
}

.resource-number {
  font-size: 24px;
  font-weight: 700;
  color: #f2ca50;
}

.resource-label {
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.75);
}

/* ===== LIST DETAILED ===== */
.list-detailed {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.list-detailed li {
  margin: 0;
  padding: 0;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.85);
  line-height: 1.6;
}

.list-detailed strong {
  color: #f2ca50;
  font-weight: 700;
}

/* ===== FUSION NOTE ===== */
.fusion-note {
  padding: 12px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(242, 202, 80, 0.2);
  border-radius: 4px;
  font-style: italic;
  font-weight: 500;
  backdrop-filter: blur(2px);
}

.fusion-note p {
  margin: 0;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.85);
}

/* ===== ESSENCE BOX ===== */
.essence-box {
  padding: 12px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(242, 202, 80, 0.2);
  border-radius: 4px;
  backdrop-filter: blur(2px);
}

.essence-title {
  margin: 0 0 8px 0;
  font-size: 14px;
  font-weight: 600;
  text-transform: uppercase;
  color: #f2ca50;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.essence-text {
  margin: 0;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.6;
}

/* ===== LIST END ===== */
.list-end {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.list-end li {
  display: flex;
  gap: 8px;
  margin: 0;
  padding: 0;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.85);
  font-weight: 500;
}

.list-end strong {
  color: #f2ca50;
}

/* ===== SCROLLBAR ===== */
.main-content::-webkit-scrollbar {
  width: 8px;
}

.main-content::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
}

.main-content::-webkit-scrollbar-thumb {
  background: rgba(242, 202, 80, 0.4);
  border-radius: 4px;
}

.main-content::-webkit-scrollbar-thumb:hover {
  background: rgba(242, 202, 80, 0.6);
}

/* ===== RESPONSIVE ===== */
@media (max-width: 1400px) {
  .mecanicas-juego {
    width: 100%;
  }

  .main-content {
    padding: 96px 100px 128px;
  }
}

@media (max-width: 1024px) {
  .header {
    padding: 16px 28px;
  }

  .title {
    font-size: 20px;
  }

  .main-content {
    padding: 96px 50px 128px;
  }

  .sections-container {
    max-width: 100%;
  }

  .section-content.two-columns {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .mecanicas-juego {
    width: 100%;
    height: 100vh;
  }

  .header {
    padding: 12px 16px;
    height: 56px;
  }

  .title {
    font-size: 18px;
    letter-spacing: 1.5px;
  }

  .main-content {
    padding: 80px 20px 100px;
  }

  .section {
    padding: 16px;
  }

  .section-content {
    padding: 12px;
  }

  .actions-row {
    grid-template-columns: 1fr;
  }

  .resource-items {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>
