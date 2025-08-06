import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingHeader } from '../../layout/HeaderNav';
import '../../styles/product_list_page.css';
import emptyHeartIcon from '../../assets/empty_heart.png';
import filledHeartIcon from '../../assets/filled_heart.png';

// 상품 데이터 import
import { 
  discountProducts, 
  highSellingProducts, 
  nonDuplicatedProducts 
} from '../../data/products';

const ProductListPage = () => {
  const { sectionType } = useParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [sectionTitle, setSectionTitle] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [wishlistedProducts, setWishlistedProducts] = useState(new Set());

  useEffect(() => {
    // 섹션 타입에 따라 제품 데이터와 제목 설정
    switch (sectionType) {
      case 'discount':
        setProducts(discountProducts);
        setSectionTitle('할인 특가 상품');
        break;
      case 'high-selling':
        setProducts(highSellingProducts);
        setSectionTitle('판매율 높은 상품');
        break;
      case 'reviews':
        setProducts(nonDuplicatedProducts);
        setSectionTitle('구매한 스토어 내 리뷰 많은 상품');
        break;
      default:
        setProducts([]);
        setSectionTitle('제품 목록');
    }
  }, [sectionType]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleSearch = (query) => {
    console.log('검색 실행:', query);
  };

  const handleNotificationClick = () => {
    console.log('알림 클릭');
  };

  const handleCartClick = () => {
    console.log('장바구니 클릭');
  };

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  const handleWishlistClick = (productId, event) => {
    event.stopPropagation(); // 제품 카드 클릭 이벤트 방지
    
    setWishlistedProducts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) {
        newSet.delete(productId);
        console.log('찜 해제:', productId);
      } else {
        newSet.add(productId);
        console.log('찜 추가:', productId);
      }
      return newSet;
    });

    // 애니메이션 효과를 위한 DOM 조작
    const heartButton = event.currentTarget;
    if (heartButton) {
      heartButton.style.transform = 'scale(1.2)';
      setTimeout(() => {
        heartButton.style.transform = 'scale(1)';
      }, 150);
    }
  };



  return (
    <div className="product-list-page">
      <ShoppingHeader 
        onBack={handleBack}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onSearch={handleSearch}
        onNotificationClick={handleNotificationClick}
        onCartClick={handleCartClick}
      />
      
      <div className="product-list-content">
        <div className="section-header">
          <h1 className="page-title">{sectionTitle}</h1>
          <p className="product-count">총 {products.length}개의 상품</p>
        </div>

        <div className="products-grid">
          {products.map((product) => (
            <div 
              key={product.id} 
              className="product-card"
              onClick={() => handleProductClick(product.id)}
              style={{ cursor: 'pointer' }}
            >
              <div className="product-image-container">
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="product-image"
                />
              </div>
              <div className="product-info">
                <div className="price-info">
                  <span className="discount-rate">{product.discountRate}%</span>
                  <span className="discount-price">{product.discountPrice.toLocaleString()}원</span>
                  <img 
                    src={wishlistedProducts.has(product.id) ? filledHeartIcon : emptyHeartIcon}
                    alt="찜"
                    className="heart-button"
                    style={{ 
                      width: '23px', 
                      height: '23px', 
                      marginLeft: '8px',
                      cursor: 'pointer',
                      transition: 'transform 0.15s ease-in-out'
                    }}
                    onClick={(e) => handleWishlistClick(product.id, e)}
                  />
                </div>
                <div className="product-name">{product.name}</div>
                <div className="rating-info">
                  <span className="stars">★ {product.rating.toFixed(1)}</span>
                  <span className="review-count">({product.reviewCount}개 리뷰)</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductListPage;
