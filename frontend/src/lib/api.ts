import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 segundos (backend pode estar "acordando")
});

// Retry interceptor para cold starts do Render
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;
    
    // Se não há config ou já tentou 3 vezes, não retry
    if (!config || config.__retryCount >= 3) {
      return Promise.reject(error);
    }
    
    // Retry apenas em erros de rede ou timeout (não em 4xx)
    if (error.code === 'ECONNABORTED' || !error.response || error.response.status >= 500) {
      config.__retryCount = (config.__retryCount || 0) + 1;
      
      // Delay exponencial: 2s, 4s, 8s
      const delay = Math.pow(2, config.__retryCount) * 1000;
      
      await new Promise((resolve) => setTimeout(resolve, delay));
      
      return api(config);
    }
    
    return Promise.reject(error);
  }
);
