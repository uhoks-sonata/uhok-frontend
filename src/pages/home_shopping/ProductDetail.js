import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingHeader } from '../../layout/HeaderNav';
import '../../styles/product_detail.css';

const ProductDetail = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [activeTab, setActiveTab] = useState('description');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // 목업용 제품 데이터
  const dummyProducts = [
    {
      id: 1,
      name: "[2025년산 햇 고추] 국내산 청결 햇 고춧가루 2kg(500g4 팩)",
      originalPrice: 28000,
      discountPrice: 13600,
      discountRate: 51,
      image: "/test1.png",
      rating: 4.4,
      reviewCount: 5,
      description: "예천 청결고추로 만든 특별한 고춧가루입니다. 진한 붉은색과 강한 매운맛이 특징입니다. 햇고추의 신선함을 그대로 담아낸 프리미엄 고춧가루입니다.",
      details: {
        weight: "2kg (500g 4팩)",
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
          comment: "가격 적당해요 배송 괜찮네요 맛 먹을만해요 파김치가 아주 맛있어요."
        },
        {
          id: 2,
          user: "김**",
          rating: 5,
          date: "2025.07.28",
          comment: "품질이 좋고 맛있어요. 다음에도 구매할 예정입니다."
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
    },
    {
      id: 2,
      name: "농팜 | [농팜] (1+1) 당일제조 전라도식 김치 파김치 500g",
      originalPrice: 13600,
      discountPrice: 13600,
      discountRate: 51,
      image: "/test2.png",
      rating: 4.1,
      reviewCount: 17,
      description: "당일제조 전라도식 김치 파김치입니다. 신선한 파와 특제 양념으로 만든 전통적인 맛을 느껴보세요. 매콤달콤한 맛이 특징입니다.",
      details: {
        weight: "500g",
        origin: "국내산",
        expiryDate: "제조일로부터 18개월",
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
          user: "박**",
          rating: 4,
          date: "2025.07.25",
          comment: "맛있어요! 다음에도 구매할 예정입니다."
        }
      ],
      ratingDistribution: {
        5: 60,
        4: 30,
        3: 10,
        2: 0,
        1: 0
      },
      feedback: {
        "맛이 좋아요": 85,
        "신선해요": 70
      }
    },
    {
      id: 3,
      name: "햅쌀",
      originalPrice: 25000,
      discountPrice: 20900,
      discountRate: 16,
      image: "/test3.png",
      rating: 4.8,
      reviewCount: 24,
      description: "[수려한합천] 24년 햅쌀 합천농협 영호진미 단일미 등급상입니다. 합천의 맑은 물과 비옥한 토양에서 자란 최고급 쌀입니다. 쫄깃하고 맛있는 밥맛을 경험해보세요.",
      details: {
        weight: "4kg",
        origin: "국내산",
        expiryDate: "가급적 빠른 섭취 권장",
        storage: "습기없고, 서늘한 장소에 보관해 주시기 바랍니다."
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
          user: "박**",
          rating: 5,
          date: "2025.07.25",
          comment: "정말 맛있는 쌀이에요! 밥맛이 완전히 달라요."
        },
        {
          id: 2,
          user: "이**",
          rating: 5,
          date: "2025.07.20",
          comment: "햅쌀이라서 더욱 맛있어요. 다음에도 구매할 예정입니다."
        }
      ],
      ratingDistribution: {
        5: 90,
        4: 10,
        3: 0,
        2: 0,
        1: 0
      },
      feedback: {
        "맛이 좋아요": 85,
        "품질이 좋아요": 78
      }
    }
  ];

  useEffect(() => {
    const foundProduct = dummyProducts.find(p => p.id === parseInt(productId));
    if (foundProduct) {
      setProduct(foundProduct);
    } else {
      setProduct(dummyProducts[0]);
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

  const renderStars = (rating) => {
    return '★'.repeat(Math.floor(rating)) + '☆'.repeat(5 - Math.floor(rating));
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'description':
        return (
          <div className="tab-content" style={{ padding: '16px' }}>
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
          <div className="tab-content" style={{ padding: '16px' }}>
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
                
                <div className="feedback-section" style={{ marginBottom: '20px' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '12px' }}>다른 구매자들은 이렇게 평가했어요</h4>
                  {Object.entries(product.feedback).map(([key, value]) => (
                    <div key={key} className="feedback-item" style={{ marginBottom: '8px' }}>
                      <span className="feedback-text" style={{ fontSize: '12px', display: 'block', marginBottom: '4px' }}>{key}</span>
                      <div className="feedback-bar-container" style={{ height: '6px', backgroundColor: '#f0f0f0', borderRadius: '3px' }}>
                        <div 
                          className="feedback-bar-fill" 
                          style={{ 
                            width: `${value}%`,
                            height: '100%',
                            backgroundColor: '#FA5F8C',
                            borderRadius: '3px'
                          }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="reviews-list">
                  {product.reviews.map(review => (
                    <div key={review.id} className="review-item" style={{ 
                      padding: '16px 0', 
                      borderBottom: '1px solid #f0f0f0',
                      marginBottom: '16px'
                    }}>
                      <div className="review-header" style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                        <span className="review-user" style={{ fontSize: '12px', color: '#666', marginRight: '8px' }}>{review.user}</span>
                        <span className="review-stars" style={{ fontSize: '12px', color: '#FA5F8C', marginRight: '8px' }}>{renderStars(review.rating)}</span>
                        <span className="review-date" style={{ fontSize: '12px', color: '#999' }}>{review.date}</span>
                      </div>
                      <p className="review-comment" style={{ fontSize: '14px', lineHeight: '1.5', color: '#333' }}>{review.comment}</p>
                    </div>
                  ))}
                </div>
              </>
            )}
            
            {product.reviewCount === 0 && (
              <div className="no-reviews" style={{ textAlign: 'center', padding: '40px 0' }}>
                <p style={{ fontSize: '14px', color: '#999' }}>아직 리뷰가 없습니다.</p>
              </div>
            )}
          </div>
        );
      
      case 'details':
        return (
          <div className="tab-content" style={{ padding: '16px' }}>
            <div className="seller-info" style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '12px' }}>판매자 정보</h3>
              <div className="info-table" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div className="info-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
                  <span className="info-label" style={{ fontSize: '14px', color: '#666' }}>판매자</span>
                  <span className="info-value" style={{ fontSize: '14px', fontWeight: '500' }}>{product.seller.name}</span>
                </div>
                <div className="info-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
                  <span className="info-label" style={{ fontSize: '14px', color: '#666' }}>상호명/대표자</span>
                  <span className="info-value" style={{ fontSize: '14px', fontWeight: '500' }}>{product.seller.representative}</span>
                </div>
                <div className="info-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
                  <span className="info-label" style={{ fontSize: '14px', color: '#666' }}>사업자등록번호</span>
                  <span className="info-value" style={{ fontSize: '14px', fontWeight: '500' }}>{product.seller.businessNumber}</span>
                </div>
                <div className="info-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
                  <span className="info-label" style={{ fontSize: '14px', color: '#666' }}>통신판매업신고</span>
                  <span className="info-value" style={{ fontSize: '14px', fontWeight: '500' }}>{product.seller.onlineSalesNumber}</span>
                </div>
                <div className="info-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
                  <span className="info-label" style={{ fontSize: '14px', color: '#666' }}>전화번호</span>
                  <span className="info-value" style={{ fontSize: '14px', fontWeight: '500' }}>{product.seller.phone}</span>
                </div>
                <div className="info-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
                  <span className="info-label" style={{ fontSize: '14px', color: '#666' }}>인증완료 항목</span>
                  <span className="info-value" style={{ fontSize: '14px', fontWeight: '500' }}>{product.seller.certifiedItems}</span>
                </div>
                <div className="info-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
                  <span className="info-label" style={{ fontSize: '14px', color: '#666' }}>인증시기</span>
                  <span className="info-value" style={{ fontSize: '14px', fontWeight: '500' }}>{product.seller.certificationDate}</span>
                </div>
                <div className="info-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
                  <span className="info-label" style={{ fontSize: '14px', color: '#666' }}>영업소재지</span>
                  <span className="info-value" style={{ fontSize: '14px', fontWeight: '500' }}>{product.seller.businessLocation}</span>
                </div>
                <div className="info-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
                  <span className="info-label" style={{ fontSize: '14px', color: '#666' }}>반품주소</span>
                  <span className="info-value" style={{ fontSize: '14px', fontWeight: '500' }}>{product.seller.returnAddress}</span>
                </div>
                <div className="info-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                  <span className="info-label" style={{ fontSize: '14px', color: '#666' }}>교환주소</span>
                  <span className="info-value" style={{ fontSize: '14px', fontWeight: '500' }}>{product.seller.exchangeAddress}</span>
                </div>
              </div>
            </div>
            
            <div className="product-info-disclosure">
              <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '12px' }}>상품정보제공 고시</h3>
              <div className="info-table" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div className="info-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
                  <span className="info-label" style={{ fontSize: '14px', color: '#666' }}>중량</span>
                  <span className="info-value" style={{ fontSize: '14px', fontWeight: '500' }}>{product.details.weight}</span>
                </div>
                <div className="info-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
                  <span className="info-label" style={{ fontSize: '14px', color: '#666' }}>원산지</span>
                  <span className="info-value" style={{ fontSize: '14px', fontWeight: '500' }}>{product.details.origin}</span>
                </div>
                <div className="info-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
                  <span className="info-label" style={{ fontSize: '14px', color: '#666' }}>유통기한</span>
                  <span className="info-value" style={{ fontSize: '14px', fontWeight: '500' }}>{product.details.expiryDate}</span>
                </div>
                <div className="info-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                  <span className="info-label" style={{ fontSize: '14px', color: '#666' }}>보관방법</span>
                  <span className="info-value" style={{ fontSize: '14px', fontWeight: '500' }}>{product.details.storage}</span>
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
    return <div style={{ padding: '20px', textAlign: 'center' }}>로딩 중...</div>;
  }

  if (!product) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>제품을 찾을 수 없습니다.</div>;
  }

  return (
    <div style={{
      maxWidth: '480px',
      margin: '0 auto',
      backgroundColor: '#ffffff',
      height: '100vh',
      position: 'relative',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      overflow: 'hidden' // 전체 컨테이너는 스크롤 방지
    }}>
      {/* 전체 스크롤 영역 */}
      <div style={{
        height: '100%',
        overflowY: 'auto', // 세로 스크롤 활성화
        paddingBottom: '100px' // 구매 버튼 공간 확보
      }}>
        {/* 쇼핑 헤더 */}
        <ShoppingHeader
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onSearch={handleSearch}
          onNotificationClick={handleNotificationClick}
          onCartClick={handleCartClick}
          onBack={handleBack}
        />

        {/* 제품 요약 섹션 */}
        <div style={{
          padding: '16px',
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #f0f0f0',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '8px',
            overflow: 'hidden',
            flexShrink: 0
          }}>
            <img 
              src={product.image} 
              alt={product.name} 
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
          </div>
          <div style={{
            flex: 1,
            minWidth: 0
          }}>
            <div style={{
              fontSize: '14px',
              fontWeight: '500',
              color: '#333',
              marginBottom: '4px',
              lineHeight: '1.3',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical'
            }}>
              {product.name}
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span style={{
                color: '#FA5F8C',
                fontWeight: 'bold',
                fontSize: '16px'
              }}>
                {product.discountRate}%
              </span>
              <span style={{
                color: '#333',
                fontWeight: 'bold',
                fontSize: '16px'
              }}>
                {product.discountPrice.toLocaleString()}원
              </span>
            </div>
          </div>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '4px'
          }}>
            <div style={{
              width: '16px',
              height: '2px',
              backgroundColor: '#ccc',
              borderRadius: '1px'
            }}></div>
            <div style={{
              width: '16px',
              height: '2px',
              backgroundColor: '#ccc',
              borderRadius: '1px'
            }}></div>
            <div style={{
              width: '16px',
              height: '2px',
              backgroundColor: '#ccc',
              borderRadius: '1px'
            }}></div>
          </div>
          <button style={{
            background: 'none',
            border: 'none',
            fontSize: '18px',
            color: '#999',
            cursor: 'pointer',
            padding: '4px'
          }}>
            ×
          </button>
        </div>

        {/* 탭 네비게이션 */}
        <div style={{
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #e0e0e0',
          display: 'flex',
          minHeight: '48px'
        }}>
          <button 
            onClick={() => setActiveTab('description')}
            style={{ 
              flex: 1, 
              background: 'none', 
              border: 'none', 
              padding: '16px 8px', 
              fontSize: '14px', 
              fontWeight: activeTab === 'description' ? 'bold' : '500',
              color: activeTab === 'description' ? '#333' : '#666',
              cursor: 'pointer',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            상품설명
            {activeTab === 'description' && (
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '2px',
                backgroundColor: '#FA5F8C'
              }}></div>
            )}
          </button>
          <button 
            onClick={() => setActiveTab('reviews')}
            style={{ 
              flex: 1, 
              background: 'none', 
              border: 'none', 
              padding: '16px 8px', 
              fontSize: '14px', 
              fontWeight: activeTab === 'reviews' ? 'bold' : '500',
              color: activeTab === 'reviews' ? '#333' : '#666',
              cursor: 'pointer',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            리뷰 {product.reviewCount}
            {activeTab === 'reviews' && (
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '2px',
                backgroundColor: '#FA5F8C'
              }}></div>
            )}
          </button>
          <button 
            onClick={() => setActiveTab('details')}
            style={{ 
              flex: 1, 
              background: 'none', 
              border: 'none', 
              padding: '16px 8px', 
              fontSize: '14px', 
              fontWeight: activeTab === 'details' ? 'bold' : '500',
              color: activeTab === 'details' ? '#333' : '#666',
              cursor: 'pointer',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            상세정보
            {activeTab === 'details' && (
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '2px',
                backgroundColor: '#FA5F8C'
              }}></div>
            )}
          </button>
        </div>

        {/* 탭 컨텐츠 */}
        <div style={{
          backgroundColor: '#ffffff'
        }}>
          {renderTabContent()}
        </div>
      </div>

      {/* 구매 버튼 - 하단 고정 */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '100%',
        maxWidth: '480px',
        padding: '16px',
        backgroundColor: '#ffffff',
        borderTop: '1px solid #f0f0f0',
        zIndex: 1000
      }}>
        <button style={{
          width: '100%',
          backgroundColor: '#FA5F8C',
          color: 'white',
          border: 'none',
          padding: '16px',
          fontSize: '16px',
          fontWeight: 'bold',
          borderRadius: '8px',
          cursor: 'pointer',
          transition: 'background-color 0.2s'
        }}>
          구매하기
        </button>
      </div>
    </div>
  );
};

export default ProductDetail; 