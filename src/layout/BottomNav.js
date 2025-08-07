// React 라이브러리 import
import React from "react";
// React Router의 Link와 useLocation 훅 import
import { Link, useLocation } from "react-router-dom";
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
const BottomNav = () => {
  // 현재 페이지의 경로 정보를 가져오는 훅
  const location = useLocation();

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

  // 네비게이션 아이템 배열 정의
  // 각 아이템은 경로, 아이콘, 라벨, 활성/비활성 아이콘 정보를 포함
  const navItems = [
    {
      path: "/kokmain", // 콕 쇼핑몰 페이지 경로
      icon: bottomIconKokBlack, // 활성 상태 아이콘 (검은색)
      blackIcon: bottomIconKok, // 비활성 상태 아이콘 (일반)
      label: "콕 쇼핑몰" // 네비게이션 라벨
    },
    {
      path: "/sample", // 레시피 추천 페이지 경로 (테스트용)
      icon: bottomIconReciptBlack, // 활성 상태 아이콘 (검은색)
      blackIcon: bottomIconRecipt, // 비활성 상태 아이콘 (콕 아이콘으로 변경)
      label: "레시피 추천" // 네비게이션 라벨
    },
    {
      path: "/sample", // 찜 페이지 경로
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
      
      {/* 네비게이션 아이템들을 map으로 순회하여 렌더링 */}
      {navItems.map((item, index) => {
        // 현재 경로가 해당 아이템의 경로와 일치하는지 확인
        const isActive = location.pathname === item.path;
        
        // 현재 활성 상태에 따라 사용할 아이콘 결정
        const currentIcon = isActive ? item.icon : item.blackIcon;
        
        // 각 네비게이션 아이템 렌더링
        return (
          <React.Fragment key={item.path}>
            {/* 네비게이션 아이템 */}
            <Link
              to={item.path} // 이동할 경로
              className={`nav-item ${isActive ? 'active' : ''}`} // 활성 상태에 따른 CSS 클래스 적용
              onClick={() => logNavigationClick(item.path, item.label)} // 네비게이션 클릭 로그 기록
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
                to="/schedule" 
                className="main-button-link"
                onClick={() => logNavigationClick('/schedule', '혹')} // 혹 버튼 클릭 로그 기록
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
    </nav>
  );
};

// 컴포넌트를 기본 export로 내보내기
export default BottomNav;
