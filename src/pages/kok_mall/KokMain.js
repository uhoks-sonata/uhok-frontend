import React, { useState, useEffect } from 'react';
import { ShoppingHeader } from '../../layout/HeaderNav';
import BottomNav from '../../layout/BottomNav';
import '../../styles/kokmain.css';

const KokMain = () => {
  const [fadeIn, setFadeIn] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // 검색 핸들러
  const handleSearch = (query) => {
    console.log('검색어:', query);
    // 여기에 실제 검색 로직을 구현할 수 있습니다
  };

  // 알림 클릭 핸들러
  const handleNotificationClick = () => {
    console.log('알림 클릭됨');
    // 여기에 알림 관련 로직을 구현할 수 있습니다
  };

  // 장바구니 클릭 핸들러
  const handleCartClick = () => {
    console.log('장바구니 클릭됨');
    // 여기에 장바구니 관련 로직을 구현할 수 있습니다
  };

  useEffect(() => {
    setFadeIn(true);
  }, []);

  return (
    <div className={`kok-main ${fadeIn ? 'fade-in' : ''}`}>
      {/* 상단 네비게이션 */}
      <ShoppingHeader 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onSearch={handleSearch}
        onNotificationClick={handleNotificationClick}
        onCartClick={handleCartClick}
      />
      
      {/* 메인 콘텐츠 */}
      <main className="main-content">
        {/* 콘텐츠 영역 */}
        <div className="content-area">
          <h2>콕 쇼핑몰</h2>
          <p>콕 쇼핑몰 콘텐츠가 여기에 표시됩니다.</p>
        </div>
      </main>
      
      {/* 하단 네비게이션 */}
      <BottomNav />
    </div>
  );
};

export default KokMain;