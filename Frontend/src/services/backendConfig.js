/**
 * Configuración del backend
 * Centraliza la lógica para obtener la URL del backend
 * compatible con localhost y DevTunnels
 */

/**
 * Obtiene la URL base del backend según el entorno
 * @returns {string} URL del backend
 */
export const getBackendUrl = () => {
  // Permitir override via parámetro de URL
  const params = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
  if (params.has('backend')) {
    const url = params.get('backend');
    console.log('[BackendConfig] URL desde parámetro:', url);
    return url;
  }
  
  // Permitir override via variable global
  if (typeof window !== 'undefined' && window.BACKEND_URL) {
    console.log('[BackendConfig] URL desde variable global:', window.BACKEND_URL);
    return window.BACKEND_URL;
  }
  
  if (typeof window !== 'undefined') {
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    
    console.log('[BackendConfig] Detectando entorno - protocol:', protocol, 'hostname:', hostname);
    
    // Si estamos en DevTunnels, usar el subdominio correcto para el puerto 3000
    if (hostname.includes('devtunnels.ms')) {
      // DevTunnels crea subdominios separados por puerto
      // Ejemplo: x5v4c69f-5173.use.devtunnels.ms -> x5v4c69f-3000.use.devtunnels.ms
      const parts = hostname.split('-');
      const tunnelId = parts[0];
      const url = `${protocol}//${tunnelId}-3000.use.devtunnels.ms`;
      console.log('[BackendConfig] URL para DevTunnels:', url);
      return url;
    }
    
    // Para localhost o 127.0.0.1, forzar HTTP
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      const url = `http://${hostname}:3000`;
      console.log('[BackendConfig] URL para localhost:', url);
      return url;
    }
    
    // Fallback: agregar puerto 3000 al hostname actual
    const url = `${protocol}//${hostname}:3000`;
    console.log('[BackendConfig] URL fallback:', url);
    return url;
  }
  
  // Fallback por defecto
  console.log('[BackendConfig] URL fallback por defecto: http://localhost:3000');
  return 'http://localhost:3000';
};

/**
 * Obtiene la URL completa de una ruta de la API
 * @param {string} path - Ruta de la API (ej: '/api/auth/login')
 * @returns {string} URL completa
 */
export const getApiUrl = (path) => {
  const baseUrl = getBackendUrl();
  // Asegurar que el path comience con /
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${normalizedPath}`;
};

export default {
  getBackendUrl,
  getApiUrl
};
