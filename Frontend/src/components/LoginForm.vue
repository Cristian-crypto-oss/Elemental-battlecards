<template>
  <div class="login-screen-wrapper">
    <!-- Imagen de fondo -->
    <div class="background-image"></div>

    <!-- Overlay decorativo -->
    <div class="background-overlay">
      <div class="gradient-overlay"></div>
      <div class="geometric-background">
        <div class="geometric-frame outer"></div>
        <div class="geometric-frame middle"></div>
        <div class="geometric-frame inner"></div>
      </div>
      <!-- Círculos decorativos concéntricos -->
      <div class="concentric-circles">
        <div class="circle-outer"></div>
        <div class="circle-middle"></div>
        <div class="circle-inner"></div>
      </div>
    </div>

    <!-- Efectos de luz de fondo -->
    <div class="light-effects">
      <div class="light-effect light-red"></div>
      <div class="light-effect light-blue"></div>
    </div>

    <!-- Símbolos laterales -->
    <div class="side-symbols left-symbols">
      <div class="symbol">ᛟ</div>
      <div class="symbol">ᚷ</div>
      <div class="symbol">ᚦ</div>
      <div class="symbol">ᚨ</div>
    </div>

    <div class="side-symbols right-symbols">
      <div class="symbol">ᚲ</div>
      <div class="symbol">ᚺ</div>
      <div class="symbol">ᛁ</div>
      <div class="symbol">ᛗ</div>
    </div>

    <!-- Card principal -->
    <main class="login-card">
      <!-- Logo y título -->
      <div class="logo-section">
        <div class="logo-container">
          <img src="/assets/images/logo.png" alt="Elemental Battlecards" class="logo-image" />
        </div>
        <h1 class="main-title">ELEMENTAL</h1>
        <p class="subtitle">battlecards</p>
      </div>

      <!-- Formulario -->
      <form class="login-form" @submit.prevent="handleLogin">
        <!-- Campo usuario -->
        <div class="form-group">
          <label class="form-label">NOMBRE DE GUERRERO</label>
          <div class="input-wrapper">
            <input 
              v-model="username" 
              type="text" 
              placeholder="Ingresa tu nombre" 
              class="input-field"
            />
            <div class="input-indicator"></div>
          </div>
        </div>

        <!-- Campo contraseña -->
        <div class="form-group">
          <label class="form-label">CONTRASEÑA</label>
          <div class="input-wrapper">
            <input 
              v-model="password" 
              type="password" 
              placeholder="Ingresa tu contraseña" 
              class="input-field"
            />
            <div class="input-indicator"></div>
            <div class="password-toggle-icon"></div>
          </div>
        </div>

        <!-- Botón de login -->
        <button type="submit" class="btn-login" :disabled="isLoading">
          {{ isLoading ? 'CONECTANDO...' : 'INICIAR SESION' }}
        </button>

        <!-- Sección de registro -->
        <div class="register-section">
          <div class="register-divider"></div>
          <div class="register-text">
            <span class="register-label">¿NO TIENES CUENTA?</span>
            <button type="button" class="btn-register" @click="handleRegisterClick">
              CREAR CUENTA
            </button>
          </div>
          <div class="register-divider"></div>
        </div>
      </form>

      <!-- Mensaje de error -->
      <div v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useAuthStore } from '../stores/authStore.js';
import axios from 'axios';

const emit = defineEmits(['login-success', 'register-click']);

const authStore = useAuthStore();

const username = ref('');
const password = ref('');
const isLoading = ref(false);
const errorMessage = ref('');

// Configuración del backend
const getBackendUrl = () => {
  const params = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
  if (params.has('backend')) return params.get('backend');
  if (typeof window !== 'undefined' && window.BACKEND_URL) return window.BACKEND_URL;
  
  if (typeof window !== 'undefined') {
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    
    // Si estamos en DevTunnels, usar el subdominio correcto para el puerto 3000
    if (hostname.includes('devtunnels.ms')) {
      // Extraer el ID del túnel (ejemplo: x5v4c69f-5173 -> x5v4c69f)
      const parts = hostname.split('-');
      const tunnelId = parts[0];
      return `${protocol}//${tunnelId}-3000.use.devtunnels.ms`;
    }
    
    // Para localhost o 127.0.0.1, forzar HTTP
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return `http://${hostname}:3000`;
    }
    
    // Fallback: agregar puerto 3000 al hostname actual
    return `${protocol}//${hostname}:3000`;
  }
  return 'http://localhost:3000';
};

const API_URL = getBackendUrl() + '/api/auth/login';

// Manejar escala del video similar a Phaser
onMounted(() => {
  console.log('[LoginForm] Componente montado. Backend URL:', API_URL);
});

