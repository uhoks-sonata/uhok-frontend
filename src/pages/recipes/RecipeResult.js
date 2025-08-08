import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import BottomNav from '../../layout/BottomNav';
import '../../styles/recipe_result.css';

const RecipeResult = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // URL 파라미터에서 선택된 재료들을 가져옴
  const searchParams = new URLSearchParams(location.search);
  const ingredients = searchParams.get('ingredients') ? JSON.parse(searchParams.get('ingredients')) : [];

  // 임시 레시피 데이터
  const recipes = [
    {
      id: 1,
      name: "에그 포테이토 샌드위치",
      image: "https://via.placeholder.com/120x120/FFE4B5/000000?text=Sandwich",
      rating: 5.0,
      reviewCount: 2,
      scrapCount: 5,
      description: "아무도 모르게 다가온 이별에 대면했을 때 또다시 혼자가 되는 게 두려워 외면했었네 꿈에도 그리던 ...",
      ownedIngredients: 3,
      totalIngredients: 8
    },
    {
      id: 2,
      name: "감자 볶음",
      image: "https://via.placeholder.com/120x120/FFB6C1/000000?text=Potato",
      rating: 5.0,
      reviewCount: 2,
      scrapCount: 5,
      description: "아무도 모르게 다가온 이별에 대면했을 때 또다시 혼자가 되는 게 두려워 외면했었네 꿈에도 그리던 ...",
      ownedIngredients: 3,
      totalIngredients: 8
    },
    {
      id: 3,
      name: "비빔 라면",
      image: "https://via.placeholder.com/120x120/FFA07A/000000?text=Ramen",
      rating: 5.0,
      reviewCount: 2,
      scrapCount: 5,
      description: "아무도 모르게 다가온 이별에 대면했을 때 또다시 혼자가 되는 게 두려워 외면했었네 꿈에도 그리던 ...",
      ownedIngredients: 3,
      totalIngredients: 8
    },
    {
      id: 4,
      name: "카레",
      image: "https://via.placeholder.com/120x120/FFD700/000000?text=Curry",
      rating: 5.0,
      reviewCount: 2,
      scrapCount: 5,
      description: "아무도 모르게 다가온 이별에 대면했을 때 또다시 혼자가 되는 게 두려워 외면했었네 꿈에도 그리던 ...",
      ownedIngredients: 3,
      totalIngredients: 8
    }
  ];

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

      {/* 선택된 재료 태그들 */}
      <div className="selected-ingredients-section">
        <div className="ingredients-tags">
          {ingredients.map((ingredient, index) => (
            <div key={index} className="ingredient-tag">
              <span className="ingredient-name">{ingredient}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 레시피 목록 */}
      <main className="recipe-list">
        {recipes.map((recipe) => (
          <div key={recipe.id} className="recipe-card" onClick={() => handleRecipeClick(recipe.id)}>
            <div className="recipe-image">
              <img src={recipe.image} alt={recipe.name} />
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

