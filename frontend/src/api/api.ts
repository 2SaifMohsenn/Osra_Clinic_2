import axios from "axios";
import { Platform } from 'react-native';

// Choose host based on running platform
const host =
  Platform.OS === 'android'
    ? 'http://10.0.2.2:8000'
    : Platform.OS === 'web'
    ? 'http://localhost:8000'
    : 'http://127.0.0.1:8000';

const BASE_URL = `${host}/api`;

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
