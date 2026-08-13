import api from "./api";

export const getCalls = async (params = {}) => {
  const response = await api.get("/calls", { params });
  return response.data;
};

export const getCallStats = async () => {
  const response = await api.get("/calls/stats");
  return response.data;
};

export const getCallById = async (id) => {
  const response = await api.get(`/calls/${id}`);
  return response.data;
};

export const createCall = async (data) => {
  const response = await api.post("/calls", data);
  return response.data;
};

export const updateCall = async (id, data) => {
  const response = await api.patch(`/calls/${id}`, data);
  return response.data;
};

export const deleteCall = async (id) => {
  const response = await api.delete(`/calls/${id}`);
  return response.data;
};
