// React 관련 라이브러리 import
import React, { useState, useEffect } from 'react';
// 홈쇼핑 메인 페이지 스타일 CSS 파일 import
import '../../styles/home_shopping_main.css';
// 하단 네비게이션 컴포넌트 import
import BottomNav from '../../layout/BottomNav';
// 홈쇼핑 헤더 컴포넌트 import
import { HomeShoppingHeader } from '../../layout/HeaderNav';

// ===== 홈쇼핑 메인 페이지 컴포넌트 =====
// 홈쇼핑 서비스의 메인 페이지 컴포넌트
const Main = () => {
  // 페이지 로딩 시 페이드인 애니메이션 상태 관리
  const [fadeIn, setFadeIn] = useState(false);
  // 검색어 상태 관리
  const [searchQuery, setSearchQuery] = useState('');

  // ===== useEffect 훅 =====
  // 컴포넌트가 마운트될 때 한 번만 실행되는 효과
  useEffect(() => {
    // 페이지 로딩 완료 후 페이드인 애니메이션 활성화
    setFadeIn(true);
  }, []); // 빈 의존성 배열로 마운트 시에만 실행

  // ===== 이벤트 핸들러 함수들 =====
  
  // 검색 실행 핸들러 함수
  const handleSearch = (query) => {
    // 콘솔에 검색어 출력 (실제 검색 로직 구현 예정)
    console.log('검색어:', query);
    // TODO: 실제 검색 로직 구현
    // - API 호출
    // - 검색 결과 상태 업데이트
    // - 검색 결과 페이지로 이동 등
  };

  // 알림 클릭 핸들러 함수
  const handleNotificationClick = () => {
    // 콘솔에 알림창 클릭 로그 출력
    console.log('알림창 클릭');
    // TODO: 알림창 인터페이스 전환 로직 구현
    // - 알림 목록 표시
    // - 알림 설정 페이지로 이동 등
  };

  // 메인 페이지 JSX 반환
  return (
    // 메인 페이지 컨테이너 (페이드인 애니메이션 클래스 조건부 적용)
    <div className={`main-page ${fadeIn ? 'fade-in' : ''}`}>
      {/* 홈쇼핑 헤더 컴포넌트 */}
      <HomeShoppingHeader
        searchQuery={searchQuery} // 현재 검색어 상태 전달
        setSearchQuery={setSearchQuery} // 검색어 변경 함수 전달
        onSearch={handleSearch} // 검색 실행 함수 전달
        onNotificationClick={handleNotificationClick} // 알림 클릭 함수 전달
      />
      
      {/* 메인 콘텐츠 영역 */}
      <div className="main-content">
        {/* 임시 콘텐츠 (실제 홈쇼핑 콘텐츠로 교체 예정) */}
        <div>홈쇼핑 메인 페이지</div>
      </div>
      
      {/* 하단 네비게이션 컴포넌트 */}
      <BottomNav />
    </div>
  );
};

// 컴포넌트를 기본 export로 내보내기
export default Main;
