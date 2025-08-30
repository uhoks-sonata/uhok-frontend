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
// 로그 API를 가져옵니다
import { logApi } from "../api/logApi";
// 콕 쇼핑몰 아이콘 (활성 상태) import
import bottomIconKok from "../assets/bottom_icon_kok.svg";
// 콕 쇼핑몰 아이콘 (비활성 상태) import
import bottomIconKokBlack from "../assets/bottom_icon_kok_black.svg";
// 레시피 아이콘 (비활성 상태) import
import bottomIconReciptBlack from "../assets/bottom_icon_recipt_black.svg";
// 레시피 아이콘 (비활성 상태) import
import bottomIconRecipt from "../assets/bottom_icon_recipt.svg";
// 찜 아이콘 (활성 상태) import
import bottomIconHeart from "../assets/bottom_icon_heart.svg";
// 찜 아이콘 (비활성 상태) import
import bottomIconHeartBlack from "../assets/bottom_icon_heart_black.svg";
// 마이페이지 아이콘 (활성 상태) import
import bottomIconMypage from "../assets/bottom_icon_mypage.svg";
// 마이페이지 아이콘 (비활성 상태) import
import bottomIconMypageBlack from "../assets/bottom_icon_mypage_black.svg";

// ===== 하단 네비게이션 컴포넌트 =====
// 앱 하단에 위치하는 메인 네비게이션 바 컴포넌트
const BottomNav = ({ selectedItemsCount = 0, handlePayment = null, productInfo = null, cartItems = [], selectedItems = new Set() }) => {
  // 현재 페이지의 경로 정보를 가져오는 훅
  const location = useLocation();
  const navigate = useNavigate();

  // 공통 함수: 결제 페이지로 이동하는 로직 (단순 인터페이스 이동)
  const navigateToPayment = (orderType = 'ORDER') => {
    if (selectedItems.size === 0) {
      alert('주문할 상품을 선택해주세요.');
      return;
    }

    try {
      // 선택된 상품들의 정보 수집
      const selectedCartItems = cartItems.filter(item => selectedItems.has(item.kok_cart_id));
      
      console.log(`🚀 주문하기 - 결제 페이지로 이동 (단순 인터페이스 이동)`);
      console.log(`🔍 선택된 상품들:`, selectedCartItems);
      console.log(`🔍 선택된 상품 개수:`, selectedItems.size);
      
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
      
      console.log(`🔍 결제 페이지로 전달할 데이터:`, navigationState);
      
      // 결제 페이지로 이동 (단순 인터페이스 이동)
      navigate('/kok/payment', { 
        state: navigationState,
        replace: false // 히스토리에 기록 남김
      });
      
      console.log(`✅ 주문하기 - 결제 페이지로 이동 완료`);
      
    } catch (error) {
      console.error(`❌ 주문하기 - 결제 페이지 이동 실패:`, error);
      alert('결제 페이지로 이동하는 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
  };

  // 네비게이션 클릭 로그를 기록하는 비동기 함수
  const logNavigationClick = async (path, label) => {
    console.log('🚀 logNavigationClick 함수 호출됨 - 매개변수:', { path, label });
    console.log('🚀 logNavigationClick 함수 호출됨 - 매개변수 타입:', { 
      pathType: typeof path, 
      labelType: typeof label,
      pathValue: path,
      labelValue: label
    });
    
    // 로그인하지 않은 상태면 API 호출 건너뛰기
    const token = localStorage.getItem('access_token');
    if (!token) {
      console.log('로그인하지 않은 상태: 네비게이션 클릭 로그 API 호출 건너뜀');
      return;
    }

    try {
      console.log('🔍 BottomNav - 네비게이션 클릭 로그 기록 시작:', { path, label });
      console.log('🔍 BottomNav - 토큰 상태:', {
        hasToken: !!token,
        tokenLength: token?.length,
        tokenStart: token?.substring(0, 20) + '...',
        bearerToken: `Bearer ${token}`,
        fullToken: token
      });
      
      console.log('🔍 BottomNav - 사용자 정보:', { token: !!token });
      
      // logApi를 사용하여 로그 기록
      const requestData = {
        action: 'navigation_click',
        path: path,
        label: label,
        timestamp: new Date().toISOString()
      };
      
      console.log('🔍 BottomNav - API 요청 데이터:', requestData);
      console.log('🔍 BottomNav - requestData 상세:', {
        actionValue: requestData.action,
        pathValue: requestData.path,
        labelValue: requestData.label,
        actionType: typeof requestData.action,
        pathType: typeof requestData.path,
        labelType: typeof requestData.label
      });
      console.log('🔍 BottomNav - logApi.createUserLog 호출');
      
      await logApi.createUserLog(requestData).catch((error) => {
        // 로그 기록 실패는 무시하되 에러 정보는 출력
        console.log('네비게이션 클릭 로그 기록 실패 (무시됨):', error);
      });
      
      console.log('✅ BottomNav - 네비게이션 클릭 로그 기록 완료');
    } catch (error) {
      console.error('❌ BottomNav - 네비게이션 로그 기록 에러:', error);
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
                  // 결제 페이지에서는 3단계 결제 프로세스 실행
                  if (handlePayment) {
                    console.log('결제하기 버튼 클릭 - 3단계 결제 프로세스 시작');
                    console.log('1단계: 주문 생성');
                    console.log('2단계: 결제 확인');
                    console.log('3단계: 결제 요청 응답 확인');
                    handlePayment();
                  } else {
                    console.log('결제 처리 중...');
                  }
                } else {
                  // 상품 상세 페이지나 장바구니에서는 단순히 결제 페이지로 이동
                  if (location.pathname.startsWith('/kok/product/')) {
                    // 상품 상세페이지에서 주문하기 버튼 클릭 시
                    // 수량 선택 모달을 열기 위해 이벤트를 발생시킴
                    console.log('주문하기 버튼 클릭 - 수량 선택 모달 열기');
                    const orderButtonEvent = new CustomEvent('openQuantityModal', {
                      detail: { productId: location.pathname.split('/').pop() }
                    });
                    window.dispatchEvent(orderButtonEvent);
                  } else {
                    // 장바구니에서 주문하기 버튼 클릭 시 - 단순 인터페이스 이동
                    console.log('주문하기 버튼 클릭 - 결제 페이지로 이동 (단순 인터페이스 이동)');
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
                       console.log('🎯 네비게이션 아이템 클릭됨:', { path: item.path, label: item.label });
                       console.log('🎯 logNavigationClick 함수 호출 직전');
                       logNavigationClick(item.path, item.label); // 네비게이션 클릭 로그 기록
                       console.log('🎯 logNavigationClick 함수 호출 완료');
                       
                       // main 페이지는 공개 페이지로 변경됨 - 토큰 검증 제거
                       
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
                                             onClick={() => {
                         console.log('🎯 혹 버튼 클릭됨:', { path: '/main', label: '혹' });
                         console.log('🎯 logNavigationClick 함수 호출 직전');
                         logNavigationClick('/main', '혹'); // 혹 버튼 클릭 로그 기록
                         console.log('🎯 logNavigationClick 함수 호출 완료');
                       }}
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
