import React from 'react';
import { useNavigate } from 'react-router-dom';
import HeaderNavFrame from './HeaderNavFrame';
import '../styles/header_nav_KokMain.css';
import HeaderNavIconBell from '../components/HeaderNavIconBell';
import HeaderNavBackBtn from '../components/HeaderNavBackBtn';
import HeaderNavIconBucket from '../components/HeaderNavIconBucket';
import HeaderSearchBar from '../components/HeaderSearchBar';

// 메인 페이지 전용 Header Nav (내용만 구성, 틀은 HeaderNavFrame 사용)
// - 내부 구성: 좌측(뒤로가기), 중앙(검색창), 우측(알림, 장바구니)
const HeaderNavKokMain = ({ onNotificationsClick, onBackClick, onCartClick, onSearch }) => {
  const navigate = useNavigate();

  const handleBackClick = onBackClick || (() => navigate(-1));
  const handleNotificationsClick = onNotificationsClick || (() => navigate('/notifications'));
  const handleCartClick = onCartClick || (() => navigate('/cart'));
  const handleSearch = onSearch || ((searchTerm) => {
    // 검색 기능 구현 (예: 검색 페이지로 이동)
    navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
  });

  // 검색창 클릭 시 검색 페이지로 이동
  const handleSearchBarClick = () => {
    navigate('/search');
  };

  return (
    <HeaderNavFrame>
      <div className="hn-main-left">
        <HeaderNavBackBtn onClick={handleBackClick} />
      </div>
      <div className="hn-main-center">
        <HeaderSearchBar onSearch={handleSearch} onClick={handleSearchBarClick} />
      </div>
      <div className="hn-main-right">
        <HeaderNavIconBell onClick={handleNotificationsClick} />
        <HeaderNavIconBucket onClick={handleCartClick} />
      </div>
    </HeaderNavFrame>
  );
};

export default HeaderNavKokMain;
