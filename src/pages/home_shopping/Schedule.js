import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../../layout/BottomNav';
import HeaderNavSchedule from '../../layout/HeaderNavSchedule';
import { useUser } from '../../contexts/UserContext';
import '../../styles/schedule.css';

const Schedule = () => {
  const navigate = useNavigate();
  const { user, isLoggedIn } = useUser();
  
  // 편성표 관련 상태
  const [selectedDate, setSelectedDate] = useState(null); // 현재 선택된 날짜
  const [searchQuery, setSearchQuery] = useState('');
  
  // 현재 날짜를 기준으로 일주일 날짜 데이터 생성
  const [weekDates, setWeekDates] = useState([]);
  
  // 날짜 데이터 초기화
  useEffect(() => {
    const today = new Date();
    const currentDay = today.getDay(); // 0: 일요일, 1: 월요일, ..., 6: 토요일
    
    // 월요일을 시작으로 하는 주의 시작일 계산
    const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay;
    const monday = new Date(today);
    monday.setDate(today.getDate() + mondayOffset);
    
    const weekData = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      
      const isToday = date.toDateString() === today.toDateString();
      
             weekData.push({
         date: date.getDate(),
         day: ['월', '화', '수', '목', '금', '토', '일'][i],
         fullDate: date,
         isToday: isToday,
         dateKey: date.toDateString() // 날짜 비교를 위한 고유 키
       });
      
      // 오늘 날짜라면 selectedDate 설정
      if (isToday) {
        setSelectedDate(date.toDateString());
      }
    }
    
    setWeekDates(weekData);
  }, []);
  
  // 시간대 데이터
  const timeSlots = ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'];
  
  // 더미 편성표 데이터
  const scheduleData = [
    {
      id: 1,
      time: '10:00',
      endTime: '11:30',
      channel: 'CJ온스타일',
      title: 'CJ온스타일',
      product: '에버콜라겐',
      description: '에버콜라겐 타임어택놀 A 18개월 + 카무트효소스페셜',
      originalPrice: 300000,
      salePrice: 180000,
      discount: '17%',
      isLive: true,
      ageLimit: '18',
      image: '/test1.png',
      wishlist: false
    },
    {
      id: 2,
      time: '11:30',
      endTime: '13:00',
      channel: 'CJ온스타일',
      title: 'CJ온스타일',
      product: '에버콜라겐',
      description: 'LIVE 예정',
      originalPrice: 300000,
      salePrice: 180000,
      discount: '17%',
      isLive: false,
      ageLimit: '18',
      image: '/test2.png',
      wishlist: false
    }
  ];

  // 위시리스트 토글
  const toggleWishlist = (itemId) => {
    console.log(`위시리스트 토글: ${itemId}`);
    
    // 애니메이션 효과 추가
    const wishlistBtn = document.querySelector(`[data-item-id="${itemId}"]`);
    if (wishlistBtn) {
      if (scheduleData.find(item => item.id === itemId)?.wishlist) {
        // 찜 해제 애니메이션
        wishlistBtn.classList.add('unliked');
        setTimeout(() => wishlistBtn.classList.remove('unliked'), 400);
      } else {
        // 찜 추가 애니메이션
        wishlistBtn.classList.add('liked');
        setTimeout(() => wishlistBtn.classList.remove('liked'), 600);
      }
    }
    
    // 데이터 상태 업데이트 (실제로는 API 호출)
    // scheduleData 상태가 있다면 여기서 업데이트
  };

  // 알림 핸들러
  const handleNotification = () => {
    navigate('/notifications');
  };

  return (
    <div className="schedule-page">
      {/* 편성표 헤더 네비게이션 */}
      <HeaderNavSchedule 
        onBackClick={() => navigate(-1)}
        onSearchClick={(searchTerm) => navigate('/homeshopping/search?type=homeshopping')}
        onNotificationClick={handleNotification}
      />

      <div className="schedule-content">
        {/* 날짜 선택 캘린더 */}
        <div className="date-calendar">
          <div className="calendar-header">
            <div className="calendar-dates">
              {weekDates.map((item, index) => (
                <div 
                  key={index}
                  className={`calendar-date ${item.isToday ? 'today' : ''} ${selectedDate === item.dateKey ? 'selected' : ''}`}
                  onClick={() => {
                    if (item.isToday) {
                      // 오늘 날짜 클릭 시
                      if (selectedDate === item.dateKey) {
                        // 이미 선택된 상태라면 선택 해제
                        setSelectedDate(null);
                      } else {
                        // 선택되지 않은 상태라면 선택
                        setSelectedDate(item.dateKey);
                      }
                    } else {
                      // 다른 날짜 클릭 시 해당 날짜 선택
                      setSelectedDate(item.dateKey);
                    }
                  }}
                >
                  <div className="date-number">{item.date}</div>
                  <div className="date-day">{item.day}</div>
                </div>
              ))}
            </div>
          </div>
          
          {/* 시간대 표시 */}
          <div className="time-slots">
            {timeSlots.map((time, index) => (
              <div key={index} className="time-slot">
                {time}
              </div>
            ))}
          </div>
        </div>

        {/* 편성표 목록 */}
        <div className="schedule-timeline">
          {scheduleData.map((item) => (
            <div key={item.id} className="schedule-program">
              {/* 시간 표시 */}
              <div className="program-time">
                <div className="time-start">{item.time} ~</div>
                {item.isLive && <div className="live-indicator">LIVE</div>}
                {!item.isLive && <div className="upcoming-indicator">LIVE 예정</div>}
              </div>
              
              {/* 프로그램 카드 */}
              <div className="program-card">
                <div className="program-left">
                  {/* 채널 로고들 */}
                  <div className="channel-logos">
                    {Array.from({ length: 12 }, (_, i) => (
                      <div key={i} className="channel-logo">CJ온스타일</div>
                    ))}
                  </div>
                </div>
                
                <div className="program-content">
                  {/* 연령 제한 */}
                  <div className="age-rating">{item.ageLimit}개월</div>
                  
                  {/* 상품 이미지 */}
                  <div className="product-image">
                    <img src={item.image} alt={item.product} />
                  </div>
                  
                  {/* 상품 정보 */}
                  <div className="product-info">
                    <h3 className="product-name">{item.product}</h3>
                    <p className="product-description">{item.description}</p>
                    
                    <div className="price-section">
                      <div className="original-price">{item.originalPrice.toLocaleString()}원</div>
                      <div className="sale-info">
                        <span className="discount-rate">{item.discount}</span>
                        <span className="sale-price">{item.salePrice.toLocaleString()}원</span>
                      </div>
                    </div>
                    
                    <button 
                      className={`wishlist-btn ${item.wishlist ? 'active' : ''}`}
                      onClick={() => toggleWishlist(item.id)}
                      data-item-id={item.id}
                    >
                      ❤️ 방송알림신청
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <BottomNav />
    </div>
  );
};

export default Schedule;