// src/API/client.js
import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://jangbaguni-backend.onrender.com',  
  headers: {
    'Content-Type': 'application/json',
  },
});

// 이후 인증이 필요한 API 요청 시 로컬 스토리지의 토큰을 자동으로 헤더에 포함
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;