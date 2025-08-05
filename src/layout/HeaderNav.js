// React 관련 라이브러리 import
import React, { useState, createContext, useContext } from "react";
// 헤더 스타일 CSS 파일 import
import "../styles/header_nav.css";
// 검색 아이콘 이미지 import
import searchIcon from "../assets/search_icon.png";
// 알림 아이콘 이미지 import
import bellIcon from "../assets/bell_icon.png";
// 장바구니 아이콘 이미지 import
import bucketIcon from "../assets/bucket_icon.png";

// ===== 전역 상태 관리 컨텍스트 =====
// 알림 및 장바구니 상태를 전역적으로 관리하기 위한 React Context 생성
const NotificationContext = createContext();

// ===== 전역 상태 제공자 컴포넌트 =====
// 앱 전체에서 알림 개수와 장바구니 개수를 공유할 수 있도록 하는 Provider
export const NotificationProvider = ({ children }) => {
  // 알림 개수 상태 관리 (초기값: 0)
  const [notificationCount, setNotificationCount] = useState(0);
  // 장바구니 개수 상태 관리 (초기값: 0)
  const [cartCount, setCartCount] = useState(0);

  // 알림 추가 함수: 현재 알림 개수에 1을 더함
  const addNotification = () => {
    setNotificationCount(prev => prev + 1);
  };

  // 알림 초기화 함수: 알림 개수를 0으로 리셋
  const clearNotifications = () => {
    setNotificationCount(0);
  };

  // 장바구니 추가 함수: 현재 장바구니 개수에 1을 더함
  const addToCart = () => {
    setCartCount(prev => prev + 1);
  };

  // 장바구니 초기화 함수: 장바구니 개수를 0으로 리셋
  const clearCart = () => {
    setCartCount(0);
  };

  // Context Provider로 감싸서 전역 상태를 하위 컴포넌트들에게 제공
  return (
    <NotificationContext.Provider value={{
      notificationCount,    // 현재 알림 개수
      cartCount,           // 현재 장바구니 개수
      addNotification,     // 알림 추가 함수
      clearNotifications,  // 알림 초기화 함수
      addToCart,          // 장바구니 추가 함수
      clearCart           // 장바구니 초기화 함수
    }}>
      {children} {/* 하위 컴포넌트들을 감싸는 children */}
    </NotificationContext.Provider>
  );
};

// ===== 커스텀 훅 =====
// 전역 상태를 쉽게 사용할 수 있도록 하는 커스텀 훅
export const useNotifications = () => {
  // useContext를 사용하여 NotificationContext의 값을 가져옴
  const context = useContext(NotificationContext);
  // Context가 존재하지 않으면 에러 발생 (Provider 밖에서 사용했을 때)
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context; // 전역 상태와 함수들을 반환
};

// ===== 1. 홈쇼핑 헤더 컴포넌트 =====
// 홈쇼핑 메인 페이지에서 사용하는 헤더 (검색 + 알림 기능)
export const HomeShoppingHeader = ({ searchQuery, setSearchQuery, onSearch, onNotificationClick }) => {
  // 전역 알림 상태 가져오기
  const { notificationCount } = useNotifications();
  // 검색 인터페이스 표시 여부 상태 관리
  const [showSearchInterface, setShowSearchInterface] = useState(false);

  // 검색 실행 핸들러 함수
  const handleSearch = (e) => {
    e.preventDefault(); // 기본 폼 제출 동작 방지
    if (onSearch) {
      onSearch(searchQuery); // 부모 컴포넌트에서 전달받은 검색 함수 실행
    }
  };

  // 검색 아이콘 클릭 시 검색 인터페이스 전환 핸들러
  const handleSearchIconClick = () => {
    setShowSearchInterface(!showSearchInterface); // 검색 인터페이스 토글
    // 여기에 검색 인터페이스 전환 로직 추가
    console.log('검색 인터페이스 전환');
  };

  // 알림 아이콘 클릭 시 알림창 인터페이스 전환 핸들러
  const handleNotificationClick = () => {
    if (onNotificationClick) {
      onNotificationClick(); // 부모 컴포넌트에서 전달받은 알림 클릭 함수 실행
    }
    // 여기에 알림창 인터페이스 전환 로직 추가
    console.log('알림창 인터페이스 전환');
  };

  // 홈쇼핑 헤더 JSX 반환
  return (
    <div className="header home-shopping-header">
      {/* 검색 컨테이너 영역 */}
      <div className="search-container">
        {/* 검색 입력 필드 */}
        <input
          type="text"
          placeholder="홈쇼핑 검색" // 검색창 안내 텍스트
          value={searchQuery} // 현재 검색어 상태
          onChange={(e) => setSearchQuery(e.target.value)} // 검색어 변경 시 상태 업데이트
          onKeyPress={(e) => e.key === 'Enter' && handleSearch(e)} // 엔터키 입력 시 검색 실행
          className="search-input" // 검색 입력 필드 스타일 클래스
        />
        {/* 검색 버튼 */}
        <button className="search-btn" onClick={handleSearchIconClick}>
          <img src={searchIcon} alt="검색" className="search-icon" />
        </button>
      </div>
      
      {/* 헤더 우측 아이콘 영역 */}
      <div className="header-icons">
        {/* 알림 버튼 */}
        <button className="notification-btn" onClick={handleNotificationClick}>
          <img src={bellIcon} alt="알림" className="bell-icon" />
          {/* 알림 개수가 0보다 클 때만 알림 개수 표시 */}
          {notificationCount > 0 && (
            <span className="notification-count">{notificationCount}</span>
          )}
        </button>
      </div>
    </div>
  );
};

