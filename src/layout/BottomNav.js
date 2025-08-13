// React 라이브러리 import
import React from "react";
// React Router의 Link와 useLocation, useNavigate 훅 import
import { Link, useLocation, useNavigate } from "react-router-dom";
// 하단 네비게이션 스타일 CSS 파일 import
import "../styles/bottom_nav.css";
// 하단 네비게이션 배경 이미지 import
import bottomNavImage from "../assets/bottom_navigation.gif";
// API 설정을 가져옵니다
import api from "../pages/api";
// 콕 쇼핑몰 아이콘 (활성 상태) import
import bottomIconKok from "../assets/bottom_icon_kok.png";
// 콕 쇼핑몰 아이콘 (비활성 상태) import
import bottomIconKokBlack from "../assets/bottom_icon_kok_black.png";
// 레시피 아이콘 (비활성 상태) import
import bottomIconReciptBlack from "../assets/bottom_icon_recipt_black.png";
// 레시피 아이콘 (비활성 상태) import
import bottomIconRecipt from "../assets/bottom_icon_recipt.png";
// 찜 아이콘 (활성 상태) import
import bottomIconHeart from "../assets/bottom_icon_heart.png";
// 찜 아이콘 (비활성 상태) import
import bottomIconHeartBlack from "../assets/bottom_icon_heart_black.png";
// 마이페이지 아이콘 (활성 상태) import
import bottomIconMypage from "../assets/bottom_icon_mypage.png";
// 마이페이지 아이콘 (비활성 상태) import
import bottomIconMypageBlack from "../assets/bottom_icon_mypage_black.png";

