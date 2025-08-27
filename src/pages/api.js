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
  timeout: 60000, // 60초로 타임아웃 증가 (검색 히스토리 API 대응)
 });

// API 설정 로깅
console.log('API 설정:', {
  baseURL: '프록시 사용',
  timeout: 60000
});

// 요청 인터셉터: 토큰 자동 추가 및 로그인 상태 확인
api.interceptors.request.use(
  (config) => {
    console.log('🔍 API 요청 시작:', {
      url: config.url,
      method: config.method?.toUpperCase(),
      params: config.params,
      data: config.data
    });

    // 토큰이 있는 경우 헤더에 추가
    const token = localStorage.getItem('access_token');
    if (token) {
      // 토큰 만료 확인
      if (isTokenExpired(token)) {
        console.warn('토큰이 만료되었습니다. 로그아웃 처리합니다.');
        localStorage.removeItem('access_token');
        localStorage.removeItem('token_type');
        alert('로그인이 만료되었습니다. 다시 로그인해주세요.');
        window.location.href = '/login';
        return Promise.reject(new Error('토큰이 만료되었습니다.'));
      }
      
      console.log('✅ API 요청 - 토큰 있음:', {
        url: config.url,
        method: config.method?.toUpperCase()
      });
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.log('API 요청 - 토큰 없음:', {
        url: config.url,
        method: config.method?.toUpperCase()
      });
      
      // 인증이 필요한 페이지에서 토큰이 없으면 요청을 중단
      const currentPath = window.location.pathname;
      const authRequiredPaths = [
        '/notifications',
        '/cart',
        '/wishlist',
        '/mypage',
        '/orderlist',
        '/kok/payment',
        '/recipes'
      ];
      
      const isAuthRequiredPath = authRequiredPaths.some(path => currentPath.startsWith(path));
      
      if (isAuthRequiredPath) {
        console.log('인증이 필요한 페이지에서 토큰 없음, 요청 중단:', currentPath);
        alert('로그인이 필요한 서비스입니다.');
        // 확인 버튼을 누르면 제자리에 유지
        return Promise.reject(new Error('토큰이 없어서 요청을 중단합니다.'));
      }
    }
    return config;
  },
  (error) => {
    console.error('요청 인터셉터 에러:', error);
    return Promise.reject(error);
  }
);

// 응답 인터셉터: 토큰 만료 시 자동 로그아웃
api.interceptors.response.use(
  (response) => {
    console.log('✅ API 응답 성공:', {
      url: response.config.url,
      method: response.config.method?.toUpperCase(),
      status: response.status,
      statusText: response.statusText
    });
    return response;
  },
  (error) => {
    // 500 에러 처리 (서버 내부 오류)
    if (error.response?.status === 500) {
      console.error('서버 내부 오류 발생:', {
        url: error.config?.url,
        method: error.config?.method?.toUpperCase(),
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
      console.log('401 에러 발생:', {
        url: error.config?.url,
        method: error.config?.method?.toUpperCase(),
        currentPath: window.location.pathname
      });
      
      // 토큰 제거
      localStorage.removeItem('access_token');
      localStorage.removeItem('token_type');
      
      // 인증이 필요한 페이지에서 401 에러가 발생하면 로그인 페이지로 리다이렉트
      const currentPath = window.location.pathname;
      const authRequiredPaths = [
        '/notifications',
        '/cart',
        '/wishlist',
        '/mypage',
        '/orderlist',
        '/kok/payment',
        '/recipes'
      ];
      
      const isAuthRequiredPath = authRequiredPaths.some(path => currentPath.startsWith(path));
      
      if (isAuthRequiredPath) {
        alert('로그인이 만료되었습니다. 다시 로그인해주세요.');
        window.location.href = '/login';
      }
      
      return Promise.reject(error);
    }
    
    // 404 에러 처리 (API 엔드포인트 없음)
    if (error.response?.status === 404) {
      console.log('API 엔드포인트가 존재하지 않습니다:', error.config.url);
      // 404 에러는 개발 환경에서 흔한 상황이므로 에러를 그대로 전달
      return Promise.reject(error);
    }
    
    // 403 에러 처리 (권한 없음)
    if (error.response?.status === 403) {
      console.error('권한이 없습니다:', {
        url: error.config?.url,
        method: error.config?.method?.toUpperCase(),
        data: error.response.data
      });
      alert('해당 작업을 수행할 권한이 없습니다.');
      return Promise.reject(error);
    }
    
    // 기타 에러들에 대한 로깅
    if (error.response) {
      console.error('API 응답 에러:', {
        url: error.config?.url,
        method: error.config?.method?.toUpperCase(),
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data
      });
    } else if (error.request) {
      console.error('API 요청 에러 (응답 없음):', {
        url: error.config?.url,
        method: error.config?.method?.toUpperCase(),
        request: error.request
      });
    } else {
      console.error('API 설정 에러:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default api;
