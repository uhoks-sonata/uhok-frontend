// 수정 필요
// 코드 구현 x




import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// Header removed
import BottomNav from '../../layout/BottomNav';
import '../../styles/kok_payment.css';

const KokPayment = () => {
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardHolderName, setCardHolderName] = useState('');
  const navigate = useNavigate();

  const handlePayment = () => {
    // 결제 처리 로직
    console.log('결제 처리 중...');
    alert('결제가 완료되었습니다!');
    navigate('/mypage');
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleSearch = (query) => {
    console.log('검색어:', query);
  };

  const handleNotificationClick = () => {
    console.log('알림 클릭됨');
    navigate('/notifications');
  };

  const handleCartClick = () => {
    navigate('/cart');
  };

  return (
    <div className="payment-page">
      {/* header removed */}
      
      <div className="payment-content">
        <h1 className="payment-title">결제하기</h1>
        
        <div className="order-summary">
          <h2>주문 요약</h2>
          <div className="order-item">
            <img src="/test1.png" alt="상품" className="product-image" />
            <div className="product-info">
              <h3>테스트 상품</h3>
              <p>수량: 1개</p>
              <p className="price">₩29,900</p>
            </div>
          </div>
          <div className="total">
            <span>총 결제금액:</span>
            <span className="total-price">₩29,900</span>
          </div>
        </div>

        <div className="payment-methods">
          <h2>결제 방법</h2>
          <div className="method-options">
            <label className="method-option">
              <input
                type="radio"
                name="paymentMethod"
                value="card"
                checked={paymentMethod === 'card'}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              <span>신용카드</span>
            </label>
            <label className="method-option">
              <input
                type="radio"
                name="paymentMethod"
                value="bank"
                checked={paymentMethod === 'bank'}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              <span>계좌이체</span>
            </label>
          </div>
        </div>

        {paymentMethod === 'card' && (
          <div className="card-form">
            <h2>카드 정보</h2>
            <div className="form-group">
              <label>카드 번호</label>
              <input
                type="text"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                placeholder="1234 5678 9012 3456"
                maxLength="19"
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>만료일</label>
                <input
                  type="text"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  placeholder="MM/YY"
                  maxLength="5"
                />
              </div>
              <div className="form-group">
                <label>CVV</label>
                <input
                  type="text"
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value)}
                  placeholder="123"
                  maxLength="3"
                />
              </div>
            </div>
            <div className="form-group">
              <label>카드 소유자명</label>
              <input
                type="text"
                value={cardHolderName}
                onChange={(e) => setCardHolderName(e.target.value)}
                placeholder="홍길동"
              />
            </div>
          </div>
        )}

        <div className="payment-actions">
          <button className="payment-button" onClick={handlePayment}>
            결제하기
          </button>
        </div>
      </div>
      
      <BottomNav />
    </div>
  );
};

export default KokPayment;
