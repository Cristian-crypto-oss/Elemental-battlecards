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

  const reset = () => {
    roomData.value = null;
    currentTurn.value = 'player';
    playerEssences.value = {};
    opponentEssences.value = {};
    gameState.value = 'pre-start';
  };

  return {
    roomData,
    currentTurn,
    playerEssences,
    opponentEssences,
    gameState,
    setRoomData,
    setCurrentTurn,
    setPlayerEssences,
    setOpponentEssences,
    setGameState,
    reset
  };
});
