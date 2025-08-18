import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import BottomNav from '../../layout/BottomNav';
import HeaderNavRecipeRecommendation from '../../layout/HeaderNavRecipeRecommendation';
import '../../styles/recipe_result.css';
// 로컬 더미 이미지로 교체 (외부 placeholder 차단/오류 대비)
import img1 from '../../assets/test/test1.png';
import img2 from '../../assets/test/test2.png';
import img3 from '../../assets/test/test3.png';
import fallbackImg from '../../assets/no_items.png';
import bookmarkIcon from '../../assets/bookmark-icon.png';
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
      console.log('Location state received:', location.state);
      console.log('Recipes from state:', location.state.recipes);
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
    // 레시피 상세 페이지로 이동
    const recipeId = recipe.recipe_id || recipe.id;
    if (recipeId) {
      // 재료 상태 정보를 state로 전달
      navigate(`/recipes/${recipeId}`, {
        state: {
          ingredients: ingredients,
          recipeData: recipe
        }
      });
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
      <HeaderNavRecipeRecommendation onBackClick={handleBack} />

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
          sortedRecipes.map((recipe, idx) => {
            // 배열 형태의 데이터를 객체로 변환
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
            
            // 실제 일치하는 재료 수 계산
            const actualMatchedCount = Array.isArray(recipeObj.used_ingredients) ? 
              recipeObj.used_ingredients.filter(usedIng => 
                displayIngredients.some(displayIng => {
                  const displayName = typeof displayIng === 'string' ? displayIng : displayIng.name || '';
                  return usedIng && usedIng.material_name && displayName.toLowerCase().includes(usedIng.material_name.toLowerCase()) ||
                         usedIng && usedIng.material_name && usedIng.material_name.toLowerCase().includes(displayName.toLowerCase());
                })
              ).length : 0;
            
            // 디버깅을 위한 콘솔 로그
            console.log('Recipe object:', recipeObj);
            console.log('matched_ingredient_count:', recipeObj.matched_ingredient_count);
            console.log('total_ingredients_count:', recipeObj.total_ingredients_count);
            console.log('used_ingredients:', recipeObj.used_ingredients);
            console.log('used_ingredients type:', typeof recipeObj.used_ingredients);
            console.log('used_ingredients isArray:', Array.isArray(recipeObj.used_ingredients));
            console.log('Actual matched count:', actualMatchedCount);
            
            return (
              <div key={recipeObj.recipe_id || recipeObj.id || idx} className="recipe-card" onClick={() => handleRecipeClick(recipeObj)}>
                <div className="recipe-image">
                  <img src={getRecipeImageSrc(recipeObj, idx)} alt={recipeObj.recipe_title || recipeObj.name || '레시피'} onError={(e)=>{ e.currentTarget.src = fallbackImg; }} />
                </div>
                <div className="recipe-info">
                  <h3 className="recipe-name">{recipeObj.recipe_title || recipeObj.name}</h3>
                                     <div className="recipe-stats">
                     <span className="serving serving-small">{recipeObj.number_of_serving}</span>
                     <span className="separator"> | </span>
                                           <span className="scrap-count">
                        <img className="bookmark-icon" src={bookmarkIcon} alt="북마크" />
                        <span className="bookmark-count">{recipeObj.scrap_count || recipeObj.scrapCount || 0}</span>
                      </span>
                   </div>
                  {typeof recipeObj.matched_ingredient_count === 'number' && (
                    <div className="matched-ingredients">
                      <span className="matched-count">{actualMatchedCount}개 재료 일치</span>
                      <span className="separator"> | </span>
                      <span className="total-ingredients">재료 총 {recipeObj.total_ingredients_count || (Array.isArray(recipeObj.used_ingredients) ? recipeObj.used_ingredients.length : 0)}개</span>
                    </div>
                  )}
                  <p className="recipe-description" title={recipeObj.cooking_introduction || ''}>
                    {recipeObj.cooking_introduction || ''}
                  </p>
                </div>
              </div>
            );
          })
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

