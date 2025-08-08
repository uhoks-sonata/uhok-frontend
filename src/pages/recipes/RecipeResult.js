import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import BottomNav from '../../layout/BottomNav';
import '../../styles/recipe_result.css';

const RecipeResult = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // location.state에서 데이터를 가져옴
  const [recipes, setRecipes] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (location.state) {
      setRecipes(location.state.recipes || []);
      setIngredients(location.state.ingredients || []);
      setTotal(location.state.total || 0);
      setCurrentPage(location.state.page || 1);
      setLoading(false);
    } else {
      // state가 없으면 이전 페이지로 이동
      navigate('/recipes');
    }
  }, [location.state, navigate]);

  const handleBack = () => {
    navigate('/recipes');
  };

  const handleRecipeClick = (recipe) => {
    console.log('레시피 클릭:', recipe);
    // 레시피 상세 페이지로 이동 (recipe_url 사용)
    if (recipe.recipe_url) {
      window.open(recipe.recipe_url, '_blank');
    }
  };

  const handleLoadMore = () => {
    // TODO: 다음 페이지 로드 로직 구현
    console.log('더 많은 레시피 로드');
  };

  if (loading) {
    return (
      <div className="recipe-result-page">
        <div className="loading">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="recipe-result-page">
      {/* 헤더 */}
      <header className="recipe-result-header">
        <button className="back-button" onClick={handleBack}>
          ←
        </button>
        <h1 className="recipe-result-title">레시피 추천</h1>
      </header>

      {/* 선택된 재료 태그들 */}
      {ingredients.length > 0 && (
        <div className="selected-ingredients-section">
          <div className="ingredients-tags">
            {ingredients.map((ingredient, index) => (
              <div key={index} className="ingredient-tag">
                <span className="ingredient-name">
                  {ingredient.name}
                  {ingredient.amount && ` ${ingredient.amount}${ingredient.unit}`}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 결과 요약 */}
      <div className="result-summary">
        <p>총 {total}개의 레시피를 찾았습니다.</p>
      </div>

      {/* 레시피 목록 */}
      <main className="recipe-list">
        {recipes.length > 0 ? (
          recipes.map((recipe) => (
            <div key={recipe.recipe_id} className="recipe-card" onClick={() => handleRecipeClick(recipe)}>
              <div className="recipe-image">
                <img src={recipe.thumbnail_url} alt={recipe.recipe_title} />
              </div>
              <div className="recipe-info">
                <h3 className="recipe-name">{recipe.recipe_title}</h3>
                <div className="recipe-meta">
                  <span className="cooking-name">{recipe.cooking_name}</span>
                  <span className="cooking-category">{recipe.cooking_category_name}</span>
                  <span className="cooking-case">{recipe.cooking_case_name}</span>
                </div>
                <div className="recipe-stats">
                  <span className="scrap-count">스크랩 {recipe.scrap_count}</span>
                  <span className="matched-ingredients">일치 재료 {recipe.matched_ingredient_count}개</span>
                </div>
                <p className="recipe-description">{recipe.cooking_introduction}</p>
                <div className="recipe-details">
                  <span className="serving">{recipe.number_of_serving}</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="no-results">
            <p>검색 결과가 없습니다.</p>
            <p>다른 재료로 다시 시도해보세요.</p>
          </div>
        )}
      </main>

      {/* 더보기 버튼 */}
      {recipes.length > 0 && recipes.length < total && (
        <div className="load-more-section">
          <button className="load-more-btn" onClick={handleLoadMore}>
            더 많은 레시피 보기
          </button>
        </div>
      )}

      {/* 하단 네비게이션 */}
      <BottomNav />
    </div>
  );
};

export default RecipeResult;

