import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingHeader } from '../../layout/HeaderNav';
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
  const navigate = useNavigate();

  // 찜한 상품 목록을 가져오는 함수
  const fetchWishlistData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/kok/likes', {
        headers: {
          'Authorization': 'Bearer <access_token>' // 실제 토큰으로 교체 필요
        }
      });
      setWishlistData(response.data);
    } catch (err) {
      console.error('찜한 상품 목록 로딩 실패:', err);
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
    const isCurrentlyUnliked = unlikedProducts.has(productId);
    
    try {
      const response = await api.post('/api/kok/likes/toggle', {
        kok_product_id: productId
      }, {
        headers: {
          'Authorization': 'Bearer <access_token>'
        }
      });

      if (response.data.liked === !isCurrentlyUnliked) {
        // 찜 상태가 변경되었으면 하트 아이콘 토글
        setUnlikedProducts(prev => {
          const newSet = new Set(prev);
          if (isCurrentlyUnliked) {
            // 빈 하트에서 채워진 하트로 (찜 추가)
            newSet.delete(productId);
            console.log('찜이 추가되었습니다. 채워진 하트로 변경됩니다.');
          } else {
            // 채워진 하트에서 빈 하트로 (찜 해제)
            newSet.add(productId);
            console.log('찜이 해제되었습니다. 빈 하트로 변경됩니다.');
          }
          return newSet;
        });
      }
    } catch (err) {
      // 네트워크 에러나 API 연결 실패 시에도 하트 아이콘 토글
      if (err.code === 'ERR_NETWORK' || err.message === 'Network Error') {
        setUnlikedProducts(prev => {
          const newSet = new Set(prev);
          if (isCurrentlyUnliked) {
            // 빈 하트에서 채워진 하트로 (찜 추가)
            newSet.delete(productId);
            console.log('API 서버 연결 실패. 찜 추가 요청은 실패했지만 채워진 하트로 변경됩니다.');
          } else {
            // 채워진 하트에서 빈 하트로 (찜 해제)
            newSet.add(productId);
            console.log('API 서버 연결 실패. 찜 해제 요청은 실패했지만 빈 하트로 변경됩니다.');
          }
          return newSet;
        });
      } else {
        console.error('찜 토글 실패:', err);
      }
    }
  };

  // 상품 클릭 핸들러
  const handleProductClick = (productId) => {
    navigate(`/kok-product/${productId}`);
  };

  // 검색 핸들러
  const handleSearch = (query) => {
    console.log('검색어:', query);
  };

  // 알림 클릭 핸들러
  const handleNotificationClick = () => {
    console.log('알림 클릭됨');
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
    fetchWishlistData();
  }, []);

  if (loading) {
    return (
      <div className="wishlist-page">
        <ShoppingHeader 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onSearch={handleSearch}
          onNotificationClick={handleNotificationClick}
          onCartClick={handleCartClick}
          onBack={handleBack}
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
        <ShoppingHeader 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onSearch={handleSearch}
          onNotificationClick={handleNotificationClick}
          onCartClick={handleCartClick}
          onBack={handleBack}
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
      <ShoppingHeader 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onSearch={handleSearch}
        onNotificationClick={handleNotificationClick}
        onCartClick={handleCartClick}
        onBack={handleBack}
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
                <div className="wishlist-product">
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
                            onClick={() => handleHeartToggle(product.kok_product_id)}>
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
                     // 쇼핑몰 탭 레이아웃
                     <>
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
                           onClick={() => handleHeartToggle(product.kok_product_id)}>
                           <img 
                             src={unlikedProducts.has(product.kok_product_id) ? emptyHeartIcon : filledHeartIcon} 
                             alt="찜 토글" 
                             className="heart-icon"
                           />
                         </button>
                       </div>
                       <div className="wishlist-product-name">
                         <span className="wishlist-brand-name">{product.kok_store_name}</span> | {product.kok_product_name}
                       </div>
                     </>
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
