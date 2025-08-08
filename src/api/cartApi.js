import api from '../pages/api';

const BASE_URL = process.env.FASTAPI_BASE_URL || 'http://localhost:9000';

// 장바구니 API 함수들
export const cartApi = {
  // 장바구니에 상품 추가
  addToCart: async (productData) => {
    try {
      const response = await api.post('/api/kok/carts', productData);
      return response.data;
    } catch (error) {
      console.error('장바구니 추가 실패:', error);
      throw error;
    }
  },

  // 장바구니 상품 조회
  getCartItems: async () => {
    try {
      const response = await api.get('/api/kok/carts');
      return response.data;
    } catch (error) {
      console.error('장바구니 목록 조회 실패:', error);
      throw error;
    }
  },

  // 장바구니 상품 수량 변경
  updateCartItemQuantity: async (cartItemId, quantity) => {
    try {
      const response = await api.patch(`/api/kok/carts/${cartItemId}`, {
        quantity: quantity
      });
      return response.data;
    } catch (error) {
      console.error('장바구니 수량 변경 실패:', error);
      throw error;
    }
  },

  // 장바구니 상품 삭제
  removeFromCart: async (cartItemId) => {
    try {
      const response = await api.delete(`/api/kok/carts/${cartItemId}`);
      return response.data;
    } catch (error) {
      console.error('장바구니 상품 삭제 실패:', error);
      throw error;
    }
  }
};

export default cartApi;
