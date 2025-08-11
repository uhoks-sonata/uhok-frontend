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
  const [selectedDate, setSelectedDate] = useState(26); // 현재 선택된 날짜
  const [searchQuery, setSearchQuery] = useState('');
  
  // 날짜 데이터 (일주일)
  const weekDates = [
    { date: 23, day: '월' },
    { date: 24, day: '화' },
    { date: 25, day: '수' },
    { date: 26, day: '목', isToday: true },
    { date: 27, day: '금' },
    { date: 28, day: '토' },
    { date: 27, day: '일' }
  ];
  
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
  };



  // 검색 핸들러
  const handleSearch = () => {
    navigate('/search?type=homeshopping');
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
        onSearchClick={handleSearch}
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
                  className={`calendar-date ${item.isToday ? 'today' : ''} ${selectedDate === item.date ? 'selected' : ''}`}
                  onClick={() => setSelectedDate(item.date)}
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