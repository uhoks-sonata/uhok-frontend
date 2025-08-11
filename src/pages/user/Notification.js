import React, { useState, useEffect } from 'react';
// Header removed
import BottomNav from '../../layout/BottomNav';
import '../../styles/notification.css';
import api from '../api';
import { ensureToken } from '../../utils/authUtils';

const Notification = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [error, setError] = useState(null);

  // 더미 데이터 (나중에 API로 교체)
  const dummyNotifications = [
    {
      id: 1,
      type: 'order',
      title: '주문이 완료되었습니다',
      message: '블루투스 이어폰 주문이 성공적으로 완료되었습니다.',
      time: '2024-01-15 14:30',
      isRead: false,
      icon: '📦'
    },
    {
      id: 2,
      type: 'promotion',
      title: '특가 상품 알림',
      message: '관심 상품에 30% 할인 혜택이 적용되었습니다!',
      time: '2024-01-15 12:15',
      isRead: false,
      icon: '🎉'
    },
    {
      id: 3,
      type: 'delivery',
      title: '배송 시작',
      message: '주문하신 상품이 배송을 시작했습니다.',
      time: '2024-01-14 16:45',
      isRead: true,
      icon: '🚚'
    },
    {
      id: 4,
      type: 'review',
      title: '리뷰 작성 요청',
      message: '구매하신 상품은 어떠셨나요? 리뷰를 작성해주세요.',
      time: '2024-01-14 10:20',
      isRead: true,
      icon: '⭐'
    },
    {
      id: 5,
      type: 'system',
      title: '시스템 업데이트',
      message: '더 나은 서비스를 위해 시스템이 업데이트되었습니다.',
      time: '2024-01-13 09:00',
      isRead: true,
      icon: '🔧'
    }
  ];

  // 알림 타입별 아이콘 매핑
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'order_status':
        return '📦';
      case 'discount':
        return '🎉';
      case 'delivery':
        return '🚚';
      case 'review':
        return '⭐';
      case 'system':
        return '🔧';
      default:
        return '🔔';
    }
  };

  // 콕 알림 API 호출
  const fetchKokNotifications = async (limit = 50) => {
    try {
      console.log('콕 알림 API 호출 시작...');
      await ensureToken();
      
      const response = await api.get('/api/kok/notifications', {
        params: { limit }
      });
      
      console.log('콕 알림 API 응답:', response.data);
      
      if (response.data) {
        // API 응답을 컴포넌트 형식에 맞게 변환
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
          icon: getNotificationIcon(notification.notification_type)
        }));
        
        setNotifications(transformedNotifications);
        setTotalCount(response.data.total);
        setUnreadCount(response.data.unread_count);
      }
    } catch (err) {
      console.error('콕 알림 데이터 로딩 실패:', err);
      setError('알림을 불러오는 중 오류가 발생했습니다.');
      // API 연결 실패 시 더미 데이터 사용
      setNotifications(dummyNotifications);
      setTotalCount(dummyNotifications.length);
      setUnreadCount(dummyNotifications.filter(n => !n.isRead).length);
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
      
      await fetchKokNotifications();
      setLoading(false);
    };

    loadNotifications();
  }, []);

  const handleNotificationClick = (notificationId) => {
    // 알림 읽음 처리
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, isRead: true }
          : notification
      )
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, isRead: true }))
    );
    setUnreadCount(0);
  };

  if (loading) {
    return (
      <div className="notification-page">
        {/* header removed */}
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
      {/* header removed */}
      
      <div className="notification-content">
        {/* 에러 메시지 */}
        {error && (
          <div className="notification-error">
            <p>{error}</p>
          </div>
        )}

        {/* 알림 헤더 */}
        <div className="notification-header">
          <div className="notification-summary">
            <h2>알림 {totalCount}개</h2>
            {unreadCount > 0 && (
              <span className="unread-badge">{unreadCount}개 읽지 않음</span>
            )}
          </div>
          {unreadCount > 0 && (
            <button 
              className="mark-all-read-btn"
              onClick={handleMarkAllAsRead}
            >
              모두 읽음
            </button>
          )}
        </div>

        {/* 알림 목록 */}
        <div className="notification-list">
          {notifications.length === 0 ? (
            <div className="no-notifications">
              <div className="no-notifications-icon">🔔</div>
              <h3>알림이 없습니다</h3>
              <p>새로운 알림이 오면 여기에 표시됩니다.</p>
            </div>
          ) : (
            notifications.map(notification => (
              <div 
                key={notification.id}
                className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
                onClick={() => handleNotificationClick(notification.id)}
              >
                <div className="notification-icon">
                  {notification.icon}
                </div>
                <div className="notification-content-body">
                  <div className="notification-title">
                    {notification.title}
                    {!notification.isRead && <span className="unread-dot"></span>}
                  </div>
                  <div className="notification-message">
                    {notification.message}
                  </div>
                  <div className="notification-time">
                    {notification.time}
                  </div>
                </div>
                <div className="notification-arrow">
                  <span>›</span>
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
