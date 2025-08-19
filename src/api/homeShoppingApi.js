// 홈쇼핑 관련 API 엔드포인트 관리
import api from '../pages/api';

export const homeShoppingApi = {
  // ===== 편성표 관련 =====
  
  // 편성표 조회
  getSchedule: async (page = 1, size = 20) => {
    try {
      console.log('📺 편성표 조회 API 요청:', { page, size });
      const response = await api.get('/api/homeshopping/schedule', {
        params: { page, size }
      });
      console.log('✅ 편성표 조회 API 응답:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ 편성표 조회 실패:', error);
      throw error;
    }
  },

  // ===== 상품 관련 =====
  
  // 홈쇼핑 상품 상세 조회
  getProductDetail: async (productId) => {
    try {
      console.log('🛍️ 홈쇼핑 상품 상세 API 요청:', { productId });
      const response = await api.get(`/api/homeshopping/product/${productId}`);
      console.log('✅ 홈쇼핑 상품 상세 API 응답:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ 홈쇼핑 상품 상세 조회 실패:', error);
      throw error;
    }
  },

  // 상품 추천
  getProductRecommendations: async (productId) => {
    try {
      console.log('💡 상품 추천 API 요청:', { productId });
      const response = await api.get(`/api/homeshopping/product/${productId}/recommendations`);
      console.log('✅ 상품 추천 API 응답:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ 상품 추천 실패:', error);
      throw error;
    }
  },

  // 홈쇼핑 라이브 영상 URL 조회
  getLiveStreamUrl: async (productId) => {
    try {
      console.log('📹 라이브 스트림 URL API 요청:', { productId });
      const response = await api.get(`/api/homeshopping/product/${productId}/stream`);
      console.log('✅ 라이브 스트림 URL API 응답:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ 라이브 스트림 URL 조회 실패:', error);
      throw error;
    }
  },

  // ===== 검색 관련 =====
  
  // 상품 검색
  searchProducts: async (keyword, page = 1, size = 20) => {
    try {
      console.log('🔍 홈쇼핑 상품 검색 API 요청:', { keyword, page, size });
      const response = await api.get('/api/homeshopping/search', {
        params: { keyword, page, size }
      });
      console.log('✅ 홈쇼핑 상품 검색 API 응답:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ 홈쇼핑 상품 검색 실패:', error);
      throw error;
    }
  },

  // 검색어 저장
  saveSearchHistory: async (keyword) => {
    try {
      console.log('💾 검색어 저장 API 요청:', { keyword });
      const response = await api.post('/api/homeshopping/search/history', { keyword });
      console.log('✅ 검색어 저장 API 응답:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ 검색어 저장 실패:', error);
      throw error;
    }
  },

  // 검색어 조회
  getSearchHistory: async (limit = 50) => {
    try {
      console.log('📋 검색어 조회 API 요청');
      const response = await api.get('/api/homeshopping/search/history');
      console.log('✅ 검색어 조회 API 응답:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ 검색어 조회 실패:', error);
      throw error;
    }
  },

  // 검색어 삭제
  deleteSearchHistory: async (historyId) => {
    try {
      console.log('🗑️ 검색어 삭제 API 요청:', { historyId });
      const response = await api.delete('/api/homeshopping/search/history', {
        data: { homeshopping_history_id: historyId }
      });
      console.log('✅ 검색어 삭제 API 응답:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ 검색어 삭제 실패:', error);
      throw error;
    }
  },

  // ===== 찜 기능 =====
  
  // 상품 찜 등록/해제
  toggleProductLike: async (productId) => {
    try {
      console.log('❤️ 상품 찜 토글 API 요청:', { productId });
      const response = await api.post('/api/homeshopping/likes/toggle', {
        product_id: productId
      });
      console.log('✅ 상품 찜 토글 API 응답:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ 상품 찜 토글 실패:', error);
      throw error;
    }
  },

  // 찜한 상품 목록 조회
  getLikedProducts: async (limit = 50) => {
    try {
      console.log('❤️ 찜한 상품 목록 API 요청:', { limit });
      const response = await api.get('/api/homeshopping/likes', {
        params: { limit }
      });
      console.log('✅ 찜한 상품 목록 API 응답:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ 찜한 상품 목록 조회 실패:', error);
      throw error;
    }
  },

  // ===== 주문 관련 =====
  
  // 홈쇼핑 주문 생성
  createOrder: async (productId, quantity = 1) => {
    try {
      console.log('🛒 홈쇼핑 주문 생성 API 요청:', { productId, quantity });
      const response = await api.post('/api/homeshopping/order', {
        product_id: productId,
        quantity
      });
      console.log('✅ 홈쇼핑 주문 생성 API 응답:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ 홈쇼핑 주문 생성 실패:', error);
      throw error;
    }
  },

  // ===== 알림 관련 =====
  
  // 알림 내역 조회
  getNotifications: async (limit = 100, offset = 0) => {
    try {
      console.log('🔔 알림 내역 API 요청:', { limit, offset });
      const response = await api.get('/api/homeshopping/notifications/history', {
        params: { limit, offset }
      });
      console.log('✅ 알림 내역 API 응답:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ 알림 내역 조회 실패:', error);
      throw error;
    }
  }
};

export default homeShoppingApi;
