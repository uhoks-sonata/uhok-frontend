import React from 'react';
import { useNavigate } from 'react-router-dom';
import HeaderNavBackBtn from '../components/HeaderNavBackBtn';
import HeaderNavIconBell from '../components/HeaderNavIconBell';
import HeaderNavIconBucket from '../components/HeaderNavIconBucket';
import '../styles/header_nav_RecipeDetail.css';

const HeaderNavRecipeDetail = ({ 
  onBackClick, 
  notificationCount = 0, 
  cartItemCount = 0,
  onNotificationClick,
  onCartClick 
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBackClick) {
      onBackClick();
    } else {
      navigate(-1);
    }
  };

  const handleNotificationClick = () => {
    if (onNotificationClick) {
      onNotificationClick();
    } else {
      navigate('/notifications');
    }
  };

  const handleCartClick = () => {
    if (onCartClick) {
      onCartClick();
    } else {
      navigate('/cart');
    }
  };

  return (
    <div className="recipe-detail-header">
      <div className="header-left">
        <HeaderNavBackBtn 
          onClick={handleBack}
          ariaLabel="뒤로 가기"
          size={24}
          strokeWidth={2}
        />
      </div>
      
      <div className="header-center">
        <h1 className="header-title">레시피 상세</h1>
      </div>
      
      <div className="header-right">
        <div className="notification-container">
          <HeaderNavIconBell 
            onClick={handleNotificationClick}
            ariaLabel={`알림 ${notificationCount}개`}
            size={24}
            strokeWidth={1.8}
          />
          {notificationCount > 0 && (
            <span className="notification-badge">{notificationCount}</span>
          )}
        </div>
        
        <div className="cart-container">
          <HeaderNavIconBucket 
            onClick={handleCartClick}
            ariaLabel={`장바구니 ${cartItemCount}개`}
            size={24}
            strokeWidth={1.5}
          />
          {cartItemCount > 0 && (
            <span className="cart-badge">{cartItemCount}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default HeaderNavRecipeDetail;
