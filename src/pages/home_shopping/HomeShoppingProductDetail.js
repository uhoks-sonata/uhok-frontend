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

  const [wishlistedProducts, setWishlistedProducts] = useState(new Set()); // 찜된 상품 ID들을 저장
  const [activeTab, setActiveTab] = useState('detail'); // 탭 상태 관리
  
  // 상품 상세 정보 가져오기
  useEffect(() => {
    // productId가 유효하지 않으면 API 호출하지 않음
    if (!productId || productId === 'undefined' || productId === 'null' || productId === '') {
      console.log('❌ 유효하지 않은 productId:', productId, '타입:', typeof productId);
      setError('상품 ID가 유효하지 않습니다.');
      setLoading(false);
      return;
    }
    
    let isMounted = true;
    let retryCount = 0;
    const maxRetries = 2; // 최대 2번만 재시도
    
    const fetchProductDetail = async () => {
      try {
        if (!isMounted) return;
        
        setLoading(true);
        setError(null);
        
        console.log('🛍️ 홈쇼핑 상품 상세 정보 가져오기:', productId, `(시도 ${retryCount + 1}/${maxRetries + 1})`);
        console.log('🔍 productId 상세 정보:', { value: productId, type: typeof productId, length: String(productId).length });
        
        // 상품 상세 정보 가져오기
        const detailResponse = await homeShoppingApi.getProductDetail(productId);
        console.log('✅ 상품 상세 정보:', detailResponse);
        
        if (!isMounted) return;
        
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
        
        // 콕 상품 추천 가져오기 (에러가 발생해도 계속 진행)
        try {
          const kokResponse = await homeShoppingApi.getKokRecommendations(productId);
          console.log('💡 콕 상품 추천:', kokResponse);
          if (isMounted) {
            setKokRecommendations(kokResponse.products || []);
          }
        } catch (kokError) {
          console.error('콕 상품 추천 가져오기 실패:', kokError);
        }
        
        // 라이브 스트림 정보 가져오기 (에러가 발생해도 계속 진행)
        try {
          const streamResponse = await homeShoppingApi.getLiveStreamUrl(productId);
          console.log('📹 라이브 스트림 정보:', streamResponse);
          if (isMounted) {
            setStreamData(streamResponse);
          }
        } catch (streamError) {
          console.error('라이브 스트림 정보 가져오기 실패:', streamError);
        }
        
      } catch (error) {
        if (!isMounted) return;
        
        console.error('상품 상세 정보 가져오기 실패:', error);
        
        // 500 에러인 경우 재시도 로직
        if (error.response?.status === 500 && retryCount < maxRetries) {
          retryCount++;
          console.log(`🔄 상품 상세 정보 재시도 ${retryCount}/${maxRetries} (3초 후)`);
          
          setTimeout(() => {
            if (isMounted) {
              fetchProductDetail();
            }
          }, 3000);
          
          return; // 재시도 중에는 에러 상태를 설정하지 않음
        }
        
        // 최대 재시도 횟수 초과 또는 다른 에러인 경우
        let errorMessage = '상품 정보를 가져올 수 없습니다.';
        
        if (error.response?.status === 500) {
          errorMessage = '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
        } else if (error.response?.status === 404) {
          errorMessage = '상품을 찾을 수 없습니다.';
        } else if (error.response?.status === 401) {
          errorMessage = '로그인이 필요합니다.';
        }
        
        setError(errorMessage);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    if (productId) {
      fetchProductDetail();
    }
    
    // 컴포넌트 언마운트 시 정리
    return () => {
      isMounted = false;
    };
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
          <h2 className="no-product-title">상품을 찾을 수 없습니다</h2>
          <p className="no-product-message">요청하신 상품 정보가 존재하지 않습니다.</p>
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
      
             <div className="product-detail-container" id="homeshopping-product-detail-container">
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
               {(() => {
                 // 이미지 URL 검증 및 수정
                 let imageUrl = productDetail.thumb_img_url;
                 
                 // 디버깅: 이미지 URL 상세 출력
                 console.log('🔍 이미지 URL 검증 상세:', {
                   original: imageUrl,
                   type: typeof imageUrl,
                   length: imageUrl ? imageUrl.length : 0,
                   includesProduct1: imageUrl ? imageUrl.includes('product/1') : false,
                   includesHomeshopping: imageUrl ? imageUrl.includes('homeshopping') : false,
                   includesWebapp: imageUrl ? imageUrl.includes('webapp.uhok.com') : false,
                   includes3001: imageUrl ? imageUrl.includes('3001') : false
                 });
                 
                                   // 실제 문제가 되는 URL 패턴만 차단 (정상적인 외부 이미지는 허용)
                  if (imageUrl && (
                    // 실제 문제가 되는 패턴들만 차단
                    imageUrl.includes('product/1') ||
                    imageUrl.includes('/product/1') ||
                    imageUrl.includes('product/1/') ||
                    imageUrl.includes('product/1 ') ||
                    imageUrl.includes(' product/1') ||
                    
                    // homeshopping/product/1 관련 패턴
                    imageUrl.includes('homeshopping/product/1') ||
                    imageUrl.includes('/homeshopping/product/1') ||
                    imageUrl.includes('homeshopping/product/1/') ||
                    
                    // 실제 문제가 되는 도메인만 차단
                    imageUrl.includes('webapp.uhok.com:3001/homeshopping/product/1') ||
                    imageUrl.includes('webapp.uhok.com:3001/product/1') ||
                    imageUrl.includes('webapp.uhok.com:3001') ||
                    
                    // 잘못된 로컬 URL
                    imageUrl.includes('localhost:3001') ||
                    imageUrl.includes('127.0.0.1:3001')
                  )) {
                    console.log('⚠️ 문제가 되는 이미지 URL 감지 및 차단:', imageUrl);
                    console.log('🚫 차단 사유: product/1 또는 잘못된 로컬 URL');
                    imageUrl = null; // 문제가 되는 URL만 무시
                  }
                 
                 // 최종 검증: imageUrl이 유효한지 확인
                 if (imageUrl && (imageUrl.trim() === '' || imageUrl === 'null' || imageUrl === 'undefined')) {
                   console.log('⚠️ 빈 값 또는 null/undefined 이미지 URL 차단:', imageUrl);
                   imageUrl = null;
                 }
                 
                 return imageUrl ? (
                  <div className="product-image-wrapper">
                    <img 
                      src={imageUrl} 
                      alt={productDetail.product_name}
                      className="hsproduct-product-image"
                      onError={(e) => {
                        console.log('❌ 이미지 로드 실패:', imageUrl);
                        e.target.style.display = 'none'; // 이미지 숨기기
                        // 이미지 로드 실패 시 placeholder 표시
                        const placeholder = e.target.parentNode.querySelector('.image-error-placeholder');
                        if (placeholder) {
                          placeholder.style.display = 'block';
                        }
                      }}
                    />
                    {/* 이미지 로드 실패 시 표시할 placeholder */}
                    <div className="image-error-placeholder" style={{ display: 'none' }}>
                      <span>이미지 로드 실패</span>
                    </div>
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
                );
              })()}
            </div>
          
                                 {/* 라이브 스트림 버튼 */}
            {streamData?.stream_url && broadcastStatus?.status === 'live' && (
              <button 
                className="live-stream-button"
                onClick={handleLiveStream}
                disabled={isStreamLoading}
                             >
                 {isStreamLoading ? '로딩 중...' : '라이브 시청하기'}
               </button>
            )}
        </div>
        
                  {/* 상품 기본 정보 */}
         <div className="product-basic-info">
                       <div className="product-header">
              <span className="hsproduct-store-name">[{productDetail.store_name || '홈쇼핑'}]</span>
              <h1 className="hsproduct-product-name">{productDetail.product_name}</h1>
            </div>
          
                     {/* 가격 정보 */}
           <div className="hsproduct-price-section">
             {(() => {
               const dcRate = Number(productDetail.dc_rate);
               const salePrice = Number(productDetail.sale_price);
               const dcPrice = Number(productDetail.dc_price);
               
               // 할인율이 0이거나 null이거나, 할인가와 정가가 같으면 할인 없음으로 표시
               if (dcRate > 0 && dcPrice > 0 && dcPrice !== salePrice) {
                 return (
                   <>
                     {/* 정가 (첫번째 줄) */}
                     <div className="hsproduct-original-price">
                       <span className="hsproduct-original-price-text">
                         {salePrice.toLocaleString()}원
                       </span>
                     </div>
                     {/* 할인율과 할인가격 (두번째 줄) */}
                     <div className="hsproduct-discount-info">
                       <span className="hsproduct-discount-rate">
                         {dcRate}%
                       </span>
                       <span className="hsproduct-discounted-price">
                         {dcPrice.toLocaleString()}원
                       </span>
                     </div>
                   </>
                 );
               } else {
                 return (
                   <>
                                           {/* 할인 없는 경우 - 정가만 표시 */}
                      <div className="hsproduct-original-price">
                        <span className="hsproduct-original-price-text">
                          {salePrice.toLocaleString()}원
                        </span>
                      </div>
                      {/* 할인 없음 표시 */}
                      <div className="hsproduct-discount-info">
                        <span className="hsproduct-no-discount">할인 없음</span>
                        <span className="hsproduct-discounted-price">{salePrice.toLocaleString()}원</span>
                      </div>
                   </>
                 );
               }
             })()}
           </div>
        </div>
        
                                  {/* 탭 네비게이션 */}
        <div className="tab-navigation">
          <button
            className={`tab-button ${activeTab === 'detail' ? 'active' : ''}`}
            onClick={() => setActiveTab('detail')}
          >
            상품정보
          </button>
          <button
            className={`tab-button ${activeTab === 'seller' ? 'active' : ''}`}
            onClick={() => setActiveTab('seller')}
          >
            상세정보
          </button>
        </div>
         
         {/* 탭 콘텐츠 */}
         <div className="tab-content">
                       {/* 상품 상세 탭 */}
            {activeTab === 'detail' && (
              <div className="detail-tab">
                {/* 상품 상세 이미지들 */}
                {productImages && productImages.length > 0 && (
                  <div className="product-detail-images-section">
                    <h3 className="section-title">상품 상세 이미지</h3>
                    <div className="detail-images-container">
                      {productImages.map((image, index) => (
                        <div key={index} className="detail-image-item">
                          <img 
                            src={image.img_url} 
                            alt={`상품 상세 이미지 ${index + 1}`}
                            className="detail-image"
                            onClick={() => window.open(image.img_url, '_blank')}
                            onError={(e) => {
                              e.target.alt = '이미지 로드 실패';
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                                                   {/* 상세 정보나 이미지가 없는 경우 */}
                  {(!detailInfos || detailInfos.length === 0) && 
                   (!productImages || productImages.length === 0) && (
                    <div className="no-detail-content">
                      <div className="no-detail-icon">📋</div>
                      <p className="no-detail-text">상품 상세 정보가 없습니다</p>
                    </div>
                  )}
                  
                  {/* 스크롤을 위한 여백 추가 */}
                  <div style={{ height: '150px' }}></div>
               </div>
            )}
           
                       {/* 상세정보 탭 */}
            {activeTab === 'seller' && (
              <div className="seller-tab">
                {/* 상품 상세 정보 */}
                {detailInfos && detailInfos.length > 0 && (
                  <div className="product-detail-info-section">
                    <h3 className="section-title">상품 상세 정보</h3>
                    <div className="detail-info-container">
                      {detailInfos.map((info, index) => (
                        <div key={index} className="detail-info-row">
                          <span className="detail-info-label">{info.detail_col}</span>
                          <span className="detail-info-value">{info.detail_val}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* 판매자 기본 정보 */}
                <div className="seller-basic-info">
                  <h3 className="section-title">판매자 정보</h3>
                  <div className="seller-info-table">
                    <div className="seller-info-row">
                      <span className="seller-info-label">매장명</span>
                      <span className="seller-info-value">{productDetail.store_name || '홈쇼핑'}</span>
                    </div>
                    <div className="seller-info-row">
                      <span className="seller-info-label">홈쇼핑</span>
                      <span className="seller-info-value">{productDetail.homeshopping_name || 'N/A'}</span>
                    </div>
                    <div className="seller-info-row">
                      <span className="seller-info-label">채널</span>
                      <span className="seller-info-value">
                        {getChannelInfoByHomeshoppingId(productDetail.homeshopping_id)?.channel || 'N/A'}
                      </span>
                    </div>
                    <div className="seller-info-row">
                      <span className="seller-info-label">방송일</span>
                      <span className="seller-info-value">{productDetail.live_date || 'N/A'}</span>
                    </div>
                    <div className="seller-info-row">
                      <span className="seller-info-label">방송시간</span>
                      <span className="seller-info-value">
                        {productDetail.live_start_time && productDetail.live_end_time 
                          ? `${productDetail.live_start_time.slice(0, 5)} ~ ${productDetail.live_end_time.slice(0, 5)}`
                          : 'N/A'
                        }
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* 상품 기본 정보 */}
                <div className="product-basic-details">
                  <h3 className="section-title">상품 기본 정보</h3>
                  <div className="product-details-table">
                    <div className="product-detail-row">
                      <span className="product-detail-label">상품명</span>
                      <span className="product-detail-value">{productDetail.product_name}</span>
                    </div>
                    <div className="product-detail-row">
                      <span className="product-detail-label">정가</span>
                      <span className="product-detail-value">{productDetail.sale_price?.toLocaleString()}원</span>
                    </div>
                    <div className="product-detail-row">
                      <span className="product-detail-label">할인율</span>
                      <span className="product-detail-value">{productDetail.dc_rate || 0}%</span>
                    </div>
                    <div className="product-detail-row">
                      <span className="product-detail-label">할인가</span>
                      <span className="product-detail-value">{productDetail.dc_price?.toLocaleString()}원</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
         </div>
      </div>
      
             <BottomNav />
       
       {/* 맨 위로 가기 버튼 */}
       <div style={{ position: 'relative' }}>
         <UpBtn />
       </div>
    </div>
  );
};

export default HomeShoppingProductDetail;
