import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../../layout/BottomNav';
import HeaderNavSchedule from '../../layout/HeaderNavSchedule';
import { useUser } from '../../contexts/UserContext';
import { homeShoppingApi } from '../../api/homeShoppingApi';
import '../../styles/schedule.css';

const Schedule = () => {
  const navigate = useNavigate();
  const { user, isLoggedIn } = useUser();
  
  // 편성표 관련 상태
  const [selectedDate, setSelectedDate] = useState(26); // 현재 선택된 날짜
  const [searchQuery, setSearchQuery] = useState('');
  const [scheduleData, setScheduleData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
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

  // 편성표 데이터 가져오기
  useEffect(() => {
    const fetchScheduleData = async () => {
      try {
        setLoading(true);
        const response = await homeShoppingApi.getSchedule(1, 20);
        
        console.log('홈쇼핑 편성표 API 응답:', response);
        
        // API 응답 데이터를 UI 형식으로 변환
        const apiSchedule = (response.schedule || []).map(item => ({
          id: item.homeshopping_id || item.id,
          time: item.start_time || '00:00',
          endTime: item.end_time || '00:00',
          channel: item.store_name || item.channel_name || '홈쇼핑',
          title: item.store_name || item.channel_name || '홈쇼핑',
          product: item.product_name || item.title || '상품명 없음',
          description: item.product_description || item.description || '상품 설명 없음',
          originalPrice: item.original_price || 0,
          salePrice: item.discounted_price || item.sale_price || 0,
          discount: item.discount_rate ? `${item.discount_rate}%` : '0%',
          isLive: item.is_live || false,
          ageLimit: item.age_limit || '18',
          image: item.thumbnail || item.product_image || null,
          wishlist: item.is_wishlisted || false
        }));
        
        setScheduleData(apiSchedule);
      } catch (error) {
        console.error('홈쇼핑 편성표 데이터 가져오기 실패:', error);
        setError('편성표 데이터를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchScheduleData();
  }, []);

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
          {loading && (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>편성표를 불러오는 중...</p>
            </div>
          )}
          
          {error && (
            <div className="error-container">
              <p>{error}</p>
              <button onClick={() => window.location.reload()}>다시 시도</button>
            </div>
          )}
          
          {!loading && !error && scheduleData.length === 0 && (
            <div className="empty-container">
              <p>오늘의 편성표가 없습니다.</p>
            </div>
          )}
          
          {!loading && !error && scheduleData.map((item) => (
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
                      <div key={i} className="channel-logo">{item.channel}</div>
                    ))}
                  </div>
                </div>
                
                <div className="program-content">
                  {/* 연령 제한 */}
                  <div className="age-rating">{item.ageLimit}개월</div>
                  
                  {/* 상품 이미지 */}
                  <div className="product-image">
                    <img 
                      src={item.image || 'https://via.placeholder.com/300x300/CCCCCC/666666?text=No+Image'} 
                      alt={item.product}
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/300x300/CCCCCC/666666?text=No+Image';
                        e.target.onerror = null;
                      }}
                    />
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