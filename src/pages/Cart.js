import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartHeader } from '../layout/HeaderNav';
import { useNotifications } from '../layout/HeaderNav';
import '../styles/cart.css';

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fadeIn, setFadeIn] = useState(false);
  const navigate = useNavigate();
  const { cartCount, clearCart } = useNotifications();

  useEffect(() => {
    setFadeIn(true);
    // 실제로는 API에서 장바구니 데이터를 가져와야 함
    loadCartItems();
  }, []);

  const loadCartItems = async () => {
    try {
      setLoading(true);
      // 임시 데이터 (실제로는 API 호출)
      const mockCartItems = [
        {
          id: 1,
          name: "구운계란 30구+핑크솔트 증정",
          brand: "산지명인",
          price: 11900,
          originalPrice: 15000,
          quantity: 1,
          image: "/test1.png",
          discountRate: 21
        },
        {
          id: 2,
          name: "초코파이 12개입",
          brand: "오리온",
          price: 8500,
          originalPrice: 12000,
          quantity: 2,
          image: "/test2.png",
          discountRate: 29
        }
      ];
      setCartItems(mockCartItems);
    } catch (error) {
      console.error('장바구니 데이터 로딩 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleNotificationClick = () => {
    console.log('알림 버튼 클릭');
    // 알림 페이지로 이동하거나 알림 모달 표시
  };

  const handleQuantityChange = (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    
    setCartItems(prev => 
      prev.map(item => 
        item.id === itemId 
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  const handleRemoveItem = (itemId) => {
    setCartItems(prev => prev.filter(item => item.id !== itemId));
  };

  const handleCheckout = () => {
    console.log('결제 페이지로 이동');
    // 결제 페이지로 이동
    navigate('/payment');
  };

  const totalPrice = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalOriginalPrice = cartItems.reduce((sum, item) => sum + (item.originalPrice * item.quantity), 0);
  const totalDiscount = totalOriginalPrice - totalPrice;

  if (loading) {
    return (
      <div className={`cart-page ${fadeIn ? 'fade-in' : ''}`}>
        <CartHeader onBack={handleBack} onNotificationClick={handleNotificationClick} />
        <div className="cart-content">
          <div className="loading">장바구니를 불러오는 중...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`cart-page ${fadeIn ? 'fade-in' : ''}`}>
      <CartHeader onBack={handleBack} onNotificationClick={handleNotificationClick} />
      
      <div className="cart-content">
        {cartItems.length === 0 ? (
          <div className="empty-cart">
            <div className="empty-cart-icon">🛒</div>
            <h2>장바구니가 비어있어요</h2>
            <p>상품을 담아보세요!</p>
            <button 
              className="go-shopping-btn"
              onClick={() => navigate('/kok')}
            >
              쇼핑하러 가기
            </button>
          </div>
        ) : (
          <>
            <div className="cart-items">
              {cartItems.map((item) => (
                <div key={item.id} className="cart-item">
                  <div className="item-image">
                    <img src={item.image} alt={item.name} />
                  </div>
                  <div className="item-info">
                    <div className="item-brand">{item.brand}</div>
                    <div className="item-name">{item.name}</div>
                    <div className="item-price">
                      <span className="current-price">{item.price.toLocaleString()}원</span>
                      <span className="original-price">{item.originalPrice.toLocaleString()}원</span>
                      <span className="discount-rate">{item.discountRate}% 할인</span>
                    </div>
                  </div>
                  <div className="item-actions">
                    <div className="quantity-controls">
                      <button 
                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                      >
                        -
                      </button>
                      <span className="quantity">{item.quantity}</span>
                      <button 
                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                      >
                        +
                      </button>
                    </div>
                    <button 
                      className="remove-btn"
                      onClick={() => handleRemoveItem(item.id)}
                    >
                      삭제
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="cart-summary">
              <div className="summary-item">
                <span>상품 금액</span>
                <span>{totalOriginalPrice.toLocaleString()}원</span>
              </div>
              <div className="summary-item discount">
                <span>할인 금액</span>
                <span>-{totalDiscount.toLocaleString()}원</span>
              </div>
              <div className="summary-item total">
                <span>결제 예정 금액</span>
                <span>{totalPrice.toLocaleString()}원</span>
              </div>
            </div>
            
            <div className="cart-actions">
              <button 
                className="checkout-btn"
                onClick={handleCheckout}
                disabled={cartItems.length === 0}
              >
                {totalPrice.toLocaleString()}원 주문하기
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Cart;
