// 레시피 관련 API 엔드포인트 관리 (API 명세 반영)
import api from '../pages/api';

/**
 * 쿼리스트링을 안전하게 구성 (배열 파라미터는 키를 반복하여 추가)
 */
const buildQuery = (params) => {
  const usp = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value == null) return;
    if (Array.isArray(value)) {
      value.forEach((v) => {
        if (v != null && `${v}`.length > 0) usp.append(key, `${v}`);
      });
    } else {
      usp.append(key, `${value}`);
    }
  });
  return usp.toString();
};

export const recipeApi = {
  /**
   * 1. 보유 재료가 차감되는 형식으로 보여줌, 입력한 재료가 많이 속한 레시피 순으로 제공
   * GET /api/recipes/by-ingredients
   */
  getRecipesByIngredients: async ({ 
    ingredient, 
    amount, 
    unit, 
    page = 1, 
    size = 5, 
    signal 
  } = {}) => {
    try {
      const qs = buildQuery({ ingredient, amount, unit, page, size });
      const url = `/api/recipes/by-ingredients?${qs}`;
      
      console.log('🔍 재료 기반 레시피 추천 API 요청:', {
        url,
        params: { ingredient, amount, unit, page, size }
      });
      
      const response = await api.get(url, { 
        baseURL: '', 
        timeout: 30000, 
        signal 
      });
      
      console.log('✅ 재료 기반 레시피 추천 API 응답:', {
        status: response.status,
        data: response.data
      });
      
      return response.data;
    } catch (error) {
      console.error('❌ 재료 기반 레시피 추천 API 오류:', error);
      throw error;
    }
  },

  /**
   * 2. sbert 모델 사용 - 레시피명/재료명 검색
   * GET /api/recipes/search
   */
  searchRecipes: async ({ 
    recipe, 
    page = 1, 
    size = 5, 
    method = 'recipe', 
    signal 
  } = {}) => {
    try {
      const qs = buildQuery({ recipe, page, size, method });
      const url = `/api/recipes/search?${qs}`;
      
      console.log('🔍 레시피 검색 API 요청:', {
        url,
        params: { recipe, page, size, method }
      });
      
      const response = await api.get(url, {
        baseURL: '',
        timeout: 15000,
        signal
      });
      
      console.log('✅ 레시피 검색 API 응답:', {
        status: response.status,
        data: response.data
      });
      
      return response.data;
    } catch (error) {
      console.error('❌ 레시피 검색 API 오류:', error);
      throw error;
    }
  },

  /**
   * 3. 레시피 상세 정보 조회
   * GET /api/recipes/{recipe_id}
   */
  getRecipeDetail: async (recipeId, signal) => {
    try {
      const url = `/api/recipes/${recipeId}`;
      
      console.log('🔍 레시피 상세 정보 API 요청:', { url, recipeId });
      
      const response = await api.get(url, { 
        baseURL: '', 
        timeout: 15000,
        signal 
      });
      
      console.log('✅ 레시피 상세 정보 API 응답:', {
        status: response.status,
        data: response.data
      });
      
      return response.data;
    } catch (error) {
      console.error('❌ 레시피 상세 정보 API 오류:', error);
      throw error;
    }
  },

  /**
   * 4. 만개의 레시피 URL 조회
   * GET /api/recipes/{recipe_id}/url
   */
  getRecipeUrl: async (recipeId, signal) => {
    try {
      const url = `/api/recipes/${recipeId}/url`;
      
      console.log('🔍 레시피 URL API 요청:', { url, recipeId });
      
      const response = await api.get(url, { 
        baseURL: '', 
        timeout: 10000,
        signal 
      });
      
      console.log('✅ 레시피 URL API 응답:', {
        status: response.status,
        data: response.data
      });
      
      return response.data;
    } catch (error) {
      console.error('❌ 레시피 URL API 오류:', error);
      throw error;
    }
  },

  /**
   * 5. 식재료 상태 조회 (보유/장바구니/미보유)
   * GET /api/recipes/{recipe_id}/status
   */
  getRecipeIngredientStatus: async (recipeId, signal) => {
    try {
      const url = `/api/recipes/${recipeId}/status`;
      
      console.log('🔍 레시피 재료 상태 API 요청:', { url, recipeId });
      
      const response = await api.get(url, { 
        baseURL: '', 
        timeout: 15000,
        signal 
      });
      
      console.log('✅ 레시피 재료 상태 API 응답:', {
        status: response.status,
        data: response.data
      });
      
      return response.data;
    } catch (error) {
      console.error('❌ 레시피 재료 상태 API 오류:', error);
      throw error;
    }
  },

  /**
   * 6. 레시피 별점 조회
   * GET /api/recipes/{recipe_id}/rating
   */
  getRecipeRating: async (recipeId, signal) => {
    try {
      const url = `/api/recipes/${recipeId}/rating`;
      
      console.log('🔍 레시피 별점 조회 API 요청:', { url, recipeId });
      
      const response = await api.get(url, { 
        baseURL: '', 
        timeout: 10000,
        signal 
      });
      
      console.log('✅ 레시피 별점 조회 API 응답:', {
        status: response.status,
        data: response.data
      });
      
      return response.data;
    } catch (error) {
      console.error('❌ 레시피 별점 조회 API 오류:', error);
      throw error;
    }
  },

  /**
   * 7. 레시피 별점 등록 (0~5 정수만 허용)
   * POST /api/recipes/{recipe_id}/rating
   */
  postRecipeRating: async (recipeId, rating, signal) => {
    try {
      const url = `/api/recipes/${recipeId}/rating`;
      
      // 별점 유효성 검사 (0~5 정수)
      if (!Number.isInteger(rating) || rating < 0 || rating > 5) {
        throw new Error('별점은 0~5 사이의 정수여야 합니다.');
      }
      
      console.log('🔍 레시피 별점 등록 API 요청:', { 
        url, 
        recipeId, 
        rating 
      });
      
      const response = await api.post(url, { rating }, { 
        baseURL: '', 
        timeout: 15000,
        signal 
      });
      
      console.log('✅ 레시피 별점 등록 API 응답:', {
        status: response.status,
        data: response.data
      });
      
      return response.data;
    } catch (error) {
      console.error('❌ 레시피 별점 등록 API 오류:', error);
      throw error;
    }
  },

  /**
   * 8. 콕 쇼핑몰 내 ingredient 관련 상품 정보 조회
   * GET /api/recipes/kok
   */
  getKokProducts: async (ingredient, signal) => {
    try {
      const qs = buildQuery({ ingredient });
      const url = `/api/recipes/kok?${qs}`;
      
      console.log('🔍 콕 상품 정보 API 요청:', { url, ingredient });
      
      const response = await api.get(url, { 
        baseURL: '', 
        timeout: 15000,
        signal 
      });
      
      console.log('✅ 콕 상품 정보 API 응답:', {
        status: response.status,
        data: response.data
      });
      
      return response.data;
    } catch (error) {
      console.error('❌ 콕 상품 정보 API 오류:', error);
      throw error;
    }
  },

  /**
   * 유틸리티 함수: API 응답 데이터 정규화
   */
  normalizeRecipeData: (recipe) => {
    if (!recipe) return null;
    
    // 배열 형태의 데이터를 객체로 변환 (기존 코드와 호환성 유지)
    if (Array.isArray(recipe)) {
      return {
        recipe_id: recipe[0],
        recipe_title: recipe[1],
        cooking_name: recipe[2],
        scrap_count: recipe[3],
        cooking_case_name: recipe[4],
        cooking_category_name: recipe[5],
        cooking_introduction: recipe[6],
        number_of_serving: recipe[7],
        thumbnail_url: recipe[8],
        recipe_url: recipe[9],
        matched_ingredient_count: recipe[10],
        used_ingredients: Array.isArray(recipe[11]) ? recipe[11] : []
      };
    }
    
    // 객체 형태의 데이터는 그대로 반환
    return recipe;
  },

  /**
   * 유틸리티 함수: 재료 상태에 따른 CSS 클래스 반환
   */
  getIngredientStatusClass: (status) => {
    switch (status) {
      case 'owned':
        return 'ingredient-owned';
      case 'cart':
        return 'ingredient-cart';
      case 'not_owned':
        return 'ingredient-not-owned';
      default:
        return 'ingredient-unknown';
    }
  }
};
