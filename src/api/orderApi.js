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

  // 주문 목록 조회
  getOrders: async () => {
    try {
      console.log('🚀 주문 목록 조회 API 요청');
      const response = await api.get('/api/orders');
      console.log('✅ 주문 목록 조회 API 응답:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ 주문 목록 조회 실패:', error);
      throw error;
    }
  },

  // 주문 상세 조회
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
  }
};

export default orderApi;
