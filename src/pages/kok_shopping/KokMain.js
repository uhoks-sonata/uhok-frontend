import React, { useState, useEffect } from 'react';
import { HomeShoppingHeader } from '../../layout/HeaderNav';
import KokProductSection from '../../components/KokProductSection';
import BottomNav from '../../layout/BottomNav';
import Loading from '../../components/Loading';
import '../../styles/kok_main.css';
import api from '../api';
import { ensureToken } from '../../utils/authUtils';
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
  // API 데이터를 저장할 상태 추가
  const [kokProducts, setKokProducts] = useState([]);
  const [kokTopSellingProducts, setKokTopSellingProducts] = useState([]);
  const [kokStoreBestItems, setKokStoreBestItems] = useState([]);
  const [kokLoading, setKokLoading] = useState(true);
  
  // 사용자 정보 가져오기
  const { user, isLoggedIn } = useUser();



  // KOK API에서 할인 특가 상품 데이터를 가져오는 함수
  const fetchKokProducts = async () => {
    try {
      console.log('할인 특가 상품 API 호출 시작...');
      const response = await api.get('/api/kok/discounted');
      console.log('할인 특가 상품 API 응답:', response.data);
      
      // API 응답 구조에 맞게 데이터 처리
      console.log('할인 특가 상품 API 응답 구조:', response.data);
      if (response.data && response.data.products) {
        console.log('할인 특가 상품 데이터 설정:', response.data.products.length);
        // API 응답을 KokProductCard가 기대하는 형식으로 변환
        const transformedProducts = response.data.products.map(product => ({
          id: product.kok_product_id,
          name: product.kok_product_name,
          originalPrice: product.kok_discounted_price / (1 - product.kok_discount_rate / 100), // 할인율로 원가 계산
          discountPrice: product.kok_discounted_price,
          discountRate: product.kok_discount_rate,
          image: product.kok_thumbnail,
          rating: 4.5, // API에 없으므로 기본값
          reviewCount: 128, // API에 없으므로 기본값
          storeName: product.kok_store_name
        }));
        console.log('변환된 상품 데이터:', transformedProducts);
        setKokProducts(transformedProducts);
      } else if (response.data && Array.isArray(response.data)) {
        console.log('API 응답이 배열 형태입니다.');
        setKokProducts(response.data);
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
      console.log('판매율 높은 상품 API 응답 구조:', response.data);
      if (response.data && response.data.products) {
        console.log('판매율 높은 상품 데이터 설정:', response.data.products.length);
        // API 응답을 KokProductCard가 기대하는 형식으로 변환
        const transformedProducts = response.data.products.map(product => ({
          id: product.kok_product_id,
          name: product.kok_product_name,
          originalPrice: product.kok_discounted_price / (1 - product.kok_discount_rate / 100), // 할인율로 원가 계산
          discountPrice: product.kok_discounted_price,
          discountRate: product.kok_discount_rate,
          image: product.kok_thumbnail,
          rating: 4.5, // API에 없으므로 기본값
          reviewCount: 128, // API에 없으므로 기본값
          storeName: product.kok_store_name
        }));
        console.log('변환된 상품 데이터:', transformedProducts);
        setKokTopSellingProducts(transformedProducts);
      } else if (response.data && Array.isArray(response.data)) {
        console.log('API 응답이 배열 형태입니다.');
        setKokTopSellingProducts(response.data);
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

  // 구매한 스토어 내 리뷰 많은 상품 데이터 (더미 데이터 사용)
  const fetchKokStoreBestItems = async () => {
    try {
      console.log('스토어 베스트 상품 - 더미 데이터 사용');
      // 더미 데이터 사용
      setKokStoreBestItems(nonDuplicatedProducts);
    } catch (err) {
      console.error('스토어 베스트 상품 데이터 로딩 실패:', err);
      console.log('더미 데이터를 사용합니다.');
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
        
        // 토큰 확인 및 검증
        const token = localStorage.getItem('access_token');
        const tokenType = localStorage.getItem('token_type');
        
        console.log('KokMain - 토큰 정보 확인:', {
          hasToken: !!token,
          tokenType: tokenType,
          tokenPreview: token ? token.substring(0, 20) + '...' : '없음'
        });
        
        if (!token) {
          console.log('토큰이 없어서 로그인 페이지로 이동');
          window.location.href = '/';
          return;
        }
        
        // 토큰 유효성 검증 (JWT 형식 확인)
        const tokenParts = token.split('.');
        if (tokenParts.length !== 3) {
          console.warn('잘못된 토큰 형식, 로그인 페이지로 이동');
          localStorage.removeItem('access_token');
          localStorage.removeItem('token_type');
          window.location.href = '/';
          return;
        }
        
        // 토큰이 유효하면 API 호출
        await ensureToken();
        
        await Promise.all([
          fetchKokProducts(),
          fetchKokTopSellingProducts(),
          fetchKokStoreBestItems()
        ]);
      } catch (error) {
        console.error('데이터 로딩 중 오류 발생:', error);
      } finally {
        setKokLoading(false);
      }
    };
    
    loadAllData();
  }, []);
  
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

  // 데이터 상태 디버깅
  useEffect(() => {
    console.log('KokMain - 데이터 상태:', {
      kokProducts: kokProducts.length,
      kokTopSellingProducts: kokTopSellingProducts.length,
      kokStoreBestItems: kokStoreBestItems.length,
      kokLoading: kokLoading
    });
  }, [kokProducts, kokTopSellingProducts, kokStoreBestItems, kokLoading]);

  return (
    <div className={`kok-home-shopping-main ${kokFadeIn ? 'kok-fade-in' : ''}`}>
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
                boxShadow: 'none'
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
            boxShadow: 'none'
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
            boxShadow: 'none'
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