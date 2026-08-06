# Guía de Uso del Store de Perfil del Jugador (Zustand)

## 📦 Estructura del Store

El store de perfil del jugador está implementado con **Zustand** y proporciona:

- ✅ Estado global persistente (localStorage)
- ✅ Reactividad automática con Vue
- ✅ API simple y directa
- ✅ Sincronización entre componentes

---

## 🚀 Cómo usar en componentes Vue

### 1. Importar el composable

```javascript
import { usePlayerProfile } from '../composables/usePlayerProfile.js';
```

### 2. Usar en el componente

```vue
<script setup>
import { usePlayerProfile } from '../composables/usePlayerProfile.js';

const { 
  profile,           // Estado reactivo del perfil
  displayName,       // Nombre del jugador (computed)
  levelProgress,     // Progreso de nivel en % (computed)
  rankProgress,      // Progreso de rango en % (computed)
  formattedPlayTime, // Tiempo formateado (computed)
  
  // Acciones
  setUsername,
  addExperience,
  recordMatch,
  // ... etc
} = usePlayerProfile();
</script>

<template>
  <div>
    <h2>{{ displayName }}</h2>
    <p>Nivel: {{ profile?.level }}</p>
    <p>Experiencia: {{ profile?.experience }} / {{ profile?.experienceToNextLevel }}</p>
    <div class="progress-bar" :style="{ width: levelProgress + '%' }"></div>
  </div>
</template>
```

---

## 📊 Actualizar estadísticas del jugador

### Registrar resultado de una partida

```javascript
import { usePlayerProfile } from '../composables/usePlayerProfile.js';

const { recordMatch, addExperience, addRankPoints } = usePlayerProfile();

// Cuando termina una partida
function onGameEnd(result) {
  // Registrar la partida (victoria/derrota)
  recordMatch({
    won: result.winner === 'player',
    gameType: 'bot', // 'bot' o 'lan'
    difficulty: 'medium', // 'easy', 'medium', 'hard'
    duration: result.matchDuration // en segundos
  });
  
  // Añadir experiencia
  if (result.winner === 'player') {
    addExperience(100); // +100 XP por ganar
    addRankPoints(25);  // +25 puntos de rango
  } else {
    addExperience(50);   // +50 XP por perder
    addRankPoints(-10);  // -10 puntos de rango
  }
}
```

### Actualizar estadísticas de cartas

```javascript
import { usePlayerProfile } from '../composables/usePlayerProfile.js';

const { updateCardStats } = usePlayerProfile();

// Durante el juego
function onCardPlayed(cardType) {
  updateCardStats({
    totalCardsPlayed: profile.value.cardStats.totalCardsPlayed + 1,
    favoriteElement: cardType // actualizar elemento favorito
  });
}

function onCardFusion() {
  updateCardStats({
    totalFusions: profile.value.cardStats.totalFusions + 1
  });
}

function onLevel3CardCreated() {
  updateCardStats({
    level3CardsCreated: profile.value.cardStats.level3CardsCreated + 1
  });
}
```

---

## 🎯 Uso en Phaser (GameScene.js)

Puedes usar el store directamente desde Phaser sin Vue:

```javascript
// En GameScene.js
import playerProfileStore from '../stores/playerProfileStore.js';

export default class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  create() {
    // Obtener el estado actual
    const playerProfile = playerProfileStore.getState().profile;
    console.log('Jugador:', playerProfile.username);
    console.log('Nivel:', playerProfile.level);
    
    // Actualizar estadísticas cuando termine el juego
    this.events.on('game-end', (winner) => {
      this.updatePlayerStats(winner);
    });
  }

  updatePlayerStats(winner) {
    const store = playerProfileStore.getState();
    
    // Registrar la partida
    store.recordMatch({
      won: winner === 'player',
      gameType: 'bot',
      difficulty: 'medium',
      duration: this.getMatchDuration()
    });
    
    // Añadir experiencia
    if (winner === 'player') {
      store.addExperience(100);
      store.addRankPoints(25);
      
      // Desbloquear logro si es la primera victoria
      if (store.profile.stats.matchesWon === 1) {
        store.unlockAchievement('first-win');
      }
    }
  }

  getMatchDuration() {
    // Calcular duración de la partida en segundos
    return Math.floor(this.time.now / 1000);
  }
}
```

---

## 🏆 Sistema de logros

### Desbloquear logros

```javascript
import { usePlayerProfile } from '../composables/usePlayerProfile.js';

const { unlockAchievement, isAchievementUnlocked } = usePlayerProfile();

// Verificar y desbloquear logros
function checkAchievements() {
  const profile = playerProfileStore.getState().profile;
  
  // Primera partida
  if (profile.stats.matchesPlayed === 1 && !isAchievementUnlocked('first-game')) {
    unlockAchievement('first-game');
    showAchievementNotification('¡Primera Partida!');
  }
  
  // 5 victorias seguidas
  if (profile.stats.currentWinStreak === 5 && !isAchievementUnlocked('win-streak-5')) {
    unlockAchievement('win-streak-5');
    showAchievementNotification('¡En Fuego! 5 victorias seguidas');
  }
  
  // Alcanzar nivel 10
  if (profile.level >= 10 && !isAchievementUnlocked('level-10')) {
    unlockAchievement('level-10');
    showAchievementNotification('¡Nivel 10 alcanzado!');
  }
}
```

---

## 📈 Sistema de niveles y experiencia

