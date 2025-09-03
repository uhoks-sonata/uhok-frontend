import React, { useState, useEffect } from 'react';
import { recipeApi } from '../api/recipeApi';
import '../styles/ingredient_product_recommendation.css';

const IngredientProductRecommendation = ({ ingredientName }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
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

    if (ingredientName) {
      fetchProductRecommendations();
    }
  }, [ingredientName]);

  if (loading) {
    return (
      <div className="ingredient-recommendation">
        <h4 className="ingredient-title">{ingredientName}</h4>
        <div className="loading-products">상품 정보를 불러오는 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ingredient-recommendation">
        <h4 className="ingredient-title">{ingredientName}</h4>
        <div className="error-message">{error}</div>
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="ingredient-recommendation">
        <h4 className="ingredient-title">{ingredientName}</h4>
        <div className="no-products">관련 상품이 없습니다.</div>
      </div>
    );
  }

  return (
    <div className="ingredient-recommendation">
      <h4 className="ingredient-title">{ingredientName}</h4>
      <div className="products-carousel">
        {products.map((product, index) => (
          <div key={index} className="product-card">
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
    </div>
  );
};

export default IngredientProductRecommendation;
