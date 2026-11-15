// src/api/auth.js
import apiClient from './client';

export const loginUser = async (username, password) => {
  const response = await apiClient.post('/api/auth/login', { // 실제 로그인 경로로 수정
    username,
    password,
  });
  return response.data;
};

export const signUpUser = async (userData) => {
  // userData: { username, password, birth, gender, email }
  const response = await apiClient.post('/api/auth/signup', userData); // 실제 회원가입 경로로 수정
  return response.data;
};

export const checkUserName = async (username) => {
const response = await apiClient.get('/api/auth/check-username', {
    params: { username },
  });
  return response.data; 
}

export const logoutUser = async () => {
  const response = await apiClient.post('/api/auth/logout');
  return response.data;
};