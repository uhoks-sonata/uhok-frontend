import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { homeShoppingApi } from '../../api/homeShoppingApi';
import { useUser } from '../../contexts/UserContext';
import HeaderNavSchedule from '../../layout/HeaderNavSchedule';
import BottomNav from '../../layout/BottomNav';
import Loading from '../../components/Loading';
import UpBtn from '../../components/UpBtn';
import emptyHeartIcon from '../../assets/heart_empty.png';
import filledHeartIcon from '../../assets/heart_filled.png';
import api from '../../pages/api';

// 홈쇼핑 로고 관련 컴포넌트
import { getLogoByHomeshoppingId, getChannelInfoByHomeshoppingId } from '../../components/homeshoppingLogo';

import '../../styles/homeshopping_product_detail.css';

const HomeShoppingProductDetail = () => {
  const navigate = useNavigate();
  const { productId } = useParams();
  const location = useLocation();
  const { user, isLoggedIn } = useUser();
  
  // 상태 관리
  const [productDetail, setProductDetail] = useState(null);
  const [detailInfos, setDetailInfos] = useState([]);
  const [productImages, setProductImages] = useState([]);
  const [isLiked, setIsLiked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [streamData, setStreamData] = useState(null);
  const [isStreamLoading, setIsStreamLoading] = useState(false);
  const [kokRecommendations, setKokRecommendations] = useState([]);
  const [recipeRecommendations, setRecipeRecommendations] = useState([]);
  const [activeTab, setActiveTab] = useState('info'); // 탭 상태 관리
  const [wishlistedProducts, setWishlistedProducts] = useState(new Set()); // 찜된 상품 ID들을 저장
  
  // 상품 상세 정보 가져오기
  useEffect(() => {
    const fetchProductDetail = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('🛍️ 홈쇼핑 상품 상세 정보 가져오기:', productId);
        
        // 상품 상세 정보 가져오기
        const detailResponse = await homeShoppingApi.getProductDetail(productId);
        console.log('✅ 상품 상세 정보:', detailResponse);
        
                 if (detailResponse && detailResponse.product) {
           setProductDetail(detailResponse.product);
           setIsLiked(detailResponse.product.is_liked || false);
           
           // 상세 정보와 이미지 설정
           if (detailResponse.detail_infos) {
             setDetailInfos(detailResponse.detail_infos);
           }
           if (detailResponse.images) {
             setProductImages(detailResponse.images);
           }
           
           // 상품 상세 정보 로딩 완료 후 찜 상태 초기화
           initializeWishlistStatus();
         }
        
        // 콕 상품 추천 가져오기
        try {
          const kokResponse = await homeShoppingApi.getKokRecommendations(productId);
          console.log('💡 콕 상품 추천:', kokResponse);
          setKokRecommendations(kokResponse.products || []);
        } catch (kokError) {
          console.error('콕 상품 추천 가져오기 실패:', kokError);
        }
        
        // 라이브 스트림 정보 가져오기
        try {
          const streamResponse = await homeShoppingApi.getLiveStreamUrl(productId);
          console.log('📹 라이브 스트림 정보:', streamResponse);
          setStreamData(streamResponse);
        } catch (streamError) {
          console.error('라이브 스트림 정보 가져오기 실패:', streamError);
        }
        
      } catch (error) {
        console.error('상품 상세 정보 가져오기 실패:', error);
        setError('상품 정보를 가져올 수 없습니다.');
      } finally {
        setLoading(false);
      }
    };
    
    if (productId) {
      fetchProductDetail();
    }
  }, [productId]);
  
  // 찜 상태 초기화 함수
  const initializeWishlistStatus = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;

      // 사용자의 찜한 홈쇼핑 상품 목록 가져오기
      const response = await api.get('/api/homeshopping/likes', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data && response.data.liked_products) {
        const likedProductIds = new Set(response.data.liked_products.map(product => product.product_id));
        setWishlistedProducts(likedProductIds);
        console.log('찜 상태 초기화 완료:', likedProductIds.size, '개 상품');
      }
    } catch (error) {
      console.error('찜 상태 초기화 실패:', error);
    }
  };

  // 찜 토글 함수 (홈쇼핑 상품용) - Schedule.js와 동일한 방식
  const handleHeartToggle = async (productId) => {
    try {
      // 토큰 확인
      const token = localStorage.getItem('access_token');
      if (!token) {
        console.log('토큰이 없어서 로그인 필요 팝업 표시');
        // 다른 파일들과 동일하게 alert만 표시하고 제자리에 유지
        alert('로그인이 필요한 서비스입니다.');
        return;
      }

      // 찜 토글 API 호출
      const response = await api.post('/api/homeshopping/likes/toggle', {
        product_id: productId
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
        setWishlistedProducts(prev => {
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
      
      // 401 에러 (인증 실패) 시 제자리에 유지
      if (err.response?.status === 401) {
        alert('로그인이 필요한 서비스입니다.');
        return;
      }
      
      // 다른 에러의 경우 사용자에게 알림
      alert('찜 상태 변경에 실패했습니다. 다시 시도해주세요.');
    }
  };
  
  // 라이브 스트림 재생
  const handleLiveStream = () => {
    if (streamData && streamData.stream_url && streamData.is_live) {
      window.open(streamData.stream_url, '_blank', 'width=448,height=204');
    } else {
      alert('현재 라이브 스트림을 사용할 수 없습니다.');
    }
  };
  
  // 콕 상품으로 이동
  const handleKokProductClick = (kokProductId) => {
    navigate(`/kok/product/${kokProductId}`);
  };
  
  // 방송 상태 확인
  const getBroadcastStatus = () => {
    if (!productDetail) return null;
    
    const now = new Date();
    const liveStart = new Date(`${productDetail.live_date} ${productDetail.live_start_time}`);
    const liveEnd = new Date(`${productDetail.live_date} ${productDetail.live_end_time}`);
    
    if (now < liveStart) {
      return { status: 'upcoming', text: '방송 예정' };
    } else if (now >= liveStart && now <= liveEnd) {
      return { status: 'live', text: 'LIVE' };
         } else {
       return { status: 'ended', text: '방송 종료' };
     }
  };
  
  // 로딩 상태
  if (loading) {
    return (
      <div className="homeshopping-product-detail-page">
        <HeaderNavSchedule 
          onBackClick={() => navigate(-1)}
          onSearchClick={(searchTerm) => navigate('/homeshopping/search?type=homeshopping')}
          onNotificationClick={() => navigate('/notifications')}
        />
        <div className="loading-container">
          <Loading message="상품 정보를 불러오는 중..." />
        </div>
      </div>
    );
  }
  
  // 에러 상태
  if (error) {
    return (
      <div className="homeshopping-product-detail-page">
        <HeaderNavSchedule 
          onBackClick={() => navigate(-1)}
          onSearchClick={(searchTerm) => navigate('/homeshopping/search?type=homeshopping')}
          onNotificationClick={() => navigate('/notifications')}
        />
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h2 className="error-title">상품 정보를 불러올 수 없습니다</h2>
          <p className="error-message">{error}</p>
          <button className="retry-button" onClick={() => window.location.reload()}>
            다시 시도
          </button>
        </div>
      </div>
    );
  }
  
  // 상품 정보가 없는 경우
  if (!productDetail) {
    return (
      <div className="homeshopping-product-detail-page">
        <HeaderNavSchedule 
          onBackClick={() => navigate(-1)}
          onSearchClick={(searchTerm) => navigate('/homeshopping/search?type=homeshopping')}
          onNotificationClick={() => navigate('/notifications')}
        />
        <div className="no-product-container">
          <div className="no-product-icon">❓</div>
          <h2 className="no-product-title">상품을 찾을 수 없습니다</h2>
          <p className="no-product-message">요청하신 상품 정보가 존재하지 않습니다.</p>
          <button className="back-button" onClick={() => navigate(-1)}>
            이전 페이지로 돌아가기
          </button>
        </div>
      </div>
    );
  }
  
  const broadcastStatus = getBroadcastStatus();
  
  return (
    <div className="homeshopping-product-detail-page">
      {/* 헤더 */}
      <HeaderNavSchedule 
        onBackClick={() => navigate(-1)}
        onSearchClick={(searchTerm) => navigate('/homeshopping/search?type=homeshopping')}
        onNotificationClick={() => navigate('/notifications')}
      />
      
      <div className="product-detail-container">
                {/* 상품 이미지 섹션 */}
        <div className="product-image-section">
                              {/* 독립적인 방송 정보 섹션 */}
          <div className="hsproduct-broadcast-info-section">
            {/* 제품 정보 그룹 */}
            <div className="hsproduct-product-info-group">
              {/* 브랜드 로고 */}
              <div className="hsproduct-brand-logo">
                <img 
                  src={getLogoByHomeshoppingId(productDetail.homeshopping_id)} 
                  alt={productDetail.homeshopping_name || '홈쇼핑'}
                  className="hsproduct-homeshopping-logo"
                />
              </div>
              
              {/* 채널 번호 */}
              <div className="hsproduct-channel-number">
                [채널 {getChannelInfoByHomeshoppingId(productDetail.homeshopping_id)?.channel || 'N/A'}]
              </div>
              

              
              {/* 방송 날짜 */}
              <div className="hsproduct-broadcast-date">
                {productDetail.live_date && (() => {
                  const date = new Date(productDetail.live_date);
                  const month = date.getMonth() + 1;
                  const day = date.getDate();
                  const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
                  const weekday = weekdays[date.getDay()];
                  return `${month}/${day} ${weekday}`;
                })()}
              </div>
              
              {/* 방송 시간 */}
              <div className="hsproduct-broadcast-time">
                {productDetail.live_start_time && productDetail.live_end_time && 
                  `${productDetail.live_start_time.slice(0, 5)} ~ ${productDetail.live_end_time.slice(0, 5)}`
                }
              </div>
            </div>
            
            {/* 찜 버튼 (별도 그룹) */}
            <div className="hsproduct-heart-button-group">
              <button 
                className="hsproduct-heart-button"
                data-product-id={productDetail.product_id}
                onClick={(e) => {
                  e.stopPropagation();
                  handleHeartToggle(productDetail.product_id);
                }}
              >
                <img 
                  src={wishlistedProducts.has(productDetail.product_id) ? filledHeartIcon : emptyHeartIcon} 
                  alt="찜 토글" 
                  className="hsproduct-heart-icon"
                />
              </button>
            </div>
          </div>
          
                                <div className="image-container">
             {productDetail.thumb_img_url ? (
               <div className="product-image-wrapper">
                                   <img 
                    src={productDetail.thumb_img_url} 
                    alt={productDetail.product_name}
                    className="hsproduct-product-image"
                    onError={(e) => {
                      e.target.alt = '이미지 로드 실패';
                    }}
                  />
                 {/* 가운데 방송 상태 텍스트 오버레이 */}
                 {broadcastStatus && (
                   <div className="center-broadcast-status">
                     <span className="center-status-text">{broadcastStatus.text}</span>
                   </div>
                 )}
               </div>
             ) : (
               <div className="no-image-placeholder">
                 <span>이미지 없음</span>
               </div>
             )}
           </div>
          
                                 {/* 라이브 스트림 버튼 */}
            {streamData?.stream_url && broadcastStatus?.status === 'live' && (
              <button 
                className="live-stream-button"
                onClick={handleLiveStream}
                disabled={isStreamLoading}
              >
                <span className="live-icon">🔴</span>
                {isStreamLoading ? '로딩 중...' : '라이브 시청하기'}
              </button>
            )}
        </div>
        
                 {/* 상품 기본 정보 */}
         <div className="product-basic-info">
           <div className="product-header">
             <span className="store-name">{productDetail.store_name || '홈쇼핑'}</span>
             <h1 className="product-name">{productDetail.product_name}</h1>
           </div>
          
          {/* 가격 정보 */}
          <div className="price-section">
            {productDetail.dc_rate > 0 ? (
              <>
                <div className="original-price">
                  {productDetail.sale_price?.toLocaleString()}원
                </div>
                <div className="discount-info">
                  <span className="discount-rate">{productDetail.dc_rate}% 할인</span>
                  <span className="discounted-price">
                    {productDetail.dc_price?.toLocaleString()}원
                  </span>
                </div>
              </>
            ) : (
              <div className="no-discount-price">
                {productDetail.sale_price?.toLocaleString()}원
              </div>
            )}
          </div>
        </div>
        
        {/* 탭 네비게이션 */}
        <div className="tab-navigation">
          <button 
            className={`tab-button ${activeTab === 'info' ? 'active' : ''}`}
            onClick={() => setActiveTab('info')}
          >
            상품 정보
          </button>
          <button 
            className={`tab-button ${activeTab === 'broadcast' ? 'active' : ''}`}
            onClick={() => setActiveTab('broadcast')}
          >
            방송 정보
          </button>
          <button 
            className={`tab-button ${activeTab === 'recommendations' ? 'active' : ''}`}
            onClick={() => setActiveTab('recommendations')}
          >
            추천
          </button>
        </div>
        
        {/* 탭 콘텐츠 */}
        <div className="tab-content">
          {/* 상품 정보 탭 */}
          {activeTab === 'info' && (
            <div className="product-info-tab">
              {/* 상품 상세 정보 */}
              {detailInfos && detailInfos.length > 0 && (
                <div className="detail-info-section">
                  <h3 className="section-title">상품 상세 정보</h3>
                  <div className="detail-info-grid">
                    {detailInfos.map((info, index) => (
                      <div key={index} className="detail-info-item">
                        {Object.entries(info).map(([key, value]) => (
                          <div key={key} className="detail-row">
                            <span className="detail-label">{key}</span>
                            <span className="detail-value">{value}</span>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* 상품 이미지 갤러리 */}
              {productImages && productImages.length > 0 && (
                <div className="image-gallery-section">
                  <h3 className="section-title">상품 이미지</h3>
                  <div className="image-gallery">
                    {productImages.map((imageGroup, index) => (
                      <div key={index} className="image-group">
                        {Object.entries(imageGroup).map(([key, imageUrl]) => (
                                                   <img 
                           key={key}
                           src={imageUrl} 
                           alt={`상품 이미지 ${index + 1}`}
                           className="gallery-image"
                           onClick={() => window.open(imageUrl, '_blank')}
                           onError={(e) => {
                             e.target.alt = '이미지 로드 실패';
                           }}
                         />
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* 상세 정보나 이미지가 없는 경우 */}
              {(!detailInfos || detailInfos.length === 0) && 
               (!productImages || productImages.length === 0) && (
                <div className="no-detail-info">
                  <div className="no-detail-icon">📋</div>
                  <p className="no-detail-text">상품 상세 정보가 없습니다</p>
                </div>
              )}
            </div>
          )}
          
                     {/* 방송 정보 탭 */}
           {activeTab === 'broadcast' && (
             <div className="broadcast-info-tab">
               <div className="broadcast-details">
                 <div className="broadcast-item">
                   <span className="broadcast-label">방송일</span>
                   <span className="broadcast-value">{productDetail.live_date}</span>
                 </div>
                 <div className="broadcast-item">
                   <span className="broadcast-label">방송시간</span>
                   <span className="broadcast-value">
                     {productDetail.live_start_time} ~ {productDetail.live_end_time}
                   </span>
                 </div>
                 <div className="broadcast-item">
                   <span className="broadcast-label">매장명</span>
                   <span className="broadcast-value">{productDetail.store_name}</span>
                 </div>
               </div>
               
               {/* 라이브 스트림 정보 */}
               {streamData && (
                 <div className="live-stream-info">
                   <h3 className="section-title">라이브 스트림 정보</h3>
                   <div className="stream-details">
                     <div className="stream-item">
                       <span className="stream-label">라이브 상태</span>
                       <span className={`stream-status ${streamData.is_live ? 'live' : 'offline'}`}>
                         {streamData.is_live ? '🔴 LIVE' : '⚫ 오프라인'}
                       </span>
                     </div>
                     {streamData.is_live && streamData.stream_url && (
                       <div className="stream-item">
                         <span className="stream-label">스트림 URL</span>
                         <button 
                           className="stream-url-button"
                           onClick={handleLiveStream}
                           disabled={isStreamLoading}
                         >
                           {isStreamLoading ? '로딩 중...' : '라이브 시청하기'}
                         </button>
                       </div>
                     )}
                     <div className="stream-item">
                       <span className="stream-label">라이브 시작</span>
                       <span className="stream-value">{streamData.live_start_time}</span>
                     </div>
                     <div className="stream-item">
                       <span className="stream-label">라이브 종료</span>
                       <span className="stream-value">{streamData.live_end_time}</span>
                     </div>
                   </div>
                 </div>
               )}
               
               {/* 방송 상태 정보 */}
               {broadcastStatus && (
                 <div className="broadcast-status-info">
                   <h3 className="section-title">방송 상태</h3>
                   <div className={`status-display ${broadcastStatus.status}`}>
                     <span className="stream-status-icon">{broadcastStatus.icon}</span>
                     <span className="stream-status-text">{broadcastStatus.text}</span>
                   </div>
                 </div>
               )}
             </div>
           )}
          
          {/* 추천 탭 */}
          {activeTab === 'recommendations' && (
            <div className="recommendations-tab">
              {/* 콕 상품 추천 */}
              {kokRecommendations.length > 0 && (
                <div className="kok-recommendations-section">
                  <h3 className="section-title">유사한 콕 상품</h3>
                  <div className="kok-products-grid">
                    {kokRecommendations.map((product) => (
                      <div 
                        key={product.product_id} 
                        className="kok-product-card"
                        onClick={() => handleKokProductClick(product.product_id)}
                      >
                                                 <img 
                           src={product.thumb_img_url} 
                           alt={product.product_name}
                           className="kok-product-image"
                           onError={(e) => {
                             e.target.alt = '이미지 로드 실패';
                           }}
                         />
                        <div className="kok-product-info">
                          <h4 className="kok-product-name">{product.product_name}</h4>
                          <p className="kok-product-price">{product.price?.toLocaleString()}원</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* 추천이 없는 경우 */}
              {kokRecommendations.length === 0 && (
                <div className="no-recommendations">
                  <div className="no-recommendations-icon">💡</div>
                  <p className="no-recommendations-text">아직 추천 상품이 없습니다</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      <BottomNav />
      <UpBtn />
    </div>
  );
};

export default HomeShoppingProductDetail;
