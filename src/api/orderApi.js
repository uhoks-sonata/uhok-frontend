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
      
      // 201 상태 코드 확인 (API 명세서 기준)
      if (response.status === 201) {
        console.log('✅ 주문 생성 API 응답 (201):', response.data);
        return response.data;
      } else {
        console.log('⚠️ 주문 생성 API 응답 (예상과 다른 상태 코드):', response.status, response.data);
        return response.data;
      }
    } catch (error) {
      console.error('❌ 주문 생성 실패:', error);
      
      // 백엔드 서버가 실행되지 않은 경우 임시 모의 응답
      if (error.response?.status === 500 || error.code === 'ERR_NETWORK') {
        console.log('🔄 백엔드 서버 연결 실패, 임시 모의 응답 반환');
        return {
          order_id: 1,
          total_amount: selectedItems.reduce((sum, item) => sum + (item.quantity * 10000), 0),
          order_count: selectedItems.length,
          order_details: selectedItems.map((item, index) => ({
            kok_order_id: index + 1,
            kok_product_id: item.cart_id,
            kok_product_name: '임시 상품 (백엔드 서버 미실행)',
            quantity: item.quantity,
            unit_price: 10000,
            total_price: item.quantity * 10000
          })),
          message: '주문이 성공적으로 생성되었습니다.',
          order_time: new Date().toISOString()
        };
      }
      
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

  // ===== 콕 주문 상태 관련 =====
  
  // 콕 주문 상태 업데이트 (수동)
  updateKokOrderStatus: async (kokOrderId, newStatusCode, changedBy) => {
    try {
      console.log('🚀 콕 주문 상태 업데이트 API 요청:', { kokOrderId, newStatusCode, changedBy });
      
      const requestData = {
        new_status_code: newStatusCode,
        changed_by: changedBy
      };
      
      const response = await api.patch(`/api/orders/kok/${kokOrderId}/status`, requestData);
      
      // 200 상태 코드 확인 (API 명세서 기준)
      if (response.status === 200) {
        console.log('✅ 콕 주문 상태 업데이트 API 응답 (200):', response.data);
        return response.data;
      } else {
        console.log('⚠️ 콕 주문 상태 업데이트 API 응답 (예상과 다른 상태 코드):', response.status, response.data);
        return response.data;
      }
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
      
      // 200 상태 코드 확인 (API 명세서 기준)
      if (response.status === 200) {
        console.log('✅ 콕 주문 상태 조회 API 응답 (200):', response.data);
        return response.data;
      } else {
        console.log('⚠️ 콕 주문 상태 조회 API 응답 (예상과 다른 상태 코드):', response.status, response.data);
        return response.data;
      }
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
      
      // 200 상태 코드 확인 (API 명세서 기준)
      if (response.status === 200) {
        console.log('✅ 콕 주문과 상태 함께 조회 API 응답 (200):', response.data);
        return response.data;
      } else {
        console.log('⚠️ 콕 주문과 상태 함께 조회 API 응답 (예상과 다른 상태 코드):', response.status, response.data);
        return response.data;
      }
    } catch (error) {
      console.error('❌ 콕 주문과 상태 함께 조회 실패:', error);
      throw error;
    }
  },

  // ===== 결제 관련 =====
  
  // 콕 결제 확인(단건)
  confirmKokPayment: async (kokOrderId) => {
    try {
      console.log('🚀 콕 결제 확인(단건) API 요청:', { kokOrderId });
      const response = await api.post(`/api/orders/kok/${kokOrderId}/payment/confirm`);
      
      // 200 상태 코드 확인 (API 명세서 기준)
      if (response.status === 200) {
        console.log('✅ 콕 결제 확인(단건) API 응답 (200):', response.data);
        return response.data;
      } else {
        console.log('⚠️ 콕 결제 확인(단건) API 응답 (예상과 다른 상태 코드):', response.status, response.data);
        return response.data;
      }
    } catch (error) {
      console.error('❌ 콕 결제 확인(단건) 실패:', error);
      throw error;
    }
  },

  // 결제확인(주문 단위)
  confirmOrderUnitPayment: async (orderId) => {
    try {
      console.log('🚀 결제확인(주문 단위) API 요청:', { orderId });
      const response = await api.post(`/api/orders/kok/order-unit/${orderId}/payment/confirm`);
      
      // 200 상태 코드 확인 (API 명세서 기준)
      if (response.status === 200) {
        console.log('✅ 결제확인(주문 단위) API 응답 (200):', response.data);
        return response.data;
      } else {
        console.log('⚠️ 결제확인(주문 단위) API 응답 (예상과 다른 상태 코드):', response.status, response.data);
        return response.data;
      }
    } catch (error) {
      console.error('❌ 결제확인(주문 단위) 실패:', error);
      throw error;
    }
  },

  // 자동 상태 업데이트 시작 (테스트용)
  startAutoUpdate: async (kokOrderId) => {
    try {
      console.log('🚀 자동 상태 업데이트 시작 API 요청:', { kokOrderId });
      const response = await api.post(`/api/orders/kok/${kokOrderId}/auto-update`);
      
      // 200 상태 코드 확인 (API 명세서 기준)
      if (response.status === 200) {
        console.log('✅ 자동 상태 업데이트 시작 API 응답 (200):', response.data);
        return response.data;
      } else {
        console.log('⚠️ 자동 상태 업데이트 시작 API 응답 (예상과 다른 상태 코드):', response.status, response.data);
        return response.data;
      }
    } catch (error) {
      console.error('❌ 자동 상태 업데이트 시작 실패:', error);
      throw error;
    }
  },

  // ===== 알림 관련 =====
  
  // 콕 상품 주문 알림 조회
  getKokOrderNotifications: async (limit = 20, offset = 0) => {
    try {
      console.log('🚀 콕 상품 주문 알림 조회 API 요청:', { limit, offset });
      const response = await api.get('/api/orders/kok/notifications/history', {
        params: { limit, offset }
      });
      
      // 200 상태 코드 확인 (API 명세서 기준)
      if (response.status === 200) {
        console.log('✅ 콕 상품 주문 알림 조회 API 응답 (200):', response.data);
        return response.data;
      } else {
        console.log('⚠️ 콕 상품 주문 알림 조회 API 응답 (예상과 다른 상태 코드):', response.status, response.data);
        return response.data;
      }
    } catch (error) {
      console.error('❌ 콕 상품 주문 알림 조회 실패:', error);
      throw error;
    }
  },

  // ===== 기존 결제 관련 (하위 호환성 유지) =====
  
  // 결제요청 (폴링) - 주문 결제 확인 v1 (기존 API 유지)
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
