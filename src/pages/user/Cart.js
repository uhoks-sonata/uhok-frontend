import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import HeaderNavCart from '../../layout/HeaderNavCart';
import BottomNav from '../../layout/BottomNav';
import { cartApi } from '../../api/cartApi';
import api from '../api';
import Loading from '../../components/Loading';
import '../../styles/cart.css';
import heartIcon from '../../assets/heart_empty.png';
import heartFilledIcon from '../../assets/heart_filled.png';
import test1Image from '../../assets/test/test1.png';

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [showRecipeRecommendation, setShowRecipeRecommendation] = useState(false);
  const [showQuantityModal, setShowQuantityModal] = useState(false);
  const [selectedCartItemId, setSelectedCartItemId] = useState(null);
  const [likedProducts, setLikedProducts] = useState(new Set()); // 찜한 상품 ID들을 저장
  const [isRecipeLoading, setIsRecipeLoading] = useState(false); // 레시피 추천 로딩 상태
  const navigate = useNavigate();

  useEffect(() => {
    loadCartItems();
    loadLikedProducts();
  }, []);

  // 찜한 상품 목록을 가져오는 함수
  const loadLikedProducts = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;

      const response = await api.get('/api/kok/likes', {
        params: {
          limit: 50
        },
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.data && response.data.liked_products) {
        const likedIds = new Set(response.data.liked_products.map(product => product.kok_product_id));
        setLikedProducts(likedIds);
      }
    } catch (error) {
      console.error('찜한 상품 목록 로딩 실패:', error);
    }
  };

  // 찜 토글 함수
  const handleHeartToggle = async (productId) => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        console.log('토큰이 없어서 로그인 페이지로 이동');
        window.location.href = '/';
        return;
      }

      // 찜 토글 API 호출
      const response = await api.post('/api/kok/likes/toggle', {
        kok_product_id: productId
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('찜 토글 응답:', response.data);

      // 찜 토글 성공 후 하트 아이콘만 즉시 변경
      if (response.data) {
        console.log('찜 토글 성공! 하트 아이콘 상태만 변경합니다.');
        
        // 하트 아이콘 상태만 토글 (즉시 피드백)
        setLikedProducts(prev => {
          const newSet = new Set(prev);
          if (newSet.has(productId)) {
            // 찜 해제된 상태에서 찜 추가
            newSet.delete(productId);
            console.log('찜이 추가되었습니다. 채워진 하트로 변경됩니다.');
          } else {
            // 찜된 상태에서 찜 해제
            newSet.add(productId);
            console.log('찜이 해제되었습니다. 빈 하트로 변경됩니다.');
          }
          return newSet;
        });
        
        // 애니메이션 효과 추가
        const heartButton = document.querySelector(`[data-product-id="${productId}"]`);
        if (heartButton) {
          heartButton.style.transform = 'scale(1.2)';
          setTimeout(() => {
            heartButton.style.transform = 'scale(1)';
          }, 150);
        }
      }
    } catch (error) {
      console.error('찜 토글 실패:', error);
      
      // 401 에러 (인증 실패) 시 로그인 페이지로 이동
      if (error.response?.status === 401) {
        alert('로그인이 필요합니다.');
        window.location.href = '/';
        return;
      }
      
      // 다른 에러의 경우 사용자에게 알림
      alert('찜 상태 변경에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const loadCartItems = async () => {
    try {
      setLoading(true);
      
      // 실제 API 호출
      const response = await cartApi.getCartItems();
      const items = response.cart_items || [];
      
      setCartItems(items);
      // 모든 아이템을 기본적으로 선택
      setSelectedItems(new Set(items.map(item => item.kok_cart_id)));
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
    if (newQuantity < 1 || newQuantity > 10) return;
    
    try {
      // API 호출
      await cartApi.updateCartItemQuantity(cartItemId, newQuantity);
      
      // 성공 시 로컬 상태 업데이트
      setCartItems(prev => 
        prev.map(item => 
          item.kok_cart_id === cartItemId 
            ? { ...item, kok_quantity: newQuantity }
            : item
        )
      );
    } catch (error) {
      console.error('수량 변경 실패:', error);
      // 에러 처리 (사용자에게 알림 등)
    }
  };

  const handleRemoveItem = async (cartItemId) => {
    try {
      // API 호출
      await cartApi.removeFromCart(cartItemId);
      
      // 성공 시 로컬 상태 업데이트
      setCartItems(prev => prev.filter(item => item.kok_cart_id !== cartItemId));
      setSelectedItems(prev => {
        const newSelected = new Set(prev);
        newSelected.delete(cartItemId);
        return newSelected;
      });
    } catch (error) {
      console.error('상품 삭제 실패:', error);
      // 에러 처리 (사용자에게 알림 등)
    }
  };

  const handleRemoveSelected = async () => {
    const selectedIds = Array.from(selectedItems);
    
    try {
      // 선택된 모든 상품 삭제
      await Promise.all(selectedIds.map(id => cartApi.removeFromCart(id)));
      
      // 성공 시 로컬 상태 업데이트
      setCartItems(prev => prev.filter(item => !selectedIds.includes(item.kok_cart_id)));
      setSelectedItems(new Set());
    } catch (error) {
      console.error('선택된 상품 삭제 실패:', error);
      // 에러 처리 (사용자에게 알림 등)
    }
  };

  const handleOrder = () => {
    console.log('주문하기 클릭');
    navigate('/kok/payment');
  };

  const handleBuyNow = (cartItemId) => {
    console.log('구매하기 클릭:', cartItemId);
    navigate('/kok/payment');
  };

  const toggleRecipeRecommendation = () => {
    setIsRecipeLoading(true);
    
    // 1.5초 후 RecipeResult 페이지로 이동
    setTimeout(() => {
      setIsRecipeLoading(false);
      navigate('/recipes/result');
    }, 1500);
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
        {/* 장바구니 헤더 네비게이션 */}
        <HeaderNavCart 
          onBackClick={handleBack}
          onNotificationClick={handleNotificationClick}
        />
        <div className="cart-content">
          <div className="loading">장바구니를 불러오는 중...</div>
        </div>
        <BottomNav />
      </div>
    );
  }

  // 레시피 추천 로딩 중일 때 전체 화면 로딩 표시
  if (isRecipeLoading) {
    return (
      <div className="cart-page">
        <HeaderNavCart 
          onBackClick={handleBack}
          onNotificationClick={handleNotificationClick}
        />
        <div className="cart-content">
          <Loading 
            message="레시피를 추천하고 있어요..." 
            containerStyle={{ 
              height: '60vh',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          />
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="cart-page">
      {/* 장바구니 헤더 네비게이션 */}
      <HeaderNavCart 
        onBackClick={handleBack}
        onNotificationClick={handleNotificationClick}
      />
      
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
                        <img src={item.kok_thumbnail || test1Image} alt={item.kok_product_name} />
                      </div>
                      
                      <div className="item-details">
                        <div className="item-option">
                          {item.recipe_id ? `레시피 ID: ${item.recipe_id}` : '옵션 없음'}
                          <span className="separator"> | </span>
                          <span className="free-shipping-text">무료배송</span>
                        </div>
                        <div className="item-price">
                          <span className="discounted-price">{item.kok_discounted_price.toLocaleString()}원</span>
                          <span className="original-price">{item.kok_product_price.toLocaleString()}원</span>
                        </div>
                      </div>
                      
                    </div>
                    
                    <div className="item-divider"></div>
                    
                    <div className="item-bottom-actions">
                      <div className="quantity-section">
                        <div className="quantity-control">
                          <button 
                            className="quantity-btn"
                            onClick={() => handleQuantityChange(item.kok_cart_id, item.kok_quantity - 1)}
                            disabled={item.kok_quantity <= 1}
                          >
                            ▼
                          </button>
                          <span className="quantity">
                            {item.kok_quantity}
                          </span>
                          <button 
                            className="quantity-btn"
                            onClick={() => handleQuantityChange(item.kok_cart_id, item.kok_quantity + 1)}
                            disabled={item.kok_quantity >= 10}
                          >
                            ▲
                          </button>
                        </div>
                      </div>
                      
                      <button 
                        className="wishlist-btn"
                        onClick={() => handleHeartToggle(item.kok_product_id)}
                        data-product-id={item.kok_product_id}
                      >
                        <img 
                          src={likedProducts.has(item.kok_product_id) ? heartFilledIcon : heartIcon} 
                          alt="찜하기" 
                        />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* 레시피 추천 바 */}
            {cartItems.length >= 1 && (
              <div className="recipe-recommendation-section">
                <button 
                  className="recipe-recommendation-btn"
                  onClick={toggleRecipeRecommendation}
                >
                  <span>상품을 담으셨네요! 레시피 추천드려요</span>
                  <span className="arrow">
                    ▼
                  </span>
                </button>
                
                <div className={`recipe-recommendation-content ${showRecipeRecommendation ? 'show' : ''}`}>
                  <div className="recipe-item">
                    <img src={test1Image} alt="레시피 추천" className="recipe-thumbnail" />
                    <div className="recipe-info">
                      <h4>감자닭볶음탕</h4>
                      <p>감자와 닭고기로 만드는 매콤한 요리</p>
                      <span className="recipe-tag">한식</span>
                    </div>
                  </div>
                  <div className="recipe-item">
                    <img src={test1Image} alt="레시피 추천" className="recipe-thumbnail" />
                    <div className="recipe-info">
                      <h4>된장찌개</h4>
                      <p>구수한 된장으로 만드는 건강한 찌개</p>
                      <span className="recipe-tag">한식</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 가격 요약 */}
            <div className="price-summary">
              <div className="summary-item">
                <span>상품 금액</span>
                <span>{totalProductPrice.toLocaleString()}원</span>
              </div>
              <div className="summary-item discount">
                <span>상품 할인 금액</span>
                <span>-{totalDiscount.toLocaleString()}원</span>
              </div>
              <div className="summary-item shipping">
                <span>배송비</span>
                <span>0원</span>
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
