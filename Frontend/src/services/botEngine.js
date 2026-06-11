import { resolveCombat } from '../helpers/combat.js';
import { CardDefinitions } from '../game_objects/card-definitions.js';

/**
 * Motor de IA para el oponente (Bot).
 * Analiza el estado lógico de la partida y decide la mejor acción a realizar.
 * Esta clase no depende de Phaser, cumpliendo con SRP y DIP.
 */
export default class BotEngine {
    constructor(player, opponent) {
        this.player = player;       // Jugador humano
        this.opponent = opponent;   // Oponente bot
    }

    /**
     * Calcula y retorna la mejor acción para el bot en su turno actual.
     * @param {GameEngine} engine Instancia del motor de juego
     * @returns {object} Acción recomendada { type: 'play'|'fuse'|'attack'|'direct_attack'|'pass', ... }
     */
    decideAction(engine) {
        const turnNumber = engine.opponentTurnNumber;
        const mustAttack = engine.opponentMustAttackThisTurn;

        // Obtener atacantes disponibles (aquellos en campo que no estén bloqueados este turno)
        const availableAttackersIndices = [];
        this.opponent.field.forEach((card, idx) => {
            if (card && card.blockedTurn !== turnNumber) {
                availableAttackersIndices.push(idx);
            }
        });

        // 1) OBLIGADO A ATACAR
        if (mustAttack && availableAttackersIndices.length > 0) {
            const playerFieldIndices = [];
            this.player.field.forEach((card, idx) => {
                if (card !== null) playerFieldIndices.push(idx);
            });

            // Si el jugador no tiene cartas en el campo -> Ataque directo
            if (playerFieldIndices.length === 0) {
                const randAttackerIdx = availableAttackersIndices[Math.floor(Math.random() * availableAttackersIndices.length)];
                return {
                    type: 'direct_attack',
                    attackerIndex: randAttackerIdx
                };
            }

            // Si hay cartas de jugador, calcular mejor ataque
            const bestAttack = this.findBestAttack(availableAttackersIndices, turnNumber);
            if (bestAttack) {
                return {
                    type: 'attack',
                    attackerIndex: bestAttack.attackerIndex,
                    defenderIndex: bestAttack.defenderIndex
                };
            }

            // Fallback obligado: Ataque aleatorio
            const randAttackerIdx = availableAttackersIndices[Math.floor(Math.random() * availableAttackersIndices.length)];
            const randDefenderIdx = playerFieldIndices[Math.floor(Math.random() * playerFieldIndices.length)];
            return {
                type: 'attack',
                attackerIndex: randAttackerIdx,
                defenderIndex: randDefenderIdx
            };
        }

        // 2) INTENTAR FUSIÓN (Si no está obligado a atacar)
        if (!mustAttack) {
            const fusion = this.findBestFusion();
            if (fusion) {
                return {
                    type: 'fuse',
                    sourceIndex: fusion.sourceIndex,
                    targetIndex: fusion.targetIndex
                };
            }
        }

        // 3) EVALUAR ATAQUE CALCULADO (Opcional - solo si el beneficio es alto)
        if (availableAttackersIndices.length > 0) {
            const bestAttack = this.findBestAttack(availableAttackersIndices, turnNumber);
            // Si tiene una puntuación alta (ganador garantizado y valor alto), atacar
            if (bestAttack && bestAttack.score >= 5) {
                return {
                    type: 'attack',
                    attackerIndex: bestAttack.attackerIndex,
                    defenderIndex: bestAttack.defenderIndex
                };
            }
        }

        // 4) INTENTAR JUGAR CARTA DE LA MANO (Si no está obligado a atacar)
        if (!mustAttack && this.opponent.hand.length > 0) {
            const emptySlots = [];
            this.opponent.field.forEach((card, idx) => {
                if (card === null) emptySlots.push(idx);
            });

            if (emptySlots.length > 0) {
                // Priorizar jugar tipos de carta que aún no controlemos
                const currentTypesInField = new Set(
                    this.opponent.field.filter(c => c !== null).map(c => c.type)
                );

                const missingTypesInField = Object.values(CardDefinitions)
                    .filter(d => d.level === 1)
                    .map(d => d.type)
                    .filter(t => !currentTypesInField.has(t));

                let pickHandIndex = 0;
                if (missingTypesInField.length > 0) {
                    const candidateIdx = this.opponent.hand.findIndex(c => missingTypesInField.includes(c.type));
                    if (candidateIdx !== -1) pickHandIndex = candidateIdx;
                }

                const cardToPlay = this.opponent.hand[pickHandIndex];
                const slotIndex = emptySlots[Math.floor(Math.random() * emptySlots.length)];

                return {
                    type: 'play',
                    instanceId: cardToPlay.instanceId,
                    fieldIndex: slotIndex
                };
            }
        }

        // 5) PASAR TURNO / NO HACER NADA
        return {
            type: 'pass'
        };
    }

    /**
     * Evalúa todos los combates posibles y devuelve el mejor según puntuación.
     */
    findBestAttack(availableAttackersIndices, turnNumber) {
        // Encontrar cartas reveladas del jugador humano
        const playerRevealedCards = [];
        this.player.field.forEach((card, idx) => {
            // El bot solo puede atacar a cartas reveladas
            if (card && card.isRevealed) {
                playerRevealedCards.push({ card, index: idx });
            }
        });

        if (availableAttackersIndices.length === 0 || playerRevealedCards.length === 0) {
            return null;
        }

        let bestAttack = null;
        let highestScore = -100;

        for (const atkIdx of availableAttackersIndices) {
            const attackerCard = this.opponent.field[atkIdx];
            if (!attackerCard) continue;

            for (const defender of playerRevealedCards) {
                let currentScore = 0;
                const result = resolveCombat(attackerCard, defender.card);

                if (result.winner === 'attacker') {
                    // Recompensar victoria, más puntos por cartas de mayor nivel del rival
                    currentScore += 10 + defender.card.level * 2;
                } else {
                    currentScore -= 10;
                    if (result.loser === 'attacker') {
                        // Castigar perder nuestra carta
                        currentScore -= attackerCard.level * 3;
                    }
                }

                if (currentScore > highestScore) {
                    highestScore = currentScore;
                    bestAttack = {
                        attackerIndex: atkIdx,
                        defenderIndex: defender.index,
                        score: currentScore
                    };
                }
            }
        }

        // Solo retornar si es un ataque ventajoso
        return highestScore > 0 ? bestAttack : null;
    }

    /**
     * Busca la mejor fusión de campo disponible.
     */
    findBestFusion() {
        const field = this.opponent.field;
        const samePairs = [];

        // Buscar cartas del mismo tipo y nivel en nuestro campo
        for (let i = 0; i < field.length; i++) {
            for (let j = i + 1; j < field.length; j++) {
                const a = field[i];
                const b = field[j];
                if (a && b && a.type === b.type && a.level === b.level && a.level < 3) {
                    samePairs.push({ i, j, level: a.level });
                }
            }
        }

        if (samePairs.length === 0) return null;

        // Si faltan tipos para ganar (6 tipos únicos), priorizar hacer espacio fusionando duplicados
        const currentTypes = new Set(field.filter(c => c !== null).map(c => c.type));
        const missingTypesCount = 6 - currentTypes.size;

        if (missingTypesCount > 0) {
            // Ordenar de menor nivel a mayor nivel para conservar cartas fuertes
            samePairs.sort((a, b) => a.level - b.level);
            return {
                sourceIndex: samePairs[0].i,
                targetIndex: samePairs[0].j
            };
        }

        return null;
    }
}
