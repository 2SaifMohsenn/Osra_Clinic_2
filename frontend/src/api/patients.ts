import api from "./api";

export const getPatients = async () => {
  const res = await api.get("/patients/");
  return res.data;
};

export const createPatient = async (patient: any) => {
  const res = await api.post("/patients/", patient);
  return res.data;
};

export const deletePatient = async (id: number) => {
  await api.delete(`/patients/${id}/`);
};

export const getPatient = async (id: number) => {
  const res = await api.get(`/patients/${id}/`);
  return res.data;
};

export const updatePatient = async (id: number, data: any) => {
  const res = await api.patch(`/patients/${id}/`, data);
  return res.data;
};

export const changePatientPassword = async (id: number, current_password: string, new_password: string) => {
  const res = await api.post(`/patients/${id}/change_password/`, { current_password, new_password });
  return res.data;
};
