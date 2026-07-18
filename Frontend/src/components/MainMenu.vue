<template>
  <div class="main-menu">
    <div class="menu-container">
      <h1>MAIN MENU</h1>
      <p v-if="authStore.user" class="welcome">Welcome, {{ authStore.user.username }}</p>
      
      <div class="menu-buttons">
        <button class="btn-primary" @click="emit('play-clicked')">PLAY</button>
        <button class="btn-secondary">SETTINGS</button>
        <button class="btn-secondary">PROFILE</button>
        <button class="btn-secondary" @click="emit('logout')">LOGOUT</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '../stores/authStore.js';

const authStore = useAuthStore();
const emit = defineEmits(['play-clicked', 'logout']);
</script>

<style scoped>
.main-menu {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(20, 18, 17, 0.95);
}

.menu-container {
  text-align: center;
}

.menu-container h1 {
  color: #ffaba2;
  font-family: 'Cinzel', serif;
  font-size: 48px;
  margin-bottom: 20px;
}

.welcome {
  color: #8a7566;
  font-size: 14px;
  margin-bottom: 30px;
}

.menu-buttons {
  display: flex;
  flex-direction: column;
  gap: 15px;
  align-items: center;
}

.btn-primary {
  background: #ff5b26;
  color: #1b1816;
  padding: 15px 50px;
  border: none;
  border-radius: 4px;
  font-family: 'Cinzel', serif;
  font-weight: bold;
  cursor: pointer;
  font-size: 16px;
}

.btn-secondary {
  background: transparent;
  color: #8a7566;
  padding: 12px 40px;
  border: 1px solid #8a7566;
  border-radius: 4px;
  font-family: 'Montserrat', sans-serif;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
}

.btn-secondary:hover {
  border-color: #ffaba2;
  color: #ffaba2;
}
</style>
