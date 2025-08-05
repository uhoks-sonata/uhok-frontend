import React from 'react';
import '../styles/header.css';

const Header = () => {
  return (
    <header className="header">
      <div className="status-bar">
        <span className="time">9:41</span>
        <div className="status-icons">
          <span className="signal">📶</span>
          <span className="wifi">📶</span>
          <span className="battery">🔋</span>
        </div>
      </div>
      <div className="search-container">
        <div className="search-bar">
          <span className="search-icon">🔍</span>
          <input 
            type="text" 
            placeholder="상품 검색" 
            className="search-input"
          />
        </div>
        <div className="header-actions">
          <div className="notification-icon">
            <span className="bell">🔔</span>
            <span className="notification-badge">1</span>
          </div>
          <span className="cart-icon">🛒</span>
        </div>
      </div>
    </header>
  );
};

export default Header; 