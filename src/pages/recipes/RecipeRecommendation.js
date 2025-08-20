import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../../layout/BottomNav';
import HeaderNavRecipeRecommendation from '../../layout/HeaderNavRecipeRecommendation';
import Loading from '../../components/Loading';
import '../../styles/recipe_recommendation.css';
import outOfStockIcon from '../../assets/out_of_stock_icon.png';
import chefIcon from '../../assets/chef_icon.png';
import searchIcon from '../../assets/search_icon.png';
import { recipeApi } from '../../api/recipeApi';

const RecipeRecommendation = () => {
  const navigate = useNavigate();
  const [isIngredientActive, setIsIngredientActive] = useState(false);
  const [isRecipeActive, setIsRecipeActive] = useState(false);
  const [selectedIngredients, setSelectedIngredients] = useState([]);
  const [ingredientInput, setIngredientInput] = useState('');
  const [quantityInput, setQuantityInput] = useState('');
  const [quantityUnit, setQuantityUnit] = useState('g');
  const [recipeInput, setRecipeInput] = useState('');
  const [recipeSearchType, setRecipeSearchType] = useState('name');
  const [isLoading, setIsLoading] = useState(false);
  const hasInitialized = useRef(false); // 중복 실행 방지용 ref

  // 로그인 상태 확인 함수
  const checkLoginStatus = () => {
    const accessToken = localStorage.getItem('access_token');
    return !!accessToken;
  };

  // 페이지 로드 시 로그인 상태 확인 (중복 실행 방지)
  useEffect(() => {
    // 이미 초기화되었으면 리턴
    if (hasInitialized.current) {
      return;
    }
    
    // 초기화 플래그 설정
    hasInitialized.current = true;
    
    const isLoggedIn = checkLoginStatus();
    if (!isLoggedIn) {
      alert('로그인이 필요한 서비스입니다.');
      window.history.back();
      return;
    }
  }, []); // 빈 의존성 배열로 한 번만 실행

  const handleBack = () => {
    navigate(-1);
  };

  const handleIngredientSearch = () => {
    if (isIngredientActive) {
      // 이미 활성화된 상태면 비활성화
      setIsIngredientActive(false);
      console.log('소진 희망 재료 검색 클릭: 비활성화');
    } else {
      // 비활성화된 상태면 활성화하고 다른 버튼은 비활성화
      setIsIngredientActive(true);
      setIsRecipeActive(false);
      console.log('소진 희망 재료 검색 클릭: 활성화');
    }
  };

  const handleRecipeSearch = () => {
    if (isRecipeActive) {
      // 이미 활성화된 상태면 비활성화
      setIsRecipeActive(false);
      console.log('레시피명/식재료명 검색 클릭: 비활성화');
    } else {
      // 비활성화된 상태면 활성화하고 다른 버튼은 비활성화
      setIsRecipeActive(true);
      setIsIngredientActive(false);
      setRecipeSearchType('name');
      console.log('레시피명/식재료명 검색 클릭: 활성화');
    }
  };

  const handleRemoveIngredient = (index) => {
    const newIngredients = selectedIngredients.filter((_, i) => i !== index);
    setSelectedIngredients(newIngredients);
  };

  const handleAddIngredient = () => {
    if (!ingredientInput.trim()) {
      alert('소진하고 싶은 재료명을 입력해주세요!');
      return;
    }
    
    if (!quantityInput.trim()) {
      alert('식재료의 분량을 입력해주세요!');
      return;
    }
    
    const newIngredient = {
      name: ingredientInput.trim(),
      amount: parseFloat(quantityInput),
      unit: quantityUnit
    };
    
    // 중복 체크 (재료명만 비교)
    const ingredientName = ingredientInput.trim().toLowerCase();
    const isDuplicate = selectedIngredients.some(ingredient => 
      ingredient.name.toLowerCase() === ingredientName
    );
    
    if (isDuplicate) {
      alert('이미 추가된 재료입니다!');
      return;
    }
    
    setSelectedIngredients([...selectedIngredients, newIngredient]);
    setIngredientInput('');
    setQuantityInput('');
  };

  const handleGetRecipeRecommendation = async () => {
    try {
      setIsLoading(true); // 로딩 시작
      
      if (isIngredientActive) {
        // 최소 3개 재료 검증
        if (selectedIngredients.length < 3) {
          alert('최소 3개 이상의 재료를 입력해주세요!');
          setIsLoading(false); // 로딩 중단
          return;
        }
        
        // 실제 API 호출로 변경
        const ingredients = selectedIngredients.map((i) => i.name);
        const allHaveAmountAndUnit = selectedIngredients.every((i) => i.amount != null && i.unit);
        const amount = allHaveAmountAndUnit ? selectedIngredients.map((i) => {
          // 숫자를 문자열로 변환하고, 정수인 경우 소수점 제거
          const num = parseFloat(i.amount);
          // 백엔드에서 문자열을 기대하므로 확실하게 문자열로 변환
          return String(Number.isInteger(num) ? Math.floor(num) : num);
        }) : undefined;
        const unit = allHaveAmountAndUnit ? selectedIngredients.map((i) => String(i.unit)) : undefined;

        // API 요청 파라미터 로깅
        const apiParams = {
          ingredients: selectedIngredients, // ingredient 객체 배열 전달
          page: 1,
          size: 5,
        };
        console.log('소진희망재료 API 요청 파라미터:', apiParams);
        console.log('선택된 재료들:', selectedIngredients);
        
        // amount 배열의 각 요소 타입 확인
        if (amount) {
          console.log('Amount 배열 타입 확인:', amount.map((a, i) => ({
            index: i,
            value: a,
            type: typeof a,
            isString: typeof a === 'string'
          })));
        }

        const { recipes, total, page } = await recipeApi.getRecipesByIngredients(apiParams);
        
        console.log('소진희망재료 API 응답:', { recipes, total, page });
        
        // 백엔드 응답 데이터 구조 상세 분석
        if (recipes && recipes.length > 0) {
          console.log('첫 번째 레시피 데이터 구조:', {
            keys: Object.keys(recipes[0]),
            sample: recipes[0],
            hasRecipeId: 'RECIPE_ID' in recipes[0],
            hasRecipeTitle: 'RECIPE_TITLE' in recipes[0],
            hasUsedIngredients: 'used_ingredients' in recipes[0]
          });
        }

        // 백엔드 응답 데이터를 API 명세서 형식에 맞게 변환
        const normalizedRecipes = recipes.map(recipe => ({
          recipe_id: recipe.RECIPE_ID || recipe.recipe_id,
          recipe_title: recipe.RECIPE_TITLE || recipe.COOKING_NAME || recipe.recipe_title || recipe.cooking_name,
          cooking_name: recipe.COOKING_NAME || recipe.cooking_name,
          scrap_count: recipe.SCRAP_COUNT || recipe.scrap_count,
          cooking_case_name: recipe.COOKING_CASE_NAME || recipe.cooking_case_name,
          cooking_category_name: recipe.COOKING_CATEGORY_NAME || recipe.cooking_category_name,
          cooking_introduction: recipe.COOKING_INTRODUCTION || recipe.cooking_introduction,
          number_of_serving: recipe.NUMBER_OF_SERVING || recipe.number_of_serving,
          thumbnail_url: recipe.THUMBNAIL_URL || recipe.thumbnail_url,
          recipe_url: recipe.RECIPE_URL || recipe.recipe_url,
          matched_ingredient_count: recipe.matched_ingredient_count || 0,
          total_ingredients_count: recipe.total_ingredients_count || 0,
          // used_ingredients 필드 추가 (백엔드에서 반환하는 경우)
          used_ingredients: recipe.used_ingredients || []
        }));

        console.log('정규화된 레시피 데이터:', normalizedRecipes);

        navigate('/recipes/result', { 
          state: { 
            recipes: normalizedRecipes,
            total,
            page,
            ingredients: selectedIngredients
          }
        });
        
      } else if (isRecipeActive) {
        if (!recipeInput.trim()) {
          alert('레시피명을 입력해주세요!');
          setIsLoading(false); // 로딩 중단
          return;
        }
        
        console.log('레시피명/식재료명으로 레시피 추천 받기:', recipeInput, recipeSearchType);
        const method = recipeSearchType === 'ingredient' ? 'ingredient' : 'recipe';
                 const { recipes, page, total } = await recipeApi.searchRecipes({ recipe: recipeInput, page: 1, size: 15, method });
        console.log('API 응답:', { recipes, page, total });
        // 결과 페이지로 이동하며 검색결과 전달 (state 기반)
        navigate('/recipes/result', {
          state: {
            recipes,
            total,
            page,
            ingredients: [],
          },
        });
      }
    } catch (error) {
      console.error('API 호출 중 오류 발생:', error);
      // 504/타임아웃 시에도 결과 화면으로 이동해 안내 메시지 표시
      if (isIngredientActive) {
        // 소진희망재료 검색 에러 시 결과페이지로 이동
        navigate('/recipes/result', {
          state: {
            recipes: [],
            total: 0,
            page: 1,
            ingredients: selectedIngredients,
            error: true,
            errorMessage: '검색 중 오류가 발생했습니다. 다시 시도해주세요.'
          }
        });
      } else {
        // 레시피명/식재료명 검색 에러 시 기존 방식으로 이동
        const payload = encodeURIComponent(
          JSON.stringify({ mode: 'keyword', keyword: recipeInput, result: { recipes: [], page: 1, total: 0 }, timeout: true })
        );
        navigate(`/recipes/by-ingredients?keywordResult=${payload}`);
      }
    } finally {
      setIsLoading(false); // 로딩 종료
    }
  };

  return (
    <div className="recipe-recommendation-page">
      <HeaderNavRecipeRecommendation 
        onBackClick={handleBack}
      />

      {/* 메인 컨텐츠 */}
      <main className="recipe-main-content">
        {/* 검색 버튼들 */}
        <div className={`search-buttons-container ${(isIngredientActive || isRecipeActive) ? 'slide-up' : ''}`}>
          <button 
            className={`search-button ingredient-search ${isIngredientActive ? 'active' : ''}`} 
            onClick={handleIngredientSearch}
          >
            <div className="button-content">
              <img src={outOfStockIcon} alt="소진 희망 재료" className="button-icon" />
              <span className="button-text">소진 희망 재료</span>
            </div>
          </button>
          
          <button 
            className={`search-button recipe-search ${isRecipeActive ? 'active' : ''}`} 
            onClick={handleRecipeSearch}
          >
            <div className="button-content">
              <img src={chefIcon} alt="레시피명/식재료명" className="button-icon" />
              <span className="button-text">레시피명/식재료명</span>
            </div>
          </button>
        </div>

        {/* 소진 희망 재료 입력 영역 */}
        {isIngredientActive && (
          <div className="ingredient-input-section">
            <div className="selected-ingredients-label">
              선택된 재료(최소 3개 필요)
            </div>
            
            {/* 선택된 재료 태그들 */}
            <div className="selected-ingredients-tags">
              {selectedIngredients.map((ingredient, index) => (
                <div 
                  key={index} 
                  className="ingredient-tag"
                  id={`ingredient-tag-${index}`}
                >
                  <span className="ingredient-name">
                    {ingredient.name}
                    {ingredient.amount && ` ${ingredient.amount}${ingredient.unit}`}
                  </span>
                  <button 
                    className="remove-ingredient-btn"
                    onClick={() => handleRemoveIngredient(index)}
                    onMouseEnter={() => {
                      // X 버튼에 마우스를 올렸을 때 태그 전체에 효과 적용
                      document.getElementById(`ingredient-tag-${index}`).classList.add('x-button-hover');
                    }}
                    onMouseLeave={() => {
                      // X 버튼에서 마우스가 벗어났을 때 효과 제거
                      document.getElementById(`ingredient-tag-${index}`).classList.remove('x-button-hover');
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            {/* 재료명 입력 필드 */}
            <div className="input-field-container">
              <div className="input-field">
                <img src={searchIcon} alt="검색" className="search-icon" />
                <input
                  type="text"
                  placeholder="소진하고 싶은 재료명을 입력해주세요 (3개 이상)"
                  value={ingredientInput}
                  onChange={(e) => setIngredientInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddIngredient()}
                />
              </div>
            </div>

            {/* 분량 입력 필드 */}
            <div className="input-field-container">
              <div className="input-field quantity-input">
                <img src={searchIcon} alt="검색" className="search-icon" />
                                 <input
                   type="number"
                   placeholder="식재료의 분량을 입력해주세요"
                   value={quantityInput}
                   onChange={(e) => setQuantityInput(e.target.value)}
                   onKeyPress={(e) => e.key === 'Enter' && handleAddIngredient()}
                 />
                <div className="unit-buttons">
                  <button 
                    className={`unit-btn ${quantityUnit === 'g' ? 'active' : ''}`}
                    onClick={() => setQuantityUnit('g')}
                  >
                    g
                  </button>
                  <button 
                    className={`unit-btn ${quantityUnit === '개' ? 'active' : ''}`}
                    onClick={() => setQuantityUnit('개')}
                  >
                    개
                  </button>
                </div>
              </div>
            </div>

            {/* 재료 등록 버튼 */}
            <button className="register-ingredient-btn" onClick={handleAddIngredient}>
              재료 등록
            </button>
          </div>
        )}

        {/* 레시피명/식재료명 입력 영역 (소진 희망 재료 배치 참고) */}
        {isRecipeActive && (
          <div className="recipe-search-section">
            <div className="recipe-search-type">
              <label className="recipe-radio-option">
                <input
                  type="radio"
                  name="recipeSearchType"
                  value="name"
                  checked={recipeSearchType === 'name'}
                  onChange={() => setRecipeSearchType('name')}
                />
                <span>레시피명</span>
              </label>
              <label className="recipe-radio-option">
                <input
                  type="radio"
                  name="recipeSearchType"
                  value="ingredient"
                  checked={recipeSearchType === 'ingredient'}
                  onChange={() => setRecipeSearchType('ingredient')}
                />
                <span>식재료명</span>
              </label>
            </div>
            <div className="input-field-container">
              <div className="input-field">
                <img src={searchIcon} alt="검색" className="search-icon" />
                <input
                  type="text"
                  placeholder={recipeSearchType === 'name' ? '레시피명을 입력해주세요' : '식재료명을 입력해주세요'}
                  value={recipeInput}
                  onChange={(e) => setRecipeInput(e.target.value)}
                />
              </div>
            </div>
          </div>
        )}
        

        {/* 레시피 추천 받기 버튼 */}
        {(isIngredientActive || isRecipeActive) && (
          <div className="recipe-recommendation-section">
            {isLoading ? (
              <Loading message="레시피를 찾고 있어요..." />
            ) : (
              <button className="get-recommendation-btn" onClick={handleGetRecipeRecommendation}>
                레시피 추천 받기
              </button>
            )}
          </div>
        )}
      </main>

      {/* 하단 네비게이션 */}
      <BottomNav />
    </div>
  );
};

export default RecipeRecommendation;
