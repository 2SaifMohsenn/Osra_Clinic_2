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
