// src/API/groupbuy.js
import apiClient from './client';

// 백엔드 응답이 JSON 문자열로 내려올 경우 객체/배열로 파싱
const parseResponseData = (data) => {
  if (typeof data === 'string') {
    try {
      return JSON.parse(data);
    } catch {
      return data;
    }
  }
  return data;
};

// 경로 파라미터용 buy_id 양의 정수 검증 및 변환
const normalizeBuyId = (buyId) => {
  const numericId = Number(buyId);
  if (!Number.isInteger(numericId) || numericId <= 0) {
    throw new Error(`유효하지 않은 buy_id입니다: ${buyId}`);
  }
  return numericId;
};

// 지역별 공동구매 목록 조회 
export const getRegionGroupBuyList = async (region) => {
  const response = await apiClient.get('/api/group_buy', {
    params: { region },
  });
  return parseResponseData(response.data);
};

// 내 참여 중인 공동구매 목록 조회 
export const getMyGroupBuyList = async () => {
  const response = await apiClient.get('/api/group_buy/participants');
  return parseResponseData(response.data);
};

// 공동구매 상세 조회 
export const getGroupBuyDetail = async (buyId) => {
  const id = normalizeBuyId(buyId);
  const response = await apiClient.get(`/api/group_buy/${id}`);
  return parseResponseData(response.data);
};

// 공동구매 생성 (multipart/form-data)
export const createGroupBuy = async ({
  region,
  product_name,
  price,
  place,
  number_of_people,
  description,
  product_image,
}) => {
  const formData = new FormData();
  formData.append('region', String(region));
  formData.append('product_name', String(product_name));
  formData.append('price', String(Number(price)));
  formData.append('place', String(place));
  formData.append('number_of_people', String(Number(number_of_people)));

  if (description !== undefined && description !== null && description !== '') {
    formData.append('description', String(description));
  }
  if (product_image) {
    formData.append('product_image', product_image);
  }

  // FormData 전송 시 기본 application/json 헤더를 제거해 브라우저가 boundary를 설정하도록 처리
  const response = await apiClient.post('/api/group_buy', formData, {
    headers: {
      'Content-Type': undefined,
    },
  });

  return parseResponseData(response.data);
};

// 공동구매 수정 (multipart/form-data)
export const updateGroupBuy = async (
  buyId,
  {
    region,
    product_name,
    price,
    place,
    number_of_people,
    description,
    product_image,
  }
) => {
  const id = normalizeBuyId(buyId);
  const formData = new FormData();
  formData.append('region', String(region));
  formData.append('product_name', String(product_name));
  formData.append('price', String(Number(price)));
  formData.append('place', String(place));
  formData.append('number_of_people', String(Number(number_of_people)));

  if (description !== undefined && description !== null) {
    formData.append('description', String(description));
  }
  if (product_image) {
    formData.append('product_image', product_image);
  }

  const response = await apiClient.put(`/api/group_buy/${id}`, formData, {
    headers: {
      'Content-Type': undefined,
    },
  });

  return parseResponseData(response.data);
};

// 공동구매 삭제
export const deleteGroupBuy = async (buyId) => {
  const id = normalizeBuyId(buyId);
  const response = await apiClient.delete(`/api/group_buy/${id}`);
  return parseResponseData(response.data);
};

// 공동구매 참여 등록
export const joinGroupBuy = async (buyId) => {
  const id = normalizeBuyId(buyId);
  const response = await apiClient.post(`/api/group_buy/${id}/participants`);
  return parseResponseData(response.data);
};