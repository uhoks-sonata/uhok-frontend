import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
// Header removed

import '../../styles/kok_product_list_page.css';
import HeaderNavProductList from '../../layout/HeaderNavProductList';
import UpBtn from '../../components/UpBtn';
import emptyHeartIcon from '../../assets/heart_empty.png';
import filledHeartIcon from '../../assets/heart_filled.png';
import api from '../api';
import { ensureToken } from '../../utils/authUtils';

const KokProductListPage = () => {
  const { sectionType } = useParams();
  const navigate = useNavigate();
  const [kokProducts, setKokProducts] = useState([]);
  const [kokSectionTitle, setKokSectionTitle] = useState('');
  const [kokSearchQuery, setKokSearchQuery] = useState('');
  const [kokWishlistedProducts, setKokWishlistedProducts] = useState(new Set());
  
  // 무한 스크롤을 위한 상태 변수들
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  
  // KOK API에서 할인 특가 상품 데이터를 가져오는 함수
  const fetchKokProducts = async (page = 1) => {
    try {
      const response = await api.get('/api/kok/discounted', {
        params: {
          page: page,
          size: 20
        }
      });
      console.log('할인 특가 상품 API 응답:', response.data);
      
      // API 응답 구조에 맞게 데이터 처리
      if (response.data && response.data.products) {
        // 백엔드에서 직접 제공하는 별점과 리뷰 수 사용
        const productsWithReviews = response.data.products.map(product => ({
          ...product,
          rating: product.kok_review_score || 0, // 백엔드에서 직접 제공하는 별점
          reviewCount: product.kok_review_cnt || 0 // 백엔드에서 직접 제공하는 리뷰 수
        }));
        
        console.log('리뷰 통계가 포함된 할인 특가 상품 데이터:', productsWithReviews);
        
        return productsWithReviews;
      } else {
        console.log('API 응답에 products 필드가 없습니다.');
        return [];
      }
    } catch (err) {
      console.error('KOK 상품 데이터 로딩 실패:', err);
      return [];
    }
  };

  // KOK API에서 판매율 높은 상품 데이터를 가져오는 함수
  const fetchKokTopSellingProducts = async (page = 1) => {
    try {
      const response = await api.get('/api/kok/top-selling', {
        params: {
          page: page,
          size: 20,
          sort_by: 'review_count' // 리뷰 개수 순으로 정렬 (기본값)
        }
      });
      console.log('판매율 높은 상품 API 응답:', response.data);
      
      // API 응답 구조에 맞게 데이터 처리
      if (response.data && response.data.products) {
        // 백엔드에서 직접 제공하는 별점과 리뷰 수 사용
        const productsWithReviews = response.data.products.map(product => ({
          ...product,
          rating: product.kok_review_score || 0, // 백엔드에서 직접 제공하는 별점
          reviewCount: product.kok_review_cnt || 0 // 백엔드에서 직접 제공하는 리뷰 수
        }));
        
        console.log('리뷰 통계가 포함된 판매율 높은 상품 데이터:', productsWithReviews);
        
        return productsWithReviews;
      } else {
        console.log('API 응답에 products 필드가 없습니다.');
        return [];
      }
    } catch (err) {
      console.error('KOK 판매율 높은 상품 데이터 로딩 실패:', err);
      return [];
    }
  };

  // KOK API에서 구매한 스토어 내 리뷰 많은 상품 데이터를 가져오는 함수
  const fetchKokStoreBestItems = async (page = 1) => {
    try {
      const response = await api.get('/api/kok/store-best-items', {
        params: {
          sort_by: 'review_count' // 리뷰 개수 순으로 정렬 (기본값)
        }
        // 페이지네이션 파라미터 없음 - 명세서에 따르면 10개 고정
      });
      console.log('스토어 베스트 상품 API 응답:', response.data);
      
      // API 응답 구조에 맞게 데이터 처리
      if (response.data && response.data.products) {
        // 백엔드에서 직접 제공하는 별점과 리뷰 수 사용
        const productsWithReviews = response.data.products.map(product => ({
          ...product,
          rating: product.kok_review_score || 0, // 백엔드에서 직접 제공하는 별점
          reviewCount: product.kok_review_cnt || 0 // 백엔드에서 직접 제공하는 리뷰 수
        }));
        
        console.log('리뷰 통계가 포함된 스토어 베스트 상품 데이터:', productsWithReviews);
        
        // 스토어 베스트는 10개 고정이므로 더 로드할 상품이 없음
        return productsWithReviews;
      } else {
        console.log('API 응답에 products 필드가 없습니다.');
        return [];
      }
    } catch (err) {
      console.error('KOK 구매한 스토어 내 리뷰 많은 상품 데이터 로딩 실패:', err);
      return [];
    }
  };

  useEffect(() => {
    const loadKokProducts = async () => {
      console.log('🔄 초기 상품 로딩 시작');
      
      try {
        // 토큰이 없으면 임시 로그인 시도
        await ensureToken();
        
        switch (sectionType) {
          case 'discount':
            const kokProducts = await fetchKokProducts(1);
            setKokProducts(kokProducts);
            setKokSectionTitle('할인 특가 상품');
            setHasMore(kokProducts.length === 20); // 20개면 더 로드 가능
            console.log('✅ 할인 특가 상품 로드 완료:', kokProducts.length, '개');
            break;
          case 'high-selling':
            const kokTopSellingProducts = await fetchKokTopSellingProducts(1);
            setKokProducts(kokTopSellingProducts);
            setKokSectionTitle('판매율 높은 상품');
            setHasMore(kokTopSellingProducts.length === 20); // 20개면 더 로드 가능
            console.log('✅ 판매율 높은 상품 로드 완료:', kokTopSellingProducts.length, '개');
            break;
          case 'reviews':
            const kokStoreBestItems = await fetchKokStoreBestItems(1);
            setKokProducts(kokStoreBestItems);
            setKokSectionTitle('구매한 스토어 내 리뷰 많은 상품');
            setHasMore(false); // 스토어 베스트는 10개 고정
            console.log('✅ 스토어 베스트 상품 로드 완료:', kokStoreBestItems.length, '개');
            break;
          default:
            setKokProducts([]);
            setKokSectionTitle('제품 목록');
            setHasMore(false);
            console.log('❌ 알 수 없는 섹션 타입:', sectionType);
        }
      } catch (error) {
        console.error('❌ 상품 로딩 중 오류:', error);
      }
    };
    loadKokProducts();
  }, [sectionType]);

  // 더 많은 상품을 로드하는 함수
  const loadMoreProducts = async () => {
    if (loadingMore || !hasMore) return;
    
    console.log('🔄 더 많은 상품 로드 시작 - 페이지:', currentPage + 1);
    setLoadingMore(true);
    
    try {
      let newProducts = [];
      
      switch (sectionType) {
        case 'discount':
          newProducts = await fetchKokProducts(currentPage + 1);
          break;
        case 'high-selling':
          newProducts = await fetchKokTopSellingProducts(currentPage + 1);
          break;
        case 'reviews':
          // 스토어 베스트는 10개 고정이므로 더 로드하지 않음
          console.log('⚠️ 스토어 베스트는 10개 고정이므로 더 로드하지 않음');
          setHasMore(false);
          setLoadingMore(false);
          return;
        default:
          console.log('❌ 알 수 없는 섹션 타입:', sectionType);
          setLoadingMore(false);
          return;
      }
      
      if (newProducts && newProducts.length > 0) {
        // 중복 제거를 위해 기존 상품 ID들을 Set으로 관리
        const existingIds = new Set(kokProducts.map(p => p.kok_product_id || p.id));
        const uniqueNewProducts = newProducts.filter(product => {
          const productId = product.kok_product_id || product.id;
          return !existingIds.has(productId);
        });
        
        if (uniqueNewProducts.length > 0) {
          setKokProducts(prev => [...prev, ...uniqueNewProducts]);
          setCurrentPage(prev => prev + 1);
          console.log('✅ 새로운 상품 추가 완료:', uniqueNewProducts.length, '개');
          
          // 20개 미만이면 더 이상 로드할 상품이 없음
          if (newProducts.length < 20) {
            setHasMore(false);
            console.log('📄 마지막 페이지 도달 - 더 이상 로드할 상품이 없음');
          }
        } else {
          console.log('⚠️ 중복 제거 후 추가할 상품이 없음');
          setHasMore(false);
        }
      } else {
        console.log('📄 더 이상 로드할 상품이 없음');
        setHasMore(false);
      }
    } catch (error) {
      console.error('❌ 더 많은 상품 로드 중 오류:', error);
    } finally {
      setLoadingMore(false);
    }
  };

  // 컨테이너 스크롤 y좌표 감지용 이벤트 리스너
  useEffect(() => {
    const handleContainerScroll = () => {
      // .kok-product-list-content 요소의 스크롤 위치 확인
      const container = document.querySelector('.kok-product-list-content');
      if (container) {
        const scrollTop = container.scrollTop;
        const scrollHeight = container.scrollHeight;
        const clientHeight = container.clientHeight;
        
        // 스크롤이 최하단에 도달했는지 확인 (50px 여유)
        const isAtBottom = scrollTop + clientHeight >= scrollHeight - 50;
        if (isAtBottom && hasMore && !loadingMore) {
          console.log('🎯 스크롤 최하단 도달! 새로운 상품 로드 시작');
          loadMoreProducts();
        }
      }
    };

    // 컨테이너에 스크롤 이벤트 리스너 등록
    const container = document.querySelector('.kok-product-list-content');
    if (container) {
      container.addEventListener('scroll', handleContainerScroll);
      
      // 초기값 설정
      handleContainerScroll();
    }
    
    return () => {
      if (container) {
        container.removeEventListener('scroll', handleContainerScroll);
      }
    };
  }, [hasMore, loadingMore]);

  const handleKokBack = () => {
    navigate(-1);
  };

  const handleKokSearch = (query) => {
    console.log('검색 실행:', query);
  };

  const handleKokNotificationClick = () => {
    console.log('알림 클릭');
    navigate('/notifications');
  };

  const handleKokCartClick = () => {
    console.log('장바구니 클릭');
    navigate('/cart');
  };

  const handleKokProductClick = (productId) => {
    navigate(`/kok/product/${productId}`);
  };

  const handleKokWishlistClick = (productId, event) => {
    event.stopPropagation();
    setKokWishlistedProducts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) {
        newSet.delete(productId);
      } else {
        newSet.add(productId);
      }
      return newSet;
    });
    
    // 애니메이션 효과 추가
    const heartIcon = event.currentTarget;
    if (heartIcon) {
      heartIcon.style.transform = 'scale(1.2)';
      setTimeout(() => {
        heartIcon.style.transform = 'scale(1)';
      }, 150);
    }
  };

  return (
    <div className="kok-product-list-page">
      <HeaderNavProductList title={kokSectionTitle || '상품 리스트'} onBackClick={handleKokBack} onNotificationsClick={handleKokNotificationClick} />
      
      <div className="kok-content">
        
        <div className="kok-section-header">
          <h1 className="kok-page-title">{kokSectionTitle}</h1>
          <p className="kok-product-count">총 {kokProducts.length}개의 상품</p>
        </div>
        
        <div className="kok-product-list-content">
          <div className="kok-products-grid">
            {kokProducts.map((product, index) => (
              <div
                key={`${product.kok_product_id || product.id}-${index}`}
                className="kok-product-card"
                onClick={() => handleKokProductClick(product.kok_product_id || product.id)}
              >
                <div className="kok-product-image-container">
                  <img 
                    src={product.kok_thumbnail || product.image} 
                    alt={product.kok_product_name || product.name} 
                    className="kok-product-image"
                  />
                </div>
                <div className="kok-product-info">
                  <div className="kok-product-price-info">
                    <span className="kok-discount-rate-text">{product.kok_discount_rate || product.discountRate || 0}%</span>
                    <span className="kok-discount-price-text">
                      {(product.kok_discounted_price || product.discountPrice || 0).toLocaleString()}원
                    </span>
                    <img 
                      src={kokWishlistedProducts.has(product.kok_product_id || product.id) ? filledHeartIcon : emptyHeartIcon} 
                      className="kok-wishlist-icon"
                      onClick={(e) => handleKokWishlistClick(product.kok_product_id || product.id, e)} 
                    />
                  </div>
                  <div className="kok-product-name">{product.kok_product_name || product.name}</div>
                  <div className="kok-product-rating">
                    <span className="kok-stars">★ {(product.rating || 0).toFixed(1)}</span>
                    <span className="kok-review-count">({product.reviewCount || 0}개 리뷰)</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* 무한 스크롤 상태 표시 */}
          {loadingMore && (
            <div style={{
              textAlign: 'center',
              padding: '20px',
              color: '#666',
              fontSize: '14px'
            }}>
              <div style={{
                width: '20px',
                height: '20px',
                border: '2px solid #f3f3f3',
                borderTop: '2px solid #FA5F8C',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 10px'
              }}></div>
              상품을 불러오는 중...
            </div>
          )}
          
          {!hasMore && kokProducts.length > 0 && (
            <div style={{
              textAlign: 'center',
              padding: '20px',
              color: '#999',
              fontSize: '14px',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px',
              margin: '20px 0'
            }}>
              더 이상 로드할 상품이 없습니다
            </div>
          )}
        </div>
        
        {/* 맨 위로 가기 버튼 */}
        <div style={{ position: 'relative' }}>
          <UpBtn />
        </div>
      </div>
    </div>
  );
};

export default KokProductListPage;
