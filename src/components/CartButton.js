import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../pages/api';
import { ensureToken } from '../utils/authUtils';
import cartIcon from '../assets/icon-park-outline_weixin-market.png';

const CartButton = ({ 
  productId, 
  recipeId = 0, 
  quantity = 1, 
  size = '30px',
  onClick,
  className = '',
  style = {}
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleAddToCart = async () => {
    try {
      setIsLoading(true);
      
      // 토큰 확인 및 갱신
      await ensureToken();
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        alert('로그인이 필요합니다.');
        navigate('/login');
        return;
      }

      // 장바구니 추가 API 호출
      const response = await api.post('/api/kok/carts', {
        kok_product_id: productId,
        kok_quantity: quantity,
        recipe_id: recipeId
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('장바구니 추가 성공:', response.data);
      
      // 성공 메시지 표시
      alert('장바구니에 추가되었습니다!');
      
      // 클릭 이벤트가 있으면 실행
      if (onClick) {
        onClick();
      }
      
    } catch (error) {
      console.error('장바구니 추가 실패:', error);
      
      if (error.response?.status === 401) {
        alert('로그인이 필요합니다.');
        navigate('/login');
      } else if (error.response?.status === 409) {
        alert('이미 장바구니에 있는 상품입니다.');
      } else {
        alert('장바구니 추가에 실패했습니다. 다시 시도해주세요.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <img 
      src={cartIcon}
      alt="장바구니"
      className={`cart-button ${className}`}
      style={{ 
        width: size, 
        height: size, 
        cursor: isLoading ? 'not-allowed' : 'pointer',
        opacity: isLoading ? 0.6 : 1,
        transition: 'transform 0.15s ease-in-out, opacity 0.2s ease',
        ...style
      }}
      onClick={isLoading ? undefined : handleAddToCart}
      title={isLoading ? '처리 중...' : '장바구니에 추가'}
    />
  );
};

export default CartButton;
