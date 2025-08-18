import api from '../pages/api';

// 사용자 인증 API 함수들
export const userApi = {
  // 회원가입
  signup: async (userData) => {
    try {
      console.log('📝 회원가입 API 요청:', userData);
      const response = await api.post('/api/user/signup', userData);
      console.log('✅ 회원가입 API 응답:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ 회원가입 실패:', error);
      throw error;
    }
  },

  // 이메일 중복 확인
  checkEmailDuplicate: async (email) => {
    try {
      console.log('📧 이메일 중복 확인 API 요청:', { email });
      const response = await api.get(`/api/user/signup/email/check?email=${encodeURIComponent(email)}`);
      console.log('✅ 이메일 중복 확인 API 응답:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ 이메일 중복 확인 실패:', error);
      throw error;
    }
  },

  // 로그인
  login: async (credentials) => {
    try {
      console.log('🔐 로그인 API 요청:', { email: credentials.email });
      
      // 백엔드가 OAuth2 형식을 요구하는 경우를 위한 처리
      // FormData 형식으로 username과 password 전송
      const formData = new URLSearchParams();
      formData.append('username', credentials.email);  // OAuth2 표준에서는 username 필드 사용
      formData.append('password', credentials.password);
      
      const response = await api.post('/api/user/login', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      
      console.log('✅ 로그인 API 응답:', response.data);
      
      // 로그인 성공 시 토큰 저장
      if (response.data.access_token) {
        localStorage.setItem('access_token', response.data.access_token);
        localStorage.setItem('token_type', response.data.token_type);
        console.log('🔑 JWT 토큰이 로컬 스토리지에 저장되었습니다.');
      }
      
      return response.data;
    } catch (error) {
      console.error('❌ 로그인 실패:', error);
      throw error;
    }
  },

  // 로그아웃
  logout: async () => {
    try {
      console.log('🚪 로그아웃 API 요청');
      const response = await api.post('/api/user/logout');
      console.log('✅ 로그아웃 API 응답:', response.data);
      
      // 로그아웃 성공 시 토큰 제거
      localStorage.removeItem('access_token');
      localStorage.removeItem('token_type');
      console.log('🔑 JWT 토큰이 로컬 스토리지에서 제거되었습니다.');
      
      return response.data;
    } catch (error) {
      console.error('❌ 로그아웃 실패:', error);
      // 에러가 발생해도 로컬 토큰은 제거
      localStorage.removeItem('access_token');
      localStorage.removeItem('token_type');
      throw error;
    }
  },

  // 사용자 정보 조회
  getUserInfo: async () => {
    try {
      console.log('👤 사용자 정보 조회 API 요청');
      const response = await api.get('/api/user/info');
      console.log('✅ 사용자 정보 조회 API 응답:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ 사용자 정보 조회 실패:', error);
      throw error;
    }
  }
};

export default userApi;
