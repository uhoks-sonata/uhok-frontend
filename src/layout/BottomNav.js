// React 라이브러리 import
import React from "react";
// React Router의 Link와 useLocation 훅 import
import { Link, useLocation } from "react-router-dom";
// 하단 네비게이션 스타일 CSS 파일 import
import "../styles/bottom_nav.css";
// 하단 네비게이션 배경 이미지 import
import bottomNavImage from "../assets/bottom_navigation.gif";
// 콕 쇼핑몰 아이콘 (활성 상태) import
import bottomIconKok from "../assets/bottom_icon_kok.png";
// 콕 쇼핑몰 아이콘 (비활성 상태) import
import bottomIconKokBlack from "../assets/bottom_icon_kok_black.png";
// 레시피 아이콘 (비활성 상태) import
import bottomIconReciptBlack from "../assets/bottom_icon_recipt-black.png";
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

  // 네비게이션 아이템 배열 정의
  // 각 아이템은 경로, 아이콘, 라벨, 활성/비활성 아이콘 정보를 포함
  const navItems = [
    {
      path: "/kok", // 콕 쇼핑몰 페이지 경로
      icon: bottomIconKok, // 활성 상태 아이콘
      blackIcon: bottomIconKokBlack, // 비활성 상태 아이콘
      label: "콕 쇼핑몰" // 네비게이션 라벨
    },
    {
      path: "/test", // 레시피 추천 페이지 경로 (테스트용)
      icon: bottomIconReciptBlack, // 활성 상태 아이콘
      blackIcon: bottomIconReciptBlack, // 비활성 상태 아이콘 (동일)
      label: "레시피 추천" // 네비게이션 라벨
    },
    {
      path: "/main", // 홈쇼핑 메인 페이지 경로
      icon: bottomIconHeart, // 활성 상태 아이콘
      blackIcon: bottomIconHeartBlack, // 비활성 상태 아이콘
      label: "찜" // 네비게이션 라벨
    },
    {
      path: "/mypage", // 마이페이지 경로
      icon: bottomIconMypage, // 활성 상태 아이콘
      blackIcon: bottomIconMypageBlack, // 비활성 상태 아이콘
      label: "마이페이지" // 네비게이션 라벨
    }
  ];

  // 하단 네비게이션 JSX 반환
  return (
    // 하단 네비게이션 컨테이너
    <nav className="bottom-nav">
      {/* 네비게이션 아이템들을 map으로 순회하여 렌더링 */}
      {navItems.map((item) => {
        // 현재 경로가 해당 아이템의 경로와 일치하는지 확인
        const isActive = location.pathname === item.path;
        
        // 현재 활성 상태에 따라 사용할 아이콘 결정
        const currentIcon = isActive ? item.icon : item.blackIcon;
        
        // 각 네비게이션 아이템 렌더링
        return (
          // Link 컴포넌트로 감싸서 클릭 시 해당 경로로 이동
          <Link
            key={item.path} // React key prop (고유 식별자)
            to={item.path} // 이동할 경로
            className={`nav-item ${isActive ? 'active' : ''}`} // 활성 상태에 따른 CSS 클래스 적용
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
        );
      })}
    </nav>
  );
};

// 컴포넌트를 기본 export로 내보내기
export default BottomNav;
