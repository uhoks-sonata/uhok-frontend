// React와 필요한 훅들을 가져옵니다
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// 메인 헤더 네비게이션 컴포넌트를 가져옵니다
import HeaderNavMain from '../../layout/HeaderNavMain';
// 하단 네비게이션 컴포넌트를 가져옵니다
import BottomNav from '../../layout/BottomNav';
// 로딩 컴포넌트를 가져옵니다
import Loading from '../../components/Loading';
// 메인 페이지 스타일을 가져옵니다
import '../../styles/main.css';
// API 설정을 가져옵니다
import api from '../api';
// 홈쇼핑 API를 가져옵니다
import { homeShoppingApi } from '../../api/homeShoppingApi';
// 사용자 Context import
import { useUser } from '../../contexts/UserContext';

// 홈쇼핑 로고 이미지들을 가져옵니다
import homeshopping_logo_publicshopping from '../../assets/homeshopping_logo_publicshopping.png'; // 공영홈쇼핑 로고
import homeshoppingLogoPlusshop from '../../assets/homeshopping_logo_plusshop.png'; // 플러스샵 로고
import homeshoppingLogoNsplus from '../../assets/homeshopping_logo_nsplus.png'; // NS플러스 로고
import homeshoppingLogoNs from '../../assets/homeshopping_logo_ns.png'; // NS홈쇼핑 로고
import homeshoppingLogoHyundai from '../../assets/homeshopping_logo_hyundai.png'; // 현대홈쇼핑 로고
import homeshoppingLogoHomeandshopping from '../../assets/homeshopping_logo_homeandshopping.png'; // 홈앤쇼핑 로고

