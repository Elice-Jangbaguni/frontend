// src/API/groupbuy.js
import apiClient from './client';

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

export const getRegionGroupBuyList = async (region) => {
  const response = await apiClient.get('/api/group_buy', {
    params: { region },
  });
  return parseResponseData(response.data);
};

export const getMyGroupBuyList = async () => {
  const response = await apiClient.get('/api/group_buy/participants');
  return parseResponseData(response.data);
};

export const getGroupBuyDetail = async (buyId) => {
  const id = normalizeBuyId(buyId);
  const response = await apiClient.get(`/api/group_buy/${id}`);
  return parseResponseData(response.data);
};

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

  const response = await apiClient.post('/api/group_buy', formData, {
    headers: {
      'Content-Type': undefined,
    },
  });

  return parseResponseData(response.data);
};

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

export const joinGroupBuy = async (buyId) => {
  const id = normalizeBuyId(buyId);
  const response = await apiClient.post(`/api/group_buy/${id}/participants`);
  return parseResponseData(response.data);
};