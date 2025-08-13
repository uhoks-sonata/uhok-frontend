// 콕 결제 페이지 - 결제 처리 및 결제 확인 기능 구현
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { kokApi } from '../../api/kokApi';
import HeaderNavPayment from '../../layout/HeaderNavPayment';
import BottomNav from '../../layout/BottomNav';
import api from '../api';
import '../../styles/kok_payment.css';

const KokPayment = () => {
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardHolderName, setCardHolderName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState('pending'); // pending, processing, completed, failed
  const [orderInfo, setOrderInfo] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  
  const navigate = useNavigate();
  const location = useLocation();

  // URL 파라미터나 state에서 주문 정보 가져오기
  useEffect(() => {
    const fetchOrderInfo = async () => {
      console.log('🔍 fetchOrderInfo 시작');
      console.log('🔍 location.state:', location.state);
      console.log('🔍 location.search:', location.search);
      console.log('🔍 location.pathname:', location.pathname);
      
      // 1. location.state에서 데이터 읽기 (우선순위 1)
      if (location.state?.fromCart) {
        console.log('🛒 location.state에서 장바구니 데이터 감지됨!');
        console.log('장바구니에서 전달받은 주문 정보:', {
          discountPrice: location.state.discountPrice,
          originalPrice: location.state.originalPrice,
          productName: location.state.productName,
          productImage: location.state.productImage,
          cartItems: location.state.cartItems,
          orderId: location.state.orderId
        });

        // 장바구니에서 전달받은 할인 가격 정보 사용
        const orderInfoData = {
          kokOrderId: `KOK-${location.state.orderId || 'CART'}`,
          orderId: location.state.orderId || 'ORD-CART',
          productName: location.state.productName || '장바구니 상품',
          quantity: location.state.cartItems?.reduce((total, item) => total + item.kok_quantity, 0) || 1,
          price: location.state.discountPrice || 29900,
          totalAmount: location.state.discountPrice || 29900,
          productId: 'CART',
          productImage: location.state.productImage || '/test1.png',
          // 장바구니 정보 추가
          fromCart: true,
          cartItems: location.state.cartItems,
          originalPrice: location.state.originalPrice
        };
        
        console.log('✅ 설정할 orderInfo:', orderInfoData);
        setOrderInfo(orderInfoData);
        return;
      }
      
      // 2. URL 파라미터에서 데이터 읽기 (우선순위 2)
      const urlParams = new URLSearchParams(location.search);
      const dataParam = urlParams.get('data');
      
      if (dataParam) {
        try {
          const decodedData = JSON.parse(decodeURIComponent(dataParam));
          console.log('📡 URL 파라미터에서 읽은 데이터:', decodedData);
          
          if (decodedData.fromCart) {
            console.log('🛒 URL 파라미터에서 장바구니 데이터 감지됨!');
            
            // 장바구니에서 전달받은 할인 가격 정보 사용
            const orderInfoData = {
              kokOrderId: `KOK-${decodedData.orderId || 'CART'}`,
              orderId: decodedData.orderId || 'ORD-CART',
              productName: decodedData.productName || '장바구니 상품',
              quantity: decodedData.cartItems?.reduce((total, item) => total + item.kok_quantity, 0) || 1,
              price: decodedData.discountPrice || 29900,
              totalAmount: decodedData.discountPrice || 29900,
              productId: 'CART',
              productImage: decodedData.productImage || '/test1.png',
              // 장바구니 정보 추가
              fromCart: true,
              cartItems: decodedData.cartItems,
              originalPrice: decodedData.originalPrice
            };
            
            console.log('✅ URL 파라미터에서 설정할 orderInfo:', orderInfoData);
            setOrderInfo(orderInfoData);
            
            // location.state에도 저장 (UI 표시용)
            if (!location.state) {
              window.history.replaceState(decodedData, '');
            }
            
            return;
          }
        } catch (error) {
          console.error('❌ URL 파라미터 파싱 실패:', error);
        }
      }
      
      // 3. 기존 location.state 처리 (우선순위 3)
      if (location.state?.orderInfo) {
        console.log('✅ orderInfo가 있는 경우');
        setOrderInfo(location.state.orderInfo);
      } else if (location.state?.productId) {
        // 상품 상세페이지에서 전달받은 제품 ID로 실제 제품 정보를 API에서 가져오기
        console.log('📱 상품 상세페이지에서 넘어온 경우 감지됨!');
        const productId = location.state.productId;
        console.log('상품 상세페이지에서 전달받은 제품 ID:', productId);
        
        // 상품 상세페이지에서 전달받은 할인 가격 정보가 있는지 확인
        if (location.state.fromProductDetail && location.state.discountPrice) {
          console.log('상품 상세페이지에서 전달받은 할인 가격 정보:', {
            discountPrice: location.state.discountPrice,
            originalPrice: location.state.originalPrice,
            discountRate: location.state.discountRate,
            productName: location.state.productName
          });
          
                     // 전달받은 할인 가격 정보 사용
           setOrderInfo({
             kokOrderId: `KOK-${productId}`,
             orderId: `ORD-${productId}`,
             productName: location.state.productName || `제품 ID: ${productId}`,
             quantity: 1,
             price: location.state.discountPrice,
             totalAmount: location.state.discountPrice,
             productId: productId,
             productImage: location.state.productImage || '/test1.png' // 상품 상세페이지에서 전달받은 이미지 사용
           });
        } else {
          try {
            // 제품 기본 정보 가져오기
            const productInfo = await api.get(`/api/kok/product/${productId}/info`);
            console.log('제품 기본 정보 API 응답:', productInfo.data);
            
            if (productInfo.data) {
              const product = productInfo.data;
              
              // 제품 메인 이미지 가져오기 (제품 기본 정보에서 메인 이미지 사용)
              let productImage = '/test1.png';
              
              // 제품 기본 정보에서 메인 이미지 필드 확인 (제품 상세페이지와 동일한 우선순위)
              if (product.kok_thumbnail) {
                // 제품 상세페이지에서 사용하는 썸네일 이미지 우선 사용
                productImage = product.kok_thumbnail;
              } else if (product.kok_product_image) {
                productImage = product.kok_product_image;
              } else if (product.image) {
                productImage = product.image;
              } else if (product.kok_img_url) {
                productImage = product.kok_img_url;
              } else {
                // 메인 이미지가 없으면 이미지 탭 API에서 첫 번째 이미지 사용 (폴백)
                try {
                  const imageResponse = await api.get(`/api/kok/product/${productId}/tabs`);
                  if (imageResponse.data && imageResponse.data.images && imageResponse.data.images.length > 0) {
                    productImage = imageResponse.data.images[0].kok_img_url;
                  }
                } catch (imageError) {
                  console.log('제품 이미지 로드 실패, 기본 이미지 사용:', imageError);
                }
              }
              
              // 할인된 가격 또는 원래 가격 사용
              const finalPrice = product.kok_product_discounted_price || 
                                product.kok_product_final_price || 
                                product.kok_product_price || 
                                29900;
              
              setOrderInfo({
                kokOrderId: `KOK-${productId}`,
                orderId: `ORD-${productId}`,
                productName: product.kok_product_name || `제품 ID: ${productId}`,
                quantity: 1,
                price: finalPrice,
                totalAmount: finalPrice,
                productId: productId,
                productImage: productImage
              });
            } else {
              // API 실패 시 기본 정보로 설정
              setOrderInfo({
                kokOrderId: `KOK-${productId}`,
                orderId: `ORD-${productId}`,
                productName: `제품 ID: ${productId}`,
                quantity: 1,
                price: 29900,
                totalAmount: 29900,
                productId: productId
              });
            }
          } catch (error) {
            console.error('제품 정보 API 호출 실패:', error);
            // API 실패 시 기본 정보로 설정
            setOrderInfo({
              kokOrderId: `KOK-${productId}`,
              orderId: `ORD-${productId}`,
              productName: `제품 ID: ${productId}`,
              quantity: 1,
              price: 29900,
              totalAmount: 29900,
              productId: productId
            });
          }
        }
      } else {
        // 기본 주문 정보 (실제로는 API에서 가져와야 함)
        console.log('⚠️ 기본 더미데이터 사용 (location.state가 비어있음)');
        setOrderInfo({
          kokOrderId: '12345',
          orderId: 'ORD-001',
          productName: '테스트 상품',
          quantity: 1,
          price: 29900,
          totalAmount: 29900
        });
      }
    };

    fetchOrderInfo();
    
    // 테스트용 기본 카드 정보 설정
    setCardNumber('1234 5678 9012 3456');
    setExpiryDate('12/25');
    setCvv('123');
    setCardHolderName('홍길동');
    
    console.log('🚀 KokPayment 컴포넌트 마운트됨');
  }, [location]);

  // 결제 처리 함수 (비동기)
  const handlePayment = async () => {
    console.log('🎯 handlePayment 함수 호출됨!');
    console.log('현재 상태:', { paymentMethod, cardNumber, expiryDate, cvv, cardHolderName, orderInfo });
    
    if (!validatePaymentForm()) {
      console.log('❌ 폼 유효성 검사 실패');
      return;
    }

    console.log('✅ 폼 유효성 검사 통과, 결제 처리 시작');
    setIsProcessing(true);
    setPaymentStatus('processing');
    setErrorMessage('');

    try {
      // 실제 결제 처리 API 호출 (여기서는 시뮬레이션)
      console.log('💳 결제 처리 중...', {
        paymentMethod,
        cardNumber,
        expiryDate,
        cvv,
        cardHolderName,
        orderInfo
      });

      // 결제 처리 시뮬레이션 (3초 대기)
      console.log('⏳ 3초 대기 시작...');
      await new Promise(resolve => setTimeout(resolve, 3000));
      console.log('✅ 3초 대기 완료');

      // 결제 성공 후 결제 확인 처리
      console.log('🔄 결제 확인 처리 시작...');
      await handlePaymentConfirmation();

    } catch (error) {
      console.error('❌ 결제 처리 실패:', error);
      setPaymentStatus('failed');
      setErrorMessage('결제 처리 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      console.log('🏁 결제 처리 완료, isProcessing = false');
      setIsProcessing(false);
    }
  };

  // 결제 확인 처리 함수 (비동기)
  const handlePaymentConfirmation = async () => {
    try {
      console.log('결제 확인 처리 시작...');

      let confirmationResult;

      // 단건 결제 확인 시도
      if (orderInfo?.kokOrderId) {
        console.log(`단건 결제 확인: kok_order_id = ${orderInfo.kokOrderId}`);
        confirmationResult = await kokApi.confirmKokPayment(orderInfo.kokOrderId);
        
        if (confirmationResult.success) {
          console.log('단건 결제 확인 성공:', confirmationResult.message);
          setPaymentStatus('completed');
          alert('결제가 완료되었습니다!');
          navigate('/mypage');
          return;
        }
      }

      // 주문 단위 결제 확인 시도
      if (orderInfo?.orderId) {
        console.log(`주문 단위 결제 확인: order_id = ${orderInfo.orderId}`);
        confirmationResult = await kokApi.confirmOrderUnitPayment(orderInfo.orderId);
        
        if (confirmationResult.success) {
          console.log('주문 단위 결제 확인 성공:', confirmationResult.message);
          setPaymentStatus('completed');
          alert('결제가 완료되었습니다!');
          navigate('/mypage');
          return;
        }
      }

      // 결제 확인 실패
      if (confirmationResult) {
        setPaymentStatus('failed');
        setErrorMessage(confirmationResult.message || '결제 확인에 실패했습니다.');
      }

    } catch (error) {
      console.error('결제 확인 처리 실패:', error);
      setPaymentStatus('failed');
      setErrorMessage('결제 확인 처리 중 오류가 발생했습니다.');
    }
  };

  // 결제 폼 유효성 검사
  const validatePaymentForm = () => {
    console.log('🔍 폼 유효성 검사 시작');
    console.log('현재 입력값:', { cardNumber, expiryDate, cvv, cardHolderName });
    
    if (paymentMethod === 'card') {
      if (!cardNumber.trim()) {
        console.log('❌ 카드 번호 누락');
        alert('카드 번호를 입력해주세요.');
        return false;
      }
      if (!expiryDate.trim()) {
        console.log('❌ 만료일 누락');
        alert('만료일을 입력해주세요.');
        return false;
      }
      if (!cvv.trim()) {
        console.log('❌ CVV 누락');
        alert('CVV를 입력해주세요.');
        return false;
      }
      if (!cardHolderName.trim()) {
        console.log('❌ 카드 소유자명 누락');
        alert('카드 소유자명을 입력해주세요.');
        return false;
      }
    }
    
    console.log('✅ 폼 유효성 검사 통과');
    return true;
  };

  // 카드 번호 포맷팅
  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  // 만료일 포맷팅
  const formatExpiryDate = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const handleCardNumberChange = (e) => {
    const formatted = formatCardNumber(e.target.value);
    setCardNumber(formatted);
  };

  const handleExpiryDateChange = (e) => {
    const formatted = formatExpiryDate(e.target.value);
    setExpiryDate(formatted);
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="payment-page">
      {/* 주문 결제 헤더 네비게이션 */}
      <HeaderNavPayment 
        onBackClick={handleBack}
      />
      
      <div className="payment-content">        
        <div className="order-summary">
          <h2>주문 요약</h2>
          
          {/* 디버깅 정보 표시 */}
          <div style={{ 
            backgroundColor: '#f8f9fa', 
            padding: '10px', 
            marginBottom: '15px', 
            borderRadius: '8px', 
            fontSize: '12px',
            border: '1px solid #dee2e6'
          }}>
            <strong>🔍 디버깅 정보:</strong><br/>
            fromCart: {orderInfo?.fromCart ? '✅' : '❌'}<br/>
            상품 수: {orderInfo?.cartItems?.length || 0}개<br/>
            총 수량: {orderInfo?.quantity || 0}개<br/>
            할인가: ₩{orderInfo?.price?.toLocaleString() || '0'}
          </div>
          
          {orderInfo && (
            <div className="order-summary-items">
              {/* 장바구니에서 넘어온 경우 각 상품을 개별적으로 표시 */}
              {orderInfo.fromCart && orderInfo.cartItems ? (
                <div className="cart-items-individual">
                  <h4 style={{ marginBottom: '20px', fontSize: '18px', color: '#212529', fontWeight: '600' }}>
                    선택된 상품들 ({orderInfo.cartItems.length}개)
                  </h4>
                  
                  {/* 판매자별로 상품 그룹화 */}
                  {(() => {
                    // 판매자별로 상품 그룹화
                    const groupedByStore = {};
                    orderInfo.cartItems.forEach(item => {
                      const storeName = item.kok_store_name || '콕';
                      if (!groupedByStore[storeName]) {
                        groupedByStore[storeName] = [];
                      }
                      groupedByStore[storeName].push(item);
                    });

                    return Object.entries(groupedByStore).map(([storeName, items]) => (
                      <div key={storeName} className="store-group">
                        {/* 판매자 정보 헤더 */}
                        <div className="store-header">
                          <div className="store-info">
                            <div className="store-details">
                              <span className="store-name">{storeName}</span>
                              <span className="delivery-info">
                                <span className="delivery-icon">🚚</span>
                                무료배송
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        {/* 해당 판매자의 상품들 */}
                        {items.map((item, index) => (
                          <div key={item.kok_cart_id || index} className="cart-item-individual">
                            <div className="item-content-container">
                              <div className="item-image-container">
                                <img 
                                  src={item.kok_thumbnail || "/test1.png"} 
                                  alt={item.kok_product_name} 
                                  className="item-image" 
                                  onError={(e) => {
                                    e.target.src = "/test1.png";
                                  }}
                                />
                              </div>
                              <div className="item-details">
                                <h5 className="item-name">{item.kok_product_name}</h5>
                                
                                {/* 옵션 정보 (수량) */}
                                <div className="item-option">
                                  옵션: 수량 {item.kok_quantity}개
                                </div>
                                
                                {/* 가격 및 수량 */}
                                <div className="item-price-quantity">
                                  <span className="item-price">₩{item.kok_discounted_price?.toLocaleString() || '0'}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ));
                  })()}
                </div>
              ) : (
                /* 단일 상품인 경우 기존 방식으로 표시 */
                <div className="order-item">
                  <img 
                    src={orderInfo.productImage || "/test1.png"} 
                    alt="상품" 
                    className="product-image" 
                    onError={(e) => {
                      e.target.src = "/test1.png";
                    }}
                  />
                  <div className="product-info">
                    <h3>{orderInfo.productName}</h3>
                    <p>수량: {orderInfo.quantity}개</p>
                    <p className="price">₩{orderInfo.price.toLocaleString()}</p>
                  </div>
                </div>
              )}
            </div>
          )}
          <div className="total">
            <span>총 결제금액:</span>
            <span className="total-price">
              ₩{orderInfo?.totalAmount?.toLocaleString() || '0'}
            </span>
          </div>
        </div>

        <div className="payment-methods">
          <h2>결제 방법</h2>
          <div className="method-options">
            <label className="method-option">
              <input
                type="radio"
                name="paymentMethod"
                value="card"
                checked={paymentMethod === 'card'}
                onChange={(e) => setPaymentMethod(e.target.value)}
                disabled={isProcessing}
              />
              <span>신용카드</span>
            </label>
            <label className="method-option">
              <input
                type="radio"
                name="paymentMethod"
                value="bank"
                checked={paymentMethod === 'bank'}
                onChange={(e) => setPaymentMethod(e.target.value)}
                disabled={isProcessing}
              />
              <span>계좌이체</span>
            </label>
          </div>
        </div>

        {paymentMethod === 'card' && (
          <div className="card-form">
            <h2>카드 정보</h2>
            <div className="form-group">
              <label>카드 번호</label>
              <input
                type="text"
                value={cardNumber}
                onChange={handleCardNumberChange}
                placeholder="1234 5678 9012 3456"
                maxLength="19"
                disabled={isProcessing}
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>만료일</label>
                <input
                  type="text"
                  value={expiryDate}
                  onChange={handleExpiryDateChange}
                  placeholder="MM/YY"
                  maxLength="5"
                  disabled={isProcessing}
                />
              </div>
              <div className="form-group">
                <label>CVV</label>
                <input
                  type="text"
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value)}
                  placeholder="123"
                  maxLength="3"
                  disabled={isProcessing}
                />
              </div>
            </div>
            <div className="form-group">
              <label>카드 소유자명</label>
              <input
                type="text"
                value={cardHolderName}
                onChange={(e) => setCardHolderName(e.target.value)}
                placeholder="홍길동"
                disabled={isProcessing}
              />
            </div>
          </div>
        )}

        {/* 에러 메시지 표시 */}
        {errorMessage && (
          <div className="error-message">
            <p>{errorMessage}</p>
          </div>
        )}

        {/* 결제 상태 표시 */}
        {paymentStatus === 'processing' && (
          <div className="payment-status processing">
            <p>결제 처리 중입니다. 잠시만 기다려주세요...</p>
          </div>
        )}

        {paymentStatus === 'completed' && (
          <div className="payment-status completed">
            <p>결제가 성공적으로 완료되었습니다!</p>
          </div>
        )}

        {paymentStatus === 'failed' && (
          <div className="payment-status failed">
            <p>결제 처리에 실패했습니다.</p>
          </div>
        )}

        {/* 결제하기 버튼은 BottomNav에서 처리하므로 여기서는 제거 */}
      </div>
      
      <BottomNav handlePayment={handlePayment} />
    </div>
  );
};

export default KokPayment;
