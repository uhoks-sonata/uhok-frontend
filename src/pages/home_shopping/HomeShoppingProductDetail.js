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
  const [isIngredient, setIsIngredient] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [streamData, setStreamData] = useState(null);
  const [isStreamLoading, setIsStreamLoading] = useState(false);
  const [kokRecommendations, setKokRecommendations] = useState([]);
  const [recipeRecommendations, setRecipeRecommendations] = useState([]);
  
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
        setProductDetail(detailResponse.product);
        setIsLiked(detailResponse.product?.is_liked || false);
        
        // 상품 분류 확인 (식재료/완제품)
        try {
          const classificationResponse = await homeShoppingApi.checkProductClassification(productId);
          console.log('🏷️ 상품 분류:', classificationResponse);
          setIsIngredient(classificationResponse.is_ingredient);
          
          // 식재료인 경우 레시피 추천 가져오기
          if (classificationResponse.is_ingredient) {
            try {
              const recipeResponse = await homeShoppingApi.getRecipeRecommendations(productId);
              console.log('👨‍🍳 레시피 추천:', recipeResponse);
              setRecipeRecommendations(recipeResponse.recipes || []);
            } catch (recipeError) {
              console.error('레시피 추천 가져오기 실패:', recipeError);
            }
          }
        } catch (classificationError) {
          console.error('상품 분류 확인 실패:', classificationError);
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
  
  // 레시피 상세로 이동
  const handleRecipeClick = (recipeId) => {
    navigate(`/recipes/${recipeId}`);
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
        <HeaderNavBackBtn onBackClick={() => navigate(-1)} />
        <Loading />
      </div>
    );
  }
  
  // 에러 상태
  if (error) {
    return (
      <div className="homeshopping-product-detail-page">
        <HeaderNavBackBtn onBackClick={() => navigate(-1)} />
        <div className="error-message">
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>새로고침</button>
        </div>
      </div>
    );
  }
  
  // 상품 정보가 없는 경우
  if (!productDetail) {
    return (
      <div className="homeshopping-product-detail-page">
        <HeaderNavBackBtn onBackClick={() => navigate(-1)} />
        <div className="no-product">
          <p>상품 정보를 찾을 수 없습니다.</p>
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
        {/* 상품 이미지 */}
        <div className="product-image-section">
          <img 
            src={productDetail.thumb_img_url} 
            alt={productDetail.product_name}
            className="product-image"
          />
          
          {/* 방송 상태 배지 */}
          {broadcastStatus && (
            <div className={`broadcast-status ${broadcastStatus.status}`}>
              {broadcastStatus.text}
            </div>
          )}
          
          {/* 라이브 스트림 버튼 */}
          {broadcastStatus?.status === 'live' && streamData?.stream_url && (
            <button 
              className="live-stream-button"
              onClick={handleLiveStream}
              disabled={isStreamLoading}
            >
              {isStreamLoading ? '로딩 중...' : '라이브 시청'}
            </button>
          )}
        </div>
        
        {/* 상품 정보 */}
        <div className="product-info-section">
          <div className="product-header">
            <h1 className="product-name">{productDetail.product_name}</h1>
            <button 
              className={`like-button ${isLiked ? 'liked' : ''}`}
              onClick={handleLikeToggle}
            >
              <img 
                src={isLiked ? filledHeartIcon : emptyHeartIcon} 
                alt="찜" 
                className="heart-icon"
              />
            </button>
          </div>
          
          <div className="product-meta">
            <span className="store-name">{productDetail.store_name}</span>
            {isIngredient && <span className="ingredient-badge">식재료</span>}
          </div>
          
          {/* 가격 정보 */}
          <div className="price-section">
            <div className="original-price">
              {productDetail.sale_price?.toLocaleString()}원
            </div>
            <div className="discount-info">
              <span className="discount-rate">{productDetail.dc_rate}%</span>
              <span className="discounted-price">
                {productDetail.dc_price?.toLocaleString()}원
              </span>
            </div>
          </div>
          
          {/* 방송 정보 */}
          <div className="broadcast-info">
            <h3>방송 정보</h3>
            <div className="broadcast-details">
              <p>방송일: {productDetail.live_date}</p>
              <p>방송시간: {productDetail.live_start_time} ~ {productDetail.live_end_time}</p>
            </div>
          </div>
        </div>
        
        {/* 상품 상세 정보 */}
        {productDetail.detail_infos && productDetail.detail_infos.length > 0 && (
          <div className="product-details-section">
            <h3>상품 상세 정보</h3>
            <div className="detail-info">
              {productDetail.detail_infos.map((info, index) => (
                <div key={index} className="detail-item">
                  {Object.entries(info).map(([key, value]) => (
                    <div key={key} className="detail-row">
                      <span className="detail-label">{key}:</span>
                      <span className="detail-value">{value}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* 상품 이미지 */}
        {productDetail.images && productDetail.images.length > 0 && (
          <div className="product-images-section">
            <h3>상품 이미지</h3>
            <div className="image-gallery">
              {productDetail.images.map((imageGroup, index) => (
                <div key={index} className="image-group">
                  {Object.entries(imageGroup).map(([key, imageUrl]) => (
                    <img 
                      key={key}
                      src={imageUrl} 
                      alt={`상품 이미지 ${index + 1}`}
                      className="gallery-image"
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* 콕 상품 추천 */}
        {kokRecommendations.length > 0 && (
          <div className="kok-recommendations-section">
            <h3>유사한 콕 상품</h3>
            <div className="kok-products">
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
        
        {/* 레시피 추천 (식재료인 경우) */}
        {isIngredient && recipeRecommendations.length > 0 && (
          <div className="recipe-recommendations-section">
            <h3>이 식재료로 만드는 레시피</h3>
            <div className="recipe-list">
              {recipeRecommendations.map((recipe) => (
                <div 
                  key={recipe.recipe_id} 
                  className="recipe-card"
                  onClick={() => handleRecipeClick(recipe.recipe_id)}
                >
                  <img 
                    src={recipe.thumb_img_url} 
                    alt={recipe.recipe_name}
                    className="recipe-image"
                  />
                  <div className="recipe-info">
                    <h4 className="recipe-name">{recipe.recipe_name}</h4>
                    <p className="recipe-description">{recipe.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      <BottomNav />
    </div>
  );
};

export default HomeShoppingProductDetail;
