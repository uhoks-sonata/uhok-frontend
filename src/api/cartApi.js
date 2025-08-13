import api from '../pages/api';

// 장바구니 API 함수들
export const cartApi = {
  // ===== 장바구니 관련 =====
  
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

  // ===== 주문 관련 =====
  
  // 선택된 상품들로 주문 생성
  createOrder: async (selectedItems) => {
    try {
      console.log('🛒 주문 생성 API 요청:', { selectedItems });
      const response = await api.post('/api/kok/carts/order', { 
        selected_items: selectedItems 
      });
      console.log('✅ 주문 생성 API 응답:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ 주문 생성 실패:', error);
      throw error;
    }
  },

  // ===== 레시피 추천 =====
  
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
  },

  // ===== 장바구니 일괄 처리 =====
  
  // 선택된 상품들 일괄 삭제
  removeSelectedItems: async (cartItemIds) => {
    try {
      console.log('🛒 선택된 상품들 일괄 삭제 API 요청:', { cartItemIds });
      
      // 병렬로 모든 상품 삭제 (Promise.all 사용)
      const deletePromises = cartItemIds.map(id => 
        api.delete(`/api/kok/carts/${id}`)
      );
      
      const responses = await Promise.all(deletePromises);
      console.log('✅ 선택된 상품들 일괄 삭제 API 응답:', responses.map(r => r.data));
      
      return {
        success: true,
        message: `${cartItemIds.length}개 상품이 삭제되었습니다.`,
        deletedCount: cartItemIds.length
      };
    } catch (error) {
      console.error('❌ 선택된 상품들 일괄 삭제 실패:', error);
      throw error;
    }
  },

  // 선택된 상품들 수량 일괄 변경
  updateSelectedItemsQuantity: async (cartItemUpdates) => {
    try {
      console.log('🛒 선택된 상품들 수량 일괄 변경 API 요청:', { cartItemUpdates });
      
      // 병렬로 모든 상품 수량 변경 (Promise.all 사용)
      const updatePromises = cartItemUpdates.map(({ cartId, quantity }) =>
        api.patch(`/api/kok/carts/${cartId}`, { kok_quantity: quantity })
      );
      
      const responses = await Promise.all(updatePromises);
      console.log('✅ 선택된 상품들 수량 일괄 변경 API 응답:', responses.map(r => r.data));
      
      return {
        success: true,
        message: `${cartItemUpdates.length}개 상품의 수량이 변경되었습니다.`,
        updatedCount: cartItemUpdates.length
      };
    } catch (error) {
      console.error('❌ 선택된 상품들 수량 일괄 변경 실패:', error);
      throw error;
    }
  },

  // ===== 장바구니 통계 =====
  
  // 장바구니 통계 정보 조회
  getCartStats: async () => {
    try {
      console.log('🛒 장바구니 통계 API 요청');
      
      // 장바구니 상품 조회
      const cartResponse = await api.get('/api/kok/carts?limit=1000');
      const cartItems = cartResponse.data?.cart_items || [];
      
      // 통계 계산
      const stats = {
        totalItems: cartItems.length,
        totalQuantity: cartItems.reduce((sum, item) => sum + item.kok_quantity, 0),
        totalPrice: cartItems.reduce((sum, item) => sum + (item.kok_discounted_price * item.kok_quantity), 0),
        totalOriginalPrice: cartItems.reduce((sum, item) => sum + (item.kok_product_price * item.kok_quantity), 0),
        totalDiscount: cartItems.reduce((sum, item) => sum + ((item.kok_product_price - item.kok_discounted_price) * item.kok_quantity), 0),
        storeCount: new Set(cartItems.map(item => item.kok_store_name)).size
      };
      
      console.log('✅ 장바구니 통계 계산 완료:', stats);
      return stats;
    } catch (error) {
      console.error('❌ 장바구니 통계 조회 실패:', error);
      throw error;
    }
  }
};

export default cartApi;
