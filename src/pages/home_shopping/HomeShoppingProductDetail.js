import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { homeShoppingApi } from '../../api/homeShoppingApi';
import { useUser } from '../../contexts/UserContext';
import HeaderNavSchedule from '../../layout/HeaderNavSchedule';
import BottomNav from '../../layout/BottomNav';
import Loading from '../../components/Loading';
import UpBtn from '../../components/UpBtn';
import HomeshoppingKokRecommendation from '../../components/HomeshoppingKokRecommendation';
import ModalManager, { showWishlistNotification, showWishlistUnlikedNotification, hideModal } from '../../components/LoadingModal';
import emptyHeartIcon from '../../assets/heart_empty.png';
import filledHeartIcon from '../../assets/heart_filled.png';
import api from '../../pages/api';

// 홈쇼핑 로고 관련 컴포넌트
import { getLogoByHomeshoppingId, getChannelInfoByHomeshoppingId } from '../../components/homeshoppingLogo';

import '../../styles/homeshopping_product_detail.css';

const HomeShoppingProductDetail = () => {
  const navigate = useNavigate();
  const { live_id } = useParams(); // live_id로 사용
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

  const [wishlistedProducts, setWishlistedProducts] = useState(new Set()); // 찜된 상품 ID들을 저장
  const [activeTab, setActiveTab] = useState('detail'); // 탭 상태 관리
  
  // 모달 상태 관리
  const [modalState, setModalState] = useState({ isVisible: false, modalType: 'loading' });
  
  // 상품 상세 정보 가져오기
  useEffect(() => {
    // live_id가 유효하지 않으면 API 호출하지 않음
    if (!live_id || live_id === 'undefined' || live_id === 'null' || live_id === '') {
      console.log('❌ 유효하지 않은 live_id:', live_id, '타입:', typeof live_id);
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
        
        console.log('🛍️ 홈쇼핑 상품 상세 정보 가져오기 (live_id):', live_id, `(시도 ${retryCount + 1}/${maxRetries + 1})`);
        console.log('🔍 live_id 상세 정보:', { value: live_id, type: typeof live_id, length: String(live_id).length });
        
        // 상품 상세 정보 가져오기 (live_id 사용)
        const detailResponse = await homeShoppingApi.getProductDetail(live_id);
        console.log('✅ 상품 상세 정보:', detailResponse);
        
        if (!isMounted) return;
        
        if (detailResponse && detailResponse.product) {
          setProductDetail(detailResponse.product);
          setIsLiked(detailResponse.product.is_liked || false);
          
          // 상세 정보와 이미지 설정 (새로운 API 스펙에 맞게)
          if (detailResponse.detail_infos) {
            setDetailInfos(detailResponse.detail_infos);
          }
          if (detailResponse.images) {
            setProductImages(detailResponse.images);
          }
          
          // 상품 상세 정보 로딩 완료 후 찜 상태 초기화
          initializeWishlistStatus();
        }
        
                 // 콕 상품 추천과 레시피 추천은 productDetail이 설정된 후에 호출
         // 이 부분은 useEffect의 의존성 배열에 productDetail을 추가하여 처리
        
        // 라이브 스트림 정보 가져오기 (live_id 사용)
        try {
          const streamResponse = await homeShoppingApi.getLiveStreamUrl(live_id);
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
    
    if (live_id) {
      fetchProductDetail();
    }
    
         // 컴포넌트 언마운트 시 정리
     return () => {
       isMounted = false;
     };
   }, [live_id]);
   
   // productDetail이 설정된 후 콕 상품 추천과 레시피 추천 가져오기
   useEffect(() => {
     if (!productDetail?.product_id) return;
     
     let isMounted = true;
     
     const fetchRecommendations = async () => {
       try {
                   // 콕 상품 추천 가져오기 (새로운 API 엔드포인트 사용)
          console.log('🔍 콕 상품 추천 API 호출 시작 (product_id):', productDetail.product_id);
          const kokResponse = await homeShoppingApi.getKokRecommendations(productDetail.product_id);
          console.log('💡 콕 상품 추천 응답:', kokResponse);
         
         if (isMounted) {
           const products = kokResponse?.products || [];
           console.log('✅ 콕 상품 추천 설정:', {
             count: products.length,
             products: products
           });
           setKokRecommendations(products);
         }
         
         // 상품이 식재료인지 확인하고 레시피 추천 가져오기
         console.log('🔍 상품 분류 확인 API 호출 (product_id):', productDetail.product_id);
         const classifyResponse = await homeShoppingApi.checkProductClassify(productDetail.product_id);
         console.log('💡 상품 분류 응답:', classifyResponse);
         
         // 상품 분류 정보를 productDetail에 저장
         if (isMounted && classifyResponse) {
           setProductDetail(prev => ({
             ...prev,
             is_ingredient: classifyResponse.is_ingredient
           }));
           
                       if (classifyResponse.is_ingredient) {
              console.log('🥬 식재료 상품 확인됨, 레시피 추천 버튼 표시');
            } else {
              console.log('📦 완제품 상품이므로 레시피 추천 버튼 숨김');
            }
         }
         
       } catch (error) {
         console.error('❌ 추천 데이터 가져오기 실패:', error);
         if (isMounted) {
           setKokRecommendations([]);
         }
       }
     };
     
     fetchRecommendations();
     
     return () => {
       isMounted = false;
     };
   }, [productDetail?.product_id]);
  
  // 찜 상태 초기화 함수
  const initializeWishlistStatus = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;

      // 사용자의 찜한 홈쇼핑 상품 목록 가져오기 (live_id 기준)
      const response = await api.get('/api/homeshopping/likes', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data && response.data.liked_products) {
        const likedProductIds = new Set(response.data.liked_products.map(product => product.product_id || product.live_id));
        setWishlistedProducts(likedProductIds);
        console.log('찜 상태 초기화 완료:', likedProductIds.size, '개 상품 (product_id 기준)');
      }
    } catch (error) {
      console.error('찜 상태 초기화 실패:', error);
    }
  };

  // 찜 토글 함수 (홈쇼핑 상품용) - Schedule.js와 동일한 방식
  const handleHeartToggle = async (liveId) => {
    try {
      // 토큰 확인
      const token = localStorage.getItem('access_token');
      if (!token) {
        console.log('토큰이 없어서 로그인 필요 팝업 표시');
        // 다른 파일들과 동일하게 alert만 표시하고 제자리에 유지
        alert('로그인이 필요한 서비스입니다.');
        return;
      }

      // 찜 토글 API 호출 (product_id 사용 - 백엔드 호환성)
      const requestPayload = { product_id: productDetail?.product_id || liveId };
      
      // console.log('🔍 찜 토글 API 요청 페이로드:', requestPayload);
      
      const response = await api.post('/api/homeshopping/likes/toggle', requestPayload, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('찜 토글 응답:', response.data);

             // 찜 토글 성공 후 백엔드 응답에 따라 상태 업데이트
       if (response.data) {
         console.log('찜 토글 성공! 백엔드 응답에 따라 상태를 업데이트합니다.');
         
         // 백엔드 응답의 liked 상태에 따라 찜 상태 업데이트
         const isLiked = response.data.liked;
         const productId = productDetail?.product_id || liveId;
         
         setWishlistedProducts(prev => {
           const newSet = new Set(prev);
           if (isLiked) {
             // 백엔드에서 찜된 상태로 응답
             newSet.add(productId);
             console.log('✅ 찜이 추가되었습니다. 채워진 하트로 변경됩니다.');
           } else {
             // 백엔드에서 찜 해제된 상태로 응답
             newSet.delete(productId);
             console.log('❌ 찜이 해제되었습니다. 빈 하트로 변경됩니다.');
           }
           return newSet;
         });
        
        // 애니메이션 효과 추가
        const heartButton = document.querySelector(`[data-product-id="${liveId}"]`);
        if (heartButton) {
          heartButton.style.transform = 'scale(1.2)';
          setTimeout(() => {
            heartButton.style.transform = 'scale(1)';
          }, 150);
        }
        
        // 찜 상태에 따른 알림 모달 표시
        if (isLiked) {
          // 찜 추가 시 알림
          setModalState(showWishlistNotification());
        } else {
          // 찜 해제 시 알림
          setModalState(showWishlistUnlikedNotification());
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

  // 모달 닫기 함수
  const closeModal = () => {
    setModalState(hideModal());
  };
  
  // 방송 상태 확인
  const getBroadcastStatus = () => {
    if (!productDetail || !productDetail.live_date || !productDetail.live_start_time || !productDetail.live_end_time) {
      console.log('❌ 방송 상태 확인 실패: 필수 데이터 누락', {
        live_date: productDetail?.live_date,
        live_start_time: productDetail?.live_start_time,
        live_end_time: productDetail?.live_end_time
      });
      return null;
    }
    
    const now = new Date();
    
    // 원본 데이터 로깅
    console.log('📅 원본 방송 데이터:', {
      live_date: productDetail.live_date,
      live_start_time: productDetail.live_start_time,
      live_end_time: productDetail.live_end_time
    });
    
    // 현재 시간을 한국 시간으로 조정 (UTC+9)
    const koreaTime = new Date(now.getTime() + (9 * 60 * 60 * 1000));
    
    // 방송 날짜와 시간을 파싱하여 한국 시간 기준으로 Date 객체 생성
    const [year, month, day] = productDetail.live_date.split('-').map(Number);
    const [startHour, startMinute] = productDetail.live_start_time.split(':').map(Number);
    const [endHour, endMinute] = productDetail.live_end_time.split(':').map(Number);
    
    // 한국 시간 기준으로 방송 시작/종료 시간 생성
    const liveStart = new Date(year, month - 1, day, startHour, startMinute);
    const liveEnd = new Date(year, month - 1, day, endHour, endMinute);
    
    console.log('🔍 방송 상태 확인 상세:', {
      현재시간_UTC: now.toLocaleString(),
      현재시간_한국: koreaTime.toLocaleString(),
      방송시작: liveStart.toLocaleString(),
      방송종료: liveEnd.toLocaleString(),
      현재시간_타임스탬프: koreaTime.getTime(),
      시작시간_타임스탬프: liveStart.getTime(),
      종료시간_타임스탬프: liveEnd.getTime(),
      시간차이: {
        시작까지: liveStart.getTime() - koreaTime.getTime(),
        종료까지: liveEnd.getTime() - koreaTime.getTime()
      }
    });
    
    // 현재 시간과 방송 시간 비교
    if (koreaTime < liveStart) {
      console.log('✅ 방송 예정 - 현재시간 < 방송시작시간');
      return { status: 'upcoming', text: '방송 예정' };
    } else if (koreaTime >= liveStart && koreaTime <= liveEnd) {
      console.log('✅ 방송 중 (LIVE) - 방송시작시간 <= 현재시간 <= 방송종료시간');
      return { status: 'live', text: 'LIVE' };
    } else {
      console.log('✅ 방송 종료 - 현재시간 > 방송종료시간');
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
               
               {/* 홈쇼핑 이름
               <div className="hsproduct-homeshopping-name">
                 {productDetail.homeshopping_name || getChannelInfoByHomeshoppingId(productDetail.homeshopping_id)?.name || '홈쇼핑'}
               </div> */}
               
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
                  data-product-id={live_id} // live_id 사용
                  onClick={(e) => {
                    e.stopPropagation();
                    handleHeartToggle(live_id); // live_id 사용
                  }}
                >
                  <img 
                    src={wishlistedProducts.has(productDetail?.product_id || live_id) ? filledHeartIcon : emptyHeartIcon} // product_id 우선 사용
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
         
         {/* 콕 상품 추천 섹션 - 가격 정보 바로 아래에 위치 */}
         <HomeshoppingKokRecommendation 
           kokRecommendations={kokRecommendations}
           onKokProductClick={handleKokProductClick}
         />
         
         {/* 레시피 추천 섹션 - 콕 상품 추천 아래에 위치 */}
         {productDetail?.is_ingredient && (
           <div className="recipe-recommendation-section">
             <div className="recipe-section-header">
               <h3 className="recipe-section-title">이 상품으로 만들 수 있는 레시피</h3>
               <button 
                 className="recipe-search-button"
                                 onClick={() => navigate('/recipes/result', {
                  state: {
                    recipes: [],
                    ingredients: [productDetail.product_name],
                    searchType: 'keyword',
                    page: 1,
                    total: 0,
                    combination_number: 1,
                    has_more_combinations: false,
                    product_id: productDetail.product_id,
                    product_name: productDetail.product_name
                  }
                })}
               >
                 레시피 보러 가기
               </button>
             </div>
             <div className="recipe-info-message">
               <p className="recipe-message-text">
                 이 상품으로 만들 수 있는 다양한 레시피를 찾아보세요!
               </p>
             </div>
           </div>
         )}
         
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
                 

               </div>
             )}
                    </div>
        </div>
       
              <BottomNav />
       
       {/* 맨 위로 가기 버튼 */}
       <div style={{ position: 'relative' }}>
         <UpBtn />
       </div>
       
       {/* 모달 관리자 */}
       <ModalManager
         {...modalState}
         onClose={closeModal}
       />
    </div>
  );
};

export default HomeShoppingProductDetail;
