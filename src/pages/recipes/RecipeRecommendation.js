import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../../layout/BottomNav';
import { RecipeHeader } from '../../layout/HeaderNav';
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
    if (ingredientInput.trim()) {
      const newIngredient = {
        name: ingredientInput.trim(),
        amount: quantityInput ? parseFloat(quantityInput) : null,
        unit: quantityInput ? quantityUnit : null
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
    }
  };

  const handleGetRecipeRecommendation = async () => {
    try {
      if (isIngredientActive) {
        // 최소 3개 재료 검증
        if (selectedIngredients.length < 3) {
          alert('최소 3개 이상의 재료를 입력해주세요!');
          return;
        }
        
        // 실제 API 호출로 변경
        const ingredient = selectedIngredients.map((i) => i.name);
        const allHaveAmountAndUnit = selectedIngredients.every((i) => i.amount != null && i.unit);
        const amount = allHaveAmountAndUnit ? selectedIngredients.map((i) => String(i.amount)) : undefined;
        const unit = allHaveAmountAndUnit ? selectedIngredients.map((i) => String(i.unit)) : undefined;

        const { recipes, total, page } = await recipeApi.getRecipesByIngredients({
          ingredient,
          amount,
          unit,
          page: 1,
          size: 5,
        });

        navigate('/recipes/by-ingredients', { 
          state: { 
            recipes,
            total,
            page,
            ingredients: selectedIngredients
          }
        });
        
      } else if (isRecipeActive) {
        if (!recipeInput.trim()) {
          alert('레시피명을 입력해주세요!');
          return;
        }
        
        console.log('레시피명/식재료명으로 레시피 추천 받기:', recipeInput, recipeSearchType);
        const method = recipeSearchType === 'ingredient' ? 'ingredient' : 'recipe';
        const { recipes, page, total } = await recipeApi.searchRecipes({ recipe: recipeInput, page: 1, size: 10, method });
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
      const payload = encodeURIComponent(
        JSON.stringify({ mode: 'keyword', keyword: recipeInput, result: { recipes: [], page: 1, total: 0 }, timeout: true })
      );
      navigate(`/recipes/by-ingredients?keywordResult=${payload}`);
    }
  };

  return (
    <div className="recipe-recommendation-page">
      {/* 헤더 */}
      <RecipeHeader 
        onBack={handleBack}
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
                <div key={index} className="ingredient-tag">
                  <span className="ingredient-name">
                    {ingredient.name}
                    {ingredient.amount && ` ${ingredient.amount}${ingredient.unit}`}
                  </span>
                  <button 
                    className="remove-ingredient-btn"
                    onClick={() => handleRemoveIngredient(index)}
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
            <button className="get-recommendation-btn" onClick={handleGetRecipeRecommendation}>
              레시피 추천 받기
            </button>
          </div>
        )}
      </main>

      {/* 하단 네비게이션 */}
      <BottomNav />
    </div>
  );
};

export default RecipeRecommendation;
