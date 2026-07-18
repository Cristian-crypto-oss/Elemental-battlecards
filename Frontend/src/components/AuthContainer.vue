<template>
  <div class="auth-container">
    <!-- Mostrar LoginForm por defecto, o RegisterForm si está activo -->
    <Transition name="fade" mode="out-in">
      <LoginForm 
        v-if="!showRegister"
        key="login"
        @register-click="showRegister = true"
        @login-success="handleLoginSuccess"
      />
      <RegisterForm 
        v-else
        key="register"
        @login-click="showRegister = false"
        @register-success="handleRegisterSuccess"
      />
    </Transition>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import LoginForm from './LoginForm.vue';
import RegisterForm from './RegisterForm.vue';

const emit = defineEmits(['auth-success']);

const showRegister = ref(false);

const handleLoginSuccess = (userData) => {
  console.log('[AuthContainer] Login exitoso:', userData);
  emit('auth-success', { type: 'login', userData });
};

const handleRegisterSuccess = (userData) => {
  console.log('[AuthContainer] Registro exitoso:', userData);
  emit('auth-success', { type: 'register', userData });
};
</script>

<style scoped>
.auth-container {
  width: 100%;
  height: 100%;
  min-height: 100vh;
}

/* Transición fade */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.fade-enter-to,
.fade-leave-from {
  opacity: 1;
}
</style>
