import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import HeaderNavNoti from '../../layout/HeaderNavNoti';
import BottomNav from '../../layout/BottomNav';
import Loading from '../../components/Loading';
import '../../styles/notification.css';
import api from '../api';

import { homeShoppingApi } from '../../api/homeShoppingApi';
import { orderApi } from '../../api/orderApi';

const Notification = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('homeshopping'); // 'homeshopping', 'shopping'
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // 로그인 상태 추가
  const isInitialLoadRef = useRef(false); // 중복 호출 방지용 ref

  // 로그인 상태 확인 함수
  const checkLoginStatus = () => {
    const token = localStorage.getItem('access_token');
    const isLoggedInStatus = !!token;
    setIsLoggedIn(isLoggedInStatus);
    return isLoggedInStatus;
  };

  // 홈쇼핑 통합 알림 API 호출 (주문 + 방송)
  const fetchHomeShoppingAllNotifications = async (limit = 100) => {
    // 로그인하지 않은 경우 알림 후 이전 화면으로 돌아가기
    if (!checkLoginStatus()) {
      alert('로그인이 필요한 서비스입니다.');
      window.history.back();
      return;
    }

    try {
      console.log('홈쇼핑 통합 알림 API 호출 시작...');
      
      const response = await homeShoppingApi.getAllNotifications(limit, 0);
      console.log('홈쇼핑 통합 알림 API 응답:', response);
      
      if (response && response.notifications) {
        const transformedNotifications = response.notifications.map(notification => ({
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
          statusId: notification.status_id,
          productName: notification.product_name,
          orderStatus: notification.title
        }));
        
        setNotifications(transformedNotifications);
      }
    } catch (err) {
      console.error('홈쇼핑 통합 알림 데이터 로딩 실패:', err);
      // 401 에러는 api.js 인터셉터에서 처리되므로 여기서는 추가 처리하지 않음
      setNotifications([]);
    }
  };

  // 탭 변경 시 알림 데이터 로드
  const handleTabChange = async (tab) => {
    setActiveTab(tab);
    setLoading(true);
    setError(null);
    
    try {
      switch (tab) {
        case 'homeshopping':
          await fetchHomeShoppingAllNotifications();
          break;
        case 'shopping':
          await fetchShoppingNotifications();
          break;
        default:
          await fetchHomeShoppingAllNotifications();
      }
    } catch (error) {
      console.error('알림 데이터 로드 실패:', error);
      // 401 에러는 api.js 인터셉터에서 처리되므로 여기서는 추가 처리하지 않음
    } finally {
      setLoading(false);
    }
  };

  // 콕 쇼핑몰 알림 API 호출
  const fetchShoppingNotifications = async (limit = 20) => {
    // 로그인하지 않은 경우 알림 후 이전 화면으로 돌아가기
    if (!checkLoginStatus()) {
      alert('로그인이 필요한 서비스입니다.');
      window.history.back();
      return;
    }

    try {
      console.log('쇼핑몰 알림 API 호출 시작...');
      
      const response = await orderApi.getKokOrderNotifications(limit, 0);
      
      console.log('콕 쇼핑몰 알림 API 응답:', response);
      
      if (response && response.notifications) {
        const transformedNotifications = response.notifications.map(notification => ({
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
          relatedEntityId: notification.related_entity_id
        }));
        
        setNotifications(transformedNotifications);
      }
    } catch (err) {
      console.error('쇼핑몰 알림 데이터 로딩 실패:', err);
      // 401 에러는 api.js 인터셉터에서 처리되므로 여기서는 추가 처리하지 않음
      setNotifications([]);
    }
  };

  useEffect(() => {
    // 중복 호출 방지
    if (isInitialLoadRef.current) {
      return;
    }
    isInitialLoadRef.current = true;

    const loadNotifications = async () => {
      setLoading(true);
      setError(null);
      
      // 로그인 상태 확인 후 조건부로 API 호출
      const loginStatus = checkLoginStatus();
      if (loginStatus) {
        // 기본적으로 홈쇼핑 통합 알림 로드 (토큰 체크는 api.js 인터셉터에서 처리)
        await fetchHomeShoppingAllNotifications();
      } else {
        // 로그인하지 않은 경우 알림 후 이전 화면으로 돌아가기
        alert('로그인이 필요한 서비스입니다.');
        window.history.back();
        return;
      }
      setLoading(false);
    };

    loadNotifications();
  }, []);

  // 알림 타입에 따른 아이콘 렌더링
  const renderNotificationIcon = (type) => {
    switch (type) {
      case 'order_status':
        return (
          <div className="notification-icon order-icon">
            📦
          </div>
        );
      case 'broadcast_start':
        return (
          <div className="notification-icon broadcast-icon">
            📺
          </div>
        );
      default:
        return (
          <div className="notification-icon default-icon">
            🔔
          </div>
        );
    }
  };

  // 알림 타입에 따른 배경색 렌더링
  const getNotificationTypeClass = (type) => {
    switch (type) {
      case 'order_status':
        return 'notification-order';
      case 'broadcast_start':
        return 'notification-broadcast';
      default:
        return 'notification-default';
    }
  };

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
            쇼핑몰
          </button>
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div className="notification-error">
            <p>{error}</p>
          </div>
        )}

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
                  fill="#000000"
                />
              </svg>
              <h3>알림이 없습니다</h3>
              <p>
                {activeTab === 'homeshopping' && '홈쇼핑 알림이 오면 여기에 표시됩니다.'}
                {activeTab === 'shopping' && '콕 주문 알림이 오면 여기에 표시됩니다.'}
              </p>
            </div>
          ) : (
            notifications.map(notification => (
              <div 
                key={notification.id}
                className={`notification-item ${!notification.isRead ? 'unread' : ''} ${getNotificationTypeClass(notification.type)}`}
              >
                {renderNotificationIcon(notification.type)}
                <div className="notification-content-body">
                  <div className="notification-status">
                    {activeTab === 'shopping' && notification.orderStatus 
                      ? notification.orderStatus 
                      : (activeTab === 'homeshopping' && notification.orderStatus)
                      ? notification.orderStatus
                      : notification.title}
                  </div>
                  {(activeTab === 'shopping' || (activeTab === 'homeshopping' && notification.productName)) && notification.productName && (
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
