import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import BottomNav from '../../layout/BottomNav';
import HeaderNavRecipeRecommendation from '../../layout/HeaderNavRecipeRecommendation';
import Loading from '../../components/Loading';
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
  const [combinationNumber, setCombinationNumber] = useState(1);
  const [hasMoreCombinations, setHasMoreCombinations] = useState(false);
  // 에러 상태 관리
  const [error, setError] = useState('');
  
  // 조합별로 결과를 캐싱하여 중복 요청 방지
  const combinationCache = useMemo(() => new Map(), []);

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
        setCombinationNumber(1);
        setHasMoreCombinations(false);
        setLoading(false);
        return;
      }
      
      setRecipes(initialRecipes);
      setIngredients(initialIngredients);
      setTotal(location.state.total || 0);
      setCurrentPage(initialPage);
      setCombinationNumber(location.state.combination_number || 1);
      setHasMoreCombinations(location.state.has_more_combinations || false);
      
      // 초기 데이터를 캐시에 저장
      if (initialRecipes.length > 0) {
        const cacheKey = `${initialIngredients.join(',')}-${initialPage}`;
        const cacheData = {
          recipes: initialRecipes,
          combination_number: location.state.combination_number || initialPage,
          has_more_combinations: location.state.has_more_combinations || false,
          total: location.state.total || 0
        };
        combinationCache.set(cacheKey, cacheData);
        console.log(`초기 조합 ${initialPage} 데이터 캐시 저장`);
      }
      
      setLoading(false);
    } else {
      // state가 없으면 이전 페이지로 이동
      navigate('/recipes');
    }
  }, [location.state, navigate, combinationCache]);

  const handleBack = () => {
    navigate('/recipes');
  };

  const handleRecipeClick = (recipe) => {
    console.log('레시피 클릭:', recipe);
    // 레시피 상세 페이지로 이동
    const recipeId = recipe.recipe_id || recipe.id;
    if (recipeId) {
      navigate(`/recipes/${recipeId}`);
    }
  };

  const handlePageChange = async (page) => {
    if (page === currentPage) return;
    
    // 캐시 키 생성 (재료 배열과 페이지 번호로)
    const cacheKey = `${ingredients.join(',')}-${page}`;
    
    // 캐시에 데이터가 있으면 캐시에서 가져오기
    if (combinationCache.has(cacheKey)) {
      const cachedData = combinationCache.get(cacheKey);
      setRecipes(cachedData.recipes);
      setCurrentPage(page);
      setCombinationNumber(cachedData.combination_number || page);
      setHasMoreCombinations(cachedData.has_more_combinations || false);
      setTotal(cachedData.total || 0);
      console.log(`캐시에서 조합 ${page} 데이터 로드`);
      return;
    }
    
    setLoading(true);
    try {
      // 백엔드 API 호출하여 해당 페이지의 조합 레시피 가져오기
      const response = await recipeApi.getRecipesByIngredients({
        ingredients: ingredients, // ingredients 배열 전달 (API에서 ingredient로 변환)
        page: page
      });
      
      if (response && response.recipes) {
        // 응답 데이터를 캐시에 저장
        const cacheData = {
          recipes: response.recipes,
          combination_number: response.combination_number || page,
          has_more_combinations: response.has_more_combinations || false,
          total: response.total || 0
        };
        combinationCache.set(cacheKey, cacheData);
        
        // 상태 업데이트
        setRecipes(response.recipes);
        setCurrentPage(page);
        setCombinationNumber(response.combination_number || page);
        setHasMoreCombinations(response.has_more_combinations || false);
        setTotal(response.total || 0);
        
        console.log(`조합 ${response.combination_number || page} 로드 완료 및 캐시 저장`);
      }
    } catch (error) {
      console.error('페이지 변경 중 오류 발생:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="recipe-result-page">
        <HeaderNavRecipeRecommendation onBackClick={handleBack} />
        <div className="selected-ingredients-section">
          <div className="ingredients-tags">
            {Array.isArray(ingredients) && ingredients.map((ingredient, index) => {
              // 객체 형태인 경우 name, amount, unit을 조합하여 표시
              if (typeof ingredient === 'string') {
                return (
                  <div key={index} className="ingredient-tag">
                    <span className="ingredient-name">{ingredient}</span>
                  </div>
                );
              } else {
                const name = ingredient?.name || '';
                const amount = ingredient?.amount;
                const unit = ingredient?.unit;
                const amountPart = amount != null && amount !== '' ? ` ${amount}` : '';
                const unitPart = unit ? `${unit}` : '';
                const displayText = `${name}${amountPart}${unitPart}`.trim();
                
                return (
                  <div key={index} className="ingredient-tag">
                    <span className="ingredient-name">{displayText}</span>
                  </div>
                );
              }
            })}
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
          <div className="loading-overlay">
            <Loading message="새로운 조합을 생성 중... 잠시만 기다려주세요." />
          </div>
        )}
        {!loading && error && (
          <div className="recipe-card">
            <div className="recipe-info">
              <h3>오류가 발생했습니다</h3>
              <p>{error}</p>
              <button 
                className="retry-btn" 
                onClick={() => navigate('/recipes')}
              >
                다시 시도하기
              </button>
            </div>
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

      {/* 페이지네이션 */}
      {recipes.length > 0 && (
        <div className="pagination-section">
          <div className="pagination-buttons">
            {[1, 2, 3].map((page) => (
              <button
                key={page}
                className={`pagination-btn ${currentPage === page ? 'active' : ''}`}
                onClick={() => handlePageChange(page)}
                disabled={loading}
              >
                {page}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 하단 네비게이션 */}
      <BottomNav />
    </div>
  );
};

export default RecipeResult; 