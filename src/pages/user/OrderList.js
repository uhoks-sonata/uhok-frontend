// React와 필요한 훅들을 가져옵니다
import React, { useState, useEffect, useCallback } from 'react';
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
// LoadingModal import
import ModalManager, { 
  showLoginRequiredNotification, 
  showSessionExpiredNotification,
  showAuthExpiredNotification,
  hideModal 
} from '../../components/LoadingModal';

// API 설정을 가져옵니다
import api from '../api';
// orderApi import
import { orderApi } from '../../api/orderApi';
// 사용자 Context import
import { useUser } from '../../contexts/UserContext';


// 주문 내역 페이지 메인 컴포넌트를 정의합니다
const OrderList = () => {
  // 페이지 이동을 위한 navigate 훅
  const navigate = useNavigate();
  // 사용자 정보 가져오기
  const { user, isLoggedIn, refreshToken, logout } = useUser();
  
  // ===== 모달 상태 관리 =====
  const [modalState, setModalState] = useState({ 
    isVisible: false,
    modalType: null,
    alertMessage: '',
    alertButtonText: '확인',
    alertButtonStyle: 'primary'
  });

  // ===== 모달 핸들러 =====
  const handleModalClose = () => {
    setModalState(hideModal());
    
    // 인증 관련 모달인 경우 로그인 페이지로 이동
    if (modalState.modalType === 'alert' && 
        (modalState.alertMessage?.includes('세션이 만료되었습니다') || 
         modalState.alertMessage?.includes('인증이 만료되었습니다'))) {
      logout(); // UserContext 상태 정리
      navigate('/login'); // 로그인 페이지로 이동
    } else {
      // 일반 모달인 경우 이전 페이지로 돌아가기
      window.history.back();
    }
  };
  
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
    console.log('checkLoginStatus 실행 - isLoggedIn:', isLoggedIn);
    
    // UserContext의 isLoggedIn 상태를 우선적으로 사용
    if (isLoggedIn) {
      console.log('UserContext isLoggedIn이 true - 로그인 상태로 확인');
      return true;
    }
    
    // fallback: localStorage의 토큰 확인
    const token = localStorage.getItem('access_token');
    const hasToken = !!token;
    console.log('localStorage 토큰 확인:', { hasToken, tokenLength: token?.length });
    
    return hasToken;
  };

  // 주문 내역 데이터를 가져오는 함수
  const loadOrderData = useCallback(async () => {
         // UserContext의 isLoggedIn 상태를 우선적으로 확인
     if (!isLoggedIn) {
       console.log('UserContext에서 로그인되지 않은 상태로 확인됨');
       const loginRequiredModal = showLoginRequiredNotification();
       setModalState(loginRequiredModal);
       console.log('로그인 필요 모달 상태 설정:', loginRequiredModal);
       return;
     }
     
     // 추가로 checkLoginStatus도 확인 (fallback)
     if (!checkLoginStatus()) {
       console.log('localStorage 토큰 확인에서도 로그인되지 않은 상태로 확인됨');
       const loginRequiredModal = showLoginRequiredNotification();
       setModalState(loginRequiredModal);
       console.log('로그인 필요 모달 상태 설정:', loginRequiredModal);
       return;
     }
    
    console.log('로그인 상태 확인 완료 - API 호출 진행');

    try {
      setLoading(true);
      setError(null);

      // orderApi를 활용하여 주문 내역 목록을 비동기로 조회합니다
      let ordersResponse;
      let ordersData;
      
      try {
        // 새로운 API 구조: 사용자의 모든 주문 목록 조회
        ordersResponse = await orderApi.getUserOrders(20); // limit 20으로 설정
        ordersData = ordersResponse;
        console.log('사용자 주문 목록 API 응답:', ordersData);
        console.log('🔍 OrderList.js - API 응답 상세:', {
          responseType: typeof ordersData,
          responseKeys: ordersData ? Object.keys(ordersData) : 'response is null/undefined',
          hasOrderGroups: ordersData?.order_groups ? true : false,
          orderGroupsLength: ordersData?.order_groups?.length || 0,
          totalCount: ordersData?.total_count,
          limit: ordersData?.limit
        });
      } catch (error) {
        console.error('주문 내역 API 호출 실패:', error);
        
        // 401 에러인 경우 토큰 갱신 시도
        if (error.response?.status === 401) {
          console.log('401 에러 발생 - 토큰 갱신을 시도합니다.');
          
          // 리프레시 토큰이 있는지 먼저 확인
          const hasRefreshToken = localStorage.getItem('refresh_token');
          
          if (hasRefreshToken && refreshToken) {
            try {
              // UserContext의 refreshToken 함수 사용
              const refreshSuccess = await refreshToken();
              if (refreshSuccess) {
                console.log('토큰 갱신 성공. API 재시도합니다.');
                // 토큰 갱신 성공 시 API 재시도
                ordersResponse = await orderApi.getUserOrders(20);
                ordersData = ordersResponse;
                console.log('토큰 갱신 후 API 재시도 성공:', ordersData);
              } else {
                throw new Error('토큰 갱신 실패');
              }
            } catch (refreshError) {
              console.error('토큰 갱신 실패:', refreshError);
              
                          // 토큰 갱신 실패 시 UserContext의 로그아웃 호출하여 상태 동기화
            console.log('토큰 갱신 실패 - UserContext 로그아웃 호출');
            
            // 사용자에게 명확한 안내 제공 (토큰 갱신 실패)
            const authExpiredModal = showAuthExpiredNotification();
            setModalState(authExpiredModal);
            console.log('인증 만료 모달 상태 설정:', authExpiredModal);
            
            // 자동 로그아웃 제거 - 사용자가 모달을 닫을 때 로그아웃
            
            return; // loadOrderData 함수 종료
            }
          } else {
            // 리프레시 토큰이 없으면 바로 로그아웃 처리
            console.log('리프레시 토큰이 없음 - 바로 로그아웃 처리');
            
            // 사용자에게 명확한 안내 제공 (리프레시 토큰이 없는 경우)
            const sessionExpiredModal = showSessionExpiredNotification();
            console.log('showSessionExpiredNotification 반환값:', sessionExpiredModal);
            setModalState(sessionExpiredModal);
            console.log('세션 만료 모달 상태 설정 후 modalState:', modalState);
            
            // 자동 로그아웃 제거 - 사용자가 모달을 닫을 때 로그아웃
            
            return; // loadOrderData 함수 종료
          }
        }
        
        // API 실패 시 빈 데이터로 설정
        if (!ordersData) {
          ordersData = {
            limit: 20,
            total_count: 0,
            order_groups: []
          };
        }
      }
      
      // 새로운 API 응답 구조 확인
      if (!ordersData || !ordersData.order_groups || !Array.isArray(ordersData.order_groups) || ordersData.order_groups.length === 0) {
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
      
      // 새로운 API 응답 구조를 프론트엔드 형식으로 변환
      const transformedOrders = ordersData.order_groups.map((orderGroup) => {
        return {
          order_id: orderGroup.order_id,
          order_number: orderGroup.order_number,
          order_date: orderGroup.order_date,
          status: 'delivered',
          total_amount: orderGroup.total_amount,
          item_count: orderGroup.item_count,
          items: orderGroup.items.map((item) => ({
            product_name: item.product_name || '상품명 없음',
            product_image: item.product_image,
            price: item.price,
            quantity: item.quantity,
            delivery_status: item.delivery_status,
            delivery_date: item.delivery_date,
            recipe_related: item.recipe_related,
            recipe_title: item.recipe_title,
            recipe_rating: item.recipe_rating,
            recipe_scrap_count: item.recipe_scrap_count,
            recipe_description: item.recipe_description,
            ingredients_owned: item.ingredients_owned,
            total_ingredients: item.total_ingredients
          }))
        };
      });
      
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
         console.log('401 에러 발생 - 토큰이 유효하지 않거나 만료되었습니다.');
         // 토큰이 유효하지 않으면 로그인 페이지로 이동
         localStorage.removeItem('access_token');
         localStorage.removeItem('token_type');
         const loginRequiredModal = showLoginRequiredNotification();
         setModalState(loginRequiredModal);
         console.log('로그인 필요 모달 상태 설정:', loginRequiredModal);
         return;
       }
      // 422 에러 특별 처리
      else if (error.response?.status === 422) {
        console.log('422 에러 발생 - API 엔드포인트나 파라미터 문제일 수 있습니다.');
        setError(null); // 에러 상태 초기화
      }
      // 네트워크 에러인 경우 빈 데이터 사용, 그 외에는 에러 메시지 표시
      else if (error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED' || 
          (error.name === 'TypeError' && error.message.includes('Failed to fetch')) ||
          error.message.includes('Network Error')) {
        console.log('백엔드 서버 연결 실패 - 빈 데이터로 설정합니다.');
        setError(null); // 에러 상태 초기화
      } else {
        setError(error.message);
      }
      setLoading(false);
      
      // API 연결 실패 시 빈 데이터로 설정 (토큰은 유지)
      console.log('API 연결 실패 - 빈 데이터로 설정합니다.');
      setOrderData({
        orders: [],
        total_count: 0,
        page: 1,
        size: 20
      });
    }
  }, [isLoggedIn, refreshToken, navigate, setModalState, setLoading, setError, setOrderData, logout]);

  // useEffect 추가
  useEffect(() => {
    console.log('OrderList useEffect 실행 - isLoggedIn:', isLoggedIn);
    
    // UserContext의 로딩이 완료된 후에만 로그인 상태 확인
    if (isLoggedIn !== undefined) {
      const loginStatus = checkLoginStatus();
      console.log('checkLoginStatus 결과:', loginStatus);
      
      if (loginStatus) {
        console.log('로그인 상태 확인됨 - loadOrderData 호출');
        loadOrderData();
      } else {
        // 로그인하지 않은 경우 로딩 상태만 해제
        console.log('로그인하지 않은 상태: 주문 내역 API 호출 건너뜀');
        setLoading(false);
      }
    } else {
      console.log('UserContext 로딩 중 - isLoggedIn이 아직 undefined');
    }
  }, [isLoggedIn, refreshToken, logout, loadOrderData]);

  // 모달 상태 변화 감지를 위한 useEffect 추가
  useEffect(() => {
    console.log('모달 상태 변화 감지:', modalState);
  }, [modalState]);

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
    <div className="order-list-page order-list-container">
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
            orderData.orders
              .sort((a, b) => {
                // 전체 주문 그룹을 날짜순으로 정렬 (최근 날짜순)
                const dateA = new Date(a.order_date);
                const dateB = new Date(b.order_date);
                
                // 날짜가 같다면 주문번호로 정렬 (최근 주문번호가 먼저)
                if (dateA.getTime() === dateB.getTime()) {
                  return b.order_id - a.order_id;
                }
                
                return dateB - dateA; // 최근 날짜가 먼저 오도록 내림차순 정렬
              })
              .map((order) => {
                return (
                  <div key={order.order_id} className="order-item">
                    {/* 회색 박스 컨테이너 */}
                    <div className="order-content-box">
                      {/* 주문 정보 헤더 */}
                      <div className="order-header">
                        <div className="order-info">
                          <span className="order-number">주문번호: {order.order_number}</span>
                          <span className="order-date">{order.order_date}</span>
                        </div>
                        <div className="order-summary">
                          <span className="total-amount">{formatPrice(order.total_amount)}</span>
                          <span className="item-count">총 {order.item_count}개 상품</span>
                        </div>
                      </div>
                      
                      {/* 배송 상태 */}
                      <div className="delivery-status">
                        <span className="delivery-status-text">{order.items[0]?.delivery_status || '배송완료'}</span>
                        <span className="delivery-date">{order.items[0]?.delivery_date || `${formatDate(order.order_date)} 도착`}</span>
                      </div>
                      
                      {/* 상품 정보들 - 같은 주문번호의 모든 상품을 표시합니다 */}
                      {order.items.map((item, index) => (
                        <div 
                          key={`${order.order_id}-${index}`} 
                          className="product-info"
                          onClick={() => handleOrderDetailClick(order.order_id)}
                          style={{ cursor: 'pointer' }}
                        >
                          {/* 상품 이미지를 표시합니다 */}
                          <div className="product-image">
                            <img src={item.product_image} alt={item.product_name} />
                          </div>
                          
                          {/* 상품 상세 정보 */}
                          <div className="product-details">
                            {/* 상품명을 표시합니다 */}
                            <div className="product-name" title={item.product_name}>
                              {(() => {
                                const productName = item.product_name;
                                const displayName = productName.length > 40 
                                  ? `${productName.substring(0, 40)}...`
                                  : productName;
                                
                                // 대괄호 안의 텍스트를 <strong> 태그로 감싸기
                                const formattedName = displayName.replace(/\[([^\]]+)\]/g, '<strong>[$1]</strong>');
                                
                                return <span dangerouslySetInnerHTML={{ __html: formattedName }} />;
                              })()}
                            </div>
                            
                            {/* 가격과 수량 정보 */}
                            <div className="product-price">
                              {item.price ? `${item.price.toLocaleString()}원` : '가격 정보 없음'} · {item.quantity || 1}개
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })
          )}
        </div>
      </main>

      {/* 하단 네비게이션 컴포넌트 */}
      <BottomNav />
      
             {/* 모달 컴포넌트 */}
       <ModalManager
         {...modalState}
         onClose={handleModalClose}
       />
       {/* 모달 디버깅용 로그 */}
       {console.log('ModalManager에 전달되는 props:', { ...modalState, onClose: handleModalClose })}
       {console.log('modalState.isVisible:', modalState.isVisible)}
       {console.log('modalState.modalType:', modalState.modalType)}
    </div>
  );
};

// 주문 내역 페이지 컴포넌트를 내보냅니다
export default OrderList;
