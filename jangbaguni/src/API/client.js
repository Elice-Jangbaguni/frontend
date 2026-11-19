// src/API/client.js
import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,  
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 시 localStorage에 저장된 access_token이 있으면 Authorization 헤더에 자동 첨부
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;