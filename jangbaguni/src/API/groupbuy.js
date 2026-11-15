// src/API/groupbuy.js
import apiClient from './client';

export const getRegionGroupBuyList = async (region) => {
  const response = await apiClient.get('/api/group_buy', {
    params: { region },
  });
  return response.data;
};

export const getGroupBuyDetail = async (buyId) => {
  const response = await apiClient.get(`/api/group_buy/${buyId}`);
  return response.data;
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
  formData.append('region', region);
  formData.append('product_name', product_name);
  formData.append('price', String(price));
  formData.append('place', place);
  formData.append('number_of_people', String(number_of_people));

  if (description) {
    formData.append('description', description);
  }
  if (product_image) {
    formData.append('product_image', product_image);
  }

  const response = await apiClient.post('/api/group_buy', formData, {
    headers: {
      'Content-Type': undefined,
    },
  });

  return response.data;
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
  const formData = new FormData();
  formData.append('region', region);
  formData.append('product_name', product_name);
  formData.append('price', String(price));
  formData.append('place', place);
  formData.append('number_of_people', String(number_of_people));

  if (description !== undefined) {
    formData.append('description', description);
  }
  if (product_image) {
    formData.append('product_image', product_image);
  }

  const response = await apiClient.put(`/api/group_buy/${buyId}`, formData, {
    headers: {
      'Content-Type': undefined,
    },
  });

  return response.data;
};

export const joinGroupBuy = async (buyId) => {
  const response = await apiClient.post(`/api/group_buy/${buyId}/participants`);
  return response.data;
};