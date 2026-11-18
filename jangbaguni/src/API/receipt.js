// src/API/receipt.js
import apiClient from './client';

/**
 * 영수증 이미지 업로드 API 호출 함수
 * @param {File} file 
 * @returns {Promise<any>}
 */
export const uploadReceipt = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await apiClient.post('/api/receipts/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('영수증 업로드 실패:', error);
    throw error;
  }
};

/**
 * 특정 영수증 ID의 인식된 상품 목록 조회
 */
export const getReceiptItems = async (receiptId) => {
  const response = await apiClient.get(`/api/receipts/${receiptId}/items`);
  return response.data;
};