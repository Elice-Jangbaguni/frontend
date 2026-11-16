// src/API/auth.js
import apiClient from './client';

/**
 * 로그인 요청
 * @param {string} username
 * @param {string} password
 */
export const loginUser = async (username, password) => {
  const response = await apiClient.post('/api/auth/login', {
    username,
    password,
  });
  return response.data;
};

/**
 * 회원가입 요청
 * @param {{ username: string, password: string, birth: string, gender: string, email: string }} userData
 */
export const signUpUser = async (userData) => {
  const response = await apiClient.post('/api/auth/signup', userData);
  return response.data;
};

/**
 * 아이디 중복 확인
 * @param {string} username
 */
export const checkUserName = async (username) => {
  const response = await apiClient.get('/api/auth/check-username', {
    params: { username },
  });
  return response.data;
};

/**
 * 로그아웃 요청
 */
export const logoutUser = async () => {
  const response = await apiClient.post('/api/auth/logout');
  return response.data;
};