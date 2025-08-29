import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { homeShoppingApi } from '../../api/homeShoppingApi';
import BottomNav from '../../layout/BottomNav';
import HeaderNavRecipeRecommendation from '../../layout/HeaderNavRecipeRecommendation';
import Loading from '../../components/Loading';
import IngredientTag from '../../components/IngredientTag';
import ModalManager, { showNoRecipeNotification, hideModal } from '../../components/LoadingModal';
import '../../styles/recipe_result.css';
import '../../styles/ingredient-tag.css';
import fallbackImg from '../../assets/no_items.png';
import bookmarkIcon from '../../assets/bookmark-icon.png';

const HomeShoppingRecipeRecommendation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // 상태 관리
  const [recipes, setRecipes] = useState([]);
  const [productInfo, setProductInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalState, setModalState] = useState({ isVisible: false, modalType: 'loading' });
  
  // 컴포넌트 마운트 시 레시피 추천 데이터 가져오기
  useEffect(() => {
    const fetchRecipeRecommendations = async () => {
      try {
        setLoading(true);
        setError('');
        
        // location.state에서 product_id와 product_name 가져오기
        const { product_id, product_name } = location.state || {};
        
        if (!product_id) {
          setError('상품 정보가 없습니다.');
          setLoading(false);
          return;
        }
        
        // 상품 정보 설정
        setProductInfo({ product_id, product_name });
        
        console.log('🔍 홈쇼핑 상품 기반 레시피 추천 API 호출:', { product_id, product_name });
        
        // 레시피 추천 API 호출
        const response = await homeShoppingApi.getRecipeRecommendations(product_id);
        console.log('✅ 레시피 추천 API 응답:', response);
        
        if (response && response.recipes) {
          setRecipes(response.recipes);
          
          // 레시피가 0개인 경우 모달 표시
          if (response.recipes.length === 0) {
            setModalState(showNoRecipeNotification());
          }
        } else {
          setRecipes([]);
          // 레시피가 없는 경우 모달 표시
          setModalState(showNoRecipeNotification());
        }
        
      } catch (error) {
        console.error('❌ 레시피 추천 가져오기 실패:', error);
        setError('레시피 추천을 가져오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchRecipeRecommendations();
  }, [location.state]);
  
  // 레시피 클릭 시 상세 페이지로 이동
  const handleRecipeClick = (recipeId) => {
    navigate(`/recipes/detail/${recipeId}`);
  };
  
  // 뒤로 가기
  const handleBackClick = () => {
    navigate(-1);
  };
  
  // 검색 페이지로 이동
  const handleSearchClick = () => {
    navigate('/recipes/recommendation');
  };
  
  // 모달 닫기 함수
  const closeModal = () => {
    setModalState(hideModal());
    // 모달 닫기 후 이전 페이지로 이동
    navigate(-1);
  };
  
  // 로딩 상태
  if (loading) {
    return (
      <div className="recipe-result-page">
        <HeaderNavRecipeRecommendation 
          onBackClick={handleBackClick}
          onSearchClick={handleSearchClick}
        />
        <div className="loading-container">
          <Loading message="레시피 추천을 불러오는 중..." />
        </div>
      </div>
    );
  }
  
  // 에러 상태
  if (error) {
    return (
      <div className="recipe-result-page">
        <HeaderNavRecipeRecommendation 
          onBackClick={handleBackClick}
          onSearchClick={handleSearchClick}
        />
                 <div className="error-container">
           <h2 className="error-title">레시피 추천을 불러올 수 없습니다</h2>
           <p className="error-message">{error}</p>
           <button className="retry-button" onClick={() => window.location.reload()}>
             다시 시도
           </button>
         </div>
      </div>
    );
  }
  
  return (
    <div className="recipe-result-page">
      {/* 헤더 */}
      <HeaderNavRecipeRecommendation 
        onBackClick={handleBackClick}
        onSearchClick={handleSearchClick}
      />
      
      {/* 상품 정보 섹션 */}
      {productInfo && (
        <div className="product-info-section">
                     <div className="search-keyword-title">
             {productInfo.product_name}으로 만들 수 있는 레시피
           </div>
          <div className="ingredients-tags">
            <IngredientTag 
              ingredient={productInfo.product_name}
              isSelected={true}
              onClick={() => {}}
            />
          </div>
        </div>
      )}
      
      {/* 결과 요약 */}
      <div className="result-summary">
        <span className="result-count">
          총 <strong>{recipes.length}</strong>개의 레시피를 찾았습니다
        </span>
      </div>
      
      {/* 레시피 목록 */}
      <div className="recipe-list-container">
        {recipes.length > 0 ? (
          <div className="recipe-list">
            {recipes.map((recipe, index) => (
              <div 
                key={recipe.recipe_id || index}
                className="recipe-item"
                onClick={() => handleRecipeClick(recipe.recipe_id)}
              >
                {/* 레시피 이미지 */}
                <div className="recipe-image-container">
                  <img 
                    src={recipe.recipe_image_url || fallbackImg}
                    alt={recipe.recipe_name}
                    className="recipe-image"
                    onError={(e) => {
                      e.target.src = fallbackImg;
                    }}
                  />
                </div>
                
                {/* 레시피 정보 */}
                <div className="recipe-info">
                  <h3 className="recipe-name">{recipe.recipe_name}</h3>
                  
                                     {/* 요리 시간과 난이도 */}
                   <div className="recipe-meta">
                     {recipe.cooking_time && (
                       <span className="recipe-time">{recipe.cooking_time}</span>
                     )}
                     {recipe.difficulty && (
                       <span className="recipe-difficulty">{recipe.difficulty}</span>
                     )}
                   </div>
                  
                  {/* 설명 */}
                  {recipe.description && (
                    <p className="recipe-description">{recipe.description}</p>
                  )}
                  
                  {/* 재료 정보 */}
                  {recipe.ingredients && recipe.ingredients.length > 0 && (
                    <div className="recipe-ingredients">
                      <span className="ingredients-label">재료:</span>
                      <div className="ingredients-tags-small">
                        {recipe.ingredients.slice(0, 3).map((ingredient, idx) => (
                          <span key={idx} className="ingredient-tag-small">
                            {ingredient}
                          </span>
                        ))}
                        {recipe.ingredients.length > 3 && (
                          <span className="ingredient-tag-small">
                            +{recipe.ingredients.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                
                {/* 북마크 아이콘 */}
                <div className="recipe-bookmark">
                  <img 
                    src={bookmarkIcon} 
                    alt="북마크" 
                    className="bookmark-icon"
                  />
                </div>
              </div>
            ))}
          </div>
                 ) : (
           <div className="no-recipes-container">
             <h3 className="no-recipes-title">추천 레시피가 없습니다</h3>
             <p className="no-recipes-message">
               이 상품으로 만들 수 있는 레시피를 찾을 수 없습니다.
             </p>
           </div>
         )}
      </div>
      
      {/* 하단 네비게이션 */}
      <BottomNav />
      
      {/* 모달 관리자 */}
      <ModalManager
        {...modalState}
        onClose={closeModal}
      />
    </div>
  );
};

export default HomeShoppingRecipeRecommendation;
