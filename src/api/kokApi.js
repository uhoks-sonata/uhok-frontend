// 콕 쇼핑몰 관련 API 엔드포인트 관리
import api from '../pages/api';

export const kokApi = {
  // 콕 할인 특가 상품 조회
  getDiscountedProducts: async () => {
    try {
      console.log('콕 할인 특가 상품 API 호출...');
      const response = await api.get('/api/kok/discounted');
      console.log('콕 할인 특가 상품 API 응답:', response.data);
      
      if (response.data && response.data.products) {
        return response.data.products.map(product => ({
          id: product.kok_product_id,
          name: product.kok_product_name,
          originalPrice: product.kok_discounted_price / (1 - product.kok_discount_rate / 100),
          discountPrice: product.kok_discounted_price,
          discountRate: product.kok_discount_rate,
          image: product.kok_thumbnail,
          rating: 4.5,
          reviewCount: 128,
          storeName: product.kok_store_name,
          category: '콕 특가'
        }));
      }
      return [];
    } catch (error) {
      console.error('콕 할인 특가 상품 API 호출 실패:', error);
      return [];
    }
  },

  // 콕 판매율 높은 상품 조회
  getTopSellingProducts: async () => {
    try {
      console.log('콕 판매율 높은 상품 API 호출...');
      const response = await api.get('/api/kok/top-selling');
      console.log('콕 판매율 높은 상품 API 응답:', response.data);
      
      if (response.data && response.data.products) {
        return response.data.products.map(product => ({
          id: product.kok_product_id,
          name: product.kok_product_name,
          originalPrice: product.kok_discounted_price / (1 - product.kok_discount_rate / 100),
          discountPrice: product.kok_discounted_price,
          discountRate: product.kok_discount_rate,
          image: product.kok_thumbnail,
          rating: 4.5,
          reviewCount: 128,
          storeName: product.kok_store_name,
          category: '콕 베스트'
        }));
      }
      return [];
    } catch (error) {
      console.error('콕 판매율 높은 상품 API 호출 실패:', error);
      return [];
    }
  },

  // 모든 콕 상품 조회 (검색용)
  getAllProducts: async () => {
    try {
      console.log('콕 모든 상품 데이터 로딩 시작...');
      
      // 병렬로 모든 상품 카테고리 호출
      const [discountedProducts, topSellingProducts] = await Promise.all([
        kokApi.getDiscountedProducts(),
        kokApi.getTopSellingProducts()
      ]);
      
      // 중복 제거를 위해 Set 사용
      const allProductsMap = new Map();
      
      // 할인 특가 상품 추가
      discountedProducts.forEach(product => {
        allProductsMap.set(product.id, product);
      });
      
      // 판매율 높은 상품 추가 (이미 있으면 덮어쓰기)
      topSellingProducts.forEach(product => {
        if (!allProductsMap.has(product.id)) {
          allProductsMap.set(product.id, product);
        }
      });
      
      const allProducts = Array.from(allProductsMap.values());
      console.log('콕 전체 상품 로딩 완료:', allProducts.length, '개');
      
      return allProducts;
    } catch (error) {
      console.error('콕 전체 상품 로딩 실패:', error);
      return [];
    }
  },

  // 콕 상품 검색 (로드된 상품에서 필터링)
  searchProducts: async (query, allProducts = null) => {
    try {
      console.log('콕 상품 검색 시작:', query);
      
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
      
      console.log(`콕 상품 검색 결과: "${query}" -> ${filteredProducts.length}개 상품`);
      
      return filteredProducts;
    } catch (error) {
      console.error('콕 상품 검색 실패:', error);
      return [];
    }
  }
};
