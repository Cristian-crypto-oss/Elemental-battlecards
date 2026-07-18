<template>
  <div class="register-screen-wrapper">
    <!-- Imagen de fondo -->
    <div class="background-image"></div>

    <!-- Overlay decorativo -->
    <div class="background-overlay">
      <div class="gradient-overlay"></div>
      <div class="geometric-glow"></div>
    </div>

    <!-- Partículas flotantes -->
    <div class="particles"></div>

    <!-- Card principal -->
    <main class="register-card">
      <!-- Logo y título -->
      <div class="logo-section">
        <h1 class="main-title">ELEMENTAL</h1>
        <p class="subtitle">BATTLECARDS</p>
      </div>

      <!-- Contenedor del formulario -->
      <div class="form-container">
        <!-- Marco decorativo -->
        <div class="card-frame"></div>

        <!-- Formulario -->
        <form class="register-form" @submit.prevent="handleRegister">
          <!-- Título -->
          <div class="form-header">
            <h2 class="form-title">CREAR CUENTA</h2>
          </div>

          <!-- Campo usuario -->
          <div class="form-group">
            <label class="form-label">USUARIO</label>
            <div class="input-wrapper">
              <input 
                v-model="formData.username" 
                type="text" 
                placeholder="Ingresa tu usuario" 
                class="input-field"
              />
              <div class="input-icon"></div>
            </div>
          </div>

          <!-- Campo email -->
          <div class="form-group">
            <label class="form-label">EMAIL</label>
            <div class="input-wrapper">
              <input 
                v-model="formData.email" 
                type="email" 
                placeholder="tu@email.com" 
                class="input-field"
              />
              <div class="input-icon email-icon"></div>
            </div>
          </div>

          <!-- Campo contraseña -->
          <div class="form-group">
            <label class="form-label">CONTRASEÑA</label>
            <div class="input-wrapper">
              <input 
                v-model="formData.password" 
                :type="showPassword ? 'text' : 'password'" 
                placeholder="••••••••" 
                class="input-field"
              />
              <div class="input-icon"></div>
              <div class="password-toggle" @click="showPassword = !showPassword"></div>
            </div>
          </div>

          <!-- Campo confirmar contraseña -->
          <div class="form-group">
            <label class="form-label">CONFIRMAR CONTRASEÑA</label>
            <div class="input-wrapper">
              <input 
                v-model="formData.confirmPassword" 
                :type="showConfirmPassword ? 'text' : 'password'" 
                placeholder="••••••••" 
                class="input-field"
              />
              <div class="input-icon"></div>
              <div class="password-toggle" @click="showConfirmPassword = !showConfirmPassword"></div>
            </div>
          </div>

          <!-- Mensaje de error -->
          <div v-if="errorMessage" class="error-message">
            {{ errorMessage }}
          </div>

          <!-- Botón de registro -->
          <button type="submit" class="btn-register" :disabled="isLoading">
            {{ isLoading ? 'CREANDO CUENTA...' : 'CREAR CUENTA' }}
          </button>

          <!-- Sección de login -->
          <div class="login-section">
            <span class="login-label">¿YA TIENES CUENTA?</span>
            <button type="button" class="btn-login-link" @click="handleLoginClick">
              INICIAR SESIÓN
            </button>
          </div>
        </form>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useAuthStore } from '../stores/authStore.js';
import axios from 'axios';

const emit = defineEmits(['register-success', 'login-click']);

const authStore = useAuthStore();

const formData = ref({
  username: '',
  email: '',
  password: '',
  confirmPassword: ''
});

const showPassword = ref(false);
const showConfirmPassword = ref(false);
const isLoading = ref(false);
const errorMessage = ref('');

const API_URL = 'http://localhost:3001/api/auth/register';

// Componente montado
onMounted(() => {
  console.log('[RegisterForm] Componente montado');
});