// 메인 컴포넌트를 정의합니다
const Main = () => {
  // 페이지 이동을 위한 navigate 훅
  const navigate = useNavigate();
  // 사용자 정보 가져오기
  const { user, isLoggedIn, isLoading: userLoading } = useUser();
  
  // 편성표 데이터를 저장할 상태를 초기화합니다 (API 명세서에 맞춰 수정)
  const [scheduleData, setScheduleData] = useState({
    date: '', // 날짜 정보 (API에서 받아옴)
    time: '', // 시간 정보 (API에서 받아옴)
    channel_id: null, // 채널 아이디 (API에서 받아옴)
    schedule: [] // 스케줄 목록 (API에서 받아옴)
  });
  // 데이터 로딩 상태를 관리합니다 (true: 로딩 중, false: 로딩 완료)
  const [loading, setLoading] = useState(true);
  // 에러 상태를 관리합니다 (null: 에러 없음, string: 에러 메시지)
  const [error, setError] = useState(null);

  // homeshopping_id에 따른 로고 이미지를 반환하는 함수를 정의합니다
  const getLogoByHomeshoppingId = (homeshoppingId) => {
    // homeshopping_id와 로고 이미지를 매핑하는 객체를 정의합니다
    const brandLogos = {
      1: homeshoppingLogoHomeandshopping, // 홈앤쇼핑
      2: homeshoppingLogoHyundai, // 현대홈쇼핑
      3: homeshoppingLogoPlusshop, // 현대홈쇼핑+샵
      4: homeshoppingLogoNs, // NS홈쇼핑
      5: homeshoppingLogoNsplus, // NS샵+
      6: homeshopping_logo_publicshopping, // 공영쇼핑
    };
    
    // homeshopping_id로 매칭되는 로고가 있으면 반환하고, 없으면 공영홈쇼핑 로고를 기본값으로 반환합니다
    return brandLogos[homeshoppingId] || homeshopping_logo_publicshopping;
  };

  // 사용자 정보가 변경될 때마다 콘솔에 출력 (디버깅용)
  useEffect(() => {
    console.log('Main - 사용자 정보 상태:', {
      user: user,
      isLoggedIn: isLoggedIn,
      hasUser: !!user,
      userEmail: user?.email,
      hasToken: !!user?.token,
      userLoading: userLoading
    });
  }, [user, isLoggedIn, userLoading]);

  // 백엔드 API에서 편성표 데이터를 가져오는 useEffect를 정의합니다 (비동기 처리 개선)
  useEffect(() => {
    // 사용자 정보 로딩이 완료될 때까지 기다림
    if (userLoading) {
      console.log('Main - 사용자 정보 로딩 중, 대기...');
      return;
    }
    
    // 비동기 함수로 편성표 데이터를 가져옵니다
    const fetchScheduleData = async () => {
      try {
        console.log('Main - 편성표 데이터 로딩 시작');
        
        // 로딩 상태를 true로 설정합니다
        setLoading(true);
        setError(null); // 에러 상태 초기화
        
        // API 명세서에 맞춰 쿼리 파라미터를 설정합니다
        const today = new Date();
        const date = today.toISOString().split('T')[0]; // YYYY-MM-DD 형식
        const hour = today.getHours(); // 현재 시간
        
        // 오늘 날짜 문자열 생성 (if-else 블록 밖에서 공통으로 사용)
        const todayString = today.toISOString().split('T')[0]; // YYYY-MM-DD 형식
        
        // 홈쇼핑 편성표 API 호출 (오늘 날짜 데이터만)
        // getSchedule 함수에서 자동으로 오늘 날짜를 설정하므로 파라미터로 전달하지 않음
        const response = await homeShoppingApi.getSchedule();
        
        console.log('홈쇼핑 편성표 API 응답:', response.data);
        
        if (response && response.data && response.data.schedules && response.data.schedules.length > 0) {
          // 오늘 날짜의 데이터만 필터링
          
          const todaySchedules = response.data.schedules.filter(item => {
            const itemDate = new Date(item.live_date);
            const itemDateString = itemDate.toISOString().split('T')[0];
            return itemDateString === todayString;
          });
          
          console.log('오늘 날짜 편성표:', todaySchedules);
          
          // 오늘 날짜 데이터가 있는 경우에만 API 데이터 사용
          if (todaySchedules.length > 0) {
            // API 응답 데이터를 UI 형식으로 변환
            const apiSchedule = todaySchedules.map(item => ({
              홈쇼핑_아이디: item.homeshopping_id || item.id,
              홈쇼핑명: item.homeshopping_name || item.store_name || '홈쇼핑',
              채널명: item.homeshopping_name || item.store_name || '홈쇼핑',
              채널로고: item.channel_logo || getLogoByHomeshoppingId(item.homeshopping_id || item.id),
              채널번호: item.homeshopping_channel || item.channel_number || item.channel || '채널',
              원가: item.sale_price ? `${item.sale_price.toLocaleString()}원` : '0원',
              할인율: item.dc_rate ? `${item.dc_rate}%` : '0%',
              할인된가격: item.dc_price ? `${item.dc_price.toLocaleString()}원` : '0원',
              시작시간: item.live_start_time ? item.live_start_time.substring(0, 5) : '00:00',
              썸네일: item.thumb_img_url || item.thumbnail || item.product_image || null,
              알림여부: item.notification_enabled || false,
              상품명: item.product_name || item.title || '상품명 없음'
            }));
            
            setScheduleData({
              date: todayString,
              time: `${today.getHours()}:${String(today.getMinutes()).padStart(2, '0')}`,
              channel_id: null,
              schedule: apiSchedule
            });
          } else {
            // 오늘 날짜 데이터가 없는 경우 빈 배열로 설정
            console.log('오늘 날짜 편성표 데이터가 없습니다.');
            setScheduleData({
              date: todayString,
              time: `${today.getHours()}:${String(today.getMinutes()).padStart(2, '0')}`,
              channel_id: null,
              schedule: []
            });
          }
        } else {
          // API 데이터가 없을 때 빈 배열로 설정
          console.log('API 데이터가 없습니다.');
          setScheduleData({
            date: todayString,
            time: `${today.getHours()}:${String(today.getMinutes()).padStart(2, '0')}`,
            channel_id: null,
            schedule: []
          });
        }
        
      } catch (err) {
        // 에러가 발생하면 콘솔에 에러를 출력하고 에러 상태를 설정합니다
        console.error('편성표 데이터 로딩 실패:', err);
        setError('편성표 데이터를 불러오는데 실패했습니다.');
        
        // 에러 시 빈 데이터로 설정
        const today = new Date();
        const date = today.toISOString().split('T')[0];
        const time = `${today.getHours()}:${String(today.getMinutes()).padStart(2, '0')}`;
        
        setScheduleData({
          date: date,
          time: time,
          channel_id: null,
          schedule: []
        });
      } finally {
        // try-catch 블록이 끝나면 항상 로딩 상태를 false로 설정합니다
        setLoading(false);
      }
    };

    // 컴포넌트가 마운트될 때 데이터를 가져오는 함수를 실행합니다
    fetchScheduleData();
  }, [userLoading]); // userLoading이 변경될 때마다 실행

  // 편성표 버튼 클릭 시 실행되는 핸들러 함수를 정의합니다
  const handleScheduleClick = () => {
    // 콘솔에 클릭 로그를 출력합니다
    console.log('편성표 버튼 클릭');
    // 편성표 페이지로 이동합니다
    navigate('/schedule');
  };

  // 알림 버튼 클릭 시 실행되는 핸들러 함수를 정의합니다
  const handleNotificationClick = () => {
    // 콘솔에 클릭 로그를 출력합니다
    console.log('알림 버튼 클릭');
    navigate('/notifications');
  };

  // 상품 카드 클릭 시 실행되는 핸들러 함수를 정의합니다
  const handleProductClick = (productId) => {
    // 콘솔에 클릭된 상품 ID를 출력합니다
    console.log('상품 클릭:', productId);
    // 상품 상세 페이지로 이동하는 기능을 구현할 예정입니다
  };



  // 현재 시간과 비교하여 방송 예정/방송 종료를 구분하는 함수를 정의합니다
  const getBroadcastStatus = (startTime) => {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes(); // 현재 시간을 분으로 변환
    
    const [hours, minutes] = startTime.split(':').map(Number);
    const startTimeInMinutes = hours * 60 + minutes; // 시작 시간을 분으로 변환
    
    // 시작 시간이 현재 시간보다 이후면 방송 예정, 이전이면 방송 종료
    return startTimeInMinutes > currentTime ? '방송예정' : '방송종료';
  };

  // 스케줄 데이터를 방송 예정과 방송 종료로 분류합니다 (방송 종료는 표시하지 않음)
  const scheduledItems = scheduleData.schedule.filter(item => getBroadcastStatus(item.시작시간) === '방송예정');
  const onAirItems = []; // 방송 중인 항목은 없음

  // 로딩 중일 때 표시할 UI를 렌더링합니다
  if (loading || userLoading) {
    return (
      <div className="main-page">
        {/* 메인 헤더 네비게이션 */}
        <HeaderNavMain 
          onNotificationClick={handleNotificationClick}
          onScheduleClick={handleScheduleClick}
        />
        
        {/* 메인 콘텐츠 영역 */}
        <div className="main-schedule-content">
          <Loading message="편성표를 불러오는 중 ..." />
        </div>
        {/* 하단 네비게이션을 렌더링합니다 */}
        <BottomNav />
      </div>
    );
  }

  // 에러가 발생했을 때 표시할 UI를 렌더링합니다
  if (error) {
    return (
      <div className="main-page">
        {/* 메인 헤더 네비게이션 */}
        <HeaderNavMain 
          onNotificationClick={handleNotificationClick}
          onScheduleClick={handleScheduleClick}
        />
        
        {/* 메인 콘텐츠 영역 */}
        <div className="main-schedule-content">
          {/* 에러 메시지를 표시합니다 */}
          <div className="error">오류: {error}</div>
        </div>
        {/* 하단 네비게이션을 렌더링합니다 */}
        <BottomNav />
      </div>
    );
  }

  // 정상적인 편성표 페이지를 렌더링합니다
  return (
    <div className="main-page">
      {/* 메인 헤더 네비게이션 */}
      <HeaderNavMain 
        onNotificationClick={handleNotificationClick}
        onScheduleClick={handleScheduleClick}
      />

                    {/* 메인 콘텐츠 */}
       <div className="main-schedule-content">
         {/* 편성표가 없을 때 메시지 표시 */}
         {scheduleData.schedule.length === 0 ? (
           <div className="no-schedule-message">
             <div className="no-schedule-date">{scheduleData.date}</div>
             <div className="no-schedule-text">편성된 방송이 없습니다.</div>
           </div>
         ) : (
           <>
             {/* 날짜 정보 (편성표가 있을 때만 표시) */}
             <div className="schedule-header-info">
               {/* 날짜를 표시합니다 (API에서 받아옴) */}
               <div className="date">{scheduleData.date}</div>
             </div>
                                       {/* 방송 예정 섹션 */}
             {scheduledItems.length > 0 && (
               <>
                 <div className="main-section-title">방송 예정</div>
                 <div className="main-product-cards">
                   {scheduledItems.map((item, index) => (
                     <div
                       key={`scheduled-${item.홈쇼핑_아이디}-${index}`}
                       className="main-product-card"
                       onClick={() => handleProductClick(item.홈쇼핑_아이디)}
                     >
                       {/* 시간 헤더 */}
                       <div className="main-time-overlay">{item.시작시간}</div>
                       
                       {/* 카드 내부 레이아웃 컨테이너 */}
                       <div className="main-card-layout">
                         
                         {/* 왼쪽: 상품 이미지 */}
                         <div className="main-product-image-container">
                           {/* 상품 이미지 컨테이너 */}
                           <div className="main-product-image">
                             {/* 상품 이미지를 표시합니다 */}
                             <img src={item.썸네일} alt={item.상품명} />
                           </div>
                         </div>
                         
                         {/* 오른쪽: 상품 정보 */}
                         <div className="main-product-info">
                           {/* 상품 상세 정보 컨테이너 */}
                           <div className="main-product-details">
                             {/* 브랜드 정보 컨테이너 */}
                             <div className="main-brand-info">
                               {/* 브랜드 로고 컨테이너 */}
                               <div className="main-brand-logo">
                                 {/* 브랜드 로고 이미지 */}
                                 <img
                                   src={item.채널로고}
                                   alt={item.홈쇼핑명}
                                   className="main-brand-image"
                                 />
                               </div>
                               {/* 채널 번호를 표시합니다 */}
                               <span className="main-channel">[CH {item.채널번호}]</span>
                             </div>
                             {/* 상품명을 표시합니다 */}
                             <div className="main-product-name">{item.상품명}</div>
                             {/* 가격 정보 컨테이너 */}
                             <div className="main-price-info">
                               {/* 할인율을 표시합니다 */}
                               <span className="main-discount">{item.할인율}</span>
                               {/* 할인된 가격을 표시합니다 */}
                               <span className="main-price">{item.할인된가격}</span>
                             </div>
                           </div>
                         </div>
                       </div>
                     </div>
                   ))}
                 </div>
               </>
             )}


           </>
         )}
      </div>

      {/* 하단 네비게이션 */}
      <BottomNav />
    </div>
  );
};

// Main 컴포넌트를 기본 내보내기로 설정합니다
export default Main;
