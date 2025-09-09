
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8081',
  timeout: 5000,
  withCredentials: true
});

export default api;