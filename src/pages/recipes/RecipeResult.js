import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import BottomNav from '../../layout/BottomNav';
import '../../styles/recipe_result.css';
// 로컬 더미 이미지로 교체 (외부 placeholder 차단/오류 대비)
import img1 from '../../assets/test/test1.png';
import img2 from '../../assets/test/test2.png';
import img3 from '../../assets/test/test3.png';
import fallbackImg from '../../assets/no_items.png';
import { recipeApi } from '../../api/recipeApi';

const RecipeResult = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // location.state에서 데이터를 가져옴
  const [recipes, setRecipes] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  // 렌더 조건에서 참조하는 error 변수를 정의 (기본 공백)
  const [error] = useState('');

  // 백엔드 응답의 이미지 키 다양성 대응 및 로컬 폴백 사용
  const localImgs = useMemo(() => [img1, img2, img3], []);
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
    return localImgs[idx % localImgs.length] || fallbackImg;
  };

  // 재료 표기를 문자열로 정규화 (객체/문자열 둘 다 처리)
  const displayIngredients = useMemo(() => {
    if (!Array.isArray(ingredients)) return [];
    return ingredients.map((ing) => {
      if (typeof ing === 'string') return ing;
      const name = ing?.name ?? '';
      const amount = ing?.amount;
      const unit = ing?.unit;
      const amountPart = amount != null && amount !== '' ? ` ${amount}` : '';
      const unitPart = unit ? `${unit}` : '';
      return `${name}${amountPart}${unitPart}`.trim();
    });
  }, [ingredients]);

  // 정렬: matched_ingredient_count가 있을 경우 내림차순 정렬하여 표시
  const sortedRecipes = useMemo(() => {
    if (!Array.isArray(recipes)) return [];
    const hasMatched = recipes.some(r => typeof r?.matched_ingredient_count === 'number');
    if (!hasMatched) return recipes;
    return [...recipes].sort((a, b) => (b?.matched_ingredient_count || 0) - (a?.matched_ingredient_count || 0));
  }, [recipes]);

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
      <div className="selected-ingredients-section">
        <div className="ingredients-tags">
          {displayIngredients.map((ingredient, index) => (
            <div key={index} className="ingredient-tag">
              <span className="ingredient-name">{ingredient}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 결과 요약 */}
      <div className="result-summary">
        <p>총 {total}개의 레시피를 찾았습니다.</p>
      </div>

      {/* 레시피 목록 */}
      <main className="recipe-list">
        {loading && (
          <div className="recipe-card">
            <div className="recipe-info"><h3>불러오는 중...</h3></div>
          </div>
        )}
        {!loading && error && (
          <div className="recipe-card">
            <div className="recipe-info"><h3>{error}</h3></div>
          </div>
        )}
        {!loading && !error && recipes.length > 0 && (
          sortedRecipes.map((recipe, idx) => (
            <div key={recipe.recipe_id || recipe.id || idx} className="recipe-card" onClick={() => handleRecipeClick(recipe)}>
              <div className="recipe-image">
                <img src={getRecipeImageSrc(recipe, idx)} alt={recipe.recipe_title || recipe.name || '레시피'} onError={(e)=>{ e.currentTarget.src = fallbackImg; }} />
              </div>
              <div className="recipe-info">
                <h3 className="recipe-name">{recipe.recipe_title || recipe.name}</h3>
                <div className="recipe-meta">
                  <span className="cooking-name">{recipe.cooking_name}</span>
                  <span className="cooking-category">{recipe.cooking_category_name}</span>
                  <span className="cooking-case">{recipe.cooking_case_name}</span>
                </div>
                <div className="recipe-stats">
                  <span className="scrap-count">스크랩 {recipe.scrap_count || recipe.scrapCount || 0}</span>
                  {typeof recipe.matched_ingredient_count === 'number' && (
                    <span className="matched-ingredients">일치 재료 {recipe.matched_ingredient_count}개</span>
                  )}
                </div>
                <p className="recipe-description">{recipe.cooking_introduction || ''}</p>
                <div className="recipe-details">
                  <span className="serving">{recipe.number_of_serving}</span>
                </div>
              </div>
            </div>
          ))
        )}
        {!loading && !error && recipes.length === 0 && (
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

