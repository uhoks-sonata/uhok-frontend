import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import BottomNav from '../../layout/BottomNav';
import HeaderNavRecipeDetail from '../../layout/HeaderNavRecipeDetail';
import '../../styles/recipe_detail.css';
import fallbackImg from '../../assets/no_items.png';
import { recipeApi } from '../../api/recipeApi';
// LoadingModal import
import ModalManager, { showAlert, hideModal } from '../../components/LoadingModal';
import IngredientProductRecommendation from '../../components/IngredientProductRecommendation';
import { cartApi } from '../../api/cartApi';

// 장바구니 정보를 재료 상태에 반영하는 함수
const enhanceIngredientStatusWithCart = (statusData, cartIngredients, recipeMaterials) => {
  if (!statusData || !recipeMaterials) {
    return statusData;
  }

  // 재료 상태를 복사하여 수정
  const enhancedStatus = {
    ingredients_status: {
      owned: [...(statusData.ingredients_status?.owned || [])],
      cart: [...(statusData.ingredients_status?.cart || [])],
      not_owned: [...(statusData.ingredients_status?.not_owned || [])]
    },
    summary: { ...statusData.summary }
  };

  // 장바구니에 있는 재료들을 확인하여 상태 업데이트
  recipeMaterials.forEach(material => {
    const materialName = material.material_name;
    
    // 장바구니에 해당 재료가 있는지 확인
    const isInCart = cartIngredients.some(cartItem => {
      const normalizedCartItem = cartItem.toLowerCase().trim().replace(/\s+/g, '');
      const normalizedMaterial = materialName.toLowerCase().trim().replace(/\s+/g, '');
      
      // 정확한 매칭 또는 포함 관계 확인
      return normalizedCartItem === normalizedMaterial || 
             normalizedCartItem.includes(normalizedMaterial) ||
             normalizedMaterial.includes(normalizedCartItem);
    });

    if (isInCart) {
      // 장바구니에 있는 재료를 cart 상태로 이동
      const existingInOwned = enhancedStatus.ingredients_status.owned.find(item => item.material_name === materialName);
      const existingInNotOwned = enhancedStatus.ingredients_status.not_owned.find(item => item.material_name === materialName);
      
      // 기존 상태에서 제거
      if (existingInOwned) {
        enhancedStatus.ingredients_status.owned = enhancedStatus.ingredients_status.owned.filter(item => item.material_name !== materialName);
      }
      if (existingInNotOwned) {
        enhancedStatus.ingredients_status.not_owned = enhancedStatus.ingredients_status.not_owned.filter(item => item.material_name !== materialName);
      }
      
      // cart 상태에 추가 (중복 방지)
      const existingInCart = enhancedStatus.ingredients_status.cart.find(item => item.material_name === materialName);
      if (!existingInCart) {
        enhancedStatus.ingredients_status.cart.push({ material_name: materialName });
      }
      
      console.log(`✅ 장바구니 재료로 상태 변경: ${materialName}`);
    }
  });

  // summary 업데이트
  enhancedStatus.summary = {
    total_ingredients: recipeMaterials.length,
    owned_count: enhancedStatus.ingredients_status.owned.length,
    cart_count: enhancedStatus.ingredients_status.cart.length,
    not_owned_count: enhancedStatus.ingredients_status.not_owned.length
  };

  console.log('🔍 장바구니 정보 반영된 재료 상태:', {
    owned: enhancedStatus.ingredients_status.owned.map(item => item.material_name),
    cart: enhancedStatus.ingredients_status.cart.map(item => item.material_name),
    not_owned: enhancedStatus.ingredients_status.not_owned.map(item => item.material_name),
    summary: enhancedStatus.summary
  });

  return enhancedStatus;
};

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
  
  // ===== 모달 상태 관리 =====
  const [modalState, setModalState] = useState({ isVisible: false });

  // ===== 모달 핸들러 =====
  const handleModalClose = () => {
    setModalState(hideModal());
  };
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
          console.log('🔍 재료 상태 API 응답 데이터:', statusData);
          
          // 장바구니 정보도 함께 조회하여 재료 상태 보완
          let cartIngredients = [];
          try {
            const cartData = await cartApi.getCartItems();
            console.log('🔍 장바구니 데이터:', cartData);
            
            // 장바구니에 담긴 상품들의 재료 정보 추출
            if (cartData && cartData.cart_items) {
              cartIngredients = cartData.cart_items.map(item => item.kok_product_name).filter(Boolean);
              console.log('🔍 장바구니 재료들:', cartIngredients);
            }
          } catch (cartError) {
            console.log('장바구니 조회 실패:', cartError);
          }
          
          // 소진 희망 재료 검색에서 온 경우, API 응답과 초기 설정을 병합
          if (location.state?.searchType === 'ingredient' && location.state?.ingredients) {
            const resultIngredients = location.state.ingredients;
            console.log('🔍 소진 희망 재료 검색 - 재료 매칭 시작');
            console.log('입력된 재료들:', resultIngredients);
            console.log('레시피 재료들:', recipeData.materials.map(m => m.material_name));
            
            // API 응답의 재료 상태를 복사하여 수정 (원본 객체 변경 방지)
            const modifiedStatus = {
              ingredients_status: {
                owned: [...(statusData.ingredients_status?.owned || [])],
                cart: [...(statusData.ingredients_status?.cart || [])],
                not_owned: [...(statusData.ingredients_status?.not_owned || [])]
              },
              summary: { ...statusData.summary }
            };
            
            // 소진 희망 재료들을 보유 목록에 추가
            // 중복된 재료를 제거하기 위해 Set 사용
            const uniqueMaterials = new Set();
            const ownedMaterials = new Set();
            const notOwnedMaterials = new Set();
            
            recipeData.materials.forEach(material => {
              const materialName = material.material_name;
              
              // 중복된 재료는 한 번만 처리
              if (uniqueMaterials.has(materialName)) {
                console.log(`🔄 중복 재료 건너뛰기: ${materialName}`);
                return;
              }
              uniqueMaterials.add(materialName);
              
              const isOwned = resultIngredients.some(ing => {
                let inputIngredientName = '';
                
                if (typeof ing === 'string') {
                  inputIngredientName = ing.toLowerCase().trim();
                } else if (ing?.name) {
                  inputIngredientName = ing.name.toLowerCase().trim();
                } else {
                  return false;
                }
                
                const normalizedInput = inputIngredientName.replace(/\s+/g, '');
                const normalizedMaterial = materialName.toLowerCase().trim();
                
                // 정확한 매칭 로직
                if (inputIngredientName === normalizedMaterial) return true;
                
                const normalizedMaterialNoSpace = normalizedMaterial.replace(/\s+/g, '');
                
                if (normalizedInput === normalizedMaterialNoSpace) return true;
                
                if (normalizedInput.length > normalizedMaterialNoSpace.length) {
                  return normalizedInput.includes(normalizedMaterialNoSpace);
                } else {
                  return normalizedMaterialNoSpace.includes(normalizedInput);
                }
              });

              if (isOwned) {
                console.log(`✅ 보유 재료로 설정: ${materialName}`);
                ownedMaterials.add(materialName);
              } else {
                console.log(`❌ 미보유 재료: ${materialName}`);
                notOwnedMaterials.add(materialName);
              }
            });
            
            // 중복 제거된 재료들을 배열로 변환
            modifiedStatus.ingredients_status.owned = Array.from(ownedMaterials).map(name => ({ material_name: name }));
            modifiedStatus.ingredients_status.not_owned = Array.from(notOwnedMaterials).map(name => ({ material_name: name }));
            
            // summary 업데이트 (중복 제거된 개수로)
            modifiedStatus.summary = {
              total_ingredients: uniqueMaterials.size,
              owned_count: ownedMaterials.size,
              cart_count: 0, // 소진 희망 재료는 모두 보유로 설정되므로 장바구니는 0
              not_owned_count: notOwnedMaterials.size
            };
            
            console.log('🔍 소진 희망 재료 반영된 재료 상태 (중복 제거):', {
              total_unique: uniqueMaterials.size,
              owned: Array.from(ownedMaterials),
              not_owned: Array.from(notOwnedMaterials),
              summary: modifiedStatus.summary
            });
            setIngredientsStatus(modifiedStatus);
          } else {
            // 소진 희망 재료 검색이 아닌 경우 장바구니 정보를 반영하여 재료 상태 업데이트
            const enhancedStatus = enhanceIngredientStatusWithCart(statusData, cartIngredients, recipeData.materials);
            setIngredientsStatus(enhancedStatus);
          }
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
        
        // 재료별 콕 쇼핑몰 상품 조회 (임시 비활성화 - API 명세서에 없음)
        // TODO: 백엔드 개발자에게 올바른 콕 상품 조회 API 엔드포인트 확인 필요
        /*
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
        */
        
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

  // 별점 선택 (임시)
  const handleStarClick = (star) => {
    setUserRating(star);
  };

  // 별점 등록 (확인 버튼 클릭 시)
  const handleRatingSubmit = async () => {
    if (userRating === 0) {
      setModalState(showAlert('별점을 선택해주세요.'));
      return;
    }
    
    try {
      const result = await recipeApi.postRecipeRating(recipeId, userRating);
      setRating(result);
      setModalState(showAlert('별점이 등록되었습니다.'));
    } catch (error) {
      console.error('별점 등록 실패:', error);
      setModalState(showAlert('별점 등록에 실패했습니다.'));
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

  // 재료 클릭 시 상품 추천 토글 (라디오버튼 형식 - 한 번에 하나만 열림)
  const [expandedIngredient, setExpandedIngredient] = useState(null);
  const handleIngredientClick = (ingredientName) => {
    setExpandedIngredient(prev => {
      // 이미 열린 재료를 다시 클릭하면 닫기
      if (prev === ingredientName) {
        return null;
      } else {
        // 새로운 재료를 클릭하면 이전 토글은 닫고 새 토글만 열기
        return ingredientName;
      }
    });
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
          

          <div className="ingredients-list">
            {recipe.materials
              ?.map((material, index) => {
                // 디버깅: material 데이터 구조 확인
                console.log(`🔍 Material ${index}:`, {
                  material_name: material.material_name,
                  measure_amount: material.measure_amount,
                  material_unit: material.material_unit,
                  measure_unit: material.measure_unit,
                  전체데이터: material
                });
                
                // 재료 상태 확인
                let status = 'not-owned';
                let statusText = '미보유';
                let priority = 3; // 정렬 우선순위 (1: 보유, 2: 장바구니, 3: 미보유)
                
                // API 명세서에 따른 새로운 구조 확인
                if (ingredientsStatus && ingredientsStatus.ingredients) {
                  const ingredientData = ingredientsStatus.ingredients.find(
                    item => item.material_name === material.material_name
                  );
                  if (ingredientData) {
                    status = ingredientData.status;
                    switch (ingredientData.status) {
                      case 'owned':
                        statusText = '보유';
                        priority = 1;
                        break;
                      case 'cart':
                        statusText = '장바구니';
                        priority = 2;
                        break;
                      case 'not_owned':
                      default:
                        statusText = '미보유';
                        priority = 3;
                        break;
                    }
                  }
                }
                // 기존 구조도 지원 (하위 호환성)
                else if (ingredientsStatus && ingredientsStatus.ingredients_status) {
                  const { owned = [], cart = [], not_owned = [] } = ingredientsStatus.ingredients_status;
                  
                  if (owned.some(item => item.material_name === material.material_name)) {
                    status = 'owned';
                    statusText = '보유';
                    priority = 1;
                  } else if (cart.some(item => item.material_name === material.material_name)) {
                    status = 'cart';
                    statusText = '장바구니';
                    priority = 2;
                  } else if (not_owned.some(item => item.material_name === material.material_name)) {
                    status = 'not-owned';
                    statusText = '미보유';
                    priority = 3;
                  }
                }
                
                return {
                  material,
                  index,
                  status,
                  statusText,
                  priority
                };
              })
              .sort((a, b) => a.priority - b.priority) // 우선순위에 따라 정렬
              .map(({ material, index, status, statusText }) => (
                <React.Fragment key={index}>
                  <div className="ingredient-item">
                    <div className="ingredient-info">
                      <div className="ingredient-name-amount">
                        {/* 핑크색 밑줄과 핑크색 글씨 부분을 클릭 가능하게 만들기 */}
                        {status === 'not-owned' ? (
                          <div 
                            className="ingredient-clickable-area"
                            onClick={() => handleIngredientClick(material.material_name)}
                            style={{ cursor: 'pointer' }}
                          >
                            <span className={`ingredient-name ${status}`}>{material.material_name}</span>
                          </div>
                        ) : (
                          <div className="ingredient-static-area">
                            <span className={`ingredient-name ${status}`}>{material.material_name}</span>
                          </div>
                        )}
                      </div>
                      {/* 버튼 옆에 수량 표시 */}
                      <span className={`ingredient-amount-next-to-button ${status}`}>
                        {material.measure_amount} {material.material_unit || material.measure_unit || ''}
                      </span>
                      <span 
                        className={`ingredient-status ${status}`}
                        style={{
                          backgroundColor: status === 'owned' ? '#000000' : 
                                          status === 'cart' ? '#000000' : '#FA5F8C',
                          color: '#ffffff',
                          padding: '4px 10px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: '500',
                          minWidth: '80px',
                          textAlign: 'center',
                          display: 'inline-block'
                        }}
                      >
                        {statusText}
                      </span>
                    </div>
                  </div>
                  
                  {/* 미보유 재료일 때만 상품 추천 토글 표시 - 재료 항목들 사이에 배치 */}
                  {status === 'not-owned' && expandedIngredient === material.material_name && (
                    <div className="ingredient-recommendation-toggle">
                      <div className="ingredient-products-section">
                        <IngredientProductRecommendation 
                          ingredientName={material.material_name}
                        />
                      </div>
                    </div>
                  )}
                </React.Fragment>
              ))}
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
      <BottomNav modalState={modalState} setModalState={setModalState} />
      
      {/* 모달 컴포넌트 */}
      <ModalManager
        {...modalState}
        onClose={handleModalClose}
      />
    </div>
  );
};

export default RecipeDetail;