const validateForm = () => {
  if (!formData.value.username.trim()) {
    errorMessage.value = 'El usuario es requerido.';
    return false;
  }

  if (!formData.value.email.trim()) {
    errorMessage.value = 'El email es requerido.';
    return false;
  }

  // Validar email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(formData.value.email)) {
    errorMessage.value = 'Por favor, ingresa un email válido.';
    return false;
  }

  if (!formData.value.password) {
    errorMessage.value = 'La contraseña es requerida.';
    return false;
  }

  if (formData.value.password.length < 6) {
    errorMessage.value = 'La contraseña debe tener al menos 6 caracteres.';
    return false;
  }

  if (formData.value.password !== formData.value.confirmPassword) {
    errorMessage.value = 'Las contraseñas no coinciden.';
    return false;
  }

  return true;
};

const handleRegister = async () => {
  errorMessage.value = '';

  if (!validateForm()) {
    return;
  }

  isLoading.value = true;

  try {
    const response = await axios.post(API_URL, {
      username: formData.value.username.trim(),
      email: formData.value.email.trim(),
      password: formData.value.password
    });

    if (response.data && response.data.token) {
      console.log('[RegisterForm] Registro exitoso:', response.data);
      const userData = {
        ...response.data,
        token: response.data.token
      };
      authStore.setUser(userData);
      emit('register-success', userData);
    }
  } catch (error) {
    console.error('[RegisterForm] Error de registro:', error);
    errorMessage.value = error.response?.data?.message || 'Error al crear la cuenta. Intenta nuevamente.';
  } finally {
    isLoading.value = false;
  }
};

