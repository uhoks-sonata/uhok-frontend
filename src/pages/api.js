import axios from 'axios';

const api = axios.create({
  baseURL: process.env.FASTAPI_BASE_URL || 'http://localhost:9000', // 환경변수 기반 기본 URL
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
