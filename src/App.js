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
import Schedule from './pages/home_shopping/Schedule';

// ===== 기능별 컴포넌트들 import =====
// KOK 관련 컴포넌트
import BellBucketTest from './features/kok/BellBucketTest';

// ===== 레이아웃 컴포넌트들 import =====
import { HomeShoppingHeader, ShoppingHeader, SearchHeader, MyPageHeader, RecipeHeader, ScheduleHeader } from './layout/HeaderNav';
import BottomNav from './layout/BottomNav';

// ===== 일반 컴포넌트들 import =====
import ProductCard from './components/ProductCard';
import ProductSection from './components/ProductSection';
import NotificationManagerTest from './components/NotificationManagerTest';

// ===== 전역 상태 관리 Provider import =====
// 홈쇼핑 메인 페이지 컴포넌트 import
import Main from './pages/home_shopping/HomeShoppingMain';
// 레시피 추천 테스트 페이지 컴포넌트 import
import RecommendRecipe from './features/kok/BellBucketTest';
// 주문내역 헤더 테스트 페이지 컴포넌트 import
import OrderHistoryTest from './features/kok/OrderHistoryTest';
// 마이페이지 헤더 테스트 페이지 컴포넌트 import  
import MyPageTest from './features/kok/MyPageTest';
// 레시피 상세 헤더 테스트 페이지 컴포넌트 import
import RecipeDetailTest from './features/kok/RecipeDetailTest';
// 장바구니 헤더 테스트 페이지 컴포넌트 import
import CartTest from './features/kok/CartTest';
// 편성표 헤더 테스트 페이지 컴포넌트 import
import ScheduleHeaderTest from './features/kok/ScheduleHeaderTest';
// 전역 알림 상태 관리 Provider import
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
              {/* 루트 경로 (/) - 로그인 페이지 */}
              <Route path="/" element={<Login />} />  
              
              {/* ===== 사용자 인증 라우트 ===== */}
              {/* 회원가입 경로 (/signup) - 회원가입 페이지 */}
              <Route path="/signup" element={<Signup />} />
              
              {/* ===== 홈쇼핑 라우트 ===== */}
              {/* 편성표 메인 경로 (/) - 편성표 페이지로 설정 */}
              <Route path="/main" element={<Schedule />} />
              {/* 홈쇼핑 경로 (/main) - 홈쇼핑 메인 페이지 */}
              <Route path="/homeshopping" element={<HomeShoppingMain />} />
              {/* 제품 상세 경로 (/product/:productId) - 제품 상세 페이지 */}
              <Route path="/product/:productId" element={<ProductDetail />} />
              {/* 편성표 경로 (/schedule) - 편성표 페이지 */}
              <Route path="/schedule" element={<Schedule />} />
              
              {/* 알림 관리 테스트 경로 (/notification-test) */}
              <Route path="/notification-test" element={<NotificationManagerTest />} />
              
              {/* 헤더 네비게이션 테스트 경로들 */}
              <Route path="/header-nav-test" element={<HomeShoppingHeader />} />
              <Route path="/shopping-header-test" element={<ShoppingHeader />} />
              <Route path="/search-header-test" element={<SearchHeader />} />
              <Route path="/mypage-header-test" element={<MyPageHeader />} />
              <Route path="/recipe-header-test" element={<RecipeHeader />} />
              <Route path="/schedule-header-test" element={<ScheduleHeader />} />
              
              {/* 하단 네비게이션 테스트 경로 (/bottom-nav-test) */}
              <Route path="/bottom-nav-test" element={<BottomNav />} />
              
              <Route path="/main" element={<Main />} />
              {/* 테스트 경로 (/test) - 레시피 추천 테스트 페이지 */}
              <Route path="/test" element={<RecommendRecipe />} />
              {/* 주문내역 헤더 테스트 경로 (/order-history) */}
              <Route path="/order-history-test" element={<OrderHistoryTest />} />
              {/* 마이페이지 헤더 테스트 경로 (/mypage-test) */}
              <Route path="/mypage-test" element={<MyPageTest />} />
              {/* 레시피 상세 헤더 테스트 경로 (/recipe-detail) */}
              <Route path="/recipe-detail-test" element={<RecipeDetailTest />} />
              {/* 장바구니 헤더 테스트 경로 (/cart) */}
              <Route path="/cart-test" element={<CartTest />} />
              {/* 편성표 헤더 테스트 경로 (/schedule-test) */}
              <Route path="/schedule-test" element={<ScheduleHeaderTest />} />
            </Routes>
          </Router>
        </div>
      </div>
    </NotificationProvider>
  );
}

// 앱 컴포넌트를 기본 export로 내보내기
export default App;