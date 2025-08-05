import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/recommend_recipe.css';
import { RecipeDetailHeader, useNotifications } from '../../layout/HeaderNav';

const RecipeDetailTest = () => {
  const [fadeIn, setFadeIn] = useState(false);
  const { addToCart } = useNotifications();
  const navigate = useNavigate();

  useEffect(() => {
    setFadeIn(true);
  }, []);

  // 뒤로가기 핸들러
  const handleBack = () => {
    navigate('/main');
  };

  // 알림 클릭 핸들러
  const handleNotificationClick = () => {
    console.log('레시피 상세 알림 클릭');
  };

  // 장바구니 클릭 핸들러
  const handleCartClick = () => {
    addToCart();
    console.log('레시피 상세 장바구니 클릭');
  };

  return (
    <div className={`main-page ${fadeIn ? 'fade-in' : ''}`}>
      {/* 레시피 상세 헤더 테스트 */}
      <RecipeDetailHeader 
        onBack={handleBack}
        onNotificationClick={handleNotificationClick}
        onCartClick={handleCartClick}
      />

      <div className="main-container">
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <h2>레시피 상세 페이지</h2>
          <p>레시피 상세 헤더 테스트 중입니다.</p>
          <p>뒤로가기, 알림, 장바구니 버튼을 테스트해보세요.</p>
        </div>
      </div>
    </div>
  );
};

export default RecipeDetailTest; 