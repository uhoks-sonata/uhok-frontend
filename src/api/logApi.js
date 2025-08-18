import api from '../pages/api';

// 로그 API 함수들
export const logApi = {
  // 사용자 로그 적재
  createUserLog: async (logData) => {
    try {
      console.log('📝 사용자 로그 적재 API 요청:', logData);
      const response = await api.post('/log', logData);
      console.log('✅ 사용자 로그 적재 API 응답:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ 사용자 로그 적재 실패:', error);
      throw error;
    }
  },

  // 특정 사용자의 최근 로그 조회
  getUserLogs: async (userId) => {
    try {
      console.log('📋 사용자 로그 조회 API 요청:', { userId });
      const response = await api.get(`/log/user/${userId}`);
      console.log('✅ 사용자 로그 조회 API 응답:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ 사용자 로그 조회 실패:', error);
      throw error;
    }
  }
};

export default logApi;
