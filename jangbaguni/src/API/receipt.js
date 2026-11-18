// src/API/receipt.js
import apiClient from './client';

/**
 * 영수증 이미지 업로드 API 호출 함수
 * @param {File} file - 업로드할 영수증 이미지 또는 PDF 파일
 * @returns {Promise<any>} 서버 응답 데이터
 */
export const uploadReceipt = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    // 공통 apiClient를 사용하고 multipart/form-data 헤더 설정
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