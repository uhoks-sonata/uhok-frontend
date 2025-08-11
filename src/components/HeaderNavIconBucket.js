import React from 'react';
import '../styles/header_nav_Icon_bucket.css';

// 공용 헤더 네비게이션 장바구니(쇼핑백) 아이콘 버튼
// - stroke-only(검은 선) SVG
// - 기본 크기 24, 두께 2
// - 위치/간격 등 레이아웃은 사용하는 곳에서 조정
const HeaderNavIconBucket = ({
  onClick,
  ariaLabel = 'cart',
  size = 30,
  strokeWidth = 1.5,
  className = '',
  style = {},
}) => {
  return (
    <button
      type="button"
      className={`hn-bucket-btn ${className}`.trim()}
      onClick={onClick}
      aria-label={ariaLabel}
      style={style}
    >
      <svg
        className="hn-bucket-svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        width={size}
        height={size}
        aria-hidden="true"
      >
        {/* 쇼핑백: 바퀴 없는 형태 */}
        <rect x="6" y="7" width="12" height="12" rx="2" ry="2" />
        <path d="M9 7V5a3 3 0 0 1 6 0v2" />
      </svg>
    </button>
  );
};

export default HeaderNavIconBucket;


