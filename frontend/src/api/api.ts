import axios from "axios";

const BASE_URL = "http://10.0.2.2:8000/api";
// for iOS or web:
// const BASE_URL = "http://127.0.0.1:8000/api";

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
