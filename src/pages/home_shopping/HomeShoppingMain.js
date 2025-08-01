import '../../styles/home_shopping_main.css';
import BottomNav from '../../layout/BottomNav';

const Main = () => {
  return (
    <div className="main-page">
      <div>홈쇼핑 메인 페이지</div>
      <BottomNav /> {/* 하단 고정 네비게이션 */}
    </div>
  );
};

export default Main;