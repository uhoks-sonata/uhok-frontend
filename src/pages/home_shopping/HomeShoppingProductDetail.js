import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { homeShoppingApi } from '../../api/homeShoppingApi';
import { useUser } from '../../contexts/UserContext';
import HeaderNavBackBtn from '../../components/HeaderNavBackBtn';
import BottomNav from '../../layout/BottomNav';
import Loading from '../../components/Loading';
import emptyHeartIcon from '../../assets/heart_empty.png';
import filledHeartIcon from '../../assets/heart_filled.png';
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
  
  // 찜 토글 함수
  const handleLikeToggle = async () => {
    try {
      if (!isLoggedIn) {
        alert('로그인이 필요합니다.');
        navigate('/login');
        return;
      }
      
      const response = await homeShoppingApi.toggleProductLike(productId);
      console.log('찜 토글 응답:', response);
      
      setIsLiked(response.liked);
      
      // 성공 메시지 표시
      if (response.message) {
        alert(response.message);
      }
      
    } catch (error) {
      console.error('찜 토글 실패:', error);
      alert('찜 상태 변경에 실패했습니다.');
    }
  };
  
  // 라이브 스트림 재생
  const handleLiveStream = () => {
    if (streamData && streamData.stream_url) {
      window.open(streamData.stream_url, '_blank', 'width=800,height=600');
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
      return { status: 'upcoming', text: '방송 예정', icon: '📺' };
    } else if (now >= liveStart && now <= liveEnd) {
      return { status: 'live', text: 'LIVE', icon: '🔴' };
    } else {
      return { status: 'ended', text: '방송 종료', icon: '⏹️' };
    }
  };
  
  // 로딩 상태
  if (loading) {
    return (
      <div className="homeshopping-product-detail-page">
        <HeaderNavBackBtn onBackClick={() => navigate(-1)} />
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
        <HeaderNavBackBtn onBackClick={() => navigate(-1)} />
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
        <HeaderNavBackBtn onBackClick={() => navigate(-1)} />
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
      <HeaderNavBackBtn onBackClick={() => navigate(-1)} />
      
      <div className="product-detail-container">
        {/* 상품 이미지 섹션 */}
        <div className="product-image-section">
          <div className="image-container">
            <img 
              src={productDetail.thumb_img_url || '/placeholder-image.png'} 
              alt={productDetail.product_name}
              className="product-image"
              onError={(e) => {
                e.target.src = '/placeholder-image.png';
                e.target.alt = '이미지 로드 실패';
              }}
            />
            
            {/* 방송 상태 배지 */}
            {broadcastStatus && (
              <div className={`broadcast-status ${broadcastStatus.status}`}>
                <span className="status-icon">{broadcastStatus.icon}</span>
                <span className="status-text">{broadcastStatus.text}</span>
              </div>
            )}
            
            {/* 찜 버튼 */}
            <button 
              className={`like-button ${isLiked ? 'liked' : ''}`}
              onClick={handleLikeToggle}
              title={isLiked ? '찜 해제' : '찜 추가'}
            >
              <img 
                src={isLiked ? filledHeartIcon : emptyHeartIcon} 
                alt="찜" 
                className="heart-icon"
              />
            </button>
          </div>
          
          {/* 라이브 스트림 버튼 */}
          {broadcastStatus?.status === 'live' && streamData?.stream_url && (
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
            <h1 className="product-name">{productDetail.product_name}</h1>
            <div className="product-meta">
              <span className="store-name">{productDetail.store_name || '홈쇼핑'}</span>
            </div>
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
              
              {/* 방송 상태 정보 */}
              {broadcastStatus && (
                <div className="broadcast-status-info">
                  <h3 className="section-title">방송 상태</h3>
                  <div className={`status-display ${broadcastStatus.status}`}>
                    <span className="status-icon">{broadcastStatus.icon}</span>
                    <span className="status-text">{broadcastStatus.text}</span>
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
                          src={product.thumb_img_url || '/placeholder-image.png'} 
                          alt={product.product_name}
                          className="kok-product-image"
                          onError={(e) => {
                            e.target.src = '/placeholder-image.png';
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
    </div>
  );
};

export default HomeShoppingProductDetail;
