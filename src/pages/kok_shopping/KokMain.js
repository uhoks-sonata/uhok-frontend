import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// Header removed
import KokProductSection from '../../components/KokProductSection';
import BottomNav from '../../layout/BottomNav';
import Loading from '../../components/Loading';
import HeaderNavMain from '../../layout/HeaderNavKokMain';
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
  const navigate = useNavigate();
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
      const response = await api.get('/api/kok/discounted', {
        params: {
          page: 1,
          size: 20
        }
      });
      console.log('할인 특가 상품 API 응답:', response.data);
      
      // API 응답 구조에 맞게 데이터 처리
      console.log('할인 특가 상품 API 응답 구조:', response.data);
      if (response.data && response.data.products) {
        console.log('할인 특가 상품 데이터 설정:', response.data.products.length);
        
        // 첫 번째 상품의 원본 데이터 구조 확인
        if (response.data.products.length > 0) {
          const firstProduct = response.data.products[0];
          console.log('첫 번째 상품 원본 데이터:', firstProduct);
          console.log('별점 관련 필드들:', {
            kok_review_score: firstProduct.kok_review_score,
            kok_review_cnt: firstProduct.kok_review_cnt
          });
        }
        
        // 백엔드에서 직접 제공하는 별점과 리뷰 수 사용
        const transformedProducts = response.data.products.map(product => ({
          id: product.kok_product_id,
          name: product.kok_product_name,
          originalPrice: product.kok_discounted_price / (1 - product.kok_discount_rate / 100), // 할인율로 원가 계산
          discountPrice: product.kok_discounted_price,
          discountRate: product.kok_discount_rate,
          image: product.kok_thumbnail,
          rating: product.kok_review_score || product.kok_rating || 0, // 백엔드에서 제공하는 별점 또는 기본값
          reviewCount: product.kok_review_cnt || product.kok_review_count || 0, // 백엔드에서 제공하는 리뷰 수 또는 기본값
          storeName: product.kok_store_name
        }));
        
        // 할인 특가 상품은 백엔드에서 별점/리뷰 수를 제공하지 않으므로 개별 API 호출
        const productsWithReviews = await Promise.all(
          transformedProducts.map(async (product) => {
            try {
              const reviewResponse = await api.get(`/api/kok/product/${product.id}/reviews`);
              console.log(`상품 ${product.id} 리뷰 통계:`, reviewResponse.data);
              
              let rating = 0;
              let reviewCount = 0;
              
              if (reviewResponse.data?.stats) {
                rating = reviewResponse.data.stats.kok_rating ||
                         reviewResponse.data.stats.rating ||
                         reviewResponse.data.stats.avg_rating ||
                         reviewResponse.data.stats.average_rating ||
                         reviewResponse.data.stats.score ||
                         0;
                
                reviewCount = reviewResponse.data.stats.kok_review_cnt ||
                             reviewResponse.data.stats.review_count ||
                             reviewResponse.data.stats.review_cnt ||
                             reviewResponse.data.stats.total_reviews ||
                             0;
              }
              
              console.log(`상품 ${product.id} 추출된 데이터:`, { rating, reviewCount });
              
              return {
                ...product,
                rating: rating,
                reviewCount: reviewCount
              };
            } catch (reviewErr) {
              console.error(`상품 ${product.id} 리뷰 통계 로딩 실패:`, reviewErr);
              return {
                ...product,
                rating: 0,
                reviewCount: 0
              };
            }
          })
        );
        
        console.log('변환된 상품 데이터:', productsWithReviews);
        console.log('변환된 상품의 별점과 리뷰수:', productsWithReviews.map(p => ({ name: p.name, rating: p.rating, reviewCount: p.reviewCount })));
        setKokProducts(productsWithReviews);
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
      const response = await api.get('/api/kok/top-selling', {
        params: {
          page: 1,
          size: 20,
          sort_by: 'review_count' // 리뷰 개수 순으로 정렬 (기본값)
        }
      });
      console.log('판매율 높은 상품 API 응답:', response.data);
      
      // API 응답 구조에 맞게 데이터 처리
      console.log('판매율 높은 상품 API 응답 구조:', response.data);
      if (response.data && response.data.products) {
        console.log('판매율 높은 상품 데이터 설정:', response.data.products.length);
        
        // 백엔드에서 직접 제공하는 별점과 리뷰 수 사용
        const transformedProducts = response.data.products.map(product => ({
          id: product.kok_product_id,
          name: product.kok_product_name,
          originalPrice: product.kok_discounted_price / (1 - product.kok_discount_rate / 100), // 할인율로 원가 계산
          discountPrice: product.kok_discounted_price,
          discountRate: product.kok_discount_rate,
          image: product.kok_thumbnail,
          rating: product.kok_review_score || product.kok_rating || 4.5, // 백엔드에서 제공하는 별점 또는 임시 값
          reviewCount: product.kok_review_cnt || product.kok_review_count || 25, // 백엔드에서 제공하는 리뷰 수 또는 임시 값
          storeName: product.kok_store_name
        }));
        
        console.log('변환된 상품 데이터:', transformedProducts);
        console.log('변환된 상품의 별점과 리뷰수:', transformedProducts.map(p => ({ name: p.name, rating: p.rating, reviewCount: p.reviewCount })));
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

  // 구매한 스토어 내 리뷰 많은 상품 데이터를 가져오는 함수
  const fetchKokStoreBestItems = async () => {
    try {
      console.log('스토어 베스트 상품 API 호출 시작...');
      const response = await api.get('/api/kok/store-best-items', {
        params: {
          sort_by: 'review_count' // 리뷰 개수 순으로 정렬 (기본값)
        }
      });
      console.log('스토어 베스트 상품 API 응답:', response.data);
      
      if (response.data && response.data.products) {
        console.log('스토어 베스트 상품 데이터 설정:', response.data.products.length);
        
        // 첫 번째 상품의 원본 데이터 구조 확인
        if (response.data.products.length > 0) {
          const firstProduct = response.data.products[0];
          console.log('첫 번째 상품 원본 데이터:', firstProduct);
          console.log('별점 관련 필드들:', {
            kok_rating: firstProduct.kok_rating,
            rating: firstProduct.rating,
            kok_review_count: firstProduct.kok_review_count,
            review_count: firstProduct.review_count,
            reviewCount: firstProduct.reviewCount
          });
        }
        
        // 백엔드에서 직접 제공하는 별점과 리뷰 수 사용
        const transformedProducts = response.data.products.map(product => ({
          id: product.kok_product_id,
          name: product.kok_product_name,
          originalPrice: product.kok_discounted_price / (1 - product.kok_discount_rate / 100),
          discountPrice: product.kok_discounted_price,
          discountRate: product.kok_discount_rate,
          image: product.kok_thumbnail,
          rating: product.kok_review_score || product.kok_rating || 4.8, // 백엔드에서 제공하는 별점 또는 임시 값
          reviewCount: product.kok_review_cnt || product.kok_review_count || 35, // 백엔드에서 제공하는 리뷰 수 또는 임시 값
          storeName: product.kok_store_name
        }));
        
        console.log('변환된 상품 데이터:', transformedProducts);
        console.log('변환된 상품의 별점과 리뷰수:', transformedProducts.map(p => ({ name: p.name, rating: p.rating, reviewCount: p.reviewCount })));
        setKokStoreBestItems(transformedProducts);
      } else if (response.data && Array.isArray(response.data)) {
        console.log('API 응답이 배열 형태입니다.');
        setKokStoreBestItems(response.data);
      } else {
        console.log('API 응답에 products 필드가 없어 임시 데이터를 사용합니다.');
        setKokStoreBestItems(nonDuplicatedProducts);
      }
    } catch (err) {
      console.error('KOK 스토어 베스트 상품 데이터 로딩 실패:', err);
      console.log('임시 데이터를 사용합니다.');
      // API 연결 실패 시 기존 데이터 사용
      setKokStoreBestItems(nonDuplicatedProducts);
    }
  };

  // 검색 핸들러 (콕 쇼핑몰 타입으로 검색 페이지 이동)
  const handleKokSearch = (query) => {
    console.log('콕 쇼핑몰 검색어:', query);
    // 콕 쇼핑몰 타입으로 검색 페이지로 이동
    if (query && query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}&type=kok`);
    } else {
      navigate('/search?type=kok');
    }
  };

  // 알림 클릭 핸들러
  const handleKokNotificationClick = () => {
    console.log('알림 클릭됨');
    navigate('/notifications');
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
      <HeaderNavMain 
        title="콕 쇼핑몰" 
        onNotificationsClick={handleKokNotificationClick}
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