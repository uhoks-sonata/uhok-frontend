import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import BottomNav from '../../layout/BottomNav';
import HeaderNavRecipeDetail from '../../layout/HeaderNavRecipeDetail';
import '../../styles/recipe_detail.css';
import fallbackImg from '../../assets/no_items.png';
import { recipeApi } from '../../api/recipeApi';

const RecipeDetail = () => {
  const navigate = useNavigate();
  const { recipeId } = useParams();
  const location = useLocation();
  
  // 상태 관리
  const [recipe, setRecipe] = useState(null);
  const [rating, setRating] = useState(null);
  const [userRating, setUserRating] = useState(0);
  const [kokProducts, setKokProducts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDescription, setShowDescription] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [ingredientsStatus, setIngredientsStatus] = useState({
    ingredients_status: {
      owned: [],
      cart: [],
      not_owned: []
    },
    summary: {
      total_ingredients: 0,
      owned_count: 0,
      cart_count: 0,
      not_owned_count: 0
    }
  });

  // 레시피 상세 정보 조회
  useEffect(() => {
    const fetchRecipeDetail = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // 레시피 상세 정보 조회
        const recipeData = await recipeApi.getRecipeDetail(recipeId);
        setRecipe(recipeData);
        
        // 별점 정보 조회
        try {
          const ratingData = await recipeApi.getRecipeRating(recipeId);
          setRating(ratingData);
        } catch (ratingError) {
          console.log('별점 정보 조회 실패:', ratingError);
        }
        
        // 재료 상태 조회
        try {
          const statusData = await recipeApi.getRecipeIngredientStatus(recipeId);
          setIngredientsStatus(statusData);
        } catch (statusError) {
          console.log('재료 상태 조회 실패:', statusError);
          // API 호출 실패 시 기본값 설정
          if (recipeData.materials) {
            const defaultStatus = {
              ingredients_status: {
                owned: [],
                cart: [],
                not_owned: recipeData.materials.map(material => ({ material_name: material.material_name }))
              },
              summary: {
                total_ingredients: recipeData.materials.length,
                owned_count: 0,
                cart_count: 0,
                not_owned_count: recipeData.materials.length
              }
            };
            setIngredientsStatus(defaultStatus);
          }
        }
        
        // 재료별 콕 쇼핑몰 상품 조회
        if (recipeData.materials && recipeData.materials.length > 0) {
          const productsPromises = recipeData.materials.map(async (material) => {
            try {
              const products = await recipeApi.getKokProducts(material.material_name);
              return { materialName: material.material_name, products };
            } catch (error) {
              console.log(`${material.material_name} 상품 조회 실패:`, error);
              return { materialName: material.material_name, products: [] };
            }
          });
          
          const productsResults = await Promise.all(productsPromises);
          const productsMap = {};
          productsResults.forEach(({ materialName, products }) => {
            productsMap[materialName] = products;
          });
          setKokProducts(productsMap);
        }
        
      } catch (err) {
        console.error('레시피 상세 정보 조회 실패:', err);
        setError('레시피 정보를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    if (recipeId) {
      fetchRecipeDetail();
    }
  }, [recipeId]);

  // RecipeResult에서 전달받은 재료 정보로 초기 재료 상태 설정
  useEffect(() => {
    if (location.state?.ingredients && recipe?.materials) {
      // RecipeResult에서 전달받은 재료 목록
      const resultIngredients = location.state.ingredients;
      
      // 초기 재료 상태 설정 (API 응답 전까지 임시로 사용)
      const initialStatus = {
        ingredients_status: {
          owned: [],
          cart: [],
          not_owned: []
        },
        summary: {
          total_ingredients: recipe.materials.length,
          owned_count: 0,
          cart_count: 0,
          not_owned_count: recipe.materials.length
        }
      };

      // RecipeResult에서 보유로 표시되었던 재료들을 owned로 설정
      recipe.materials.forEach(material => {
        const isOwned = resultIngredients.some(ing => {
          if (typeof ing === 'string') {
            return ing.toLowerCase().includes(material.material_name.toLowerCase()) ||
                   material.material_name.toLowerCase().includes(ing.toLowerCase());
          } else if (ing?.name) {
            return ing.name.toLowerCase().includes(material.material_name.toLowerCase()) ||
                   material.material_name.toLowerCase().includes(ing.name.toLowerCase());
          }
          return false;
        });

        if (isOwned) {
          initialStatus.ingredients_status.owned.push({ material_name: material.material_name });
          initialStatus.summary.owned_count++;
          initialStatus.summary.not_owned_count--;
        } else {
          initialStatus.ingredients_status.not_owned.push({ material_name: material.material_name });
        }
      });

      // API 응답이 오기 전까지 임시 상태 사용
      if (!ingredientsStatus || ingredientsStatus.summary.total_ingredients === 0) {
        setIngredientsStatus(initialStatus);
      }
    }
  }, [location.state, recipe]);

  // 별점 선택 (임시)
  const handleStarClick = (star) => {
    setUserRating(star);
  };

  // 별점 등록 (확인 버튼 클릭 시)
  const handleRatingSubmit = async () => {
    if (userRating === 0) {
      alert('별점을 선택해주세요.');
      return;
    }
    
    try {
      const result = await recipeApi.postRecipeRating(recipeId, userRating);
      setRating(result);
      alert('별점이 등록되었습니다.');
    } catch (error) {
      console.error('별점 등록 실패:', error);
      alert('별점 등록에 실패했습니다.');
    }
  };

  // 만개의 레시피로 이동
  const handleGoToExternalRecipe = () => {
    if (recipe?.recipe_url) {
      window.open(recipe.recipe_url, '_blank');
    }
  };

  // 뒤로가기
  const handleBack = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div className="recipe-detail-page">
        <div className="loading">로딩 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="recipe-detail-page">
        <HeaderNavRecipeDetail onBackClick={handleBack} />
        <div className="error-message">
          <p>{error}</p>
          <button onClick={handleBack}>뒤로 가기</button>
        </div>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="recipe-detail-page">
        <HeaderNavRecipeDetail onBackClick={handleBack} />
        <div className="error-message">
          <p>레시피를 찾을 수 없습니다.</p>
          <button onClick={handleBack}>뒤로 가기</button>
        </div>
      </div>
    );
  }

  return (
    <div className="recipe-detail-page">
      {/* 헤더 */}
      <HeaderNavRecipeDetail onBackClick={handleBack} />

      {/* 스크롤 가능한 컨텐츠 영역 */}
      <div className="recipe-content-scrollable">
        {/* 레시피 헤더 */}
        <div className="recipe-header">
          <h1 className="recipe-title">{recipe.recipe_title}</h1>
          <div className="recipe-tags-container">
            <div className="recipe-tags">
              <span className="recipe-tag">{recipe.cooking_category_name}</span>
              <span className="recipe-tag">{recipe.cooking_case_name}</span>
            </div>
            <div className="recipe-bookmark">
              <img className="bookmark-icon" src={require('../../assets/bookmark-icon.png')} alt="북마크" />
              <span className="bookmark-count">{recipe.scrap_count || 15}</span>
            </div>
          </div>
        </div>

        {/* 레시피 이미지 */}
        <div className="recipe-image-section">
          <img 
            src={recipe.thumbnail_url || fallbackImg} 
            alt={recipe.recipe_title} 
            onError={(e) => { e.currentTarget.src = fallbackImg; }}
          />
        </div>

        {/* 레시피 소개 */}
        <div className="recipe-introduction">
          <p>{recipe.cooking_introduction || "새해가 되면 뜨끈한 떡국 한 그릇이 생각나는데요. 오늘은 집에서 간단하게 요리할 수 있는 멸치육수로 끓이는법을 준비했어요."}</p>
        </div>

        {/* 재료 섹션 */}
        <div className="ingredients-section">
          <div className="ingredients-header">
            <h3 className="section-title">재료</h3>
            <span 
              className="ingredients-info-icon" 
              onClick={() => setShowDescription(!showDescription)}
              style={{ cursor: 'pointer' }}
            >
              ⓘ
            </span>
            {showDescription && (
              <p className="ingredients-description">장바구니에 없는 재료는 관련 상품을 추천해드려요</p>
            )}
          </div>
          
          {/* 재료 요약 정보 */}
          {ingredientsStatus?.summary && (
            <div className="ingredients-summary">
              <span className="summary-item">
                총 {ingredientsStatus.summary.total_ingredients || 0}개
              </span>
              <span className="summary-item owned">
                보유 {ingredientsStatus.summary.owned_count || 0}개
              </span>
              <span className="summary-item cart">
                장바구니 {ingredientsStatus.summary.cart_count || 0}개
              </span>
              <span className="summary-item not-owned">
                미보유 {ingredientsStatus.summary.not_owned_count || 0}개
              </span>
            </div>
          )}
          <div className="ingredients-list">
            {recipe.materials?.map((material, index) => {
              // 재료 상태 확인
              let status = 'not-owned';
              let statusText = '미보유';
              
              if (ingredientsStatus && ingredientsStatus.ingredients_status) {
                const { owned = [], cart = [], not_owned = [] } = ingredientsStatus.ingredients_status;
                
                if (owned.some(item => item.material_name === material.material_name)) {
                  status = 'owned';
                  statusText = '보유';
                } else if (cart.some(item => item.material_name === material.material_name)) {
                  status = 'cart';
                  statusText = '장바구니';
                } else if (not_owned.some(item => item.material_name === material.material_name)) {
                  status = 'not-owned';
                  statusText = '미보유';
                }
              }
              
              return (
                <div key={index} className="ingredient-item">
                  <div className="ingredient-info">
                    <div className="ingredient-name-amount">
                      <span className="ingredient-name">{material.material_name}</span>
                      <span className="ingredient-amount">
                        {material.measure_amount} {material.measure_unit}
                      </span>
                    </div>
                    <span className={`ingredient-status ${status}`}>
                      {statusText}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 구분선 */}
        <div className="section-divider"></div>



        {/* 만드는 방법 섹션 */}
        <div className="instructions-section">
          <div className="instructions-header">
            <h3 className="section-title">만드는 방법</h3>
            <span 
              className="instructions-info-icon"
              onClick={() => setShowInstructions(!showInstructions)}
            >
              ⓘ
            </span>
            {showInstructions && (
              <span className="instructions-description">만드는 방법은 '만개의 레시피'에서 확인할 수 있어요</span>
            )}
          </div>
          <button className="instruction-main-btn" onClick={handleGoToExternalRecipe}>
            만드는 방법 보러가기
          </button>
        </div>

        {/* 별점 섹션 */}
        <div className="rating-section">
          <h3 className="section-title">별점</h3>
          <div className="rating-container">
            <div className="rating-display">
              <img className="rating-star" src={require('../../assets/rating_start.png')} alt="별점" />
              <span className="rating-score">{rating?.rating || 4.4}</span>
            </div>
            
            {/* 별점 분포 그래프 */}
            <div className="rating-distribution">
            <div className="rating-bar">
              <span className="rating-label">5점</span>
              <div className="rating-bar-bg">
                <div className="rating-bar-fill" style={{width: '80%'}}></div>
              </div>
            </div>
            <div className="rating-bar">
              <span className="rating-label">4점</span>
              <div className="rating-bar-bg">
                <div className="rating-bar-fill" style={{width: '0%'}}></div>
              </div>
            </div>
            <div className="rating-bar">
              <span className="rating-label">3점</span>
              <div className="rating-bar-bg">
                <div className="rating-bar-fill" style={{width: '0%'}}></div>
              </div>
            </div>
            <div className="rating-bar">
              <span className="rating-label">2점</span>
              <div className="rating-bar-bg">
                <div className="rating-bar-fill" style={{width: '0%'}}></div>
              </div>
            </div>
            <div className="rating-bar">
              <span className="rating-label">1점</span>
              <div className="rating-bar-bg">
                <div className="rating-bar-fill" style={{width: '0%'}}></div>
              </div>
            </div>
          </div>
          </div>

          {/* 내 별점 입력 */}
          <div className="my-rating-section">
            <div className="rating-input-row">
              <span className="my-rating-label">내 별점:</span>
                             <div className="star-input">
                 {[1, 2, 3, 4, 5].map((star) => (
                   <button
                     key={star}
                     className={`star-btn ${userRating >= star ? 'active' : ''}`}
                     onClick={() => handleStarClick(star)}
                   >
                     ★
                   </button>
                 ))}
               </div>
              <button 
                className="rating-submit-btn"
                onClick={handleRatingSubmit}
                disabled={userRating === 0}
              >
                확인
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 하단 네비게이션 */}
      <BottomNav />
    </div>
  );
};

export default RecipeDetail;
