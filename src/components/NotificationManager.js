import React from 'react';
import { useNotifications } from '../layout/HeaderNav';

const NotificationManager = () => {
  const { notificationCount, cartCount, addNotification, clearNotifications, addToCart, clearCart } = useNotifications();

  return (
    <div style={{ 
      padding: '20px', 
      textAlign: 'center',
      backgroundColor: '#f5f5f5',
      borderRadius: '10px',
      margin: '20px'
    }}>
      <h3>알림/장바구니 관리</h3>
      <p>현재 알림 개수: <strong>{notificationCount}</strong> | 장바구니 개수: <strong>{cartCount}</strong></p>
      
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
        <button 
          onClick={addNotification}
          style={{ 
            padding: '10px 15px', 
            backgroundColor: '#ff69b4', 
            color: 'white', 
            border: 'none', 
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          알림 추가
        </button>
        <button 
          onClick={clearNotifications}
          style={{ 
            padding: '10px 15px', 
            backgroundColor: '#666', 
            color: 'white', 
            border: 'none', 
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          알림 초기화
        </button>
        <button 
          onClick={addToCart}
          style={{ 
            padding: '10px 15px', 
            backgroundColor: '#4CAF50', 
            color: 'white', 
            border: 'none', 
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          장바구니 추가
        </button>
        <button 
          onClick={clearCart}
          style={{ 
            padding: '10px 15px', 
            backgroundColor: '#666', 
            color: 'white', 
            border: 'none', 
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          장바구니 초기화
        </button>
      </div>
    </div>
  );
};

export default NotificationManager; 