import api from './api';

export const getAppointments = async (params?: any) => {
  const res = await api.get('/appointments/', { params });
  return res.data;
};

export const createAppointment = async (data: any) => {
  const res = await api.post('/appointments/', data);
  return res.data;
};

export const updateAppointment = async (id: number, data: any) => {
  const res = await api.patch(`/appointments/${id}/`, data);
  return res.data;
};

export const deleteAppointment = async (id: number) => {
  await api.delete(`/appointments/${id}/`);
};
