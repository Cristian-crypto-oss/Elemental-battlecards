import { defineStore } from 'pinia';
import { ref } from 'vue';

/**
 * Store de Pinia para gestionar el estado del juego.
 * Sincroniza entre componentes Vue y escenas Phaser.
 */
export const useGameStore = defineStore('game', () => {
  const roomData = ref(null);
  const currentTurn = ref('player');
  const playerEssences = ref({});
  const opponentEssences = ref({});
  const gameState = ref('pre-start'); // pre-start, in-progress, ended
  const gameMode = ref(null); // 'bot' o 'lan'
  const gameData = ref(null); // Datos del juego creado
  const gameId = ref(null); // ID del juego a unirse

  const setRoomData = (data) => {
    roomData.value = data;
  };

  const setCurrentTurn = (turn) => {
    currentTurn.value = turn;
  };

  const setPlayerEssences = (essences) => {
    playerEssences.value = essences;
  };

  const setOpponentEssences = (essences) => {
    opponentEssences.value = essences;
  };

  const setGameState = (state) => {
    gameState.value = state;
  };

  const setGameMode = (mode) => {
    gameMode.value = mode;
  };

  const setGameData = (data) => {
    gameData.value = data;
  };

  const setGameId = (id) => {
    gameId.value = id;
  };

  const reset = () => {
    roomData.value = null;
    currentTurn.value = 'player';
    playerEssences.value = {};
    opponentEssences.value = {};
    gameState.value = 'pre-start';
    gameMode.value = null;
    gameData.value = null;
    gameId.value = null;
  };

  return {
    roomData,
    currentTurn,
    playerEssences,
    opponentEssences,
    gameState,
    gameMode,
    gameData,
    gameId,
    setRoomData,
    setCurrentTurn,
    setPlayerEssences,
    setOpponentEssences,
    setGameState,
    setGameMode,
    setGameData,
    setGameId,
    reset
  };
});