const handleLogin = async () => {
  if (!username.value.trim() || !password.value) {
    errorMessage.value = 'Por favor, introduce usuario y contraseña.';
    return;
  }

  isLoading.value = true;
  errorMessage.value = '';

  try {
    const response = await axios.post(API_URL, {
      username: username.value.trim(),
      password: password.value
    });

    if (response.data && response.data.token) {
      console.log('[LoginForm] Login exitoso:', response.data);
      const userData = {
        ...response.data,
        token: response.data.token
      };
      authStore.setUser(userData);
      emit('login-success', userData);
    }
  } catch (error) {
    console.error('[LoginForm] Error de login:', error);
    errorMessage.value = error.response?.data?.message || 'Error al iniciar sesión. Revisa tus credenciales.';
  } finally {
    isLoading.value = false;
  }
};

const handleRegisterClick = () => {
  emit('register-click');
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Libre+Caslon+Text:wght@400&family=Hanken+Grotesk:wght@400;700&family=Nimbus+Sans:wght@700&display=swap');

* {
  box-sizing: border-box;
}

/* Wrapper principal */
.login-screen-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 100vh;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #121414;
}

/* Video de fondo */
.background-video {
  position: absolute;
  transform: translate(100%, 100%);
  min-width: 100%;
  min-height: 100%;
  object-fit: cover;
  z-index: 0;
}

/* Imagen de fondo */
.background-image {
  position: absolute;
  width: 100%;
  height: 100%;
  background: url('/assets/images/fondo.png') center / cover no-repeat;
  z-index: 0;
}

/* Overlay decorativo */
.background-overlay {
  position: absolute;
  width: 100%;
  height: 100%;
  z-index: 1;
  pointer-events: none;
}

