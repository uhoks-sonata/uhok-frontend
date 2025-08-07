import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/product_card.css';

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
      className={`product-card ${isSpecial ? 'special' : ''}`} 
      style={{ ...style, cursor: 'pointer' }}
      onClick={handleKokCardClick}
    >
      <div className="product-image-container">
        <img src={image} alt={name} className="product-image" />
      </div>
      <div className="product-info">
        <div className="price-info">
          <span className="discount-rate">{discountRate}%</span>
          <span className="discount-price">{discountPrice.toLocaleString()}</span>
        </div>
        <h3 className="product-name">{name}</h3>
        {(type === 'default' || type === 'special' || type === 'grid' || type === 'fixed' || type === 'non-duplicated-grid') && (
          <div className="rating-info">
            <span className="stars">★ {rating.toFixed(1)}</span>
            <span className="review-count">({reviewCount})</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default KokProductCard;
