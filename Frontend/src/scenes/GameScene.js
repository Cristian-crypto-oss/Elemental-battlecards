import Phaser from 'phaser';
import { calculateRowPositions } from '../helpers/zone.js';
import { resolveCombat } from '../helpers/combat.js';
import Player from '../game_objects/player.js';
import Card from '../game_objects/card.js';
import { CardDefinitions } from '../game_objects/card-definitions.js';

// Importar servicios desacoplados aplicando SOLID (DIP)
import GameEngine from '../services/gameEngine.js';
import BotEngine from '../services/botEngine.js';
import NetworkManager from '../services/networkManager.js';

/**
 * La escena principal donde se desarrolla el juego de cartas.
 * Ahora se enfoca estrictamente en la interfaz de usuario, animaciones,
 * y renderizado de Phaser, delegando la lógica pura del juego.
 */
export default class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
        this.playerData = null;
        this.socket = null;
        this.isLAN = false;
        this.roomCode = null;
        this.playerRole = null; // 'host' o 'guest' en LAN
        this.debugSync = true;
        this.gameStartData = null;
        this.vsBot = false;
        
        // Selección de cartas
        this.selectedCard = null;

        // Tamaños visuales fijos para normalizar el tamaño real de todas las texturas
        this.cardHandSize = { width: 110, height: 158 };
        this.cardFieldSize = { width: 110, height: 158 };

        // Control de animaciones y flujos de turnos
        this.blockingAnimations = 0;
        this.pendingTurnChange = null;
        this._pendingDestroys = new Set();

        // Referencias a los motores lógicos y de red (DIP)
        this.gameEngine = null;
        this.botEngine = null;
        this.networkManager = null;
    }

    /**
     * El método init se ejecuta antes que create y recibe los datos de la escena previa.
     */
    init(data) {
        this.playerData = data.playerData || data;
        this.socket = data.socket || null;
        this.isLAN = !!data.isLAN;
        this.roomCode = data.roomCode || null;
        this.playerRole = data.playerRole || null;
        this.gameStartData = data.gameStartData || null;
        this.vsBot = !!data.vsBot;

        console.log('GameScene iniciada con los datos del jugador:', this.playerData);
        console.log('Modo LAN:', this.isLAN, 'Rol:', this.playerRole);
    }

    preload() {
        // Fondo general - Imagen estática del campo elemental
        this.load.image('campo-fondo', '/assets/images/campo juego/campo.jpeg');

        // Slots
        this.load.image('slot', '/assets/images/cartas/Espacio vacio.png');

        // Cartas nivel 1
        this.load.image('card-fuego-1', '/assets/images/cartas/carta-fuego-1.png');
        this.load.image('card-agua-1', '/assets/images/cartas/carta-agua-1.png');
        this.load.image('card-planta-1', '/assets/images/cartas/carta-planta-1.png');
        this.load.image('card-luz-1', '/assets/images/cartas/carta-luz-1.png');
        this.load.image('card-sombra-1', '/assets/images/cartas/carta-sombra-1.png');
        this.load.image('card-espiritu-1', '/assets/images/cartas/carta-espiritu-1.png');

        // Cartas nivel 2
        this.load.image('card-fuego-2', '/assets/images/cartas/carta-fuego-2.png');
        this.load.image('card-agua-2', '/assets/images/cartas/carta-agua-2.png');
        this.load.image('card-planta-2', '/assets/images/cartas/carta-planta-2.png');
        this.load.image('card-luz-2', '/assets/images/cartas/carta-luz-2.png');
        this.load.image('card-sombra-2', '/assets/images/cartas/carta-sombra-2.png');
        this.load.image('card-espiritu-2', '/assets/images/cartas/carta-espiritu-2.png');
        
        // Cartas nivel 3
        this.load.image('card-fuego-3', '/assets/images/cartas/carta-fuego-3.png');
        this.load.image('card-agua-3', '/assets/images/cartas/carta-agua-3.png');
        this.load.image('card-planta-3', '/assets/images/cartas/carta-planta-3.png');
        this.load.image('card-luz-3', '/assets/images/cartas/carta-luz-3.png');
        this.load.image('card-sombra-3', '/assets/images/cartas/carta-sombra-3.png');
        this.load.image('card-espiritu-3', '/assets/images/cartas/carta-espiritu-3.png');
        
        // Reverso
        this.load.image('card-back-opponent', '/assets/images/cartas/baraja-oponente.png');
        this.load.image('card-back-player', '/assets/images/cartas/baraja-jugador.png');
    }

    create() {
        const { width, height } = this.scale;
        const battleRowYOffset = 70;

        // Limpieza inicial
        this._cleanupVisuals();

        // Reiniciar variables de estado visual
        this.blockingAnimations = 0;
        this.pendingTurnChange = null;
        this._pendingDestroys = new Set();

        // Lanzar UI
        if (this.scene.isActive('UIScene') || this.scene.isSleeping('UIScene')) {
            this.scene.stop('UIScene');
        }
        this.scene.launch('UIScene', { playerData: this.playerData });

        // Instanciar modelos de Jugadores
        this.player = new Player('player', this);
        this.opponent = new Player('opponent', this);

        // Registrar callbacks de esencias (LSP / Patrón Observador)
        this.player.onEssenceActivated = (playerId, essenceType) => {
            this.events.emit('essence-activated', playerId, essenceType);
        };
        this.opponent.onEssenceActivated = (playerId, essenceType) => {
            this.events.emit('essence-activated', playerId, essenceType);
        };

        // Generar mazos y mano inicial
        this.player.drawInitialHand();
        this.opponent.drawInitialHand();

        // Inicializar Motor de Reglas (GameEngine)
        this.gameEngine = new GameEngine(this.player, this.opponent, (event, data) => {
            this.handleEngineEvent(event, data);
        });

        // Inicializar Motor de IA del Bot (BotEngine)
        this.botEngine = new BotEngine(this.player, this.opponent);

        // Inicializar Manejador de Red (NetworkManager)
        if (this.isLAN && this.socket) {
            this.networkManager = new NetworkManager(this.socket);
            
            this.networkManager.onGameEvent((payload) => {
                this.handleRemoteGameEvent(payload);
            });
            
            this.networkManager.onTurnChanged((data) => {
                console.log('[GameScene] Cambio de turno recibido del servidor:', data);
                if (data.currentTurn === this.playerRole) {
                    this.gameEngine.startPlayerTurn();
                } else {
                    this.gameEngine.startOpponentTurn();
                }
            });
        }

        // Renderizar Fondo (Imagen estática)
        this.board = this.add.image(width / 2, height / 2, 'campo-fondo').setOrigin(0.5).setDepth(-1);
        
        // Escalar la imagen para que cubra toda la pantalla manteniendo aspect ratio
        const scaleX = width / this.board.width;
        const scaleY = height / this.board.height;
        const scale = Math.max(scaleX, scaleY);
        this.board.setScale(scale);

        // ---------- RENDERIZAR TABLERO ----------
        // Zona del Oponente (Mano)
        this.createSlotsRow(height * 0.18, 'opponent-slots');
        this.createCardsRow(height * 0.18, 'opponent-cards', this.opponent.hand);

        // Centro (Campo de batalla)
        this.createSlotsRow(height * 0.45 - battleRowYOffset, 'opponent_battle_slots', 6);
        this.createSlotsRow(height * 0.55 + battleRowYOffset, 'player_battle_slots', 6);

        // Zona del Jugador (Mano)
        this.createSlotsRow(height * 0.825, 'player-slots');
        this.createCardsRow(height * 0.825, 'player-cards', this.player.hand);

        // Mazos
        this.createDecks();

        this.events.emit('board-ready');

        // Deselección al hacer clic en el fondo
        this.board.setInteractive();
        this.board.on('pointerdown', () => this.deselectCard());

        // Iniciar Partida
        this.events.off('start-game');
        this.events.on('start-game', () => {
            if (this.gameEngine.gameState === 'pre-start') {
                console.log('[GameScene] Partida iniciada de manera lógica.');
                if (this.isLAN) {
                    if (this.playerRole === 'host') {
                        this.gameEngine.startGame('player');
                    } else {
                        // El guest espera el evento de turno del servidor
                        this.gameEngine.gameState = 'opponent-turn';
                        this.events.emit('update-turn-indicator', 'opponent');
                    }
                } else {
                    this.gameEngine.startGame('player');
                }
            }
        });

        // Cleanup al cerrar la escena
        this.events.off('shutdown');
        this.events.on('shutdown', () => {
            this.events.off('start-game');
            if (this.scene.isActive('UIScene')) this.scene.stop('UIScene');
            if (this.turnTimer) { this.turnTimer.destroy(); this.turnTimer = null; }
            if (this.networkManager) { this.networkManager.disconnect(); }
        });
    }

    /**
     * Procesa los eventos emitidos por el motor de reglas (GameEngine).
     */
    handleEngineEvent(event, data) {
        console.log(`[GameScene] Recibido evento lógico: ${event}`, data);
        
        switch (event) {
            case 'player-turn-started':
                this.events.emit('update-turn-indicator', 'player');
                this.events.emit('update-attack-counter', 'player', data.turnsSinceLastAttack + 1, data.mustAttack);
                
                // Configurar Temporizador (Regla 12 segundos)
                if (this.turnTimer) this.turnTimer.destroy();
                this.turnTimer = this.time.addEvent({
                    delay: 12000,
                    callback: () => {
                        console.log('[GameScene] Tiempo agotado para el jugador.');
                        this.gameEngine.endPlayerTurn();
                    },
                    callbackScope: this
                });
                break;

            case 'opponent-turn-started':
                this.events.emit('update-turn-indicator', 'opponent');
                this.events.emit('update-attack-counter', 'opponent', data.turnsSinceLastAttack + 1, data.mustAttack);
                
                // Si no es LAN, iniciar IA localmente
                if (!this.isLAN) {
                    this.time.delayedCall(800, () => {
                        this.executeBotAction();
                    });
                }
                break;

            case 'player-turn-ended':
                if (this.turnTimer) this.turnTimer.destroy();
                this.events.emit('update-attack-counter', 'player', data.turnsSinceLastAttack + 1, false);
                this.deselectCard(false);
                break;

            case 'opponent-turn-ended':
                this.events.emit('update-attack-counter', 'opponent', data.turnsSinceLastAttack + 1, false);
                break;

            case 'request-turn-change':
                // Si hay animaciones activas, guardamos el cambio en pendiente
                if (this.blockingAnimations > 0) {
                    this.pendingTurnChange = data;
                } else {
                    this.proceedTurnChange(data);
                }
                break;

            case 'game-over':
                this.endGame(data);
                break;
        }
    }

    /**
     * Procede con el cambio de turno real (LAN o local).
     */
    proceedTurnChange(nextTurnOwner) {
        if (this.isLAN) {
            if (nextTurnOwner === 'opponent') {
                this.networkManager.sendEndTurn(this.playerRole);
            }
            return;
        }

        if (nextTurnOwner === 'opponent') {
            this.gameEngine.startOpponentTurn();
        } else {
            this.gameEngine.startPlayerTurn();
        }
    }

    /**
     * Llama al motor de decisión de IA y ejecuta el plan de acción obtenido.
     */
    executeBotAction() {
        if (this.gameEngine.gameState !== 'opponent-turn') return;

        const action = this.botEngine.decideAction(this.gameEngine);
        console.log('[GameScene] IA del Bot decidió realizar:', action);

        switch (action.type) {
            case 'play': {
                const cardPlayed = this.gameEngine.playCard('opponent', action.instanceId, action.fieldIndex);
                if (cardPlayed) {
                    const slotObj = this['opponent_battle_slots'][action.fieldIndex];
                    this.createFieldCard(slotObj, cardPlayed, { isOpponent: true, revealed: false, fieldIndex: action.fieldIndex });
                    
                    this.opponent.drawCard();
                    this.refreshOpponentHand();
                    this.updateDeckCounts();
                }
                this.gameEngine.endOpponentTurn();
                break;
            }
            case 'fuse': {
                const origA = this.opponent.field[action.sourceIndex];
                const origB = this.opponent.field[action.targetIndex];
                
                const res = this.gameEngine.fuseCards('opponent', action.sourceIndex, action.targetIndex);
                if (res && res.newCard) {
                    const targetIndex = action.targetIndex;

                    // Destruir sprites antiguos de forma segura
                    const idsToRemove = [origA?.instanceId, origB?.instanceId].filter(Boolean);
                    idsToRemove.forEach(id => {
                        const obj = this.children.list.find(child => {
                            const cd = child.getData('cardData') || child.cardData;
                            return cd && cd.instanceId === id && child.getData('isOpponentCard') && child.getData('isCardOnField');
                        });
                        if (obj) obj.destroy();
                    });

                    // Limpiar duplicación visual en slot
                    const existing = this.findCardObjectOnField(targetIndex);
                    if (existing && existing.getData('isOpponentCard')) existing.destroy();

                    // Crear carta fusionada
                    const slotObj = this['opponent_battle_slots'][targetIndex];
                    const fusedObj = this.createFieldCard(slotObj, res.newCard, { isOpponent: true, revealed: true, fieldIndex: targetIndex });
                    try { fusedObj.setTexture(`card-${res.newCard.type}-${res.newCard.level}`); } catch (e) {}

                    this.refreshOpponentHand();
                    this.updateDeckCounts();
                }
                this.gameEngine.endOpponentTurn();
                break;
            }
            case 'attack': {
                const attackerObj = this.children.list.find(c => c.getData('isOpponentCard') && c.getData('fieldIndex') === action.attackerIndex);
                const defenderObj = this.children.list.find(c => !c.getData('isOpponentCard') && c.getData('fieldIndex') === action.defenderIndex);

                if (attackerObj && defenderObj) {
                    this.revealOpponentCard(attackerObj);
                    this.revealPlayerCard(defenderObj);

                    const result = this.gameEngine.executeAttack('opponent', action.attackerIndex, action.defenderIndex);
                    
                    this.blockingAnimations++;
                    this.tweens.add({
                        targets: attackerObj,
                        x: defenderObj.x,
                        y: defenderObj.y,
                        duration: 200,
                        yoyo: true,
                        ease: 'Power1',
                        onComplete: () => {
                            if (result.loser === 'attacker') {
                                this.destroyCard(this.opponent, action.attackerIndex);
                            } else if (result.loser === 'defender') {
                                this.destroyCard(this.player, action.defenderIndex);
                            }
                            this.gameEngine.endOpponentTurn();
                            this._animationComplete();
                        }
                    });
                } else {
                    this.gameEngine.endOpponentTurn();
                }
                break;
            }
            case 'direct_attack': {
                const attackerObj = this.children.list.find(c => c.getData('isOpponentCard') && c.getData('fieldIndex') === action.attackerIndex);
                if (attackerObj) {
                    this.revealOpponentCard(attackerObj);
                    this.gameEngine.executeDirectAttack('opponent', action.attackerIndex);

                    const targetPos = { x: this.scale.width / 2, y: this['player_battle_slots'][0].y };
                    this.blockingAnimations++;
                    this.tweens.add({
                        targets: attackerObj,
                        x: targetPos.x,
                        y: targetPos.y,
                        duration: 200,
                        yoyo: true,
                        ease: 'Power1',
                        onComplete: () => {
                            this.gameEngine.endOpponentTurn();
                            this._animationComplete();
                        }
                    });
                } else {
                    this.gameEngine.endOpponentTurn();
                }
                break;
            }
            case 'pass':
            default:
                this.gameEngine.endOpponentTurn();
                break;
        }
    }

    /**
     * Controla que el jugador humano juegue una carta al slot.
     */
    handlePlayCard(cardObject, dropZone) {
        if (this.gameEngine.gameState !== 'player-turn') return;
        if (this.gameEngine.playerHasActed) {
            console.log('[GameScene] Ya realizaste tu acción este turno.');
            return;
        }
        if (this.gameEngine.playerMustAttackThisTurn) {
            console.log('[GameScene] Estás obligado a atacar este turno.');
            return;
        }

        const cardDataFromHand = this.selectedCard.cardData;
        const fieldIndex = parseInt(dropZone.name.split('-')[1]);

        // Registrar movimiento lógico
        const cardPlayed = this.gameEngine.playCard('player', cardDataFromHand.instanceId, fieldIndex);
        if (!cardPlayed) return;

        this.selectedCard.cardData = cardPlayed;
        if (this.selectedCard.activeTween) this.selectedCard.activeTween.stop();

        // Animar visualmente el drag-click
        this.tweens.add({
            targets: this.selectedCard,
            x: dropZone.x,
            y: dropZone.y,
            duration: 150,
            ease: 'Power1',
            onComplete: () => {
                if (!this.selectedCard.input) this.selectedCard.setInteractive();
                this.selectedCard.input.cursor = 'pointer';
                this.selectedCard.setData('isCardOnField', true);
                this.selectedCard.setData('cardData', cardPlayed);
                this.selectedCard.setData('fieldIndex', fieldIndex);
                this.selectedCard.setData('isRevealed', false);
                this.selectedCard.setData('startPosition', { x: dropZone.x, y: dropZone.y });

                this['player-cards'] = this['player-cards'].filter(card => card !== this.selectedCard);
                this.deselectCard(false);

                // Robar carta para reponer mano
                this.player.drawCard();
                this.refreshPlayerHand();
                this.updateDeckCounts();

                // Sincronización LAN
                if (this.isLAN && this.networkManager) {
                    this.networkManager.sendPlayCard(this.playerRole, cardPlayed, fieldIndex);
                }

                this.gameEngine.endPlayerTurn();
            }
        });
    }

    /**
     * Intenta fusionar dos cartas propias en el campo de batalla.
     */
    attemptToFuse(selectedCardObject, targetCardObject) {
        if (this.gameEngine.gameState !== 'player-turn') return;
        if (this.gameEngine.playerHasActed) {
            console.log('[GameScene] Ya realizaste tu acción este turno.');
            return;
        }
        if (this.gameEngine.playerMustAttackThisTurn) {
            console.log('[GameScene] Estás obligado a atacar.');
            return;
        }

        const initiatingFusionCardData = selectedCardObject.cardData;
        const targetCardData = targetCardObject.cardData;
        const targetIndex = targetCardObject.getData('fieldIndex');
        const selIdx = selectedCardObject.getData('fieldIndex');

        if (!selectedCardObject.getData('isCardOnField') || !targetCardObject.getData('isCardOnField')) {
            this.deselectCard(false);
            return;
        }

        // Ejecutar fusión lógica
        const fusionResult = this.gameEngine.fuseCards('player', selIdx, targetIndex);
        if (!fusionResult) {
            this.deselectCard();
            return;
        }

        // Desactivar slot origen/destino visualmente
        const targetSlot = this['player_battle_slots'][targetIndex];
        if (targetSlot) targetSlot.disableInteractive();
        const originalSlot = this['player_battle_slots'][fusionResult.emptiedIndex];
        if (originalSlot) originalSlot.setInteractive({ dropZone: true });

        const fusionPosition = { x: targetCardObject.x, y: targetCardObject.y };
        selectedCardObject.destroy();
        targetCardObject.destroy();

        // Crear la nueva carta visual fusionada
        const fusedCardObject = this.createFieldCardAt(fusionPosition.x, fusionPosition.y, fusionResult.newCard, { isOpponent: false, revealed: true, fieldIndex: targetIndex });
        fusedCardObject.setData('startScale', fusedCardObject.scale);
        this.deselectCard(false);

        fusedCardObject.alpha = 0;
        this.tweens.add({
            targets: fusedCardObject,
            alpha: { from: 0, to: 1 },
            duration: 300,
            ease: 'Power2'
        });

        if (this.isLAN && this.networkManager) {
            this.networkManager.sendFuseCards(this.playerRole, selIdx, targetIndex, fusionResult.newCard);
        }

        this.gameEngine.endPlayerTurn();
    }

    /**
     * Intenta fusionar una carta de la mano con una en el campo (en caso de permitirse).
     */
    attemptToFuseFromHand(handCardObject, fieldCardObject) {
        if (this.gameEngine.gameState !== 'player-turn') return;
        if (this.gameEngine.playerHasActed) return;
        if (this.gameEngine.playerMustAttackThisTurn) return;

        const handCardData = handCardObject.cardData;
        const targetIndex = fieldCardObject.getData('fieldIndex');

        const fusionResult = this.gameEngine.fuseFromHand('player', handCardData.instanceId, targetIndex);
        if (!fusionResult) {
            this.deselectCard();
            return;
        }

        const fusionPosition = { x: fieldCardObject.x, y: fieldCardObject.y };
        handCardObject.destroy();
        fieldCardObject.destroy();

        const fusedCardObject = this.createFieldCardAt(fusionPosition.x, fusionPosition.y, fusionResult, { isOpponent: false, revealed: true, fieldIndex: targetIndex });
        fusedCardObject.setData('startScale', fusedCardObject.scale);
        this.deselectCard(false);

        this.player.drawCard();
        this.refreshPlayerHand();
        this.updateDeckCounts();

        fusedCardObject.alpha = 0;
        this.tweens.add({ targets: fusedCardObject, alpha: { from: 0, to: 1 }, duration: 300, ease: 'Power2' });

        if (this.isLAN && this.networkManager) {
            this.networkManager.sendFuseFromHand(this.playerRole, handCardData.instanceId, targetIndex, fusionResult);
        }

        this.gameEngine.endPlayerTurn();
    }

    /**
     * Controla el inicio de un ataque entre dos cartas del campo de batalla.
     */
    handleAttack(attackingCardObject, defendingCardObject) {
        if (this.gameEngine.gameState !== 'player-turn') return;
        if (this.gameEngine.playerHasActed) {
            console.log('[GameScene] Ya realizaste tu acción este turno.');
            return;
        }

        const attackerIndex = attackingCardObject.getData('fieldIndex');
        const defenderIndex = defendingCardObject.getData('fieldIndex');

        // Revelar frontalmente para el combate
        this.revealPlayerCard(attackingCardObject);
        this.revealOpponentCard(defendingCardObject);

        // Registrar ataque lógico
        const result = this.gameEngine.executeAttack('player', attackerIndex, defenderIndex);
        if (!result) return;

        if (this.isLAN && this.networkManager) {
            this.networkManager.sendAttack(this.playerRole, attackerIndex, defenderIndex, result);
        }

        this.animateAttack(attackingCardObject, defendingCardObject, result);
    }

    /**
     * Controla un ataque directo del jugador.
     */
    handleDirectAttack(attackingCardObject) {
        if (this.gameEngine.gameState !== 'player-turn') return;
        if (this.gameEngine.playerHasActed) return;

        const attackerIndex = attackingCardObject.getData('fieldIndex');
        this.revealPlayerCard(attackingCardObject);

        // Registrar ataque directo lógico
        const result = this.gameEngine.executeDirectAttack('player', attackerIndex);
        if (!result) return;

        if (this.isLAN && this.networkManager) {
            this.networkManager.sendDirectAttack(this.playerRole, attackerIndex, result.essenceType);
        }

        // Animar hacia zona del oponente
        const targetPos = { x: this.scale.width / 2, y: this['opponent_battle_slots'][0].y };
        this.animateAttack(attackingCardObject, targetPos, { winner: 'attacker', loser: 'none' });
    }

    /**
     * Anima el movimiento de ataque.
     */
    animateAttack(attackingCardObject, target, result) {
        this.blockingAnimations++;
        this.tweens.add({
            targets: attackingCardObject,
            x: target.x,
            y: target.y,
            duration: 200,
            yoyo: true,
            ease: 'Power1',
            onComplete: () => {
                this.deselectCard(true);
                
                const attackerIsOpponent = !!attackingCardObject.getData('isOpponentCard');
                const attackerOwner = attackerIsOpponent ? this.opponent : this.player;
                
                let defenderOwner = null;
                let defenderFieldIndex = null;
                if (target && typeof target.getData === 'function') {
                    const defenderIsOpponent = !!target.getData('isOpponentCard');
                    defenderOwner = defenderIsOpponent ? this.opponent : this.player;
                    defenderFieldIndex = target.getData('fieldIndex');
                }

                if (result.loser === 'attacker') {
                    this.destroyCard(attackerOwner, attackingCardObject.getData('fieldIndex'));
                } else if (result.loser === 'defender' && defenderOwner && typeof defenderFieldIndex === 'number') {
                    this.destroyCard(defenderOwner, defenderFieldIndex);
                }

                this.gameEngine.endPlayerTurn();
                this._animationComplete();
            }
        });
    }

    /**
     * Maneja eventos remotos recibidos por red en modo LAN.
     */
    handleRemoteGameEvent(payload) {
        if (!payload || !payload.type) return;

        let isRemotePlayer = false;
        if (payload.playerRole) {
            isRemotePlayer = payload.playerRole !== this.playerRole;
        } else {
            isRemotePlayer = payload.actor === 'player';
        }

        // Evitar eco propio del servidor
        if (payload.playerRole && payload.playerRole === this.playerRole) return;

        const targetModel = isRemotePlayer ? this.opponent : this.player;
        const targetSlotsName = isRemotePlayer ? 'opponent_battle_slots' : 'player_battle_slots';

        console.log('[GameScene] Replicando evento remoto:', payload);
        const isOpponentAction = isRemotePlayer && this.gameEngine.gameState === 'opponent-turn';

        switch (payload.type) {
            case 'play_card': {
                const card = payload.card;
                const fieldIndex = payload.fieldIndex;

                targetModel.field[fieldIndex] = card;

                const slot = this[targetSlotsName] && this[targetSlotsName][fieldIndex];
                if (slot) {
                    this.createFieldCard(slot, card, { isOpponent: isRemotePlayer, revealed: false, fieldIndex });
                }
                
                if (isOpponentAction) {
                    this.gameEngine.registerAction('opponent');
                }
                break;
            }
            case 'fuse_cards': {
                const sourceIndex = payload.sourceIndex;
                const targetIndex = payload.targetIndex;
                const resultCard = payload.resultCard;
                
                targetModel.field[sourceIndex] = null;
                targetModel.field[targetIndex] = resultCard;
                
                const cardObjs = this.children.list.filter(c => 
                    c.getData('isOpponentCard') && 
                    c.getData('isCardOnField') &&
                    (c.getData('fieldIndex') === sourceIndex || c.getData('fieldIndex') === targetIndex)
                );
                cardObjs.forEach(obj => obj.destroy());
                
                const slot = this[targetSlotsName][targetIndex];
                if (slot) {
                    const fusedObj = this.createFieldCard(slot, resultCard, { isOpponent: true, revealed: true, fieldIndex: targetIndex });
                    try { fusedObj.setTexture(`card-${resultCard.type}-${resultCard.level}`); } catch (e) {}
                }
                
                if (isOpponentAction) {
                    this.gameEngine.registerAction('opponent');
                }
                break;
            }
            case 'fuse_from_hand': {
                const targetIndex = payload.targetIndex;
                const resultCard = payload.resultCard;
                
                targetModel.field[targetIndex] = resultCard;
                
                const oldCard = this.children.list.find(c => 
                    c.getData('isOpponentCard') && 
                    c.getData('isCardOnField') &&
                    c.getData('fieldIndex') === targetIndex
                );
                if (oldCard) oldCard.destroy();
                
                const slot = this[targetSlotsName][targetIndex];
                if (slot) {
                    const fusedObj = this.createFieldCard(slot, resultCard, { isOpponent: true, revealed: true, fieldIndex: targetIndex });
                    try { fusedObj.setTexture(`card-${resultCard.type}-${resultCard.level}`); } catch (e) {}
                }
                
                this.refreshOpponentHand();
                
                if (isOpponentAction) {
                    this.gameEngine.registerAction('opponent');
                }
                break;
            }
            case 'attack': {
                const attackerIndex = payload.attackerIndex;
                const defenderIndex = payload.defenderIndex;
                const result = payload.result;
                
                const attackerObj = this.children.list.find(c => 
                    c.getData('isOpponentCard') && 
                    c.getData('isCardOnField') &&
                    c.getData('fieldIndex') === attackerIndex
                );
                const defenderObj = this.children.list.find(c => 
                    !c.getData('isOpponentCard') && 
                    c.getData('isCardOnField') &&
                    c.getData('fieldIndex') === defenderIndex
                );
                
                if (!attackerObj || !defenderObj) break;
                
                this.revealOpponentCard(attackerObj);
                this.revealPlayerCard(defenderObj);

                if (isOpponentAction) {
                    this.gameEngine.registerAction('opponent');
                    this.gameEngine.opponentPerformedAttackThisTurn = true;
                    this.gameEngine.opponentTurnsSinceLastAttack = 0;
                }

                this.tweens.add({
                    targets: attackerObj,
                    x: defenderObj.x,
                    y: defenderObj.y,
                    duration: 200,
                    yoyo: true,
                    ease: 'Power1',
                    onComplete: () => {
                        if (result.loser === 'attacker') {
                            const ownerIsOpponent = !!attackerObj.getData('isOpponentCard');
                            const owner = ownerIsOpponent ? this.opponent : this.player;
                            this.destroyCard(owner, attackerObj.getData('fieldIndex'));
                        } else if (result.loser === 'defender') {
                            const ownerIsOpponent = !!defenderObj.getData('isOpponentCard');
                            const owner = ownerIsOpponent ? this.opponent : this.player;
                            this.destroyCard(owner, defenderObj.getData('fieldIndex'));
                        }
                    }
                });
                break;
            }
            case 'direct_attack': {
                const attackerIndex = payload.attackerIndex;
                const essenceType = payload.essenceType;
                
                const attackerObj = this.children.list.find(c => 
                    c.getData('isOpponentCard') && 
                    c.getData('isCardOnField') &&
                    c.getData('fieldIndex') === attackerIndex
                );
                
                if (attackerObj) {
                    this.revealOpponentCard(attackerObj);
                    this.opponent.fillEssence(essenceType);
                    
                    const targetPos = { x: this.scale.width / 2, y: this['player_battle_slots'][0].y };
                    this.tweens.add({
                        targets: attackerObj,
                        x: targetPos.x,
                        y: targetPos.y,
                        duration: 200,
                        yoyo: true,
                        ease: 'Power1',
                        onComplete: () => {
                            if (isOpponentAction) {
                                this.gameEngine.registerAction('opponent');
                                this.gameEngine.opponentPerformedAttackThisTurn = true;
                                this.gameEngine.opponentTurnsSinceLastAttack = 0;
                            }
                        }
                    });
                }
                break;
            }
        }
    }

    /**
     * Destruye una carta visualmente del campo aplicando efectos de partículas.
     */
    destroyCard(owner, fieldIndex, instanceId = null) {
        let cardData = (typeof fieldIndex === 'number' && owner.field[fieldIndex]) ? owner.field[fieldIndex] : null;

        if ((!cardData || (instanceId && cardData.instanceId !== instanceId)) && instanceId) {
            const foundIdx = owner.field.findIndex(slot => slot && slot.instanceId === instanceId);
            if (foundIdx !== -1) {
                fieldIndex = foundIdx;
                cardData = owner.field[fieldIndex];
            }
        }

        let cardObject = null;
        if (instanceId) {
            cardObject = this.children.list.find(child => {
                const cd = (child.getData && child.getData('cardData')) || child.cardData;
                if (!cd || !cd.instanceId) return false;
                const ownerMatch = (owner.id === 'player') ? child.getData('isCardOnField') && !child.getData('isOpponentCard') : child.getData('isOpponentCard') && child.getData('isCardOnField');
                return ownerMatch && cd.instanceId === instanceId;
            });
        }

        const modelInstanceId = cardData && cardData.instanceId;
        const finalInstanceId = instanceId || modelInstanceId || (cardObject && cardObject.getData && cardObject.getData('cardData')?.instanceId) || null;

        if (finalInstanceId) {
            if (this._pendingDestroys.has(finalInstanceId)) return;
            this._pendingDestroys.add(finalInstanceId);
        }

        if (!cardObject && typeof fieldIndex === 'number') {
            const isOpponentCard = owner.id === 'opponent';
            cardObject = this.children.list.find(child => {
                if (!child.getData) return false;
                const childIsOpponent = !!child.getData('isOpponentCard');
                return child.getData('fieldIndex') === fieldIndex && child.getData('isCardOnField') && childIsOpponent === isOpponentCard;
            });
        }

        if (!cardData && !cardObject) {
            const fallback = this.children.list.find(child => child.getData && child.getData('fieldIndex') === fieldIndex);
            if (fallback?.destroy) fallback.destroy();
            if (typeof fieldIndex === 'number') owner.field[fieldIndex] = null;
            return;
        }

        // Si solo hay modelo
        if (cardData && !cardObject) {
            this._sendToGraveyard(owner, cardData);
            if (typeof fieldIndex === 'number') owner.field[fieldIndex] = null;
            if (owner.id === 'player') this.refreshPlayerHand();
            this.updateDeckCounts();
            if (finalInstanceId) this._pendingDestroys.delete(finalInstanceId);
            return;
        }

        let visualDestroyed = false;
        let modelCleaned = false;

        const tryFinalize = () => {
            if (visualDestroyed && modelCleaned && finalInstanceId) {
                this._pendingDestroys.delete(finalInstanceId);
            }
        };

        if (cardObject) {
            this.blockingAnimations++;
            cardObject.setVisible(false);

            // Explosión de partículas Phaser
            const particles = this.add.particles(cardObject.x, cardObject.y, cardObject.texture.key, {
                speed: { min: 50, max: 200 },
                angle: { min: 0, max: 360 },
                scale: { start: 0.1, end: 0 },
                alpha: { start: 1, end: 0 },
                lifespan: 600,
                blendMode: 'SCREEN',
                emitting: false
            });

            particles.explode(40);

            this.time.delayedCall(1000, () => {
                if (cardObject?.destroy) cardObject.destroy();
                if (particles?.destroy) particles.destroy();
                visualDestroyed = true;
                this._animationComplete();
                tryFinalize();
            });
        }

        if (cardData) {
            this._sendToGraveyard(owner, cardData);
            if (typeof fieldIndex === 'number') {
                owner.field[fieldIndex] = null;
                modelCleaned = true;
                tryFinalize();
            }
        }

        if (owner.id === 'player' && typeof fieldIndex === 'number') {
            const slot = this['player_battle_slots'][fieldIndex];
            if (slot) {
                try { slot.setInteractive({ dropZone: true }); } catch (e) { slot.setInteractive(); }
            }
            this.refreshPlayerHand();
        }

        this.updateDeckCounts();
    }

    /**
     * Helper de descomposición de cartas al cementerio.
     */
    _sendToGraveyard(owner, cardData) {
        if (cardData.level === 2) {
            owner.addCardDataToGraveyard({ ...cardData, level: 1, id: `${cardData.type}-l1` });
            owner.addCardDataToGraveyard({ ...cardData, level: 1, id: `${cardData.type}-l1-b` });
        } else if (cardData.level === 3) {
            for (let i = 0; i < 4; i++) owner.addCardDataToGraveyard({ ...cardData, level: 1, id: `${cardData.type}-l1-${i}` });
        } else {
            owner.addCardDataToGraveyard(cardData);
        }
    }

    /**
     * Finaliza la partida.
     */
    endGame(winner) {
        if (this.turnTimer) this.turnTimer.destroy();
        this.events.emit('update-timer', 0);
        this.input.enabled = false;
        // Emitir en la escena Y en el evento global de Phaser
        this.events.emit('game-over', winner);
        this.game.events.emit('game-over', winner);
    }

    /**
     * Selecciona una carta y realiza animación visual de levantado.
     */
    selectCard(cardObject) {
        this.selectedCard = cardObject;
        const fieldIndex = cardObject.getData('fieldIndex');
        console.log('Carta seleccionada visualmente:', { ...cardObject.cardData, fieldIndex });

        const isOnField = !!cardObject.getData('isCardOnField');
        const yShift = isOnField ? -25 : -50;
        
        this.tweens.add({
            targets: cardObject,
            y: cardObject.getData('startPosition').y + yShift,
            duration: 150,
            ease: 'Power1'
        });
    }

    /**
     * Deselecciona la carta activa.
     */
    deselectCard(animate = true) {
        if (!this.selectedCard) return;

        const cardToDeselect = this.selectedCard;
        this.selectedCard = null;

        if (animate) {
            this.tweens.add({
                targets: cardToDeselect,
                x: cardToDeselect.getData('startPosition').x,
                y: cardToDeselect.getData('startPosition').y,
                duration: 200,
                ease: 'Power1'
            });
        }
    }

    /**
     * Redibuja las cartas en la mano del jugador humano.
     */
    refreshPlayerHand() {
        if (this['player-cards']) {
            this['player-cards'].forEach(card => card.destroy());
        }
        this.createCardsRow(this.scale.height * 0.83, 'player-cards', this.player.hand);
    }

    /**
     * Redibuja las cartas en la mano del oponente.
     */
    refreshOpponentHand() {
        if (this['opponent-cards']) {
            this['opponent-cards'].forEach(card => card.destroy());
        }
        this.createCardsRow(this.scale.height * 0.18, 'opponent-cards', this.opponent.hand);
    }

    /**
     * Revela una carta del jugador humano a nivel lógico y de visualización.
     */
    revealPlayerCard(cardObject) {
        if (!cardObject || cardObject.getData('isRevealed')) return;

        const cardData = cardObject.getData('cardData') || cardObject.cardData;
        cardObject.setData('isRevealed', true);
        if (cardData) cardData.isRevealed = true; // Sincronizar al modelo

        if (cardObject.setTexture && cardData) {
            cardObject.setTexture(`card-${cardData.type}-${cardData.level}`);
            cardObject.setDisplaySize(this.cardFieldSize.width, this.cardFieldSize.height);
        }
    }

    /**
     * Revela una carta del oponente.
     */
    revealOpponentCard(cardObject) {
        if (!cardObject || cardObject.getData('isRevealed')) return;

        const cardData = cardObject.getData('cardData');
        cardObject.setData('isRevealed', true);
        if (cardData) cardData.isRevealed = true; // Sincronizar al modelo

        this.tweens.add({
            targets: cardObject,
            scaleX: 0,
            scaleY: cardObject.scaleY * 1.1,
            duration: 100,
            ease: 'Power1',
            onComplete: () => {
                cardObject.setTexture(`card-${cardData.type}-${cardData.level}`);
                cardObject.setDisplaySize(this.cardFieldSize.width, this.cardFieldSize.height);
                this.tweens.add({
                    targets: cardObject,
                    scaleX: cardObject.scaleX,
                    scaleY: cardObject.scaleY,
                    duration: 100,
                    ease: 'Power1'
                });
            }
        });
    }

    // ---------- VISUAL GENERATORS ----------
    createSlotsRow(y, name, numSlots = 4) {
        const slots = [];
        const slotWidth = 110;
        const slotSpacing = 35;
        const positionsX = calculateRowPositions({
            numItems: numSlots,
            itemWidth: slotWidth,
            itemSpacing: slotSpacing,
            containerWidth: this.scale.width
        });

        for (let i = 0; i < numSlots; i++) {
            let slot = this.add.image(positionsX[i], y, 'slot')
                .setScale(0.25)
                .setAlpha(0.6)
                .setName(`${name}-${i}`);

            if (name === 'player_battle_slots') {
                slot.setInteractive({ dropZone: true });
                slot.on('pointerdown', () => this.onSlotClicked(slot));
            } else if (name === 'opponent_battle_slots') {
                slot.setInteractive().on('pointerdown', () => this.onOpponentSlotClicked(slot));
            }
            slots.push(slot);
        }
        this[name] = slots;
    }

    createCardsRow(y, name, hand) {
        const cards = [];
        const numCards = hand.length;
        const cardWidth = 110;
        const cardSpacing = 35;
        const positionsX = calculateRowPositions({
            numItems: numCards,
            itemWidth: cardWidth,
            itemSpacing: cardSpacing,
            containerWidth: this.scale.width
        });

        for (let i = 0; i < numCards; i++) {
            const cardData = hand[i];
            let card = (name === 'player-cards') 
                ? this.createPlayerCard(positionsX[i], y, cardData) 
                : this.createOpponentCard(positionsX[i], y, cardData);
            cards.push(card);
        }
        this[name] = cards;
    }

    createPlayerCard(x, y, cardData) {
        const card = new Card(this, x, y, cardData, false);
        card.setDisplaySize(this.cardHandSize.width, this.cardHandSize.height);
        card.setData('startPosition', { x, y });
        card.setData('isRevealed', false);
        card.setData('isCardOnField', false);
        card.on('pointerdown', () => this.onCardClicked(card));
        return card;
    }

    createOpponentCard(x, y, cardData) {
        const card = new Card(this, x, y, cardData, true);
        card.setDisplaySize(this.cardHandSize.width, this.cardHandSize.height);
        card.setData('isOpponentCard', true);
        card.setData('isRevealed', false);
        return card;
    }

    createFieldCard(slotObj, cardData, options = {}) {
        const { isOpponent = false, revealed = false, fieldIndex = null } = options;
        const cardObj = new Card(this, slotObj.x, slotObj.y, cardData, isOpponent);
        cardObj.setDisplaySize(this.cardFieldSize.width, this.cardFieldSize.height);
        
        if (isOpponent) cardObj.setData('isOpponentCard', true);
        cardObj.setData('cardData', cardData);
        if (cardData?.instanceId) {
            cardObj.setName(cardData.instanceId);
            cardObj.setData('instanceId', cardData.instanceId);
        }
        cardObj.setData('isCardOnField', true);
        if (fieldIndex !== null) cardObj.setData('fieldIndex', fieldIndex);
        cardObj.setData('isRevealed', !!revealed);
        cardObj.setData('startPosition', { x: slotObj.x, y: slotObj.y });
        cardObj.on('pointerdown', () => this.onCardClicked(cardObj));
        return cardObj;
    }

    createFieldCardAt(x, y, cardData, options = {}) {
        const dummySlot = { x, y };
        return this.createFieldCard(dummySlot, cardData, options);
    }

    createDecks() {
        const { width, height } = this.scale;
        const textStyle = { 
            fontSize: '24px', 
            color: '#fff', 
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 5
        };
        const padding = 5;

        const playerDeckImage = this.add.image(width - 120, height - 290, 'card-back-player').setScale(0.185);
        const playerDeckBounds = playerDeckImage.getBounds();
        this.playerDeckText = this.add.text(playerDeckBounds.left + padding, playerDeckBounds.bottom - padding, this.player.deck.getCardsCount(), textStyle).setOrigin(0, 1);

        const opponentDeckImage = this.add.image(120, 290, 'card-back-opponent').setScale(0.185);
        const opponentDeckBounds = opponentDeckImage.getBounds();
        this.opponentDeckText = this.add.text(opponentDeckBounds.left + padding, opponentDeckBounds.bottom - padding, this.opponent.deck.getCardsCount(), textStyle).setOrigin(0, 1);
    }

    updateDeckCounts() {
        this.playerDeckText.setText(this.player.deck.getCardsCount());
        this.opponentDeckText.setText(this.opponent.deck.getCardsCount());
    }

    // ---------- CLICK INTERACTIONS ----------
    onCardClicked(clickedCard) {
        const clickedIsOpponent = !!clickedCard.getData('isOpponentCard');

        if (clickedIsOpponent) {
            if (this.selectedCard && this.selectedCard.getData('isCardOnField') && !this.selectedCard.getData('isOpponentCard') && clickedCard.getData('isCardOnField')) {
                this.handleAttack(this.selectedCard, clickedCard);
            }
            return;
        }

        if (!this.selectedCard) {
            this.selectCard(clickedCard);
            return;
        }

        if (this.selectedCard === clickedCard) {
            this.deselectCard();
            return;
        }

        // Fusión propia en campo
        if (this.selectedCard.getData('isCardOnField') && clickedCard.getData('isCardOnField')) {
            this.attemptToFuse(this.selectedCard, clickedCard);
            return;
        }

        // Cambiar selección
        this.deselectCard(true);
        this.selectCard(clickedCard);
    }

    onSlotClicked(clickedSlot) {
        if (this.selectedCard && !this.selectedCard.getData('isCardOnField')) {
            this.handlePlayCard(this.selectedCard, clickedSlot);
        } else if (this.selectedCard && this.selectedCard.getData('isCardOnField')) {
            const opponentFieldCards = this.opponent.field.filter(card => card !== null);
            if (opponentFieldCards.length === 0) {
                this.handleDirectAttack(this.selectedCard);
            }
        }
    }

    onOpponentSlotClicked(clickedSlot) {
        if (this.selectedCard && this.selectedCard.getData('isCardOnField')) {
            const opponentHasCards = this.opponent.field.some(card => card !== null);
            if (!opponentHasCards) {
                this.handleDirectAttack(this.selectedCard);
            }
        }
    }

    findCardObjectOnField(fieldIndex) {
        return this.children.list.find(child =>
            child.getData && child.getData('isCardOnField') && child.getData('fieldIndex') === fieldIndex
        );
    }

    update() {
        if (this.gameEngine.gameState === 'player-turn' && this.turnTimer) {
            const remainingTime = Math.ceil((1 - this.turnTimer.getProgress()) * 12);
            this.events.emit('update-timer', remainingTime);
        } else if (this.gameEngine.gameState !== 'game-over') {
            this.events.emit('update-timer', 0);
        }
    }

    _cleanupVisuals() {
        try {
            const childrenCopy = this.children ? this.children.list.slice() : [];
            childrenCopy.forEach(child => {
                if (!child) return;
                let hasCardData = false;
                try { hasCardData = !!(child.getData && child.getData('cardData')); } catch(e) {}

                const name = child.name || '';
                const isSlot = typeof name === 'string' && (
                    name.startsWith('player-slots') || name.startsWith('opponent-slots') ||
                    name.startsWith('player_battle_slots') || name.startsWith('opponent_battle_slots')
                );

                let isBoardOrDeck = false;
                try {
                    const tex = child.texture && child.texture.key;
                    if (tex === 'board-bg' || tex === 'slot' || tex === 'card-back-player' || tex === 'card-back-opponent') isBoardOrDeck = true;
                } catch(e) {}

                if (hasCardData || isSlot || isBoardOrDeck) {
                    try { if (child.destroy) child.destroy(); } catch (e) {}
                }
            });
        } catch (e) {
            console.warn('[GameScene] Error durante limpieza visual inicial:', e);
        }
    }

    _animationComplete() {
        this.blockingAnimations = Math.max(0, this.blockingAnimations - 1);
        console.log('[GameScene] Animación finalizada. Bloqueos restantes:', this.blockingAnimations);

        if (this.blockingAnimations === 0 && this.pendingTurnChange) {
            const nextTurn = this.pendingTurnChange;
            this.pendingTurnChange = null;
            this.proceedTurnChange(nextTurn);
        }
    }
}