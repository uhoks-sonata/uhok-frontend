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
  
  // URL 파라미터에서 선택된 재료들을 가져옴 (location.search를 기반으로 메모이즈)
  const ingredients = useMemo(() => {
    try {
      const sp = new URLSearchParams(location.search);
      return sp.get('ingredients') ? JSON.parse(sp.get('ingredients')) : [];
    } catch (e) {
      return [];
    }
  }, [location.search]);

  // "재료명 [수량+단위]" 형식에서 재료명만 추출 (백엔드 amount/unit 없이도 동작)
  const ingredientNames = useMemo(() => {
    return ingredients.map((raw) => {
      const trimmed = String(raw).trim();
      const spaceIdx = trimmed.indexOf(' ');
      return spaceIdx > 0 ? trimmed.slice(0, spaceIdx) : trimmed;
    });
  }, [ingredients]);

  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const searchParamsMemo = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const keywordResult = useMemo(() => {
    try {
      const raw = searchParamsMemo.get('keywordResult');
      return raw ? JSON.parse(decodeURIComponent(raw)) : null;
    } catch (e) {
      return null;
    }
  }, [searchParamsMemo]);

  useEffect(() => {
    let isCancelled = false;
    const controller = new AbortController();

    const fetchRecipes = async () => {
      // 키워드 검색 결과가 전달된 경우 즉시 반영
      if (keywordResult?.mode === 'keyword' && Array.isArray(keywordResult?.result?.recipes)) {
        const mappedFromKeyword = (keywordResult.result.recipes || []).map((r, idx) => ({
          id: r.recipe_id ?? idx + 1,
          name: r.cooking_name ?? r.recipe_title ?? '레시피',
          image: r.thumbnail_url || (idx % 3 === 0 ? img1 : idx % 3 === 1 ? img2 : img3),
          rating: 0,
          reviewCount: 0,
          scrapCount: r.scrap_count ?? 0,
          description: r.cooking_introduction ?? '',
          ownedIngredients: 0,
          totalIngredients: 0,
        }));
        setRecipes(mappedFromKeyword);
        setError(keywordResult.timeout ? '검색 요청이 지연되어 일부 결과가 표시되지 않을 수 있습니다.' : '');
        return;
      }

      // 키워드 검색 타임아웃/504 시 안내만 표시
      if (keywordResult?.timeout) {
        setError('검색 요청이 지연되고 있습니다. 잠시 후 다시 시도해주세요.');
        setRecipes([]);
        return;
      }

      if (!ingredientNames || ingredientNames.length < 3) return;
      setLoading(true);
      setError('');
      try {
        const { recipes: serverRecipes } = await recipeApi.getRecipesByIngredients({
          ingredient: ingredientNames,
          page: 1,
          size: 8,
          signal: controller.signal,
        });

        if (isCancelled) return;
        // 서버 응답을 화면 모델로 매핑
        const mapped = (serverRecipes || []).map((r, idx) => {
          const id = r.recipe_id ?? r.RECIPE_ID ?? idx + 1;
          const name = r.cooking_name ?? r.COOKING_NAME ?? r.recipe_title ?? '레시피';
          const scrapCount = r.scrap_count ?? r.SCRAP_COUNT ?? 0;
          const matched = r.matched_ingredient_count ?? r.MATCHED_INGREDIENT_COUNT ?? undefined;
          const image = r.thumbnail_url ?? r.thumbnail ?? r.THUMBNAIL_URL ?? r.THUMBNAIL ?? null;
          return {
            id,
            name,
            image: image || (idx % 3 === 0 ? img1 : idx % 3 === 1 ? img2 : img3),
            rating: 0,
            reviewCount: 0,
            scrapCount,
            description: r.description ?? r.DESCRIPTION ?? '',
            ownedIngredients: matched ?? 0,
            totalIngredients: r.total_ingredients ?? r.TOTAL_INGREDIENTS ?? 0,
          };
        });
        setRecipes(mapped);
      } catch (e) {
        if (isCancelled) return;
        console.error('레시피 조회 실패:', e);
        const isTimeout = e?.code === 'ECONNABORTED' || /timeout/i.test(e?.message || '');
        setError(isTimeout ? '요청이 지연되고 있습니다. 잠시 후 다시 시도해주세요.' : '레시피를 불러오지 못했습니다.');
        // 실패 시 최소한의 더미 표시
        setRecipes([
          { id: 1, name: '임시 레시피', image: img1, rating: 0, reviewCount: 0, scrapCount: 0, description: '', ownedIngredients: 0, totalIngredients: 0 },
        ]);
      } finally {
        if (!isCancelled) setLoading(false);
      }
    };
    fetchRecipes();

    return () => {
      isCancelled = true;
      controller.abort();
    };
  }, [ingredientNames, keywordResult]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleRecipeClick = (recipeId) => {
    console.log('레시피 클릭:', recipeId);
    // 레시피 상세 페이지로 이동
  };

  return (
    <div className="recipe-result-page">
      {/* 헤더 */}
      <header className="recipe-result-header">
        <button className="back-button" onClick={handleBack}>
          ←
        </button>
        <h1 className="recipe-result-title">레시피 추천</h1>
      </header>

      {/* 선택된 재료 태그들 또는 키워드 표시 */}
      <div className="selected-ingredients-section">
        <div className="ingredients-tags">
          {keywordResult?.mode === 'keyword' ? (
            <div className="ingredient-tag">
              <span className="ingredient-name">검색어: {keywordResult.keyword}</span>
            </div>
          ) : (
            ingredients.map((ingredient, index) => (
              <div key={index} className="ingredient-tag">
                <span className="ingredient-name">{ingredient}</span>
              </div>
            ))
          )}
        </div>
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
        {!loading && !error && recipes.map((recipe) => (
          <div key={recipe.id} className="recipe-card" onClick={() => handleRecipeClick(recipe.id)}>
            <div className="recipe-image">
              <img src={recipe.image} alt={recipe.name} onError={(e)=>{ e.currentTarget.src = fallbackImg; }} />
            </div>
            <div className="recipe-info">
              <h3 className="recipe-name">{recipe.name}</h3>
              <div className="recipe-rating">
                <span className="star">★</span>
                <span className="rating">{recipe.rating}</span>
                <span className="review-count">({recipe.reviewCount})</span>
                <span className="scrap-count">스크랩 {recipe.scrapCount}</span>
              </div>
              <p className="recipe-description">{recipe.description}</p>
              <div className="recipe-ingredients">
                <span className="owned-ingredients">{recipe.ownedIngredients}개 재료 보유</span>
                <span className="separator"> | </span>
                <span className="total-ingredients">재료 총 {recipe.totalIngredients}개</span>
              </div>
            </div>
          </div>
        ))}
      </main>

      {/* 하단 네비게이션 */}
      <BottomNav />
    </div>
  );
};

export default RecipeResult;

