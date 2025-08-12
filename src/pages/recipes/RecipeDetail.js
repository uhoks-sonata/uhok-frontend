import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import BottomNav from '../../layout/BottomNav';
import HeaderNavRecipeDetail from '../../layout/HeaderNavRecipeDetail';
import '../../styles/recipe_detail.css';
import fallbackImg from '../../assets/no_items.png';
import { recipeApi } from '../../api/recipeApi';

const RecipeDetail = () => {
  const navigate = useNavigate();
  const { recipeId } = useParams();
  
  // 상태 관리
  const [recipe, setRecipe] = useState(null);
  const [rating, setRating] = useState(null);
  const [userRating, setUserRating] = useState(0);
  const [kokProducts, setKokProducts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  // 별점 등록
  const handleRatingSubmit = async (newRating) => {
    try {
      const result = await recipeApi.postRecipeRating(recipeId, newRating);
      setUserRating(newRating);
      setRating(result);
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
            <span className="ingredients-info-icon">ⓘ</span>
          </div>
          <p className="ingredients-description">장바구니에 없는 재료는 관련 상품을 추천해드려요</p>
          <div className="ingredients-list">
            {recipe.materials?.map((material, index) => (
              <div key={index} className="ingredient-item">
                <div className="ingredient-info">
                  <span className="ingredient-name">{material.material_name}</span>
                  <span className="ingredient-amount">
                    {material.measure_amount} {material.measure_unit}
                  </span>
                  <span className={`ingredient-status ${index === 0 ? 'owned' : 'not-owned'}`}>
                    {index === 0 ? '보유' : '미보유'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 구분선 */}
        <div className="section-divider"></div>

        {/* 콕 쇼핑몰 상품 추천 */}
        <div className="kok-recommendation-section">
          <h3 className="section-title">콕과 홈쇼핑에서는 이런 상품을 구매하실 수 있어요!</h3>
          <div className="kok-products-carousel">
            {recipe.materials?.slice(0, 4).map((material, index) => {
              const products = kokProducts[material.material_name] || [];
              if (products.length === 0) return null;
              
              return products.slice(0, 1).map((product) => (
                <div key={`${material.material_name}-${index}`} className="kok-product-card">
                  <div className="product-image">
                    <img src={product.kok_thumbnail || fallbackImg} alt={product.kok_product_name} />
                  </div>
                  <div className="product-info">
                    <p className="product-name">{product.kok_product_name}</p>
                    <div className="product-meta">
                      <span className="discount-rate">{product.kok_discount_rate}%</span>
                      <span className="product-price">{product.kok_discounted_price?.toLocaleString()}원</span>
                    </div>
                    <div className="product-rating">
                      <span className="stars">★{product.kok_review_score}</span>
                      <span className="review-count">({product.kok_review_cnt})</span>
                    </div>
                    {product.kok_store_name && (
                      <span className="store-name">{product.kok_store_name}</span>
                    )}
                  </div>
                </div>
              ));
            })}
          </div>
        </div>

        {/* 만드는 방법 섹션 */}
        <div className="instructions-section">
          <h3 className="section-title">만드는 방법</h3>
          <p className="instructions-text">만드는 방법은 '만개의 레시피'에서 확인할 수 있어요</p>
          <button className="instructions-btn" onClick={handleGoToExternalRecipe}>
            만드는 방법 보러 가기
          </button>
        </div>

        {/* 별점 섹션 */}
        <div className="rating-section">
          <h3 className="section-title">별점</h3>
          <div className="rating-display">
            <span className="rating-star">⭐</span>
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
          </div>

          {/* 내 별점 입력 */}
          <div className="my-rating-section">
            <span className="my-rating-label">내 별점:</span>
            <div className="star-input">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  className={`star-btn ${userRating >= star ? 'active' : ''}`}
                  onClick={() => handleRatingSubmit(star)}
                >
                  ⭐
                </button>
              ))}
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
