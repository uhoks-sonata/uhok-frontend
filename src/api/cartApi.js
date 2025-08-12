import api from '../pages/api';

// 장바구니 API 함수들
export const cartApi = {
  // 장바구니에 상품 추가
  addToCart: async (productData) => {
    try {
      console.log('🛒 장바구니 추가 API 요청:', productData);
      const response = await api.post('/api/kok/carts', productData);
      console.log('✅ 장바구니 추가 API 응답:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ 장바구니 추가 실패:', error);
      throw error;
    }
  },

  // 장바구니 상품 조회
  getCartItems: async (limit = 50) => {
    try {
      console.log('🛒 장바구니 조회 API 요청:', { limit });
      const response = await api.get(`/api/kok/carts?limit=${limit}`);
      console.log('✅ 장바구니 조회 API 응답:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ 장바구니 조회 실패:', error);
      throw error;
    }
  },

  // 장바구니 상품 수량 변경
  updateCartItemQuantity: async (cartItemId, quantity) => {
    try {
      console.log('🛒 장바구니 수량 변경 API 요청:', { cartItemId, quantity });
      const response = await api.patch(`/api/kok/carts/${cartItemId}`, {
        kok_quantity: quantity
      });
      console.log('✅ 장바구니 수량 변경 API 응답:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ 장바구니 수량 변경 실패:', error);
      throw error;
    }
  },

  // 장바구니 상품 삭제
  removeFromCart: async (cartItemId) => {
    try {
      console.log('🛒 장바구니 상품 삭제 API 요청:', { cartItemId });
      const response = await api.delete(`/api/kok/carts/${cartItemId}`);
      console.log('✅ 장바구니 상품 삭제 API 응답:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ 장바구니 상품 삭제 실패:', error);
      throw error;
    }
  },

  // 선택된 상품들로 주문 생성
  createOrder: async (selectedItems) => {
    try {
      console.log('🛒 주문 생성 API 요청:', { selectedItems });
      const response = await api.post('/api/kok/carts/order', { selected_items: selectedItems });
      console.log('✅ 주문 생성 API 응답:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ 주문 생성 실패:', error);
      throw error;
    }
  },

  // 선택된 상품들로 레시피 추천
  getRecipeRecommendations: async (selectedCartIds, page = 1, size = 5) => {
    try {
      console.log('🛒 레시피 추천 API 요청:', { selectedCartIds, page, size });
      const response = await api.post('/api/kok/carts/recipe-recommend', {
        selected_cart_ids: selectedCartIds,
        page,
        size
      });
      console.log('✅ 레시피 추천 API 응답:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ 레시피 추천 실패:', error);
      throw error;
    }
  }
};

export default cartApi;
