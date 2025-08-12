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
  baseURL: '', // 프록시를 사용하므로 baseURL을 비워둠
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 10000, // 10초 타임아웃 추가
 });

// API 설정 로깅
console.log('API 설정:', {
  baseURL: '프록시 사용 (/api -> localhost:9000)',
  timeout: 10000
});

// 요청 인터셉터: 인증이 필요한 요청에만 토큰 첨부
api.interceptors.request.use(
  (config) => {
    // 인증이 필요하지 않은 엔드포인트 목록
    const publicEndpoints = [
      '/api/user/login',
      '/api/user/signup',
      '/api/user/signup/email/check'
    ];
    
    // 현재 요청이 공개 엔드포인트인지 확인
    const isPublicEndpoint = publicEndpoints.some(endpoint => 
      config.url === endpoint || config.url.endsWith(endpoint)
    );
    
    if (isPublicEndpoint) {
      // 공개 엔드포인트는 토큰 없이 요청
      console.log('공개 엔드포인트 요청 - 토큰 제외:', {
        url: config.url,
        method: config.method
      });
      return config;
    }
    
    // 인증이 필요한 엔드포인트는 토큰 추가
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
    } else {
      console.log('API 요청 - 토큰 없음:', {
        url: config.url,
        method: config.method
      });
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
    // 500 에러 처리 (서버 내부 오류)
    if (error.response?.status === 500) {
      console.error('서버 내부 오류 발생:', {
        url: error.config?.url,
        method: error.config?.method,
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        headers: error.response.headers
      });
      
      // 500 에러는 서버 측 문제이므로 사용자에게 명확한 안내
      console.warn('500 에러는 서버 측 문제입니다. 백엔드 개발자에게 문의하세요.');
    }
    
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
    
    // 기타 에러들에 대한 로깅
    if (error.response) {
      console.error('API 응답 에러:', {
        url: error.config?.url,
        method: error.config?.method,
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data
      });
    } else if (error.request) {
      console.error('API 요청 에러 (응답 없음):', {
        url: error.config?.url,
        method: error.config?.method,
        request: error.request
      });
    } else {
      console.error('API 설정 에러:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default api;