// ===== 하단 네비게이션 컴포넌트 =====
// 앱 하단에 위치하는 메인 네비게이션 바 컴포넌트
const BottomNav = ({ selectedItemsCount = 0, handlePayment = null, productInfo = null, cartItems = [], selectedItems = new Set() }) => {
  // 현재 페이지의 경로 정보를 가져오는 훅
  const location = useLocation();
  const navigate = useNavigate();

  // 공통 함수: 결제 페이지로 이동하는 로직 (Cart.js와 동일)
  const navigateToPayment = (orderType = 'ORDER') => {
    if (selectedItems.size === 0) {
      alert('주문할 상품을 선택해주세요.');
      return;
    }

    try {
      // 선택된 상품들의 정보 수집
      const selectedCartItems = cartItems.filter(item => selectedItems.has(item.kok_cart_id));
      
      console.log(`🚀 ${orderType === 'ORDER' ? '주문하기' : '테스트'} - 선택된 상품들:`, selectedCartItems);
      console.log(`🚀 ${orderType === 'ORDER' ? '주문하기' : '테스트'} - selectedItems.size:`, selectedItems.size);
      console.log(`🚀 ${orderType === 'ORDER' ? '주문하기' : '테스트'} - cartItems.length:`, cartItems.length);
      
      // 결제 페이지로 전달할 데이터 구성
      const navigationState = { 
        fromCart: true,
        // 할인 정보 전달
        discountPrice: selectedCartItems.reduce((total, item) => total + (item.kok_discounted_price * item.kok_quantity), 0),
        originalPrice: selectedCartItems.reduce((total, item) => total + (item.kok_product_price * item.kok_quantity), 0),
        productName: selectedCartItems.length === 1 ? selectedCartItems[0].kok_product_name : `${selectedCartItems.length}개 상품`,
        productImage: selectedCartItems.length === 1 ? selectedCartItems[0].kok_thumbnail : null,
        cartItems: selectedCartItems,
        // 주문 ID는 임시로 생성
        orderId: `${orderType}-${Date.now()}`
      };
      
      console.log(`🚀 ${orderType === 'ORDER' ? '주문하기' : '테스트'} - 결제페이지로 이동 - 전달할 state:`, navigationState);
      console.log(`📍 ${orderType === 'ORDER' ? '주문하기' : '테스트'} - navigate 함수 호출 직전`);
      console.log(`📍 ${orderType === 'ORDER' ? '주문하기' : '테스트'} - navigationState.fromCart:`, navigationState.fromCart);
      console.log(`📍 ${orderType === 'ORDER' ? '주문하기' : '테스트'} - navigationState.cartItems.length:`, navigationState.cartItems.length);
      
      // 결제 페이지로 이동
      const navigateResult = navigate('/kok/payment', { 
        state: navigationState,
        replace: false // 히스토리에 기록 남김
      });
      
      console.log(`✅ ${orderType === 'ORDER' ? '주문하기' : '테스트'} - navigate 함수 호출 완료`);
      console.log(`✅ ${orderType === 'ORDER' ? '주문하기' : '테스트'} - navigate 결과:`, navigateResult);
      
      // 추가 확인: 실제로 페이지가 이동되었는지 확인
      setTimeout(() => {
        console.log(`🔍 ${orderType === 'ORDER' ? '주문하기' : '테스트'} - 페이지 이동 후 확인`);
        console.log(`🔍 ${orderType === 'ORDER' ? '주문하기' : '테스트'} - 현재 URL:`, window.location.href);
        console.log(`🔍 ${orderType === 'ORDER' ? '주문하기' : '테스트'} - history.state:`, window.history.state);
      }, 100);
      
    } catch (error) {
      console.error(`❌ ${orderType === 'ORDER' ? '주문하기' : '테스트'} - 처리 실패:`, error);
      console.error(`❌ ${orderType === 'ORDER' ? '주문하기' : '테스트'} - 에러 상세:`, error.message, error.stack);
      alert(`${orderType === 'ORDER' ? '주문' : '테스트'} 처리에 실패했습니다. 다시 시도해주세요.`);
    }
  };

  // 네비게이션 클릭 로그를 기록하는 비동기 함수
  const logNavigationClick = async (path, label) => {
    try {
      await api.post('/api/user/activity-log', {
        action: 'navigation_click',
        path: path,
        label: label,
        timestamp: new Date().toISOString()
      }, {
        headers: {
          'Authorization': 'Bearer <access_token>'
        }
      }).catch(() => {
        // 로그 기록 실패는 무시
        console.log('네비게이션 클릭 로그 기록 실패 (무시됨)');
      });
    } catch (error) {
      console.error('네비게이션 로그 기록 에러:', error);
    }
  };

  // 특정 페이지에서 주문/결제 버튼을 표시할지 확인하는 함수
  const shouldShowOrderButton = () => {
    const orderPages = ['/kok/product', '/cart', '/kok/payment'];
    return orderPages.some(page => location.pathname.startsWith(page));
  };

  // 주문/결제 버튼 텍스트 결정
  const getOrderButtonText = () => {
    if (location.pathname.startsWith('/kok/payment')) {
      return '결제하기';
    }
    return '주문하기';
  };

  // 주문/결제 버튼 비활성화 여부 결정 (장바구니에서 선택된 상품이 없을 때)
  const isOrderButtonDisabled = () => {
    return location.pathname === '/cart' && selectedItemsCount === 0;
  };

  // 네비게이션 아이템 배열 정의
  // 각 아이템은 경로, 아이콘, 라벨, 활성/비활성 아이콘 정보를 포함
  const navItems = [
    {
      path: "/kok", // 콕 쇼핑몰 페이지 경로
      icon: bottomIconKokBlack, // 활성 상태 아이콘 (검은색)
      blackIcon: bottomIconKok, // 비활성 상태 아이콘 (일반)
      label: "콕 쇼핑몰" // 네비게이션 라벨
    },
    {
      path: "/recipes", // 레시피 추천 페이지 경로
      icon: bottomIconReciptBlack, // 활성 상태 아이콘 (검은색)
      blackIcon: bottomIconRecipt, // 비활성 상태 아이콘 (일반)
      label: "레시피 추천" // 네비게이션 라벨
    },
    {
      path: "/wishlist", // 찜 페이지 경로
      icon: bottomIconHeartBlack, // 활성 상태 아이콘 (검은색)
      blackIcon: bottomIconHeart, // 비활성 상태 아이콘 (일반)
      label: "찜" // 네비게이션 라벨
    },
    {
      path: "/mypage", // 마이페이지 경로
      icon: bottomIconMypageBlack, // 활성 상태 아이콘 (검은색)
      blackIcon: bottomIconMypage, // 비활성 상태 아이콘 (일반)
      label: "마이페이지" // 네비게이션 라벨
    }
  ];

      // 하단 네비게이션 JSX 반환
  return (
    // 하단 네비게이션 컨테이너
          <nav className="bottom-nav">
        
        {/* 주문/결제 페이지에서는 주문하기/결제하기 버튼 표시 */}
        {shouldShowOrderButton() ? (
          <div className="order-button-container">
            <button 
              className={`order-button ${isOrderButtonDisabled() ? 'disabled' : ''}`}
              onClick={() => {
                if (location.pathname.startsWith('/kok/payment')) {
                  // 결제 페이지에서는 handlePayment 함수 호출
                  if (handlePayment) {
                    console.log('결제하기 버튼 클릭 - handlePayment 함수 호출');
                    handlePayment();
                  } else {
                    console.log('결제 처리 중...');
                  }
                } else {
                  // 상품 상세 페이지나 장바구니에서는 결제 페이지로 이동
                  // 제품 정보를 state로 전달
                                    if (location.pathname.startsWith('/kok/product/')) {
                    // 상품 상세페이지에서 주문하기 버튼 클릭 시
                    const productId = location.pathname.split('/').pop();
                             navigate('/kok/payment', {
           state: {
             productId: productId,
             fromProductDetail: true,
             discountPrice: productInfo?.discountPrice,
             originalPrice: productInfo?.originalPrice,
             discountRate: productInfo?.discountRate,
             productName: productInfo?.productName,
             productImage: productInfo?.productImage
           }
         });
                  } else {
                    // 장바구니에서 주문하기 버튼 클릭 시
                    navigateToPayment();
                  }
                }
              }}
              disabled={isOrderButtonDisabled()}
            >
              {getOrderButtonText()}
            </button>
          </div>
        ) : (
          <>
            {/* 네비게이션 아이템들을 map으로 순회하여 렌더링 */}
            {navItems.map((item, index) => {
              // 현재 경로가 해당 아이템의 경로와 일치하는지 확인 (주문내역 페이지에서는 마이페이지를 활성화, 찜 페이지에서는 찜 아이콘을 활성화)
              const isActive = location.pathname === item.path || 
                              (location.pathname === "/orderlist" && item.path === "/mypage") ||
                              (location.pathname === "/wishlist" && item.path === "/wishlist");
              
              // 현재 활성 상태에 따라 사용할 아이콘 결정
              const currentIcon = isActive ? item.icon : item.blackIcon;
              
              // 각 네비게이션 아이템 렌더링
              return (
                <React.Fragment key={item.path}>
                  {/* 네비게이션 아이템 */}
                  <Link
                    to={item.path} // 이동할 경로
                    className={`nav-item ${isActive ? 'active' : ''}`} // 활성 상태에 따른 CSS 클래스 적용
                    onClick={() => {
                      logNavigationClick(item.path, item.label); // 네비게이션 클릭 로그 기록
                      
                      // main 페이지로 이동할 때 토큰 확인
                      if (item.path === '/main') {
                        const token = localStorage.getItem('access_token');
                        const tokenType = localStorage.getItem('token_type');
                        
                        console.log('main 페이지 이동 시도 - 토큰 정보:', {
                          hasToken: !!token,
                          tokenType: tokenType,
                          tokenPreview: token ? token.substring(0, 20) + '...' : '없음'
                        });
                        
                        if (!token) {
                          console.log('토큰이 없어서 로그인 페이지로 이동');
                          window.location.href = '/';
                          return;
                        }
                        
                        // 토큰 유효성 검증 (JWT 형식 확인)
                        const tokenParts = token.split('.');
                        if (tokenParts.length !== 3) {
                          console.warn('잘못된 토큰 형식, 로그인 페이지로 이동');
                          localStorage.removeItem('access_token');
                          localStorage.removeItem('token_type');
                          window.location.href = '/';
                          return;
                        }
                        
                        console.log('유효한 토큰으로 main 페이지 이동');
                      }
                      
                      // 현재 활성화된 아이콘을 클릭했을 때도 페이지 새로고침
                      if (isActive) {
                        window.location.href = item.path;
                      }
                    }}
                  >
                    {/* 네비게이션 아이콘 */}
                    <img
                      src={currentIcon} // 현재 상태에 맞는 아이콘 이미지
                      alt={item.label} // 접근성을 위한 alt 텍스트
                      className="nav-icon" // 아이콘 스타일 클래스
                    />
                    {/* 네비게이션 라벨 */}
                    <span className="nav-label">{item.label}</span>
                  </Link>
                  
                  {/* 가운데 동그란 버튼 (두 번째 아이템 다음에 추가) */}
                  {index === 1 && (
                    <div className="image-button-wrapper">
                    <Link 
                      to="/main" 
                      className="main-button-link"
                      onClick={() => logNavigationClick('/main', '혹')} // 혹 버튼 클릭 로그 기록
                    >
                      <div className="image-button">
                        <div className="image-text">
                          <span className="kok-text">혹</span>
                        </div>
                        <img 
                          src={bottomNavImage} 
                          alt="메인 버튼" 
                          style={{
                            width: '100%',
                            height: '100%',
                            borderRadius: '50%',
                            objectFit: 'cover'
                          }}
                        />
                      </div>
                    </Link>
                  </div>            
                  )}
                </React.Fragment>
              );
            })}
          </>
        )}
      </nav>
  );
};

// 컴포넌트를 기본 export로 내보내기
export default BottomNav;
