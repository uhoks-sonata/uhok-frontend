// React와 필요한 훅들을 가져옵니다
import React, { useState, useEffect } from 'react';
// 상단 네비게이션 컴포넌트를 가져옵니다
import { MyPageHeader } from '../../layout/HeaderNav';
// 하단 네비게이션 컴포넌트를 가져옵니다
import BottomNav from '../../layout/BottomNav';
// 로딩 컴포넌트를 가져옵니다
import Loading from '../../components/Loading';
// 마이페이지 스타일을 가져옵니다
import '../../styles/mypage.css';
// 기본 사용자 아이콘 이미지를 가져옵니다
import userIcon from '../../assets/user_icon.png';
// 상품 없음 이미지를 가져옵니다
import noItemsIcon from '../../assets/no_items.png';
// API 설정을 가져옵니다
import api from '../api';


// 테스트용 상품 이미지들을 가져옵니다
import testImage1 from '../../assets/test/test1.png';
import testImage2 from '../../assets/test/test2.png';

// 마이페이지 메인 컴포넌트를 정의합니다
const MyPage = () => {
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

  // 7일 전 날짜를 계산하는 함수를 정의합니다
  const getSevenDaysAgo = () => {
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);
    return sevenDaysAgo.toISOString().split('T')[0]; // YYYY-MM-DD 형식
  };

  // 오늘 날짜를 YYYY-MM-DD 형식으로 반환하는 함수를 정의합니다
  const getToday = () => {
    return new Date().toISOString().split('T')[0];
  };

  // 가격을 원화 형식으로 포맷팅하는 함수를 정의합니다
  const formatPrice = (price) => {
    return price.toLocaleString('ko-KR') + '원';
  };

  // 백엔드 API에서 마이페이지 데이터를 가져오는 useEffect를 정의합니다
  useEffect(() => {
    // 비동기 함수로 마이페이지 데이터를 가져옵니다
    const fetchMyPageData = async () => {
      try {
        // 로딩 상태를 true로 설정합니다
        setLoading(true);
        
        // 1. 사용자 정보 조회 (비동기 처리)
        const userResponse = await api.get('/api/user/info', {
          headers: {
            'Authorization': 'Bearer <access_token>' // 실제 토큰으로 교체 필요
          }
        });
        
        // 응답 데이터를 가져옵니다
        const userData = userResponse.data;
        
        // 2. 주문 내역 개수 조회 (비동기 처리)
        const orderCountResponse = await api.get('/api/orders/count', {
          headers: {
            'Authorization': 'Bearer <access_token>'
          }
        });
        
        const orderCount = orderCountResponse.data.order_count || 0;
        
        // 3. 최근 주문 조회 (비동기 처리)
        const ordersResponse = await api.get('/api/orders/recent?days=7', {
          headers: {
            'Authorization': 'Bearer <access_token>'
          }
        });
        
        // 주문 조회 응답을 처리합니다
        const ordersData = ordersResponse.data;
        
        // 4. 레시피 정보 조회 (비동기 처리)
        const recipeResponse = await api.get('/api/recipes/user', {
          headers: {
            'Authorization': 'Bearer <access_token>'
          }
        });
        
        const recipeData = recipeResponse.data;
        
        // 파싱된 데이터를 상태에 저장합니다
        setUserData({
          user_id: userData.user_id,
          username: userData.username,
          email: userData.email,
          created_at: userData.created_at,
          orderCount: orderCount,
          recentOrders: ordersData.orders
        });
        
        setRecipeData(recipeData);
        
      } catch (err) {
        // 에러가 발생하면 콘솔에 에러를 출력합니다
        console.error('마이페이지 데이터 로딩 실패:', err);
        // API 연결 실패 시 에러 대신 임시 데이터를 사용한다는 로그를 출력합니다
        console.log('임시 데이터를 사용합니다.');
        
        // 임시 데이터를 상태에 설정합니다 (API 연결 전까지 사용)
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
              product_description: "부드러운 초콜릿과 마시멜로우가 듬뿍 부드러운 초콜릿과 마시멜로우가 듬뿍",
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
      } finally {
        // try-catch 블록이 끝나면 항상 로딩 상태를 false로 설정합니다
        setLoading(false);
      }
    };

    // 컴포넌트가 마운트될 때 데이터를 가져오는 함수를 실행합니다
    fetchMyPageData();
  }, []); // 빈 배열을 의존성으로 설정하여 컴포넌트 마운트 시에만 실행됩니다



  // 주문 내역 클릭 시 실행되는 핸들러 함수를 정의합니다 (비동기)
  const handleOrderHistoryClick = async () => {
    try {
      // 콘솔에 클릭 로그를 출력합니다
      console.log('주문 내역 클릭');
      
      // 주문 내역 페이지로 이동하기 전에 로그 기록 (비동기 처리)
      await api.post('/api/user/activity-log', {
        action: 'view_order_history',
        timestamp: new Date().toISOString()
      }, {
        headers: {
          'Authorization': 'Bearer <access_token>'
        }
      }).catch(() => {
        // 로그 기록 실패는 무시하고 계속 진행
        console.log('활동 로그 기록 실패 (무시됨)');
      });
      
      // 주문 내역 페이지로 이동합니다
      window.location.href = '/orderlist';
    } catch (error) {
      console.error('주문 내역 클릭 에러:', error);
      // 에러가 발생해도 페이지 이동은 계속 진행
      window.location.href = '/orderlist';
    }
  };

  // 레시피 클릭 시 실행되는 핸들러 함수를 정의합니다 (비동기)
  const handleRecipeClick = async (recipeId) => {
    try {
      // 콘솔에 클릭된 레시피 ID를 출력합니다
      console.log('레시피 클릭:', recipeId);
      
      // 레시피 상세 정보를 비동기로 가져오는 로직 (향후 구현)
      const recipeResponse = await api.get(`/api/recipes/${recipeId}`, {
        headers: {
          'Authorization': 'Bearer <access_token>'
        }
      });
      
      const recipeDetail = recipeResponse.data;
      console.log('레시피 상세 정보:', recipeDetail);
      // 레시피 상세 페이지로 이동하는 기능을 구현할 예정입니다
      // window.location.href = `/recipe-detail/${recipeId}`;
    } catch (error) {
      console.error('레시피 클릭 에러:', error);
    }
  };

  // 로딩 중일 때 표시할 UI를 렌더링합니다
  if (loading) {
    return (
      <div className="mypage-page">
        {/* 상단 네비게이션 */}
        <MyPageHeader />
        {/* 메인 콘텐츠 영역 */}
        <div className="mypage-content">
          <Loading message="마이페이지를 불러오는 중 ..." />
        </div>
        {/* 하단 네비게이션을 렌더링합니다 */}
        <BottomNav />
      </div>
    );
  }

  // 에러가 발생했을 때 표시할 UI를 렌더링합니다
  if (error) {
    return (
      <div className="mypage-page">
        {/* 상단 네비게이션 */}
        <MyPageHeader />
        {/* 메인 콘텐츠 영역 */}
        <div className="mypage-content">
          {/* 에러 메시지를 표시합니다 */}
          <div className="error">오류: {error}</div>
        </div>
        {/* 하단 네비게이션을 렌더링합니다 */}
        <BottomNav />
      </div>
    );
  }

  // 정상적인 마이페이지를 렌더링합니다
  return (
    <div className="mypage-page">
      {/* 상단 네비게이션 */}
      <MyPageHeader />
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
           {userData.recentOrders.length > 0 ? (
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
                   <div key={orderId} className="order-item">
                     {/* 주문 정보 헤더 */}
                     <div className="order-header">
                       {/* 주문 날짜를 표시합니다 (API에서 받아옴) */}
                       <span className="order-date">{firstOrder.order_date}</span>
                       {/* 주문번호를 표시합니다 (API에서 받아옴) */}
                       <span className="order-number">주문번호 {orderId}</span>
                     </div>
                     
                     {/* 배송 상태 카드 */}
                     <div className="delivery-status-card">
                       {/* 배송 상태를 표시합니다 (API에서 받아옴) */}
                       <div className="delivery-status">
                         <span className="delivery-status-text">배송완료</span>
                         <span className="delivery-date">{firstOrder.order_date} 도착</span>
                       </div>
                       
                       {/* 상품 정보들 - 같은 주문번호의 모든 상품을 표시합니다 */}
                       {orders.map((order, index) => (
                         <div key={`${orderId}-${index}`} className="product-info">
                           {/* 상품 이미지를 표시합니다 (API에서 받아옴) */}
                           <div className="product-image">
                             <img src={order.product_image} alt={order.product_name} />
                           </div>
                           
                           {/* 상품 상세 정보 */}
                           <div className="product-details">
                             {/* 브랜드명과 상품명을 표시합니다 (API에서 받아옴) */}
                             <div className="product-name" title={`${order.brand_name} | ${order.product_name}`}>
                               {`${order.brand_name} | ${order.product_name}`.length > 20 
                                 ? `${`${order.brand_name} | ${order.product_name}`.substring(0, 20)}...`
                                 : `${order.brand_name} | ${order.product_name}`
                               }
                             </div>
                             {/* 상품 설명을 표시합니다 (API에서 받아옴) */}
                             <div className="product-description" title={order.product_description}>
                               {order.product_description.length > 20 
                                 ? `${order.product_description.substring(0, 20)}...`
                                 : order.product_description
                               }
                             </div>
                             {/* 가격과 수량을 표시합니다 (API에서 받아옴) */}
                             <div className="product-price">{formatPrice(order.product_price)} · {order.product_quantity}개</div>
                           </div>
                         </div>
                       ))}
                       
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