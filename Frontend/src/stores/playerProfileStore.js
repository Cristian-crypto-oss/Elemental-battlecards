/**
 * Player Profile Store - Zustand (Vanilla)
 * 
 * Store global para mantener el estado del perfil del jugador
 * incluyendo información básica, estadísticas, logros y progreso.
 */

import { createStore } from 'zustand/vanilla';
import { persist, createJSONStorage } from 'zustand/middleware';

const usePlayerProfileStore = persist(
  (set, get) => ({
      // ============ ESTADO DEL PERFIL ============
      profile: {
        // Información básica
        username: '',
        userId: null,
        avatar: '/assets/images/logo.png',
        level: 1,
        experience: 0,
        experienceToNextLevel: 1000,
        
        // Rango competitivo
        rank: {
          name: 'BRONCE I',
          tier: 'BRONCE',
          division: 'I',
          points: 0,
          maxPoints: 1000,
        },
        
        // Estadísticas del jugador
        stats: {
          matchesPlayed: 0,
          matchesWon: 0,
          matchesLost: 0,
          winRate: 0,
          totalPlayTime: 0, // en segundos
          longestWinStreak: 0,
          currentWinStreak: 0,
          achievementsUnlocked: 0,
          totalAchievements: 50,
        },
        
        // Estadísticas por tipo de juego
        gameStats: {
          lanGames: 0,
          botGames: 0,
          easyBotWins: 0,
          mediumBotWins: 0,
          hardBotWins: 0,
        },
        
        // Estadísticas de cartas
        cardStats: {
          totalCardsPlayed: 0,
          totalFusions: 0,
          level3CardsCreated: 0,
          favoriteElement: null,
          mostUsedCard: null,
        },
        
        // Logros desbloqueados
        achievements: [],
        
        // Configuraciones de perfil
        settings: {
          showOnlineStatus: true,
          publicProfile: true,
          allowFriendRequests: true,
        },
      },
      
      // ============ ACCIONES ============
      
      /**
       * Inicializar perfil con datos del usuario autenticado
       */
      initializeProfile: (userData) => {
        set((state) => ({
          profile: {
            ...state.profile,
            username: userData.username || state.profile.username,
            userId: userData.id || state.profile.userId,
            avatar: userData.avatar || state.profile.avatar,
          },
        }));
      },
      
      /**
       * Actualizar información básica del perfil
       */
      updateProfileInfo: (updates) => {
        set((state) => ({
          profile: {
            ...state.profile,
            ...updates,
          },
        }));
      },
      
      /**
       * Actualizar nombre de usuario
       */
      setUsername: (username) => {
        set((state) => ({
          profile: {
            ...state.profile,
            username,
          },
        }));
      },
      
      /**
       * Actualizar avatar del jugador
       */
      setAvatar: (avatar) => {
        set((state) => ({
          profile: {
            ...state.profile,
            avatar,
          },
        }));
      },
      
      /**
       * Añadir experiencia y subir de nivel si es necesario
       */
      addExperience: (amount) => {
        set((state) => {
          const newExp = state.profile.experience + amount;
          const expNeeded = state.profile.experienceToNextLevel;
          
          if (newExp >= expNeeded) {
            // Subir de nivel
            const newLevel = state.profile.level + 1;
            const remainingExp = newExp - expNeeded;
            const nextLevelExp = Math.floor(expNeeded * 1.5);
            
            return {
              profile: {
                ...state.profile,
                level: newLevel,
                experience: remainingExp,
                experienceToNextLevel: nextLevelExp,
              },
            };
          }
          
          return {
            profile: {
              ...state.profile,
              experience: newExp,
            },
          };
        });
      },
      
      /**
       * Actualizar rango competitivo
       */
      updateRank: (rankData) => {
        set((state) => ({
          profile: {
            ...state.profile,
            rank: {
              ...state.profile.rank,
              ...rankData,
            },
          },
        }));
      },
      
      /**
       * Añadir puntos de rango
       */
      addRankPoints: (points) => {
        set((state) => {
          const newPoints = state.profile.rank.points + points;
          
          if (newPoints >= state.profile.rank.maxPoints) {
            // Subir de división/tier
            return {
              profile: {
                ...state.profile,
                rank: {
                  ...state.profile.rank,
                  points: newPoints - state.profile.rank.maxPoints,
                  // Aquí se puede implementar lógica para subir tier/división
                },
              },
            };
          }
          
          return {
            profile: {
              ...state.profile,
              rank: {
                ...state.profile.rank,
                points: Math.max(0, newPoints),
              },
            },
          };
        });
      },
      
      /**
       * Registrar resultado de partida
       */
      recordMatch: (result) => {
        set((state) => {
          const won = result.won;
          const matchesPlayed = state.profile.stats.matchesPlayed + 1;
          const matchesWon = won ? state.profile.stats.matchesWon + 1 : state.profile.stats.matchesWon;
          const matchesLost = !won ? state.profile.stats.matchesLost + 1 : state.profile.stats.matchesLost;
          const winRate = matchesPlayed > 0 ? Math.round((matchesWon / matchesPlayed) * 100) : 0;
          
          const currentWinStreak = won ? state.profile.stats.currentWinStreak + 1 : 0;
          const longestWinStreak = Math.max(state.profile.stats.longestWinStreak, currentWinStreak);
          
          return {
            profile: {
              ...state.profile,
              stats: {
                ...state.profile.stats,
                matchesPlayed,
                matchesWon,
                matchesLost,
                winRate,
                currentWinStreak,
                longestWinStreak,
                totalPlayTime: state.profile.stats.totalPlayTime + (result.duration || 0),
              },
              gameStats: {
                ...state.profile.gameStats,
                lanGames: result.gameType === 'lan' ? state.profile.gameStats.lanGames + 1 : state.profile.gameStats.lanGames,
                botGames: result.gameType === 'bot' ? state.profile.gameStats.botGames + 1 : state.profile.gameStats.botGames,
                easyBotWins: result.gameType === 'bot' && result.difficulty === 'easy' && won ? state.profile.gameStats.easyBotWins + 1 : state.profile.gameStats.easyBotWins,
                mediumBotWins: result.gameType === 'bot' && result.difficulty === 'medium' && won ? state.profile.gameStats.mediumBotWins + 1 : state.profile.gameStats.mediumBotWins,
                hardBotWins: result.gameType === 'bot' && result.difficulty === 'hard' && won ? state.profile.gameStats.hardBotWins + 1 : state.profile.gameStats.hardBotWins,
              },
            },
          };
        });
      },
      
      /**
       * Actualizar estadísticas de cartas
       */
      updateCardStats: (updates) => {
        set((state) => ({
          profile: {
            ...state.profile,
            cardStats: {
              ...state.profile.cardStats,
              ...updates,
            },
          },
        }));
      },
      
      /**
       * Añadir tiempo de juego (en segundos)
       */
      addPlayTime: (seconds) => {
        set((state) => ({
          profile: {
            ...state.profile,
            stats: {
              ...state.profile.stats,
              totalPlayTime: state.profile.stats.totalPlayTime + seconds,
            },
          },
        }));
      },
      
      /**
       * Desbloquear logro
       */
      unlockAchievement: (achievementId) => {
        set((state) => {
          if (state.profile.achievements.includes(achievementId)) {
            return state; // Ya desbloqueado
          }
          
          return {
            profile: {
              ...state.profile,
              achievements: [...state.profile.achievements, achievementId],
              stats: {
                ...state.profile.stats,
                achievementsUnlocked: state.profile.stats.achievementsUnlocked + 1,
              },
            },
          };
        });
      },
      
      /**
       * Actualizar configuraciones del perfil
       */
      updateSettings: (settings) => {
        set((state) => ({
          profile: {
            ...state.profile,
            settings: {
              ...state.profile.settings,
              ...settings,
            },
          },
        }));
      },
      
      /**
       * Resetear perfil (útil para testing o logout)
       */
      resetProfile: () => {
        set({
          profile: {
            username: '',
            userId: null,
            avatar: '/assets/images/logo.png',
            level: 1,
            experience: 0,
            experienceToNextLevel: 1000,
            rank: {
              name: 'BRONCE I',
              tier: 'BRONCE',
              division: 'I',
              points: 0,
              maxPoints: 1000,
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
              totalAchievements: 50,
            },
            gameStats: {
              lanGames: 0,
              botGames: 0,
              easyBotWins: 0,
              mediumBotWins: 0,
              hardBotWins: 0,
            },
            cardStats: {
              totalCardsPlayed: 0,
              totalFusions: 0,
              level3CardsCreated: 0,
              favoriteElement: null,
              mostUsedCard: null,
            },
            achievements: [],
            settings: {
              showOnlineStatus: true,
              publicProfile: true,
              allowFriendRequests: true,
            },
          },
        });
      },
      
      /**
       * Obtener tiempo de juego formateado
       */
      getFormattedPlayTime: () => {
        const { totalPlayTime } = get().profile.stats;
        const hours = Math.floor(totalPlayTime / 3600);
        const minutes = Math.floor((totalPlayTime % 3600) / 60);
        return `${hours}h ${minutes}m`;
      },
      
      /**
       * Verificar si un logro está desbloqueado
       */
      isAchievementUnlocked: (achievementId) => {
        return get().profile.achievements.includes(achievementId);
      },
    }),
    {
      name: 'player-profile-storage', // Nombre para localStorage
      storage: createJSONStorage(() => localStorage),
    }
);

const store = createStore(usePlayerProfileStore);

export default store;
