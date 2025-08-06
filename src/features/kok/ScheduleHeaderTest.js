// React 관련 라이브러리 import
import React, { useState, useEffect } from 'react';
// React Router의 useNavigate 훅 import
import { useNavigate } from 'react-router-dom';
// 스타일 CSS 파일 import
import '../../styles/recommend_recipe.css';
// 편성표 헤더 import
import { ScheduleHeader } from '../../layout/HeaderNav';

// ===== 편성표 헤더 테스트 컴포넌트 =====
// 편성표 페이지의 헤더를 테스트하는 컴포넌트
// 편성표 버튼 + 알림 기능 테스트
const ScheduleHeaderTest = () => {
  // 페이드인 애니메이션 상태 관리
  const [fadeIn, setFadeIn] = useState(false);
  // 편성표 클릭 상태 관리
  const [scheduleClicked, setScheduleClicked] = useState(false);
  // 알림 클릭 상태 관리
  const [notificationClicked, setNotificationClicked] = useState(false);
  // 페이지 네비게이션 훅
  const navigate = useNavigate();

  // 컴포넌트 마운트 시 페이드인 애니메이션 실행
  useEffect(() => {
    setFadeIn(true);
  }, []);

  // 편성표 버튼 클릭 핸들러
  const handleScheduleClick = () => {
    setScheduleClicked(true);
    console.log('편성표 버튼이 클릭되었습니다!');
    // 3초 후 상태 초기화
    setTimeout(() => setScheduleClicked(false), 3000);
  };

  // 알림 클릭 핸들러
  const handleNotificationClick = () => {
    setNotificationClicked(true);
    console.log('알림 버튼이 클릭되었습니다!');
    // 3초 후 상태 초기화
    setTimeout(() => setNotificationClicked(false), 3000);
  };

  // 편성표 테스트 페이지 JSX 반환
  return (
    <div className={`main-page ${fadeIn ? 'fade-in' : ''}`}>
      {/* 편성표 헤더 테스트 */}
      <ScheduleHeader 
        onScheduleClick={handleScheduleClick}
        onNotificationClick={handleNotificationClick}
        className="schedule-header-test"
      />

      {/* 메인 콘텐츠 영역 */}
      <div className="main-container">
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <h2>편성표 페이지</h2>
          <p>편성표 헤더 테스트 중입니다.</p>
          <p>편성표 버튼, 알림 버튼을 테스트해보세요.</p>
          
          {/* 테스트 결과 표시 */}
          <div style={{ marginTop: '20px', padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
            <h3>테스트 결과:</h3>
            <p>편성표 버튼 클릭: {scheduleClicked ? '✅ 클릭됨' : '❌ 클릭되지 않음'}</p>
            <p>알림 버튼 클릭: {notificationClicked ? '✅ 클릭됨' : '❌ 클릭되지 않음'}</p>
            
            <div style={{ marginTop: '20px' }}>
              <h4>사용법:</h4>
              <ul>
                <li>위의 "편성표" 버튼을 클릭해보세요</li>
                <li>오른쪽의 알림 아이콘을 클릭해보세요</li>
                <li>콘솔에서 로그를 확인하세요</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScheduleHeaderTest; 