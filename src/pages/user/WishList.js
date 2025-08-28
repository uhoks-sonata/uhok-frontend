import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import HeaderNavWishList from '../../layout/HeaderNavWishList';
import BottomNav from '../../layout/BottomNav';
import Loading from '../../components/Loading';
import api from '../api';
import emptyHeartIcon from '../../assets/heart_empty.png';
import filledHeartIcon from '../../assets/heart_filled.png';
import testImage1 from '../../assets/test/test1.png';
import testImage2 from '../../assets/test/test2.png';
import homeshoppingLogoHomeandshopping from '../../assets/homeshopping_logo_homeandshopping.png';
import homeshoppingLogoHyundai from '../../assets/homeshopping_logo_hyundai.png';
import homeshoppingLogoNs from '../../assets/homeshopping_logo_ns.png';
import homeshoppingLogoNsplus from '../../assets/homeshopping_logo_nsplus.png';
import homeshoppingLogoPlusshop from '../../assets/homeshopping_logo_plusshop.png';
import homeshoppingLogoPublicshopping from '../../assets/homeshopping_logo_publicshopping.png';
import '../../styles/wishlist.css';

const WishList = () => {
  const [wishlistData, setWishlistData] = useState({
    liked_products: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('homeshopping'); // 'homeshopping' 또는 'shopping'
  const [unlikedProducts, setUnlikedProducts] = useState(new Set()); // 찜 해제된 상품 ID들을 저장
  const [isLoggedIn, setIsLoggedIn] = useState(false); // 로그인 상태 추가
  const hasInitialized = useRef(false); // 중복 실행 방지용 ref
  const navigate = useNavigate();

  // 로그인 상태 확인 함수
  const checkLoginStatus = () => {
    const token = localStorage.getItem('access_token');
    const isLoggedInStatus = !!token;
    setIsLoggedIn(isLoggedInStatus);
    return isLoggedInStatus;
  };

  // 찜한 상품 목록을 가져오는 함수
  const fetchWishlistData = async () => {
    // 로그인하지 않은 경우 알림 후 이전 화면으로 돌아가기
    if (!checkLoginStatus()) {
      alert('로그인이 필요한 서비스입니다.');
      window.history.back();
      return;
    }

    try {
      setLoading(true);
      
      // 토큰 확인
      const token = localStorage.getItem('access_token');
      if (!token) {
        alert('로그인이 필요한 서비스입니다.');
        return;
      }

      const response = await api.get('/api/kok/likes', {
        params: {
          limit: 50 // API 명세서에 따른 기본값
        },
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
             // API 응답의 liked_products를 직접 사용하여 쇼핑몰 탭용으로 설정
       if (response.data && response.data.liked_products) {
         console.log('API 응답 데이터:', response.data);
         console.log('찜한 상품 목록:', response.data.liked_products);
         
         // 모든 찜한 상품을 쇼핑몰 탭용으로 설정
         setWishlistData({
           liked_products: response.data.liked_products.map(product => ({
             ...product,
             type: 'shopping' // 모든 찜한 상품을 쇼핑몰 탭으로 설정
           }))
         });
       } else {
         setWishlistData(response.data);
       }
    } catch (err) {
      console.error('찜한 상품 목록 로딩 실패:', err);
      
      // 401 에러 (인증 실패) 시 이전 화면으로 돌아가기
      if (err.response?.status === 401) {
        alert('로그인이 필요한 서비스입니다.');
        return;
      }
      
      // API 연결 실패 시 더미 데이터 사용
      setWishlistData({
        liked_products: [
                     {
             kok_product_id: 10,
             kok_product_name: "[허닭] 닭가슴살 오븐바/스테이크/소시지/볶음밥/유부초밥 외 전제품 152종 모음전",
             kok_thumbnail: testImage1,
             kok_product_price: 17900,
             kok_store_name: "허닭",
             kok_discount_rate: 56,
             kok_discounted_price: 7900,
             type: "shopping"
           },
                       {
              kok_product_id: 25,
              kok_product_name: "[산해직송] 산해직송 전라도 맛있는 파김치 남도식 국산 국내산",
              kok_thumbnail: testImage2, 
              kok_product_price: 30800,
              kok_store_name: "산해직송",
              kok_discount_rate: 52,
              kok_discounted_price: 14800,
              type: "homeshopping",
              broadcast_date: "2024-01-15",
              broadcast_status: "방송예정",
              broadcast_time: "20:00",
              channel_name: "홈앤쇼핑",
              channel_logo: homeshoppingLogoHomeandshopping
            },
            {
              kok_product_id: 30,
              kok_product_name: "[현대홈쇼핑] 프리미엄 무선 이어폰 블루투스 5.0",
              kok_thumbnail: testImage1,
              kok_product_price: 99000,
              kok_store_name: "현대홈쇼핑",
              kok_discount_rate: 30,
              kok_discounted_price: 69300,
              type: "homeshopping",
              broadcast_date: "2024-01-16",
              broadcast_status: "방송중",
              broadcast_time: "14:30",
              channel_name: "현대홈쇼핑",
              channel_logo: homeshoppingLogoHyundai
            }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  // 찜 토글 함수
  const handleHeartToggle = async (productId) => {
    try {
      // 토큰 확인
      const token = localStorage.getItem('access_token');
      if (!token) {
        console.log('토큰이 없어서 로그인 페이지로 이동');
        window.location.href = '/';
        return;
      }

      // 찜 토글 API 호출
      const response = await api.post('/api/kok/likes/toggle', {
        kok_product_id: productId
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('찜 토글 응답:', response.data);

      // 찜 토글 성공 후 하트 아이콘만 즉시 변경 (위시리스트 데이터는 동기화하지 않음)
      if (response.data) {
        console.log('찜 토글 성공! 하트 아이콘 상태만 변경합니다.');
        
        // 하트 아이콘 상태만 토글 (즉시 피드백)
        setUnlikedProducts(prev => {
          const newSet = new Set(prev);
          if (newSet.has(productId)) {
            // 찜 해제된 상태에서 찜 추가
            newSet.delete(productId);
            console.log('찜이 추가되었습니다. 채워진 하트로 변경됩니다.');
          } else {
            // 찜된 상태에서 찜 해제
            newSet.add(productId);
            console.log('찜이 해제되었습니다. 빈 하트로 변경됩니다.');
          }
          return newSet;
        });
        
        // 애니메이션 효과 추가
        const heartButton = document.querySelector(`[data-product-id="${productId}"]`);
        if (heartButton) {
          heartButton.style.transform = 'scale(1.2)';
          setTimeout(() => {
            heartButton.style.transform = 'scale(1)';
          }, 150);
        }
        
        // 위시리스트 데이터는 즉시 동기화하지 않음
        // 페이지 벗어나거나 새로고침할 때 동기화됨
      }
    } catch (err) {
      console.error('찜 토글 실패:', err);
      
      // 401 에러 (인증 실패) 시 로그인 페이지로 이동
      if (err.response?.status === 401) {
        alert('로그인이 필요합니다.');
        window.location.href = '/';
        return;
      }
      
      // 다른 에러의 경우 사용자에게 알림
      alert('찜 상태 변경에 실패했습니다. 다시 시도해주세요.');
    }
  };

  // 상품 클릭 핸들러
  const handleProductClick = (productId) => {
    navigate(`/kok/product/${productId}`);
  };

  // 검색 핸들러
  const handleSearch = (query) => {
    console.log('=== 찜 목록 검색 핸들러 호출됨 ===');
    console.log('검색어:', query);
    
    // 검색어가 있으면 기존 로직 사용, 없으면 콕 검색 페이지로 이동
    if (query && query.trim()) {
      const searchUrl = `/search?q=${encodeURIComponent(query.trim())}&type=wishlist`;
      console.log('이동할 URL:', searchUrl);
      
      try {
        navigate(searchUrl);
        console.log('페이지 이동 성공');
      } catch (error) {
        console.error('페이지 이동 실패:', error);
        // fallback으로 window.location.href 사용
        window.location.href = searchUrl;
      }
    } else {
      // 검색어가 없으면 콕 검색 페이지로 이동
      console.log('콕 검색 페이지로 이동');
      navigate('/kok/search');
    }
  };

  // 알림 클릭 핸들러
  const handleNotificationClick = () => {
    console.log('알림 클릭됨');
    navigate('/notifications');
  };

  // 장바구니 클릭 핸들러
  const handleCartClick = () => {
    navigate('/cart');
  };

  // 뒤로가기 핸들러
  const handleBack = () => {
    navigate(-1);
  };

  // 가격 포맷팅 함수
  const formatPrice = (price) => {
    return price.toLocaleString('ko-KR') + '원';
  };

  // 현재 탭에 해당하는 상품들만 필터링
  const filteredProducts = wishlistData.liked_products.filter(product => 
    product.type === activeTab
  );

  useEffect(() => {
    // 이미 초기화되었으면 리턴
    if (hasInitialized.current) {
      return;
    }
    
    // 초기화 플래그 설정
    hasInitialized.current = true;
    
    // 로그인 상태 확인 후 조건부로 API 호출 (중복 실행 방지)
    const loginStatus = checkLoginStatus();
    if (loginStatus) {
      fetchWishlistData();
    } else {
      // 로그인하지 않은 경우 알림 후 이전 화면으로 돌아가기
      alert('로그인이 필요한 서비스입니다.');
      window.history.back();
    }
    
    // 페이지를 벗어날 때 찜 상태 동기화
    return () => {
      // 위시리스트 데이터를 백엔드와 동기화
      console.log('위시리스트 페이지를 벗어납니다. 찜 상태를 동기화합니다.');
      // 여기서 필요한 정리 작업을 수행할 수 있습니다
    };
  }, []); // 빈 의존성 배열로 한 번만 실행

  if (loading) {
    return (
      <div className="wishlist-page">
        {/* 위시리스트 헤더 네비게이션 */}
        <HeaderNavWishList 
          onBackClick={handleBack}
          onSearchClick={handleSearch}
          onNotificationClick={handleNotificationClick}
          onCartClick={handleCartClick}
        />
        <div className="wishlist-content">
          <Loading message="찜한 상품을 불러오는 중 ..." />
        </div>
        <BottomNav />
      </div>
    );
  }

  if (error) {
    return (
      <div className="wishlist-page">
        {/* 위시리스트 헤더 네비게이션 */}
        <HeaderNavWishList 
          onBackClick={handleBack}
          onSearchClick={handleSearch}
          onNotificationClick={handleNotificationClick}
          onCartClick={handleCartClick}
        />
        <div className="wishlist-content">
          <div className="error">오류: {error}</div>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="wishlist-page">
      {/* 위시리스트 헤더 네비게이션 */}
      <HeaderNavWishList 
        onBackClick={handleBack}
        onSearchClick={handleSearch}
        onNotificationClick={handleNotificationClick}
        onCartClick={handleCartClick}
      />
      
      <div className="wishlist-content">
        {/* 탭 네비게이션 */}
        <div className="tab-navigation">
          <button 
            className={`tab-button ${activeTab === 'homeshopping' ? 'active' : ''}`}
            onClick={() => setActiveTab('homeshopping')}
          >
            홈쇼핑
          </button>
          <button 
            className={`tab-button ${activeTab === 'shopping' ? 'active' : ''}`}
            onClick={() => setActiveTab('shopping')}
          >
            쇼핑몰
          </button>
        </div>

        {/* 상품 개수 표시 */}
        <div className="product-count">
          총 {filteredProducts.length}개 상품
        </div>

        {filteredProducts.length === 0 ? (
          <div className="empty-wishlist">
            <div className="empty-icon"></div>
            <div className="empty-text">찜한 상품이 없습니다</div>
            <div className="empty-subtext">마음에 드는 상품을 찜해보세요!</div>
          </div>
        ) : (
          <div className="wishlist-products">
            {filteredProducts.map((product) => (
              <div key={product.kok_product_id} className="wishlist-product-container">
                {activeTab === 'homeshopping' && (
                  <div className="broadcast-header">
                    <div className="broadcast-info">
                      <span className="broadcast-date">{product.broadcast_date}</span>
                      <span className="broadcast-status">{product.broadcast_status}</span>
                    </div>
                    <div className="broadcast-time">{product.broadcast_time}</div>
                  </div>
                )}
                <div className="wishlist-product" onClick={() => handleProductClick(product.kok_product_id)}>
                  <div className="product-image">
                    <img 
                      src={product.kok_thumbnail} 
                      alt={product.kok_product_name}
                    />
                  </div>
                  <div className="product-info">
                    {activeTab === 'homeshopping' ? (
                      // 홈쇼핑 탭 레이아웃
                      <div className="product-channel-info">
                        <div className="price-section">
                          <div className="price-info">
                            {product.kok_discount_rate > 0 && (
                              <span className="discount-rate">{product.kok_discount_rate}%</span>
                            )}
                            <span className="discounted-price">
                              {formatPrice(product.kok_discounted_price)}
                            </span>
                          </div>
                          <button 
                            className="heart-button"
                            data-product-id={product.kok_product_id}
                            onClick={(e) => {
                              e.stopPropagation(); // 카드 클릭 이벤트 전파 방지
                              handleHeartToggle(product.kok_product_id);
                            }}>
                            <img 
                              src={unlikedProducts.has(product.kok_product_id) ? emptyHeartIcon : filledHeartIcon} 
                              alt="찜 토글" 
                              className="heart-icon"
                            />
                          </button>
                        </div>
                        <div className="channel-info">
                          <img 
                            src={product.channel_logo} 
                            alt={product.channel_name}
                            className="channel-logo"
                          />
                          <span className="channel-name">{product.channel_name}</span>
                          <span className="channel-number">[CH 8]</span>
                        </div>
                        <div className="wishlist-product-name">
                          <span className="wishlist-brand-name">{product.kok_store_name}</span> | {product.kok_product_name}
                        </div>
                      </div>
                                       ) : (
                      // 쇼핑몰 탭 레이아웃 - 이미지 참고하여 개선
                      <div className="shopping-product-info">
                        <div className="shopping-product-details">
                          <span className="shopping-product-name">
                            <span className="shopping-brand-name">{product.kok_store_name}</span> | {product.kok_product_name}
                          </span>
                        </div>
                        <div className="shopping-price-section">
                          <div className="shopping-price-info">
                            {product.kok_discount_rate > 0 && (
                              <span className="shopping-discount-rate">{product.kok_discount_rate}%</span>
                            )}
                            <span className="shopping-discounted-price">
                              {formatPrice(product.kok_discounted_price)}
                            </span>
                          </div>
                          <button 
                            className="shopping-heart-button"
                            data-product-id={product.kok_product_id}
                            onClick={(e) => {
                              e.stopPropagation(); // 카드 클릭 이벤트 전파 방지
                              handleHeartToggle(product.kok_product_id);
                            }}>
                            <img 
                              src={unlikedProducts.has(product.kok_product_id) ? emptyHeartIcon : filledHeartIcon} 
                              alt="찜 토글" 
                              className="shopping-heart-icon"
                            />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <BottomNav />
    </div>
  );
};

export default WishList;
