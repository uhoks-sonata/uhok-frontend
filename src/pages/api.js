import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001', // API 서버 주소
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 10000, // 10초 타임아웃 추가
});

// API 설정 로깅
console.log('API 설정:', {
  baseURL: 'http://localhost:3001',
  timeout: 10000
});

// 요청 인터셉터: 모든 요청에 자동으로 토큰 첨부
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터: 토큰 만료 시 자동 로그아웃
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // 현재 페이지가 인증이 필요하지 않은 페이지인지 확인
      const currentPath = window.location.pathname;
      const publicPaths = ['/kok', '/kok/products', '/recipes', '/recipes/by-ingredients'];
      
      const isPublicPath = publicPaths.some(path => currentPath.startsWith(path));
      
      if (isPublicPath) {
        // 인증이 필요하지 않은 페이지에서는 401 에러를 무시
        console.log('인증이 필요하지 않은 페이지에서 401 에러 발생, 무시합니다:', currentPath);
        return Promise.reject(error);
      }
      
      // 인증이 필요한 페이지에서만 로그인 페이지로 리다이렉트
      console.log('인증이 필요한 페이지에서 401 에러 발생, 로그인 페이지로 리다이렉트:', currentPath);
      localStorage.removeItem('access_token');
      localStorage.removeItem('token_type');
      window.location.href = '/'; // 로그인 페이지로 리다이렉트
    }
    return Promise.reject(error);
  }
);

export default api;
