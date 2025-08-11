import React, { useState } from 'react';
import '../styles/header_nav_Input.css';

// 헤더 검색 입력창 컴포넌트
// - 검색 아이콘과 입력창을 포함
// - 검색 기능 제공
const HeaderNavInput = ({ 
  onSearch, 
  placeholder = '검색어를 입력하세요', 
  className = '',
  defaultValue = '',
  onSubmit
}) => {
  const [searchTerm, setSearchTerm] = useState(defaultValue);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim() && onSearch) {
      onSearch(searchTerm.trim());
    }
    if (onSubmit) {
      onSubmit(searchTerm.trim());
    }
  };

  const handleInputChange = (e) => {
    console.log('입력값 변경:', e.target.value); // 디버깅용
    setSearchTerm(e.target.value);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  return (
    <form className={`header-nav-input ${className}`.trim()} onSubmit={handleSubmit}>
      <div className="input-wrapper">
        <svg
          className="search-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          width="20"
          height="20"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
        <input
          type="text"
          className="search-input"
          placeholder={placeholder}
          value={searchTerm}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          aria-label="검색"
        />
      </div>
    </form>
  );
};

export default HeaderNavInput;
