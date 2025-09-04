import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { recipeApi } from '../api/recipeApi';
import '../styles/ingredient_product_recommendation.css';

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
      // 홈쇼핑 상품 상세페이지로 이동
      if (product.homeshopping_id) {
        navigate(`/homeshopping/product/${product.homeshopping_id}`);
        console.log('✅ 홈쇼핑 상품 상세페이지로 이동:', product.homeshopping_id);
      } else if (product.id) {
        // homeshopping_id가 없는 경우 id 사용
        navigate(`/homeshopping/product/${product.id}`);
        console.log('✅ 홈쇼핑 상품 상세페이지로 이동 (id 사용):', product.id);
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
        콕과 홈쇼핑에서는 이런 상품을 구매하실 수 있어요!
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
                    src={product.image_url || '/no-image.png'} 
                    alt={product.name}
                    onError={(e) => {
                      e.currentTarget.src = '/no-image.png';
                    }}
                  />
                </div>
                <div className="product-info">
                  <div className="product-name">{product.name}</div>
                  <div className="product-brand">{product.brand_name}</div>
                  <div className="product-source">{product.source}</div>
                  <div className="product-price">
                    {product.price?.toLocaleString()}원
                  </div>
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
