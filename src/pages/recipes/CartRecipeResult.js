import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import BottomNav from '../../layout/BottomNav';
import HeaderNavRecipeRecommendation from '../../layout/HeaderNavRecipeRecommendation';
import Loading from '../../components/Loading';
import '../../styles/recipe_result.css';
import fallbackImg from '../../assets/no_items.png';
import bookmarkIcon from '../../assets/bookmark-icon.png';

const CartRecipeResult = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // 상태 관리
  const [recipes, setRecipes] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchType, setSearchType] = useState('cart'); // cart 또는 mypage
  const [isInitialized, setIsInitialized] = useState(false);

  // 백엔드 응답의 이미지 키 다양성 대응 및 로컬 폴백 사용
  const getRecipeImageSrc = (recipe, idx) => {
    const candidates = [
      recipe?.thumbnail_url,
      recipe?.thumbnailUrl,
      recipe?.image_url,
      recipe?.img_url,
      recipe?.main_image_url,
      recipe?.image,
      recipe?.thumbnail,
    ].filter((v) => typeof v === 'string' && v.length > 0);
    if (candidates.length > 0) return candidates[0];
    return fallbackImg;
  };

  // 재료 표기를 문자열로 정규화
  const displayIngredients = ingredients.map((ing) => {
    if (typeof ing === 'string') return ing;
    const name = ing?.name ?? '';
    const amount = ing?.amount;
    const unit = ing?.unit;
    const amountPart = amount != null && amount !== '' ? ` ${amount}` : '';
    const unitPart = unit ? `${unit}` : '';
    return `${name}${amountPart}${unitPart}`.trim();
  });

  useEffect(() => {
    // 이미 초기화되었으면 중복 실행 방지
    if (isInitialized) {
      return;
    }
    
    if (location.state) {
      console.log('CartRecipeResult - Location state received:', location.state);
      
      const initialRecipes = location.state.recipes || [];
      const initialIngredients = location.state.ingredients || [];
      const initialPage = location.state.page || 1;
      
      // 에러 상태 확인
      if (location.state.error) {
        setError(location.state.errorMessage || '레시피 검색 중 오류가 발생했습니다.');
        setRecipes([]);
        setIngredients(initialIngredients);
        setTotal(0);
        setCurrentPage(initialPage);
        setLoading(false);
        setIsInitialized(true);
        return;
      }
      
      setRecipes(initialRecipes);
      setIngredients(initialIngredients);
      setTotal(location.state.total || 0);
      setCurrentPage(initialPage);
      setSearchType(location.state.searchType || 'cart'); // cart 또는 mypage
      
      setLoading(false);
      setIsInitialized(true);
    } else {
      // state가 없으면 이전 페이지로 이동
      navigate('/recipes');
    }
  }, [location.state, navigate, isInitialized]);

  const handleBack = () => {
    // 검색 타입에 따라 다른 페이지로 이동
    if (searchType === 'cart') {
      navigate('/cart');
    } else if (searchType === 'mypage') {
      navigate('/mypage');
    } else {
      navigate('/recipes');
    }
  };

  const handleRecipeClick = (recipe) => {
    console.log('레시피 클릭:', recipe);
    // 레시피 상세 페이지로 이동
    const recipeId = recipe.recipe_id || recipe.id;
    if (recipeId) {
      navigate(`/recipes/${recipeId}`, {
        state: {
          ingredients: ingredients,
          recipeData: recipe
        }
      });
    }
  };

  if (loading) {
    return (
      <div className="recipe-result-page">
        <HeaderNavRecipeRecommendation onBackClick={handleBack} />
        <div className="selected-ingredients-section">
          <div className="ingredients-tags-container">
            {Array.isArray(ingredients) && ingredients.map((ingredient, index) => (
              <div key={index} className="ingredient-tag">
                {typeof ingredient === 'string' ? ingredient : ingredient.name}
              </div>
            ))}
          </div>
        </div>
        <main className="recipe-list">
          <Loading message="레시피를 불러오는 중..." />
        </main>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="recipe-result-page">
      {/* 헤더 */}
      <HeaderNavRecipeRecommendation onBackClick={handleBack} />

      {/* 선택된 재료 태그들 */}
      <div className="selected-ingredients-section">
        <div className="ingredients-tags-container">
          {displayIngredients.map((ingredient, index) => (
            <div key={index} className="ingredient-tag">
              {ingredient}
            </div>
          ))}
        </div>
      </div>

      {/* 레시피 목록 */}
      <main className="recipe-list">
        {loading && (
          <div className="loading-overlay">
            <Loading message="레시피를 추천받는 중... 잠시만 기다려주세요." />
          </div>
        )}
        {!loading && error && (
          <div className="recipe-card">
            <div className="recipe-info">
              <h3>오류가 발생했습니다</h3>
              <p>{error}</p>
              <button 
                className="retry-btn" 
                onClick={handleBack}
              >
                다시 시도하기
              </button>
            </div>
          </div>
        )}
        {!loading && !error && recipes.length > 0 && (
          recipes.map((recipe, idx) => {
            // API 응답 형식에 맞게 레시피 객체 정규화
            let recipeObj = recipe;
            if (Array.isArray(recipe)) {
              recipeObj = {
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
            
            return (
              <div key={recipeObj.recipe_id || recipeObj.id || idx} 
                   className="recipe-card cart-recipe-card" 
                   onClick={() => handleRecipeClick(recipeObj)}>
                <div className="recipe-image">
                  <img 
                    src={getRecipeImageSrc(recipeObj, idx)} 
                    alt={recipeObj.recipe_title || recipeObj.name || '레시피'} 
                    onError={(e)=>{ e.currentTarget.src = fallbackImg; }} 
                  />
                </div>
                <div className="recipe-info">
                  <h3 className="recipe-name" title={recipeObj.recipe_title || recipeObj.name}>
                    {(recipeObj.recipe_title || recipeObj.name || '').length > 50 
                      ? (recipeObj.recipe_title || recipeObj.name).substring(0, 50) + '...' 
                      : (recipeObj.recipe_title || recipeObj.name)}
                  </h3>
                  <div className="recipe-stats">
                    <span className="serving serving-small">{recipeObj.number_of_serving}</span>
                    <span className="separator"> | </span>
                    <span className="scrap-count">
                      <img className="bookmark-icon" src={bookmarkIcon} alt="북마크" />
                      <span className="bookmark-count">{recipeObj.scrap_count || recipeObj.scrapCount || 0}</span>
                    </span>
                  </div>
                  
                  {/* matched-ingredients 표시 */}
                  {typeof recipeObj.matched_ingredient_count === 'number' && (
                    <div className="matched-ingredients">
                      <span className="matched-count">{recipeObj.matched_ingredient_count}개 재료 일치</span>
                      <span className="separator"> | </span>
                      <span className="total-ingredients">재료 총 {recipeObj.total_ingredients_count || 0}개</span>
                    </div>
                  )}
                  
                  {/* 레시피 설명 표시 */}
                  {recipeObj.cooking_introduction && (
                    <p className="recipe-description">{recipeObj.cooking_introduction}</p>
                  )}
                </div>
              </div>
            );
          })
        )}
        {!loading && !error && recipes.length === 0 && (
          <div className="no-results">
            <p>추천할 수 있는 레시피가 없습니다.</p>
            <p>다른 상품을 선택해보세요.</p>
          </div>
        )}
      </main>

      {/* 하단 네비게이션 */}
      <BottomNav />
    </div>
  );
};

export default CartRecipeResult;
