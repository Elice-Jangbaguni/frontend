// src/API/products.js
import apiClient from './client';

export const fetchProducts = async () => {
  try {
    const response = await apiClient.get('/api/products');
    return response.data;
  } catch (error) {
    console.error('제품 목록을 불러오는 중 오류가 발생했습니다:', error);
    throw error;
  }
};