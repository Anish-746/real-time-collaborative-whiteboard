import apiClient from "./axios.js";

export const createRoomAPI = async (details) => {
  const response = await apiClient.post('/rooms', details);
  console.log(response);
  return response.data.data.room;
}

export const joinRoomAPI = async (details) => {
  const response = await apiClient.post("/rooms/join", details);
  return response.data.data.room;
}

export const getMyRoomsAPI = async () => {
  const response = await apiClient.get("/rooms/my-rooms");
  return response.data.data.rooms;
}

export const getPublicRoomsAPI = async () => {
  const response = await apiClient.get("/rooms/public");
  return response.data.data.rooms;
}

export const getRoomDetailsAPI = async (shortCode) => {
  const response = await apiClient.get(`/rooms/${shortCode}`);
  return response.data.data;
}

export const updateRoomAPI = async (shortCode, details) => {
  const response = await apiClient.put(`/rooms/${shortCode}`, details);
  return response.data.data.room;
}

export const leaveRoomAPI = async (shortCode) => {
  const response = await apiClient.post(`/rooms/${shortCode}/leave`);
  return response.data.message;
}

export const deleteRoomAPI = async (shortCode) => {
  const response = await apiClient.delete(`/rooms/${shortCode}`);
  return response.data.message;
}