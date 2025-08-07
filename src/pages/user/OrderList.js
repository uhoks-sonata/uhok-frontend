// React와 필요한 훅들을 가져옵니다
import React, { useState, useEffect } from 'react';
// 상단 네비게이션 컴포넌트를 가져옵니다
import { OrderHistoryHeader } from '../../layout/HeaderNav';
// 하단 네비게이션 컴포넌트를 가져옵니다
import BottomNav from '../../layout/BottomNav';
// 주문 내역 스타일을 가져옵니다
import '../../styles/orderlist.css';
// 상품 없음 이미지를 가져옵니다
import noItemsIcon from '../../assets/no_items.png';

// 테스트용 상품 이미지들을 가져옵니다
import testImage1 from '../../assets/test/test1.png';
import testImage2 from '../../assets/test/test2.png';
import testImage3 from '../../assets/test/test3.png';

// 주문 내역 페이지 메인 컴포넌트를 정의합니다
const OrderList = () => {
  // 주문 내역 데이터를 저장할 상태를 초기화합니다 (API에서 받아옴)
  const [orderData, setOrderData] = useState({
    orders: [] // 주문 목록 (API에서 받아옴)
  });

  // 데이터 로딩 상태를 관리합니다 (true: 로딩 중, false: 로딩 완료)
  const [loading, setLoading] = useState(true);
  // 에러 상태를 관리합니다 (null: 에러 없음, string: 에러 메시지)
  const [error, setError] = useState(null);

  // 가격을 원화 형식으로 포맷팅하는 함수를 정의합니다
  const formatPrice = (price) => {
    return price.toLocaleString('ko-KR') + '원';
  };

  // 주문 상태를 한글로 변환하는 함수를 정의합니다
  const getOrderStatusText = (status) => {
    const statusMap = {
      'pending': '주문 대기',
      'confirmed': '주문 확인',
      'shipping': '배송 중',
      'delivered': '배송 완료',
      'cancelled': '주문 취소'
    };
    return statusMap[status] || status;
  };

  // 주문 상태에 따른 CSS 클래스를 반환하는 함수를 정의합니다
  const getOrderStatusClass = (status) => {
    const statusClassMap = {
      'pending': 'status-pending',
      'confirmed': 'status-confirmed',
      'shipping': 'status-shipping',
      'delivered': 'status-delivered',
      'cancelled': 'status-cancelled'
    };
    return statusClassMap[status] || 'status-default';
  };

  // 날짜를 YYYY-MM-DD 형식으로 포맷팅하는 함수를 정의합니다
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  // 백엔드 API에서 주문 내역 데이터를 가져오는 useEffect를 정의합니다
  useEffect(() => {
    // 비동기 함수로 주문 내역 데이터를 가져옵니다
    const fetchOrderData = async () => {
      try {
        // 로딩 상태를 true로 설정합니다
        setLoading(true);
        
        // 주문 내역 목록 조회 (페이지네이션 적용) - 비동기 처리
        const ordersResponse = await fetch('http://localhost:8000/api/orders?page=1&size=20', {
          method: 'GET',
          headers: {
            'Authorization': 'Bearer <access_token>', // 실제 토큰으로 교체 필요
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });
        
        // 응답이 성공적이지 않으면 에러를 발생시킵니다
        if (!ordersResponse.ok) {
          const errorData = await ordersResponse.json().catch(() => ({}));
          throw new Error(errorData.detail || '주문 내역을 가져오는데 실패했습니다.');
        }
        
        // 응답 데이터를 JSON 형태로 파싱합니다 (비동기)
        const ordersData = await ordersResponse.json();
        
        // API 응답을 프론트엔드 형식으로 변환합니다 (비동기 처리)
        const transformedOrders = await Promise.all(
          ordersData.orders.map(async (order) => {
            try {
              // kok_order가 있는 경우
              if (order.kok_order) {
                // 상품 정보를 비동기로 가져오는 로직 (향후 구현)
                const productInfo = await fetchProductInfo(order.kok_order.kok_product_id);
                
                return {
                  order_id: order.order_id,
                  order_date: new Date(order.order_time).toISOString().split('T')[0],
                  status: order.cancel_time ? 'cancelled' : 'delivered', // 실제로는 API에서 status 필드가 있어야 함
                  total_amount: order.kok_order.order_price,
                  items: [
                    {
                      product_id: order.kok_order.kok_product_id,
                      product_name: productInfo?.name || `상품 ${order.kok_order.kok_product_id}`,
                      product_image: productInfo?.image || testImage1,
                      quantity: order.kok_order.quantity,
                      price: order.kok_order.order_price
                    }
                  ]
                };
              }
              // homeshopping_order가 있는 경우 (향후 확장)
              else if (order.homeshopping_order) {
                return {
                  order_id: order.order_id,
                  order_date: new Date(order.order_time).toISOString().split('T')[0],
                  status: order.cancel_time ? 'cancelled' : 'delivered',
                  total_amount: 0, // homeshopping_order의 가격 정보 필요
                  items: []
                };
              }
              return null;
            } catch (productError) {
              console.error('상품 정보 가져오기 실패:', productError);
              // 상품 정보 가져오기 실패 시 기본 정보로 처리
              if (order.kok_order) {
                return {
                  order_id: order.order_id,
                  order_date: new Date(order.order_time).toISOString().split('T')[0],
                  status: order.cancel_time ? 'cancelled' : 'delivered',
                  total_amount: order.kok_order.order_price,
                  items: [
                    {
                      product_id: order.kok_order.kok_product_id,
                      product_name: `상품 ${order.kok_order.kok_product_id}`,
                      product_image: testImage1,
                      quantity: order.kok_order.quantity,
                      price: order.kok_order.order_price
                    }
                  ]
                };
              }
              return null;
            }
          })
        );
        
        // null 값 필터링
        const validOrders = transformedOrders.filter(order => order !== null);
        
        // 파싱된 데이터를 상태에 저장합니다
        setOrderData({
          orders: validOrders
        });
        
        // 로딩 상태를 false로 설정합니다
        setLoading(false);
        
      } catch (error) {
        // 에러 발생 시 에러 상태를 설정하고 로딩 상태를 false로 설정합니다
        console.error('주문 내역 데이터 가져오기 실패:', error);
        setError(error.message);
        setLoading(false);
        
        // 테스트용 더미 데이터를 설정합니다 (API 연결 실패 시)
        setOrderData({
          orders: [
            {
              order_id: '20230621',
              order_date: '2025-06-21',
              status: 'delivered',
              total_amount: 23800,
              items: [
                {
                  product_id: 123,
                  product_name: '신선한 채소 세트',
                  product_image: testImage1,
                  quantity: 2,
                  price: 11900
                }
              ]
            },
            {
              order_id: '20230620',
              order_date: '2025-06-20',
              status: 'shipping',
              total_amount: 32000,
              items: [
                {
                  product_id: 124,
                  product_name: '유기농 과일 박스',
                  product_image: testImage2,
                  quantity: 1,
                  price: 32000
                }
              ]
            },
            {
              order_id: '20230619',
              order_date: '2025-06-19',
              status: 'confirmed',
              total_amount: 28000,
              items: [
                {
                  product_id: 125,
                  product_name: '신선한 고기 세트',
                  product_image: testImage3,
                  quantity: 1,
                  price: 28000
                }
              ]
            }
          ]
        });
      }
    };

    // 주문 내역 데이터를 가져오는 함수를 실행합니다
    fetchOrderData();
  }, []); // 컴포넌트가 마운트될 때만 실행

  // 상품 정보를 비동기로 가져오는 함수 (향후 구현)
  const fetchProductInfo = async (productId) => {
    try {
      const response = await fetch(`http://localhost:8000/api/products/${productId}`, {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer <access_token>',
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      if (response.ok) {
        return await response.json();
      }
      return null;
    } catch (error) {
      console.error('상품 정보 가져오기 실패:', error);
      return null;
    }
  };

  // 뒤로가기 핸들러를 정의합니다
  const handleBack = () => {
    window.history.back();
  };

  // 알림 클릭 핸들러를 정의합니다
  const handleNotificationClick = () => {
    console.log('알림 클릭');
    // 알림 페이지로 이동하는 기능을 구현할 예정입니다
  };

  // 장바구니 클릭 핸들러를 정의합니다
  const handleCartClick = () => {
    console.log('장바구니 클릭');
    // 장바구니 페이지로 이동하는 기능을 구현할 예정입니다
  };

  // 주문 상세 보기 핸들러를 정의합니다 (비동기)
  const handleOrderDetailClick = async (orderId) => {
    try {
      console.log('주문 상세 보기:', orderId);
      
      // 주문 상세 정보를 비동기로 가져오는 로직 (향후 구현)
      const orderDetailResponse = await fetch(`http://localhost:8000/api/orders/${orderId}/detail`, {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer <access_token>',
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      if (orderDetailResponse.ok) {
        const orderDetail = await orderDetailResponse.json();
        console.log('주문 상세 정보:', orderDetail);
        // 주문 상세 페이지로 이동하는 기능을 구현할 예정입니다
        // window.location.href = `/order-detail/${orderId}`;
      } else {
        console.error('주문 상세 정보 가져오기 실패');
      }
    } catch (error) {
      console.error('주문 상세 보기 에러:', error);
    }
  };

  // 로딩 중일 때 표시할 컴포넌트를 정의합니다
  if (loading) {
    return (
      <div className="order-list-container">
        <OrderHistoryHeader 
          onBack={handleBack}
          onNotificationClick={handleNotificationClick}
          onCartClick={handleCartClick}
        />
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>주문 내역을 불러오는 중...</p>
        </div>
        <BottomNav />
      </div>
    );
  }

  // 에러가 발생했을 때 표시할 컴포넌트를 정의합니다
  if (error) {
    return (
      <div className="order-list-container">
        <OrderHistoryHeader 
          onBack={handleBack}
          onNotificationClick={handleNotificationClick}
          onCartClick={handleCartClick}
        />
        <div className="error-container">
          <p className="error-message">주문 내역을 불러오는데 실패했습니다.</p>
          <p className="error-details">{error}</p>
        </div>
        <BottomNav />
      </div>
    );
  }

  // 주문 내역 페이지 JSX 반환
  return (
    <div className="order-list-container">
      {/* 주문내역 헤더 컴포넌트 */}
      <OrderHistoryHeader 
        onBack={handleBack}
        onNotificationClick={handleNotificationClick}
        onCartClick={handleCartClick}
      />
      
      {/* 주문 내역 메인 콘텐츠 */}
      <main className="order-list-main">
                 {/* 주문 내역 제목 */}
         <div className="order-list-header">
           <h2 className="order-list-title">주문 내역</h2>
         </div>

        {/* 주문 내역 목록 */}
        <div className="order-list-content">
          {orderData.orders.length === 0 ? (
            // 주문 내역이 없을 때 표시할 컴포넌트
            <div className="no-orders-container">
              <img src={noItemsIcon} alt="주문 내역 없음" className="no-orders-icon" />
              <p className="no-orders-text">주문 내역이 없습니다.</p>
              <p className="no-orders-subtext">첫 주문을 시작해보세요!</p>
            </div>
          ) : (
            // 주문 내역 목록을 렌더링
            <div className="orders-container">
              {orderData.orders.map((order) => (
                <div key={order.order_id} className="order-item">
                  {/* 주문 정보 헤더 */}
                  <div className="order-header">
                    <div className="order-info">
                      <h3 className="order-id">주문번호: {order.order_id}</h3>
                      <p className="order-date">{formatDate(order.order_date)}</p>
                    </div>
                    <div className={`order-status ${getOrderStatusClass(order.status)}`}>
                      {getOrderStatusText(order.status)}
                    </div>
                  </div>

                  {/* 주문 상품 목록 */}
                  <div className="order-items">
                    {order.items.map((item, index) => (
                      <div key={`${order.order_id}-${index}`} className="order-item-product">
                        <img 
                          src={item.product_image} 
                          alt={item.product_name} 
                          className="product-image" 
                        />
                        <div className="product-info">
                          <h4 className="product-name">{item.product_name}</h4>
                          <p className="product-quantity">수량: {item.quantity}개</p>
                          <p className="product-price">{formatPrice(item.price)}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* 주문 총액 및 상세 보기 버튼 */}
                  <div className="order-footer">
                    <div className="order-total">
                      <span className="total-label">총 주문 금액:</span>
                      <span className="total-amount">{formatPrice(order.total_amount)}</span>
                    </div>
                    <button 
                      className="order-detail-btn"
                      onClick={() => handleOrderDetailClick(order.order_id)}
                    >
                      상세 보기
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* 하단 네비게이션 컴포넌트 */}
      <BottomNav />
    </div>
  );
};

// 주문 내역 페이지 컴포넌트를 내보냅니다
export default OrderList;
