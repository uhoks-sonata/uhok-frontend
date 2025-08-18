import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import BottomNav from '../../layout/BottomNav';
import HeaderNavRecipeRecommendation from '../../layout/HeaderNavRecipeRecommendation';
import '../../styles/recipe_result.css';
// 로컬 더미 이미지로 교체 (외부 placeholder 차단/오류 대비)
// import img1 from '../../assets/test/test1.png';
// import img2 from '../../assets/test/test2.png';
// import img3 from '../../assets/test/test3.png';
import fallbackImg from '../../assets/no_items.png';
import bookmarkIcon from '../../assets/bookmark-icon.png';
import { recipeApi } from '../../api/recipeApi';

const RecipeResult = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // 상태 관리
  const [recipes, setRecipes] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  // searchMethod는 더 이상 사용하지 않음 (차감 형식 API 사용)

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


     // 재고 소진용 레시피 추천 (Python 로직과 유사하게 구현)
   const searchRecipes = useCallback(async (page = 1) => {
     try {
       setLoading(true);
       setError('');
       
       if (!ingredients || ingredients.length === 0) {
         setError('검색할 재료를 입력해주세요.');
         setLoading(false);
         return;
       }

       // 재료 정보 정규화
       const normalizedIngredients = ingredients.map(ing => {
         if (typeof ing === 'string') {
           return { name: ing.trim(), amount: 0, unit: 'g' };
         }
         return {
           name: ing?.name?.trim() || '',
           amount: Number(ing?.amount) || 0,
           unit: ing?.unit?.trim() || 'g'
         };
       }).filter(ing => ing.name && ing.amount > 0);

       if (normalizedIngredients.length === 0) {
         setError('유효한 재료를 입력해주세요.');
         setLoading(false);
         return;
       }

       console.log('재고 소진 레시피 추천 시작:', normalizedIngredients);
       
       // 1단계: 모든 재료로 검색하여 레시피 후보 수집
       const allRecipes = new Map(); // recipe_id를 키로 사용
       
       for (const ingredient of normalizedIngredients) {
         try {
           const response = await recipeApi.searchRecipes({
             recipe: ingredient.name,
             method: 'ingredient',
             page: 1,
             size: 20 // 더 많은 레시피 수집
           });
           
           if (response?.recipes && Array.isArray(response.recipes)) {
             response.recipes.forEach(recipe => {
               const recipeId = recipe.RECIPE_ID || recipe.recipe_id;
               if (recipeId && !allRecipes.has(recipeId)) {
                 allRecipes.set(recipeId, {
                   ...recipe,
                   materials: [], // 재료 정보는 나중에 채움
                   score: 0 // 점수는 나중에 계산
                 });
               }
             });
           }
         } catch (err) {
           console.warn(`${ingredient.name} 검색 실패:`, err);
         }
       }

       console.log('수집된 레시피 후보:', allRecipes.size, '개');
       
       // 2단계: 각 레시피의 재료 정보 수집 (상세 정보 API 사용)
       const recipesWithMaterials = [];
       for (const [recipeId, recipe] of allRecipes) {
         try {
           const detailResponse = await recipeApi.getRecipeDetail(recipeId);
           if (detailResponse?.materials && Array.isArray(detailResponse.materials)) {
             const materials = detailResponse.materials.map(material => ({
               name: material.material_name,
               amount: parseFloat(material.measure_amount?.replace(/[^\d.]/g, '')) || 0,
               unit: material.measure_unit || 'g'
             }));
             
             recipesWithMaterials.push({
               ...recipe,
               materials,
               score: 0
             });
           }
         } catch (err) {
           console.warn(`레시피 ${recipeId} 상세 정보 조회 실패:`, err);
         }
       }

       console.log('재료 정보가 있는 레시피:', recipesWithMaterials.length, '개');
       
       // 3단계: Python 로직과 유사한 순차적 레시피 선택
       const recommended = [];
       const remainingStock = new Map();
       normalizedIngredients.forEach(ing => {
         remainingStock.set(ing.name, { amount: ing.amount, unit: ing.unit });
       });

       // 레시피 점수 계산 및 정렬
       const scoredRecipes = recipesWithMaterials.map(recipe => {
         let score = 0;
         let usedIngredients = {};
         
         recipe.materials.forEach(material => {
           const stock = remainingStock.get(material.name);
           if (stock && stock.amount > 0.001) { // 1g 미만은 무시
             const unitMatch = !stock.unit || !material.unit || 
                              stock.unit.toLowerCase() === material.unit.toLowerCase();
             
             if (unitMatch) {
               const usableAmount = Math.min(material.amount, stock.amount);
               if (usableAmount > 0.001) {
                 score += usableAmount; // 사용 가능한 재료량만큼 점수 추가
                 usedIngredients[material.name] = {
                   amount: usableAmount,
                   unit: material.unit
                 };
               }
             }
           }
         });
         
         return {
           ...recipe,
           score,
           usedIngredients,
           usedIngredientCount: Object.keys(usedIngredients).length
         };
       }).filter(recipe => recipe.score > 0)
         .sort((a, b) => {
           // 1순위: 사용하는 재료 개수, 2순위: 점수
           if (a.usedIngredientCount !== b.usedIngredientCount) {
             return b.usedIngredientCount - a.usedIngredientCount;
           }
           return b.score - a.score;
         });

       console.log('점수 계산된 레시피:', scoredRecipes.length, '개');
       
       // 4단계: 순차적으로 레시피 선택 (재고 차감)
       const finalRecipes = [];
       const finalRemainingStock = new Map(remainingStock);
       
       for (const recipe of scoredRecipes) {
         let canUse = true;
         const tempStock = new Map(finalRemainingStock);
         
         // 임시로 재고 차감 시도
         for (const [materialName, usage] of Object.entries(recipe.usedIngredients)) {
           const stock = tempStock.get(materialName);
           if (!stock || stock.amount < usage.amount) {
             canUse = false;
             break;
           }
         }
         
         if (canUse) {
           // 실제 재고 차감
           for (const [materialName, usage] of Object.entries(recipe.usedIngredients)) {
             const stock = finalRemainingStock.get(materialName);
             stock.amount -= usage.amount;
           }
           
           finalRecipes.push({
             ...recipe,
             remainingStock: new Map(finalRemainingStock)
           });
         }
         
         // 최대 5개까지만 추천
         if (finalRecipes.length >= 5) break;
       }

       console.log('최종 추천 레시피:', finalRecipes.length, '개');
       console.log('남은 재고:', Object.fromEntries(finalRemainingStock));
       
       if (finalRecipes.length > 0) {
         setRecipes(finalRecipes);
         setTotal(finalRecipes.length);
         setCurrentPage(1);
       } else {
         setRecipes([]);
         setTotal(0);
         setError('추천 가능한 레시피가 없습니다.');
       }
       
     } catch (err) {
       console.error('재고 소진 레시피 추천 실패:', err);
       setError('레시피 추천에 실패했습니다. 잠시 후 다시 시도해주세요.');
       setRecipes([]);
       setTotal(0);
     } finally {
       setLoading(false);
     }
   }, [ingredients]);

  useEffect(() => {
    if (location.state) {
      console.log('Location state received:', location.state);
      setIngredients(location.state.ingredients || []);
      
      // 재료가 있으면 즉시 검색 시작
      if (location.state.ingredients && location.state.ingredients.length > 0) {
        searchRecipes(1);
      } else {
        setLoading(false);
      }
    } else {
      // state가 없으면 이전 페이지로 이동
      navigate('/recipes');
    }
  }, [location.state, navigate]);

  // searchRecipes 함수가 변경될 때마다 재실행 방지
  useEffect(() => {
    if (ingredients.length > 0) {
      console.log('재료 상태 변경됨, 검색 시작:', ingredients);
      searchRecipes(1);
    }
  }, [ingredients]);

  const handleBack = () => {
    navigate('/recipes');
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
          recipeData: recipe
        }
      });
    }
  };

  const handleLoadMore = () => {
    const nextPage = currentPage + 1;
    console.log('다음 페이지 로드:', nextPage);
    searchRecipes(nextPage);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      const prevPage = currentPage - 1;
      console.log('이전 페이지 로드:', prevPage);
      searchRecipes(prevPage);
    }
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

             {/* 결과 요약 - Python 코드와 유사하게 */}
       <div className="result-summary">
         <h3>🥗 재고 소진용 레시피 추천 결과</h3>
         <p>총 <strong>{total}개</strong>의 레시피를 추천했습니다.</p>
         {recipes.length > 0 && (
           <div className="recommendation-info">
             <p>💡 <strong>추천 기준:</strong> 사용자가 입력한 재료를 최대한 소진할 수 있는 레시피</p>
             <p>📊 <strong>정렬 기준:</strong> 1순위 - 사용하는 재료 개수, 2순위 - 재료 사용량</p>
           </div>
         )}
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
           <>
             {recipes.map((recipe, idx) => {
               console.log('레시피 렌더링:', recipe);
               return (
                 <div key={recipe.RECIPE_ID || recipe.recipe_id || idx} className="recipe-card" onClick={() => handleRecipeClick(recipe)}>
                   {/* Python 코드와 유사한 레이아웃 */}
                   <div className="recipe-header">
                     <h3 className="recipe-name">[{idx + 1}] {recipe.RECIPE_TITLE || recipe.recipe_title}</h3>
                   </div>
                   
                   <div className="recipe-content">
                     <div className="recipe-image">
                       <img 
                         src={recipe.THUMBNAIL_URL || recipe.thumbnail_url || fallbackImg} 
                         alt={recipe.RECIPE_TITLE || recipe.recipe_title || '레시피'} 
                         onError={(e)=>{ e.currentTarget.src = fallbackImg; }} 
                       />
                     </div>
                     
                     <div className="recipe-info">
                       <p className="recipe-description">
                         <strong>소개:</strong> {recipe.COOKING_INTRODUCTION || recipe.cooking_introduction || ''}
                       </p>
                       
                       {/* 사용된 재료 정보 (Python 코드와 동일) */}
                       {recipe.usedIngredients && Object.keys(recipe.usedIngredients).length > 0 && (
                         <div className="used-ingredients">
                           <p><strong>사용된 재료:</strong></p>
                           <ul>
                             {Object.entries(recipe.usedIngredients).map(([ingName, details]) => (
                               <li key={ingName}>
                                 <strong>{ingName}</strong>: {details.amount.toFixed(1)}{details.unit}
                               </li>
                             ))}
                           </ul>
                         </div>
                       )}
                       
                       {/* 레시피 통계 정보 */}
                       <div className="recipe-stats">
                         <span className="serving serving-small">{recipe.NUMBER_OF_SERVING || recipe.number_of_serving}</span>
                         <span className="separator"> | </span>
                         <span className="scrap-count">
                           <img className="bookmark-icon" src={bookmarkIcon} alt="북마크" />
                           <span className="bookmark-count">{recipe.SCRAP_COUNT || recipe.scrap_count || 0}</span>
                         </span>
                       </div>
                       
                       {/* 레시피 태그 */}
                       <div className="recipe-tags">
                         <span className="recipe-tag">{recipe.COOKING_CATEGORY_NAME || recipe.cooking_category_name}</span>
                         <span className="recipe-tag">{recipe.COOKING_CASE_NAME || recipe.cooking_case_name}</span>
                       </div>
                     </div>
                   </div>
                   
                   {/* 구분선 */}
                   <hr className="recipe-divider" />
                 </div>
               );
             })}
           </>
         )}
        {!loading && !error && recipes.length === 0 && (
          <div className="no-results">
            <p>검색 결과가 없습니다.</p>
            <p>다른 재료로 다시 시도해보세요.</p>
          </div>
        )}
      </main>

      {/* 페이지네이션 */}
      {recipes.length > 0 && total > 5 && (
        <div className="pagination-section">
          <div className="pagination-info">
            <span>페이지 {currentPage} / {Math.ceil(total / 5)}</span>
            <span>총 {total}개 중 {((currentPage - 1) * 5) + 1}-{Math.min(currentPage * 5, total)}개</span>
          </div>
          <div className="pagination-buttons">
            {currentPage > 1 && (
              <button className="pagination-btn prev" onClick={handlePreviousPage}>
                이전
              </button>
            )}
            {currentPage < Math.ceil(total / 5) && (
              <button className="load-more-btn" onClick={handleLoadMore}>
                다음
              </button>
            )}
          </div>
        </div>
      )}

      {/* 하단 네비게이션 */}
      <BottomNav />
    </div>
  );
};

export default RecipeResult; 

