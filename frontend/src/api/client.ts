import axios from 'axios';
import { useAuthStore } from '../store/authStore';

// Em produção (Netlify), usa a URL do backend no Render
// Em desenvolvimento, usa proxy do Vite (/api → localhost:3001)
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

client.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);

export default client;

// Export base URL for use in Login page (which uses fetch directly)
export const getApiUrl = (path: string) => {
  const base = import.meta.env.VITE_API_URL || '/api';
  return `${base}${path}`;
};
