import React, { useState, createContext, useContext } from "react";
import "../styles/header_nav.css";
import searchIcon from "../assets/search_icon.png";
import bellIcon from "../assets/bell_icon.png";
import bucketIcon from "../assets/bucket_icon.png";

// 전역 상태 컨텍스트
const NotificationContext = createContext();

// 전역 상태 제공자
export const NotificationProvider = ({ children }) => {
  const [notificationCount, setNotificationCount] = useState(0);
  const [cartCount, setCartCount] = useState(0);

  const addNotification = () => {
    setNotificationCount(prev => prev + 1);
  };

  const clearNotifications = () => {
    setNotificationCount(0);
  };

  const addToCart = () => {
    setCartCount(prev => prev + 1);
  };

  const clearCart = () => {
    setCartCount(0);
  };

  return (
    <NotificationContext.Provider value={{
      notificationCount,
      cartCount,
      addNotification,
      clearNotifications,
      addToCart,
      clearCart
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

// 커스텀 훅
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

// 1. 홈쇼핑 관련 인터페이스 - 알림/검색 기능
export const HomeShoppingHeader = ({ searchQuery, setSearchQuery, onSearch, onNotificationClick }) => {
  const { notificationCount } = useNotifications();
  const [showSearchInterface, setShowSearchInterface] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchQuery);
    }
  };

  // 검색 아이콘 클릭 시 검색 인터페이스 전환
  const handleSearchIconClick = () => {
    setShowSearchInterface(!showSearchInterface);
    // 여기에 검색 인터페이스 전환 로직 추가
    console.log('검색 인터페이스 전환');
  };

  // 알림 아이콘 클릭 시 알림창 인터페이스 전환
  const handleNotificationClick = () => {
    if (onNotificationClick) {
      onNotificationClick();
    }
    // 여기에 알림창 인터페이스 전환 로직 추가
    console.log('알림창 인터페이스 전환');
  };

  return (
    <div className="header home-shopping-header">
      <div className="search-container">
        <input
          type="text"
          placeholder="홈쇼핑 검색"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch(e)}
          className="search-input"
        />
        <button className="search-btn" onClick={handleSearchIconClick}>
          <img src={searchIcon} alt="검색" className="search-icon" />
        </button>
      </div>
      
      <div className="header-icons">
        <button className="notification-btn" onClick={handleNotificationClick}>
          <img src={bellIcon} alt="알림" className="bell-icon" />
          {notificationCount > 0 && (
            <span className="notification-count">{notificationCount}</span>
          )}
        </button>
      </div>
    </div>
  );
};

// 2. 콕쇼핑몰 상품 상세 인터페이스 - 알림/장바구니/뒤로가기 기능
export const ShoppingProductHeader = ({ onBack, onNotificationClick, onCartClick }) => {
  const { notificationCount, cartCount } = useNotifications();
  
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      window.history.back();
    }
  };

  const handleNotificationClick = () => {
    if (onNotificationClick) {
      onNotificationClick();
    }
    console.log('알림창 인터페이스 전환');
  };

  const handleCartClick = () => {
    if (onCartClick) {
      onCartClick();
    }
    console.log('장바구니 인터페이스 전환');
  };

  return (
    <div className="header shopping-header">
      <button className="back-btn" onClick={handleBack}>←</button>
      
      <div className="header-icons">
        <button className="notification-btn" onClick={handleNotificationClick}>
          <img src={bellIcon} alt="알림" className="bell-icon" />
          {notificationCount > 0 && (
            <span className="notification-count">{notificationCount}</span>
          )}
        </button>
        <button className="cart-btn" onClick={handleCartClick}>
          <img src={bucketIcon} alt="장바구니" className="bucket-icon" />
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
  const { notificationCount, cartCount } = useNotifications();

  return (
    <div className="header mypage-header">
      <h1 className="header-title">마이페이지</h1>
      
      <div className="header-icons">
        <button className="notification-btn">
          <img src={bellIcon} alt="알림" className="bell-icon" />
          {notificationCount > 0 && (
            <span className="notification-count">{notificationCount}</span>
          )}
        </button>
        <button className="cart-btn">
          <img src={bucketIcon} alt="장바구니" className="bucket-icon" />
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