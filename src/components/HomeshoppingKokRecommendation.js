import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/homeshopping_kokrecommendation.css';
import kokLogo from '../assets/kokshoppingmall_logo.png';

const HomeshoppingKokRecommendation = ({ kokRecommendations, onKokProductClick }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();

  // 디버깅을 위한 로그 추가
  console.log('🔍 HomeshoppingKokRecommendation 렌더링:', {
    kokRecommendations,
    length: kokRecommendations?.length,
    isExpanded
  });

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
    console.log('🔄 토글 상태 변경:', !isExpanded);
  };

  const handleKokProductClick = (kokProductId) => {
    console.log('🖱️ 콕 상품 클릭:', kokProductId);
    if (onKokProductClick) {
      onKokProductClick(kokProductId);
    } else {
      navigate(`/kok/product/${kokProductId}`);
    }
  };

  // 데이터가 없거나 빈 배열인 경우에도 기본 메시지 표시
  if (!kokRecommendations || kokRecommendations.length === 0) {
    return (
      <div className="homeshopping-kokrecom-container">
        <div className="kokrecom-toggle-section">
          <button 
            className="kokrecom-toggle-button"
            onClick={handleToggle}
          >
            <div className="kok-logo-text-container">
              <img src={kokLogo} alt="콕" className="kok-logo" />
              <span className="toggle-text">에서 비슷한 상품을 팔고 있어요!</span>
            </div>
            <svg 
              className={`toggle-arrow ${isExpanded ? 'expanded' : ''}`}
              width="20" 
              height="20" 
              viewBox="0 0 24 24" 
              fill="none"
            >
              <path 
                d="M7 10L12 15L17 10" 
                stroke="#838383" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
        {isExpanded && (
          <div className="kokrecom-content">
            
            <div className="no-recommendations">
              <p>현재 추천할 콕 상품이 없습니다.</p>
              <p>곧 새로운 추천 상품을 준비하겠습니다.</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="homeshopping-kokrecom-container">
      {/* 토글 버튼 */}
      <div className="kokrecom-toggle-section">
        <button 
          className="kokrecom-toggle-button"
          onClick={handleToggle}
        >
          <div className="kok-logo-text-container">
            <img src={kokLogo} alt="콕" className="kok-logo" />
            <span className="toggle-text">에서 비슷한 상품을 팔고 있어요!</span>
          </div>
          <svg 
            className={`toggle-arrow ${isExpanded ? 'expanded' : ''}`}
            width="20" 
            height="20" 
            viewBox="0 0 24 24" 
            fill="none"
          >
            <path 
              d="M7 10L12 15L17 10" 
              stroke="#838383" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      {/* 콕 상품 추천 목록 */}
      {isExpanded && (
        <div className="kokrecom-content">

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
                      console.log('❌ 콕 상품 이미지 로드 실패:', product.kok_thumbnail);
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
