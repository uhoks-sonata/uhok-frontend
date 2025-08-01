import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../styles/bottom_nav.css';

const BottomNav = () => {
  const location = useLocation();

  return (
    <nav className="bottom-nav">
      <Link to="/main" className={location.pathname === '/main' ? 'active' : ''}>
        콕 쇼핑몰
      </Link>

      <Link to="/recipe" className={location.pathname === '/recipe' ? 'active' : ''}>
        레시피추천
      </Link>

      <Link to="/special" className="round-button">
        +
      </Link>

      <Link to="/favorites" className={location.pathname === '/favorites' ? 'active' : ''}>
        찜
      </Link>

      <Link to="/mypage" className={location.pathname === '/mypage' ? 'active' : ''}>
        마이페이지
      </Link>
    </nav>
  );
};

export default BottomNav;
