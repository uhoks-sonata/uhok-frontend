import React, { useEffect, useRef } from 'react';
import ProductCard from './ProductCard';
import '../styles/product_section.css';

const ProductSection = ({ title, products, type = 'default', showMore = false }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    // grid 타입일 때만 마우스 드래그 기능 추가
    if (type === 'grid' && containerRef.current) {
      const container = containerRef.current;
      let isDown = false;
      let startX;
      let scrollLeft;

      const handleMouseDown = (e) => {
        isDown = true;
        container.classList.add('dragging');
        startX = e.pageX - container.offsetLeft;
        scrollLeft = container.scrollLeft;
        e.preventDefault(); // 기본 동작 방지
      };

      const handleMouseLeave = () => {
        isDown = false;
        container.classList.remove('dragging');
      };

      const handleMouseUp = () => {
        isDown = false;
        container.classList.remove('dragging');
      };

      const handleMouseMove = (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - container.offsetLeft;
        const walk = (x - startX) * 1.5; // 드래그 민감도 조정
        container.scrollLeft = scrollLeft - walk;
      };

      // 터치 이벤트도 추가
      const handleTouchStart = (e) => {
        isDown = true;
        container.classList.add('dragging');
        startX = e.touches[0].pageX - container.offsetLeft;
        scrollLeft = container.scrollLeft;
      };

      const handleTouchEnd = () => {
        isDown = false;
        container.classList.remove('dragging');
      };

      const handleTouchMove = (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.touches[0].pageX - container.offsetLeft;
        const walk = (x - startX) * 1.5;
        container.scrollLeft = scrollLeft - walk;
      };

      // 마우스 이벤트
      container.addEventListener('mousedown', handleMouseDown);
      container.addEventListener('mouseleave', handleMouseLeave);
      container.addEventListener('mouseup', handleMouseUp);
      container.addEventListener('mousemove', handleMouseMove);

      // 터치 이벤트
      container.addEventListener('touchstart', handleTouchStart, { passive: false });
      container.addEventListener('touchend', handleTouchEnd);
      container.addEventListener('touchmove', handleTouchMove, { passive: false });

      // 휠 이벤트 추가
      const handleWheel = (e) => {
        e.preventDefault();
        container.scrollLeft += e.deltaY;
      };
      container.addEventListener('wheel', handleWheel, { passive: false });

      return () => {
        // 마우스 이벤트 정리
        container.removeEventListener('mousedown', handleMouseDown);
        container.removeEventListener('mouseleave', handleMouseLeave);
        container.removeEventListener('mouseup', handleMouseUp);
        container.removeEventListener('mousemove', handleMouseMove);

        // 터치 이벤트 정리
        container.removeEventListener('touchstart', handleTouchStart);
        container.removeEventListener('touchend', handleTouchEnd);
        container.removeEventListener('touchmove', handleTouchMove);

        // 휠 이벤트 정리
        container.removeEventListener('wheel', handleWheel);
      };
    }
  }, [type]);

  return (
    <div className="product-section">
      <div className="section-header">
        <h2 className="section-title">{title}</h2>
        {showMore && (
          <button className="more-button">
            더보기 <span className="arrow">{'>'}</span>
          </button>
        )}
        {!showMore && <span className="arrow-icon">{'>'}</span>}
      </div>
      <div 
        ref={containerRef}
        className={`products-container ${type}`}
      >
        {products.map((product) => (
          <ProductCard 
            key={product.id} 
            product={product} 
            type={type}
          />
        ))}
      </div>
    </div>
  );
};

export default ProductSection; 