import React, { useState, useEffect, useRef } from 'react';
import '../styles/upbtn.css';

const UpBtn = () => {
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef(null);

  // 스크롤 이벤트 핸들러
  const toggleVisibility = () => {
    // window 스크롤 확인
    const windowScrollY = window.pageYOffset;
    
    // 컨테이너 스크롤 확인 (kok-product-list-content)
    let containerScrollTop = 0;
    if (containerRef.current) {
      containerScrollTop = containerRef.current.scrollTop;
    }
    
    // 둘 중 하나라도 300px 이상 스크롤되면 버튼 표시
    const shouldShow = windowScrollY > 300 || containerScrollTop > 300;
    
    console.log('UpBtn Debug:', {
      windowScrollY,
      containerScrollTop,
      shouldShow,
      isVisible
    });
    
    if (shouldShow) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  // 맨 위로 스크롤하는 함수
  const scrollToTop = () => {
    // 컨테이너가 있으면 컨테이너를 맨 위로, 없으면 window를 맨 위로
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    } else {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    // window 스크롤 이벤트 리스너
    window.addEventListener('scroll', toggleVisibility);
    
    // 컨테이너 스크롤 이벤트 리스너
    const container = document.querySelector('.kok-product-list-content');
    if (container) {
      containerRef.current = container;
      container.addEventListener('scroll', toggleVisibility);
    }
    
    // 초기 상태 확인
    toggleVisibility();
    
    // 컴포넌트 언마운트 시 이벤트 리스너 제거
    return () => {
      window.removeEventListener('scroll', toggleVisibility);
      if (containerRef.current) {
        try {
          containerRef.current.removeEventListener('scroll', toggleVisibility);
        } catch (error) {
          console.log('컨테이너 이벤트 리스너 제거 중 오류:', error);
        }
        containerRef.current = null;
      }
    };
  }, []);

  return (
    <>
      {isVisible && (
        <button 
          className="up-btn"
          onClick={scrollToTop}
          aria-label="맨 위로 가기"
        >
          <svg 
            width="20" 
            height="20" 
            viewBox="0 0 24 24" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              d="M7 14L12 9L17 14" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
        </button>
      )}
    </>
  );
};

export default UpBtn;