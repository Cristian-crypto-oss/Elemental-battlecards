import { resolveCombat } from '../helpers/combat.js';
import { GAME_CONFIG } from '../helpers/constants.js';

/**
 * Motor de lógica y reglas de juego puro (Framework-agnostic).
 * Administra turnos, contadores de inactividad, obligaciones de ataque
 * y valida las acciones antes de modificar el modelo de datos.
 */
export default class GameEngine {
    constructor(player, opponent, onEventCallback) {
        this.player = player;
        this.opponent = opponent;
        this.onEvent = onEventCallback || (() => {});

        // Estado inicial
        this.gameState = 'pre-start'; // 'pre-start', 'player-turn', 'opponent-turn', 'game-over'
        this.currentTurnOwner = 'player'; // 'player' u 'opponent'

        // Contadores globales
        this.playerTurnNumber = 0;
        this.opponentTurnNumber = 0;

        this.playerHasActed = false;
        this.opponentHasActed = false;

        this.playerPerformedAttackThisTurn = false;
        this.opponentPerformedAttackThisTurn = false;

        this.playerTurnsSinceLastAttack = 0;
        this.opponentTurnsSinceLastAttack = 0;

        this.playerMustAttackThisTurn = false;
        this.opponentMustAttackThisTurn = false;

        this.playerInactiveTurns = 0;
        this.opponentInactiveTurns = 0;
    }

    /**
     * Comienza la partida.
     */
    startGame(startingPlayer = 'player') {
        this.gameState = startingPlayer === 'player' ? 'player-turn' : 'opponent-turn';
        this.currentTurnOwner = startingPlayer;
        
        if (startingPlayer === 'player') {
            this.startPlayerTurn();
        } else {
            this.startOpponentTurn();
        }
    }

    /**
     * Inicia el turno del jugador humano.
     */
    startPlayerTurn() {
        this.gameState = 'player-turn';
        this.currentTurnOwner = 'player';
        this.playerTurnNumber++;
        this.playerHasActed = false;
        this.playerPerformedAttackThisTurn = false;
        this.playerMustAttackThisTurn = (this.playerTurnsSinceLastAttack >= 2);

        // Procesar cooldowns en el modelo de datos
        this._updateCooldowns(this.player, this.playerTurnNumber);

        this.onEvent('player-turn-started', {
            turnNumber: this.playerTurnNumber,
            mustAttack: this.playerMustAttackThisTurn,
            turnsSinceLastAttack: this.playerTurnsSinceLastAttack
        });

        // Si está obligado a atacar y no tiene cartas en campo, salta turno
        const hasCards = this.player.field.some(c => c !== null);
        if (this.playerMustAttackThisTurn && !hasCards) {
            console.log('[GameEngine] Jugador obligado a atacar sin cartas. Salto de turno automático.');
            this.playerTurnsSinceLastAttack = 0;
            this.endPlayerTurn();
        }
    }

    /**
     * Inicia el turno del oponente (IA / LAN).
     */
    startOpponentTurn() {
        this.gameState = 'opponent-turn';
        this.currentTurnOwner = 'opponent';
        this.opponentTurnNumber++;
        this.opponentHasActed = false;
        this.opponentPerformedAttackThisTurn = false;
        this.opponentMustAttackThisTurn = (this.opponentTurnsSinceLastAttack >= 2);

        // Procesar cooldowns en el modelo de datos
        this._updateCooldowns(this.opponent, this.opponentTurnNumber);

        this.onEvent('opponent-turn-started', {
            turnNumber: this.opponentTurnNumber,
            mustAttack: this.opponentMustAttackThisTurn,
            turnsSinceLastAttack: this.opponentTurnsSinceLastAttack
        });
    }

    /**
     * Finaliza el turno del jugador humano.
     */
    endPlayerTurn() {
        if (this.gameState !== 'player-turn') return;

        // Registrar inactividad
        if (!this.playerHasActed) {
            this.playerInactiveTurns++;
        } else {
            this.playerInactiveTurns = 0;
        }

        // Registrar contador de ataques
        if (!this.playerPerformedAttackThisTurn) {
            this.playerTurnsSinceLastAttack++;
        } else {
            this.playerTurnsSinceLastAttack = 0;
        }
        this.playerMustAttackThisTurn = false;

        this.onEvent('player-turn-ended', {
            inactiveTurns: this.playerInactiveTurns,
            turnsSinceLastAttack: this.playerTurnsSinceLastAttack
        });

        const winner = this.checkVictoryConditions();
        if (winner) {
            this.endGame(winner);
            return;
        }

        this.onEvent('request-turn-change', 'opponent');
    }

