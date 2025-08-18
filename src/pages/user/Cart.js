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
  const [recipeRecommendations, setRecipeRecommendations] = useState([]); // 레시피 추천 데이터
  const [recipeLoading, setRecipeLoading] = useState(false); // 레시피 API 로딩 상태
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
        
        // 애니메이션 효과 추가
        const heartButton = document.querySelector(`[data-product-id="${productId}"]`);
        if (heartButton) {
          // 기존 애니메이션 클래스 제거
          heartButton.classList.remove('liked', 'unliked');
          
          // 현재 찜 상태 확인
          const isCurrentlyLiked = likedProducts.has(productId);
          
          // 애니메이션 클래스 추가
          if (isCurrentlyLiked) {
            // 찜 해제 애니메이션
            heartButton.classList.add('unliked');
          } else {
            // 찜 추가 애니메이션
            heartButton.classList.add('liked');
          }
          
          // 애니메이션 완료 후 클래스 제거
          setTimeout(() => {
            heartButton.classList.remove('liked', 'unliked');
          }, isCurrentlyLiked ? 400 : 600);
        }
        
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

  const handleOrder = async () => {
    if (selectedItems.size === 0) {
      alert('주문할 상품을 선택해주세요.');
      return;
    }

    try {
      // 선택된 상품들을 API 형식에 맞게 변환
      const selectedItemsForOrder = Array.from(selectedItems).map(cartId => {
        const cartItem = cartItems.find(item => item.kok_cart_id === cartId);
        return {
          cart_id: cartId,
          quantity: cartItem.kok_quantity
        };
      });

      console.log('주문 생성 시작:', selectedItemsForOrder);
      
      // 주문 생성 API 호출
      const orderResult = await cartApi.createOrder(selectedItemsForOrder);
      
      console.log('주문 생성 성공:', orderResult);
      
      // 주문 성공 시 결제 페이지로 이동
      navigate('/kok/payment', { 
        state: { 
          orderData: orderResult,
          fromCart: true 
        } 
      });
      
    } catch (error) {
      console.error('주문 생성 실패:', error);
      alert('주문 생성에 실패했습니다. 다시 시도해주세요.');
    }
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
      
      // 선택된 상품들의 상품명만 추출
      const selectedProductNames = cartItems
        .filter(item => selectedItems.has(item.kok_cart_id))
        .map(item => item.kok_product_name);
      
      // RecipeResult 페이지로 이동하면서 필요한 데이터 전달
      navigate('/recipes/result', {
        state: {
          recipes: [
            {
              recipe_id: 1,
              recipe_title: "감자닭볶음탕",
              cooking_name: "감자닭볶음탕",
              scrap_count: 128,
              cooking_case_name: "일반",
              cooking_category_name: "한식",
              cooking_introduction: "감자와 닭고기로 만드는 맛있는 볶음탕",
              number_of_serving: "2인분",
              thumbnail_url: "",
              matched_ingredient_count: 2,
              total_ingredients_count: 8,
              used_ingredients: selectedProductNames.slice(0, 2)
            },
            {
              recipe_id: 2,
              recipe_title: "김치찌개",
              cooking_name: "김치찌개",
              scrap_count: 95,
              cooking_case_name: "일반",
              cooking_category_name: "한식",
              cooking_introduction: "신김치로 만드는 얼큰한 김치찌개",
              number_of_serving: "2인분",
              thumbnail_url: "",
              matched_ingredient_count: 1,
              total_ingredients_count: 6,
              used_ingredients: selectedProductNames.slice(0, 1)
            }
          ],
          ingredients: selectedProductNames,
          total: 2,
          page: 1
        }
      });
    }, 1500);
  };

  const loadRecipeRecommendations = async () => {
    if (selectedItems.size === 0) {
      alert('레시피 추천을 받으려면 상품을 선택해주세요.');
      return;
    }

    try {
      setRecipeLoading(true);
      
      // 선택된 상품들의 cart_id 배열
      const selectedCartIds = Array.from(selectedItems);
      
      // 레시피 추천 API 호출
      const result = await cartApi.getRecipeRecommendations(selectedCartIds);
      
      setRecipeRecommendations(result.recipes || []);
      
    } catch (error) {
      console.error('레시피 추천 로딩 실패:', error);
      alert('레시피 추천을 불러오는데 실패했습니다.');
    } finally {
      setRecipeLoading(false);
    }
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
            <div className="empty-cart-icon">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 22C9.55228 22 10 21.5523 10 21C10 20.4477 9.55228 20 9 20C8.44772 20 8 20.4477 8 21C8 21.5523 8.44772 22 9 22Z" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M20 22C20.5523 22 21 21.5523 21 21C21 20.4477 20.5523 20 20 20C19.4477 20 19 20.4477 19 21C19 21.5523 19.4477 22 20 22Z" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M1 1H5L7.68 14.39C7.77144 14.8504 8.02191 15.264 8.38755 15.5583C8.75318 15.8526 9.2107 16.009 9.68 16H19.4C19.8693 16.009 20.3268 15.8526 20.6925 15.5583C21.0581 15.264 21.3086 14.8504 21.4 14.39L23 6H6" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
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
                  <span>{selectedItems.size}개의 상품을 선택하셨네요! 레시피를 추천드려요</span>
                </button>
                
                <div className={`recipe-recommendation-content ${showRecipeRecommendation ? 'show' : ''}`}>
                  {recipeLoading ? (
                    <div className="recipe-loading">레시피를 추천받는 중...</div>
                  ) : recipeRecommendations.length > 0 ? (
                    <>
                      {recipeRecommendations.map((recipe, index) => (
                        <div key={index} className="recipe-item">
                          <img 
                            src={recipe.recipe_thumbnail || test1Image} 
                            alt={recipe.cooking_name} 
                            className="recipe-thumbnail" 
                          />
                          <div className="recipe-info">
                            <h4>{recipe.cooking_name}</h4>
                            <p>조리시간: {recipe.cooking_time} | 난이도: {recipe.difficulty}</p>
                            <div className="recipe-meta">
                              <span className="recipe-tag">스크랩 {recipe.scrap_count}</span>
                              <span className="recipe-ingredients">재료 {recipe.matched_ingredient_count}개</span>
                            </div>
                          </div>
                        </div>
                      ))}
                      <div className="recipe-more">
                        <button 
                          className="recipe-more-btn"
                          onClick={() => navigate('/recipes/recommendation')}
                        >
                          더 많은 레시피 보기
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="recipe-empty">
                      선택한 상품으로 만들 수 있는 레시피가 없습니다.
                    </div>
                  )}
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
