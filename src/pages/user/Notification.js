import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import HeaderNavNoti from '../../layout/HeaderNavNoti';
import BottomNav from '../../layout/BottomNav';
import '../../styles/notification.css';
import api from '../api';
import { ensureToken } from '../../utils/authUtils';

const Notification = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('homeshopping'); // 'homeshopping' 또는 'shopping'
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);



  // 홈쇼핑 알림 API 호출
  const fetchHomeShoppingNotifications = async (limit = 20) => {
    try {
      console.log('홈쇼핑 알림 API 호출 시작...');
      await ensureToken();
      
      const response = await api.get('/api/homeshopping/notifications', {
        params: { limit }
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
          isRead: notification.is_read
        }));
        
        // 테스트용 더미 데이터 추가 (나중에 지우기 쉽게 주석 처리)
        const testDummyData = [
          {
            id: 'test-1',
            type: 'test',
            title: '[테스트] 홈쇼핑 테스트 알림',
            message: '이것은 테스트용 더미 데이터입니다. API 연결 후 지워주세요.',
            time: '2025.01.20 15:00',
            isRead: false
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
        <div className="notification-loading">
          <div className="loading-spinner"></div>
          <p>알림을 불러오는 중...</p>
        </div>
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
                className="notification-item"
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
