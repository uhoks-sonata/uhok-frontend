import React from 'react';
import HeaderNavFrame from './HeaderNavFrame';
import HeaderNavIconBell from '../components/HeaderNavIconBell';
import '../styles/header_nav_Main.css';

const HeaderNavMain = ({ onSearchClick, onNotificationClick, onScheduleClick }) => {
  return (
    <HeaderNavFrame>
      <div className="hn-main-left">
        <button className="schedule-btn" onClick={onScheduleClick}>
          편성표
        </button>
      </div>
      
      <div className="hn-main-center">
        <div className="search-input-wrapper" onClick={onSearchClick}>
          <div className="main-search-button">
            <span className="search-placeholder">홈쇼핑 검색</span>
            <span className="search-icon">🔍</span>
          </div>
        </div>
      </div>
      
      <div className="hn-main-right">
        <HeaderNavIconBell onClick={onNotificationClick} />
      </div>
    </HeaderNavFrame>
  );
};

export default HeaderNavMain;
