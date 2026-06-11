/**
 * Administrador de red (NetworkManager) que abstrae socket.io.
 * Sigue el principio de Inversión de Dependencias (DIP), aislando a la escena
 * de las llamadas directas de la librería de sockets.
 */
export default class NetworkManager {
    /**
     * @param {object} socket Instancia de socket.io-client
     */
    constructor(socket) {
        this.socket = socket;
        this.onGameEventCallback = () => {};
        this.onTurnChangedCallback = () => {};
        
        this._setupListeners();
    }

    /**
     * Registra un callback para eventos genéricos del juego.
     */
    onGameEvent(callback) {
        this.onGameEventCallback = callback || (() => {});
    }

    /**
     * Registra un callback para el cambio de turno gestionado por el servidor.
     */
    onTurnChanged(callback) {
        this.onTurnChangedCallback = callback || (() => {});
    }

    /**
     * Envía una carta jugada al oponente.
     */
    sendPlayCard(playerRole, card, fieldIndex) {
        this._emit('game_event', {
            type: 'play_card',
            actor: 'player',
            playerRole,
            card,
            fieldIndex
        });
    }

    /**
     * Envía una fusión en campo al oponente.
     */
    sendFuseCards(playerRole, sourceIndex, targetIndex, resultCard) {
        this._emit('game_event', {
            type: 'fuse_cards',
            actor: 'player',
            playerRole,
            sourceIndex,
            targetIndex,
            resultCard
        });
    }

    /**
     * Envía una fusión desde la mano al oponente.
     */
    sendFuseFromHand(playerRole, handCardId, targetIndex, resultCard) {
        this._emit('game_event', {
            type: 'fuse_from_hand',
            actor: 'player',
            playerRole,
            handCardId,
            targetIndex,
            resultCard
        });
    }

    /**
     * Envía una declaración de ataque al oponente.
     */
    sendAttack(playerRole, attackerIndex, defenderIndex, result) {
        this._emit('game_event', {
            type: 'attack',
            actor: 'player',
            playerRole,
            attackerIndex,
            defenderIndex,
            result
        });
    }

    /**
     * Envía un ataque directo al oponente.
     */
    sendDirectAttack(playerRole, attackerIndex, essenceType) {
        this._emit('game_event', {
            type: 'direct_attack',
            actor: 'player',
            playerRole,
            attackerIndex,
            essenceType
        });
    }

    /**
     * Envía el fin del turno al servidor.
     */
    sendEndTurn(playerRole) {
        this._emit('end_turn', { playerRole });
    }

    /**
     * Limpia los listeners de red al apagar o destruir el componente.
     */
    disconnect() {
        if (this.socket) {
            this.socket.off('game_event');
            this.socket.off('turn_changed');
        }
    }

    /**
     * Configura los listeners internos del socket.
     */
    _setupListeners() {
        if (!this.socket) return;

        this.socket.on('game_event', (payload) => {
            try {
                this.onGameEventCallback(payload);
            } catch (err) {
                console.error('[NetworkManager] Error en callback de game_event:', err);
            }
        });

        this.socket.on('turn_changed', (data) => {
            try {
                this.onTurnChangedCallback(data);
            } catch (err) {
                console.error('[NetworkManager] Error en callback de turn_changed:', err);
            }
        });
    }

    /**
     * Helper interno para emitir de forma segura.
     */
    _emit(eventName, payload) {
        if (!this.socket) {
            console.warn(`[NetworkManager] Intento de emitir '${eventName}' sin socket activo.`);
            return;
        }
        try {
            this.socket.emit(eventName, payload);
        } catch (err) {
            console.error(`[NetworkManager] Error al emitir '${eventName}':`, err);
        }
    }
}
