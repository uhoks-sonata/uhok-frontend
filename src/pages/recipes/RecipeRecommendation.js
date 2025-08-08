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
      console.log('레시피명/식재료명 검색 클릭: 활성화');
    }
  };

  const handleRemoveIngredient = (index) => {
    const newIngredients = selectedIngredients.filter((_, i) => i !== index);
    setSelectedIngredients(newIngredients);
  };

  const handleAddIngredient = () => {
    if (ingredientInput.trim()) {
      const newIngredient = quantityInput ? `${ingredientInput} ${quantityInput}${quantityUnit}` : ingredientInput;
      
      // 중복 체크 (재료명만 비교)
      const ingredientName = ingredientInput.trim().toLowerCase();
      const isDuplicate = selectedIngredients.some(ingredient => 
        ingredient.toLowerCase().includes(ingredientName)
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
        
        console.log('소진 희망 재료로 레시피 추천 받기:', selectedIngredients);
        
        // 임시로 API 호출 없이 바로 결과 페이지로 이동
        const ingredientsParam = encodeURIComponent(JSON.stringify(selectedIngredients));
        navigate(`/recipes/by-ingredients?ingredients=${ingredientsParam}`);
        
        // TODO: API 서버 연결 후 아래 코드 활성화
        // const response = await recipeApi.getRecipesByIngredients(selectedIngredients);
        // console.log('API 응답:', response);
        
      } else if (isRecipeActive) {
        if (!recipeInput.trim()) {
          alert('레시피명을 입력해주세요!');
          return;
        }
        
        console.log('레시피명/식재료명으로 레시피 추천 받기:', recipeInput);
        const response = await recipeApi.searchRecipes(recipeInput);
        console.log('API 응답:', response);
        // 여기에 응답 처리 로직 추가 예정
      }
    } catch (error) {
      console.error('API 호출 중 오류 발생:', error);
      alert('레시피 추천을 가져오는 중 오류가 발생했습니다.');
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
                  <span className="ingredient-name">{ingredient}</span>
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
                 />
               </div>
             </div>

                         {/* 분량 입력 필드 */}
             <div className="input-field-container">
               <div className="input-field quantity-input">
                 <img src={searchIcon} alt="검색" className="search-icon" />
                 <input
                   type="text"
                   placeholder="(선택) 식재료의 분량을 입력해주세요"
                   value={quantityInput}
                   onChange={(e) => setQuantityInput(e.target.value)}
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

                 {/* 레시피명/식재료명 입력 영역 */}
         {isRecipeActive && (
           <div className="recipe-input-section">
             <div className="input-field-container">
               <div className="input-field">
                 <img src={searchIcon} alt="검색" className="search-icon" />
                 <input
                   type="text"
                   placeholder="레시피 입력"
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
