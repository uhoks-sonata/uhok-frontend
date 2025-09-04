import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import BottomNav from '../../layout/BottomNav';
import HeaderNavRecipeRecommendation from '../../layout/HeaderNavRecipeRecommendation';
import Loading from '../../components/Loading';
import IngredientTag from '../../components/IngredientTag';
import '../../styles/recipe_result.css';
import '../../styles/ingredient-tag.css';
// 로컬 더미 이미지로 교체 (외부 placeholder 차단/오류 대비)
// import img1 from '../../assets/test/test1.png';
// import img2 from '../../assets/test/test2.png';
// import img3 from '../../assets/test/test3.png';
import fallbackImg from '../../assets/no_items.png';
import bookmarkIcon from '../../assets/bookmark-icon.png';
import { recipeApi } from '../../api/recipeApi';
import ModalManager, { showNoRecipeNotification, hideModal } from '../../components/LoadingModal';

const RecipeResult = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // 상태 관리
  const [recipes, setRecipes] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(true);
  // 에러 상태 관리
  const [error, setError] = useState('');
  // 초기화 상태 관리
  const [isInitialized, setIsInitialized] = useState(false);
  // 검색 타입 관리
  const [searchType, setSearchType] = useState('ingredient'); // 기본값: 소진 희망 재료
  // 레시피별 재료 정보 캐시
  const [recipeIngredientsCache, setRecipeIngredientsCache] = useState(new Map());
  // 재료 정보 로딩 상태
  // 요청 제한을 위한 상태
  const [isFetchingIngredients, setIsFetchingIngredients] = useState(false);
  // 모달 상태 관리
  const [modalState, setModalState] = useState({ isVisible: false });
  



  // 레시피별 재료 정보 가져오기 (키워드 검색에서만) - 배치 처리로 개선
  const fetchRecipeIngredients = useCallback(async (recipeIds) => {
    if (searchType !== 'keyword' || isFetchingIngredients) {
      return;
    }

    // 이미 캐시된 레시피는 제외
    const uncachedIds = recipeIds.filter(id => !recipeIngredientsCache.has(id));
    if (uncachedIds.length === 0) {
      return;
    }

    try {
      setIsFetchingIngredients(true);
      
      // 최대 3개씩 배치로 처리
      const batchSize = 3;
      const newCache = new Map(recipeIngredientsCache);
      
      for (let i = 0; i < uncachedIds.length; i += batchSize) {
        const batch = uncachedIds.slice(i, i + batchSize);
        
        // 병렬로 요청하되 각 배치 사이에 약간의 지연
        const promises = batch.map(async (recipeId) => {
          try {
            const recipeDetail = await recipeApi.getRecipeDetail(recipeId);
            if (recipeDetail && recipeDetail.materials) {
              return {
                recipeId,
                used_ingredients: recipeDetail.materials,
                total_ingredients: recipeDetail.materials.length
              };
            }
          } catch (error) {
            console.log(`레시피 ${recipeId} 재료 정보 조회 실패:`, error);
          }
          return null;
        });
        
        const results = await Promise.all(promises);
        
        // 결과를 캐시에 저장
        results.forEach(result => {
          if (result) {
            newCache.set(result.recipeId, {
              used_ingredients: result.used_ingredients,
              total_ingredients: result.total_ingredients
            });
          }
        });
        
        // 배치 간 약간의 지연 (서버 부하 방지)
        if (i + batchSize < uncachedIds.length) {
          await new Promise(resolve => setTimeout(resolve, 200));
        }
      }
      
      setRecipeIngredientsCache(newCache);
    } catch (error) {
      console.log('재료 정보 배치 조회 실패:', error);
    } finally {
      setIsFetchingIngredients(false);
    }
  }, [searchType, isFetchingIngredients, recipeIngredientsCache]);

        // 백엔드 응답의 이미지 키 다양성 대응 및 로컬 폴백 사용
      // const localImgs = useMemo(() => [img1, img2, img3], []);
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
    // 이미 초기화되었으면 중복 실행 방지
    if (isInitialized) {
      return;
    }
    
    if (location.state) {
      console.log('Location state received:', location.state);
      console.log('Recipes from state:', location.state.recipes);
      
      const initialRecipes = location.state.recipes || [];
      const initialIngredients = location.state.ingredients || [];
      
      // 에러 상태 확인
      if (location.state.error) {
        setError(location.state.errorMessage || '레시피 검색 중 오류가 발생했습니다.');
        setRecipes([]);
        setIngredients(initialIngredients);
        setLoading(false);
        setIsInitialized(true);
        return;
      }
      
             setRecipes(initialRecipes);
      setIngredients(initialIngredients);
      setSearchType(location.state.searchType || 'ingredient'); // 검색 타입 설정
      
      setLoading(false);
      setIsInitialized(true);
    } else {
      // state가 없으면 이전 페이지로 이동
      navigate('/recipes');
    }
  }, [location.state, navigate, isInitialized]);

  // 레시피 재료 정보 가져오기 (키워드 검색에서만) - 배치 처리
  useEffect(() => {
    if (searchType === 'keyword' && recipes.length > 0 && !isFetchingIngredients) {
      const recipeIds = recipes
        .map(recipe => recipe.recipe_id || recipe.id)
        .filter(id => id && !recipeIngredientsCache.has(id));
      
      if (recipeIds.length > 0) {
        fetchRecipeIngredients(recipeIds);
      }
    }
  }, [searchType, recipes, fetchRecipeIngredients, isFetchingIngredients]); // recipeIngredientsCache 제거

  const handleBack = () => {
    navigate('/recipes');
  };

  // 모달 핸들러
  const handleModalClose = () => {
    setModalState(hideModal());
    // 돌아가기 버튼을 눌렀을 때 이전 페이지로 이동
    if (modalState.modalType === 'alert' && modalState.alertButtonText === '돌아가기') {
      navigate('/recipes');
    }
  };

  const handleRecipeClick = (recipe) => {
    console.log('레시피 클릭:', recipe);
    // 레시피 상세 페이지로 이동
    const recipeId = recipe.RECIPE_ID || recipe.recipe_id || recipe.id;
    if (recipeId) {
      // 재료 상태 정보를 state로 전달
      navigate(`/recipes/${recipeId}`, {
        state: {
          ingredients: ingredients,
          recipeData: recipe,
          searchType: searchType // 검색 타입도 함께 전달
        }
      });
    }
  };


  if (loading) {
    return (
      <div className="recipe-result-page">
        <HeaderNavRecipeRecommendation onBackClick={handleBack} />
        
        {/* 검색어 표시 섹션 */}
        <div className="search-query-section">
          {/* 소진희망재료 검색인 경우 */}
          {searchType === 'ingredient' && (
            <>
              <div className="search-type-label">선택된 재료(최소 3개 필요)</div>
              <div className="ingredients-tags-container">
                {displayIngredients.map((ingredient, index) => (
                  <IngredientTag
                    key={index}
                    ingredient={ingredient}
                    index={index}
                    showRemoveButton={false}
                  />
                ))}
              </div>
            </>
          )}
          
          {/* 키워드 검색인 경우 */}
          {searchType === 'keyword' && (
            <>
              <div className="search-type-label">검색어</div>
              <div className="search-keyword-display">
                <span className="search-keyword">
                  {displayIngredients.map(ing => typeof ing === 'string' ? ing : ing.name).join(', ')}
                </span>
              </div>
            </>
          )}
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

             {/* 검색어 표시 섹션 */}
       <div className="search-query-section">
          {/* 소진희망재료 검색인 경우 */}
          {searchType === 'ingredient' && (
            <>
              <div className="search-type-label">선택된 재료(최소 3개 필요)</div>
              <div className="ingredients-tags-container">
                {displayIngredients.map((ingredient, index) => (
                  <IngredientTag
                    key={index}
                    ingredient={ingredient}
                    index={index}
                    showRemoveButton={false}
                  />
                ))}
              </div>
            </>
          )}
          
          {/* 키워드 검색인 경우 */}
          {searchType === 'keyword' && (
            <>
              <div className="search-keyword-display">
                <span className="search-keyword">
                  {displayIngredients.map(ing => typeof ing === 'string' ? ing : ing.name).join(', ')}
                </span>
                <span className="recommendation-text">를 사용한 레시피를 추천드려요</span>
              </div>
            </>
          )}
       </div>



             {/* 레시피 목록 */}
       <main className="recipe-list">
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
                 cooking_name: recipe[2], // API 스펙에 맞게 추가
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
             
               // 캐시된 재료 정보 가져오기
              const cachedIngredients = recipeIngredientsCache.get(recipeObj.recipe_id || recipeObj.id);
              const finalUsedIngredients = recipeObj.used_ingredients || cachedIngredients?.used_ingredients || [];
              const finalTotalIngredients = recipeObj.summary?.total_ingredients || recipeObj.total_ingredients_count || cachedIngredients?.total_ingredients || finalUsedIngredients.length;

              // 재료 소진 검색에서만 matched-ingredients 표시를 위한 계산
              let actualMatchedCount = 0;
              if (searchType === 'ingredient' && typeof recipeObj.matched_ingredient_count === 'number') {
                actualMatchedCount = recipeObj.matched_ingredient_count;
              }
             
                           return (
                <div key={recipeObj.recipe_id || recipeObj.id || idx} 
                     className={`recipe-card ${searchType === 'keyword' ? 'keyword-search-card' : 'ingredient-search-card'}`} 
                     onClick={() => handleRecipeClick(recipeObj)}>
                 <div className="recipe-image">
                   <img src={getRecipeImageSrc(recipeObj, idx)} alt={recipeObj.recipe_title || recipeObj.name || '레시피'} onError={(e)=>{ e.currentTarget.src = fallbackImg; }} />
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
                    
                    {/* matched-ingredients 표시 - 재료 소진 검색에서만 표시 */}
                    {searchType === 'ingredient' && typeof recipeObj.matched_ingredient_count === 'number' && (
                      <div className="matched-ingredients">
                        <span className="matched-count">{actualMatchedCount}개 재료 일치</span>
                        <span className="separator"> | </span>
                        <span className="total-ingredients">재료 총 {finalTotalIngredients}개</span>
                      </div>
                    )}
                    
                                         {/* 사용되는 재료 목록 표시 - 소진 희망 재료 검색에서만 표시 */}
                     {searchType === 'ingredient' && Array.isArray(recipeObj.used_ingredients) && recipeObj.used_ingredients.length > 0 && (
                       <div className="used-ingredients-list">
                         {recipeObj.used_ingredients.slice(0, 3).map((ingredient, idx) => (
                           <span key={idx} className="used-ingredient-item">
                             {ingredient.material_name} {ingredient.measure_amount}{ingredient.measure_unit}
                           </span>
                         ))}
                         {recipeObj.used_ingredients.length > 3 && (
                           <span className="more-ingredients">외 {recipeObj.used_ingredients.length - 3}개</span>
                         )}
                       </div>
                     )}
                     
                     {/* 키워드 검색 결과에만 레시피 설명 표시 */}
                     {searchType === 'keyword' && recipeObj.cooking_introduction && (
                       <p className="recipe-description">{recipeObj.cooking_introduction}</p>
                     )}
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

      {/* 하단 네비게이션 */}
      <BottomNav />
      
      {/* 모달 컴포넌트 */}
      <ModalManager
        {...modalState}
        onClose={handleModalClose}
      />
    </div>
  );
};

export default RecipeResult; 