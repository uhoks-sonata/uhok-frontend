import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/recommend_recipe.css';
import { RecipeHeader, HomeShoppingHeader, ShoppingHeader, SearchHeader, NotificationHeader, BackTitleHeader, OrderHistoryHeader, MyPageWithBackHeader, RecipeDetailHeader, useNotifications } from '../../layout/HeaderNav';
import NotificationManager from '../../components/NotificationManagerTest';

const RecommendRecipe = () => {
  const [fadeIn, setFadeIn] = useState(false);
  const [activeView, setActiveView] = useState('main'); // 'main', 'ingredients', 'recipe'
  const [searchQuery, setSearchQuery] = useState('');
  const [ingredientsList, setIngredientsList] = useState([]);
  const [recipeList, setRecipeList] = useState([]);
  const [loading, setLoading] = useState(false);
  // 버튼 클릭 상태 관리
  const [ingredientsClicked, setIngredientsClicked] = useState(false);
  const [recipeClicked, setRecipeClicked] = useState(false);
  const [searchClicked, setSearchClicked] = useState(false);
  const [notificationClicked, setNotificationClicked] = useState(false);
  const { notificationCount, cartCount, addNotification, clearNotifications, addToCart, clearCart } = useNotifications();

  const navigate = useNavigate();

  useEffect(() => {
    setFadeIn(true);
  }, []);

  // 재고소진 버튼 클릭 핸들러
  const handleIngredientsClick = async () => {
    setIngredientsClicked(true);
    console.log('재료 소진 버튼이 클릭되었습니다!');
    // 3초 후 상태 초기화
    setTimeout(() => setIngredientsClicked(false), 3000);
    
    setActiveView('ingredients');
    setLoading(true);
    
    try {
      // API 호출 시뮬레이션 (실제 API로 교체 필요)
      const mockIngredients = [
        { id: 1, name: '양파', quantity: '0개', lastUsed: '2024-01-15' },
        { id: 2, name: '감자', quantity: '0개', lastUsed: '2024-01-14' },
        { id: 3, name: '당근', quantity: '0개', lastUsed: '2024-01-13' },
        { id: 4, name: '계란', quantity: '0개', lastUsed: '2024-01-12' },
        { id: 5, name: '우유', quantity: '0ml', lastUsed: '2024-01-11' }
      ];
      
      setIngredientsList(mockIngredients);
    } catch (error) {
      console.error('재료 목록 로딩 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  // 레시피 추천 버튼 클릭 핸들러
  const handleRecipeClick = async () => {
    setRecipeClicked(true);
    console.log('레시피 추천 버튼이 클릭되었습니다!');
    // 3초 후 상태 초기화
    setTimeout(() => setRecipeClicked(false), 3000);
    
    setActiveView('recipe');
    setLoading(true);
    
    try {
      // API 호출 시뮬레이션 (실제 API로 교체 필요)
      const mockRecipes = [
        { 
          id: 1, 
          title: '김치찌개', 
          difficulty: '초급',
          time: '30분',
          ingredients: ['김치', '돼지고기', '두부'],
          image: '/recipe1.jpg'
        },
        { 
          id: 2, 
          title: '된장찌개', 
          difficulty: '초급',
          time: '25분',
          ingredients: ['된장', '두부', '애호박'],
          image: '/recipe2.jpg'
        },
        { 
          id: 3, 
          title: '계란볶음밥', 
          difficulty: '초급',
          time: '15분',
          ingredients: ['밥', '계란', '대파'],
          image: '/recipe3.jpg'
        }
      ];
      
      setRecipeList(mockRecipes);
    } catch (error) {
      console.error('레시피 목록 로딩 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  // 뒤로가기 핸들러
  const handleBackClick = () => {
    setActiveView('main');
    setIngredientsList([]);
    setRecipeList([]);
  };

  // 검색 핸들러 (기존)
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchClicked(true);
    console.log('검색 버튼이 클릭되었습니다!');
    console.log('검색어:', searchQuery);
    // 3초 후 상태 초기화
    setTimeout(() => setSearchClicked(false), 3000);
    // 검색 로직 구현
  };

  // 홈쇼핑 헤더 검색 핸들러
  const handleHomeShoppingSearch = (query) => {
    console.log('홈쇼핑 검색어:', query);
    // 홈쇼핑 검색 로직 구현
  };

  // 홈쇼핑 헤더 알림 핸들러
  const handleHomeShoppingNotification = () => {
    setNotificationClicked(true);
    console.log('알림 버튼이 클릭되었습니다!');
    // 3초 후 상태 초기화
    setTimeout(() => setNotificationClicked(false), 3000);
    // 홈쇼핑 알림창 인터페이스 전환 로직
  };



  // 검색 헤더 핸들러들
  const handleSearchBack = () => {
    // 메인 화면에서는 뒤로가기 시 이전 페이지로 이동
    if (activeView === 'main') {
      navigate('/main');
    } else {
      setActiveView('main');
    }
  };

  const handleSearchQuery = (query) => {
    console.log('검색어:', query);
    // 검색 로직 구현
  };

  // 메인 화면 렌더링
  const renderMainView = () => (
    <div className="main-content">
      <div className="search-section">
        <div className="search-bar">
          <input
            type="text"
            placeholder="상품 검색"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearchSubmit(e)}
          />
          <button onClick={handleSearchSubmit}>🔍</button>
        </div>
      </div>
      
      <div className="action-buttons">
        <button 
          className="ingredients-btn"
          onClick={handleIngredientsClick}
        >
          <span className="icon">📦</span>
          <span className="text">재료 소진</span>
        </button>
        
        <button 
          className="recipe-btn"
          onClick={handleRecipeClick}
        >
          <span className="icon">👨‍🍳</span>
          <span className="text">레시피 추천</span>
        </button>
      </div>
      
      <div className="content-area">
        <NotificationManager />
      </div>
      
      {/* 테스트 결과 표시 */}
      <div style={{ marginTop: '20px', padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
        <h3>테스트 결과:</h3>
        <p>재료 소진 버튼 클릭: {ingredientsClicked ? '✅ 클릭됨' : '❌ 클릭되지 않음'}</p>
        <p>레시피 추천 버튼 클릭: {recipeClicked ? '✅ 클릭됨' : '❌ 클릭되지 않음'}</p>
        <p>검색 버튼 클릭: {searchClicked ? '✅ 클릭됨' : '❌ 클릭되지 않음'}</p>
        <p>알림 버튼 클릭: {notificationClicked ? '✅ 클릭됨' : '❌ 클릭되지 않음'}</p>
        
        <div style={{ marginTop: '20px' }}>
          <h4>사용법:</h4>
          <ul>
            <li>위의 "재료 소진" 버튼을 클릭해보세요</li>
            <li>위의 "레시피 추천" 버튼을 클릭해보세요</li>
            <li>검색창에서 검색 버튼을 클릭해보세요</li>
            <li>헤더의 알림 아이콘을 클릭해보세요</li>
            <li>콘솔에서 로그를 확인하세요</li>
          </ul>
        </div>
      </div>
    </div>
  );

  // 재료 소진 화면 렌더링
  const renderIngredientsView = () => (
    <div className="ingredients-content">
      <div className="header">
        <button className="back-btn" onClick={handleBackClick}>←</button>
        <h2>재료 소진 목록</h2>
      </div>
      
      {loading ? (
        <div className="loading">로딩 중...</div>
      ) : (
        <div className="ingredients-list">
          {ingredientsList.map((item) => (
            <div key={item.id} className="ingredient-item">
              <div className="ingredient-info">
                <h3>{item.name}</h3>
                <p>수량: {item.quantity}</p>
                <p>마지막 사용: {item.lastUsed}</p>
              </div>
              <button className="add-to-cart-btn">장바구니 추가</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // 레시피 추천 화면 렌더링
  const renderRecipeView = () => (
    <div className="recipe-content">
      <div className="header">
        <button className="back-btn" onClick={handleBackClick}>←</button>
        <h2>레시피 추천</h2>
      </div>
      
      {loading ? (
        <div className="loading">로딩 중...</div>
      ) : (
        <div className="recipe-list">
          {recipeList.map((recipe) => (
            <div key={recipe.id} className="recipe-item">
              <div className="recipe-image">
                <img src={recipe.image} alt={recipe.title} />
              </div>
              <div className="recipe-info">
                <h3>{recipe.title}</h3>
                <div className="recipe-meta">
                  <span>난이도: {recipe.difficulty}</span>
                  <span>시간: {recipe.time}</span>
                </div>
                <div className="recipe-ingredients">
                  <p>필요 재료: {recipe.ingredients.join(', ')}</p>
                </div>
              </div>
              <button className="view-recipe-btn">레시피 보기</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className={`main-page ${fadeIn ? 'fade-in' : ''}`}>
      {/* 테스트용: 새로운 범용 헤더들 테스트 */}
      {/* 주문내역 헤더 테스트 */}
      <OrderHistoryHeader 
        onBack={handleSearchBack}
        onNotificationClick={() => console.log('주문내역 알림 클릭')}
        onCartClick={() => console.log('주문내역 장바구니 클릭')}
      />

      <div className="main-container">
        {activeView === 'main' && renderMainView()}
        {activeView === 'ingredients' && renderIngredientsView()}
        {activeView === 'recipe' && renderRecipeView()}
      </div>

      {/* 하단 네비게이션 제거 - 순수 헤더 테스트용 */}
    </div>
  );
};

export default RecommendRecipe; 