import Phaser from 'phaser';
import PreloaderScene from './scenes/Preloader.js';
import GameScene from './scenes/GameScene.js';
import GameSceneLAN from './scenes/GameSceneLAN.js';
import UIScene from './scenes/uiScene.js';

/**
 * Configuración de Phaser.
 * 
 * Flujo actualizado (Vue maneja todas las vistas):
 *   - Vue: Login → Registro → Preload → MainMenu → CreateRoom
 *   - Phaser (después de que Vue inicia el juego): Preloader → GameScene/GameSceneLAN + UIScene
 *
 * Las vistas (login, registro, preload, menú, creación de sala) están a cargo de Vue.
 * Phaser solo gestiona la lógica y renderización del juego en sí.
 */
export function initializePhaserGame(options = {}) {
    const config = {
        type: Phaser.AUTO,
        dom: { createContainer: true },
        width: 1600,
        height: 1000,
        scale: {
            mode: Phaser.Scale.FIT,
            autoCenter: Phaser.Scale.CENTER_BOTH
        },
        parent: 'game-container',
        loader: {
            generateMipmap: true
        },
        scene: [
            PreloaderScene,  // Carga assets del juego
            GameSceneLAN,    // Juego LAN (multijugador)
            GameScene,       // Juego vs Bot o single-player
            UIScene          // UI del juego (overlay)
        ]
    };

    const game = new Phaser.Game(config);
    return game;
}

export default { initializePhaserGame };
