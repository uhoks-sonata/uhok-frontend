// React 관련 라이브러리 import
import React, { useState, useEffect } from 'react';
// React Router의 useNavigate 훅 import
import { useNavigate } from 'react-router-dom';
// 스타일 CSS 파일 import
import '../../styles/recommend_recipe.css';
// 주문내역 헤더 및 전역 알림 상태 관리 import
import { OrderHistoryHeader, useNotifications } from '../../layout/HeaderNav';

// ===== 주문내역 헤더 테스트 컴포넌트 =====
// 주문내역 페이지의 헤더를 테스트하는 컴포넌트
// 뒤로가기 + '주문내역' 제목 + 알림 + 장바구니 기능 테스트
const OrderHistoryTest = () => {
  // 페이드인 애니메이션 상태 관리
  const [fadeIn, setFadeIn] = useState(false);
  // 전역 장바구니 상태 관리 (알림 카운트는 제거됨)
  const { addToCart } = useNotifications();
  // 페이지 네비게이션 훅
  const navigate = useNavigate();

  // 컴포넌트 마운트 시 페이드인 애니메이션 실행
  useEffect(() => {
    setFadeIn(true);
  }, []);

  // 뒤로가기 핸들러 - 메인 페이지로 이동
  const handleBack = () => {
    navigate('/main');
  };

  // 알림 클릭 핸들러 (카운트 없이 버튼 역할만)
  const handleNotificationClick = () => {
    console.log('주문내역 알림 클릭');
    // 여기에 알림창 인터페이스 전환 로직 추가 가능
  };

  // 장바구니 클릭 핸들러 (카운트 증가 포함)
  const handleCartClick = () => {
    addToCart(); // 전역 장바구니 개수 증가
    console.log('주문내역 장바구니 클릭');
    // 여기에 장바구니 인터페이스 전환 로직 추가 가능
  };

  // 주문내역 테스트 페이지 JSX 반환
  return (
    <div className={`main-page ${fadeIn ? 'fade-in' : ''}`}>
      {/* 주문내역 헤더 테스트 - 범용 헤더 사용 */}
      <OrderHistoryHeader 
        onBack={handleBack}
        onNotificationClick={handleNotificationClick}
        onCartClick={handleCartClick}
      />

      {/* 메인 콘텐츠 영역 */}
      <div className="main-container">
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <h2>주문내역 페이지</h2>
          <p>주문내역 헤더 테스트 중입니다.</p>
          <p>뒤로가기, 알림, 장바구니 버튼을 테스트해보세요.</p>
        </div>
      </div>
    </div>
  );
};

export default OrderHistoryTest; 