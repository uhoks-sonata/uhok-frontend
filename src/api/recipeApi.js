// 레시피 관련 API 엔드포인트 관리
const BASE_URL = 'http://localhost:3001';

export const recipeApi = {
  // 소진 희망 재료로 레시피 추천 (API 명세서에 맞춰 GET 요청)
  getRecipesByIngredients: async (params) => {
    const { ingredient, amount, unit, consume_count, page = 1, size = 5 } = params;
    
    // 쿼리 파라미터 구성
    const queryParams = new URLSearchParams();
    
    // ingredient는 배열이므로 각각 추가
    ingredient.forEach(ing => queryParams.append('ingredient', ing));
    
    // amount가 있으면 추가
    if (amount && amount.length > 0) {
      amount.forEach(amt => queryParams.append('amount', amt));
    }
    
    // unit이 있으면 추가
    if (unit && unit.length > 0) {
      unit.forEach(u => queryParams.append('unit', u));
    }
    
    // consume_count가 있으면 추가
    if (consume_count !== undefined) {
      queryParams.append('consume_count', consume_count);
    }
    
    // 페이지 정보 추가
    queryParams.append('page', page);
    queryParams.append('size', size);
    
    const response = await fetch(`${BASE_URL}/api/recipes/by-ingredients?${queryParams.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`API 호출 실패: ${response.status}`);
    }
    
    return response.json();
  },

  // 레시피명/식재료명으로 레시피 검색
  searchRecipes: async (searchTerm) => {
    const response = await fetch(`${BASE_URL}/api/recipes/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ searchTerm }),
    });
    
    if (!response.ok) {
      throw new Error(`API 호출 실패: ${response.status}`);
    }
    
    return response.json();
  },
};
