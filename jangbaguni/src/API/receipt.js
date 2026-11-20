// src/API/receipt.js
import apiClient from './client';

/**
 * 영수증 이미지
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

/**
 * 식재료 소비기한 인식 OCR 인식
 * @param {File}
 * @returns {Promise<any>}
 */
export const scanProductDate = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await apiClient.post('/api/products/product_date_ocr', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};