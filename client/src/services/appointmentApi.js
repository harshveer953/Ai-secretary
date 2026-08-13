import api from "./api";

export const getAppointments = async (params = {}) => {
  const response = await api.get("/appointments", { params });
  return response.data;
};

export const getAppointmentStats = async () => {
  const response = await api.get("/appointments/stats");
  return response.data;
};

export const getUpcomingAppointments = async () => {
  const response = await api.get("/appointments/upcoming");
  return response.data;
};

export const getAppointmentById = async (id) => {
  const response = await api.get(`/appointments/${id}`);
  return response.data;
};

export const createAppointment = async (data) => {
  const response = await api.post("/appointments", data);
  return response.data;
};

export const updateAppointment = async (id, data) => {
  const response = await api.patch(`/appointments/${id}`, data);
  return response.data;
};

export const updateAppointmentStatus = async (id, status) => {
  const response = await api.patch(`/appointments/${id}/status`, { status });
  return response.data;
};

export const deleteAppointment = async (id) => {
  const response = await api.delete(`/appointments/${id}`);
  return response.data;
};
