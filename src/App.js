// React 라이브러리 import
import React from 'react';
// React Router 관련 컴포넌트들 import
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// 앱 전체 스타일 CSS 파일 import
import './styles/App.css';

// ===== 페이지 컴포넌트들 import =====
// 사용자 관련 페이지
import Login from './pages/user/Login';
import Signup from './pages/user/Signup';

// 홈쇼핑 관련 페이지
import HomeShoppingMain from './pages/home_shopping/HomeShoppingMain';
import ProductDetail from './pages/home_shopping/ProductDetail';

// ===== 기능별 컴포넌트들 import =====
// KOK 관련 컴포넌트
import BellBucketTest from './features/kok/BellBucketTest';

// ===== 레이아웃 컴포넌트들 import =====
import { HomeShoppingHeader, ShoppingHeader, SearchHeader, MyPageHeader, RecipeHeader } from './layout/HeaderNav';
import BottomNav from './layout/BottomNav';

// ===== 일반 컴포넌트들 import =====
import Header from './components/Header';
import ProductCard from './components/ProductCard';
import ProductSection from './components/ProductSection';
import NotificationManagerTest from './components/NotificationManagerTest';

// ===== 전역 상태 관리 Provider import =====
import { NotificationProvider } from './layout/HeaderNav';

// ===== 메인 앱 컴포넌트 =====
// React 애플리케이션의 최상위 컴포넌트
function App() {
  // 앱 전체 JSX 반환
  return (
    // 전역 알림 상태를 모든 하위 컴포넌트에서 사용할 수 있도록 Provider로 감싸기
    <NotificationProvider>
      {/* 앱 전체 래퍼 컨테이너 */}
      <div className="wrapper">
        {/* 메인 앱 컨테이너 */}
        <div className="App">
          {/* React Router 설정 - 브라우저 라우팅 활성화 */}
          <Router>
            {/* 라우트 정의 컨테이너 */}
            <Routes>
              {/* ===== 메인 페이지 라우트 ===== */}
              {/* 루트 경로 (/) - 로그인 페이지로 설정 */}
              <Route path="/" element={<Login />} />
              
              {/* ===== 사용자 인증 라우트 ===== */}
              {/* 회원가입 경로 (/signup) - 회원가입 페이지 */}
              <Route path="/signup" element={<Signup />} />
              
              {/* ===== 홈쇼핑 라우트 ===== */}
              {/* 홈쇼핑 메인 경로 (/main) - 홈쇼핑 메인 페이지 */}
              <Route path="/main" element={<HomeShoppingMain />} />
              {/* 제품 상세 경로 (/product/:productId) - 제품 상세 페이지 */}
              <Route path="/product/:productId" element={<ProductDetail />} />
              
              {/* ===== KOK 관련 라우트 ===== */}
              {/* 레시피 추천 테스트 경로 (/test) - 레시피 추천 테스트 페이지 */}
              <Route path="/test" element={<BellBucketTest />} />
              {/* KOK 메인 경로 (/kok) - KOK 메인 페이지 */}
              <Route path="/kok" element={<BellBucketTest />} />
              
              {/* ===== 컴포넌트 테스트 라우트 ===== */}
              {/* 헤더 테스트 경로 (/header-test) */}
              <Route path="/header-test" element={<Header />} />
              
              {/* 제품 카드 테스트 경로 (/product-card-test) */}
              <Route path="/product-card-test" element={
                <div style={{ padding: '20px' }}>
                  <ProductCard 
                    name="테스트 제품"
                    price="15,000원"
                    image="https://via.placeholder.com/150"
                    rating={4.5}
                    reviewCount={128}
                    type="default"
                  />
                </div>
              } />
              
              {/* 제품 섹션 테스트 경로 (/product-section-test) */}
              <Route path="/product-section-test" element={
                <div style={{ padding: '20px' }}>
                  <ProductSection 
                    title="테스트 제품 섹션"
                    products={[
                      {
                        id: 1,
                        name: "제품 1",
                        price: "10,000원",
                        image: "https://via.placeholder.com/150",
                        rating: 4.0,
                        reviewCount: 50
                      },
                      {
                        id: 2,
                        name: "제품 2", 
                        price: "20,000원",
                        image: "https://via.placeholder.com/150",
                        rating: 4.5,
                        reviewCount: 100
                      }
                    ]}
                    type="default"
                  />
                </div>
              } />
              
              {/* 알림 관리 테스트 경로 (/notification-test) */}
              <Route path="/notification-test" element={<NotificationManagerTest />} />
              
              {/* 헤더 네비게이션 테스트 경로들 */}
              <Route path="/header-nav-test" element={<HomeShoppingHeader />} />
              <Route path="/shopping-header-test" element={<ShoppingHeader />} />
              <Route path="/search-header-test" element={<SearchHeader />} />
              <Route path="/mypage-header-test" element={<MyPageHeader />} />
              <Route path="/recipe-header-test" element={<RecipeHeader />} />
              
              {/* 하단 네비게이션 테스트 경로 (/bottom-nav-test) */}
              <Route path="/bottom-nav-test" element={<BottomNav />} />
              
              {/* ===== 404 페이지 ===== */}
              {/* 정의되지 않은 경로에 대한 기본 페이지 */}
              <Route path="*" element={
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  height: '100vh',
                  padding: '20px',
                  textAlign: 'center'
                }}>
                  <h1>404 - 페이지를 찾을 수 없습니다</h1>
                  <p>요청하신 페이지가 존재하지 않습니다.</p>
                  <div style={{ marginTop: '20px' }}>
                    <h3>사용 가능한 페이지:</h3>
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                      <li><a href="/">홈 (로그인)</a></li>
                      <li><a href="/signup">회원가입</a></li>
                      <li><a href="/main">홈쇼핑 메인</a></li>
                      <li><a href="/test">KOK 테스트</a></li>
                      <li><a href="/kok">KOK 메인</a></li>
                      <li><a href="/header-test">헤더 테스트</a></li>
                      <li><a href="/product-card-test">제품 카드 테스트</a></li>
                      <li><a href="/product-section-test">제품 섹션 테스트</a></li>
                      <li><a href="/notification-test">알림 관리 테스트</a></li>
                      <li><a href="/header-nav-test">홈쇼핑 헤더 테스트</a></li>
                      <li><a href="/shopping-header-test">쇼핑 헤더 테스트</a></li>
                      <li><a href="/search-header-test">검색 헤더 테스트</a></li>
                      <li><a href="/mypage-header-test">마이페이지 헤더 테스트</a></li>
                      <li><a href="/recipe-header-test">레시피 헤더 테스트</a></li>
                      <li><a href="/bottom-nav-test">하단 네비게이션 테스트</a></li>
                    </ul>
                  </div>
                </div>
              } />
            </Routes>
          </Router>
        </div>
      </div>
    </NotificationProvider>
  );
}

// 앱 컴포넌트를 기본 export로 내보내기
export default App;