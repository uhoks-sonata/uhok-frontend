import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import HeaderNavNoti from '../../layout/HeaderNavNoti';
import BottomNav from '../../layout/BottomNav';
import Loading from '../../components/Loading';
import '../../styles/notification.css';
import api from '../api';
import { ensureToken } from '../../utils/authUtils';

const Notification = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('homeshopping'); // 'homeshopping' 또는 'shopping'
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);



  // 홈쇼핑 알림 API 호출 (모든 알림 통합 조회)
  const fetchHomeShoppingNotifications = async (limit = 20) => {
    try {
      console.log('홈쇼핑 알림 API 호출 시작...');
      await ensureToken();
      
      const response = await api.get('/api/homeshopping/notifications/all', {
        params: { limit, offset: 0 }
      });
      
      console.log('홈쇼핑 알림 API 응답:', response.data);
      
      if (response.data) {
        const transformedNotifications = response.data.notifications.map(notification => ({
          id: notification.notification_id,
          type: notification.notification_type,
          title: notification.title,
          message: notification.message,
          time: new Date(notification.created_at).toLocaleString('ko-KR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
          }),
          isRead: notification.is_read,
          relatedEntityType: notification.related_entity_type,
          relatedEntityId: notification.related_entity_id,
          homeshoppingOrderId: notification.homeshopping_order_id,
          homeshoppingLikeId: notification.homeshopping_like_id,
          statusId: notification.status_id,
          readAt: notification.read_at
        }));
        
        // 테스트용 더미 데이터 추가 (나중에 지우기 쉽게 주석 처리)
        const testDummyData = [
          {
            id: 'test-1',
            type: 'order_status_change',
            title: '주문 상태 변경',
            message: '주문하신 [농팜] 프리미엄 김치 세트가 배송을 시작합니다.',
            time: '2025.01.20 15:00',
            isRead: false,
            relatedEntityType: 'order',
            relatedEntityId: 12345,
            homeshoppingOrderId: 12345,
            statusId: 2
          },
          {
            id: 'test-2',
            type: 'broadcast_start',
            title: '방송 시작 알림',
            message: '오늘 저녁 8시, 신선 식재료 특가 방송이 시작됩니다!',
            time: '2025.01.20 14:30',
            isRead: true,
            relatedEntityType: 'broadcast',
            relatedEntityId: 67890,
            homeshoppingOrderId: null,
            statusId: 1
          },
          {
            id: 'test-3',
            type: 'order_completed',
            title: '주문 완료',
            message: '주문하신 [농팜] 유기농 과일 세트가 성공적으로 주문되었습니다.',
            time: '2025.01.20 13:15',
            isRead: false,
            relatedEntityType: 'order',
            relatedEntityId: 12346,
            homeshoppingOrderId: 12346,
            statusId: 1
          },
          {
            id: 'test-4',
            type: 'like_notification',
            title: '좋아요 알림',
            message: '찜해두신 [농팜] 프리미엄 생수 500ml가 특가로 할인됩니다!',
            time: '2025.01.20 12:00',
            isRead: true,
            relatedEntityType: 'like',
            relatedEntityId: 11111,
            homeshoppingLikeId: 11111,
            statusId: 1
          },
          {
            id: 'test-5',
            type: 'delivery_completed',
            title: '배송 완료',
            message: '주문하신 [농팜] 김치 세트가 안전하게 배송 완료되었습니다.',
            time: '2025.01.20 11:45',
            isRead: false,
            relatedEntityType: 'order',
            relatedEntityId: 12347,
            homeshoppingOrderId: 12347,
            statusId: 3
          }
        ];
        
        // 실제 데이터와 테스트 데이터 합치기
        const allNotifications = [...transformedNotifications, ...testDummyData];
        setNotifications(allNotifications);
      }
    } catch (err) {
      console.error('홈쇼핑 알림 데이터 로딩 실패:', err);
      setError('홈쇼핑 알림을 불러오는 중 오류가 발생했습니다.');
      setNotifications([]);
    }
  };

  // 탭 변경 시 알림 데이터 로드
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setLoading(true);
    setError(null);
    
    if (tab === 'homeshopping') {
      fetchHomeShoppingNotifications();
    } else {
      fetchShoppingNotifications();
    }
    
    setLoading(false);
  };

  // 쇼핑몰 알림 API 호출
  const fetchShoppingNotifications = async (limit = 20) => {
    try {
      console.log('쇼핑몰 알림 API 호출 시작...');
      await ensureToken();
      
      const response = await api.get('/api/orders/kok/notifications/history', {
        params: { limit, offset: 0 }
      });
      
      console.log('쇼핑몰 알림 API 응답:', response.data);
      
      if (response.data) {
        const transformedNotifications = response.data.notifications.map(notification => ({
          id: notification.notification_id,
          type: notification.order_status,
          title: notification.title || notification.notification_message,
          message: notification.message || notification.notification_message,
          time: new Date(notification.created_at).toLocaleString('ko-KR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
          }),
          isRead: false, // API 응답에 is_read 필드가 없으므로 기본값 false
          productName: notification.product_name,
          orderStatus: notification.order_status_name
        }));
        
        // 테스트용 더미 데이터 추가 (나중에 지우기 쉽게 주석 처리)
        const testDummyData = [
          {
            id: 'test-kok-1',
            type: 'test',
            title: '[테스트] 콕 주문 테스트 알림',
            message: '상품이 주문되었습니다.',
            time: '2025.01.20 15:30',
            isRead: false,
            productName: '[테스트] 테스트 상품명',
            orderStatus: '주문완료'
          }
        ];
        
        // 실제 데이터와 테스트 데이터 합치기
        const allNotifications = [...transformedNotifications, ...testDummyData];
        setNotifications(allNotifications);
      }
    } catch (err) {
      console.error('쇼핑몰 알림 데이터 로딩 실패:', err);
      setError('쇼핑몰 알림을 불러오는 중 오류가 발생했습니다.');
      setNotifications([]);
    }
  };

  useEffect(() => {
    const loadNotifications = async () => {
      setLoading(true);
      setError(null);
      
      // 토큰 확인
      const token = localStorage.getItem('access_token');
      if (!token) {
        console.log('토큰이 없어서 로그인 페이지로 이동');
        window.location.href = '/';
        return;
      }
      
      // 기본적으로 홈쇼핑 알림 로드
      await fetchHomeShoppingNotifications();
      setLoading(false);
    };

    loadNotifications();
  }, []);



  if (loading) {
    return (
      <div className="notification-page">
        {/* 알림 헤더 네비게이션 */}
        <HeaderNavNoti 
          onBackClick={() => navigate(-1)}
        />
        <Loading message="알림을 불러오는 중..." />
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="notification-page">
      {/* 알림 헤더 네비게이션 */}
      <HeaderNavNoti 
        onBackClick={() => navigate(-1)}
      />
      
      <div className="notification-content">
        {/* 탭 네비게이션 */}
        <div className="notification-tabs">
          <button 
            className={`notification-tab-button ${activeTab === 'homeshopping' ? 'active' : ''}`}
            onClick={() => handleTabChange('homeshopping')}
          >
            홈쇼핑
          </button>
          <button 
            className={`notification-tab-button ${activeTab === 'shopping' ? 'active' : ''}`}
            onClick={() => handleTabChange('shopping')}
          >
            콕 주문
          </button>
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div className="notification-error">
            <p>{error}</p>
          </div>
        )}

        {/* 알림 헤더
        <div className="notification-header">
          <div className="notification-summary">
            <h2>{activeTab === 'homeshopping' ? '홈쇼핑' : '콕 주문'} 알림</h2>
          </div>
        </div> */}

        {/* 알림 목록 */}
        <div className="notification-list">
          {notifications.length === 0 ? (
            <div className="no-notifications">
              <svg 
                width="48" 
                height="48" 
                viewBox="0 0 24 24" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
                className="no-notifications-icon"
              >
                <path 
                  d="M12 22C13.1 22 14 21.1 14 20H10C10 21.1 10.9 22 12 22ZM18 16V11C18 7.93 16.37 5.36 13.5 4.68V4C13.5 3.17 12.83 2.5 12 2.5C11.17 2.5 10.5 3.17 10.5 4V4.68C7.64 5.36 6 7.92 6 11V16L4 18V19H20V18L18 16ZM16 17H8V11C8 8.52 9.51 6.5 12 6.5C14.49 6.5 16 8.52 16 11V17Z" 
                  fill="#CCCCCC"
                />
              </svg>
              <h3>알림이 없습니다</h3>
              <p>{activeTab === 'homeshopping' ? '홈쇼핑' : '콕 주문'} 새로운 알림이 오면 여기에 표시됩니다.</p>
            </div>
          ) : (
            notifications.map(notification => (
              <div 
                key={notification.id}
                className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
              >
                <div className="notification-content-body">
                  <div className="notification-status">
                    {activeTab === 'shopping' && notification.orderStatus 
                      ? notification.orderStatus 
                      : notification.title}
                  </div>
                  {activeTab === 'shopping' && notification.productName && (
                    <div className="notification-product">
                      {notification.productName}
                    </div>
                  )}
                  <div className="notification-message">
                    {notification.message}
                  </div>
                  {activeTab === 'homeshopping' && notification.relatedEntityType && (
                    <div className="notification-entity-info">
                      {notification.relatedEntityType === 'order' && '주문 알림'}
                      {notification.relatedEntityType === 'broadcast' && '방송 알림'}
                      {notification.relatedEntityType === 'like' && '좋아요 알림'}
                    </div>
                  )}
                </div>
                <div className="notification-time">
                  {notification.time}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      
      <BottomNav />
    </div>
  );
};

export default Notification;
