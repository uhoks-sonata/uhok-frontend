import React, { useState, useEffect, useRef } from 'react';
import '../styles/upbtn.css';

const UpBtn = () => {
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef(null);

  // 스크롤 이벤트 핸들러
  const toggleVisibility = () => {
    // window 스크롤 확인
    const windowScrollY = window.pageYOffset;
    
    // 컨테이너 스크롤 확인 (여러 컨테이너)
    let containerScrollTop = 0;
    if (containerRef.current) {
      containerScrollTop = containerRef.current.scrollTop;
    }
    
         // 둘 중 하나라도 300px 이상 스크롤되면 버튼 표시
     const shouldShow = windowScrollY > 300 || containerScrollTop > 300;
     
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
    
    // 컨테이너 스크롤 이벤트 리스너 (여러 컨테이너 감지)
    const containers = [
      '.kok-product-list-content',  // KokProductListPage용
      '.product-content',           // KokProductDetail용
      '.main-schedule-content',     // Main 페이지용
      '.schedule-timeline',         // Schedule 페이지용
      '.schedule-content-main'      // Schedule 페이지용 (추가)
    ];
    
    // DOM이 완전히 로드된 후 컨테이너 찾기
    const findContainers = () => {
             containers.forEach(selector => {
         const container = document.querySelector(selector);
         if (container) {
           container.addEventListener('scroll', toggleVisibility);
           // 첫 번째 발견된 컨테이너를 기본값으로 설정
           if (!containerRef.current) {
             containerRef.current = container;
           }
         }
       });
    };
    
    // 즉시 찾기 시도
    findContainers();
    
         // DOM 변경 감지를 위한 MutationObserver 추가
     const observer = new MutationObserver(() => {
       if (!containerRef.current) {
         findContainers();
       }
     });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    // 초기 상태 확인
    toggleVisibility();
    
    // 컴포넌트 언마운트 시 이벤트 리스너 제거
    return () => {
      window.removeEventListener('scroll', toggleVisibility);
      observer.disconnect();
             if (containerRef.current) {
         try {
           containerRef.current.removeEventListener('scroll', toggleVisibility);
         } catch (error) {
           // 에러 무시
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