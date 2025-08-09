// React와 필요한 훅들을 가져옵니다
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// 상단 네비게이션 컴포넌트를 가져옵니다
import { OrderHistoryHeader } from '../../layout/HeaderNav';
// 하단 네비게이션 컴포넌트를 가져옵니다
import BottomNav from '../../layout/BottomNav';
// 로딩 컴포넌트를 가져옵니다
import Loading from '../../components/Loading';
// 주문 내역 스타일을 가져옵니다
import '../../styles/orderlist.css';
// 상품 없음 이미지를 가져옵니다
import noItemsIcon from '../../assets/no_items.png';

// API 설정을 가져옵니다
import api from '../api';

// 테스트용 상품 이미지들을 가져옵니다
import testImage1 from '../../assets/test/test1.png';
import testImage2 from '../../assets/test/test2.png';
import testImage3 from '../../assets/test/test3.png';

// 주문 내역 페이지 메인 컴포넌트를 정의합니다
const OrderList = () => {
  // 페이지 이동을 위한 navigate 훅
  const navigate = useNavigate();
  // 주문 내역 데이터를 저장할 상태를 초기화합니다 (API에서 받아옴)
  const [orderData, setOrderData] = useState({
    orders: [], // 주문 목록 (API에서 받아옴)
    total_count: 0, // 전체 주문 개수
    page: 1, // 현재 페이지
    size: 20 // 페이지당 주문 개수
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

  // 백엔드 API에서 주문 내역 데이터를 가져오는 useEffect를 정의합니다 (비동기 처리 개선)
  useEffect(() => {
    // 비동기 함수로 주문 내역 데이터를 가져옵니다
    const fetchOrderData = async () => {
      try {
        // 로딩 상태를 true로 설정합니다
        setLoading(true);
        setError(null); // 에러 상태 초기화
        
        // api.js를 활용하여 주문 내역 목록을 비동기로 조회합니다
        const ordersResponse = await api.get('/api/orders?page=1&size=20');
        
        // 응답 데이터를 검증하고 가져옵니다
        const ordersData = ordersResponse.data;
        if (!ordersData || !ordersData.orders) {
          throw new Error('주문 데이터를 가져올 수 없습니다.');
        }
        
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
          orders: validOrders,
          total_count: ordersData.total_count || 0,
          page: ordersData.page || 1,
          size: ordersData.size || 20
        });
        
        // 로딩 상태를 false로 설정합니다
        setLoading(false);
        
      } catch (error) {
        // 에러 발생 시 에러 상태를 설정하고 로딩 상태를 false로 설정합니다
        console.error('주문 내역 데이터 가져오기 실패:', error);
        // 네트워크 에러인 경우 더미 데이터 사용, 그 외에는 에러 메시지 표시
        if (error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED' || 
            (error.name === 'TypeError' && error.message.includes('Failed to fetch')) ||
            error.message.includes('Network Error')) {
          console.log('백엔드 서버 연결 실패 - 더미 데이터를 사용합니다.');
          setError(null); // 에러 상태 초기화
        } else {
          setError(error.message);
        }
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
              order_id: '20230621',
              order_date: '2025-06-21',
              status: 'delivered',
              total_amount: 23800,
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
              order_id: '20230620',
              order_date: '2025-06-20',
              status: 'shipping',
              total_amount: 32000,
              items: [
                {
                  product_id: 125,
                  product_name: '신선한 고기 세트',
                  product_image: testImage3,
                  quantity: 1,
                  price: 28000
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
                  product_id: 126,
                  product_name: '신선한 생선 세트',
                  product_image: testImage1,
                  quantity: 1,
                  price: 28000
                }
              ]
            }
          ],
          total_count: 4,
          page: 1,
          size: 20
        });
      }
    };

    // 주문 내역 데이터를 가져오는 함수를 실행합니다
    fetchOrderData();
  }, []); // 컴포넌트가 마운트될 때만 실행

  // 상품 정보를 비동기로 가져오는 함수 (비동기 처리 개선)
  const fetchProductInfo = async (productId) => {
    try {
      // api.js를 활용하여 상품 정보를 비동기로 가져옵니다
      const response = await api.get(`/api/products/${productId}`);
      return response.data;
    } catch (error) {
      console.error('상품 정보 가져오기 실패:', error);
      // 네트워크 에러인 경우 조용히 처리 (더미 데이터 사용)
      if (error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED' || 
          (error.name === 'TypeError' && error.message.includes('Failed to fetch')) ||
          error.message.includes('Network Error')) {
        console.log('상품 정보 API 연결 실패 - 기본 정보 사용');
      } else {
        console.error('상품 정보 가져오기 실패:', error);
      }
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
    navigate('/notifications');
  };

  // 장바구니 클릭 핸들러를 정의합니다
  const handleCartClick = () => {
    console.log('장바구니 클릭');
    // 장바구니 페이지로 이동하는 기능을 구현할 예정입니다
  };

  // 주문 상세 보기 핸들러를 정의합니다 (비동기 처리 개선)
  const handleOrderDetailClick = async (orderId) => {
    try {
      console.log('주문 상세 보기:', orderId);
      
      // api.js를 활용하여 주문 상세 정보를 비동기로 가져옵니다
      const orderDetailResponse = await api.get(`/api/orders/${orderId}/detail`);
      
      const orderDetail = orderDetailResponse.data;
      console.log('주문 상세 정보:', orderDetail);
      // 주문 상세 페이지로 이동하는 기능을 구현할 예정입니다
      // window.location.href = `/order-detail/${orderId}`;
    } catch (error) {
      // 네트워크 에러인 경우 조용히 처리
      if (error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED' || 
          (error.name === 'TypeError' && error.message.includes('Failed to fetch')) ||
          error.message.includes('Network Error')) {
        console.log('주문 상세 API 연결 실패 - 기능 미구현');
      } else {
        console.error('주문 상세 보기 에러:', error);
      }
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
        <Loading message="주문 내역을 불러오는 중 ..." />
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
            // 주문번호별로 그룹화하여 렌더링합니다
            (() => {
              // 주문번호별로 상품들을 그룹화합니다
              const groupedOrders = orderData.orders.reduce((groups, order) => {
                if (!groups[order.order_id]) {
                  groups[order.order_id] = [];
                }
                groups[order.order_id].push(order);
                return groups;
              }, {});
              
              // 각 그룹 내에서 상품들을 정렬하고, 전체 그룹을 날짜순으로 정렬합니다
              const sortedOrders = Object.entries(groupedOrders)
                .map(([orderId, orders]) => {
                  // 각 주문 그룹 내에서 상품들을 정렬 (최근 구매 순)
                  const sortedItems = orders.sort((a, b) => {
                    // 주문 시간이 있다면 그것을 기준으로, 없다면 상품 ID로 정렬
                    if (a.order_time && b.order_time) {
                      return new Date(b.order_time) - new Date(a.order_time);
                    }
                    return b.items[0].product_id - a.items[0].product_id;
                  });
                  
                  return [orderId, sortedItems];
                })
                .sort((a, b) => {
                  // 전체 주문 그룹을 날짜순으로 정렬 (최근 날짜순)
                  const dateA = new Date(a[1][0].order_date);
                  const dateB = new Date(b[1][0].order_date);
                  
                  // 날짜가 같다면 주문번호로 정렬 (최근 주문번호가 먼저)
                  if (dateA.getTime() === dateB.getTime()) {
                    return b[0] - a[0];
                  }
                  
                  return dateB - dateA; // 최근 날짜가 먼저 오도록 내림차순 정렬
                });
              
              // 정렬된 주문들을 렌더링합니다
              return sortedOrders.map(([orderId, orders]) => {
                const firstOrder = orders[0]; // 첫 번째 상품의 정보를 사용
                
                return (
                  <div key={orderId} className="order-item">
                    {/* 주문 정보 헤더 - 회색 박스 밖에 위치 */}
                    <div className="order-header">
                      <div className="order-info">
                        <p className="order-date">{formatDate(firstOrder.order_date)}</p>
                      </div>
                      <div className="order-number">
                        주문번호 {orderId}
                      </div>
                    </div>

                    {/* 회색 박스 컨테이너 */}
                    <div className="order-content-box">
                      {/* 배송 상태 - 회색 박스 상단 왼쪽 */}
                      <div className="delivery-status">
                        <span className="delivery-status-text">배송완료</span>
                        <span className="delivery-date">{formatDate(firstOrder.order_date)} 도착</span>
                      </div>
                      
                      {/* 상품 정보들 - 같은 주문번호의 모든 상품을 표시합니다 */}
                      {orders.map((order, index) => (
                        <div key={`${orderId}-${index}`} className="product-info">
                          {/* 상품 이미지를 표시합니다 */}
                          <div className="product-image">
                            <img src={order.items[0].product_image} alt={order.items[0].product_name} />
                          </div>
                          
                          {/* 상품 상세 정보 */}
                          <div className="product-details">
                            {/* 상품명을 표시합니다 */}
                            <div className="product-name" title={order.items[0].product_name}>
                              {order.items[0].product_name.length > 20 
                                ? `${order.items[0].product_name.substring(0, 20)}...`
                                : order.items[0].product_name
                              }
                            </div>
                            {/* 상품 설명을 표시합니다 */}
                            <div className="product-description" title="상품 설명">
                              {"동해물과백두산이마르고닳도록하느님이보우하사우리나라만세무궁화삼천리".length > 20 
                                ? "동해물과백두산이마르고닳도록하느님이보우하사우리나라만세무궁화삼천리".substring(0, 20) + "..."
                                : "동해물과백두산이마르고닳도록하느님이보우하사우리나라만세무궁화삼천리"
                              }
                            </div>
                            {/* 가격과 수량을 표시합니다 */}
                            <div className="product-price">{formatPrice(order.items[0].price)} · {order.items[0].quantity}개</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              });
            })()
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
