// React 관련 라이브러리 import
import React, { useState, useEffect } from 'react';
// React Router의 useNavigate 훅 import
import { useNavigate } from 'react-router-dom';
// 스타일 CSS 파일 import
import '../../styles/recommend_recipe.css';
// 장바구니 헤더 import
import { CartHeader } from '../../layout/HeaderNav';

// ===== 장바구니 헤더 테스트 컴포넌트 =====
// 장바구니 페이지의 헤더를 테스트하는 컴포넌트
// 뒤로가기 + '장바구니' 제목 + 알림 기능 테스트
const CartTest = () => {
  // 페이드인 애니메이션 상태 관리
  const [fadeIn, setFadeIn] = useState(false);
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
    console.log('장바구니 알림 클릭');
    // 여기에 알림창 인터페이스 전환 로직 추가 가능
  };

  // 장바구니 테스트 페이지 JSX 반환
  return (
    <div className={`main-page ${fadeIn ? 'fade-in' : ''}`}>
      {/* 장바구니 헤더 테스트 - 범용 헤더 사용 */}
      <CartHeader 
        onBack={handleBack}
        onNotificationClick={handleNotificationClick}
      />

      {/* 메인 콘텐츠 영역 */}
      <div className="main-container">
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <h2>장바구니 페이지</h2>
          <p>장바구니 헤더 테스트 중입니다.</p>
          <p>뒤로가기, 알림 버튼을 테스트해보세요.</p>
          <p>장바구니 아이콘은 없고 알림만 있습니다.</p>
        </div>
      </div>
    </div>
  );
};

export default CartTest; 