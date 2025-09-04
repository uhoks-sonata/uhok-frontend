import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { recipeApi } from '../api/recipeApi';
import '../styles/ingredient_product_recommendation.css';
import kokLogo from '../assets/kokshoppingmall_logo.png';
import { getLogoByHomeshoppingId } from './homeshoppingLogo';

const IngredientProductRecommendation = ({ ingredientName, ingredientAmount, ingredientUnit }) => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 컴포넌트가 마운트될 때 바로 상품 정보를 가져옴
  useEffect(() => {
    fetchProductRecommendations();
  }, [ingredientName]);

  const fetchProductRecommendations = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await recipeApi.getProductRecommendations(ingredientName);
      setProducts(data.recommendations || []);
    } catch (err) {
      console.error(`${ingredientName} 상품 추천 조회 실패:`, err);
      setError('상품 정보를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 상품 클릭 시 상세페이지로 이동하는 핸들러
  const handleProductClick = (product) => {
    console.log('🔍 상품 클릭:', product);
    
    // source에 따라 다른 상세페이지로 이동
    if (product.source === 'kok' || product.source === '콕') {
      // 콕 상품 상세페이지로 이동
      if (product.id) {
        navigate(`/kok/product/${product.id}`);
        console.log('✅ 콕 상품 상세페이지로 이동:', product.id);
      } else {
        console.warn('⚠️ 콕 상품 ID가 없습니다:', product);
      }
    } else if (product.source === 'homeshopping' || product.source === '홈쇼핑') {
      // 홈쇼핑 상품 상세페이지로 이동 - id를 우선 사용
      if (product.id) {
        navigate(`/homeshopping/product/${product.id}`);
        console.log('✅ 홈쇼핑 상품 상세페이지로 이동 (id 사용):', product.id);
        console.log('🔍 상품 정보:', {
          id: product.id,
          homeshopping_id: product.homeshopping_id,
          name: product.name,
          source: product.source
        });
      } else if (product.homeshopping_id) {
        // id가 없는 경우 homeshopping_id 사용 (fallback)
        navigate(`/homeshopping/product/${product.homeshopping_id}`);
        console.log('✅ 홈쇼핑 상품 상세페이지로 이동 (homeshopping_id 사용):', product.homeshopping_id);
      } else {
        console.warn('⚠️ 홈쇼핑 상품 ID가 없습니다:', product);
      }
    } else {
      console.warn('⚠️ 알 수 없는 상품 소스:', product.source);
    }
  };

  return (
    <div className="ingredient-recommendation-item">
      {/* 상품 추천 제목 */}
      <h4 className="recommendation-title">
        <span className="bold-text">콕</span>과 <span className="bold-text">홈쇼핑</span>에서는 이런 상품을 구매하실 수 있어요!
        {ingredientUnit && (
          <span className="ingredient-unit-info"> (필요량: {ingredientUnit})</span>
        )}
      </h4>
      
      {/* 상품 추천 목록 */}
      <div className="ingredient-products-section">
        {loading ? (
          <div className="loading-products">상품 정보를 불러오는 중...</div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : !products || products.length === 0 ? (
          <div className="no-products">관련 상품이 없습니다.</div>
        ) : (
          <div className="products-carousel">
            {products.map((product, index) => (
              <div 
                key={index} 
                className="product-card clickable"
                onClick={() => handleProductClick(product)}
                style={{ cursor: 'pointer' }}
              >
                <div className="product-image">
                  <img 
                    src={product.thumb_img_url || product.image_url || '/no-image.png'} 
                    alt={product.name}
                    onError={(e) => {
                      e.currentTarget.src = '/no-image.png';
                    }}
                  />
                </div>
                <div className="product-info">
                  <div className="product-name">
                    {product.name && product.name.length > 30 
                      ? `${product.name.substring(0, 30)}...` 
                      : product.name
                    }
                  </div>
                  <div className="product-price-section">
                    <div className="product-source">
                      {product.source === 'kok' || product.source === '콕' ? (
                        <img 
                          src={kokLogo} 
                          alt="콕 쇼핑몰" 
                          className="source-logo"
                        />
                      ) : product.source === 'homeshopping' || product.source === '홈쇼핑' ? (
                        // 홈쇼핑 ID에 맞는 로고 표시
                        (() => {
                          const homeshoppingInfo = getLogoByHomeshoppingId(product.homeshopping_id);
                          return homeshoppingInfo ? (
                            <img 
                              src={homeshoppingInfo.logo} 
                              alt={homeshoppingInfo.name} 
                              className="source-logo"
                            />
                          ) : (
                            <span className="source-text">{product.source}</span>
                          );
                        })()
                      ) : (
                        <span className="source-text">{product.source}</span>
                      )}
                    </div>
                    {product.kok_discount_rate && product.kok_discount_rate > 0 && (
                      <span className="discount-rate">{product.kok_discount_rate}%</span>
                    )}
                    <div className="product-price">
                      {product.price?.toLocaleString()}원
                    </div>
                  </div>
                  {/* 리뷰 정보 (콕 상품인 경우에만 표시) */}
                  {(product.source === 'kok' || product.source === '콕') && (
                    <div className="product-review-info">
                      <span className="review-score">
                        ★ {product.kok_review_score !== null ? product.kok_review_score.toFixed(1) : '0.0'}
                      </span>
                      <span className="review-count">
                        {product.kok_review_cnt !== null ? `(${product.kok_review_cnt.toLocaleString()}개)` : '(리뷰 없음)'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default IngredientProductRecommendation;
