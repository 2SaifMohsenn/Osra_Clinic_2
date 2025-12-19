import api from "./api";

export const signupPatient = async (data: any) => {
  const response = await api.post("/signup/patient/", data);
  return response.data;
};

export const signupDentist = async (data: any) => {
  const response = await api.post("/signup/dentist/", data);
  return response.data;
};

export const login = async (data: any) => {
  const response = await api.post("/auth/login/", data);
  return response.data;
};