    /**
     * Finaliza el turno del oponente.
     */
    endOpponentTurn() {
        if (this.gameState !== 'opponent-turn') return;

        // Registrar inactividad del oponente
        if (!this.opponentHasActed) {
            this.opponentInactiveTurns++;
        } else {
            this.opponentInactiveTurns = 0;
        }

        // Registrar contador de ataques
        if (!this.opponentPerformedAttackThisTurn) {
            this.opponentTurnsSinceLastAttack++;
        } else {
            this.opponentTurnsSinceLastAttack = 0;
        }
        this.opponentMustAttackThisTurn = false;

        this.onEvent('opponent-turn-ended', {
            inactiveTurns: this.opponentInactiveTurns,
            turnsSinceLastAttack: this.opponentTurnsSinceLastAttack
        });

        const winner = this.checkVictoryConditions();
        if (winner) {
            this.endGame(winner);
            return;
        }

        this.onEvent('request-turn-change', 'player');
    }

    /**
     * Registra que una acción ha sido tomada consumiendo la acción del turno.
     * @param {string} actor 'player' u 'opponent'
     */
    registerAction(actor) {
        if (actor === 'player') {
            this.playerHasActed = true;
            this.playerInactiveTurns = 0;
        } else {
            this.opponentHasActed = true;
            this.opponentInactiveTurns = 0;
        }
    }

    /**
     * Valida y procesa colocar una carta en el campo.
     */
    playCard(actor, instanceId, fieldIndex) {
        const activePlayer = actor === 'player' ? this.player : this.opponent;
        const mustAttack = actor === 'player' ? this.playerMustAttackThisTurn : this.opponentMustAttackThisTurn;

        if (mustAttack) {
            console.warn('[GameEngine] Acción inválida: Obligado a atacar, no puede jugar cartas.');
            return null;
        }

        const cardPlayed = activePlayer.playCardFromHand(instanceId, fieldIndex);
        if (cardPlayed) {
            this.registerAction(actor);
        }
        return cardPlayed;
    }

    /**
     * Valida y procesa la fusión de dos cartas en el campo.
     */
    fuseCards(actor, draggedIndex, targetIndex) {
        const activePlayer = actor === 'player' ? this.player : this.opponent;
        const mustAttack = actor === 'player' ? this.playerMustAttackThisTurn : this.opponentMustAttackThisTurn;

        if (mustAttack) {
            console.warn('[GameEngine] Acción inválida: Obligado a atacar, no puede fusionar.');
            return null;
        }

        const result = activePlayer.fuseCards(draggedIndex, targetIndex);
        if (result) {
            this.registerAction(actor);
        }
        return result;
    }

    /**
     * Valida y procesa la fusión desde la mano con una carta en el campo (en caso de permitirse).
     */
    fuseFromHand(actor, instanceId, targetIndex) {
        const activePlayer = actor === 'player' ? this.player : this.opponent;
        const mustAttack = actor === 'player' ? this.playerMustAttackThisTurn : this.opponentMustAttackThisTurn;

        if (mustAttack) {
            console.warn('[GameEngine] Acción inválida: Obligado a atacar, no puede fusionar.');
            return null;
        }

        const result = activePlayer.fuseFromHand(instanceId, targetIndex);
        if (result) {
            this.registerAction(actor);
        }
        return result;
    }

    /**
     * Valida e inicia el combate entre dos cartas.
     */
    executeAttack(actor, attackerIndex, defenderIndex) {
        const attackerPlayer = actor === 'player' ? this.player : this.opponent;
        const defenderPlayer = actor === 'player' ? this.opponent : this.player;

        const attackerData = attackerPlayer.field[attackerIndex];
        const defenderData = defenderPlayer.field[defenderIndex];

        if (!attackerData || !defenderData) {
            console.warn('[GameEngine] Ataque inválido: Carta faltante en origen o destino.');
            return null;
        }

        const turnNumber = actor === 'player' ? this.playerTurnNumber : this.opponentTurnNumber;
        if (attackerData.blockedTurn === turnNumber) {
            console.warn('[GameEngine] Carta cansada. No puede atacar este turno.');
            return null;
        }

        // Resolver combate
        const result = resolveCombat(attackerData, defenderData);

        // Registrar acción
        this.registerAction(actor);
        if (actor === 'player') {
            this.playerPerformedAttackThisTurn = true;
            this.playerTurnsSinceLastAttack = 0;
        } else {
            this.opponentPerformedAttackThisTurn = true;
            this.opponentTurnsSinceLastAttack = 0;
        }

        // Registrar cooldown / cansancio
        this._registerCardAttackState(attackerData, turnNumber);

        return result;
    }

