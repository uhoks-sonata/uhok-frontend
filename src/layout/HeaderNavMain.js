import React from 'react';
import { useNavigate } from 'react-router-dom';
import HeaderNavFrame from './HeaderNavFrame';
import '../styles/header_nav_Main.css';
import HeaderNavIconBell from '../components/HeaderNavIconBell';
import HeaderNavBackBtn from '../components/HeaderNavBackBtn';

// 메인 페이지 전용 Header Nav (내용만 구성, 틀은 HeaderNavFrame 사용)
// - 내부 구성: 좌측(로고 자리), 중앙(페이지 타이틀), 우측(아이콘 자리)
const HeaderNavMain = ({ title = '콕 쇼핑몰', onNotificationsClick, onBackClick }) => {
  const navigate = useNavigate();

  const handleBackClick = onBackClick || (() => navigate(-1));
  const handleNotificationsClick = onNotificationsClick || (() => navigate('/notifications'));

  return (
    <HeaderNavFrame>
      <div className="hn-main-left">
        <HeaderNavBackBtn onClick={handleBackClick} />
        <div className="hn-main-title" aria-label="page-title">{title}</div>
      </div>
      <div className="hn-main-center" aria-label="page-title"></div>
      <div className="hn-main-right">
        <HeaderNavIconBell onClick={handleNotificationsClick} />
      </div>
    </HeaderNavFrame>
  );
};

export default HeaderNavMain;


