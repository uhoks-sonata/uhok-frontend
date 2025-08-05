import React, { useState, useEffect } from 'react';
import Header from '../../components/Header';
import ProductSection from '../../components/ProductSection';
import BottomNav from '../../layout/BottomNav';
import '../../styles/home_shopping_main.css';

const HomeShoppingMain = () => {
  const [fadeIn, setFadeIn] = useState(false);

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
      id: 2,
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
      id: 3,
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
      id: 4,
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
      id: 5,
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
      id: 6,
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
      id: 7,
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
      id: 8,
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
      id: 9,
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
      id: 10,
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
      id: 11,
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
      id: 12,
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
      id: 9,
      name: "국내산 청결 햇 고춧가루 4kg (500g 8팩)",
      originalPrice: 150000,
      discountPrice: 124000,
      discountRate: 17,
      image: "/test1.png",
      rating: 4.4,
      reviewCount: 23
    },
    {
      id: 10,
      name: "국내산 청결 햇 고춧가루 4kg (500g 8팩)",
      originalPrice: 150000,
      discountPrice: 124000,
      discountRate: 17,
      image: "/test1.png",
      rating: 4.4,
      reviewCount: 23
    },
    {
      id: 11,
      name: "국내산 청결 햇 고춧가루 4kg (500g 8팩)",
      originalPrice: 150000,
      discountPrice: 124000,
      discountRate: 17,
      image: "/test1.png",
      rating: 4.4,
      reviewCount: 23
    }
  ];

  const nonDuplicatedProducts = [
    {
      id: 12,
      name: "붉은빛깔 고추가루",
      originalPrice: 150000,
      discountPrice: 124000,
      discountRate: 17,
      image: "/test1.png",
      rating: 4.4,
      reviewCount: 23,
      isSpecial: true
    },
    {
      id: 13,
      name: "붉은빛깔 고추가루",
      originalPrice: 150000,
      discountPrice: 124000,
      discountRate: 17,
      image: "/test1.png",
      rating: 4.4,
      reviewCount: 23,
      isSpecial: true
    }
  ];

  const recommendedProducts = [
    {
      id: 14,
      name: "추천 고춧가루 1kg",
      originalPrice: 45000,
      discountPrice: 38000,
      discountRate: 15,
      image: "/test1.png",
      rating: 4.6,
      reviewCount: 45,
      isSpecial: true
    },
    {
      id: 15,
      name: "추천 고춧가루 1kg",
      originalPrice: 45000,
      discountPrice: 38000,
      discountRate: 15,
      image: "/test1.png",
      rating: 4.6,
      reviewCount: 45,
      isSpecial: true
    },
    {
      id: 16,
      name: "추천 고춧가루 1kg",
      originalPrice: 45000,
      discountPrice: 38000,
      discountRate: 15,
      image: "/test1.png",
      rating: 4.6,
      reviewCount: 45,
      isSpecial: true
    },
    {
      id: 17,
      name: "추천 고춧가루 1kg",
      originalPrice: 45000,
      discountPrice: 38000,
      discountRate: 15,
      image: "/test1.png",
      rating: 4.6,
      reviewCount: 45,
      isSpecial: true
    }
  ];

  const newProducts = [
    {
      id: 18,
      name: "신상 고춧가루 2kg",
      originalPrice: 80000,
      discountPrice: 65000,
      discountRate: 19,
      image: "/test1.png",
      rating: 4.8,
      reviewCount: 12
    },
    {
      id: 19,
      name: "신상 고춧가루 2kg",
      originalPrice: 80000,
      discountPrice: 65000,
      discountRate: 19,
      image: "/test1.png",
      rating: 4.8,
      reviewCount: 12
    },
    {
      id: 20,
      name: "신상 고춧가루 2kg",
      originalPrice: 80000,
      discountPrice: 65000,
      discountRate: 19,
      image: "/test1.png",
      rating: 4.8,
      reviewCount: 12
    }
  ];

  useEffect(() => {
    setFadeIn(true);
  }, []);

  return (
    <div className={`home-shopping-main ${fadeIn ? 'fade-in' : ''}`}>
      <Header />
      
      <main className="main-content">
        <ProductSection 
          title="할인 특가 상품" 
          products={discountProducts} 
          type="grid"
          showMore={true}
        />
        
        <ProductSection 
          title="판매율 높은 상품" 
          products={highSellingProducts} 
          type="fixed"
          showMore={true}
        />
        
        <ProductSection 
          title="최근 구매 상품과 중복되지 않는 상품" 
          products={nonDuplicatedProducts} 
          type="special"
          showMore={true}
        />

        <ProductSection 
          title="추천 상품" 
          products={recommendedProducts} 
          type="grid"
          showMore={true}
        />

        <ProductSection 
          title="신상품" 
          products={newProducts} 
          type="fixed"
          showMore={true}
        />
      </main>
      
      <BottomNav />
    </div>
  );
};

export default HomeShoppingMain;
