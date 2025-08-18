// 콕 쇼핑몰 관련 API 엔드포인트 관리
import api from '../pages/api';
import { orderApi } from './orderApi';

export const kokApi = {
  // ===== 메인화면 상품정보 =====
  
  // 할인 특가 상품 조회 (20개)
  getDiscountedProducts: async (page = 1, size = 20) => {
    try {
      console.log('🚀 할인 특가 상품 API 호출:', { page, size });
      const response = await api.get('/api/kok/discounted', {
        params: { page, size }
      });
      console.log('✅ 할인 특가 상품 API 응답:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ 할인 특가 상품 API 호출 실패:', error);
      throw error;
    }
  },

  // 판매율 높은 상품 조회 (20개)
  getTopSellingProducts: async (page = 1, size = 20, sortBy = 'review_count') => {
    try {
      console.log('🚀 판매율 높은 상품 API 호출:', { page, size, sortBy });
      const response = await api.get('/api/kok/top-selling', {
        params: { page, size, sort_by: sortBy }
      });
      console.log('✅ 판매율 높은 상품 API 응답:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ 판매율 높은 상품 API 호출 실패:', error);
      throw error;
    }
  },

  // 구매한 스토어 내 리뷰 많은 상품 조회 (10개)
  getStoreBestItems: async (sortBy = 'review_count') => {
    try {
      console.log('🚀 스토어 베스트 상품 API 호출:', { sortBy });
      const response = await api.get('/api/kok/store-best-items', {
        params: { sort_by: sortBy }
      });
      console.log('✅ 스토어 베스트 상품 API 응답:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ 스토어 베스트 상품 API 호출 실패:', error);
      throw error;
    }
  },

  // ===== 상품 상세 설명 =====
  
  // 상품 기본 정보 조회
  getProductInfo: async (productId) => {
    try {
      console.log('🚀 상품 기본 정보 API 호출:', { productId });
      const response = await api.get(`/api/kok/product/${productId}/info`);
      console.log('✅ 상품 기본 정보 API 응답:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ 상품 기본 정보 API 호출 실패:', error);
      throw error;
    }
  },

  // 상품 설명 탭 정보 조회
  getProductTabs: async (productId) => {
    try {
      console.log('🚀 상품 설명 탭 API 호출:', { productId });
      const response = await api.get(`/api/kok/product/${productId}/tabs`);
      console.log('✅ 상품 설명 탭 API 응답:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ 상품 설명 탭 API 호출 실패:', error);
      throw error;
    }
  },

  // 상품 리뷰 탭 정보 조회
  getProductReviews: async (productId) => {
    try {
      console.log('🚀 상품 리뷰 탭 API 호출:', { productId });
      const response = await api.get(`/api/kok/product/${productId}/reviews`);
      console.log('✅ 상품 리뷰 탭 API 응답:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ 상품 리뷰 탭 API 호출 실패:', error);
      throw error;
    }
  },

  // 상품 판매자 정보 및 상세정보 조회
  getProductSellerDetails: async (productId) => {
    try {
      console.log('🚀 상품 판매자 정보 API 호출:', { productId });
      const response = await api.get(`/api/kok/product/${productId}/seller-details`);
      console.log('✅ 상품 판매자 정보 API 응답:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ 상품 판매자 정보 API 호출 실패:', error);
      throw error;
    }
  },

  // 상품 전체 상세 정보 조회
  getProductFullDetail: async (productId) => {
    try {
      console.log('🚀 상품 전체 상세 정보 API 호출:', { productId });
      const response = await api.get(`/api/kok/product/${productId}/full-detail`);
      console.log('✅ 상품 전체 상세 정보 API 응답:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ 상품 전체 상세 정보 API 호출 실패:', error);
      throw error;
    }
  },

  // ===== 검색 기능 =====
  
  // 키워드 기반 상품 검색
  searchProducts: async (keyword, page = 1, size = 20, accessToken = null) => {
    try {
      console.log('🚀 상품 검색 API 호출:', { keyword, page, size });
      console.log('🔍 요청 URL:', '/api/kok/search');
      console.log('🔍 요청 파라미터:', { keyword, page, size });
      console.log('🔍 Authorization 토큰:', accessToken ? '있음' : '없음');
      
      const config = {
        params: { keyword, page, size }
      };
      
      // Authorization 헤더가 있으면 추가 (선택사항)
      if (accessToken) {
        config.headers = {
          'Authorization': `Bearer ${accessToken}`
        };
      }
      
      console.log('🔍 최종 요청 설정:', config);
      const response = await api.get('/api/kok/search', config);
      console.log('✅ 상품 검색 API 응답:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ 상품 검색 API 호출 실패:', error);
      console.error('❌ 에러 상세 정보:', {
        message: error.message,
        code: error.code,
        config: error.config,
        response: error.response
      });
      throw error;
    }
  },

  // 검색 이력 조회
  getSearchHistory: async (limit = 10, accessToken = null) => {
    try {
      console.log('🚀 검색 이력 API 호출:', { limit });
      
      const config = {
        params: { limit }
      };
      
      // Authorization 헤더가 있으면 추가
      if (accessToken) {
        config.headers = {
          'Authorization': `Bearer ${accessToken}`
        };
      }
      
      const response = await api.get('/api/kok/search/history', config);
      console.log('✅ 검색 이력 API 응답:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ 검색 이력 API 호출 실패:', error);
      throw error;
    }
  },

  // 검색 이력 추가
  addSearchHistory: async (keyword, accessToken = null) => {
    try {
      console.log('🚀 검색 이력 추가 API 호출:', { keyword });
      
      const config = {
        data: { keyword }
      };
      
      // Authorization 헤더가 있으면 추가
      if (accessToken) {
        config.headers = {
          'Authorization': `Bearer ${accessToken}`
        };
      }
      
      const response = await api.post('/api/kok/search/history', config.data, {
        headers: config.headers
      });
      console.log('✅ 검색 이력 추가 API 응답:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ 검색 이력 추가 API 호출 실패:', error);
      throw error;
    }
  },

  // 검색 이력 삭제
  deleteSearchHistory: async (historyId, accessToken = null) => {
    try {
      console.log('🚀 검색 이력 삭제 API 호출:', { historyId });
      
      const config = {};
      
      // Authorization 헤더가 있으면 추가
      if (accessToken) {
        config.headers = {
          'Authorization': `Bearer ${accessToken}`
        };
      }
      
      const response = await api.delete(`/api/kok/search/history/${historyId}`, config);
      console.log('✅ 검색 이력 삭제 API 응답:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ 검색 이력 삭제 API 호출 실패:', error);
      throw error;
    }
  },

  // ===== 상품 찜 기능 =====
  
  // 상품 찜 등록/해제
  toggleProductLike: async (productId) => {
    try {
      console.log('🚀 상품 찜 토글 API 호출:', { productId });
      const response = await api.post('/api/kok/likes/toggle', {
        kok_product_id: productId
      });
      console.log('✅ 상품 찜 토글 API 응답:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ 상품 찜 토글 API 호출 실패:', error);
      throw error;
    }
  },

  // 찜한 상품 조회
  getLikedProducts: async (limit = 50) => {
    try {
      console.log('🚀 찜한 상품 조회 API 호출:', { limit });
      const response = await api.get('/api/kok/likes', {
        params: { limit }
      });
      console.log('✅ 찜한 상품 조회 API 응답:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ 찜한 상품 조회 API 호출 실패:', error);
      throw error;
    }
  },

  // ===== 통합 상품 조회 (기존 호환성 유지) =====
  
  // 모든 콕 상품 조회 (검색용) - 병렬 처리로 성능 향상
  getAllProducts: async () => {
    try {
      console.log('🚀 콕 전체 상품 데이터 로딩 시작...');
      
      // 병렬로 모든 상품 카테고리 호출 (Promise.all 사용)
      const [discountedProducts, topSellingProducts, storeBestItems] = await Promise.all([
        kokApi.getDiscountedProducts(),
        kokApi.getTopSellingProducts(),
        kokApi.getStoreBestItems()
      ]);
      
      // 중복 제거를 위해 Map 사용
      const allProductsMap = new Map();
      
      // 할인 특가 상품 추가
      if (discountedProducts?.products) {
        discountedProducts.products.forEach(product => {
          allProductsMap.set(product.kok_product_id, {
            id: product.kok_product_id,
            name: product.kok_product_name,
            originalPrice: product.kok_discounted_price / (1 - product.kok_discount_rate / 100),
            discountPrice: product.kok_discounted_price,
            discountRate: product.kok_discount_rate,
            image: product.kok_thumbnail || '/test1.png',
            rating: product.kok_review_score || 4.5,
            reviewCount: product.kok_review_cnt || 0,
            storeName: product.kok_store_name,
            category: '콕 특가'
          });
        });
      }
      
      // 판매율 높은 상품 추가
      if (topSellingProducts?.products) {
        topSellingProducts.products.forEach(product => {
          if (!allProductsMap.has(product.kok_product_id)) {
            allProductsMap.set(product.kok_product_id, {
              id: product.kok_product_id,
              name: product.kok_product_name,
              originalPrice: product.kok_discounted_price / (1 - product.kok_discount_rate / 100),
              discountPrice: product.kok_discounted_price,
              discountRate: product.kok_discount_rate,
              image: product.kok_thumbnail || '/test1.png',
              rating: product.kok_review_score || 4.5,
              reviewCount: product.kok_review_cnt || 0,
              storeName: product.kok_store_name,
              category: '콕 베스트'
            });
          }
        });
      }
      
      // 스토어 베스트 상품 추가
      if (storeBestItems?.products) {
        storeBestItems.products.forEach(product => {
          if (!allProductsMap.has(product.kok_product_id)) {
            allProductsMap.set(product.kok_product_id, {
              id: product.kok_product_id,
              name: product.kok_product_name,
              originalPrice: product.kok_discounted_price / (1 - product.kok_discount_rate / 100),
              discountPrice: product.kok_discounted_price,
              discountRate: product.kok_discount_rate,
              image: product.kok_thumbnail || '/test1.png',
              rating: product.kok_review_score || 4.5,
              reviewCount: product.kok_review_cnt || 0,
              storeName: product.kok_store_name,
              category: '스토어 베스트'
            });
          }
        });
      }
      
      const allProducts = Array.from(allProductsMap.values());
      console.log('✅ 콕 전체 상품 로딩 완료:', allProducts.length, '개');
      
      return allProducts;
    } catch (error) {
      console.error('❌ 콕 전체 상품 로딩 실패:', error);
      return [];
    }
  },

  // 콕 상품 검색 (로드된 상품에서 필터링)
  searchProductsLocal: async (query, allProducts = null) => {
    try {
      console.log('🚀 콕 상품 로컬 검색 시작:', query);
      
      // 상품 데이터가 없으면 먼저 로드
      const products = allProducts || await kokApi.getAllProducts();
      
      if (!query || query.trim() === '') {
        console.log('검색어가 없어서 전체 상품 반환');
        return products;
      }
      
      const searchTerm = query.toLowerCase().trim();
      
      // 상품명, 스토어명, 카테고리에서 검색
      const filteredProducts = products.filter(product => {
        const nameMatch = product.name.toLowerCase().includes(searchTerm);
        const storeMatch = product.storeName.toLowerCase().includes(searchTerm);
        const categoryMatch = product.category.toLowerCase().includes(searchTerm);
        
        return nameMatch || storeMatch || categoryMatch;
      });
      
      console.log(`✅ 콕 상품 로컬 검색 결과: "${query}" -> ${filteredProducts.length}개 상품`);
      
      return filteredProducts;
    } catch (error) {
      console.error('❌ 콕 상품 로컬 검색 실패:', error);
      return [];
    }
  },

  // ===== 결제 확인 (orderApi 사용) =====
  
  // 콕 단건 결제 확인
  confirmKokPayment: async (kokOrderId) => {
    return orderApi.confirmKokPayment(kokOrderId);
  },

  // 결제 확인 (주문 단위)
  confirmOrderUnitPayment: async (orderId) => {
    return orderApi.confirmOrderUnitPayment(orderId);
  }
};
