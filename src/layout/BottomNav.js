import React from "react";
import { Link, useLocation } from "react-router-dom";
import "../styles/bottom_nav.css";
import bottomNavImage from "../assets/bottom_navigation.gif";
import bottomIconKok from "../assets/bottom_icon_kok.png";
import bottomIconKokBlack from "../assets/bottom_icon_kok_black.png";
import bottomIconReciptBlack from "../assets/bottom_icon_recipt-black.png";
import bottomIconHeart from "../assets/bottom_icon_heart.png";
import bottomIconHeartBlack from "../assets/bottom_icon_heart_black.png";
import bottomIconMypage from "../assets/bottom_icon_mypage.png";
import bottomIconMypageBlack from "../assets/bottom_icon_mypage_black.png";

// 기존 하단바 컴포넌트
const BottomNav = () => {
  const location = useLocation();

  const navItems = [
    {
      path: "/kok",
      label: "콕",
      icon: bottomIconKok,
      activeIcon: bottomIconKokBlack,
      isActive: location.pathname === "/kok"
    },
    {
      path: "/recipe",
      label: "레시피",
      icon: bottomIconReciptBlack, // 기본이 검은색인 것 같음
      activeIcon: bottomIconReciptBlack,
      isActive: location.pathname === "/recipe"
    },
    {
      path: "/main",
      label: "메인",
      isMain: true,
      isActive: location.pathname === "/main"
    },
    {
      path: "/likes",
      label: "찜",
      icon: bottomIconHeart,
      activeIcon: bottomIconHeartBlack,
      isActive: location.pathname === "/likes"
    },
    {
      path: "/mypage",
      label: "마이페이지",
      icon: bottomIconMypage,
      activeIcon: bottomIconMypageBlack,
      isActive: location.pathname === "/mypage"
    }
  ];

  return (
    <nav className="bottom-nav">
      {navItems.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          className={`nav-item ${item.isActive ? "active" : ""}`}
        >
          {item.isMain ? (
            <div className="image-button-wrapper">
              <img src={bottomNavImage} alt="메인 버튼" className="image-button" />
              <span>혹</span>
            </div>
          ) : (
            <>
              <img 
                src={item.isActive ? item.activeIcon : item.icon} 
                alt={item.label} 
                className="nav-icon"
              />
              <span className="nav-label">{item.label}</span>
            </>
          )}
        </Link>
      ))}
    </nav>
  );
};

export default BottomNav;
