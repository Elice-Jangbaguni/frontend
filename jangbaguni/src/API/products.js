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

export const registerProducts = async (payload) => {
  try {
    const response = await apiClient.post('/products', payload);
    return response.data;
  } catch (error) {
    console.error('상품 일괄 등록 실패:', error.response?.data || error);
    throw error;
  }
};

export const deleteProduct = async (productId) => {
  try {
    const response = await apiClient.delete(`/api/products/${productId}`);
    return response.data;
  } catch (error) {
    console.error(`제품 ID ${productId} 삭제 실패:`, error);
    throw error;
  }
};

export const depleteProduct = async (productId, depletedDate) => {
  try {
    const response = await apiClient.post(`/api/products/${productId}/deplete`, {
      depleted_date: depletedDate, // 예: "2026-11-19" 형식
    });
    return response.data;
  } catch (error) {
    console.error(`제품 ID ${productId} 소진 처리 실패:`, error);
    throw error;
  }
};