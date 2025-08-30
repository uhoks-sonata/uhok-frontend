// React와 필요한 훅들을 가져옵니다
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// 상단 네비게이션 컴포넌트를 가져옵니다
import HeaderNavOrder from '../../layout/HeaderNavOrder';
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
// orderApi import
import { orderApi } from '../../api/orderApi';
// 사용자 Context import
import { useUser } from '../../contexts/UserContext';

// 테스트용 상품 이미지들을 가져옵니다
import testImage1 from '../../assets/test/test1.png';
import testImage2 from '../../assets/test/test2.png';
import testImage3 from '../../assets/test/test3.png';

// 주문 내역 페이지 메인 컴포넌트를 정의합니다
const OrderList = () => {
  // 페이지 이동을 위한 navigate 훅
  const navigate = useNavigate();
  // 사용자 정보 가져오기
  const { user, isLoggedIn } = useUser();
  
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

  // 로그인 상태 확인 함수
  const checkLoginStatus = () => {
    const token = localStorage.getItem('access_token');
    return !!token;
  };

  // 주문 내역 데이터를 가져오는 함수
  const loadOrderData = async () => {
    // 로그인하지 않은 경우 알림 후 이전 화면으로 돌아가기
    if (!checkLoginStatus()) {
      alert('로그인이 필요한 서비스입니다.');
      window.history.back();
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // 토큰 확인 (장바구니와 동일한 방식)
      const token = localStorage.getItem('access_token');
      console.log('🔍 OrderList.js - 토큰 체크:', { hasToken: !!token, token: token ? token.substring(0, 20) + '...' : '없음' });
      if (!token) {
        console.log('❌ OrderList.js - 토큰 없음, 제자리에 유지');
        alert('로그인이 필요한 서비스입니다.');
        setLoading(false);
        return;
      }
      
      // orderApi를 활용하여 주문 내역 목록을 비동기로 조회합니다
      let ordersResponse;
      let ordersData;
      
      try {
        // 최근 7일 주문내역 조회 (오늘부터 7일 전까지)
        ordersResponse = await orderApi.getRecentOrders(7);
        ordersData = ordersResponse;
        console.log('최근 7일 주문 내역 API 응답:', ordersData);
      } catch (error) {
        console.error('주문 내역 API 호출 실패:', error);
        
        // 401 에러인 경우 더미 데이터 사용 (임시 해결책)
        if (error.response?.status === 401) {
          console.log('401 에러 발생 - 토큰이 유효하지 않습니다. 더미 데이터를 사용합니다.');
        }
        
        // API 실패 시 더미 데이터 사용 (최근 7일 주문내역 API 구조에 맞춤)
        ordersData = {
          days: 7,
          order_count: 2,
          orders: [
            {
              order_id: 151,
              order_number: "000000000151",
              order_date: "2025. 8. 19",
              delivery_status: "배송완료",
              delivery_date: "7/28(월) 도착",
              total_amount: 6900,
              order_details: [
                {
                  kok_order_id: 119,
                  kok_product_id: 10045061,
                  kok_product_name: "[강원뜰] 강원도 산지직송 알감자/설봉감자 1.5kg ~ 20kg 모음전",
                  quantity: 1,
                  unit_price: 6900,
                  total_price: 6900
                }
              ],
              product_image: testImage1,
              recipe_related: false,
              recipe_title: null,
              recipe_rating: null,
              recipe_scrap_count: null,
              recipe_description: null,
              ingredients_owned: null,
              total_ingredients: null
            },
            {
              order_id: 152,
              order_number: "000000000152",
              order_date: "2025. 8. 13",
              delivery_status: "배송완료",
              delivery_date: "7/28(월) 도착",
              total_amount: 8500,
              order_details: [
                {
                  kok_order_id: 120,
                  kok_product_id: 10045062,
                  kok_product_name: "초코파이 12개입",
                  quantity: 1,
                  unit_price: 8500,
                  total_price: 8500
                }
              ],
              product_image: testImage2,
              recipe_related: false,
              recipe_title: null,
              recipe_rating: null,
              recipe_scrap_count: null,
              recipe_description: null,
              ingredients_owned: null,
              total_ingredients: null
            }
          ]
        };
      }
      
      // 최근 7일 주문내역 API 응답 구조 확인
      if (!ordersData || !ordersData.orders || !Array.isArray(ordersData.orders) || ordersData.orders.length === 0) {
        // 주문이 없는 경우 빈 배열로 설정
        setOrderData({
          orders: [],
          total_count: 0,
          page: 1,
          size: 20
        });
        setLoading(false);
        return;
      }
      
      // 최근 7일 주문내역 API 응답 구조를 프론트엔드 형식으로 변환
      const transformedOrders = ordersData.orders.map((order) => {
        // order_details가 있는 경우 (장바구니 주문)와 없는 경우 (단일 상품 주문) 구분
        if (order.order_details && Array.isArray(order.order_details)) {
          // 장바구니 주문: order_details의 각 항목을 개별 주문으로 변환
          return order.order_details.map((detail) => {
            return {
              order_id: order.order_id,
              kok_order_id: detail.kok_order_id, // kok_order_id 추가
              order_number: order.order_number,
              order_date: order.order_date,
              status: 'delivered',
              total_amount: detail.total_price,
              items: [{
                product_id: detail.kok_product_id,
                kok_order_id: detail.kok_order_id, // kok_order_id 추가
                product_name: detail.kok_product_name || '상품명 없음',
                product_image: order.product_image || testImage1,
                quantity: detail.quantity,
                price: detail.unit_price,
                delivery_status: order.delivery_status,
                delivery_date: order.delivery_date,
                recipe_related: order.recipe_related,
                recipe_title: order.recipe_title,
                recipe_rating: order.recipe_rating,
                recipe_scrap_count: order.recipe_scrap_count,
                recipe_description: order.recipe_description,
                ingredients_owned: order.ingredients_owned,
                total_ingredients: order.total_ingredients
              }]
            };
          });
        } else {
          // 단일 상품 주문: 기존 방식 유지
          return {
            order_id: order.order_id,
            order_number: order.order_number,
            order_date: order.order_date,
            status: 'delivered',
            total_amount: order.price * order.quantity,
            items: [{
              product_id: null,
              product_name: order.product_name || '상품명 없음',
              product_image: order.product_image || testImage1,
              quantity: order.quantity,
              price: order.price,
              delivery_status: order.delivery_status,
              delivery_date: order.delivery_date,
              recipe_related: order.recipe_related,
              recipe_title: order.recipe_title,
              recipe_rating: order.recipe_rating,
              recipe_scrap_count: order.recipe_scrap_count,
              recipe_description: order.recipe_description,
              ingredients_owned: order.ingredients_owned,
              total_ingredients: order.total_ingredients
            }]
          };
        }
      }).flat(); // 중첩된 배열을 평탄화
      
      // 파싱된 데이터를 상태에 저장합니다
      setOrderData({
        orders: transformedOrders,
        total_count: ordersData.order_count || 0,
        page: 1,
        size: 20
      });
      
      // 로딩 상태를 false로 설정합니다
      setLoading(false);
      
    } catch (error) {
      // 에러 발생 시 에러 상태를 설정하고 로딩 상태를 false로 설정합니다
      console.error('주문 내역 데이터 가져오기 실패:', error);
      
      // 401 에러 특별 처리 (인증 필요)
      if (error.response?.status === 401) {
        console.log('401 에러 발생 - 로그인이 필요합니다.');
        alert('로그인이 필요한 서비스입니다.');
        return;
      }
      // 422 에러 특별 처리
      else if (error.response?.status === 422) {
        console.log('422 에러 발생 - API 엔드포인트나 파라미터 문제일 수 있습니다.');
        console.log('더미 데이터를 사용합니다.');
        setError(null); // 에러 상태 초기화
      }
      // 네트워크 에러인 경우 더미 데이터 사용, 그 외에는 에러 메시지 표시
      else if (error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED' || 
          (error.name === 'TypeError' && error.message.includes('Failed to fetch')) ||
          error.message.includes('Network Error')) {
        console.log('백엔드 서버 연결 실패 - 더미 데이터를 사용합니다.');
        setError(null); // 에러 상태 초기화
      } else {
        setError(error.message);
      }
      setLoading(false);
      
      // API 연결 실패 시 더미 데이터 사용 (네트워크 오류 등)
      console.log('API 연결 실패 - 더미 데이터를 사용합니다.');
      setOrderData({
        orders: [
          {
            order_id: 54,
            kok_order_id: 119, // kok_order_id 추가
            order_number: "000000000054",
            order_date: "2025. 8. 19",
            status: 'delivered',
            total_amount: 23800,
            items: [
              {
                product_id: 10045061,
                kok_order_id: 119, // kok_order_id 추가
                product_name: '신선한 채소 세트',
                product_image: testImage1,
                quantity: 2,
                price: 11900,
                delivery_status: "배송완료",
                delivery_date: "7/28(월) 도착",
                recipe_related: false,
                recipe_title: null,
                recipe_rating: null,
                recipe_scrap_count: null,
                recipe_description: null,
                ingredients_owned: null,
                total_ingredients: null
              }
            ]
          },
          {
            order_id: 25,
            kok_order_id: 120, // kok_order_id 추가
            order_number: "000000000025",
            order_date: "2025. 8. 13",
            status: 'delivered',
            total_amount: 32000,
            items: [
              {
                product_id: 10045062,
                kok_order_id: 120, // kok_order_id 추가
                product_name: '유기농 과일 박스',
                product_image: testImage2,
                quantity: 1,
                price: 32000,
                delivery_status: "배송완료",
                delivery_date: "7/28(월) 도착",
                recipe_related: false,
                recipe_title: null,
                recipe_rating: null,
                recipe_scrap_count: null,
                recipe_description: null,
                ingredients_owned: null,
                total_ingredients: null
              }
            ]
          }
        ],
        total_count: 2,
        page: 1,
        size: 20
      });
    }
  };

  // useEffect 추가
  useEffect(() => {
    // 로그인 상태 확인 후 조건부로 API 호출
    const loginStatus = checkLoginStatus();
    if (loginStatus) {
      loadOrderData();
    } else {
      // 로그인하지 않은 경우 로딩 상태만 해제
      console.log('로그인하지 않은 상태: 주문 내역 API 호출 건너뜀');
      setLoading(false);
    }
  }, []);

  // 뒤로가기 핸들러를 정의합니다
  const handleBack = () => {
    window.history.back();
  };

  // 주문 상세 보기 핸들러를 정의합니다 (kok_order_id 사용)
  const handleOrderDetailClick = async (orderId, kokOrderId = null) => {
    try {
      console.log('주문 상세 보기:', { orderId, kokOrderId });
      
      // kok_order_id가 있는 경우 해당 ID로 상세 조회, 없으면 order_id 사용
      const targetId = kokOrderId || orderId;
      console.log('사용할 ID:', targetId);
      
      // orderApi를 활용하여 주문 상세 정보를 비동기로 가져옵니다
      const orderDetail = await orderApi.getOrderDetail(targetId);
      console.log('주문 상세 정보:', orderDetail);
      // 주문 상세 페이지로 이동하는 기능을 구현할 예정입니다
      // window.location.href = `/order-detail/${targetId}`;
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
        {/* 주문 내역 헤더 네비게이션 */}
        <HeaderNavOrder 
          onBackClick={handleBack}
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
        {/* 주문 내역 헤더 네비게이션 */}
        <HeaderNavOrder 
          onBackClick={handleBack}
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
      {/* 주문 내역 헤더 네비게이션 */}
      <HeaderNavOrder 
        onBackClick={handleBack}
      />
      
      {/* 주문 내역 메인 콘텐츠 */}
      <main className="order-list-main">
        {/* 주문 내역 목록 */}
        <div className="order-list-content">
          {orderData.orders.length === 0 ? (
            // 주문 내역이 없을 때 표시할 컴포넌트
            <div className="no-orders-container">
              <img src={noItemsIcon} alt="주문한 상품 없음" className="no-orders-icon" />
              <p className="no-orders-text">주문한 상품이 없습니다.</p>
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
                        주문번호 {firstOrder.order_number || orderId}
                      </div>
                    </div>

                    {/* 회색 박스 컨테이너 */}
                    <div className="order-content-box">
                      {/* 배송 상태 - 회색 박스 상단 왼쪽 */}
                      <div className="delivery-status">
                        <span className="delivery-status-text">{firstOrder.items[0].delivery_status || '배송완료'}</span>
                        <span className="delivery-date">{firstOrder.items[0].delivery_date || `${formatDate(firstOrder.order_date)} 도착`}</span>
                      </div>
                      
                      {/* 상품 정보들 - 같은 주문번호의 모든 상품을 표시합니다 */}
                      {orders.map((order, index) => (
                        <div 
                          key={`${orderId}-${index}`} 
                          className="product-info"
                          onClick={() => handleOrderDetailClick(order.order_id, order.kok_order_id)}
                          style={{ cursor: 'pointer' }}
                        >
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
                            {/* kok_order_id 표시 (개발용) */}
                            {order.kok_order_id && (
                              <div className="kok-order-id" style={{ fontSize: '12px', color: '#999' }}>
                                KOK ID: {order.kok_order_id}
                              </div>
                            )}
                            {/* 레시피 관련 정보 표시 */}
                            {order.items[0].recipe_related && order.items[0].recipe_title && (
                              <div className="recipe-info">
                                <span className="recipe-title">{order.items[0].recipe_title}</span>
                                {order.items[0].recipe_rating && (
                                  <span className="recipe-rating">★ {order.items[0].recipe_rating}</span>
                                )}
                                {order.items[0].recipe_scrap_count && (
                                  <span className="recipe-scrap">♥ {order.items[0].recipe_scrap_count}</span>
                                )}
                              </div>
                            )}
                            {/* 재료 정보 표시 */}
                            {order.items[0].ingredients_owned !== null && order.items[0].total_ingredients !== null && (
                              <div className="ingredients-info">
                                <span className="ingredients-count">
                                  재료 {order.items[0].ingredients_owned}/{order.items[0].total_ingredients}
                                </span>
                              </div>
                            )}
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
