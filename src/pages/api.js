import axios from 'axios';

// JWT 토큰 만료 시간 확인 함수
const isTokenExpired = (token) => {
  try {
    const tokenParts = token.split('.');
    if (tokenParts.length !== 3) return true;
    
    const payload = JSON.parse(atob(tokenParts[1]));
    const currentTime = Math.floor(Date.now() / 1000);
    
    return payload.exp < currentTime;
  } catch (error) {
    console.warn('토큰 만료 시간 확인 실패:', error);
    return true;
  }
};

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
      // 백엔드 JWT 토큰 형식 검증 (header.payload.signature)
      const tokenParts = token.split('.');
      if (tokenParts.length === 3) {
        try {
          // JWT 헤더 디코딩 시도 (간단한 검증)
          const header = JSON.parse(atob(tokenParts[0]));
          if (header.alg && header.typ === 'JWT') {
            // 토큰 만료 시간 확인
            if (isTokenExpired(token)) {
              console.warn('토큰이 만료되었습니다, 토큰 제거');
              localStorage.removeItem('access_token');
              localStorage.removeItem('token_type');
              // 토큰이 만료된 경우 요청에서 Authorization 헤더 제거
              delete config.headers.Authorization;
            } else {
              config.headers.Authorization = `Bearer ${token}`;
              console.log('유효한 JWT 토큰으로 요청 전송');
            }
          } else {
            console.warn('잘못된 JWT 헤더 형식, 토큰 제거');
            localStorage.removeItem('access_token');
            localStorage.removeItem('token_type');
            delete config.headers.Authorization;
          }
        } catch (error) {
          console.warn('JWT 토큰 디코딩 실패, 토큰 제거:', error);
          localStorage.removeItem('access_token');
          localStorage.removeItem('token_type');
          delete config.headers.Authorization;
        }
      } else {
        console.warn('잘못된 토큰 형식 (JWT가 아님), 토큰 제거:', token);
        localStorage.removeItem('access_token');
        localStorage.removeItem('token_type');
        delete config.headers.Authorization;
      }
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
    // 401 에러 처리 (인증 실패)
    if (error.response?.status === 401) {
      // 현재 페이지가 인증이 필요하지 않은 페이지인지 확인
      const currentPath = window.location.pathname;
      const publicPaths = ['/', '/signup', '/recipes', '/recipes/by-ingredients'];
      
      const isPublicPath = publicPaths.some(path => currentPath.startsWith(path));
      
      if (isPublicPath) {
        // 인증이 필요하지 않은 페이지에서는 401 에러를 무시
        console.log('인증이 필요하지 않은 페이지에서 401 에러 발생, 무시합니다:', currentPath);
        return Promise.reject(error);
      }
      
      // 인증이 필요한 페이지에서만 로그인 페이지로 리다이렉트
      console.log('인증이 필요한 페이지에서 401 에러 발생, 로그인 페이지로 리다이렉트:', currentPath);
      console.log('에러 상세:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data
      });
      
      // 토큰 제거
      localStorage.removeItem('access_token');
      localStorage.removeItem('token_type');
      
      // 로그인 페이지로 리다이렉트
      if (window.location.pathname !== '/') {
        console.log('로그인 페이지로 리다이렉트');
        window.location.href = '/';
      }
    }
    
    // 404 에러 처리 (API 엔드포인트 없음)
    if (error.response?.status === 404) {
      console.log('API 엔드포인트가 존재하지 않습니다:', error.config.url);
      // 404 에러는 개발 환경에서 흔한 상황이므로 에러를 그대로 전달
      return Promise.reject(error);
    }
    
    return Promise.reject(error);
  }
);

export default api;
