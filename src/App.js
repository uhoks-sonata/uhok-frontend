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
import Schedule from './pages/kok_shopping/Schedule';

// KOK 쇼핑 관련 페이지
import KokMain from './pages/kok_shopping/KokMain';
import KokProductDetail from './pages/kok_shopping/KokProductDetail';
import KokProductListPage from './pages/kok_shopping/KokProductListPage';

// 레시피 관련 페이지
import RecipeRecommendation from './pages/recipes/RecipeRecommendation';

// ===== 기능별 컴포넌트들 import =====

// ===== 레이아웃 컴포넌트들 import =====

// ===== 일반 컴포넌트들 import =====

// ===== 전역 상태 관리 Provider import =====
// 마이페이지 컴포넌트 import
import MyPage from './pages/user/MyPage';
// 장바구니 컴포넌트 import
import Cart from './pages/Cart';
// 주문 내역 컴포넌트 import
import OrderList from './pages/user/OrderList';
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
              
              {/* ===== 기타 라우트 ===== */}
              {/* 편성표 메인 경로 (/) - 편성표 페이지로 설정 */}
              <Route path="/main" element={<Schedule />} />
              {/* 편성표 경로 (/schedule) - 편성표 페이지 */}
              <Route path="/schedule" element={<Schedule />} />
              {/* ===== KOK 라우트 ===== */}
              {/* KOK 메인 경로 (/kok) - KOK 메인 페이지 */}
              <Route path="/kok" element={<KokMain />} />
              {/* 제품 상세 경로 (/kok/product/:productId) - 제품 상세 페이지 */}
              <Route path="/kok/product/:productId" element={<KokProductDetail />} />
              {/* 제품 목록 경로 (/kok/products/:sectionType) - 제품 목록 페이지 */}
              <Route path="/kok/products/:sectionType" element={<KokProductListPage />} />
              
              {/* 레시피 추천 경로 (/recipes) - 레시피 추천 페이지 */}
              <Route path="/recipes" element={<RecipeRecommendation />} />
              
              {/* 마이페이지 경로 (/mypage) - 마이페이지 */}
              <Route path="/mypage" element={<MyPage />} />
              {/* 장바구니 경로 (/cart) - 장바구니 페이지 */}
              <Route path="/cart" element={<Cart />} />
              {/* 주문 내역 경로 (/orderlist) - 주문 내역 페이지 */}
              <Route path="/orderlist" element={<OrderList />} />
            </Routes>
          </Router>
        </div>
      </div>
    </NotificationProvider>
  );
}

// 앱 컴포넌트를 기본 export로 내보내기
export default App;