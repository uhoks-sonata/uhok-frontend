import React, { useState } from "react";
import "../styles/header_nav.css";

// 1. 홈쇼핑 관련 인터페이스 - 알림 기능
export const HomeShoppingHeader = ({ searchQuery, setSearchQuery, onSearch }) => {
  const [notificationCount, setNotificationCount] = useState(3);

  const handleSearch = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchQuery);
    }
  };

  return (
    <div className="header home-shopping-header">
      <div className="search-container">
        <input
          type="text"
          placeholder="상품 검색"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch(e)}
          className="search-input"
        />
        <button className="search-btn" onClick={handleSearch}>🔍</button>
      </div>
      
      <div className="header-icons">
        <button className="notification-btn">
          🔔
          {notificationCount > 0 && (
            <span className="notification-count">{notificationCount}</span>
          )}
        </button>
      </div>
    </div>
  );
};

// 2. 찜, 콕쇼핑몰 관련 인터페이스 - 알림/장바구니 기능
export const ShoppingHeader = ({ searchQuery, setSearchQuery, onSearch }) => {
  const [notificationCount, setNotificationCount] = useState(2);
  const [cartCount, setCartCount] = useState(5);

  const handleSearch = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchQuery);
    }
  };

  return (
    <div className="header shopping-header">
      <div className="search-container">
        <input
          type="text"
          placeholder="상품 검색"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch(e)}
          className="search-input"
        />
        <button className="search-btn" onClick={handleSearch}>🔍</button>
      </div>
      
      <div className="header-icons">
        <button className="notification-btn">
          🔔
          {notificationCount > 0 && (
            <span className="notification-count">{notificationCount}</span>
          )}
        </button>
        <button className="cart-btn">
          🛒
          {cartCount > 0 && (
            <span className="cart-count">{cartCount}</span>
          )}
        </button>
      </div>
    </div>
  );
};

// 3. 결제, 알림, 검색 인터페이스 - 현재 인터페이스 정보
export const SimpleHeader = ({ title, onBack }) => {
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      window.history.back();
    }
  };

  return (
    <div className="header simple-header">
      <button className="back-btn" onClick={handleBack}>←</button>
      <h1 className="header-title">{title}</h1>
      <div className="header-spacer"></div>
    </div>
  );
};

// 4. 마이페이지 인터페이스 - 알림/장바구니 기능
export const MyPageHeader = () => {
  const [notificationCount, setNotificationCount] = useState(1);
  const [cartCount, setCartCount] = useState(3);

  return (
    <div className="header mypage-header">
      <h1 className="header-title">마이페이지</h1>
      
      <div className="header-icons">
        <button className="notification-btn">
          🔔
          {notificationCount > 0 && (
            <span className="notification-count">{notificationCount}</span>
          )}
        </button>
        <button className="cart-btn">
          🛒
          {cartCount > 0 && (
            <span className="cart-count">{cartCount}</span>
          )}
        </button>
      </div>
    </div>
  );
};

// 5. 레시피 상세, 결과 인터페이스 - 현재 인터페이스 정보
export const RecipeHeader = ({ onBack }) => {
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      window.history.back();
    }
  };

  return (
    <div className="header recipe-header">
      <button className="back-btn" onClick={handleBack}>←</button>
      <h1 className="header-title">레시피 추천</h1>
      <div className="header-spacer"></div>
    </div>
  );
}; 