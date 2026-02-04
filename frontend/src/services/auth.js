import apiClient from './axios.js';

export const loginAPI = async (email, password) => {
  const response = await apiClient.post('/auth/login', { email, password });
  return response.data.data;
};

export const registerAPI = async (userData) => {
  const response = await apiClient.post('/auth/register', userData);
  return response.data.data;
};

export const getProfileAPI = async () => {
  const response = await apiClient.get('/auth/profile');
  return response.data.data;
};

export const logoutAPI = async () => {
  await apiClient.post('/auth/logout');
};