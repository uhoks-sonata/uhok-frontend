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
        
        console.log('소진 희망 재료로 레시피 추천 받기:', selectedIngredients);
        
        // 입력된 재료에 따라 다른 임시 데이터 반환
        const ingredientNames = selectedIngredients.map(ing => ing.name.toLowerCase());
        let tempRecipes = [];
        
        if (ingredientNames.includes('감자')) {
          tempRecipes = [
            {
              recipe_id: 6903507,
              recipe_title: "감자닭볶음탕",
              cooking_name: "탕",
              scrap_count: 221,
              cooking_case_name: "저녁메뉴",
              cooking_category_name: "한식",
              cooking_introduction: "감자와 닭이 푸짐한 매콤한 찜 요리",
              number_of_serving: "4인분",
              thumbnail_url: "https://via.placeholder.com/120x120/FFE4B5/000000?text=감자닭볶음탕",
              recipe_url: "https://www.10000recipe.com/recipe/6903507",
              matched_ingredient_count: 3
            },
            {
              recipe_id: 7754201,
              recipe_title: "감자볶음",
              cooking_name: "볶음",
              scrap_count: 155,
              cooking_case_name: "반찬",
              cooking_category_name: "한식",
              cooking_introduction: "간단하고 맛있는 감자반찬",
              number_of_serving: "2~3인분",
              thumbnail_url: "https://via.placeholder.com/120x120/FFB6C1/000000?text=감자볶음",
              recipe_url: "https://www.10000recipe.com/recipe/7754201",
              matched_ingredient_count: 2
            },
            {
              recipe_id: 1234567,
              recipe_title: "감자카레",
              cooking_name: "카레",
              scrap_count: 89,
              cooking_case_name: "저녁메뉴",
              cooking_category_name: "양식",
              cooking_introduction: "감자를 활용한 맛있는 카레 요리",
              number_of_serving: "3인분",
              thumbnail_url: "https://via.placeholder.com/120x120/FFD700/000000?text=감자카레",
              recipe_url: "https://www.10000recipe.com/recipe/1234567",
              matched_ingredient_count: 1
            }
          ];
        } else if (ingredientNames.includes('닭고기') || ingredientNames.includes('닭')) {
          tempRecipes = [
            {
              recipe_id: 8888888,
              recipe_title: "닭볶음탕",
              cooking_name: "볶음",
              scrap_count: 312,
              cooking_case_name: "저녁메뉴",
              cooking_category_name: "한식",
              cooking_introduction: "매콤달콤한 닭볶음탕",
              number_of_serving: "4인분",
              thumbnail_url: "https://via.placeholder.com/120x120/FF6B6B/000000?text=닭볶음탕",
              recipe_url: "https://www.10000recipe.com/recipe/8888888",
              matched_ingredient_count: 3
            },
            {
              recipe_id: 9999999,
              recipe_title: "닭가슴살 샐러드",
              cooking_name: "샐러드",
              scrap_count: 98,
              cooking_case_name: "점심메뉴",
              cooking_category_name: "양식",
              cooking_introduction: "건강한 닭가슴살 샐러드",
              number_of_serving: "1인분",
              thumbnail_url: "https://via.placeholder.com/120x120/90EE90/000000?text=닭가슴살샐러드",
              recipe_url: "https://www.10000recipe.com/recipe/9999999",
              matched_ingredient_count: 2
            }
          ];
        } else {
          // 기본 레시피들
          tempRecipes = [
            {
              recipe_id: 1111111,
              recipe_title: "재료 활용 요리",
              cooking_name: "볶음",
              scrap_count: 67,
              cooking_case_name: "반찬",
              cooking_category_name: "한식",
              cooking_introduction: "입력하신 재료들을 활용한 맛있는 요리",
              number_of_serving: "2인분",
              thumbnail_url: "https://via.placeholder.com/120x120/FFA500/000000?text=재료활용요리",
              recipe_url: "https://www.10000recipe.com/recipe/1111111",
              matched_ingredient_count: 3
            },
            {
              recipe_id: 2222222,
              recipe_title: "소진 재료 요리",
              cooking_name: "찜",
              scrap_count: 45,
              cooking_case_name: "저녁메뉴",
              cooking_category_name: "한식",
              cooking_introduction: "소진하고 싶은 재료들로 만든 요리",
              number_of_serving: "3인분",
              thumbnail_url: "https://via.placeholder.com/120x120/FF69B4/000000?text=소진재료요리",
              recipe_url: "https://www.10000recipe.com/recipe/2222222",
              matched_ingredient_count: 2
            }
          ];
        }
        
        navigate('/recipes/by-ingredients', { 
          state: { 
            recipes: tempRecipes,
            total: tempRecipes.length + 10, // 임시로 더 많은 결과가 있다고 표시
            page: 1,
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

        {isRecipeActive && (
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
        )}

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

                 {/* 레시피명/식재료명 입력 영역 */}
         {isRecipeActive && (
           <div className="recipe-input-section">
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
