import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingHeader } from '../../layout/HeaderNav';
import { getProductDetail } from '../../data/products';
import '../../styles/product_detail.css';
import emptyHeartIcon from '../../assets/empty_heart.png';
import filledHeartIcon from '../../assets/filled_heart.png';
import cartIcon from '../../assets/icon-park-outline_weixin-market.png';

const ProductDetail = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [activeTab, setActiveTab] = useState('description');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isWishlisted, setIsWishlisted] = useState(false);

  useEffect(() => {
    const productData = getProductDetail(productId);
    if (productData) {
      setProduct(productData);
    } else {
      // 제품을 찾지 못한 경우, 기본 제품 데이터를 생성
      const defaultProduct = {
        id: parseInt(productId),
        name: `제품 ${productId}`,
        originalPrice: 150000,
        discountPrice: 124000,
        discountRate: 17,
        image: "/test1.png",
        rating: 4.4,
        reviewCount: 23,
        description: "이 제품에 대한 상세한 설명입니다.",
        details: {
          weight: "4kg (500g 8팩)",
          origin: "국내산",
          expiryDate: "제조일로부터 24개월",
          storage: "서늘하고 건조한 곳에 보관"
        },
        seller: {
          name: "(주)컴퍼니와우",
          representative: "(주)컴퍼니와우",
          businessNumber: "119-86-54463",
          onlineSalesNumber: "제2012-서울금천-0325호",
          phone: "02-2038-2966",
          certifiedItems: "사업자 번호, 사업자 상호",
          certificationDate: "2024-05-21",
          businessLocation: "서울 금천구 가산디지털1로 70 (가산동) 407호",
          returnAddress: "08590 서울 금천구 가산디지털1로 70 407호",
          exchangeAddress: "08590 서울 금천구 가산디지털1로 70 407호"
        },
        reviews: [
          {
            id: 1,
            user: "조**",
            rating: 5,
            date: "2025.08.01",
            comment: "가격 적당해요 배송 괜찮네요 맛 먹을만해요."
          }
        ],
        ratingDistribution: {
          5: 80,
          4: 0,
          3: 0,
          2: 0,
          1: 0
        },
        feedback: {
          "가격 저렴해요": 47,
          "배송 빨라요": 37
        }
      };
      setProduct(defaultProduct);
    }
    setLoading(false);
  }, [productId]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleSearch = (query) => {
    console.log('검색 실행:', query);
  };

  const handleNotificationClick = () => {
    console.log('알림 클릭');
  };

  const handleCartClick = () => {
    console.log('장바구니 클릭');
  };

  const handleCartButtonClick = () => {
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

  const handleWishlistClick = () => {
    setIsWishlisted(!isWishlisted);
    console.log('찜 버튼 클릭:', !isWishlisted ? '찜 추가' : '찜 해제');
    
    // 애니메이션 효과를 위한 DOM 조작
    const heartButton = document.querySelector('.heart-button');
    if (heartButton) {
      heartButton.style.transform = 'scale(1.2)';
      setTimeout(() => {
        heartButton.style.transform = 'scale(1)';
      }, 150);
    }
  };

  const renderStars = (rating) => {
    return '★'.repeat(Math.floor(rating)) + '☆'.repeat(5 - Math.floor(rating));
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'description':
        return (
          <div className="tab-content" style={{ 
            padding: '16px',
            width: '480px',
            height: '855px',
            overflowY: 'auto'
          }}>
            {/* 브랜드 섹션 */}
            <div className="brand-section" style={{ marginBottom: '24px' }}>
              <div className="brand-logos" style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                <div className="brand-logo red" style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  backgroundColor: '#FA5F8C',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '12px',
                  textAlign: 'center'
                }}>
                  <div className="logo-text" style={{ fontWeight: 'bold', marginBottom: '2px' }}>궁류나라</div>
                  <div className="logo-subtext" style={{ fontSize: '10px' }}>맘스 쇼핑몰 KING</div>
                </div>
                <div className="brand-logo black" style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  backgroundColor: '#333',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '12px',
                  textAlign: 'center'
                }}>
                  <div className="logo-text" style={{ fontWeight: 'bold', marginBottom: '2px' }}>고자미</div>
                  <div className="logo-subtext" style={{ fontSize: '10px' }}>옛부터 사랑받는 맛!</div>
                </div>
              </div>
              <div className="brand-info">
                <h3 className="brand-name" style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '4px' }}>고자미</h3>
                <p className="brand-tagline" style={{ fontSize: '14px', color: '#666' }}>맛부터 사랑받는 맛!</p>
              </div>
            </div>

            {/* 제품 설명 */}
            <div className="product-description-content" style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '12px' }}>제품 설명</h3>
              <p style={{ fontSize: '14px', lineHeight: '1.6', color: '#333' }}>{product.description}</p>
            </div>

            {/* 제품 상세 정보 */}
            <div className="product-details-summary">
              <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '12px' }}>제품 상세</h3>
              <div className="details-grid" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div className="detail-item" style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
                  <span className="detail-label" style={{ fontSize: '14px', color: '#666' }}>중량</span>
                  <span className="detail-value" style={{ fontSize: '14px', fontWeight: '500' }}>{product.details.weight}</span>
                </div>
                <div className="detail-item" style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
                  <span className="detail-label" style={{ fontSize: '14px', color: '#666' }}>원산지</span>
                  <span className="detail-value" style={{ fontSize: '14px', fontWeight: '500' }}>{product.details.origin}</span>
                </div>
                <div className="detail-item" style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
                  <span className="detail-label" style={{ fontSize: '14px', color: '#666' }}>유통기한</span>
                  <span className="detail-value" style={{ fontSize: '14px', fontWeight: '500' }}>{product.details.expiryDate}</span>
                </div>
                <div className="detail-item" style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                  <span className="detail-label" style={{ fontSize: '14px', color: '#666' }}>보관방법</span>
                  <span className="detail-value" style={{ fontSize: '14px', fontWeight: '500' }}>{product.details.storage}</span>
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'reviews':
        return (
          <div className="tab-content" style={{ 
            padding: '16px',
            width: '480px',
            height: '855px',
            overflowY: 'auto'
          }}>
            <div className="reviews-header" style={{ marginBottom: '20px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '8px' }}>리뷰 {product.reviewCount}</h3>
              <div className="overall-rating">
                <span className="rating-stars" style={{ fontSize: '16px', color: '#FA5F8C', fontWeight: 'bold' }}>★ {product.rating}</span>
              </div>
            </div>
            
            {product.reviewCount > 0 && (
              <>
                <div className="rating-distribution" style={{ marginBottom: '20px' }}>
                  {[5, 4, 3, 2, 1].map(star => (
                    <div key={star} className="rating-bar" style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                      <span className="star-label" style={{ width: '40px', fontSize: '12px' }}>{star}점</span>
                      <div className="bar-container" style={{ flex: 1, height: '8px', backgroundColor: '#f0f0f0', borderRadius: '4px', marginLeft: '8px' }}>
                        <div 
                          className="bar-fill" 
                          style={{ 
                            width: `${product.ratingDistribution[star]}%`,
                            height: '100%',
                            backgroundColor: '#FA5F8C',
                            borderRadius: '4px'
                          }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="feedback-tags" style={{ marginBottom: '20px' }}>
                  {Object.entries(product.feedback).map(([tag, count]) => (
                    <span key={tag} style={{
                      display: 'inline-block',
                      padding: '4px 8px',
                      margin: '2px',
                      backgroundColor: '#f8f9fa',
                      borderRadius: '12px',
                      fontSize: '12px',
                      color: '#666'
                    }}>
                      {tag} {count}
                    </span>
                  ))}
                </div>

                <div className="reviews-list">
                  {product.reviews.map(review => (
                    <div key={review.id} style={{ marginBottom: '16px', padding: '12px', border: '1px solid #f0f0f0', borderRadius: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontSize: '14px', fontWeight: '500' }}>{review.user}</span>
                        <span style={{ fontSize: '12px', color: '#666' }}>{review.date}</span>
                      </div>
                      <div style={{ marginBottom: '8px' }}>
                        <span style={{ color: '#FA5F8C', fontSize: '14px' }}>{renderStars(review.rating)}</span>
                      </div>
                      <p style={{ fontSize: '14px', lineHeight: '1.5', color: '#333' }}>{review.comment}</p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        );

      case 'seller':
        return (
          <div className="tab-content" style={{ 
            padding: '16px',
            width: '480px',
            height: '855px',
            overflowY: 'auto'
          }}>
            <div className="seller-info">
              <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '16px' }}>판매자 정보</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
                  <span style={{ fontSize: '14px', color: '#666' }}>상호명</span>
                  <span style={{ fontSize: '14px', fontWeight: '500' }}>{product.seller.name}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
                  <span style={{ fontSize: '14px', color: '#666' }}>대표자</span>
                  <span style={{ fontSize: '14px', fontWeight: '500' }}>{product.seller.representative}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
                  <span style={{ fontSize: '14px', color: '#666' }}>사업자등록번호</span>
                  <span style={{ fontSize: '14px', fontWeight: '500' }}>{product.seller.businessNumber}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
                  <span style={{ fontSize: '14px', color: '#666' }}>통신판매업번호</span>
                  <span style={{ fontSize: '14px', fontWeight: '500' }}>{product.seller.onlineSalesNumber}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
                  <span style={{ fontSize: '14px', color: '#666' }}>연락처</span>
                  <span style={{ fontSize: '14px', fontWeight: '500' }}>{product.seller.phone}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
                  <span style={{ fontSize: '14px', color: '#666' }}>인증항목</span>
                  <span style={{ fontSize: '14px', fontWeight: '500' }}>{product.seller.certifiedItems}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
                  <span style={{ fontSize: '14px', color: '#666' }}>인증일</span>
                  <span style={{ fontSize: '14px', fontWeight: '500' }}>{product.seller.certificationDate}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
                  <span style={{ fontSize: '14px', color: '#666' }}>사업장소재지</span>
                  <span style={{ fontSize: '14px', fontWeight: '500' }}>{product.seller.businessLocation}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
                  <span style={{ fontSize: '14px', color: '#666' }}>반품/교환주소</span>
                  <span style={{ fontSize: '14px', fontWeight: '500' }}>{product.seller.returnAddress}</span>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '16px',
        color: '#666'
      }}>
        로딩 중...
      </div>
    );
  }

  if (!product) {
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
    <div className="product-detail-page" style={{ backgroundColor: '#f8f9fa', height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <ShoppingHeader 
        onBack={handleBack}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onSearch={handleSearch}
        onNotificationClick={handleNotificationClick}
        onCartClick={handleCartClick}
      />
      
      <div className="product-content" style={{ padding: '16px', flex: 1, overflowY: 'auto', minHeight: 0 }}>
        {/* 제품 이미지 */}
        <div className="product-image-section" style={{ 
          marginBottom: '24px',
          width: '480px'
        }}>
          <img 
            src={product.image} 
            alt={product.name}
            style={{ 
              width: '100%', 
              height: '300px', 
              objectFit: 'cover',
              borderRadius: '8px'
            }}
          />
        </div>

        {/* 제품 정보 */}
        <div className="product-info" style={{ marginBottom: '24px' }}>
          <h1 className="product-name" style={{ 
            fontSize: '18px', 
            fontWeight: 'bold', 
            marginBottom: '12px',
            lineHeight: '1.4'
          }}>
            {product.name}
          </h1>
          
          <div className="product-rating" style={{ marginBottom: '12px' }}>
            <span style={{ color: '#FA5F8C', fontSize: '16px', fontWeight: 'bold' }}>
              {renderStars(product.rating)}
            </span>
            <span style={{ marginLeft: '8px', fontSize: '14px', color: '#666' }}>
              {product.rating} ({product.reviewCount}개 리뷰)
            </span>
          </div>

                                           <div className="product-price" style={{ marginBottom: '0px' }}>
                         {/* 원가 (위쪽 줄) */}
             <div style={{ marginBottom: '2px' }}>
              <span style={{ fontSize: '16px', color: '#999', textDecoration: 'line-through' }}>
                {product.originalPrice.toLocaleString()}원
              </span>
            </div>
                                      {/* 할인율과 할인가격 (아래쪽 줄) */}
                             <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                 <span style={{ 
                   fontSize: '20px', 
                   color: '#FA5F8C', 
                   fontWeight: 'bold'
                 }}>
                   {product.discountRate}%
                 </span>
                                  <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#333'}}>
                    {product.discountPrice.toLocaleString()}원
                  </span>
                                  <span style={{ fontSize: '10px', color: '#999' }}>
                    {product.shippingInfo || '배송정보 없음'}
                  </span>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               <img 
                          src={isWishlisted ? filledHeartIcon : emptyHeartIcon}
                          alt="찜"
                          className="heart-button"
                          style={{ 
                            width: '23px', 
                            height: '23px', 
                            marginLeft: '8px',
                            cursor: 'pointer',
                            transition: 'transform 0.15s ease-in-out'
                          }}
                          onClick={handleWishlistClick}
                        />
                                                                                                                                                                                                                                                                                           <img 
                        src={cartIcon}
                        alt="장바구니"
                        className="cart-button"
                        style={{ 
                          width: '23px', 
                          height: '23px', 
                          marginLeft: '0px',
                          cursor: 'pointer',
                          transition: 'transform 0.15s ease-in-out'
                        }}
                        onClick={handleCartButtonClick}
                      />
               </div>
          </div>
        </div>

                                   {/* 탭 네비게이션 */}
          <div className="tab-navigation" style={{ 
            display: 'flex', 
            borderBottom: '1px solid #e0e0e0',
            marginBottom: '16px',
            marginTop: '-12px'
          }}>
          {[
            { key: 'description', label: '상품정보' },
            { key: 'reviews', label: '리뷰' },
            { key: 'seller', label: '판매자정보' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                flex: 1,
                padding: '12px',
                border: 'none',
                backgroundColor: 'transparent',
                fontSize: '14px',
                fontWeight: activeTab === tab.key ? 'bold' : 'normal',
                color: activeTab === tab.key ? '#FA5F8C' : '#666',
                borderBottom: activeTab === tab.key ? '2px solid #FA5F8C' : 'none',
                cursor: 'pointer'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 탭 컨텐츠 */}
        {renderTabContent()}
      </div>
    </div>
  );
};

export default ProductDetail; 