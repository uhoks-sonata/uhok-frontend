import React from 'react';
import '../styles/header_nav_RecipeDetail.css';

const HeaderNavRecipeDetail = ({ onBackClick }) => {
  return (
    <div className="recipe-detail-header">
      <div className="header-left">
        <button className="back-button" onClick={onBackClick}>
          ←
        </button>
      </div>
      
      <div className="header-center">
        <h1 className="header-title">레시피 상세</h1>
      </div>
      
      <div className="header-right">
        <button className="notification-btn">
          🔔
        </button>
        <button className="cart-btn">
          🛒
          <span className="cart-badge">1</span>
        </button>
      </div>
    </div>
  );
};

export default HeaderNavRecipeDetail;