.gradient-overlay {
  position: absolute;
  width: 100%;
  height: 100%;
  background: radial-gradient(ellipse 66.57% 75.74% at 50% 50%, rgba(242, 202, 80, 0.15) 0%, #121414 70%);
  z-index: 1;
}

/* Marcos geométricos */
.geometric-background {
  position: absolute;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 0;
}

.geometric-frame {
  position: absolute;
  border-radius: 12px;
  opacity: 0.4;
}

.geometric-frame.outer {
  width: 800px;
  height: 800px;
  outline: 1px rgba(242, 202, 80, 0.20) solid;
  outline-offset: -1px;
}

.geometric-frame.middle {
  width: 600px;
  height: 600px;
  outline: 2px rgba(242, 202, 80, 0.10) solid;
  outline-offset: -2px;
}

.geometric-frame.inner {
  width: 400px;
  height: 400px;
  border: 4px rgba(242, 202, 80, 0.05) solid;
}

/* Círculos concéntricos decorativos */
.concentric-circles {
  position: absolute;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 0;
  pointer-events: none;
}

.circle-outer {
  position: absolute;
  width: 800px;
  height: 800px;
  border-radius: 50%;
  outline: 1px rgba(242, 202, 80, 0.20) solid;
  outline-offset: -1px;
  opacity: 0.40;
}

.circle-middle {
  position: absolute;
  width: 600px;
  height: 600px;
  border-radius: 50%;
  outline: 2px rgba(242, 202, 80, 0.10) solid;
  outline-offset: -2px;
  opacity: 0.40;
}

.circle-inner {
  position: absolute;
  width: 400px;
  height: 400px;
  border-radius: 50%;
  border: 4px rgba(242, 202, 80, 0.05) solid;
  opacity: 0.40;
}

/* Efectos de luz */
.light-effects {
  position: absolute;
  width: 100%;
  height: 100%;
  z-index: 1;
  pointer-events: none;
}

.light-effect {
  position: absolute;
  border-radius: 12px;
  filter: blur(60px);
  opacity: 0.1;
}

.light-red {
  width: 384px;
  height: 384px;
  left: 320px;
  top: 371px;
  background: rgba(127, 29, 29, 0.10);
  box-shadow: 120px 120px 120px;
}

.light-blue {
  width: 384px;
  height: 407.55px;
  left: 576px;
  top: 436.20px;
  background: rgba(30, 58, 138, 0.10);
  box-shadow: 120px 120px 120px;
}

/* Símbolos laterales */
.side-symbols {
  position: absolute;
  display: flex;
  flex-direction: column;
  gap: 32px;
  opacity: 0.2;
  z-index: 2;
  font-family: FreeMono, monospace;
  font-size: 36px;
  color: #E9C349;
  line-height: 40px;
}

.left-symbols {
  left: 80px;
  top: 50%;
  transform: translateY(-50%);
}

.right-symbols {
  right: 80px;
  top: 50%;
  transform: translateY(-50%);
}

/* Card de login */
.login-card {
  position: relative;
  z-index: 20;
  width: 512px;
  max-width: calc(100% - 40px);
  padding: 40px;
  margin: 30px 20px;
  background: radial-gradient(ellipse 212.76% 113.29% at 0% 0%, #282A2B 0%, #121414 100%);
  border-radius: 4px;
  outline: 2px rgba(77, 70, 53, 0.30) solid;
  outline-offset: -2px;
  box-shadow: 0px 10px 30px rgba(0, 0, 0, 0.90), 0px 0px 20px 2px rgba(0, 0, 0, 0.80) inset;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* Sección del logo */
.logo-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.logo-container {
  width: 160px;
  height: 160px;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
}

.logo-image {
  width: 200px;
  height: 200px;
  border-radius: 4px;
}

.main-title {
  font-family: 'Libre Caslon Text', serif;
  font-size: 36px;
  font-weight: 400;
  color: #F2CA50;
  text-transform: uppercase;
  letter-spacing: 3.60px;
  margin: 0;
  line-height: 40px;
}

.subtitle {
  font-family: 'Nimbus Sans', sans-serif;
  font-size: 24px;
  font-weight: 700;
  color: #E9C349;
  text-transform: lowercase;
  line-height: 32px;
  margin: 0;
  opacity: 0.80;
}

/* Formulario */
.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Grupos de formulario */
.form-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.form-label {
  font-family: 'Hanken Grotesk', sans-serif;
  font-size: 10px;
  font-weight: 400;
  color: #D0C5AF;
  text-transform: uppercase;
  letter-spacing: 1px;
  line-height: 24px;
}

/* Wrappers de input */
.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
}

.input-field {
  width: 100%;
  padding-top: 13px;
  padding-bottom: 14px;
  padding-left: 40px;
  padding-right: 16px;
  background: #0D0E0F;
  border: none;
  border-bottom: 1px rgba(13, 14, 15, 0.50) solid;
  border-radius: 2px;
  font-family: 'Hanken Grotesk', sans-serif;
  font-size: 14px;
  color: #D0C5AF;
  outline: none;
  transition: all 0.25s ease;
}

.input-field::placeholder {
  color: rgba(208, 197, 175, 0.4);
}

.input-field:focus {
  border-bottom-color: #F2CA50;
}

.input-indicator {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
  background: #F2CA50;
  border-radius: 2px;
}

.password-toggle-icon {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 22px;
  height: 15px;
  background: #F2CA50;
  border-radius: 2px;
}

/* Botón de login */
.btn-login {
  width: 100%;
  padding-top: 16px;
  padding-bottom: 16px;
  background: linear-gradient(172deg, #1E2020 0%, #121414 100%);
  border: 3px #D4AF37 solid;
  border-radius: 5px;
  font-family: 'Hanken Grotesk', sans-serif;
  font-size: 18px;
  font-weight: 400;
  color: #F2CA50;
  text-transform: uppercase;
  letter-spacing: 3.60px;
  line-height: 28px;
  cursor: pointer;
  transition: all 0.3s ease;
  outline: none;
}

.btn-login:hover:not(:disabled) {
  background: linear-gradient(172deg, #2a2c2c 0%, #1a1c1c 100%);
  box-shadow: 0 0 20px rgba(212, 175, 55, 0.3);
}

.btn-login:active:not(:disabled) {
  transform: translateY(2px);
}

.btn-login:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Sección de registro */
.register-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding-top: 12px;
  padding-bottom: 0;
  border-top: 1px rgba(77, 70, 53, 0.20) solid;
}

.register-divider {
  width: 100%;
  height: 1px;
  background: rgba(77, 70, 53, 0.20);
  display: none;
}

.register-text {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.register-label {
  font-family: 'Hanken Grotesk', sans-serif;
  font-size: 12px;
  font-weight: 700;
  color: #D0C5AF;
  text-transform: uppercase;
  letter-spacing: 0.60px;
  line-height: 16px;
}

.btn-register {
  font-family: 'Hanken Grotesk', sans-serif;
  font-size: 12px;
  font-weight: 700;
  color: #F2CA50;
  text-transform: uppercase;
  letter-spacing: 0.60px;
  line-height: 16px;
  background: none;
  border: none;
  cursor: pointer;
  outline: none;
  transition: color 0.25s ease;
}

.btn-register:hover {
  color: #FFD700;
}

/* Mensaje de error */
.error-message {
  color: #ff6b6b;
  font-family: 'Hanken Grotesk', sans-serif;
  font-size: 12px;
  padding: 12px;
  background: rgba(255, 107, 107, 0.1);
  border-radius: 4px;
  text-align: center;
  border: 1px rgba(255, 107, 107, 0.3) solid;
}

/* Responsive */
@media (max-width: 768px) {
  .login-card {
    width: 90%;
    max-width: 400px;
    padding: 32px;
  }

  .btn-login {
    width: 100%;
  }

  .side-symbols {
    display: none;
  }

  .geometric-frame {
    display: none;
  }
}
</style>
