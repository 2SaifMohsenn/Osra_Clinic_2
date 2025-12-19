import api from './api';

export const getMedicalRecords = async (params?: any) => {
  const res = await api.get('/medicalrecords/', { params });
  return res.data;
};

export const getMedicalRecord = async (id: number) => {
  const res = await api.get(`/medicalrecords/${id}/`);
  return res.data;
};

export const createMedicalRecord = async (data: any) => {
  const res = await api.post('/medicalrecords/', data);
  return res.data;
};

export const updateMedicalRecord = async (id: number, data: any) => {
  const res = await api.patch(`/medicalrecords/${id}/`, data);
  return res.data;
};

export const deleteMedicalRecord = async (id: number) => {
  await api.delete(`/medicalrecords/${id}/`);
};