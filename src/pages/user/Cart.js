import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartHeader } from '../../layout/HeaderNav';
import { useNotifications } from '../../layout/HeaderNav';
import BottomNav from '../../layout/BottomNav';
import '../../styles/cart.css';
import heartIcon from '../../assets/heart_empty.png';
import heartFilledIcon from '../../assets/heart_filled.png';
import test1Image from '../../assets/test/test1.png';

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [showQuantityModal, setShowQuantityModal] = useState(false);
  const [selectedCartItemId, setSelectedCartItemId] = useState(null);
  const navigate = useNavigate();
  const { cartCount, clearCart } = useNotifications();

  useEffect(() => {
    loadCartItems();
  }, []);

  const loadCartItems = async () => {
    try {
      setLoading(true);
      
      // 임시 데이터 사용 (API 연결 전까지)
      const mockCartItems = [
        {
          kok_cart_id: 1,
          kok_product_id: 10046186,
          kok_product_name: "[맛춤상회] 배터지는 소고기 모듬세트",
          kok_thumbnail: test1Image,
          kok_product_price: 600000,
          kok_discount_rate: 47,
          kok_discounted_price: 319000,
          kok_store_name: "맛춤상회",
          kok_quantity: 1,
          kok_option: "04.온가족 세트 총 1.1kg (갈비+등심추리+토시+부채+차돌박이)"
        },
        {
          kok_cart_id: 2,
          kok_product_id: 10046187,
          kok_product_name: "[맛춤상회] 배터지는 소고기 모듬세트",
          kok_thumbnail: test1Image,
          kok_product_price: 600000,
          kok_discount_rate: 47,
          kok_discounted_price: 319000,
          kok_store_name: "맛춤상회",
          kok_quantity: 1,
          kok_option: "04.온가족 세트 총 1.1kg (갈비+등심추리+토시+부채+차돌박이)"
        }
      ];
      
      setCartItems(mockCartItems);
      // 모든 아이템을 기본적으로 선택
      setSelectedItems(new Set(mockCartItems.map(item => item.kok_cart_id)));
    } catch (error) {
      console.error('장바구니 데이터 로딩 실패:', error);
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleNotificationClick = () => {
    console.log('알림 버튼 클릭');
    navigate('/notifications');
  };

  const handleSelectAll = () => {
    if (selectedItems.size === cartItems.length) {
      // 모든 아이템이 선택된 경우, 모두 해제
      setSelectedItems(new Set());
    } else {
      // 모든 아이템 선택
      setSelectedItems(new Set(cartItems.map(item => item.kok_cart_id)));
    }
  };

  const handleSelectItem = (cartItemId) => {
    const newSelectedItems = new Set(selectedItems);
    if (newSelectedItems.has(cartItemId)) {
      newSelectedItems.delete(cartItemId);
    } else {
      newSelectedItems.add(cartItemId);
    }
    setSelectedItems(newSelectedItems);
  };

  const handleQuantityChange = async (cartItemId, newQuantity) => {
    if (newQuantity < 1) return;
    
    try {
      // API 호출 (임시로 로컬 상태만 업데이트)
      setCartItems(prev => 
        prev.map(item => 
          item.kok_cart_id === cartItemId 
            ? { ...item, kok_quantity: newQuantity }
            : item
        )
      );
    } catch (error) {
      console.error('수량 변경 실패:', error);
    }
  };

  const handleRemoveItem = async (cartItemId) => {
    try {
      // API 호출 (임시로 로컬 상태만 업데이트)
      setCartItems(prev => prev.filter(item => item.kok_cart_id !== cartItemId));
      setSelectedItems(prev => {
        const newSelected = new Set(prev);
        newSelected.delete(cartItemId);
        return newSelected;
      });
    } catch (error) {
      console.error('상품 삭제 실패:', error);
    }
  };

  const handleRemoveSelected = () => {
    const selectedIds = Array.from(selectedItems);
    setCartItems(prev => prev.filter(item => !selectedIds.includes(item.kok_cart_id)));
    setSelectedItems(new Set());
  };

  const handleOrder = () => {
    console.log('주문하기 클릭');
    navigate('/kok/payment');
  };

  const handleBuyNow = (cartItemId) => {
    console.log('구매하기 클릭:', cartItemId);
    navigate('/kok/payment');
  };

  const handleWishlist = (cartItemId) => {
    console.log('찜하기 클릭:', cartItemId);
  };

  const handleQuantityClick = (cartItemId) => {
    setSelectedCartItemId(cartItemId);
    setShowQuantityModal(true);
  };

  const handleQuantitySelect = (quantity) => {
    if (selectedCartItemId) {
      handleQuantityChange(selectedCartItemId, quantity);
    }
    setShowQuantityModal(false);
    setSelectedCartItemId(null);
  };

  const closeQuantityModal = () => {
    setShowQuantityModal(false);
    setSelectedCartItemId(null);
  };

  // 선택된 상품들의 총 금액 계산
  const selectedItemsData = cartItems.filter(item => selectedItems.has(item.kok_cart_id));
  const totalProductPrice = selectedItemsData.reduce((sum, item) => sum + (item.kok_product_price * item.kok_quantity), 0);
  const totalDiscountedPrice = selectedItemsData.reduce((sum, item) => sum + (item.kok_discounted_price * item.kok_quantity), 0);
  const totalDiscount = totalProductPrice - totalDiscountedPrice;

  if (loading) {
    return (
      <div className="cart-page">
        <CartHeader onBack={handleBack} onNotificationClick={handleNotificationClick} />
        <div className="cart-content">
          <div className="loading">장바구니를 불러오는 중...</div>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="cart-page">
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
            {/* 선택 및 액션 바 */}
            <div className="cart-action-bar">
              <div className="select-all-section">
                <label className="select-all-checkbox">
                  <input
                    type="checkbox"
                    checked={selectedItems.size === cartItems.length && cartItems.length > 0}
                    onChange={handleSelectAll}
                  />
                  <span className="checkmark"></span>
                  전체 선택
                </label>
                <span className="selection-count">
                  {selectedItems.size} | {cartItems.length}
                </span>
              </div>
              <button 
                className="delete-selected-btn"
                onClick={handleRemoveSelected}
                disabled={selectedItems.size === 0}
              >
                삭제
              </button>
            </div>

                         {/* 상품 목록 */}
             <div className="cart-items">
               {cartItems.map((item) => (
                 <div key={item.kok_cart_id} className="cart-item">
                   <div className="item-header">
                     <span className="store-name">{item.kok_store_name}</span>
                     <span className="free-shipping">무료배송</span>
                     <button 
                       className="remove-item-btn"
                       onClick={() => handleRemoveItem(item.kok_cart_id)}
                     >
                       ×
                     </button>
                   </div>
                   
                   <div className="item-content">
                     <div className="item-top-section">
                       <label className="item-checkbox">
                         <input
                           type="checkbox"
                           checked={selectedItems.has(item.kok_cart_id)}
                           onChange={() => handleSelectItem(item.kok_cart_id)}
                         />
                         <span className="checkmark"></span>
                       </label>
                       
                       <div className="item-name">{item.kok_product_name}</div>
                     </div>
                     
                     <div className="item-main-section">
                       <div className="item-image">
                         <img src={item.kok_thumbnail} alt={item.kok_product_name} />
                       </div>
                       
                       <div className="item-details">
                         <div className="item-option">옵션 : {item.kok_option}</div>
                         <div className="item-price">
                           <span className="discounted-price">{item.kok_discounted_price.toLocaleString()}원</span>
                           <span className="original-price">{item.kok_product_price.toLocaleString()}원</span>
                         </div>
                       </div>
                       
                       <div className="item-actions">
                         <div className="quantity-section">
                           <div className="quantity-control">
                             <button 
                               className="quantity-btn"
                               onClick={() => handleQuantityChange(item.kok_cart_id, item.kok_quantity - 1)}
                               disabled={item.kok_quantity <= 1}
                             >
                               ▼
                             </button>
                             <span 
                               className="quantity"
                               onClick={() => handleQuantityClick(item.kok_cart_id)}
                             >
                               {item.kok_quantity}
                             </span>
                           </div>
                           <button 
                             className="buy-now-btn"
                             onClick={() => handleBuyNow(item.kok_cart_id)}
                           >
                             구매
                           </button>
                         </div>
                         <button 
                           className="wishlist-btn"
                           onClick={() => handleWishlist(item.kok_cart_id)}
                         >
                           <img src={heartIcon} alt="찜하기" />
                         </button>
                       </div>
                     </div>
                   </div>
                 </div>
               ))}
             </div>

            {/* 레시피 추천 바 */}
            {cartItems.length >= 2 && (
              <div className="recipe-recommendation-bar">
                두 개 이상 담으셨네요! 레시피 추천드려요
              </div>
            )}

            {/* 가격 요약 */}
            <div className="price-summary">
              <div className="summary-item">
                <span>상품 금액</span>
                <span>{totalProductPrice.toLocaleString()}원</span>
              </div>
              <div className="summary-item discount">
                <span>상품 할인금액</span>
                <span>-{totalDiscount.toLocaleString()}원</span>
              </div>
              <div className="summary-item total">
                <span>총 결제예정금액 (총 {selectedItems.size}건)</span>
                <span>{totalDiscountedPrice.toLocaleString()}원</span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* 주문하기 버튼 */}
      {cartItems.length > 0 && (
        <div className="order-section">
          <button 
            className="order-btn"
            onClick={handleOrder}
            disabled={selectedItems.size === 0}
          >
            주문하기
          </button>
        </div>
      )}

             <BottomNav />

       {/* 수량 선택 모달 */}
       {showQuantityModal && (
         <div className="quantity-modal-overlay" onClick={closeQuantityModal}>
           <div className="quantity-modal" onClick={(e) => e.stopPropagation()}>
             <div className="modal-header">
               <h3>수량 선택</h3>
               <button className="close-btn" onClick={closeQuantityModal}>×</button>
             </div>
             <div className="quantity-options">
               {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((quantity) => (
                 <button
                   key={quantity}
                   className="quantity-option"
                   onClick={() => handleQuantitySelect(quantity)}
                 >
                   {quantity}개
                 </button>
               ))}
             </div>
           </div>
         </div>
       )}
     </div>
   );
 };

export default Cart;
