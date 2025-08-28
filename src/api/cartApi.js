import api from '../pages/api';

// 장바구니 API 함수들
export const cartApi = {
  // ===== 장바구니 관련 =====
  
  // 장바구니에 상품 추가
  addToCart: async (productData) => {
    try {
      console.log('🛒 장바구니 추가 API 요청:', productData);
      
      // API 명세서에 맞는 요청 데이터 형식 확인
      const requestData = {
        kok_product_id: parseInt(productData.kok_product_id),
        kok_quantity: parseInt(productData.kok_quantity) || 1,
        recipe_id: parseInt(productData.recipe_id) || 0
      };
      
      console.log('🔍 요청 데이터 형식 확인:', requestData);
      
      const response = await api.post('/api/kok/carts', requestData);
      
      // 201 상태 코드 확인 (API 명세서 기준)
      if (response.status === 201) {
        console.log('✅ 장바구니 추가 API 응답 (201):', response.data);
        return response.data;
      } else {
        console.log('⚠️ 장바구니 추가 API 응답 (예상과 다른 상태 코드):', response.status, response.data);
        return response.data;
      }
    } catch (error) {
      console.error('❌ 장바구니 추가 실패:', error);
      
      // 백엔드 서버가 실행되지 않은 경우 임시 모의 응답
      if (error.response?.status === 500 || error.code === 'ERR_NETWORK' || error.response?.status === 404) {
        console.log('🔄 백엔드 서버 연결 실패, 임시 모의 응답 반환');
        
        // 개발 환경에서만 모의 응답 제공
        if (process.env.NODE_ENV === 'development') {
          return {
            kok_cart_id: Math.floor(Math.random() * 1000) + 1,
            message: '임시 모의 응답: 장바구니에 추가되었습니다. (백엔드 서버 미실행)'
          };
        }
        
        // 프로덕션 환경에서는 에러 발생
        throw new Error('백엔드 서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.');
      }
      
      // API 명세서에 따른 에러 처리 (500 에러는 이미 위에서 처리됨)
      if (error.response?.status === 400) {
        console.log('400 에러 - 이미 장바구니에 있는 상품일 수 있습니다.');
      } else if (error.response?.status === 401) {
        console.log('401 에러 - 인증이 필요합니다.');
      }
      
      // 500 에러가 아닌 다른 에러만 throw
      throw error;
    }
  },

  // 장바구니 상품 조회
  getCartItems: async (limit = 50) => {
    try {
      console.log('🛒 장바구니 조회 API 요청:', { limit });
      const response = await api.get(`/api/kok/carts?limit=${limit}`);
      
      // 200 상태 코드 확인 (API 명세서 기준)
      if (response.status === 200) {
        console.log('✅ 장바구니 조회 API 응답 (200):', response.data);
        return response.data;
      } else {
        console.log('⚠️ 장바구니 조회 API 응답 (예상과 다른 상태 코드):', response.status, response.data);
        return response.data;
      }
    } catch (error) {
      console.error('❌ 장바구니 조회 실패:', error);
      
      // 백엔드 서버가 실행되지 않은 경우 임시 모의 응답
      if (error.response?.status === 500 || error.code === 'ERR_NETWORK' || error.response?.status === 404) {
        console.log('🔄 백엔드 서버 연결 실패, 임시 모의 응답 반환');
        
        // 개발 환경에서만 모의 응답 제공
        if (process.env.NODE_ENV === 'development') {
          return {
            cart_items: [
              {
                kok_cart_id: 1,
                kok_product_id: 1,
                kok_price_id: 1,
                recipe_id: 0,
                kok_product_name: '임시 상품 (백엔드 서버 미실행)',
                kok_thumbnail: 'https://via.placeholder.com/150x150/CCCCCC/666666?text=Temp',
                kok_product_price: 10000,
                kok_discount_rate: 10,
                kok_discounted_price: 9000,
                kok_store_name: '임시 스토어',
                kok_quantity: 1
              }
            ]
          };
        }
        
        // 프로덕션 환경에서는 에러 발생
        throw new Error('백엔드 서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.');
      }
      
      // 500 에러가 아닌 다른 에러만 throw
      throw error;
    }
  },

  // 장바구니 상품 수량 변경
  updateCartItemQuantity: async (cartItemId, quantity) => {
    // 수량 범위 검증 (1-10) - 함수 시작 부분에서 정의
    const validQuantity = Math.max(1, Math.min(10, parseInt(quantity)));
    
    try {
      console.log('🛒 장바구니 수량 변경 API 요청:', { cartItemId, quantity });
      
      const requestData = {
        kok_quantity: validQuantity
      };
      
      console.log('🔍 수량 변경 요청 데이터:', requestData);
      
      const response = await api.patch(`/api/kok/carts/${cartItemId}`, requestData);
      
      // 200 상태 코드 확인 (API 명세서 기준)
      if (response.status === 200) {
        console.log('✅ 장바구니 수량 변경 API 응답 (200):', response.data);
        return response.data;
      } else {
        console.log('⚠️ 장바구니 수량 변경 API 응답 (예상과 다른 상태 코드):', response.status, response.data);
        return response.data;
      }
    } catch (error) {
      console.error('❌ 장바구니 수량 변경 실패:', error);
      
      // 백엔드 서버가 실행되지 않은 경우 임시 모의 응답
      if (error.response?.status === 500 || error.code === 'ERR_NETWORK') {
        console.log('🔄 백엔드 서버 연결 실패, 임시 모의 응답 반환');
        return {
          kok_cart_id: cartItemId,
          kok_quantity: validQuantity,
          message: '임시 모의 응답: 수량이 변경되었습니다. (백엔드 서버 미실행)'
        };
      }
      
      // 500 에러가 아닌 다른 에러만 throw
      throw error;
    }
  },

  // 장바구니 상품 삭제
  removeFromCart: async (cartItemId) => {
    try {
      console.log('🛒 장바구니 상품 삭제 API 요청:', { cartItemId });
      const response = await api.delete(`/api/kok/carts/${cartItemId}`);
      
      // 200 상태 코드 확인 (API 명세서 기준)
      if (response.status === 200) {
        console.log('✅ 장바구니 상품 삭제 API 응답 (200):', response.data);
        return response.data;
      } else {
        console.log('⚠️ 장바구니 상품 삭제 API 응답 (예상과 다른 상태 코드):', response.status, response.data);
        return response.data;
      }
    } catch (error) {
      console.error('❌ 장바구니 상품 삭제 실패:', error);
      
      // 백엔드 서버가 실행되지 않은 경우 임시 모의 응답
      if (error.response?.status === 500 || error.code === 'ERR_NETWORK') {
        console.log('🔄 백엔드 서버 연결 실패, 임시 모의 응답 반환');
        return {
          message: '임시 모의 응답: 상품이 삭제되었습니다. (백엔드 서버 미실행)'
        };
      }
      
      // 500 에러가 아닌 다른 에러만 throw
      throw error;
    }
  },

  // ===== 주문 관련 =====
  
  // 선택된 상품들로 주문 생성
  createOrder: async (selectedItems) => {
    try {
      console.log('🛒 주문 생성 API 요청:', { selectedItems });
      
      // API 명세서에 맞는 요청 데이터 형식으로 변환
      const requestData = {
        selected_items: selectedItems.map(item => ({
          cart_id: item.cart_id, // 실제 cart_id 사용
          quantity: item.quantity
        }))
      };
      
      console.log('🔍 변환된 요청 데이터:', requestData);
      
      const response = await api.post('/api/orders/kok/carts/order', requestData);
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
      
      // API 명세서에 따라 GET 요청으로 변경
      // GET 요청에 Request Body를 포함하기 위해 params로 전달
      const response = await api.get('/api/kok/carts/recipe-recommend', {
        params: {
          selected_cart_ids: selectedCartIds,
          page,
          size
        }
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
  },

  // ===== API 연결 테스트 =====
  
  // 장바구니 API 연결 상태 테스트
  testApiConnection: async () => {
    try {
      console.log('🧪 장바구니 API 연결 테스트 시작');
      
      const testResults = {
        timestamp: new Date().toISOString(),
        tests: {}
      };
      
      // 1. 장바구니 조회 테스트
      try {
        console.log('🧪 테스트 1: 장바구니 조회');
        const cartResponse = await api.get('/api/kok/carts?limit=1');
        testResults.tests.cartRead = {
          success: true,
          status: cartResponse.status,
          data: cartResponse.data
        };
        console.log('✅ 장바구니 조회 테스트 성공');
      } catch (error) {
        testResults.tests.cartRead = {
          success: false,
          error: {
            status: error.response?.status,
            message: error.message,
            data: error.response?.data
          }
        };
        console.log('❌ 장바구니 조회 테스트 실패:', error.response?.status);
      }
      
      // 2. 인증 상태 확인
      const token = localStorage.getItem('access_token');
      testResults.auth = {
        hasToken: !!token,
        tokenLength: token ? token.length : 0
      };
      
      console.log('🧪 API 연결 테스트 완료:', testResults);
      return testResults;
      
    } catch (error) {
      console.error('❌ API 연결 테스트 실패:', error);
      throw error;
    }
  }
};

export default cartApi;