```javascript
import { usePlayerProfile } from '../composables/usePlayerProfile.js';

const { profile, addExperience } = usePlayerProfile();

// Añadir XP con feedback visual
function rewardPlayer(xpAmount) {
  const oldLevel = profile.value.level;
  
  addExperience(xpAmount);
  
  // Verificar si subió de nivel
  if (profile.value.level > oldLevel) {
    console.log(`¡Subiste al nivel ${profile.value.level}!`);
    showLevelUpAnimation();
  }
}

// Recompensas por acciones
function onPlayerAction(action) {
  switch(action) {
    case 'win-match':
      rewardPlayer(100);
      break;
    case 'lose-match':
      rewardPlayer(50);
      break;
    case 'first-fusion':
      rewardPlayer(25);
      break;
    case 'create-level-3-card':
      rewardPlayer(50);
      break;
  }
}
```

---

## 🎨 Mostrar datos en la UI

### Componente de perfil compacto

```vue
<template>
  <div class="player-card">
    <img :src="profile?.avatar" alt="Avatar" class="avatar" />
    <div class="info">
      <h3>{{ displayName }}</h3>
      <div class="level-bar">
        <span>Nivel {{ profile?.level }}</span>
        <div class="progress">
          <div class="fill" :style="{ width: levelProgress + '%' }"></div>
        </div>
      </div>
      <div class="stats">
        <span>🏆 {{ profile?.stats?.matchesWon }}</span>
        <span>⭐ {{ profile?.stats?.winRate }}%</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { usePlayerProfile } from '../composables/usePlayerProfile.js';

const { 
  profile, 
  displayName, 
  levelProgress 
} = usePlayerProfile();
</script>
```

---

## 💾 Persistencia

El store se guarda automáticamente en `localStorage` con la clave `player-profile-storage`.

### Resetear el perfil

```javascript
import { usePlayerProfile } from '../composables/usePlayerProfile.js';

const { resetProfile } = usePlayerProfile();

// Al hacer logout
function logout() {
  resetProfile();
  // ... resto del código de logout
}
```

---

## 🔄 Sincronización con backend (futuro)

```javascript
// Ejemplo de cómo sincronizar con el backend
import axios from 'axios';
import playerProfileStore from '../stores/playerProfileStore.js';

async function syncProfileToBackend() {
  const profile = playerProfileStore.getState().profile;
  
  try {
    await axios.post('/api/profile/sync', {
      userId: profile.userId,
      level: profile.level,
      experience: profile.experience,
      stats: profile.stats,
      achievements: profile.achievements
    });
    
    console.log('Perfil sincronizado con el servidor');
  } catch (error) {
    console.error('Error al sincronizar perfil:', error);
  }
}

// Llamar después de cada partida
function onMatchEnd(result) {
  recordMatch(result);
  syncProfileToBackend();
}
```

---

## 📚 API Completa

### Estado
- `profile` - Objeto con toda la información del perfil
- `displayName` - Nombre del usuario (computed)
- `levelProgress` - Progreso de nivel 0-100% (computed)
- `rankProgress` - Progreso de rango 0-100% (computed)
- `formattedPlayTime` - Tiempo jugado formateado (computed)

### Acciones
- `initializeProfile(userData)` - Inicializar perfil con datos del usuario
- `updateProfileInfo(updates)` - Actualizar información general
- `setUsername(username)` - Cambiar nombre de usuario
- `setAvatar(avatar)` - Cambiar avatar
- `addExperience(amount)` - Añadir experiencia
- `updateRank(rankData)` - Actualizar rango
- `addRankPoints(points)` - Añadir/quitar puntos de rango
- `recordMatch(result)` - Registrar resultado de partida
- `updateCardStats(updates)` - Actualizar estadísticas de cartas
- `addPlayTime(seconds)` - Añadir tiempo de juego
- `unlockAchievement(achievementId)` - Desbloquear logro
- `updateSettings(settings)` - Actualizar configuraciones
- `resetProfile()` - Resetear perfil completo
- `isAchievementUnlocked(achievementId)` - Verificar logro

---

## 🎮 Integración con el flujo del juego

### 1. Al iniciar sesión
```javascript
initializeProfile({
  username: userData.username,
  id: userData.id,
  avatar: userData.avatar
});
```

### 2. Durante el juego
```javascript
// Trackear acciones del jugador
onCardPlayed() -> updateCardStats()
onFusion() -> updateCardStats()
onTurnEnd() -> addPlayTime()
```

### 3. Al terminar el juego
```javascript
recordMatch({
  won: winner === 'player',
  gameType: 'bot',
  difficulty: 'medium',
  duration: matchDuration
});

addExperience(winner === 'player' ? 100 : 50);
addRankPoints(winner === 'player' ? 25 : -10);
checkAchievements();
```

### 4. Al cerrar sesión
```javascript
resetProfile();
```

---

## ✨ Ventajas de Zustand

1. **Simple**: API minimalista sin boilerplate
2. **Performante**: Solo re-renderiza lo necesario
3. **Persistente**: Integración nativa con localStorage
4. **Flexible**: Funciona con Vue, React, Vanilla JS, Phaser
5. **TypeScript**: Soporte nativo (si decides migrar)
6. **Pequeño**: ~1KB gzipped

---

## 🐛 Debugging

```javascript
// Ver estado actual
console.log(usePlayerProfileStore.getState());

// Suscribirse a cambios
const unsubscribe = usePlayerProfileStore.subscribe(
  (state) => console.log('Estado actualizado:', state)
);

// Limpiar suscripción
unsubscribe();
```
