import React from 'react';
import './NoImage.css';

const NoImage = ({ 
  text = "이미지가 없습니다.", 
  className = "", 
  style = {} 
}) => {
  return (
    <div 
      className={`no-image-container ${className}`}
      style={style}
    >
      <div className="no-image-content">
        <div className="no-image-icon">📷</div>
        <div className="no-image-text">{text}</div>
      </div>
    </div>
  );
};

export default NoImage;
