import React, { useState, useEffect } from 'react';
import '../../styles/home_shopping_main.css';
import BottomNav from '../../layout/BottomNav';
import { HomeShoppingHeader } from '../../layout/HeaderNav';

const Main = () => {
  const [fadeIn, setFadeIn] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setFadeIn(true);
  }, []);

  const handleSearch = (query) => {
    console.log('검색어:', query);
    // 검색 로직 구현
  };

  const handleNotificationClick = () => {
    console.log('알림창 클릭');
    // 알림창 인터페이스 전환 로직
  };

  return (
    <div className={`main-page ${fadeIn ? 'fade-in' : ''}`}>
      <HomeShoppingHeader 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onSearch={handleSearch}
        onNotificationClick={handleNotificationClick}
      />
      <div className="main-content">
        <div>홈쇼핑 메인 페이지</div>
      </div>
      <BottomNav />
    </div>
  );
};
export default Main;
