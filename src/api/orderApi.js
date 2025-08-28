import api from '../pages/api';

// 주문 관련 API 함수들
export const orderApi = {
  // ===== 주문 생성 관련 =====
  
  // 장바구니 항목 유효성 검증
  validateCartItems: async (selectedItems) => {
    try {
      console.log('🔍 장바구니 항목 유효성 검증 시작:', selectedItems);
      
      // 장바구니 API를 통해 현재 장바구니 상태 조회
      const cartApi = require('./cartApi').cartApi;
      const currentCart = await cartApi.getCartItems();
      const currentCartItems = currentCart.cart_items || [];
      
      console.log('🔍 현재 장바구니 상태:', currentCartItems);
      
      // 현재 장바구니에 있는 항목들의 ID 집합 (kok_cart_id 기준)
      const currentCartIds = new Set(currentCartItems.map(item => item.kok_cart_id));
      
      console.log('🔍 현재 장바구니 ID들:', Array.from(currentCartIds));
      console.log('🔍 선택된 항목들:', selectedItems);
      
      // 선택된 항목들이 현재 장바구니에 존재하는지 확인
      const validItems = [];
      const invalidItems = [];
      
      for (const selectedItem of selectedItems) {
        console.log('🔍 검증 중인 항목:', selectedItem);
        
        // cart_id가 kok_cart_id와 일치하는지 확인
        if (currentCartIds.has(selectedItem.cart_id)) {
          // 현재 장바구니에서 해당 항목 찾기
          const currentItem = currentCartItems.find(item => item.kok_cart_id === selectedItem.cart_id);
          console.log('🔍 찾은 현재 항목:', currentItem);
          
          if (currentItem && currentItem.kok_quantity >= selectedItem.quantity) {
            validItems.push(selectedItem);
            console.log('✅ 유효한 항목 추가:', selectedItem);
          } else {
            invalidItems.push({
              cart_id: selectedItem.cart_id,
              reason: currentItem ? `수량이 부족합니다. (요청: ${selectedItem.quantity}, 보유: ${currentItem.kok_quantity})` : '항목을 찾을 수 없습니다.'
            });
            console.log('❌ 수량 부족 또는 항목 없음:', selectedItem);
          }
        } else {
          invalidItems.push({
            cart_id: selectedItem.cart_id,
            reason: '장바구니에서 삭제되었습니다.'
          });
          console.log('❌ 장바구니에서 삭제됨:', selectedItem);
        }
      }
      
      console.log('✅ 장바구니 유효성 검증 결과:', {
        validItems,
        invalidItems,
        totalSelected: selectedItems.length,
        validCount: validItems.length,
        invalidCount: invalidItems.length
      });
      
      return {
        isValid: invalidItems.length === 0,
        validItems,
        invalidItems,
        message: invalidItems.length > 0 
          ? `선택한 항목 중 ${invalidItems.length}개가 유효하지 않습니다. 장바구니를 다시 확인해주세요.`
          : '모든 선택한 항목이 유효합니다.'
      };
    } catch (error) {
      console.error('❌ 장바구니 유효성 검증 실패:', error);
      
      // 백엔드 서버 연결 실패 시 개발 환경에서 임시 처리
      if (error.response?.status === 500 || error.code === 'ERR_NETWORK' || error.response?.status === 404) {
        console.warn('🔄 백엔드 서버 연결 실패, 개발 환경에서 임시 유효성 검증 처리');
        
        if (process.env.NODE_ENV === 'development') {
          // 개발 환경에서는 모든 항목을 유효하다고 처리
          return {
            isValid: true,
            validItems: selectedItems,
            invalidItems: [],
            message: '개발 환경: 모든 항목이 유효합니다. (백엔드 서버 미실행)',
            isMock: true
          };
        }
      }
      
      throw new Error('장바구니 상태를 확인할 수 없습니다.');
    }
  },

  // KOK 주문 생성
  createKokOrder: async (selectedItems) => {
    try {
      console.log('🚀 KOK 주문 생성 API 요청:', selectedItems);
      
      // 주문 전 장바구니 항목 유효성 검증
      const validationResult = await orderApi.validateCartItems(selectedItems);
      
      if (!validationResult.isValid) {
        console.log('⚠️ 장바구니 항목 유효성 검증 실패, 자동 장바구니 추가 시도:', validationResult);
        
        // 장바구니에 없는 상품들을 자동으로 추가
        const cartApi = require('./cartApi').cartApi;
        const addedItems = [];
        
        for (const invalidItem of validationResult.invalidItems) {
          try {
            // 장바구니에 상품 추가 (사용자에게는 보이지 않음)
            const addResult = await cartApi.addToCart({
              kok_product_id: invalidItem.cart_id,
              kok_quantity: invalidItem.quantity || 1,
              recipe_id: 0
            });
            
            console.log('✅ 자동 장바구니 추가 성공:', addResult);
            addedItems.push(invalidItem);
          } catch (addError) {
            console.error('❌ 자동 장바구니 추가 실패:', addError);
          }
        }
        
        // 자동 추가 후 다시 유효성 검증
        if (addedItems.length > 0) {
          console.log('🔄 자동 추가 후 재검증 시도');
          const revalidationResult = await orderApi.validateCartItems(selectedItems);
          
          if (revalidationResult.isValid) {
            console.log('✅ 자동 추가 후 유효성 검증 성공');
            // 자동 장바구니 추가가 발생했으므로 장바구니 페이지로 리다이렉트 필요
            throw new Error('CART_REDIRECT_NEEDED');
          } else {
            console.error('❌ 자동 추가 후에도 유효성 검증 실패:', revalidationResult);
            throw new Error('장바구니 상태를 복구할 수 없습니다. 장바구니를 다시 확인해주세요.');
          }
        } else {
          throw new Error(validationResult.message);
        }
      }
      
      // 유효한 항목들만 사용하여 주문 생성
      const validItems = validationResult.validItems;
      
      if (validItems.length === 0) {
        throw new Error('주문할 수 있는 유효한 항목이 없습니다.');
      }
      
      console.log('✅ 유효한 장바구니 항목들:', validItems);
      
      // 토큰 확인
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('로그인이 필요한 서비스입니다.');
      }
      
      // 토큰 만료 확인
      try {
        const tokenParts = token.split('.');
        if (tokenParts.length === 3) {
          const payload = JSON.parse(atob(tokenParts[1]));
          const currentTime = Math.floor(Date.now() / 1000);
          
          if (payload.exp && payload.exp < currentTime) {
            console.warn('⚠️ 토큰이 만료되었습니다. 토큰 갱신 필요');
            // 토큰 갱신 로직이 있다면 여기서 호출
          }
        }
      } catch (tokenError) {
        console.warn('⚠️ 토큰 파싱 실패:', tokenError);
      }
      
      const requestData = {
        selected_items: validItems
      };
      
      console.log('🔍 API 요청 데이터:', requestData);
      
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
      
      // 백엔드 서버가 실행되지 않은 경우 모의 응답 제공 (개발 환경)
      if (error.response?.status === 500 || error.code === 'ERR_NETWORK' || error.response?.status === 404) {
        console.warn('🔄 백엔드 서버 연결 실패, 개발 환경에서 모의 응답 제공');
        
        // 개발 환경에서만 모의 응답 제공
        if (process.env.NODE_ENV === 'development') {
          const mockOrderId = Date.now(); // 현재 시간을 기반으로 한 고유 ID
          const mockResponse = {
            order_id: mockOrderId,
            total_amount: selectedItems.reduce((sum, item) => sum + (item.quantity * 10000), 0),
            order_count: selectedItems.length,
            order_details: selectedItems.map((item, index) => ({
              kok_order_id: mockOrderId + index + 1,
              kok_product_id: item.cart_id,
              kok_product_name: '모의 상품 (백엔드 서버 미실행)',
              quantity: item.quantity,
              unit_price: 10000,
              total_price: item.quantity * 10000
            })),
            message: '주문이 성공적으로 생성되었습니다. (모의 응답)',
            order_time: new Date().toISOString(),
            is_mock: true // 모의 응답임을 표시
          };
          
          console.log('✅ 개발 환경 모의 응답 생성:', mockResponse);
          return mockResponse;
        }
        
        // 프로덕션 환경에서는 에러 발생
        console.error('❌ 백엔드 서버 연결 실패:', {
          status: error.response?.status,
          code: error.code,
          message: error.message
        });
        throw new Error('백엔드 서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.');
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
  
  // 결제요청 (폴링) - 주문 결제 확인 v1 (API 명세서에 맞게 수정)
  confirmPayment: async (orderId, method = null) => {
    try {
      console.log('🚀 결제요청 (폴링) v1 API 요청:', { orderId, method });
      
      // orderId 유효성 검증
      if (!orderId || orderId === 'undefined' || orderId === 'null') {
        throw new Error('유효하지 않은 주문 ID입니다.');
      }
      
      // method가 제공된 경우에만 request body에 포함
      const requestData = method ? { method } : {};
      
      console.log('🔍 결제 확인 요청 상세:', {
        url: `/api/orders/payment/${orderId}/confirm/v1`,
        method: 'POST',
        data: requestData,
        orderId: orderId,
        orderIdType: typeof orderId
      });
      
      // API 명세서에 맞는 엔드포인트 사용
      const response = await api.post(`/api/orders/payment/${orderId}/confirm/v1`, requestData);
      console.log('✅ 결제요청 (폴링) v1 API 응답:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ 결제요청 (폴링) 실패:', error);
      
      // 백엔드 서버가 실행되지 않은 경우 모의 응답 제공 (개발 환경)
      if (error.response?.status === 500 || error.code === 'ERR_NETWORK' || error.response?.status === 404) {
        console.warn('🔄 백엔드 서버 연결 실패, 개발 환경에서 모의 결제 응답 제공');
        
        // 개발 환경에서만 모의 응답 제공
        if (process.env.NODE_ENV === 'development') {
          return {
            payment_id: `pay_mock_${Date.now()}`,
            order_id: parseInt(orderId),
            kok_order_ids: [119],
            hs_order_id: null,
            status: "PAYMENT_COMPLETED",
            payment_amount: 6900,
            method: method || "CARD",
            confirmed_at: new Date().toISOString(),
            order_id_internal: parseInt(orderId),
            is_mock: true
          };
        }
      }
      
      // 403 에러 상세 분석
      if (error.response?.status === 403) {
        console.error('❌ 403 권한 오류 상세:', {
          errorDetail: error.response.data?.detail,
          orderId: orderId,
          requestUrl: error.config?.url,
          requestMethod: error.config?.method,
          requestData: error.config?.data,
          responseData: error.response?.data
        });
      }
      
      throw error;
    }
  }
};

export default orderApi;
