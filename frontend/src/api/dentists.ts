import api from './api';

export const getDentist = async (id: number) => {
  const res = await api.get(`/dentists/${id}/`);
  return res.data;
};

export const getDentists = async () => {
  const res = await api.get(`/dentists/`);
  return res.data;
};

export const createDentist = async (data: any) => {
  const res = await api.post(`/dentists/`, data);
  return res.data;
};

export const updateDentist = async (id: number, data: any) => {
  const res = await api.patch(`/dentists/${id}/`, data);
  return res.data;
};

export const deleteDentist = async (id: number) => {
  await api.delete(`/dentists/${id}/`);
};

export const changeDentistPassword = async (id: number, current_password: string, new_password: string) => {
  const res = await api.post(`/dentists/${id}/change_password/`, { current_password, new_password });
  return res.data;
};