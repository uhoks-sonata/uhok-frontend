import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/kok_product_card.css';

const KokProductCard = ({ product, type = 'default', style = {} }) => {
  const navigate = useNavigate();
  const { 
    id, 
    name, 
    originalPrice, 
    discountPrice, 
    discountRate, 
    image, 
    rating, 
    reviewCount,
    isSpecial = false 
  } = product;

  const handleKokCardClick = () => {
    navigate(`/kok/product/${id}`);
  };

  return (
    <div 
      className={`kok-product-card ${isSpecial ? 'special' : ''}`} 
      style={{ ...style, cursor: 'pointer' }}
      onClick={handleKokCardClick}
    >
      <div className="kok-product-image-container">
        <img src={image} alt={name} className="kok-product-image" />
      </div>
      <div className="kok-product-info">
        <div className="kok-price-info">
          <span className="kok-discount-rate">{discountRate}%</span>
          <span className="kok-discount-price">{discountPrice.toLocaleString()}</span>
        </div>
        <h3 className="kok-product-name">{name}</h3>
        {(type === 'default' || type === 'special' || type === 'grid' || type === 'fixed' || type === 'non-duplicated-grid') && (
          <div className="kok-rating-info">
            <span className="kok-stars">★ {rating.toFixed(1)}</span>
            <span className="kok-review-count">({reviewCount})</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default KokProductCard;
