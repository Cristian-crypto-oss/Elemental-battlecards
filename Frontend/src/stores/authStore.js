import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

/**
 * Store de Pinia para gestionar la autenticación del usuario.
 * Centraliza el estado de login, usuario actual y token JWT.
 */
export const useAuthStore = defineStore('auth', () => {
  const user = ref(null);
  const token = ref(localStorage.getItem('token') || null);
  const isAuthenticated = computed(() => !!token.value && !!user.value);

  const setUser = (userData) => {
    user.value = userData;
    if (userData.token) {
      token.value = userData.token;
      localStorage.setItem('token', userData.token);
    }
  };

  const setToken = (newToken) => {
    token.value = newToken;
    localStorage.setItem('token', newToken);
  };

  const logout = () => {
    user.value = null;
    token.value = null;
    localStorage.removeItem('token');
  };

  const getToken = () => token.value;

  return {
    user,
    token,
    isAuthenticated,
    setUser,
    setToken,
    logout,
    getToken
  };
});
