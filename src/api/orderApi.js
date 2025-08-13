// 주문 관련 API 엔드포인트 관리
import api from '../pages/api';

export const orderApi = {
  // ===== 주문 조회 =====
  
  // 사용자의 모든 주문 목록 조회
  getOrders: async (limit = 10) => {
    try {
      console.log('📋 주문 목록 API 요청:', { limit });
      const response = await api.get('/api/orders', {
        params: { limit }
      });
      console.log('✅ 주문 목록 API 응답:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ 주문 목록 조회 실패:', error);
      throw error;
    }
  },

  // 주문내역 전체 개수 조회
  getOrderCount: async () => {
    try {
      console.log('📊 주문 개수 API 요청');
      const response = await api.get('/api/orders/count');
      console.log('✅ 주문 개수 API 응답:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ 주문 개수 조회 실패:', error);
      throw error;
    }
  },

  // 최근 7일 주문내역 조회
  getRecentOrders: async (days = 7) => {
    try {
      console.log('📅 최근 주문 내역 API 요청:', { days });
      const response = await api.get('/api/orders/recent', {
        params: { days }
      });
      console.log('✅ 최근 주문 내역 API 응답:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ 최근 주문 내역 조회 실패:', error);
      throw error;
    }
  },

  // 특정 주문 상세 조회
  getOrderDetail: async (orderId) => {
    try {
      console.log('🔍 주문 상세 API 요청:', { orderId });
      const response = await api.get(`/api/orders/${orderId}`);
      console.log('✅ 주문 상세 API 응답:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ 주문 상세 조회 실패:', error);
      throw error;
    }
  },

  // ===== 콕 주문 상태 관리 =====
  
  // 콕 주문 상태 업데이트 (수동)
  updateKokOrderStatus: async (kokOrderId, newStatusCode, changedBy) => {
    try {
      console.log('🔄 콕 주문 상태 업데이트 API 요청:', { kokOrderId, newStatusCode, changedBy });
      const response = await api.patch(`/api/orders/kok/${kokOrderId}/status`, {
        new_status_code: newStatusCode,
        changed_by: changedBy
      });
      console.log('✅ 콕 주문 상태 업데이트 API 응답:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ 콕 주문 상태 업데이트 실패:', error);
      throw error;
    }
  },

  // 콕 주문 상태 조회
  getKokOrderStatus: async (kokOrderId) => {
    try {
      console.log('📊 콕 주문 상태 조회 API 요청:', { kokOrderId });
      const response = await api.get(`/api/orders/kok/${kokOrderId}/status`);
      console.log('✅ 콕 주문 상태 조회 API 응답:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ 콕 주문 상태 조회 실패:', error);
      throw error;
    }
  },

  // 콕 주문과 상태 함께 조회
  getKokOrderWithStatus: async (kokOrderId) => {
    try {
      console.log('📋 콕 주문 + 상태 조회 API 요청:', { kokOrderId });
      const response = await api.get(`/api/orders/kok/${kokOrderId}/with-status`);
      console.log('✅ 콕 주문 + 상태 조회 API 응답:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ 콕 주문 + 상태 조회 실패:', error);
      throw error;
    }
  },

  // ===== 결제 확인 =====
  
  // 콕 결제 확인 (단건)
  confirmKokPayment: async (kokOrderId) => {
    try {
      console.log('💳 콕 단건 결제 확인 API 요청:', { kokOrderId });
      const response = await api.post(`/api/orders/kok/${kokOrderId}/payment/confirm`);
      console.log('✅ 콕 단건 결제 확인 API 응답:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ 콕 단건 결제 확인 실패:', error);
      throw error;
    }
  },

  // 결제확인 (주문 단위)
  confirmOrderUnitPayment: async (orderId) => {
    try {
      console.log('💳 주문 단위 결제 확인 API 요청:', { orderId });
      const response = await api.post(`/api/orders/kok/order-unit/${orderId}/payment/confirm`);
      console.log('✅ 주문 단위 결제 확인 API 응답:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ 주문 단위 결제 확인 실패:', error);
      throw error;
    }
  },

  // ===== 자동 상태 업데이트 =====
  
  // 자동 상태 업데이트 시작 (테스트용)
  startAutoStatusUpdate: async (kokOrderId) => {
    try {
      console.log('🚀 자동 상태 업데이트 시작 API 요청:', { kokOrderId });
      const response = await api.post(`/api/orders/kok/${kokOrderId}/auto-update`);
      console.log('✅ 자동 상태 업데이트 시작 API 응답:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ 자동 상태 업데이트 시작 실패:', error);
      throw error;
    }
  },

  // ===== 알림 관련 =====
  
  // 콕 상품 주문 알림 조회
  getKokOrderNotifications: async (limit = 20, offset = 0) => {
    try {
      console.log('🔔 콕 주문 알림 API 요청:', { limit, offset });
      const response = await api.get('/api/orders/kok/notifications/history', {
        params: { limit, offset }
      });
      console.log('✅ 콕 주문 알림 API 응답:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ 콕 주문 알림 조회 실패:', error);
      throw error;
    }
  }
};

export default orderApi;
