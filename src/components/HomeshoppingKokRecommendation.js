import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/homeshopping_kokrecommendation.css';

const HomeshoppingKokRecommendation = ({ kokRecommendations, onKokProductClick }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
  };

  const handleKokProductClick = (kokProductId) => {
    if (onKokProductClick) {
      onKokProductClick(kokProductId);
    } else {
      navigate(`/kok/product/${kokProductId}`);
    }
  };

  if (!kokRecommendations || kokRecommendations.length === 0) {
    return null;
  }

  return (
    <div className="homeshopping-kokrecom-container">
      {/* 토글 버튼 */}
      <div className="kokrecom-toggle-section">
        <button 
          className="kokrecom-toggle-button"
          onClick={handleToggle}
        >
          <span className="toggle-text">콕 상품을 추천드려요</span>
          <span className={`toggle-arrow ${isExpanded ? 'expanded' : ''}`}>
            ▼
          </span>
        </button>
      </div>

      {/* 콕 상품 추천 목록 */}
      {isExpanded && (
        <div className="kokrecom-content">
          <div className="kokrecom-title">
            <h3>추천 콕 상품</h3>
          </div>
          <div className="kokrecom-products">
            {kokRecommendations.map((product, index) => (
              <div 
                key={index} 
                className="kokrecom-product-item"
                onClick={() => handleKokProductClick(product.kok_product_id)}
              >
                <div className="kokrecom-product-image">
                  <img 
                    src={product.kok_thumbnail || '/default-product-image.png'} 
                    alt={product.kok_product_name}
                    onError={(e) => {
                      e.target.src = '/default-product-image.png';
                    }}
                  />
                </div>
                                 <div className="kokrecom-product-info">
                   <div className="kokrecom-product-name">
                     {product.kok_product_name}
                   </div>
                   <div className="kokrecom-product-price">
                     {product.kok_discounted_price?.toLocaleString()}원
                   </div>
                   <div className="kokrecom-product-store">
                     {product.kok_store_name}
                   </div>
                   {product.kok_discount_rate > 0 && (
                     <div className="kokrecom-product-discount">
                       {product.kok_discount_rate}% 할인
                     </div>
                   )}
                 </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default HomeshoppingKokRecommendation;
