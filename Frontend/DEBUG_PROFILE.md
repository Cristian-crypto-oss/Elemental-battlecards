# 🔍 Debug del Perfil del Jugador

## Problema: No se muestra el nombre del usuario

Si ves "Jugador" en lugar del nombre real del usuario, sigue estos pasos:

---

## ✅ Paso 1: Verificar en la Consola del Navegador

Abre las DevTools (F12) y en la consola ejecuta:

```javascript
// Ver el estado completo del perfil
JSON.parse(localStorage.getItem('player-profile-storage'))

// Ver solo el username
JSON.parse(localStorage.getItem('player-profile-storage')).state.profile.username

// Ver los datos del authStore
localStorage.getItem('auth-token')
```

---

## ✅ Paso 2: Verificar Logs en la Consola

Busca estos logs en la consola del navegador:

```
[MainMenu] Montado. Usuario autenticado: { username: "...", id: ... }
[MainMenu] Estado del perfil: { username: "...", level: ... }
```

Si ves:
- ✅ `Usuario autenticado: { username: "TuNombre" }` → El auth funciona
- ❌ `Estado del perfil: { username: "" }` → El perfil no se inicializó

---

## ✅ Paso 3: Solución Rápida - Reiniciar Sesión

1. **Cierra sesión** (botón 🚪 en MainMenu)
2. **Limpia localStorage** (ejecuta en consola):
   ```javascript
   localStorage.clear();
   ```
3. **Recarga la página** (F5)
4. **Inicia sesión nuevamente**

---

## ✅ Paso 4: Verificar Inicialización en App.vue

Abre las DevTools y busca este log:

```
[App.vue] Login exitoso: { username: "TuNombre", id: ... }
[App.vue] Perfil del jugador inicializado
```

Si **NO** ves estos logs, el problema está en App.vue.

---

## ✅ Paso 5: Forzar Inicialización Manual

Si todo lo anterior falla, ejecuta esto en la consola del navegador:

```javascript
// Forzar inicialización del perfil
const profile = {
  profile: {
    username: 'TuNombreAqui',  // 👈 Cambia esto
    userId: 1,
    avatar: '/assets/images/logo.png',
    level: 1,
    experience: 0,
    experienceToNextLevel: 1000,
    rank: {
      name: 'BRONCE I',
      tier: 'BRONCE',
      division: 'I',
      points: 0,
      maxPoints: 1000
    },
    stats: {
      matchesPlayed: 0,
      matchesWon: 0,
      matchesLost: 0,
      winRate: 0,
      totalPlayTime: 0,
      longestWinStreak: 0,
      currentWinStreak: 0,
      achievementsUnlocked: 0,
      totalAchievements: 50
    },
    gameStats: {
      lanGames: 0,
      botGames: 0,
      easyBotWins: 0,
      mediumBotWins: 0,
      hardBotWins: 0
    },
    cardStats: {
      totalCardsPlayed: 0,
      totalFusions: 0,
      level3CardsCreated: 0,
      favoriteElement: null,
      mostUsedCard: null
    },
    achievements: [],
    settings: {
      showOnlineStatus: true,
      publicProfile: true,
      allowFriendRequests: true
    }
  }
};

// Guardar en localStorage
localStorage.setItem('player-profile-storage', JSON.stringify({ state: profile }));

// Recargar la página
location.reload();
```

---

## ✅ Paso 6: Verificar Flujo Completo

El flujo correcto es:

```
1. LoginForm.vue → emite 'login-success' con userData
   ↓
2. App.vue → handleLoginSuccess()
   ↓
3. authStore.setUser(userData)
   ↓
4. initializeProfile({ username, id, avatar })
   ↓
5. playerProfileStore actualizado
   ↓
6. MainMenu.vue → displayName obtiene el username
   ↓
7. ✅ Se muestra el nombre en la UI
```

---

## ✅ Paso 7: Verificar que el Composable Funciona

Ejecuta en la consola mientras estás en MainMenu:

```javascript
// Esto debería devolver el store
window.profileStore = (await import('./src/stores/playerProfileStore.js')).default;
window.profileStore.getState().profile.username;
```

---

## 🐛 Problemas Comunes

### Problema 1: "Jugador" en lugar del nombre
**Causa:** El perfil no se inicializó correctamente
**Solución:** Ejecutar Paso 3 (Reiniciar sesión)

### Problema 2: El nombre no se actualiza después del login
**Causa:** App.vue no está llamando a `initializeProfile()`
**Solución:** Verificar que App.vue tiene el código actualizado

### Problema 3: El nombre desaparece al recargar
**Causa:** localStorage no tiene el perfil guardado
**Solución:** Ejecutar Paso 5 (Forzar inicialización manual)

### Problema 4: Error "Cannot read property 'username' of undefined"
**Causa:** El composable no está obteniendo el estado correctamente
**Solución:** Verificar que `usePlayerProfile.js` está importando correctamente el store

---

## 📊 Estructura Esperada en localStorage

```json
{
  "state": {
    "profile": {
      "username": "TuNombre",
      "userId": 123,
      "avatar": "/assets/images/logo.png",
      "level": 1,
      "experience": 0,
      "experienceToNextLevel": 1000,
      "rank": {
        "name": "BRONCE I",
        "tier": "BRONCE",
        "division": "I",
        "points": 0,
        "maxPoints": 1000
      },
      "stats": {
        "matchesPlayed": 0,
        "matchesWon": 0,
        "matchesLost": 0,
        "winRate": 0,
        "totalPlayTime": 0,
        "longestWinStreak": 0,
        "currentWinStreak": 0,
        "achievementsUnlocked": 0,
        "totalAchievements": 50
      }
    }
  }
}
```

---

## 🎯 Verificación Final

Una vez que hagas los cambios, deberías ver:

- ✅ En **MainMenu**: Tu nombre en lugar de "Jugador"
- ✅ En **VerPerfil**: Tu nombre y todas las estadísticas
- ✅ En **GameOverScreen**: Tu nombre en el mensaje
- ✅ En **UIScene (Phaser)**: Tu nombre en el contador de ataque

---

## 💡 Consejo Pro

Añade un botón temporal para debug en MainMenu:

```vue
<button @click="debugProfile" style="position: fixed; top: 10px; right: 10px; z-index: 9999;">
  Debug Profile
</button>

<script setup>
const debugProfile = () => {
  console.log('=== DEBUG PROFILE ===');
  console.log('authStore.user:', authStore.user);
  console.log('profile.value:', profile.value);
  console.log('displayName.value:', displayName.value);
  console.log('localStorage:', localStorage.getItem('player-profile-storage'));
};
</script>
```

---

## ✅ Si todo lo anterior falla

Contacta al desarrollador con:
1. Screenshot de la consola (logs)
2. Contenido de `localStorage.getItem('player-profile-storage')`
3. Contenido de `localStorage.getItem('auth-token')`
4. Navegador y versión
