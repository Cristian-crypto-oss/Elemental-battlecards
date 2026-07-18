import Phaser from 'phaser';
import PreloaderScene from './scenes/Preloader.js';
import GameScene from './scenes/GameScene.js'; 
import UIScene from './scenes/uiScene.js';  
import GameSceneLAN from './scenes/GameSceneLAN.js';

/**
 * Configuración de Phaser separada del flujo de Vue.
 * Las escenas de UI (LoginScene, RegisterScene, HomeScenes, CreateRoomScene)
 * han sido migradas a componentes Vue.
 * Solo mantenemos las escenas de juego en Phaser.
 */
export function initializePhaserGame() {
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
        // Todas las escenas ahora están en Phaser, pero las UI están en Vue
        scene: [ PreloaderScene, GameSceneLAN, GameScene, UIScene ]
    };

    const game = new Phaser.Game(config);
    return game;
}

export default { initializePhaserGame };
