import api from '../pages/api';

// 주문 관련 API 함수들
export const orderApi = {
  // ===== 주문 관련 =====
  
  // 선택된 상품들로 주문 생성
  createKokOrder: async (selectedItems) => {
    try {
      console.log('🚀 주문 생성 API 요청:', { selectedItems });
      
      const requestData = {
        selected_items: selectedItems
      };
      
      const response = await api.post('/api/orders/kok/carts/order', requestData);
      console.log('✅ 주문 생성 API 응답:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ 주문 생성 실패:', error);
      throw error;
    }
  },

  // ===== 주문 내역 관련 =====
  
  // 사용자의 모든 주문 목록 조회
  getUserOrders: async (limit = 10) => {
    try {
      console.log('🚀 사용자 주문 목록 조회 API 요청:', { limit });
      const response = await api.get('/api/orders', {
        params: { limit }
      });
      console.log('✅ 사용자 주문 목록 조회 API 응답:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ 사용자 주문 목록 조회 실패:', error);
      throw error;
    }
  },

  // 주문내역 전체 개수 조회
  getOrderCount: async () => {
    try {
      console.log('🚀 주문 개수 조회 API 요청');
      const response = await api.get('/api/orders/count');
      console.log('✅ 주문 개수 조회 API 응답:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ 주문 개수 조회 실패:', error);
      throw error;
    }
  },

  // 최근 7일 주문내역 조회
  getRecentOrders: async (days = 7) => {
    try {
      console.log('🚀 최근 주문내역 조회 API 요청:', { days });
      const response = await api.get('/api/orders/recent', {
        params: { days }
      });
      console.log('✅ 최근 주문내역 조회 API 응답:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ 최근 주문내역 조회 실패:', error);
      throw error;
    }
  },

  // 특정 주문 상세 조회
  getOrderDetail: async (orderId) => {
    try {
      console.log('🚀 주문 상세 조회 API 요청:', { orderId });
      const response = await api.get(`/api/orders/${orderId}`);
      console.log('✅ 주문 상세 조회 API 응답:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ 주문 상세 조회 실패:', error);
      throw error;
    }
  },

  // ===== 콕 주문 상태 관련 (기존 명세서 유지) =====
  
  // 콕 주문 상태 업데이트 (수동)
  updateKokOrderStatus: async (kokOrderId, newStatusCode, changedBy) => {
    try {
      console.log('🚀 콕 주문 상태 업데이트 API 요청:', { kokOrderId, newStatusCode, changedBy });
      
      const requestData = {
        new_status_code: newStatusCode,
        changed_by: changedBy
      };
      
      const response = await api.patch(`/api/orders/kok/${kokOrderId}/status`, requestData);
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
      console.log('🚀 콕 주문 상태 조회 API 요청:', { kokOrderId });
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
      console.log('🚀 콕 주문과 상태 함께 조회 API 요청:', { kokOrderId });
      const response = await api.get(`/api/orders/kok/${kokOrderId}/with-status`);
      console.log('✅ 콕 주문과 상태 함께 조회 API 응답:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ 콕 주문과 상태 함께 조회 실패:', error);
      throw error;
    }
  },

  // ===== 결제 관련 =====
  
  // 결제요청 (폴링) - 주문 결제 확인 v1
  confirmPayment: async (orderId, method = null) => {
    try {
      console.log('🚀 결제요청 (폴링) API 요청:', { orderId, method });
      
      // method가 제공된 경우에만 request body에 포함
      const requestData = method ? { method } : {};
      
      const response = await api.post(`/api/orders/payment/${orderId}/confirm/v1`, requestData);
      console.log('✅ 결제요청 (폴링) API 응답:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ 결제요청 (폴링) 실패:', error);
      throw error;
    }
  }
};

export default orderApi;
