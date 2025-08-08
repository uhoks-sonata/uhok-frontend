// 레시피 관련 API 엔드포인트 관리
const BASE_URL = 'http://localhost:3001';

export const recipeApi = {
  // 소진 희망 재료로 레시피 추천
  getRecipesByIngredients: async (ingredients) => {
    const response = await fetch(`${BASE_URL}/api/recipes/by-ingredients`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ingredients }),
    });
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
    return response.json();
  },
};
