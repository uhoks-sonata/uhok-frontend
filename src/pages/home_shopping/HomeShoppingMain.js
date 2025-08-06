import React, { useState, useEffect } from 'react';
import { HomeShoppingHeader } from '../../layout/HeaderNav';
import ProductSection from '../../components/ProductSection';
import BottomNav from '../../layout/BottomNav';
import '../../styles/home_shopping_main.css';

// 상품 데이터 import
import { 
  discountProducts, 
  highSellingProducts, 
  nonDuplicatedProducts 
} from '../../data/products';

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
           products={discountProducts.slice(0, 12)} 
           type="discount-grid"
           showMore={true}
           sectionStyle={{
             margin: '0 0 24px 0',
             padding: '0 0px'
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
          products={highSellingProducts.slice(0, 3)} 
          type="fixed"
          showMore={true}
          sectionStyle={{
            margin: '0 0 24px 0',
            padding: '0 0px'
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
            products={nonDuplicatedProducts.slice(0, 5)} 
            type="non-duplicated-grid"
            showMore={true}
            sectionStyle={{
              margin: '0 0 24px 0',
              padding: '0 0px'
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