import React from 'react';
import '../styles/product_card.css';

const ProductCard = ({ product, type = 'default' }) => {
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

  return (
    <div className={`product-card ${isSpecial ? 'special' : ''}`}>
      <div className="product-image-container">
        <img src={image} alt={name} className="product-image" />
      </div>
      <div className="product-info">
        <h3 className="product-name">{name}</h3>
        {(type === 'default' || type === 'special' || type === 'grid' || type === 'fixed') && (
          <>
            <div className="price-info">
              <span className="discount-rate">{discountRate}%</span>
              <span className="discount-price">{discountPrice.toLocaleString()}원</span>
            </div>
            <div className="rating-info">
              <span className="stars">★ {rating}</span>
              <span className="review-count">({reviewCount})</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ProductCard; 