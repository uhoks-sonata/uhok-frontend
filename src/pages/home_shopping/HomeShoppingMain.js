import React, { useState, useEffect } from 'react';
import { HomeShoppingHeader } from '../../layout/HeaderNav';
import ProductSection from '../../components/ProductSection';
import BottomNav from '../../layout/BottomNav';
import '../../styles/home_shopping_main.css';

const HomeShoppingMain = () => {
  const [fadeIn, setFadeIn] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // 검색 핸들러
  const handleSearch = (query) => {
    console.log('검색어:', query);
    // 여기에 실제 검색 로직을 구현할 수 있습니다
  };

  // 알림 클릭 핸들러
  const handleNotificationClick = () => {
    console.log('알림 클릭됨');
    // 여기에 알림 관련 로직을 구현할 수 있습니다
  };

  // 더미 데이터
  const discountProducts = [
    {
      id: 1,
      name: "예천 청결고추 | 국내산 청결 햇고춧가루 4kg (500g 8팩)",
      originalPrice: 150000,
      discountPrice: 124000,
      discountRate: 17,
      image: "/test1.png",
      rating: 4.4,
      reviewCount: 23,
      isSpecial: true
    },
    {
      id: 1,
      name: "예천 청결고추 | 국내산 청결 햇고춧가루 4kg (500g 8팩)",
      originalPrice: 150000,
      discountPrice: 124000,
      discountRate: 17,
      image: "/test1.png",
      rating: 4.4,
      reviewCount: 23,
      isSpecial: true
    },
    {
      id: 1,
      name: "예천 청결고추 | 국내산 청결 햇고춧가루 4kg (500g 8팩)",
      originalPrice: 150000,
      discountPrice: 124000,
      discountRate: 17,
      image: "/test1.png",
      rating: 4.4,
      reviewCount: 23,
      isSpecial: true
    },
    {
      id: 1,
      name: "예천 청결고추 | 국내산 청결 햇고춧가루 4kg (500g 8팩)",
      originalPrice: 150000,
      discountPrice: 124000,
      discountRate: 17,
      image: "/test1.png",
      rating: 4.4,
      reviewCount: 23,
      isSpecial: true
    },
    {
      id: 1,
      name: "예천 청결고추 | 국내산 청결 햇고춧가루 4kg (500g 8팩)",
      originalPrice: 150000,
      discountPrice: 124000,
      discountRate: 17,
      image: "/test1.png",
      rating: 4.4,
      reviewCount: 23,
      isSpecial: true
    },
    {
      id: 1,
      name: "예천 청결고추 | 국내산 청결 햇고춧가루 4kg (500g 8팩)",
      originalPrice: 150000,
      discountPrice: 124000,
      discountRate: 17,
      image: "/test1.png",
      rating: 4.4,
      reviewCount: 23,
      isSpecial: true
    },
    {
      id: 1,
      name: "예천 청결고추 | 국내산 청결 햇고춧가루 4kg (500g 8팩)",
      originalPrice: 150000,
      discountPrice: 124000,
      discountRate: 17,
      image: "/test1.png",
      rating: 4.4,
      reviewCount: 23,
      isSpecial: true
    },
    {
      id: 1,
      name: "예천 청결고추 | 국내산 청결 햇고춧가루 4kg (500g 8팩)",
      originalPrice: 150000,
      discountPrice: 124000,
      discountRate: 17,
      image: "/test1.png",
      rating: 4.4,
      reviewCount: 23,
      isSpecial: true
    },
    {
      id: 1,
      name: "예천 청결고추 | 국내산 청결 햇고춧가루 4kg (500g 8팩)",
      originalPrice: 150000,
      discountPrice: 124000,
      discountRate: 17,
      image: "/test1.png",
      rating: 4.4,
      reviewCount: 23,
      isSpecial: true
    },
    {
      id: 1,
      name: "예천 청결고추 | 국내산 청결 햇고춧가루 4kg (500g 8팩)",
      originalPrice: 150000,
      discountPrice: 124000,
      discountRate: 17,
      image: "/test1.png",
      rating: 4.4,
      reviewCount: 23,
      isSpecial: true
    },
    {
      id: 1,
      name: "예천 청결고추 | 국내산 청결 햇고춧가루 4kg (500g 8팩)",
      originalPrice: 150000,
      discountPrice: 124000,
      discountRate: 17,
      image: "/test1.png",
      rating: 4.4,
      reviewCount: 23,
      isSpecial: true
    },
    {
      id: 1,
      name: "예천 청결고추 | 국내산 청결 햇고춧가루 4kg (500g 8팩)",
      originalPrice: 150000,
      discountPrice: 124000,
      discountRate: 17,
      image: "/test1.png",
      rating: 4.4,
      reviewCount: 23,
      isSpecial: true
    }
  ];

  const highSellingProducts = [
    {
      id: 2,
      name: "전라도식 파김치",
      originalPrice: 13600,
      discountPrice: 13600,
      discountRate: 51,
      image: "/test2.png",
      rating: 4.1,
      reviewCount: 17
    },
    {
      id: 2,
      name: "전라도식 파김치",
      originalPrice: 13600,
      discountPrice: 13600,
      discountRate: 51,
      image: "/test2.png",
      rating: 4.1,
      reviewCount: 17
    },
    {
      id: 2,
      name: "전라도식 파김치",
      originalPrice: 13600,
      discountPrice: 13600,
      discountRate: 51,
      image: "/test2.png",
      rating: 4.1,
      reviewCount: 17
    }
  ];

  const nonDuplicatedProducts = [
    {
      id: 3,
      name: "햅쌀",
      originalPrice: 25000,
      discountPrice: 20900,
      discountRate: 16,
      image: "/test3.png",
      rating: 4.8,
      reviewCount: 24,
      isSpecial: true
    },
    {
      id: 3,
      name: "햅쌀",
      originalPrice: 25000,
      discountPrice: 20900,
      discountRate: 16,
      image: "/test3.png",
      rating: 4.8,
      reviewCount: 24,
      isSpecial: true
    },
    {
      id: 3,
      name: "햅쌀",
      originalPrice: 25000,
      discountPrice: 20900,
      discountRate: 16,
      image: "/test3.png",
      rating: 4.8,
      reviewCount: 24,
      isSpecial: true
    },
    {
      id: 3,
      name: "햅쌀",
      originalPrice: 25000,
      discountPrice: 20900,
      discountRate: 16,
      image: "/test3.png",
      rating: 4.8,
      reviewCount: 24,
      isSpecial: true
    },
    {
      id: 3,
      name: "햅쌀",
      originalPrice: 25000,
      discountPrice: 20900,
      discountRate: 16,
      image: "/test3.png",
      rating: 4.8,
      reviewCount: 24,
      isSpecial: true
    }
  ];



  useEffect(() => {
    setFadeIn(true);
  }, []);

  return (
    <div className={`home-shopping-main ${fadeIn ? 'fade-in' : ''}`}>
      <HomeShoppingHeader 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onSearch={handleSearch}
        onNotificationClick={handleNotificationClick}
      />
      
      <main className="main-content">
        <ProductSection 
          title="할인 특가 상품" 
          products={discountProducts} 
          type="discount-grid"
          showMore={true}
          sectionStyle={{
            margin: '0 0 24px 0'
          }}
          containerStyle={{
            gap: '12px'
          }}
                     cardStyle={{
             boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
           }}
        />
        
        <ProductSection 
          title="판매율 높은 상품" 
          products={highSellingProducts} 
          type="fixed"
          showMore={true}
          sectionStyle={{
            margin: '0 0 24px 0'
          }}
          containerStyle={{
            gap: '4px'
          }}
                     cardStyle={{
             boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
           }}
        />
        
        <ProductSection 
          title="구매한 스토어 내 리뷰 많은 상품" 
          products={nonDuplicatedProducts} 
          type="non-duplicated-grid"
          showMore={true}
          sectionStyle={{
            margin: '0 0 24px 0'
          }}
          containerStyle={{
            gap: '14px'
          }}
                     cardStyle={{
             boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
           }}
        />


      </main>
      
      <BottomNav />
    </div>
  );
};

export default HomeShoppingMain;