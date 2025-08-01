import React from "react";
import { Link, useLocation } from "react-router-dom";
import "../styles/bottom_nav.css";
import bottomNavImage from "../assets/bottom_navigation.gif";

const BottomNav = () => {
  const location = useLocation();

  return (
    <nav className="bottom-nav">
      <Link
        to="/kok"
        className={`nav-item ${location.pathname === "/kok" ? "active" : ""}`}
      >
        콕 쇼핑몰
      </Link>

      <Link
        to="/recipe"
        className={`nav-item ${location.pathname === "/recipe" ? "active" : ""}`}
      >
        레시피 추천
      </Link>

      <Link to="/main" className="image-button-wrapper">
        <img src={bottomNavImage} alt="메인 버튼" className="image-button" />
        <span>혹</span>
      </Link>

      <Link
        to="/likes"
        className={`nav-item ${location.pathname === "/likes" ? "active" : ""}`}
      >
        찜
      </Link>

      <Link
        to="/mypage"
        className={`nav-item ${location.pathname === "/mypage" ? "active" : ""}`}
      >
        마이페이지
      </Link>
    </nav>
  );
};

export default BottomNav;
