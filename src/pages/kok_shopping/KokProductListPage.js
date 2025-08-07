import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingHeader } from '../../layout/HeaderNav';
import '../../styles/kok_product_list_page.css';
import emptyHeartIcon from '../../assets/empty_heart.png';
import filledHeartIcon from '../../assets/filled_heart.png';
import api from '../api';

// 상품 데이터 import
import { 
  discountProducts, 
  highSellingProducts, 
  nonDuplicatedProducts 
} from '../../data/products';

const KokProductListPage = () => {
  const { sectionType } = useParams();
  const navigate = useNavigate();
  const [kokProducts, setKokProducts] = useState([]);
  const [kokSectionTitle, setKokSectionTitle] = useState('');
  const [kokSearchQuery, setKokSearchQuery] = useState('');
  const [kokWishlistedProducts, setKokWishlistedProducts] = useState(new Set());

  // KOK API에서 할인 특가 상품 데이터를 가져오는 함수
  const fetchKokProducts = async () => {
    try {
      const response = await api.get('/api/kok/discounted');
      return response.data.products || [];
    } catch (err) {
      console.error('KOK 상품 데이터 로딩 실패:', err);
      console.log('임시 데이터를 사용합니다.');
      return discountProducts;
    }
  };

  // KOK API에서 판매율 높은 상품 데이터를 가져오는 함수
  const fetchKokTopSellingProducts = async () => {
    try {
      const response = await api.get('/api/kok/top-selling');
      return response.data.products || [];
    } catch (err) {
      console.error('KOK 판매율 높은 상품 데이터 로딩 실패:', err);
      console.log('임시 데이터를 사용합니다.');
      return highSellingProducts;
    }
  };

  // KOK API에서 구매한 스토어 내 리뷰 많은 상품 데이터를 가져오는 함수
  const fetchKokStoreBestItems = async () => {
    try {
      const response = await api.get('/api/kok/store-best-items');
      return response.data.products || [];
    } catch (err) {
      console.error('KOK 구매한 스토어 내 리뷰 많은 상품 데이터 로딩 실패:', err);
      console.log('임시 데이터를 사용합니다.');
      return nonDuplicatedProducts;
    }
  };

  useEffect(() => {
    const loadKokProducts = async () => {
      switch (sectionType) {
        case 'discount':
          const kokProducts = await fetchKokProducts();
          setKokProducts(kokProducts);
          setKokSectionTitle('할인 특가 상품');
          break;
        case 'high-selling':
          const kokTopSellingProducts = await fetchKokTopSellingProducts();
          setKokProducts(kokTopSellingProducts);
          setKokSectionTitle('판매율 높은 상품');
          break;
        case 'reviews':
          const kokStoreBestItems = await fetchKokStoreBestItems();
          setKokProducts(kokStoreBestItems);
          setKokSectionTitle('구매한 스토어 내 리뷰 많은 상품');
          break;
        default:
          setKokProducts([]);
          setKokSectionTitle('제품 목록');
      }
    };
    loadKokProducts();
  }, [sectionType]);

  const handleKokBack = () => {
    navigate(-1);
  };

  const handleKokSearch = (query) => {
    console.log('검색 실행:', query);
  };

  const handleKokNotificationClick = () => {
    console.log('알림 클릭');
  };

  const handleKokCartClick = () => {
    console.log('장바구니 클릭');
    navigate('/cart');
  };

  const handleKokProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  const handleKokWishlistClick = (productId, event) => {
    event.stopPropagation();
    setKokWishlistedProducts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) {
        newSet.delete(productId);
      } else {
        newSet.add(productId);
      }
      return newSet;
    });
  };

  return (
    <div className="kok-product-list-page">
      <ShoppingHeader 
        onBack={handleKokBack}
        searchQuery={kokSearchQuery}
        setSearchQuery={setKokSearchQuery}
        onSearch={handleKokSearch}
        onNotificationClick={handleKokNotificationClick}
        onCartClick={handleKokCartClick}
      />
      
      <div className="kok-content">
        <h1 className="kok-section-title">{kokSectionTitle}</h1>
        
        <div className="kok-products-grid">
          {kokProducts.map(product => (
            <div
              key={product.kok_product_id || product.id}
              className="kok-product-card"
              onClick={() => handleKokProductClick(product.kok_product_id || product.id)}
            >
              <div className="kok-product-image">
                <img src={product.kok_thumbnail || product.image} alt={product.kok_product_name || product.name} />
                <span className="kok-discount-rate">{product.kok_discount_rate || product.discountRate}%</span>
                <span className="kok-discount-price">{(product.kok_discounted_price || product.discountPrice).toLocaleString()}원</span>
                <img 
                  src={kokWishlistedProducts.has(product.kok_product_id || product.id) ? filledHeartIcon : emptyHeartIcon} 
                  className="kok-wishlist-icon"
                  onClick={(e) => handleKokWishlistClick(product.kok_product_id || product.id, e)} 
                />
              </div>
              <div className="kok-product-info">
                <div className="kok-product-name">{product.kok_product_name || product.name}</div>
                <div className="kok-product-rating">
                  <span className="kok-stars">★ {(product.rating || 0).toFixed(1)}</span>
                  <span className="kok-review-count">({product.reviewCount || 0}개 리뷰)</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default KokProductListPage;