    /**
     * Valida y ejecuta un ataque directo.
     */
    executeDirectAttack(actor, attackerIndex) {
        const attackerPlayer = actor === 'player' ? this.player : this.opponent;
        const defenderPlayer = actor === 'player' ? this.opponent : this.player;

        const attackerData = attackerPlayer.field[attackerIndex];
        if (!attackerData) return null;

        const hasDefenders = defenderPlayer.field.some(c => c !== null);
        if (hasDefenders) {
            console.warn('[GameEngine] Ataque directo inválido: El defensor tiene cartas en el campo.');
            return null;
        }

        const turnNumber = actor === 'player' ? this.playerTurnNumber : this.opponentTurnNumber;
        if (attackerData.blockedTurn === turnNumber) {
            console.warn('[GameEngine] Carta cansada. No puede atacar este turno.');
            return null;
        }

        // Activar esencia
        attackerPlayer.fillEssence(attackerData.type);

        // Registrar acción
        this.registerAction(actor);
        if (actor === 'player') {
            this.playerPerformedAttackThisTurn = true;
            this.playerTurnsSinceLastAttack = 0;
        } else {
            this.opponentPerformedAttackThisTurn = true;
            this.opponentTurnsSinceLastAttack = 0;
        }

        // Registrar cooldown / cansancio
        this._registerCardAttackState(attackerData, turnNumber);

        return { success: true, essenceType: attackerData.type };
    }

    /**
     * Finaliza y congela el juego.
     */
    endGame(winner) {
        this.gameState = 'game-over';
        this.onEvent('game-over', winner);
    }

    /**
     * Comprueba todas las condiciones de victoria de forma pura.
     */
    checkVictoryConditions() {
        if (this.playerInactiveTurns >= 3) return 'opponent';
        if (this.opponentInactiveTurns >= 3) return 'player';

        const playerFieldTypes = new Set(this.player.field.filter(c => c).map(c => c.type));
        if (playerFieldTypes.size === 6) return 'player';

        const opponentFieldTypes = new Set(this.opponent.field.filter(c => c).map(c => c.type));
        if (opponentFieldTypes.size === 6) return 'opponent';

        if (this.player.essences.size === 6) return 'player';
        if (this.opponent.essences.size === 6) return 'opponent';

        return null;
    }

    /**
     * Aplica el estado de descanso/cooldown a una carta tras atacar.
     */
    _registerCardAttackState(cardData, currentTurn) {
        const level = cardData.level || 1;
        const last = cardData.lastAttackedTurn || null;
        const consecutive = cardData.consecutiveAttacks || 0;
        
        let newConsecutive = (last === (currentTurn - 1)) ? (consecutive + 1) : 1;
        
        cardData.lastAttackedTurn = currentTurn;
        cardData.consecutiveAttacks = newConsecutive;

        if (level === 1) {
            cardData.blockedTurn = null;
        } else if (level === 2) {
            if (newConsecutive >= 2) {
                cardData.blockedTurn = currentTurn + 1;
                cardData.consecutiveAttacks = 0;
                console.log(`[GameEngine] Carta ${cardData.id} bloqueada para el turno ${currentTurn + 1} (nivel 2).`);
            } else {
                cardData.blockedTurn = null;
            }
        } else if (level === 3) {
            cardData.blockedTurn = currentTurn + 1;
            cardData.consecutiveAttacks = 0;
            console.log(`[GameEngine] Carta ${cardData.id} bloqueada para el turno ${currentTurn + 1} (nivel 3).`);
        }
    }

    /**
     * Limpia bloqueos antiguos del jugador al inicio de su turno.
     */
    _updateCooldowns(playerModel, currentTurn) {
        playerModel.field.forEach(cardData => {
            if (!cardData) return;

            // Resetear consecutivos si no atacó el turno anterior
            if (cardData.lastAttackedTurn !== (currentTurn - 1)) {
                cardData.consecutiveAttacks = 0;
            }

            // Expirar bloqueos
            if (cardData.blockedTurn !== null && cardData.blockedTurn < currentTurn) {
                cardData.blockedTurn = null;
            }
        });
    }
}
