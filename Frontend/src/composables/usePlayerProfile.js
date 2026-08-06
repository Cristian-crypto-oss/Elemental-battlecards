/**
 * Composable de Vue para usar el store de perfil de jugador con Zustand Vanilla
 * 
 * Proporciona reactividad de Vue con el estado de Zustand
 */

import { ref, onMounted, onUnmounted, computed } from 'vue';
import playerProfileStore from '../stores/playerProfileStore.js';

export function usePlayerProfile() {
  // Obtener el estado inicial inmediatamente (no esperar a onMounted)
  const profile = ref(playerProfileStore.getState().profile);
  let unsubscribe = null;

  // Montar el listener cuando el composable se inicializa
  onMounted(() => {
    // Actualizar el estado por si cambió
    profile.value = playerProfileStore.getState().profile;
    
    console.log('[usePlayerProfile] Montado. Estado del perfil:', profile.value);

    // Suscribirse a cambios en el store
    unsubscribe = playerProfileStore.subscribe((state) => {
      console.log('[usePlayerProfile] Estado actualizado:', state.profile);
      profile.value = state.profile;
    });
  });

  // Limpiar la suscripción cuando el componente se desmonte
  onUnmounted(() => {
    if (unsubscribe) {
      unsubscribe();
    }
  });

  // Obtener todas las acciones del store
  const actions = playerProfileStore.getState();

  // Computed properties útiles
  const displayName = computed(() => profile.value?.username || 'Jugador');
  const levelProgress = computed(() => {
    if (!profile.value) return 0;
    const { experience, experienceToNextLevel } = profile.value;
    return experienceToNextLevel > 0 
      ? Math.round((experience / experienceToNextLevel) * 100) 
      : 0;
  });
  const rankProgress = computed(() => {
    if (!profile.value) return 0;
    const { points, maxPoints } = profile.value.rank;
    return maxPoints > 0 
      ? Math.round((points / maxPoints) * 100) 
      : 0;
  });
  const formattedPlayTime = computed(() => {
    if (!profile.value) return '0h 0m';
    return actions.getFormattedPlayTime();
  });

  return {
    // Estado
    profile,
    
    // Computed properties
    displayName,
    levelProgress,
    rankProgress,
    formattedPlayTime,
    
    // Acciones
    initializeProfile: actions.initializeProfile,
    updateProfileInfo: actions.updateProfileInfo,
    setUsername: actions.setUsername,
    setAvatar: actions.setAvatar,
    addExperience: actions.addExperience,
    updateRank: actions.updateRank,
    addRankPoints: actions.addRankPoints,
    recordMatch: actions.recordMatch,
    updateCardStats: actions.updateCardStats,
    addPlayTime: actions.addPlayTime,
    unlockAchievement: actions.unlockAchievement,
    updateSettings: actions.updateSettings,
    resetProfile: actions.resetProfile,
    isAchievementUnlocked: actions.isAchievementUnlocked,
  };
}
