import React, { useState, useEffect } from 'react';
import { HomeShoppingHeader } from '../../layout/HeaderNav';
import KokProductSection from '../../components/KokProductSection';
import BottomNav from '../../layout/BottomNav';
import Loading from '../../components/Loading';
import '../../styles/kok_main.css';
import api from '../api';
import { useUser } from '../../contexts/UserContext';

// 상품 데이터 import
import { 
  discountProducts, 
  highSellingProducts, 
  nonDuplicatedProducts 
} from '../../data/products';

const KokMain = () => {
  const [kokFadeIn, setKokFadeIn] = useState(false);
  const [kokSearchQuery, setKokSearchQuery] = useState('');
  // API 데이터를 저장할 상태 추가 (초기값을 더미 데이터로 설정)
  const [kokProducts, setKokProducts] = useState(discountProducts);
  const [kokTopSellingProducts, setKokTopSellingProducts] = useState(highSellingProducts);
  const [kokStoreBestItems, setKokStoreBestItems] = useState(nonDuplicatedProducts);
  const [kokLoading, setKokLoading] = useState(true);
  
  // 사용자 정보 가져오기
  const { user, isLoggedIn } = useUser();
  
  // 토큰 상태 확인
  const hasValidToken = user?.token && user.isLoggedIn;



  // KOK API에서 할인 특가 상품 데이터를 가져오는 함수
  const fetchKokProducts = async () => {
    try {
      console.log('할인 특가 상품 API 호출 시작...');
      const response = await api.get('/api/kok/discounted');
      console.log('할인 특가 상품 API 응답:', response.data);
      
      // API 응답 구조에 맞게 데이터 처리
      if (response.data && response.data.products) {
        setKokProducts(response.data.products);
      } else {
        console.log('API 응답에 products 필드가 없어 임시 데이터를 사용합니다.');
        setKokProducts(discountProducts);
      }
    } catch (err) {
      console.error('KOK 상품 데이터 로딩 실패:', err);
      console.log('임시 데이터를 사용합니다.');
      // API 연결 실패 시 기존 데이터 사용
      setKokProducts(discountProducts);
    }
  };

  // KOK API에서 판매율 높은 상품 데이터를 가져오는 함수
  const fetchKokTopSellingProducts = async () => {
    try {
      console.log('판매율 높은 상품 API 호출 시작...');
      const response = await api.get('/api/kok/top-selling');
      console.log('판매율 높은 상품 API 응답:', response.data);
      
      // API 응답 구조에 맞게 데이터 처리
      if (response.data && response.data.products) {
        setKokTopSellingProducts(response.data.products);
      } else {
        console.log('API 응답에 products 필드가 없어 임시 데이터를 사용합니다.');
        setKokTopSellingProducts(highSellingProducts);
      }
    } catch (err) {
      console.error('KOK 판매율 높은 상품 데이터 로딩 실패:', err);
      console.log('임시 데이터를 사용합니다.');
      // API 연결 실패 시 기존 데이터 사용
      setKokTopSellingProducts(highSellingProducts);
    }
  };

  // KOK API에서 구매한 스토어 내 리뷰 많은 상품 데이터를 가져오는 함수
  const fetchKokStoreBestItems = async () => {
    try {
      console.log('스토어 베스트 상품 API 호출 시작...');
      const response = await api.get('/api/kok/store-best-items');
      console.log('스토어 베스트 상품 API 응답:', response.data);
      
      // API 응답 구조에 맞게 데이터 처리
      if (response.data && response.data.products) {
        setKokStoreBestItems(response.data.products);
      } else {
        console.log('API 응답에 products 필드가 없어 임시 데이터를 사용합니다.');
        setKokStoreBestItems(nonDuplicatedProducts);
      }
    } catch (err) {
      console.error('KOK 구매한 스토어 내 리뷰 많은 상품 데이터 로딩 실패:', err);
      console.log('임시 데이터를 사용합니다.');
      // API 연결 실패 시 기존 데이터 사용
      setKokStoreBestItems(nonDuplicatedProducts);
    }
  };

  // 검색 핸들러
  const handleKokSearch = (query) => {
    console.log('검색어:', query);
    // 여기에 실제 검색 로직을 구현할 수 있습니다
  };

  // 알림 클릭 핸들러
  const handleKokNotificationClick = () => {
    console.log('알림 클릭됨');
    // 여기에 알림 관련 로직을 구현할 수 있습니다
  };

  useEffect(() => {
    setKokFadeIn(true);
    
    // 모든 API 호출을 병렬로 처리
    const loadAllData = async () => {
      try {
        setKokLoading(true);
        
        // 사용자가 로그인되어 있고 유효한 토큰이 있을 때만 API 호출
        if (hasValidToken) {
          console.log('유효한 토큰이 있어 API 호출을 진행합니다.');
          await Promise.all([
            fetchKokProducts(),
            fetchKokTopSellingProducts(),
            fetchKokStoreBestItems()
          ]);
        } else {
          console.log('유효한 토큰이 없어 더미 데이터를 사용합니다.');
          // 더미 데이터 설정
          setKokProducts(discountProducts);
          setKokTopSellingProducts(highSellingProducts);
          setKokStoreBestItems(nonDuplicatedProducts);
        }
      } catch (error) {
        console.error('데이터 로딩 중 오류 발생:', error);
      } finally {
        setKokLoading(false);
      }
    };
    
    loadAllData();
  }, [hasValidToken]); // hasValidToken이 변경될 때마다 실행
  
  // 사용자 정보가 변경될 때마다 콘솔에 출력 (디버깅용)
  useEffect(() => {
    console.log('KokMain - 사용자 정보 상태:', {
      user: user,
      isLoggedIn: isLoggedIn,
      hasUser: !!user,
      userEmail: user?.email,
      hasToken: !!user?.token
    });
  }, [user, isLoggedIn]);

  return (
    <div className={`kok-home-shopping-main ${kokFadeIn ? 'kok-fade-in' : ''}`}>
      {/* 사용자 정보 디버깅용 표시 */}
      <div style={{ 
        background: '#f0f0f0', 
        padding: '10px', 
        margin: '10px', 
        borderRadius: '5px',
        fontSize: '12px'
      }}>
        <strong>사용자 정보:</strong> 
        {user ? (
          `${user.email} | 로그인: ${isLoggedIn ? '예' : '아니오'} | 토큰: ${user.token ? '있음' : '없음'} | 토큰길이: ${user.token?.length || 0}`
        ) : (
          '사용자 정보 없음'
        )}
      </div>
      
      <HomeShoppingHeader 
        searchQuery={kokSearchQuery}
        setSearchQuery={setKokSearchQuery}
        onSearch={handleKokSearch}
        onNotificationClick={handleKokNotificationClick}
      />
      
      <main className="kok-main-content">
        {kokLoading ? (
          <Loading message="데이터를 불러오는 중 ..." />
        ) : (
          <>
            <KokProductSection 
              title="할인 특가 상품" 
              products={kokProducts.slice(0, 12)} 
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
        
        <KokProductSection 
          title="판매율 높은 상품" 
          products={kokTopSellingProducts.slice(0, 3)} 
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
        
        <KokProductSection 
          title="구매한 스토어 내 리뷰 많은 상품" 
          products={kokStoreBestItems.slice(0, 5)} 
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
          </>
        )}
      </main>
      
      <BottomNav />
    </div>
  );
};

export default KokMain;
