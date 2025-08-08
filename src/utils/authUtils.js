import api from '../pages/api';

/**
 * 임시 로그인 함수 (개발용)
 * 백엔드 API가 인증을 요구할 때 테스트용으로 사용
 */
export const tempLogin = async () => {
  try {
    console.log('임시 로그인 시도...');
    const response = await api.post('/api/user/login', {
      email: 'test@example.com',
      password: 'testpassword'
    });
    
    if (response.data && response.data.access_token) {
      localStorage.setItem('access_token', response.data.access_token);
      localStorage.setItem('token_type', response.data.token_type);
      console.log('임시 로그인 성공, 토큰 저장됨');
      return true;
    }
  } catch (error) {
    console.log('임시 로그인 실패:', error.message);
    
    // 백엔드 서버가 실행되지 않았거나 네트워크 에러인 경우
    if (error.code === 'ERR_NETWORK' || 
        error.message.includes('Network Error') ||
        error.response?.status === 422 ||
        error.response?.status === 500) {
      
      console.log('백엔드 서버 연결 실패, 개발용 임시 토큰 생성');
      
      // 개발용 임시 토큰 생성 (더 실제적인 JWT 형식)
      const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
      const payload = btoa(JSON.stringify({
        sub: 'dev_user',
        exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24시간 후 만료
        iat: Math.floor(Date.now() / 1000)
      }));
      const signature = btoa('dev_signature_' + Date.now());
      const tempToken = `${header}.${payload}.${signature}`;
      localStorage.setItem('access_token', tempToken);
      localStorage.setItem('token_type', 'bearer');
      
      console.log('개발용 임시 토큰 생성 완료');
      return true;
    }
    
    return false;
  }
};

/**
 * 토큰 유효성 검증 함수
 */
export const validateToken = async () => {
  try {
    const token = localStorage.getItem('access_token');
    if (!token) {
      return false;
    }
    
    // 간단한 토큰 유효성 검증 (JWT 형식 확인)
    const tokenParts = token.split('.');
    if (tokenParts.length !== 3) {
      console.log('토큰 형식이 올바르지 않습니다.');
      return false;
    }
    
    // 토큰 만료 시간 확인 (선택적)
    try {
      const payload = JSON.parse(atob(tokenParts[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      if (payload.exp && payload.exp < currentTime) {
        console.log('토큰이 만료되었습니다.');
        return false;
      }
    } catch (e) {
      console.log('토큰 페이로드 파싱 실패:', e.message);
      return false;
    }
    
    return true;
  } catch (error) {
    console.log('토큰 유효성 검증 실패:', error.message);
    return false;
  }
};

/**
 * 토큰이 있는지 확인하고, 없거나 유효하지 않으면 임시 로그인 시도
 */
export const ensureToken = async () => {
  const token = localStorage.getItem('access_token');
  
  if (!token) {
    console.log('토큰이 없어 임시 로그인을 시도합니다...');
    return await tempLogin();
  }
  
  // 토큰이 있으면 유효성 검증
  const isValid = await validateToken();
  if (!isValid) {
    console.log('토큰이 유효하지 않아 새로 임시 로그인을 시도합니다...');
    removeToken(); // 기존 토큰 제거
    return await tempLogin();
  }
  
  console.log('토큰이 유효합니다.');
  return true;
};

/**
 * 현재 사용자의 토큰 반환
 */
export const getToken = () => {
  return localStorage.getItem('access_token');
};

/**
 * 토큰 제거 (로그아웃)
 */
export const removeToken = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('token_type');
};

/**
 * 사용자가 로그인되어 있는지 확인
 */
export const isLoggedIn = () => {
  return !!localStorage.getItem('access_token');
};
