// React와 필요한 훅들을 가져옵니다
import React, { useState, useEffect } from 'react';
// 상단 네비게이션 컴포넌트를 가져옵니다
import HeaderNavMypage from '../../layout/HeaderNavMypage';
// 하단 네비게이션 컴포넌트를 가져옵니다
import BottomNav from '../../layout/BottomNav';
// 로딩 컴포넌트를 가져옵니다
import Loading from '../../components/Loading';
// 마이페이지 스타일을 가져옵니다
import '../../styles/mypage.css';
import '../../styles/logout.css';
// userApi import
import { userApi } from '../../api/userApi';
// orderApi import
import { orderApi } from '../../api/orderApi';
// 사용자 Context import
import { useUser } from '../../contexts/UserContext';
// 기본 사용자 아이콘 이미지를 가져옵니다
import userIcon from '../../assets/user_icon.png';
// 상품 없음 이미지를 가져옵니다
import noItemsIcon from '../../assets/no_items.png';

// 테스트용 상품 이미지들을 가져옵니다
import testImage1 from '../../assets/test/test1.png';
import testImage2 from '../../assets/test/test2.png';

// 마이페이지 메인 컴포넌트를 정의합니다
const MyPage = () => {
  // 사용자 정보 가져오기
  const { user, isLoggedIn } = useUser();
  
  // 유저 정보를 저장할 상태를 초기화합니다 (API에서 받아옴)
  const [userData, setUserData] = useState({
    user_id: null, // 유저 ID (API에서 받아옴)
    username: '', // 유저 이름 (API에서 받아옴)
    email: '', // 유저 이메일 (API에서 받아옴)
    created_at: '', // 계정 생성일 (API에서 받아옴)
    orderCount: 0, // 주문 내역 개수 (API에서 받아옴)
    recentOrders: [] // 최근 주문 목록 (API에서 받아옴)
  });

  // 레시피 추천 데이터를 저장할 상태를 초기화합니다 (API에서 받아옴)
  const [recipeData, setRecipeData] = useState({
    purchasedRecipe: null, // 구매한 레시피 정보 (API에서 받아옴)
    similarRecipes: [] // 유사한 레시피 목록 (API에서 받아옴)
  });

  // 데이터 로딩 상태를 관리합니다 (true: 로딩 중, false: 로딩 완료)
  const [loading, setLoading] = useState(true);
  // 에러 상태를 관리합니다 (null: 에러 없음, string: 에러 메시지)
  const [error, setError] = useState(null);

  // 가격을 원화 형식으로 포맷팅하는 함수를 정의합니다
  const formatPrice = (price) => {
    return price.toLocaleString('ko-KR') + '원';
  };

  // 임시 데이터를 설정하는 함수
  const setMockData = () => {
    console.log('임시 데이터를 사용합니다.');
    setUserData({
      user_id: 101,
      username: '홍길동',
      email: 'user@example.com',
      created_at: '2025-08-01T02:24:19.206Z',
      orderCount: 3,
      recentOrders: [
        {
          order_id: 20230701,
          brand_name: "산지명인",
          product_name: "구운계란 30구+핑크솔트 증정",
          product_description: "반숙란 훈제 맥반석 삶은 구운란",
          product_price: 11900,
          product_quantity: 1,
          product_image: testImage1,
          order_date: "2025-07-25"
        },
        {
          order_id: 20230701,
          brand_name: "오리온",
          product_name: "초코파이 12개입",
          product_description: "부드러운 초콜릿과 마시멜로우가 듬뿍",
          product_price: 8500,
          product_quantity: 1,
          product_image: testImage2,
          order_date: "2025-07-25"
        },
        {
          order_id: 20230702,
          brand_name: "농심",
          product_name: "새우깡",
          product_description: "새우깡",
          product_price: 1500,
          product_quantity: 2,
          product_image: testImage1,
          order_date: "2025-07-24"
        }
      ]
    });

    setRecipeData({
      purchasedRecipe: null,
      similarRecipes: []
    });
  };

  // 백엔드 API에서 마이페이지 데이터를 가져오는 useEffect를 정의합니다
  useEffect(() => {
    // 비동기 함수로 마이페이지 데이터를 가져옵니다
    const fetchMyPageData = async () => {
      try {
        // 로딩 상태를 true로 설정합니다
        setLoading(true);
        setError(null); // 에러 상태 초기화
        
        console.log('마이페이지 데이터 로딩 시작...');
        
        // 모든 API 호출을 개별적으로 처리하여 하나가 실패해도 다른 것은 계속 진행
        let userData = null;
        let ordersData = { orders: [] };
        let orderCount = 0;
        let recipeData = { purchasedRecipe: null, similarRecipes: [] };
        
        // 사용자 정보 조회 (API 명세서에 맞춘 처리)
        try {
          console.log('사용자 정보 조회 중...');
          const userResponse = await userApi.getProfile();
          userData = userResponse;
          console.log('사용자 정보 조회 성공:', userData);
        } catch (err) {
          console.error('사용자 정보 조회 실패:', err);
          // 에러 발생 시 임시 데이터 사용
          setMockData();
          setLoading(false);
          return;
        }
        
        // 최근 주문 조회 (실제 API 호출)
        try {
          console.log('최근 주문 조회 중...');
          const recentOrdersResponse = await orderApi.getRecentOrders(7);
          ordersData = recentOrdersResponse;
          console.log('최근 주문 조회 성공:', ordersData);
        } catch (err) {
          console.error('최근 주문 조회 실패:', err);
          if (err.response?.status === 401) {
            console.log('401 에러 - 로그인이 필요합니다.');
          }
          ordersData = { orders: [] };
        }
        
        // 주문 개수 조회 (실제 API 호출)
        try {
          console.log('주문 개수 조회 중...');
          const orderCountResponse = await orderApi.getOrderCount();
          orderCount = orderCountResponse.order_count || 0;
          console.log('주문 개수 조회 성공:', orderCount);
        } catch (err) {
          console.error('주문 개수 조회 실패:', err);
          if (err.response?.status === 401) {
            console.log('401 에러 - 로그인이 필요합니다.');
          } else if (err.response?.status === 404) {
            console.log('404 에러 - 주문 개수 API 엔드포인트가 존재하지 않습니다.');
          }
          orderCount = 0;
        }
        
        // 레시피 정보 조회 (현재는 임시 데이터 사용)
        try {
          console.log('레시피 정보 조회 중...');
          // TODO: 레시피 API 구현 시 실제 API 호출로 교체
          recipeData = { purchasedRecipe: null, similarRecipes: [] };
          console.log('레시피 정보 조회 성공:', recipeData);
        } catch (err) {
          console.error('레시피 정보 조회 실패:', err);
          // 422 에러나 다른 에러가 발생해도 기본값으로 설정
          recipeData = { purchasedRecipe: null, similarRecipes: [] };
        }
        
        // 파싱된 데이터를 상태에 저장합니다
        setUserData({
          user_id: userData.user_id,
          username: userData.username,
          email: userData.email,
          created_at: userData.created_at,
          orderCount: orderCount,
          recentOrders: ordersData || []
        });
        
        setRecipeData(recipeData);
        console.log('마이페이지 데이터 로딩 완료');
        
      } catch (err) {
        // 예상치 못한 에러가 발생한 경우
        console.error('마이페이지 데이터 로딩 중 예상치 못한 에러:', err);
        setMockData();
      } finally {
        // try-catch 블록이 끝나면 항상 로딩 상태를 false로 설정합니다
        setLoading(false);
      }
    };

    // 컴포넌트가 마운트될 때 데이터를 가져오는 함수를 실행합니다
    fetchMyPageData();
  }, []); // 빈 배열을 의존성으로 설정하여 컴포넌트 마운트 시에만 실행됩니다

  // 주문 내역 클릭 시 실행되는 핸들러 함수를 정의합니다
  const handleOrderHistoryClick = async () => {
    try {
      console.log('주문 내역 클릭');
      
      // 로그인 상태 확인
      const accessToken = localStorage.getItem('access_token');
      if (!accessToken) {
        console.log('로그인되지 않은 상태에서 주문내역 페이지로 이동');
        // 로그인되지 않아도 주문내역 페이지로 이동 (더미 데이터 표시)
      } else {
        console.log('로그인된 상태에서 주문내역 페이지로 이동');
      }
      
      // 주문 내역 페이지로 이동합니다
      window.location.href = '/orderlist';
    } catch (error) {
      console.error('주문 내역 클릭 에러:', error);
      // 에러가 발생해도 페이지 이동은 계속 진행
      window.location.href = '/orderlist';
    }
  };

  // 레시피 클릭 시 실행되는 핸들러 함수를 정의합니다
  const handleRecipeClick = async (recipeId) => {
    try {
      console.log('레시피 클릭:', recipeId);
      
      // TODO: 레시피 상세 정보 조회 API 구현 시 실제 API 호출로 교체
      console.log('레시피 상세 정보 조회 기능은 추후 구현 예정입니다.');
      
      // 레시피 상세 페이지로 이동하는 기능을 구현할 예정입니다
      // window.location.href = `/recipe-detail/${recipeId}`;
    } catch (error) {
      console.error('레시피 클릭 에러:', error);
    }
  };

  // 알림 클릭 시 실행되는 핸들러 함수를 정의합니다
  const handleNotificationClick = () => {
    console.log('알림 클릭');
    window.location.href = '/notifications';
  };

  // 장바구니 클릭 시 실행되는 핸들러 함수를 정의합니다
  const handleCartClick = () => {
    console.log('장바구니 클릭');
    window.location.href = '/cart';
  };

  // 로그아웃 핸들러 함수를 정의합니다
  const handleLogout = async () => {
    try {
      console.log('로그아웃 시작');
      
      // 현재 access token 가져오기
      const accessToken = localStorage.getItem('access_token');
      if (!accessToken) {
        console.log('토큰이 없어서 바로 홈페이지로 이동');
        window.location.href = '/';
        return;
      }

      // 백엔드 로그아웃 API 호출 (API 명세서에 맞춘 처리)
      const response = await userApi.logout();

      console.log('로그아웃 API 응답:', response);
      
      // 로컬 스토리지에서 토큰 제거 (userApi에서 이미 처리됨)
      
      // 성공 메시지 표시 (선택사항)
      alert('로그아웃이 완료되었습니다.');
      
      // 홈페이지로 이동
      window.location.href = '/';
      
    } catch (error) {
      console.error('로그아웃 실패:', error);
      
      // API 호출 실패 시에도 로컬 토큰은 제거
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      
      // 에러 메시지 표시
      alert('로그아웃 중 오류가 발생했습니다. 다시 시도해주세요.');
      
      // 홈페이지로 이동
      window.location.href = '/';
    }
  };

  // 로딩 중일 때 표시할 UI를 렌더링합니다
  if (loading) {
    return (
      <div className="mypage-page">
        {/* 마이페이지 헤더 네비게이션 */}
        <HeaderNavMypage 
          onBackClick={() => window.history.back()}
          onNotificationClick={handleNotificationClick}
          onCartClick={handleCartClick}
        />
        {/* 메인 콘텐츠 영역 */}
        <div className="mypage-content">
          <Loading message="마이페이지를 불러오는 중 ..." />
        </div>
        {/* 하단 네비게이션을 렌더링합니다 */}
        <BottomNav />
      </div>
    );
  }

  // 정상적인 마이페이지를 렌더링합니다
  return (
    <div className="mypage-page">
              {/* 마이페이지 헤더 네비게이션 */}
        <HeaderNavMypage 
          onBackClick={() => window.history.back()}
          onNotificationClick={handleNotificationClick}
          onCartClick={handleCartClick}
        />
      {/* 메인 콘텐츠 */}
      <div className="mypage-content">
        {/* 유저 정보 카드 */}
        <div className="user-info-card">
          {/* 사용자 정보 컨텐츠 */}
          <div className="user-info-content">
            {/* 프로필 이미지 - 기본 사용자 아이콘 사용 */}
            <div className="profile-image">
              <img src={userIcon} alt="프로필" />
            </div>
            
            {/* 유저 정보 */}
            <div className="user-details">
              {/* 유저 이름을 표시합니다 (API에서 받아옴) */}
              <div className="user-name">{userData.username} 님</div>
              {/* 유저 이메일을 표시합니다 (API에서 받아옴) */}
              <div className="user-email">{userData.email}</div>
            </div>
            
            {/* 로그아웃 버튼 */}
            <div className="logout-container">
              <button className="logout-button" onClick={handleLogout}>
                로그아웃
              </button>
            </div>
          </div>
          
          {/* 주문 내역 링크 */}
          <div className="order-history-link" onClick={handleOrderHistoryClick}>
            <span className="order-history-text">주문 내역</span>
            <span className="order-count">{userData.orderCount} &gt;</span>
          </div>
        </div>

        {/* 최근 주문 섹션 */}
        <div className="recent-orders-section">
          {/* 섹션 제목 */}
          <h3 className="section-title">최근 7일 동안 주문한 상품</h3>
          
          {/* 주문이 있을 때와 없을 때를 구분하여 렌더링합니다 */}
          {userData.recentOrders && userData.recentOrders.length > 0 ? (
            // 주문번호별로 그룹화하여 렌더링합니다
            (() => {
              // 주문번호별로 상품들을 그룹화합니다
              const groupedOrders = userData.recentOrders.reduce((groups, order) => {
                if (!groups[order.order_id]) {
                  groups[order.order_id] = [];
                }
                groups[order.order_id].push(order);
                return groups;
              }, {});
              
              // 그룹화된 주문들을 렌더링합니다
              return Object.entries(groupedOrders).map(([orderId, orders]) => {
                const firstOrder = orders[0]; // 첫 번째 상품의 정보를 사용
                
                              return (
                <div key={orderId} className="mypage-order-item">
                  {/* 주문 정보 헤더 */}
                  <div className="mypage-order-header">
                    {/* 주문 날짜를 표시합니다 (API에서 받아옴) */}
                    <span className="mypage-order-date">{firstOrder.order_date}</span>
                    {/* 주문번호를 표시합니다 (API에서 받아옴) */}
                    <span className="mypage-order-number">주문번호 {orderId}</span>
                  </div>
                    
                    {/* 배송 상태 카드 */}
                    <div className="delivery-status-card">
                      {/* 배송 상태를 표시합니다 (API에서 받아옴) */}
                      <div className="delivery-status">
                        <span className="delivery-status-text">배송완료</span>
                        <span className="delivery-date">{firstOrder.order_date} 도착</span>
                      </div>
                      
                                             {/* 상품 정보들 - 같은 주문번호의 모든 상품을 표시합니다 */}
                       {(() => {
                         const allItems = [];
                         
                         // kok_orders 처리
                         if (orders[0].kok_orders && orders[0].kok_orders.length > 0) {
                           orders[0].kok_orders.forEach((kokOrder, index) => {
                             allItems.push({
                               type: 'kok',
                               product_id: kokOrder.kok_product_id,
                               product_name: `콕 상품 ${kokOrder.kok_product_id}`,
                               product_description: '콕 상품입니다',
                               product_price: kokOrder.order_price,
                               product_quantity: kokOrder.quantity,
                               product_image: testImage1
                             });
                           });
                         }
                         
                         // homeshopping_orders 처리
                         if (orders[0].homeshopping_orders && orders[0].homeshopping_orders.length > 0) {
                           orders[0].homeshopping_orders.forEach((homeOrder, index) => {
                             allItems.push({
                               type: 'homeshopping',
                               product_id: homeOrder.product_id,
                               product_name: `홈쇼핑 상품 ${homeOrder.product_id}`,
                               product_description: '홈쇼핑 상품입니다',
                               product_price: homeOrder.order_price,
                               product_quantity: homeOrder.quantity,
                               product_image: testImage2
                             });
                           });
                         }
                         
                         return allItems.map((item, index) => (
                           <div key={`${orderId}-${index}`} className="mypage-product-info">
                             {/* 상품 이미지를 표시합니다 */}
                             <div className="mypage-product-image">
                               <img src={item.product_image} alt={item.product_name} />
                             </div>
                             
                             {/* 상품 상세 정보 */}
                             <div className="mypage-product-details">
                               {/* 상품명을 표시합니다 */}
                               <div className="mypage-product-name" title={item.product_name}>
                                 {item.product_name.length > 20 
                                   ? `${item.product_name.substring(0, 20)}...`
                                   : item.product_name
                                 }
                               </div>
                               {/* 상품 설명을 표시합니다 */}
                               <div className="mypage-product-description" title={item.product_description}>
                                 {item.product_description.length > 20 
                                   ? `${item.product_description.substring(0, 20)}...`
                                   : item.product_description
                                 }
                               </div>
                               {/* 가격과 수량을 표시합니다 */}
                               <div className="mypage-product-price">{formatPrice(item.product_price)} · {item.product_quantity}개</div>
                             </div>
                           </div>
                         ));
                       })()}
                      
                      {/* 레시피 관련 버튼들 */}
                      <div className="recipe-buttons">
                        {/* 레시피 구매 버튼 */}
                        <div className="recipe-purchase-btn">
                          이 레시피를 보고 상품을 구매하셨어요!
                        </div>
                        {/* 레시피 추천 버튼 */}
                        <div className="recipe-recommend-btn">
                          구매 재료들로 만들 수 있는 다른 레시피 추천받기
                        </div>
                      </div>
                    </div>
                  </div>
                );
              });
            })()
          ) : (
            // 주문이 없을 때의 UI - no_items 이미지 사용
            <div className="no-orders-state">
              {/* 주문 없음 일러스트레이션 */}
              <div className="no-orders-illustration">
                <img src={noItemsIcon} alt="상품 없음" className="no-items-image" />
              </div>
              {/* 주문 없음 메시지 */}
              <div className="no-orders-message">최근 주문한 상품이 없어요</div>
            </div>
          )}
        </div>

        {/* 구매한 레시피 섹션 - 주문이 있을 때만 표시 */}
        {recipeData.purchasedRecipe && (
          <div className="purchased-recipe-section">
            {/* 섹션 제목 */}
            <h3 className="section-title">이 레시피를 보고 상품을 구매하셨어요!</h3>
            
            {/* 구매한 레시피 카드 */}
            <div className="recipe-card" onClick={() => handleRecipeClick(recipeData.purchasedRecipe.id)}>
              {/* 레시피 이미지를 표시합니다 (API에서 받아옴) */}
              <div className="recipe-image">
                <img src={recipeData.purchasedRecipe.image} alt={recipeData.purchasedRecipe.name} />
              </div>
              
              {/* 레시피 정보 */}
              <div className="recipe-info">
                {/* 레시피명을 표시합니다 (API에서 받아옴) */}
                <div className="recipe-name">{recipeData.purchasedRecipe.name}</div>
                
                {/* 평점과 스크랩 정보를 표시합니다 (API에서 받아옴) */}
                <div className="recipe-stats">
                  ★{recipeData.purchasedRecipe.rating} ({recipeData.purchasedRecipe.reviewCount}) 스크랩 {recipeData.purchasedRecipe.scrapCount}
                </div>
                
                {/* 레시피 설명을 표시합니다 (API에서 받아옴) */}
                <div className="recipe-description">{recipeData.purchasedRecipe.description}</div>
                
                {/* 재료 정보를 표시합니다 (API에서 받아옴) */}
                <div className="ingredient-info">
                  {recipeData.purchasedRecipe.ownedIngredients}개 재료 보유 | 재료 총 {recipeData.purchasedRecipe.totalIngredients}개
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 유사한 레시피 섹션 - 주문이 있을 때만 표시 */}
        {recipeData.similarRecipes.length > 0 && (
          <div className="similar-recipes-section">
            {/* 섹션 제목 */}
            <h3 className="section-title">유사한 레시피를 추천드려요!</h3>
            
            {/* 유사한 레시피 목록을 map으로 순회하며 렌더링합니다 (API에서 받아옴) */}
            {recipeData.similarRecipes.map((recipe) => (
              <div key={recipe.id} className="recipe-card" onClick={() => handleRecipeClick(recipe.id)}>
                {/* 레시피 이미지를 표시합니다 (API에서 받아옴) */}
                <div className="recipe-image">
                  <img src={recipe.image} alt={recipe.name} />
                </div>
                
                {/* 레시피 정보 */}
                <div className="recipe-info">
                  {/* 레시피명을 표시합니다 (API에서 받아옴) */}
                  <div className="recipe-name">{recipe.name}</div>
                  
                  {/* 평점과 스크랩 정보를 표시합니다 (API에서 받아옴) */}
                  <div className="recipe-stats">
                    ★{recipe.rating} ({recipe.reviewCount}) 스크랩 {recipe.scrapCount}
                  </div>
                  
                  {/* 레시피 설명을 표시합니다 (API에서 받아옴) */}
                  <div className="recipe-description">{recipe.description}</div>
                  
                  {/* 재료 정보를 표시합니다 (API에서 받아옴) */}
                  <div className="ingredient-info">
                    {recipe.ownedIngredients}개 재료 보유 | 재료 총 {recipe.totalIngredients}개
                  </div>
                </div>
              </div>
            ))}
            
            {/* 더보기 표시 */}
            <div className="more-indicator">...</div>
          </div>
        )}

        {/* 법적 고지사항 */}
        <div className="legal-disclaimer">
          <p>
            LG U+는 통신판매중개자로서 통신판매의 당사자가 아니며, U+콕 사이트의 상품, 거래정보 및 거래에 대하여 책임을 지지 않습니다. 
            서비스 운영은 (주)지니웍스가 대행하고 있습니다.
          </p>
        </div>


      </div>

      {/* 하단 네비게이션 */}
      <BottomNav />
    </div>
  );
};

// MyPage 컴포넌트를 기본 내보내기로 설정합니다
export default MyPage; 