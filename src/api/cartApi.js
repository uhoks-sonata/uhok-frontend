import api from '../pages/api';

// 장바구니 API 함수들
export const cartApi = {
  // ===== 장바구니 관련 =====
  
  // 장바구니에 상품 추가
  addToCart: async (productData) => {
    // 입력 데이터 유효성 검증
    if (!productData || !productData.kok_product_id) {
      throw new Error('상품 ID가 필요합니다.');
    }
    
    // kok_product_id가 유효한 숫자인지 확인
    const productId = parseInt(productData.kok_product_id);
    if (isNaN(productId) || productId <= 0) {
      throw new Error(`유효하지 않은 상품 ID: ${productData.kok_product_id}`);
    }
    
    // API 명세서에 맞는 요청 데이터 형식 (수량은 1개로 고정)
    const requestData = {
      kok_product_id: productId,
      kok_quantity: 1, // 수량은 1개로 고정
      recipe_id: parseInt(productData.recipe_id) || 0
    };
    
    try {
      console.log('🛒 장바구니 추가 API 요청:', productData);
      console.log('🔍 요청 데이터 형식 확인:', requestData);
      console.log('🔍 입력 데이터 상세:', {
        productData: productData,
        kok_product_id: productData.kok_product_id,
        kok_product_id_type: typeof productData.kok_product_id,
        kok_product_id_parsed: productId,
        recipe_id: productData.recipe_id,
        recipe_id_parsed: parseInt(productData.recipe_id) || 0
      });
      
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
      
      // 백엔드 서버 연결 실패 시 에러 발생
      if (error.response?.status === 500 || error.code === 'ERR_NETWORK' || error.response?.status === 404) {
        throw new Error('백엔드 서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.');
      }
      
      // 422 에러는 백엔드 서버가 실행 중이지만 데이터 유효성 검증에 실패한 경우
      if (error.response?.status === 422) {
        console.error('❌ 422 에러 - 데이터 유효성 검증 실패');
        throw error; // 422 에러는 그대로 전달
      }
      
      // API 명세서에 따른 에러 처리 (500 에러는 이미 위에서 처리됨)
      if (error.response?.status === 400) {
        console.log('400 에러 - 이미 장바구니에 있는 상품일 수 있습니다.');
      } else if (error.response?.status === 401) {
        console.log('401 에러 - 인증이 필요합니다.');
      } else if (error.response?.status === 422) {
        console.error('❌ 422 유효성 검증 에러:', {
          responseData: error.response.data
        });
        
        // 필드별 에러 상세 분석
        if (error.response.data.detail && Array.isArray(error.response.data.detail)) {
          error.response.data.detail.forEach((err, index) => {
            console.error(`❌ 필드 에러 ${index + 1}:`, {
              type: err.type,
              location: err.loc,
              message: err.msg,
              input: err.input
            });
          });
        }
      }
      
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
      
      // 백엔드 서버 연결 실패 시 에러 발생
      if (error.response?.status === 500 || error.code === 'ERR_NETWORK' || error.response?.status === 404) {
        throw new Error('백엔드 서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.');
      }
      
      throw error;
    }
  },

  // 장바구니 상품 수량 변경
  updateCartItemQuantity: async (cartItemId, quantity) => {
    // 수량 범위 검증 (1-10) - API 명세서에 맞춤
    const validQuantity = Math.max(1, Math.min(10, parseInt(quantity)));
    
    try {
      console.log('🛒 장바구니 수량 변경 API 요청:', { cartItemId, quantity });
      
      // API 명세서에 맞는 요청 데이터 형식
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
      
      // 백엔드 서버 연결 실패 시 에러 발생
      if (error.response?.status === 500 || error.code === 'ERR_NETWORK' || error.response?.status === 404) {
        throw new Error('백엔드 서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.');
      }
      
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
      
      // 백엔드 서버 연결 실패 시 에러 발생
      if (error.response?.status === 500 || error.code === 'ERR_NETWORK' || error.response?.status === 404) {
        throw new Error('백엔드 서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.');
      }
      
      throw error;
    }
  },

  // ===== 주문 관련 =====
  
  // 선택된 상품들로 주문 생성
  createOrder: async (selectedItems) => {
    // 각 아이템의 구조를 자세히 로깅
    selectedItems.forEach((item, index) => {
      console.log(`🔍 아이템 ${index}:`, {
        cart_id: item.cart_id,
        kok_cart_id: item.kok_cart_id,
        quantity: item.quantity,
        kok_quantity: item.kok_quantity,
        전체_아이템: item
      });
    });
    
    // API 명세서에 맞는 요청 데이터 형식으로 변환
    const requestData = {
      selected_items: selectedItems.map(item => {
        const cartId = item.kok_cart_id || item.cart_id;
        const quantity = item.kok_quantity || item.quantity;
        
        console.log('🔄 변환 중:', { 
          원본_cart_id: item.cart_id, 
          원본_kok_cart_id: item.kok_cart_id,
          변환된_kok_cart_id: cartId,
          원본_quantity: item.quantity,
          원본_kok_quantity: item.kok_quantity,
          변환된_quantity: quantity
        });
        
        // 데이터 유효성 검증
        if (!cartId || cartId <= 0) {
          throw new Error(`유효하지 않은 장바구니 ID: ${cartId}`);
        }
        
        if (!quantity || quantity <= 0 || quantity > 10) {
          throw new Error(`유효하지 않은 수량: ${quantity} (1-10 범위여야 함)`);
        }
        
        return {
          kok_cart_id: parseInt(cartId),
          quantity: parseInt(quantity)
        };
      })
    };
    
    try {
      console.log('🛒 주문 생성 API 요청:', { selectedItems });
      console.log('🔍 최종 변환된 요청 데이터:', JSON.stringify(requestData, null, 2));
      
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
      
      // 에러 상세 정보 로깅
      if (error.response?.data) {
        console.error('🔍 에러 상세 정보:', {
          status: error.response.status,
          data: error.response.data,
          validationErrors: error.response.data.validation_errors
        });
        
        // 422 에러 특별 처리
        if (error.response.status === 422) {
          console.error('❌ 422 유효성 검증 에러 상세:', {
            requestData: requestData,
            responseData: error.response.data,
            detail: error.response.data.detail
          });
          
          // 필드별 에러 상세 분석
          if (error.response.data.detail && Array.isArray(error.response.data.detail)) {
            error.response.data.detail.forEach((err, index) => {
              console.error(`❌ 필드 에러 ${index + 1}:`, {
                type: err.type,
                location: err.loc,
                message: err.msg,
                input: err.input
              });
            });
          }
        }
      }
      
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
