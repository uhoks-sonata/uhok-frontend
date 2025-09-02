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
          console.log('🔍 재료 상태 API 응답 데이터:', statusData);
          
          // 소진 희망 재료 검색에서 온 경우, API 응답과 초기 설정을 병합
          if (location.state?.searchType === 'ingredient' && location.state?.ingredients) {
            const resultIngredients = location.state.ingredients;
            
            // API 응답의 재료 상태를 수정하여 소진 희망 재료들을 보유로 설정
            if (statusData.ingredients_status) {
              const { owned = [], cart = [], not_owned = [] } = statusData.ingredients_status;
              
              // 소진 희망 재료들을 보유 목록에 추가
              recipeData.materials.forEach(material => {
                const isOwned = resultIngredients.some(ing => {
                  let inputIngredientName = '';
                  
                  if (typeof ing === 'string') {
                    inputIngredientName = ing.toLowerCase().trim();
                  } else if (ing?.name) {
                    inputIngredientName = ing.name.toLowerCase().trim();
                  }
                  
                  const materialName = material.material_name.toLowerCase().trim();
                  
                  // 정확한 매칭 로직
                  if (inputIngredientName === materialName) return true;
                  
                  const normalizedInput = inputIngredientName.replace(/\s+/g, '');
                  const normalizedMaterial = materialName.replace(/\s+/g, '');
                  
                  if (normalizedInput === normalizedMaterial) return true;
                  
                  if (normalizedInput.length > normalizedMaterial.length) {
                    return normalizedInput.includes(normalizedMaterial);
                  } else {
                    return normalizedMaterial.includes(normalizedInput);
                  }
                });

                if (isOwned) {
                  // 이미 owned에 없으면 추가
                  if (!owned.some(item => item.material_name === material.material_name)) {
                    owned.push({ material_name: material.material_name });
                  }
                  // not_owned에서 제거
                  const notOwnedIndex = not_owned.findIndex(item => item.material_name === material.material_name);
                  if (notOwnedIndex !== -1) {
                    not_owned.splice(notOwnedIndex, 1);
                  }
                }
              });
              
              // summary 업데이트
              statusData.summary = {
                total_ingredients: recipeData.materials.length,
                owned_count: owned.length,
                cart_count: cart.length,
                not_owned_count: not_owned.length
              };
              
              console.log('🔍 소진 희망 재료 반영된 재료 상태:', statusData);
            }
          }
          
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

  // RecipeResult에서 전달받은 재료 정보로 초기 재료 상태 설정
  useEffect(() => {
    if (location.state?.ingredients && recipe?.materials) {
      // RecipeResult에서 전달받은 재료 목록
      const resultIngredients = location.state.ingredients;
      
      console.log('🔍 RecipeDetail에서 받은 재료 정보:', {
        resultIngredients,
        recipeMaterials: recipe.materials,
        searchType: location.state?.searchType
      });
      
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

      // 소진 희망 재료 검색에서만 입력한 재료들을 보유 상태로 설정
      if (location.state?.searchType === 'ingredient') {
        console.log('🔍 소진 희망 재료 검색 - 재료 매칭 시작');
        console.log('입력된 재료들:', resultIngredients);
        console.log('레시피 재료들:', recipe.materials.map(m => m.material_name));
        
        recipe.materials.forEach(material => {
          console.log(`\n🔍 재료 매칭 중: ${material.material_name}`);
          
          const isOwned = resultIngredients.some((ing, index) => {
            let inputIngredientName = '';
            
            if (typeof ing === 'string') {
              // 문자열인 경우 직접 사용
              inputIngredientName = ing.toLowerCase().trim();
              console.log(`  - 입력 재료[${index}] (문자열): "${inputIngredientName}"`);
            } else if (ing?.name) {
              // 객체인 경우 name 속성 사용
              inputIngredientName = ing.name.toLowerCase().trim();
              console.log(`  - 입력 재료[${index}] (객체): "${inputIngredientName}"`);
            } else {
              console.log(`  - 입력 재료[${index}] (알 수 없는 타입):`, ing);
              return false;
            }
            
            const materialName = material.material_name.toLowerCase().trim();
            console.log(`  - 레시피 재료: "${materialName}"`);
            
            // 정확한 매칭 로직
            // 1. 완전 일치
            if (inputIngredientName === materialName) {
              console.log(`  ✅ 완전 일치!`);
              return true;
            }
            
            // 2. 부분 일치 (공백 제거 후)
            const normalizedInput = inputIngredientName.replace(/\s+/g, '');
            const normalizedMaterial = materialName.replace(/\s+/g, '');
            
            if (normalizedInput === normalizedMaterial) {
              console.log(`  ✅ 정규화 후 일치!`);
              return true;
            }
            
            // 3. 포함 관계 (더 긴 문자열이 더 짧은 문자열을 포함)
            if (normalizedInput.length > normalizedMaterial.length) {
              const includes = normalizedInput.includes(normalizedMaterial);
              console.log(`  - 포함 검사 (입력이 더 김): ${includes}`);
              return includes;
            } else {
              const includes = normalizedMaterial.includes(normalizedInput);
              console.log(`  - 포함 검사 (재료가 더 김): ${includes}`);
              return includes;
            }
          });

          if (isOwned) {
            initialStatus.ingredients_status.owned.push({ material_name: material.material_name });
            initialStatus.summary.owned_count++;
            initialStatus.summary.not_owned_count--;
            console.log(`✅ 보유 재료로 설정: ${material.material_name}`);
          } else {
            initialStatus.ingredients_status.not_owned.push({ material_name: material.material_name });
            console.log(`❌ 미보유 재료: ${material.material_name}`);
          }
        });
      } else {
        // 키워드 검색의 경우 모든 재료를 미보유로 설정
        console.log('🔍 키워드 검색 - 모든 재료를 미보유로 설정');
        recipe.materials.forEach(material => {
          initialStatus.ingredients_status.not_owned.push({ material_name: material.material_name });
        });
      }

      console.log('🔍 초기 재료 상태 설정:', initialStatus);

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
                      break;
                    case 'cart':
                      statusText = '장바구니';
                      break;
                    case 'not_owned':
                    default:
                      statusText = '미보유';
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