// ===== 2. 쇼핑 헤더 컴포넌트 =====
// 찜/콕쇼핑몰 상품 상세 페이지에서 사용하는 헤더 (뒤로가기 + 검색 + 알림 + 장바구니 기능)
export const ShoppingHeader = ({ searchQuery, setSearchQuery, onSearch, onNotificationClick, onCartClick, onBack }) => {
  // 전역 알림 및 장바구니 상태 가져오기
  const { notificationCount, cartCount } = useNotifications();

  // 뒤로가기 버튼 클릭 핸들러
  const handleBack = () => {
    if (onBack) {
      onBack(); // 부모 컴포넌트에서 전달받은 뒤로가기 함수 실행
    } else {
      window.history.back(); // 브라우저 히스토리 뒤로가기
    }
  };

  // 검색 실행 핸들러 함수
  const handleSearch = (e) => {
    e.preventDefault(); // 기본 폼 제출 동작 방지
    if (onSearch) {
      onSearch(searchQuery); // 부모 컴포넌트에서 전달받은 검색 함수 실행
    }
  };

  // 알림 아이콘 클릭 핸들러
  const handleNotificationClick = () => {
    if (onNotificationClick) {
      onNotificationClick(); // 부모 컴포넌트에서 전달받은 알림 클릭 함수 실행
    }
    console.log('알림창 인터페이스 전환');
  };

  // 장바구니 아이콘 클릭 핸들러
  const handleCartClick = () => {
    if (onCartClick) {
      onCartClick(); // 부모 컴포넌트에서 전달받은 장바구니 클릭 함수 실행
    }
    console.log('장바구니 인터페이스 전환');
  };

  // 쇼핑 헤더 JSX 반환
  return (
    <div className="header shopping-product-header">
      {/* 뒤로가기 버튼 */}
      <button className="back-btn" onClick={handleBack}>←</button>
      {/* 검색 컨테이너 영역 */}
      <div className="search-container">
        {/* 검색 입력 필드 */}
        <input
          type="text"
          placeholder="상품 검색" // 검색창 안내 텍스트
          value={searchQuery} // 현재 검색어 상태
          onChange={(e) => setSearchQuery(e.target.value)} // 검색어 변경 시 상태 업데이트
          onKeyPress={(e) => e.key === 'Enter' && handleSearch(e)} // 엔터키 입력 시 검색 실행
          className="search-input" // 검색 입력 필드 스타일 클래스
        />
        {/* 검색 버튼 */}
        <button className="search-btn" onClick={handleSearch}>
          <img src={searchIcon} alt="검색" className="search-icon" />
        </button>
      </div>
      
      {/* 헤더 우측 아이콘 영역 */}
      <div className="header-icons">
        {/* 알림 버튼 */}
        <button className="notification-btn" onClick={handleNotificationClick}>
          <img src={bellIcon} alt="알림" className="bell-icon" />
          {/* 알림 개수가 0보다 클 때만 알림 개수 표시 */}
          {notificationCount > 0 && (
            <span className="notification-count">{notificationCount}</span>
          )}
        </button>
        {/* 장바구니 버튼 */}
        <button className="cart-btn" onClick={handleCartClick}>
          <img src={bucketIcon} alt="장바구니" className="bucket-icon" />
          {/* 장바구니 개수가 0보다 클 때만 장바구니 개수 표시 */}
          {cartCount > 0 && (
            <span className="cart-count">{cartCount}</span>
          )}
        </button>
      </div>
    </div>
  );
};