const handleLoginClick = () => {
  emit('login-click');
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Libre+Caslon+Text:wght@400&family=Hanken+Grotesk:wght@400;700&display=swap');

* {
  box-sizing: border-box;
}

/* Wrapper principal */
.register-screen-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 100vh;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(0deg, #121414 0%, #121414 100%);
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
  background: linear-gradient(0deg, #121414 0%, rgba(18, 20, 20, 0) 50%, rgba(18, 20, 20, 0.60) 100%);
}

.geometric-glow {
  position: absolute;
  width: 700px;
  height: 700px;
  left: 50%;
  top: 162px;
  transform: translateX(-50%);
  opacity: 0.30;
  background: radial-gradient(ellipse 70.71% 70.71% at 50% 50%, rgba(242, 202, 80, 0.10) 0%, rgba(242, 202, 80, 0) 75%);
  border-radius: 12px;
  outline: 1px rgba(242, 202, 80, 0.20) solid;
  outline-offset: -1px;
}

/* Partículas */
.particles {
  position: absolute;
  width: 100%;
  height: 100%;
  z-index: 1;
  pointer-events: none;
}

/* Card de registro */
.register-card {
  position: relative;
  z-index: 20;
  width: 448px;
  max-width: calc(100% - 40px);
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding-bottom: 30px;
  margin: 30px 20px;
}

/* Sección del logo */
.logo-section {
  text-align: center;
  box-shadow: 0px 2px 15px rgba(242, 202, 80, 0.30);
  padding-bottom: 8px;
}

.main-title {
  font-family: 'Libre Caslon Text', serif;
  font-size: 36px;
  font-weight: 400;
  color: #F2CA50;
  text-transform: uppercase;
  letter-spacing: 4.80px;
  margin: 0;
  line-height: 40px;
}

.subtitle {
  font-family: 'Libre Caslon Text', serif;
  font-size: 24px;
  font-weight: 400;
  color: #F2CA50;
  text-transform: uppercase;
  letter-spacing: 5.4px;
  margin: 0;
  line-height: 28px;
  opacity: 0.90;
}

/* Contenedor del formulario */
.form-container {
  position: relative;
  width: 100%;
  margin: 0 auto;
}

.card-frame {
  position: absolute;
  width: calc(100% + 32px);
  height: auto;
  left: -16px;
  top: -16px;
  border-radius: 16px;
  border: 2px rgba(242, 202, 80, 0.20) solid;
  z-index: 1;
  pointer-events: none;
  min-height: 500px;
}

/* Formulario */
.register-form {
  position: relative;
  z-index: 2;
  padding: 24px;
  background: rgba(30, 32, 32, 0.95);
  border-radius: 8px;
  outline: 1px rgba(77, 70, 53, 0.30) solid;
  outline-offset: -1px;
  backdrop-filter: blur(12px);
  display: flex;
  flex-direction: column;
  gap: 16px;
  box-shadow: 0px 0px 0px 1px rgba(153, 144, 124, 0.10), 0px 0px 40px 1px rgba(0, 0, 0, 0.90) inset;
}

/* Header del formulario */
.form-header {
  text-align: center;
}

.form-title {
  font-family: 'Libre Caslon Text', serif;
  font-size: 24px;
  font-weight: 400;
  color: #F2CA50;
  text-transform: uppercase;
  letter-spacing: 2.40px;
  line-height: 32px;
  margin: 0;
}

/* Grupos de formulario */
.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-family: 'Hanken Grotesk', sans-serif;
  font-size: 12px;
  font-weight: 700;
  color: #D0C5AF;
  text-transform: uppercase;
  letter-spacing: 0.60px;
  line-height: 16px;
  padding: 0 4px;
}

/* Wrappers de input */
.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-field {
  width: 100%;
  padding-top: 15px;
  padding-bottom: 16px;
  padding-left: 48px;
  padding-right: 16px;
  background: rgba(13, 14, 15, 0.50);
  border: none;
  border-radius: 2px;
  outline: 1px #4D4635 solid;
  outline-offset: -1px;
  font-family: 'Hanken Grotesk', sans-serif;
  font-size: 14px;
  color: #D0C5AF;
  transition: all 0.25s ease;
}

.input-field::placeholder {
  color: rgba(208, 197, 175, 0.4);
}

.input-field:focus {
  outline: 1px #F2CA50 solid;
  background: rgba(13, 14, 15, 0.70);
}

.input-icon {
  position: absolute;
  left: 20px;
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
  background: rgba(242, 202, 80, 0.40);
  border-radius: 2px;
  pointer-events: none;
}

.email-icon {
  width: 20px;
  height: 16px;
}

.password-toggle {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  width: 18.33px;
  height: 12.50px;
  background: #D0C5AF;
  border-radius: 2px;
  cursor: pointer;
  transition: all 0.25s ease;
}

.password-toggle:hover {
  background: #F2CA50;
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
  margin-top: -20px;
}

/* Botón de registro */
.btn-register {
  width: 100%;
  margin: 0;
  padding-top: 16px;
  padding-bottom: 16px;
  background: #D4AF37;
  border: none;
  border-radius: 4px;
  font-family: 'Libre Caslon Text', serif;
  font-size: 20px;
  font-weight: 400;
  color: #241A00;
  text-transform: uppercase;
  letter-spacing: 2px;
  line-height: 28px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0px 4px 20px rgba(0, 0, 0, 0.50);
  outline: none;
}

.btn-register:hover:not(:disabled) {
  background: #E5C158;
  box-shadow: 0px 6px 25px rgba(212, 175, 55, 0.4);
}

.btn-register:active:not(:disabled) {
  transform: translateY(2px);
  box-shadow: 0px 2px 10px rgba(0, 0, 0, 0.5);
}

.btn-register:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Sección de login */
.login-section {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
}

.login-label {
  font-family: 'Hanken Grotesk', sans-serif;
  font-size: 12px;
  font-weight: 700;
  color: rgba(208, 197, 175, 0.80);
  text-transform: uppercase;
  letter-spacing: 1.20px;
  line-height: 16px;
}

.btn-login-link {
  font-family: 'Hanken Grotesk', sans-serif;
  font-size: 12px;
  font-weight: 700;
  color: #F2CA50;
  text-transform: uppercase;
  letter-spacing: 1.20px;
  line-height: 16px;
  background: none;
  border: none;
  cursor: pointer;
  outline: none;
  transition: color 0.25s ease;
}

.btn-login-link:hover {
  color: #FFD700;
}

/* Responsive */
@media (max-width: 768px) {
  .register-card {
    width: 90%;
    max-width: 400px;
  }

  .form-container {
    width: 100%;
  }

  .card-frame {
    width: calc(100% + 32px);
  }

  .btn-register {
    width: 100%;
    font-size: 16px;
  }
}
</style>
