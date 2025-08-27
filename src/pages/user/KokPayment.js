// 콕 결제 페이지 - 결제 처리 및 결제 확인 기능 구현
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { kokApi } from '../../api/kokApi';
import { orderApi } from '../../api/orderApi';
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
      // 1. location.state에서 데이터 읽기 (우선순위 1)
      if (location.state?.fromCart) {
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
        
        setOrderInfo(orderInfoData);
        return;
      }
      
      // 2. URL 파라미터에서 데이터 읽기 (우선순위 2)
      const urlParams = new URLSearchParams(location.search);
      const dataParam = urlParams.get('data');
      
      if (dataParam) {
        try {
          const decodedData = JSON.parse(decodeURIComponent(dataParam));
          
          if (decodedData.fromCart) {
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
            
            setOrderInfo(orderInfoData);
            
            // location.state에도 저장 (UI 표시용)
            if (!location.state) {
              window.history.replaceState(decodedData, '');
            }
            
            return;
          }
        } catch (error) {
          console.error('URL 파라미터 파싱 실패:', error);
        }
      }
      
      // 3. 기존 location.state 처리 (우선순위 3)
      if (location.state?.orderInfo) {
        setOrderInfo(location.state.orderInfo);
      } else if (location.state?.productId) {
        // 상품 상세페이지에서 전달받은 제품 ID로 실제 제품 정보를 API에서 가져오기
        const productId = location.state.productId;
        
        // 상품 상세페이지에서 전달받은 할인 가격 정보가 있는지 확인
        if (location.state.fromProductDetail && location.state.discountPrice) {
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
  }, [location]);

  // 결제 처리 함수 (비동기) - 새로운 백엔드 중심 API 사용
  const handlePayment = async () => {
    if (!validatePaymentForm()) {
      return;
    }

    setIsProcessing(true);
    setPaymentStatus('processing');
    setErrorMessage('');

    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('로그인이 필요한 서비스입니다.');
      }

      // 1. 주문 생성 API 호출
      console.log('🚀 결제하기 - 주문 생성 시작');
      console.log('🔍 API 호출: POST /api/orders/kok/carts/order');
      
             let orderId;
       let updatedOrderInfo; // 변수를 상위 스코프에서 선언
       
       if (orderInfo?.fromCart && orderInfo?.cartItems) {
        // 장바구니에서 온 주문인 경우
        const selectedItems = orderInfo.cartItems.map(item => ({
          cart_id: item.kok_cart_id,
          quantity: item.kok_quantity
        }));
        
        const requestData = {
          selected_items: selectedItems
        };
        
        console.log('🔍 장바구니 주문 요청 데이터:', requestData);
        console.log('🔍 장바구니 아이템 상세:', orderInfo.cartItems);
        
        const orderResponse = await orderApi.createKokOrder(selectedItems);
        
        console.log('✅ 주문 생성 성공:', orderResponse.data);
        orderId = orderResponse.data.order_id;
        
        // 주문 정보 업데이트 (order_details에서 kok_order_id들 추출)
        const orderDetails = orderResponse.data.order_details || [];
        const kokOrderIds = orderDetails.map(detail => detail.kok_order_id);
        
        console.log('🔍 추출된 kok_order_id들:', kokOrderIds);
        
        // 상태 업데이트와 함께 로컬 변수로도 저장 (즉시 사용하기 위해)
        const updatedOrderInfo = {
          ...orderInfo,
          orderId: orderId,
          totalAmount: orderResponse.data.total_amount,
          kokOrderIds: kokOrderIds,  // 실제 kok_order_id들 저장
          orderDetails: orderDetails
        };
        
        setOrderInfo(updatedOrderInfo);
      } else {
        // 단일 상품 주문인 경우 (상품 상세에서 바로 주문)
        const orderData = {
          kok_product_id: parseInt(orderInfo?.productId || orderInfo?.kokOrderId?.split('-')[1]),
          kok_quantity: orderInfo?.quantity || 1,
          recipe_id: 0
        };
        
        console.log('🔍 단일 상품 주문 요청 데이터:', orderData);
        console.log('🔍 주문 정보 상세:', orderInfo);
        
        const orderResponse = await orderApi.createKokOrder([{
          cart_id: orderData.kok_product_id,
          quantity: orderData.kok_quantity
        }]);
        
        console.log('✅ 주문 생성 성공:', orderResponse.data);
        orderId = orderResponse.data.order_id;
        
        // 단일 상품 주문인 경우에도 order_details에서 kok_order_id 추출
        const orderDetails = orderResponse.data.order_details || [];
        const kokOrderIds = orderDetails.map(detail => detail.kok_order_id);
        
        console.log('🔍 단일 상품 주문 - 추출된 kok_order_id들:', kokOrderIds);
        
        // 상태 업데이트와 함께 로컬 변수로도 저장 (즉시 사용하기 위해)
        const updatedOrderInfo = {
          ...orderInfo,
          orderId: orderId,
          kokOrderIds: kokOrderIds,  // 실제 kok_order_id들 저장
          orderDetails: orderDetails
        };
        
        setOrderInfo(updatedOrderInfo);
      }

      if (!orderId) {
        throw new Error('주문 ID를 받지 못했습니다.');
      }

      // 2. 결제 요청 & 확인 API 호출 (폴링 방식)
      console.log('🔍 API 호출: POST /api/orders/payment/{order_id}/confirm/v1');
      console.log('🔍 사용할 orderId:', orderId);
      console.log('🔍 orderId 타입:', typeof orderId);
      
      const paymentResponse = await orderApi.confirmPayment(orderId);
      
      console.log('✅ 결제 완료 응답:', paymentResponse);

      // 3. 결제 상태 확인 - 결제가 성공한 경우에만 주문 내역에 저장
      console.log('🔍 결제 응답 상세 분석:', {
        hasResponse: !!paymentResponse,
        status: paymentResponse?.status,
        paymentId: paymentResponse?.payment_id,
        orderId: paymentResponse?.order_id
      });
      
      // paymentResponse가 존재하고 status가 COMPLETED 또는 PAYMENT_COMPLETED인 경우 성공으로 처리
      if (paymentResponse && (paymentResponse.status === 'COMPLETED' || paymentResponse.status === 'PAYMENT_COMPLETED')) {
        console.log('✅ 결제 성공 확인됨 - 주문 내역에 저장 진행');
        
        // 3-1. 상태 자동 업데이트 API 호출 (주문 내역에 반영)
        console.log('🔍 API 호출: POST /api/orders/kok/{kok_order_id}/auto-update');
        
                 try {
           // 실제 kok_order_id들을 사용하여 각각 상태 업데이트
           const kokOrderIds = updatedOrderInfo?.kokOrderIds || [];
           
           console.log('🔍 상태 업데이트에 사용할 kokOrderIds:', kokOrderIds);
           console.log('🔍 updatedOrderInfo 존재 여부:', !!updatedOrderInfo);
          
          if (kokOrderIds.length > 0) {
            // 여러 kok_order_id가 있는 경우 각각 업데이트
            for (const kokOrderId of kokOrderIds) {
              console.log(`🔍 kok_order_id ${kokOrderId} 상태 업데이트 중...`);
              const updateResponse = await orderApi.startAutoUpdate(kokOrderId);
              console.log(`✅ kok_order_id ${kokOrderId} 상태 업데이트 완료:`, updateResponse);
            }
          } else {
            console.log('⚠️ kokOrderIds가 비어있어서 상태 업데이트를 건너뜁니다.');
          }
        } catch (updateError) {
          // 상태 업데이트 API가 없어도 결제는 성공으로 처리
          console.log('⚠️ 상태 자동 업데이트 API 호출 실패 (무시됨):', updateError.response?.status);
        }

        // 4. 결제 완료 처리
        setPaymentStatus('completed');
        alert('결제가 완료되었습니다!');
        
        // 5. 주문내역 페이지로 이동 (히스토리 스택 초기화)
        console.log('🚀 결제 완료 - 주문내역 페이지로 이동');
        navigate('/orderlist', { replace: true });
      } else {
        // 결제가 실패한 경우
        console.log('❌ 결제 실패 - 주문 내역에 저장하지 않음');
        console.log('❌ 결제 실패 상세:', {
          paymentResponse: paymentResponse,
          responseType: typeof paymentResponse,
          status: paymentResponse?.status
        });
        setPaymentStatus('failed');
        setErrorMessage('결제가 실패했습니다. 다시 시도해주세요.');
        
        // 백엔드에서 결제 실패 시 주문 상태를 관리하도록 함
        console.log('⚠️ 결제 실패 - 백엔드에서 주문 상태 관리 필요');
      }

    } catch (error) {
      console.error('❌ 결제 처리 실패:', error);
      console.error('❌ 에러 응답 데이터:', error.response?.data);
      console.error('❌ 에러 상태 코드:', error.response?.status);
      setPaymentStatus('failed');
      
      // API 오류 메시지 처리
      if (error.response?.status === 401) {
        setErrorMessage('로그인이 필요한 서비스입니다.');
      } else if (error.response?.status === 422) {
        const errorDetails = error.response.data?.message || error.response.data?.error || '데이터 형식이 올바르지 않습니다.';
        setErrorMessage(`주문 생성 실패: ${errorDetails}`);
        console.error('❌ 422 에러 상세:', error.response.data);
        
        // 필드 누락 에러 상세 분석
        if (error.response.data?.detail && Array.isArray(error.response.data.detail)) {
          error.response.data.detail.forEach((err, index) => {
            console.error(`❌ 필드 에러 ${index + 1}:`, {
              type: err.type,
              location: err.loc,
              message: err.msg,
              input: err.input
            });
          });
        }
      } else if (error.response?.status === 400) {
        setErrorMessage('결제 처리에 실패했습니다: ' + (error.response.data?.message || '잘못된 요청입니다.'));
      } else if (error.response?.status === 404) {
        // 404 에러 - 결제 API 엔드포인트가 존재하지 않음
        console.log('결제 API 엔드포인트가 존재하지 않음');
        setErrorMessage('결제 서비스를 사용할 수 없습니다. 잠시 후 다시 시도해주세요.');
      } else if (error.response?.data?.message) {
        setErrorMessage(`결제 처리 실패: ${error.response.data.message}`);
      } else if (error.message) {
        setErrorMessage(`결제 처리 실패: ${error.message}`);
      } else {
        setErrorMessage('결제 처리 중 오류가 발생했습니다. 다시 시도해주세요.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // 결제 확인 처리 함수 (비동기)
  const handlePaymentConfirmation = async () => {
    try {
      let confirmationResult;

      // 장바구니에서 온 주문인 경우
      if (orderInfo?.fromCart && orderInfo?.orderId) {
        try {
          // 주문 단위 결제 확인 시도
          confirmationResult = await kokApi.confirmOrderUnitPayment(orderInfo.orderId);
          
          if (confirmationResult.success) {
            setPaymentStatus('completed');
            alert('결제가 완료되었습니다!');
            navigate('/mypage');
            return;
          }
        } catch (error) {
          console.log('주문 단위 결제 확인 실패, 단건 결제 확인 시도...');
        }
      }

      // 단건 결제 확인 시도
      if (orderInfo?.kokOrderId) {
        try {
          confirmationResult = await kokApi.confirmKokPayment(orderInfo.kokOrderId);
          
          if (confirmationResult.success) {
            setPaymentStatus('completed');
            alert('결제가 완료되었습니다!');
            navigate('/mypage');
            return;
          }
        } catch (error) {
          console.log('단건 결제 확인 실패:', error);
        }
      }

      // 결제 확인 성공 처리
      if (confirmationResult?.success) {
        setPaymentStatus('completed');
        alert('결제가 완료되었습니다!');
        navigate('/mypage');
        return;
      }

      // 결제 확인 실패
      setPaymentStatus('failed');
      setErrorMessage(confirmationResult?.message || '결제 확인에 실패했습니다.');

    } catch (error) {
      console.error('결제 확인 처리 실패:', error);
      setPaymentStatus('failed');
      setErrorMessage('결제 확인 처리 중 오류가 발생했습니다.');
    }
  };

  // 결제 폼 유효성 검사
  const validatePaymentForm = () => {
    if (paymentMethod === 'card') {
      if (!cardNumber.trim()) {
        alert('카드 번호를 입력해주세요.');
        return false;
      }
      if (!expiryDate.trim()) {
        alert('만료일을 입력해주세요.');
        return false;
      }
      if (!cvv.trim()) {
        alert('CVV를 입력해주세요.');
        return false;
      }
      if (!cardHolderName.trim()) {
        alert('카드 소유자명을 입력해주세요.');
        return false;
      }
    }
    
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
                                <span className="delivery-icon">
                                  <img src={require('../../assets/delivery_icon.png')} alt="배송" />
                                </span>
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