// ===== 3. 검색 헤더 컴포넌트 =====
// 검색 전용 페이지에서 사용하는 헤더 (뒤로가기 + 검색창)
export const SearchHeader = ({ searchQuery, setSearchQuery, onSearch, onBack }) => {
  // 뒤로가기 버튼 클릭 핸들러
  const handleBack = () => {
    if (onBack) {
      onBack(); // 부모 컴포넌트에서 전달받은 뒤로가기 함수 실행
    } else {
      window.history.back(); // 브라우저 히스토리 뒤로가기
    }
  };

  // 검색 실행 핸들러 함수
  const handleSearch = (e) => {
    e.preventDefault(); // 기본 폼 제출 동작 방지
    if (onSearch) {
      onSearch(searchQuery); // 부모 컴포넌트에서 전달받은 검색 함수 실행
    }
  };

  // 검색 헤더 JSX 반환
  return (
    <div className="header search-header">
      {/* 뒤로가기 버튼 */}
      <button className="back-btn" onClick={handleBack}>←</button>
      {/* 검색 컨테이너 영역 */}
      <div className="search-container">
        {/* 검색 입력 필드 */}
        <input
          type="text"
          placeholder="홈쇼핑/콕 검색" // 검색창 안내 텍스트
          value={searchQuery} // 현재 검색어 상태
          onChange={(e) => setSearchQuery(e.target.value)} // 검색어 변경 시 상태 업데이트
          onKeyPress={(e) => e.key === 'Enter' && handleSearch(e)} // 엔터키 입력 시 검색 실행
          className="search-input" // 검색 입력 필드 스타일 클래스
        />
        {/* 검색 버튼 */}
        <button className="search-btn" onClick={handleSearch}>
          <img src={searchIcon} alt="검색" className="search-icon" />
        </button>
      </div>
    </div>
  );
};

// ===== 4. 마이페이지 헤더 컴포넌트 =====
// 마이페이지에서 사용하는 헤더 (제목 + 알림 + 장바구니 기능)
export const MyPageHeader = () => {
  // 전역 알림 및 장바구니 상태 가져오기
  const { notificationCount, cartCount } = useNotifications();

  // 마이페이지 헤더 JSX 반환
  return (
    <div className="header mypage-header">
      {/* 페이지 제목 */}
      <h1 className="header-title">마이페이지</h1>
      
      {/* 헤더 우측 아이콘 영역 */}
      <div className="header-icons">
        {/* 알림 버튼 */}
        <button className="notification-btn">
          <img src={bellIcon} alt="알림" className="bell-icon" />
          {/* 알림 개수가 0보다 클 때만 알림 개수 표시 */}
          {notificationCount > 0 && (
            <span className="notification-count">{notificationCount}</span>
          )}
        </button>
        {/* 장바구니 버튼 */}
        <button className="cart-btn">
          <img src={bucketIcon} alt="장바구니" className="bucket-icon" />
          {/* 장바구니 개수가 0보다 클 때만 장바구니 개수 표시 */}
          {cartCount > 0 && (
            <span className="cart-count">{cartCount}</span>
          )}
        </button>
      </div>
    </div>
  );
};

// ===== 5. 레시피 헤더 컴포넌트 =====
// 레시피 상세/결과 페이지에서 사용하는 헤더 (뒤로가기 + 제목)
export const RecipeHeader = ({ onBack }) => {
  // 뒤로가기 버튼 클릭 핸들러
  const handleBack = () => {
    if (onBack) {
      onBack(); // 부모 컴포넌트에서 전달받은 뒤로가기 함수 실행
    } else {
      window.history.back(); // 브라우저 히스토리 뒤로가기
    }
  };

  // 레시피 헤더 JSX 반환
  return (
    <div className="header recipe-header">
      {/* 뒤로가기 버튼 */}
      <button className="back-btn" onClick={handleBack}>←</button>
      {/* 페이지 제목 */}
      <h1 className="header-title">레시피 추천</h1>
      {/* 우측 여백을 위한 빈 div */}
      <div className="header-spacer"></div>
    </div>
  );
};

 