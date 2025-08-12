import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import BottomNav from '../../layout/BottomNav';
import HeaderNavKokProductDetail from '../../layout/HeadernavkokProductDetail';
import { getProductDetail } from '../../data/products';
import Loading from '../../components/Loading';
import '../../styles/kok_product_detail.css';
import emptyHeartIcon from '../../assets/heart_empty.png';
import filledHeartIcon from '../../assets/heart_filled.png';
import CartButton from '../../components/CartButton';
import api from '../api';
import { ensureToken } from '../../utils/authUtils';

const KokProductDetail = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [kokProduct, setKokProduct] = useState(null);
  const [kokActiveTab, setKokActiveTab] = useState('description');
  const [kokLoading, setKokLoading] = useState(true);
  const [kokSearchQuery, setKokSearchQuery] = useState('');
  const [kokIsWishlisted, setKokIsWishlisted] = useState(false);
  const [kokProductImages, setKokProductImages] = useState([]);
  const [kokReviewStats, setKokReviewStats] = useState(null);
  const [kokReviewList, setKokReviewList] = useState([]);
  const [kokSellerInfo, setKokSellerInfo] = useState(null);
  const [kokDetailInfo, setKokDetailInfo] = useState([]);



  // KOK API에서 상품 기본 정보를 가져오는 함수
  const fetchKokProductInfo = async (productId) => {
    try {
      setKokLoading(true);
      console.log(`상품 기본 정보 API 호출: /api/kok/product/${productId}/info`);
      const response = await api.get(`/api/kok/product/${productId}/info`);
      console.log('상품 기본 정보 API 응답:', response.data);
      return response.data;
    } catch (err) {
      console.error('KOK 상품 기본 정보 로딩 실패:', err);
      console.log('임시 데이터를 사용합니다.');
      return null;
    } finally {
      setKokLoading(false);
    }
  };

  // KOK API에서 상품 상세정보 탭 데이터를 가져오는 함수
  const fetchKokProductTabs = async (productId) => {
    try {
      console.log(`상품 상세정보 탭 API 호출: /api/kok/product/${productId}/tabs`);
      const response = await api.get(`/api/kok/product/${productId}/tabs`);
      console.log('KOK 상품 상세정보 탭 데이터 응답:', response.data);
      
      // API 응답 구조 확인
      if (response.data && response.data.images) {
        return response.data;
      } else {
        console.log('API 응답에 images 필드가 없어 기본 이미지를 사용합니다.');
        return {
          images: [
            {
              kok_img_id: 1,
              kok_img_url: "https://via.placeholder.com/480x300/FFE4B5/000000?text=Product+Image+1"
            },
            {
              kok_img_id: 2,
              kok_img_url: "https://via.placeholder.com/480x300/FFB6C1/000000?text=Product+Image+2"
            }
          ]
        };
      }
    } catch (err) {
      console.error('KOK 상품 상세정보 탭 데이터 로딩 실패:', err);
      console.log('임시 데이터를 사용합니다.');
      // API 실패 시 더미 데이터 반환
      return {
        images: [
          {
            kok_img_id: 1,
            kok_img_url: "https://via.placeholder.com/480x300/FFE4B5/000000?text=Product+Image+1"
          },
          {
            kok_img_id: 2,
            kok_img_url: "https://via.placeholder.com/480x300/FFB6C1/000000?text=Product+Image+2"
          }
        ]
      };
    }
  };

  // KOK API에서 상품 리뷰 데이터를 가져오는 함수
  const fetchKokProductReviews = async (productId) => {
    try {
      console.log(`상품 리뷰 API 호출: /api/kok/product/${productId}/reviews`);
      const response = await api.get(`/api/kok/product/${productId}/reviews`);
      console.log('상품 리뷰 API 응답:', response.data);
      return response.data;
    } catch (err) {
      console.error('KOK 상품 리뷰 데이터 로딩 실패:', err);
      console.log('임시 데이터를 사용합니다.');
      return null;
    }
  };

  // KOK API에서 상품 상세 정보 데이터를 가져오는 함수
  const fetchKokProductDetails = async (productId) => {
    try {
      console.log(`상품 상세 정보 API 호출: /api/kok/product/${productId}/seller-details`);
      const response = await api.get(`/api/kok/product/${productId}/seller-details`);
      console.log('KOK 상품 상세 정보 데이터 응답:', response.data);
      return response.data;
    } catch (err) {
      console.error('KOK 상품 상세 정보 데이터 로딩 실패:', err);
      console.log('임시 데이터를 사용합니다.');
      return null;
    }
  };

  // KOK API에서 상품 상세 데이터를 가져오는 함수
  const fetchKokProductDetail = async (productId) => {
    try {
      console.log(`상품 상세 데이터 API 호출: /api/kok/product/${productId}`);
      const response = await api.get(`/api/kok/product/${productId}`);
      console.log('상품 상세 데이터 API 응답:', response.data);
      return response.data;
    } catch (err) {
      console.error('KOK 상품 상세 데이터 로딩 실패:', err);
      console.log('임시 데이터를 사용합니다.');
      return null;
    }
  };

  // KOK API에서 상품 전체 상세 정보를 가져오는 함수 (API 명세서 기반)
  const fetchKokProductFullDetail = async (productId) => {
    try {
      console.log(`상품 전체 상세 정보 API 호출: /api/kok/product/${productId}/full-detail`);
      const response = await api.get(`/api/kok/product/${productId}/full-detail`);
      console.log('KOK 상품 전체 상세 정보 API 응답:', response.data);
      return response.data;
    } catch (err) {
      console.error('KOK 상품 전체 상세 정보 로딩 실패:', err);
      console.log('개별 API를 사용합니다.');
      return null;
    }
  };

  useEffect(() => {
    const loadKokProductData = async () => {
      try {
        setKokLoading(true);
        
        // 토큰이 없으면 임시 로그인 시도
        await ensureToken();
        
        // 먼저 KOK API에서 기본 정보를 가져와보고, 실패하면 기존 데이터 사용
        const kokProductInfo = await fetchKokProductInfo(productId);
        
        if (kokProductInfo) {
          // KOK API 기본 정보를 기존 구조에 맞게 변환
          const convertedKokProduct = {
            id: kokProductInfo.kok_product_id,
            name: kokProductInfo.kok_product_name,
            originalPrice: kokProductInfo.kok_product_price,
            discountPrice: kokProductInfo.kok_discounted_price,
            discountRate: kokProductInfo.kok_discount_rate,
            image: kokProductInfo.kok_thumbnail,
            rating: kokProductInfo.kok_review_score || 0,
            reviewCount: kokProductInfo.kok_review_cnt || 0
          };
          setKokProduct(convertedKokProduct);
          
          // 백엔드에서 제공하는 찜 상태 설정
          if (kokProductInfo.is_liked !== undefined) {
            setKokIsWishlisted(kokProductInfo.is_liked);
            console.log('백엔드에서 찜 상태 확인:', kokProductInfo.is_liked);
          }

          // 전체 상세 정보 API를 먼저 시도
          const fullDetailData = await fetchKokProductFullDetail(productId);
          
          if (fullDetailData) {
            // 전체 상세 정보 API 성공 시
            console.log('전체 상세 정보 API 사용');
            
            // 상품 이미지 설정
            if (fullDetailData.images && fullDetailData.images.length > 0) {
              setKokProductImages(fullDetailData.images);
            }
            
            // 리뷰 통계 및 목록 설정
            if (fullDetailData.review_examples && fullDetailData.review_examples.length > 0) {
              setKokReviewList(fullDetailData.review_examples);
              
              // 리뷰 통계 생성
              const stats = {
                kok_review_score: fullDetailData.kok_review_score || 0,
                kok_review_cnt: fullDetailData.kok_review_cnt || 0,
                kok_5_ratio: fullDetailData.kok_5_ratio || 0,
                kok_4_ratio: fullDetailData.kok_4_ratio || 0,
                kok_3_ratio: fullDetailData.kok_3_ratio || 0,
                kok_2_ratio: fullDetailData.kok_2_ratio || 0,
                kok_1_ratio: fullDetailData.kok_1_ratio || 0,
                kok_aspect_price: fullDetailData.kok_aspect_price || 0,
                kok_aspect_price_ratio: fullDetailData.kok_aspect_price_ratio || 0,
                kok_aspect_delivery: fullDetailData.kok_aspect_delivery || 0,
                kok_aspect_delivery_ratio: fullDetailData.kok_aspect_delivery_ratio || 0,
                kok_aspect_quality: fullDetailData.kok_aspect_quality || 0,
                kok_aspect_quality_ratio: fullDetailData.kok_aspect_quality_ratio || 0
              };
              setKokReviewStats(stats);
            }
            
            // 판매자 정보 및 상세 정보 설정
            if (fullDetailData.detail_infos && fullDetailData.detail_infos.length > 0) {
              setKokDetailInfo(fullDetailData.detail_infos);
            }
            
            // 판매자 정보 설정
            if (fullDetailData.kok_co_ceo) {
              const sellerInfo = {
                kok_co_ceo: fullDetailData.kok_co_ceo,
                kok_co_reg_no: fullDetailData.kok_co_reg_no,
                kok_co_ec_reg: fullDetailData.kok_co_ec_reg,
                kok_tell: fullDetailData.kok_tell,
                kok_ver_item: fullDetailData.kok_ver_item,
                kok_ver_date: fullDetailData.kok_ver_date,
                kok_co_addr: fullDetailData.kok_co_addr,
                kok_return_addr: fullDetailData.kok_return_addr
              };
              setKokSellerInfo(sellerInfo);
            }
          } else {
            // 전체 상세 정보 API 실패 시 개별 API 사용
            console.log('개별 API 사용');
            try {
              const [kokProductTabs, kokProductReviews, kokProductDetails] = await Promise.all([
                fetchKokProductTabs(productId),
                fetchKokProductReviews(productId),
                fetchKokProductDetails(productId)
              ]);

              // 상품 상세정보 탭 데이터 처리
              if (kokProductTabs && kokProductTabs.images) {
                console.log('상품 이미지 데이터 설정:', kokProductTabs.images);
                setKokProductImages(kokProductTabs.images);
              } else {
                console.log('상품 이미지 데이터가 없어 기본 이미지를 사용합니다.');
                setKokProductImages([
                  {
                    kok_img_id: 1,
                    kok_img_url: "https://via.placeholder.com/480x300/FFE4B5/000000?text=Default+Product+Image"
                  }
                ]);
              }

              // 상품 리뷰 데이터 처리
              if (kokProductReviews) {
                setKokReviewStats(kokProductReviews.stats);
                setKokReviewList(kokProductReviews.reviews);
              }

              // 상품 상세 정보 데이터 처리
              if (kokProductDetails) {
                setKokSellerInfo(kokProductDetails.seller_info);
                setKokDetailInfo(kokProductDetails.detail_info);
              }
            } catch (error) {
              console.error('상세 데이터 로딩 중 오류 발생:', error);
            }
          }
        } else {
          // 기존 로직 사용
          const productData = getProductDetail(productId);
          if (productData) {
            setKokProduct(productData);
          } else {
            // 제품을 찾지 못한 경우, 기본 제품 데이터를 생성
            const defaultKokProduct = {
              id: parseInt(productId),
              name: `제품 ${productId}`,
              originalPrice: 0,
              discountPrice: 0,
              discountRate: 0,
              image: "",
              rating: 0,
              reviewCount: 0
            };
            setKokProduct(defaultKokProduct);
          }
        }
      } catch (error) {
        console.error('상품 데이터 로딩 중 오류 발생:', error);
      } finally {
        setKokLoading(false);
      }
    };

    loadKokProductData();
  }, [productId]);

  const handleKokBack = () => {
    // 검색 페이지에서 온 경우 검색 페이지로 돌아가기
    const fromState = location.state;
    
    if (fromState && fromState.from === 'search' && fromState.backUrl) {
      console.log('검색 페이지로 돌아가기:', fromState.backUrl);
      navigate(fromState.backUrl);
    } else {
      // 일반적인 뒤로가기
      console.log('일반 뒤로가기');
      navigate(-1);
    }
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

  const handleKokCartButtonClick = () => {
    console.log('장바구니 버튼 클릭');
    
    // 애니메이션 효과를 위한 DOM 조작
    const cartButton = document.querySelector('.cart-button');
    if (cartButton) {
      cartButton.style.transform = 'scale(1.2)';
      setTimeout(() => {
        cartButton.style.transform = 'scale(1)';
      }, 150);
    }
  };

  const handleKokWishlistClick = async () => {
    try {
      // API 호출을 위한 토큰 확인
      const token = localStorage.getItem('access_token');
      if (!token) {
        console.log('토큰이 없어서 로그인 페이지로 이동');
        window.location.href = '/';
        return;
      }

      // API 호출
      const response = await api.post('/api/kok/likes/toggle', {
        kok_product_id: productId
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('찜 API 응답:', response.data);
      
      // 찜 상태 토글
      setKokIsWishlisted(!kokIsWishlisted);
      console.log('찜 버튼 클릭:', !kokIsWishlisted ? '찜 추가' : '찜 해제');
      
      // 애니메이션 효과를 위한 DOM 조작
      const heartButton = document.querySelector('.heart-button');
      if (heartButton) {
        heartButton.style.transform = 'scale(1.2)';
        setTimeout(() => {
          heartButton.style.transform = 'scale(1)';
        }, 150);
      }
    } catch (error) {
      console.error('찜 API 호출 실패:', error);
      
      // 에러 발생 시 사용자에게 알림
      if (error.response?.status === 401) {
        alert('로그인이 필요합니다.');
        window.location.href = '/';
      } else {
        alert('찜 기능을 사용할 수 없습니다. 다시 시도해주세요.');
      }
    }
  };

  const renderKokStars = (rating) => {
    return '★'.repeat(Math.floor(rating)) + '☆'.repeat(5 - Math.floor(rating));
  };

  const renderKokTabContent = () => {
    switch (kokActiveTab) {
      case 'description':
        return (
          <div className="kok-tab-content" style={{ 
            padding: '16px',
            width: '100%',
            maxWidth: '448px',
            height: '855px',
            overflowY: 'auto'
          }}>
            {/* KOK API에서 가져온 상품 이미지들 */}
            {kokProductImages.length > 0 && (
              <div className="product-images-section" style={{ marginTop: '24px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '12px' }}>상품 상세 이미지</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {kokProductImages.map((image) => (
                    <div key={image.kok_img_id} style={{ width: '100%' }}>
                      <img 
                        src={image.kok_img_url} 
                        alt={`상품 상세 이미지 ${image.kok_img_id}`}
                        style={{ 
                          width: '100%', 
                          height: 'auto',
                          borderRadius: '8px'
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      
      case 'reviews':
        return (
          <div className="kok-tab-content" style={{ 
            padding: '16px',
            width: '100%',
            maxWidth: '448px',
            height: '855px',
            overflowY: 'auto'
          }}>
            <div className="reviews-header" style={{ marginBottom: '20px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '8px' }}>
                리뷰 {kokReviewStats ? kokReviewStats.kok_review_cnt : kokProduct.reviewCount}
              </h3>
              <div className="overall-rating">
                <span className="rating-stars" style={{ fontSize: '16px', color: '#FA5F8C', fontWeight: 'bold' }}>
                  ★ {kokReviewStats ? kokReviewStats.kok_review_score : kokProduct.rating}
                </span>
              </div>
            </div>
            
            {/* 평가 항목 표시 */}
            {kokReviewStats && (
              <div className="feedback-tags" style={{ marginBottom: '20px' }}>
                <span style={{
                  display: 'inline-block',
                  padding: '4px 8px',
                  margin: '2px',
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                  fontSize: '12px',
                  color: '#666',
                  border: '1px solid #f0f0f0'
                }}>
                  가격 {kokReviewStats.kok_aspect_price} {kokReviewStats.kok_aspect_price_ratio}%
                </span>
                <span style={{
                  display: 'inline-block',
                  padding: '4px 8px',
                  margin: '2px',
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                  fontSize: '12px',
                  color: '#666',
                  border: '1px solid #f0f0f0'
                }}>
                  배송 {kokReviewStats.kok_aspect_delivery} {kokReviewStats.kok_aspect_delivery_ratio}%
                </span>
                <span style={{
                  display: 'inline-block',
                  padding: '4px 8px',
                  margin: '2px',
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                  fontSize: '12px',
                  color: '#666',
                  border: '1px solid #f0f0f0'
                }}>
                  품질 {kokReviewStats.kok_aspect_quality} {kokReviewStats.kok_aspect_quality_ratio}%
                </span>
              </div>
            )}
            
            {/* 별점 분포 표시 */}
            {kokReviewStats && (
              <div className="rating-distribution" style={{ marginBottom: '20px' }}>
                {[5, 4, 3, 2, 1].map(star => (
                  <div key={star} className="rating-bar" style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                    <span className="star-label" style={{ width: '40px', fontSize: '12px' }}>{star}점</span>
                    <div className="bar-container" style={{ flex: 1, height: '8px', backgroundColor: '#f0f0f0', borderRadius: '4px', marginLeft: '8px' }}>
                      <div 
                        className="bar-fill" 
                        style={{ 
                          width: `${kokReviewStats[`kok_${star}_ratio`] || 0}%`,
                          height: '100%',
                          backgroundColor: '#FA5F8C',
                          borderRadius: '4px'
                        }}
                      ></div>
                    </div>
                    <span style={{ marginLeft: '8px', fontSize: '12px', color: '#666', width: '30px' }}>
                      {kokReviewStats[`kok_${star}_ratio`] || 0}%
                    </span>
                  </div>
                ))}
              </div>
            )}
            
            {/* API에서 실제 리뷰 데이터가 있을 때만 표시 */}
            {kokReviewList.length > 0 ? (
              <div className="reviews-list">
                {kokReviewList.map(review => (
                  <div key={review.kok_review_id} style={{ marginBottom: '16px', padding: '12px', border: '1px solid #f0f0f0', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontSize: '14px', fontWeight: '500' }}>{review.kok_review_user}</span>
                      <span style={{ fontSize: '12px', color: '#666' }}>{review.kok_review_date}</span>
                    </div>
                    <div style={{ marginBottom: '8px' }}>
                      <span style={{ color: '#FA5F8C', fontSize: '14px' }}>
                        {renderKokStars(review.kok_review_score)}
                      </span>
                    </div>
                    <p style={{ fontSize: '14px', lineHeight: '1.5', color: '#333' }}>
                      {review.kok_review_text}
                    </p>
                    {review.kok_price_eval && (
                      <div style={{ marginTop: '8px', fontSize: '12px', color: '#666' }}>
                        <span style={{ marginRight: '8px' }}>가격: {review.kok_price_eval}</span>
                        <span style={{ marginRight: '8px' }}>배송: {review.kok_delivery_eval}</span>
                        <span>맛: {review.kok_taste_eval}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ 
                textAlign: 'center', 
                padding: '40px 20px',
                color: '#999',
                fontSize: '14px'
              }}>
                아직 리뷰가 없습니다.
              </div>
            )}
          </div>
        );

      case 'details':
        return (
          <div className="kok-tab-content" style={{ 
            padding: '16px',
            width: '100%',
            maxWidth: '448px',
            height: '855px',
            overflowY: 'auto'
          }}>
            <div className="details-info">
              <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '16px' }}>상세 정보</h3>
              
              {/* 판매자 정보 */}
              {kokSellerInfo && (
                <div style={{ marginBottom: '24px' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '12px', color: '#333' }}>판매자 정보</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f0f0f0' }}>
                      <span style={{ fontSize: '13px', color: '#666' }}>상호명/대표자</span>
                      <span style={{ fontSize: '13px', fontWeight: '500' }}>{kokSellerInfo.kok_co_ceo}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f0f0f0' }}>
                      <span style={{ fontSize: '13px', color: '#666' }}>사업자등록번호</span>
                      <span style={{ fontSize: '13px', fontWeight: '500' }}>{kokSellerInfo.kok_co_reg_no}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f0f0f0' }}>
                      <span style={{ fontSize: '13px', color: '#666' }}>통신판매업신고</span>
                      <span style={{ fontSize: '13px', fontWeight: '500' }}>{kokSellerInfo.kok_co_ec_reg}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f0f0f0' }}>
                      <span style={{ fontSize: '13px', color: '#666' }}>전화번호</span>
                      <span style={{ fontSize: '13px', fontWeight: '500' }}>{kokSellerInfo.kok_tell}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f0f0f0' }}>
                      <span style={{ fontSize: '13px', color: '#666' }}>인증완료 항목</span>
                      <span style={{ fontSize: '13px', fontWeight: '500' }}>{kokSellerInfo.kok_ver_item}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f0f0f0' }}>
                      <span style={{ fontSize: '13px', color: '#666' }}>인증시기</span>
                      <span style={{ fontSize: '13px', fontWeight: '500' }}>{kokSellerInfo.kok_ver_date}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f0f0f0' }}>
                      <span style={{ fontSize: '13px', color: '#666' }}>영업소재지</span>
                      <span style={{ fontSize: '13px', fontWeight: '500' }}>{kokSellerInfo.kok_co_addr}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
                      <span style={{ fontSize: '13px', color: '#666' }}>반품주소</span>
                      <span style={{ fontSize: '13px', fontWeight: '500' }}>{kokSellerInfo.kok_return_addr}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* 상세 정보 */}
              {kokDetailInfo.length > 0 && (
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '12px', color: '#333' }}>제품 상세 정보</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {kokDetailInfo.map((detail, index) => (
                      <div key={index} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f0f0f0' }}>
                        <span style={{ fontSize: '13px', color: '#666' }}>{detail.kok_detail_col}</span>
                        <span style={{ fontSize: '13px', fontWeight: '500' }}>{detail.kok_detail_val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* API 데이터가 없는 경우 안내 메시지 */}
              {!kokSellerInfo && !kokDetailInfo.length && (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '40px 20px',
                  color: '#999',
                  fontSize: '14px'
                }}>
                  상세 정보가 없습니다.
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (kokLoading) {
    return (
      <Loading 
        message="상품 정보를 불러오는 중 ..." 
        containerStyle={{ height: '100vh' }}
      />
    );
  }

  if (!kokProduct) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '16px',
        color: '#666'
      }}>
        제품을 찾을 수 없습니다.
      </div>
    );
  }

  return (
    <div className="kok-product-detail-page" style={{ backgroundColor: '#ffffff', height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <HeaderNavKokProductDetail 
        onBackClick={handleKokBack}
        onNotificationsClick={handleKokNotificationClick}
        onCartClick={handleKokCartClick}
      />
      
      <div className="product-content">
        {/* 제품 이미지 */}
        <div className="product-image-section" style={{ 
          marginBottom: '24px',
          width: '100%',
          maxWidth: '448px'
        }}>
          <img 
            src={kokProduct.image} 
            alt={kokProduct.name}
            style={{ 
              width: '100%', 
              height: '300px', 
              objectFit: 'cover',
              borderRadius: '8px'
            }}
          />
        </div>

        {/* 제품 정보 */}
        <div className="product-info" style={{ 
          marginBottom: '24px',
          width: '100%',
          maxWidth: '448px'
        }}>
          <h1 className="product-name" style={{ 
            fontSize: '18px', 
            fontWeight: 'bold', 
            marginBottom: '12px',
            lineHeight: '1.4'
          }}>
            {kokProduct.name}
          </h1>
          
          <div className="product-rating" style={{ marginBottom: '12px' }}>
            <span style={{ color: '#FA5F8C', fontSize: '16px', fontWeight: 'bold' }}>
              {renderKokStars(kokReviewStats ? kokReviewStats.kok_review_score : kokProduct.rating)}
            </span>
            <span style={{ marginLeft: '8px', fontSize: '14px', color: '#666' }}>
              {kokReviewStats ? kokReviewStats.kok_review_score : kokProduct.rating} ({kokReviewStats ? kokReviewStats.kok_review_cnt : kokProduct.reviewCount}개 리뷰)
            </span>
          </div>

          <div className="product-price" style={{ marginBottom: '0px' }}>
            {/* 원가 (위쪽 줄) */}
            <div style={{ marginBottom: '2px' }}>
              <span style={{ fontSize: '16px', color: '#999', textDecoration: 'line-through' }}>
                {kokProduct.originalPrice.toLocaleString()}원
              </span>
            </div>
            {/* 할인율과 할인가격 (아래쪽 줄) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ 
                fontSize: '20px', 
                color: '#FA5F8C', 
                fontWeight: 'bold'
              }}>
                {kokProduct.discountRate}%
              </span>
              <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#333'}}>
                {kokProduct.discountPrice.toLocaleString()}원
              </span>
              <span style={{ fontSize: '10px', color: '#999' }}>
                {kokProduct.shippingInfo || '배송정보 없음'}
              </span>
              <img 
                src={kokIsWishlisted ? filledHeartIcon : emptyHeartIcon}
                alt="찜"
                className="heart-button"
                style={{ 
                  width: '38px', 
                  height: '38px', 
                  marginLeft: '8px',
                  cursor: 'pointer',
                  transition: 'transform 0.15s ease-in-out'
                }}
                onClick={handleKokWishlistClick}
              />
              <CartButton 
                productId={productId}
                size="30px"
                onClick={handleKokCartButtonClick}
                style={{ marginLeft: '0px' }}
              />
            </div>
          </div>
        </div>

        {/* 탭 네비게이션 */}
        <div className="kok-tab-navigation" style={{ 
          display: 'flex', 
          borderBottom: '1px solid #e0e0e0',
          marginBottom: '16px',
          marginTop: '-12px'
        }}>
          {[
            { key: 'description', label: '상품정보' },
            { 
              key: 'reviews', 
              label: `리뷰(${(kokReviewStats?.kok_review_cnt ?? kokProduct?.reviewCount ?? 0)}개)` 
            },
            { key: 'details', label: '상세정보' }
          ].map(tab => (
            <button
              key={tab.key}
              className={`kok-tab-button ${kokActiveTab === tab.key ? 'active' : ''}`}
              onClick={() => setKokActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 탭 컨텐츠 */}
        {renderKokTabContent()}
      </div>
      
      <BottomNav />
    </div>
  );
};

export default KokProductDetail; 