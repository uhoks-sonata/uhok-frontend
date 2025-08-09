// React 관련 라이브러리 import
import React, { useState, createContext, useContext } from "react";
// React Router의 useNavigate 훅 import
import { useNavigate } from "react-router-dom";
// 헤더 스타일 CSS 파일 import
import "../styles/header_nav.css";
// 검색 아이콘 이미지 import
import searchIcon from "../assets/search_icon.png";
// 알림 아이콘 이미지 import
import bellIcon from "../assets/bell_icon.png";
// 장바구니 아이콘 이미지 import
import bucketIcon from "../assets/bucket_icon.png";
// API 설정을 가져옵니다
import api from "../pages/api";

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
  // 페이지 이동을 위한 navigate 훅
  const navigate = useNavigate();

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
    } else {
      // 기본 동작: 장바구니 페이지로 이동
      navigate('/cart');
    }
    console.log('장바구니 인터페이스 전환');
  };

  // 쇼핑 헤더 JSX 반환
  return (
    <div className="header shopping-product-header">
      {/* 뒤로가기 버튼 (왼쪽) */}
      <button className="back-btn" onClick={handleBack}>←</button>
      
      {/* 검색 컨테이너 영역 (중앙) */}
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

// ===== 4. 범용 헤더 컴포넌트 =====
// 뒤로가기 + 제목 형태의 모든 헤더에서 재사용 가능한 범용 컴포넌트
// 결제, 알림, 레시피 추천 등에서 사용
export const BackTitleHeader = ({ title, onBack, className = "" }) => {
  // 뒤로가기 버튼 클릭 핸들러
  const handleBack = () => {
    if (onBack) {
      onBack(); // 부모 컴포넌트에서 전달받은 뒤로가기 함수 실행
    } else {
      window.history.back(); // 브라우저 히스토리 뒤로가기
    }
  };

  // 범용 헤더 JSX 반환
  return (
    <div className={`header back-title-header ${className}`}>
      {/* 뒤로가기 버튼 */}
      <button className="back-btn" onClick={handleBack}>←</button>
      {/* 페이지 제목 */}
      <h1 className="header-title">{title}</h1>
      {/* 우측 여백을 위한 빈 div */}
      <div className="header-spacer"></div>
    </div>
  );
};

// ===== 5. 마이페이지 헤더 컴포넌트 =====
// 마이페이지에서 사용하는 헤더 (제목 + 알림 + 장바구니 기능)
export const MyPageHeader = ({ onBack }) => {
  // 전역 알림 및 장바구니 상태 가져오기
  const { notificationCount, cartCount } = useNotifications();
  // 페이지 이동을 위한 navigate 훅
  const navigate = useNavigate();

  // 뒤로가기 버튼 클릭 핸들러 (비동기)
  const handleBack = async () => {
    try {
      if (onBack) {
        await onBack(); // 부모 컴포넌트에서 전달받은 뒤로가기 함수 실행 (비동기)
      } else {
        window.history.back(); // 브라우저 히스토리 뒤로가기 (기본 동작)
      }
    } catch (error) {
      console.error('뒤로가기 에러:', error);
      window.history.back();
    }
  };

  // 마이페이지 헤더 JSX 반환
  return (
    <div className="header mypage-header">
      {/* 뒤로가기 버튼 (왼쪽 고정) */}
      <button className="back-btn" onClick={handleBack}>←</button>
      
      {/* 페이지 제목 */}
      <h1 className="header-title">마이페이지</h1>
      
      {/* 헤더 우측 아이콘 영역 */}
      <div className="header-icons">
        {/* 알림 버튼 */}
        <button className="notification-btn" onClick={() => navigate('/notifications')}>
          <img src={bellIcon} alt="알림" className="bell-icon" />
          {/* 알림 개수가 0보다 클 때만 알림 개수 표시 */}
          {notificationCount > 0 && (
            <span className="notification-count">{notificationCount}</span>
          )}
        </button>
        {/* 장바구니 버튼 */}
        <button className="cart-btn" onClick={() => navigate('/cart')}>
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

// ===== 5. 레시피 헤더 컴포넌트 (범용 헤더 사용) =====
// 레시피 추천 페이지에서 사용하는 헤더 (뒤로가기 + 제목)
export const RecipeHeader = ({ onBack }) => {
  return <BackTitleHeader title="레시피 추천" onBack={onBack} className="recipe-header" />;
};

// ===== 6. 결제 헤더 컴포넌트 (범용 헤더 사용) =====
// 결제 페이지에서 사용하는 헤더 (뒤로가기 + '주문 결제'텍스트)
export const PaymentHeader = ({ onBack }) => {
  return <BackTitleHeader title="주문 결제" onBack={onBack} className="payment-header" />;
};

// ===== 7. 알림 헤더 컴포넌트 (범용 헤더 사용) =====
// 알림 페이지에서 사용하는 헤더 (뒤로가기 + '알림'텍스트)
export const NotificationHeader = ({ onBack }) => {
  return <BackTitleHeader title="알림" onBack={onBack} className="notification-header" />;
};

// ===== 8. 범용 헤더 컴포넌트 (뒤로가기 + 제목 + 알림 + 장바구니) =====
// 뒤로가기 + 제목 + 알림 + 장바구니 형태의 모든 헤더에서 재사용 가능한 범용 컴포넌트
// 주문내역, 마이페이지, 레시피 상세 등에서 사용
// 특징: 알림은 카운트 없이 버튼 역할만, 장바구니는 카운트 표시
export const BackTitleWithIconsHeader = ({ title, onBack, onNotificationClick, onCartClick, className = "" }) => {
  // 전역 장바구니 상태만 가져오기 (알림 카운트 제거 - 요구사항에 따라)
  const { cartCount } = useNotifications();
  // 페이지 이동을 위한 navigate 훅
  const navigate = useNavigate();

  // 뒤로가기 버튼 클릭 핸들러 (비동기)
  const handleBack = async () => {
    try {
      if (onBack) {
        await onBack(); // 부모 컴포넌트에서 전달받은 뒤로가기 함수 실행 (비동기)
      } else {
        window.history.back(); // 브라우저 히스토리 뒤로가기 (기본 동작)
      }
    } catch (error) {
      console.error('뒤로가기 에러:', error);
      // 에러가 발생해도 기본 뒤로가기 동작 수행
      window.history.back();
    }
  };

  // 알림 아이콘 클릭 핸들러 (비동기)
  const handleNotificationClick = async () => {
    try {
      if (onNotificationClick) {
        await onNotificationClick(); // 부모 컴포넌트에서 전달받은 알림 클릭 함수 실행 (비동기)
      }
      console.log('알림창 인터페이스 전환');
      
      // 알림 클릭 로그 기록 (비동기 처리)
      await api.post('/api/user/activity-log', {
        action: 'notification_click',
        timestamp: new Date().toISOString()
      }, {
        headers: {
          'Authorization': 'Bearer <access_token>'
        }
      }).catch(() => {
        // 로그 기록 실패는 무시
        console.log('알림 클릭 로그 기록 실패 (무시됨)');
      });
    } catch (error) {
      console.error('알림 클릭 에러:', error);
    }
  };

  // 장바구니 아이콘 클릭 핸들러 (비동기)
  const handleCartClick = async () => {
    try {
      if (onCartClick) {
        await onCartClick(); // 부모 컴포넌트에서 전달받은 장바구니 클릭 함수 실행 (비동기)
      } else {
        // 기본 동작: 장바구니 페이지로 이동
        navigate('/cart');
      }
      console.log('장바구니 인터페이스 전환');
      
      // 장바구니 클릭 로그 기록 (비동기 처리)
      await api.post('/api/user/activity-log', {
        action: 'cart_click',
        timestamp: new Date().toISOString()
      }, {
        headers: {
          'Authorization': 'Bearer <access_token>'
        }
      }).catch(() => {
        // 로그 기록 실패는 무시
        console.log('장바구니 클릭 로그 기록 실패 (무시됨)');
      });
    } catch (error) {
      console.error('장바구니 클릭 에러:', error);
    }
  };

  // 범용 헤더 JSX 반환
  return (
    <div className={`header back-title-with-icons-header ${className}`}>
      {/* 뒤로가기 버튼 (왼쪽 고정) */}
      <button className="back-btn" onClick={handleBack}>←</button>
      {/* 페이지 제목 (중앙 정렬) */}
      <h1 className="header-title">{title}</h1>
      
      {/* 헤더 우측 아이콘 영역 (오른쪽 고정) */}
      <div className="header-icons">
        {/* 알림 버튼 (카운트 없음 - 요구사항에 따라) */}
        <button className="notification-btn" onClick={onNotificationClick || (() => navigate('/notifications'))}>
          <img src={bellIcon} alt="알림" className="bell-icon" />
        </button>
        {/* 장바구니 버튼 (카운트 표시 포함) */}
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

// ===== 9. 주문내역 헤더 컴포넌트 (범용 헤더 사용) =====
// 주문내역 페이지에서 사용하는 헤더 (뒤로가기 + '주문내역'텍스트 + 알림 + 장바구니)
export const OrderHistoryHeader = ({ onBack, onNotificationClick, onCartClick }) => {
  return (
    <BackTitleWithIconsHeader 
      title="주문내역" 
      onBack={onBack} 
      onNotificationClick={onNotificationClick}
      onCartClick={onCartClick}
      className="order-history-header" 
    />
  );
};

// ===== 10. 마이페이지 헤더 컴포넌트 (범용 헤더 사용) =====
// 마이페이지에서 사용하는 헤더 (뒤로가기 + '마이페이지'텍스트 + 알림 + 장바구니)
export const MyPageWithBackHeader = ({ onBack, onNotificationClick, onCartClick }) => {
  return (
    <BackTitleWithIconsHeader 
      title="마이페이지" 
      onBack={onBack} 
      onNotificationClick={onNotificationClick}
      onCartClick={onCartClick}
      className="mypage-with-back-header" 
    />
  );
};

// ===== 11. 레시피 상세 헤더 컴포넌트 (범용 헤더 사용) =====
// 레시피 상세 페이지에서 사용하는 헤더 (뒤로가기 + '레시피 상세'텍스트 + 알림 + 장바구니)
export const RecipeDetailHeader = ({ onBack, onNotificationClick, onCartClick }) => {
  return (
    <BackTitleWithIconsHeader 
      title="레시피 상세" 
      onBack={onBack} 
      onNotificationClick={onNotificationClick}
      onCartClick={onCartClick}
      className="recipe-detail-header" 
    />
  );
};

// ===== 12. 범용 헤더 컴포넌트 (뒤로가기 + 제목 + 알림) =====
// 뒤로가기 + 제목 + 알림 형태의 모든 헤더에서 재사용 가능한 범용 컴포넌트
// 장바구니 등에서 사용 (장바구니 아이콘 없음)
export const BackTitleWithNotificationHeader = ({ title, onBack, onNotificationClick, className = "" }) => {
  const navigate = useNavigate();
  // 뒤로가기 버튼 클릭 핸들러 (비동기)
  const handleBack = async () => {
    try {
      if (onBack) {
        await onBack(); // 부모 컴포넌트에서 전달받은 뒤로가기 함수 실행 (비동기)
      } else {
        window.history.back(); // 브라우저 히스토리 뒤로가기 (기본 동작)
      }
    } catch (error) {
      console.error('뒤로가기 에러:', error);
      window.history.back();
    }
  };

  // 알림 아이콘 클릭 핸들러 (비동기)
  const handleNotificationClick = async () => {
    try {
      if (onNotificationClick) {
        await onNotificationClick(); // 부모 컴포넌트에서 전달받은 알림 클릭 함수 실행 (비동기)
      }
      console.log('알림창 인터페이스 전환');
      
      // 알림 클릭 로그 기록 (비동기 처리)
      await api.post('/api/user/activity-log', {
        action: 'notification_click',
        timestamp: new Date().toISOString()
      }, {
        headers: {
          'Authorization': 'Bearer <access_token>'
        }
      }).catch(() => {
        // 로그 기록 실패는 무시
        console.log('알림 클릭 로그 기록 실패 (무시됨)');
      });
    } catch (error) {
      console.error('알림 클릭 에러:', error);
    }
  };

  // 범용 헤더 JSX 반환
  return (
    <div className={`header back-title-with-notification-header ${className}`}>
      {/* 뒤로가기 버튼 (왼쪽 고정) */}
      <button className="back-btn" onClick={handleBack}>←</button>
      {/* 페이지 제목 (중앙 정렬) */}
      <h1 className="header-title">{title}</h1>
      
      {/* 헤더 우측 아이콘 영역 (오른쪽 고정) */}
      <div className="header-icons">
        {/* 알림 버튼 (카운트 없음 - 요구사항에 따라) */}
        <button className="notification-btn" onClick={onNotificationClick || (() => navigate('/notifications'))}>
          <img src={bellIcon} alt="알림" className="bell-icon" />
        </button>
      </div>
    </div>
  );
};

// ===== 13. 장바구니 헤더 컴포넌트 (범용 헤더 사용) =====
// 장바구니 페이지에서 사용하는 헤더 (뒤로가기 + '장바구니'텍스트 + 알림)
export const CartHeader = ({ onBack, onNotificationClick }) => {
  return (
    <BackTitleWithNotificationHeader 
      title="장바구니" 
      onBack={onBack} 
      onNotificationClick={onNotificationClick}
      className="cart-header" 
    />
  );
};

// ===== 14. 편성표 헤더 컴포넌트 =====
// 편성표 페이지에서 사용하는 헤더 (편성표 버튼 + 알림)
export const ScheduleHeader = ({ onScheduleClick, onNotificationClick, className = "" }) => {
  const navigate = useNavigate();
  // 편성표 버튼 클릭 핸들러
  const handleScheduleClick = async () => {
    try {
      if (onScheduleClick) {
        await onScheduleClick(); // 부모 컴포넌트에서 전달받은 편성표 클릭 함수 실행 (비동기)
      }
      console.log('편성표 인터페이스 전환');
      
      // 편성표 클릭 로그 기록 (비동기 처리)
      await api.post('/api/user/activity-log', {
        action: 'schedule_click',
        timestamp: new Date().toISOString()
      }, {
        headers: {
          'Authorization': 'Bearer <access_token>'
        }
      }).catch(() => {
        // 로그 기록 실패는 무시
        console.log('편성표 클릭 로그 기록 실패 (무시됨)');
      });
    } catch (error) {
      console.error('편성표 클릭 에러:', error);
    }
  };

  // 알림 버튼 클릭 핸들러 (비동기)
  const handleNotificationClick = async () => {
    try {
      if (onNotificationClick) {
        await onNotificationClick(); // 부모 컴포넌트에서 전달받은 알림 클릭 함수 실행 (비동기)
      }
      console.log('알림창 인터페이스 전환');
      
      // 알림 클릭 로그 기록 (비동기 처리)
      await api.post('/api/user/activity-log', {
        action: 'notification_click',
        timestamp: new Date().toISOString()
      }, {
        headers: {
          'Authorization': 'Bearer <access_token>'
        }
      }).catch(() => {
        // 로그 기록 실패는 무시
        console.log('알림 클릭 로그 기록 실패 (무시됨)');
      });
    } catch (error) {
      console.error('알림 클릭 에러:', error);
    }
  };

  // 편성표 헤더 JSX 반환
  return (
    <div className={`header schedule-header ${className}`}>
      {/* 편성표 버튼 (왼쪽) */}
      <button className="schedule-btn" onClick={handleScheduleClick}>
        편성표
      </button>
      
      {/* 헤더 우측 아이콘 영역 (오른쪽) */}
      <div className="header-icons">
        {/* 알림 버튼 */}
        <button className="notification-btn" onClick={onNotificationClick || (() => navigate('/notifications'))}>
          <img src={bellIcon} alt="알림" className="bell-icon" />
        </button>
      </div>
    </div>
  );
};