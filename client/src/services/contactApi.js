import api from "./api";

export const getContacts = async (params = {}) => {
  const response = await api.get("/contacts", { params });
  return response.data;
};

export const getContactById = async (id) => {
  const response = await api.get(`/contacts/${id}`);
  return response.data;
};

export const createContact = async (data) => {
  const response = await api.post("/contacts", data);
  return response.data;
};

export const updateContact = async (id, data) => {
  const response = await api.patch(`/contacts/${id}`, data);
  return response.data;
};

export const deleteContact = async (id) => {
  const response = await api.delete(`/contacts/${id}`);
  return response.data;
};

export const toggleFavoriteContact = async (id, isFavorite) => {
  const response = await api.patch(`/contacts/${id}/favorite`, { isFavorite });
  return response.data;
};
