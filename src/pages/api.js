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
      config.headers.Authorization = `Bearer ${token}`;
      console.log('API 요청에 토큰 추가:', {
        url: config.url,
        method: config.method,
        hasToken: !!token,
        tokenLength: token.length,
        tokenStart: token.substring(0, 20) + '...'
      });
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
    if (error.response?.status === 401) {
      // 현재 페이지가 인증이 필요하지 않은 페이지인지 확인
      const currentPath = window.location.pathname;
      const publicPaths = ['/kok', '/kok/products', '/recipes', '/recipes/by-ingredients', '/main'];
      
      const isPublicPath = publicPaths.some(path => currentPath.startsWith(path));
      
      if (isPublicPath) {
        // 인증이 필요하지 않은 페이지에서는 401 에러를 무시
        console.log('인증이 필요하지 않은 페이지에서 401 에러 발생, 무시합니다:', currentPath);
        return Promise.reject(error);
      }
      
      // 토큰이 있는 경우에만 로그인 페이지로 리다이렉트
      const token = localStorage.getItem('access_token');
      if (token) {
        console.log('인증이 필요한 페이지에서 401 에러 발생, 토큰 제거 후 로그인 페이지로 리다이렉트:', currentPath);
        localStorage.removeItem('access_token');
        localStorage.removeItem('token_type');
        // window.location.href = '/'; // 로그인 페이지로 리다이렉트 - 임시로 비활성화
        console.log('리다이렉트 비활성화됨');
      } else {
        console.log('토큰이 없어서 401 에러 발생, 에러만 반환:', currentPath);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
