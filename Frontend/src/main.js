import { createApp } from 'vue';
import App from './App.vue';
import { createPinia } from 'pinia';
import { initializePhaserGame } from './phaser-main.js';

// Crear instancia de Pinia para state management
const pinia = createPinia();

// Crear aplicación Vue
const app = createApp(App);

// Usar Pinia
app.use(pinia);

// Montar la aplicación
app.mount('#app');

// Inicializar Phaser después de que Vue esté montado
// Esto permite que Phaser use el contenedor creado por Vue
app.config.globalProperties.$initPhaser = () => {
    initializePhaserGame();
};

// Store global de Phaser para acceso desde escenas
window.__phaserApp = null;
