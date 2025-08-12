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
  // 소진 희망 재료로 레시피 추천 (GET /api/recipes/by-ingredients)
  // params: { ingredient: string[], amount?: string[], unit?: string[], consume_count?: number, page?: number, size?: number }
  getRecipesByIngredients: async ({ ingredient, amount, unit, consume_count, page = 1, size = 5, signal } = {}) => {
    const qs = buildQuery({ ingredient, amount, unit, consume_count, page, size });
    const url = `/api/recipes/by-ingredients?${qs}`;
    
    // API 요청 로깅
    console.log('🔍 소진희망재료 API 요청:', {
      url,
      params: { ingredient, amount, unit, consume_count, page, size },
      queryString: qs
    });
    
    // baseURL를 비워 프록시(/api -> 9000)를 타도록 함
    const response = await api.get(url, { baseURL: '', timeout: 30000, signal });
    
    // API 응답 로깅
    console.log('✅ 소진희망재료 API 응답:', {
      status: response.status,
      data: response.data,
      headers: response.headers
    });
    
    return response.data;
  },

  // 레시피명/식재료명으로 레시피 검색 (GET /api/recipes/search)
  // params: { recipe: string, page?: number, size?: number, method?: 'recipe'|'ingredient', signal?: AbortSignal } 또는 문자열(recipe)
  searchRecipes: async (params) => {
    const { recipe, page = 1, size = 10, method = 'recipe', signal } =
      typeof params === 'string' ? { recipe: params, page: 1, size: 10, method: 'recipe' } : params || {};

    const sizesToTry = [size || 10, 5, 3, 1];
    let lastError;
    for (const s of sizesToTry) {
      try {
        const qs = buildQuery({ recipe, page, size: s, method });
        const baseTimeoutMs = s >= 5 ? 15000 : 8000;
        const timeoutMs = method === 'recipe' ? baseTimeoutMs * 3 : baseTimeoutMs;
        const response = await api.get(`/api/recipes/search?${qs}`, {
          baseURL: '',
          timeout: timeoutMs,
          signal,
        });
        return response.data;
      } catch (e) {
        lastError = e;
        const status = e?.response?.status;
        const isTimeout = e?.code === 'ECONNABORTED' || /timeout/i.test(e?.message || '');
        if (!(status === 504 || isTimeout)) {
          break; // 다른 오류면 즉시 중단
        }
      }
    }
    throw lastError;
  },

  // 레시피 상세정보 조회
  getRecipeDetail: async (recipeId) => {
    const response = await api.get(`/api/recipes/${recipeId}`, { baseURL: '' });
    return response.data;
  },

  // 만개의 레시피 URL 조회
  getRecipeUrl: async (recipeId) => {
    const response = await api.get(`/api/recipes/${recipeId}/url`, { baseURL: '' });
    return response.data;
  },

  // 레시피 별점 조회
  getRecipeRating: async (recipeId) => {
    const response = await api.get(`/api/recipes/${recipeId}/rating`, { baseURL: '' });
    return response.data;
  },

  // 레시피 별점 등록 (Authorization 필요)
  postRecipeRating: async (recipeId, rating) => {
    const response = await api.post(`/api/recipes/${recipeId}/rating`, { rating }, { baseURL: '' });
    return response.data;
  },

  // 콕 쇼핑몰 내 ingredient 관련 상품 정보 조회
  getKokProducts: async (ingredient) => {
    const response = await api.get(`/api/recipes/kok?ingredient=${encodeURIComponent(ingredient)}`, { baseURL: '' });
    return response.data;
  },
};
