import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../../layout/BottomNav';
import HeaderNavSchedule from '../../layout/HeaderNavSchedule';
import { useUser } from '../../contexts/UserContext';
import { homeShoppingApi } from '../../api/homeShoppingApi';
import api from '../../pages/api';
import emptyHeartIcon from '../../assets/heart_empty.png';
import filledHeartIcon from '../../assets/heart_filled.png';
import '../../styles/schedule.css';

// 홈쇼핑 로고 이미지들
import homeshoppingLogoHomeandshopping from '../../assets/homeshopping_logo_homeandshopping.png';
import homeshoppingLogoHyundai from '../../assets/homeshopping_logo_hyundai.png';
import homeshoppingLogoNs from '../../assets/homeshopping_logo_ns.png';
import homeshoppingLogoNsplus from '../../assets/homeshopping_logo_nsplus.png';
import homeshoppingLogoPlusshop from '../../assets/homeshopping_logo_plusshop.png';
import homeshoppingLogoPublicshopping from '../../assets/homeshopping_logo_publicshopping.png';

const Schedule = () => {
  const navigate = useNavigate();
  const { user, isLoggedIn } = useUser();
  
  // 편성표 관련 상태
  const [selectedDate, setSelectedDate] = useState(null); // 현재 선택된 날짜
  const [searchQuery, setSearchQuery] = useState('');
  
  // 현재 날짜를 기준으로 일주일 날짜 데이터 생성
  const [weekDates, setWeekDates] = useState([]);
  
  // API 관련 상태
  const [scheduleData, setScheduleData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [unlikedProducts, setUnlikedProducts] = useState(new Set()); // 찜 해제된 상품 ID들을 저장
  
  // ref 선언
  const timeSlotsRef = useRef(null);
  
  // 홈쇼핑사 데이터
  const homeshoppingChannels = [
    {
      id: 1,
      name: "홈앤쇼핑",
      logo: homeshoppingLogoHomeandshopping,
      channel: 4
    },
    {
      id: 2,
      name: "현대홈쇼핑",
      logo: homeshoppingLogoHyundai,
      channel: 12
    },
    {
      id: 3,
      name: "현대홈쇼핑+샵",
      logo: homeshoppingLogoPlusshop,
      channel: 34
    },
    {
      id: 4,
      name: "NS홈쇼핑",
      logo: homeshoppingLogoNs,
      channel: 13
    },
    {
      id: 5,
      name: "NS샵+",
      logo: homeshoppingLogoNsplus,
      channel: 41
    },
    {
      id: 6,
      name: "공영쇼핑",
      logo: homeshoppingLogoPublicshopping,
      channel: 20
    }
  ];
  
  // 선택된 시간 상태
  const [selectedTime, setSelectedTime] = useState(null);
  
  // 시간 클릭 핸들러
  const handleTimeClick = (time) => {
    if (selectedTime === time) {
      setSelectedTime(null); // 같은 시간을 다시 클릭하면 선택 해제
    } else {
      setSelectedTime(time); // 새로운 시간 선택
      
      // 선택한 시간을 두 번째 위치에 보이도록 스크롤 조정
      setTimeout(() => {
        if (timeSlotsRef.current) {
          const timeIndex = timeSlots.findIndex(t => t === time);
          if (timeIndex !== -1) {
            const timeSlotWidth = 60; // 각 시간 슬롯의 너비
            const scrollPosition = Math.max(0, (timeIndex - 1) * timeSlotWidth);
            timeSlotsRef.current.scrollLeft = scrollPosition;
          }
        }
      }, 100);
    }
  };
  
  // 시간대 데이터 - 01:00부터 24시간 생성
  const getTimeSlots = () => {
    const timeSlots = [];
    
    // 01:00부터 24:00까지 24시간 생성
    for (let i = 1; i <= 24; i++) {
      const hour = i.toString().padStart(2, '0');
      timeSlots.push(`${hour}:00`);
    }
    
    return timeSlots;
  };

  const timeSlots = getTimeSlots();
  
  // 날짜와 시간에 따른 스케줄 필터링 함수
  const getFilteredScheduleData = () => {
    if (!scheduleData || scheduleData.length === 0) return [];
    
    let filteredData = [...scheduleData];
    
    // 날짜 필터링
    if (selectedDate) {
      const selectedDateObj = new Date(selectedDate);
      filteredData = filteredData.filter(item => {
        const itemDate = new Date(item.live_date);
        return itemDate.toDateString() === selectedDateObj.toDateString();
      });
    }
    
    // 시간 필터링
    if (selectedTime) {
      const [selectedHour] = selectedTime.split(':').map(Number);
      filteredData = filteredData.filter(item => {
        const [itemStartHour] = item.live_start_time.split(':').map(Number);
        const [itemEndHour] = item.live_end_time.split(':').map(Number);
        
        // 선택된 시간이 방송 시간 범위에 포함되는지 확인
        return selectedHour >= itemStartHour && selectedHour < itemEndHour;
      });
    }
    
    return filteredData;
  };
  
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
  
  // 스케줄 데이터 가져오기
  useEffect(() => {
    let isMounted = true;
    
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // API는 page, size 파라미터만 받음 (selectedDate는 사용하지 않음)
        const response = await homeShoppingApi.getSchedule(1, 20);
        
        // 컴포넌트가 마운트된 상태에서만 상태 업데이트
        if (isMounted) {
          console.log('📺 API 응답 전체:', response);
          console.log('📺 API 응답 schedules:', response.data?.schedules);
          
          if (response && response.data && response.data.schedules) {
            console.log('✅ schedules 배열 길이:', response.data.schedules.length);
            console.log('✅ 첫 번째 schedule:', response.data.schedules[0]);
            
            // 가격 데이터 상세 로그
            const firstItem = response.data.schedules[0];
            console.log('💰 가격 데이터 상세:');
            console.log('  - original_price:', firstItem.original_price, typeof firstItem.original_price);
            console.log('  - discounted_price:', firstItem.discounted_price, typeof firstItem.discounted_price);
            console.log('  - discount_rate:', firstItem.discount_rate, typeof firstItem.discount_rate);
            
            // 첫 번째 아이템의 모든 필드 확인
            console.log('🔍 첫 번째 아이템 전체 필드:');
            console.log(Object.keys(firstItem));
            console.log('📋 첫 번째 아이템 전체 데이터:', JSON.stringify(firstItem, null, 2));
            
            // API 응답에 status 필드가 없으므로 계산해서 추가
            const schedulesWithStatus = response.data.schedules.map(item => {
              const now = new Date();
              const liveStart = new Date(`${item.live_date} ${item.live_start_time}`);
              const liveEnd = new Date(`${item.live_date} ${item.live_end_time}`);
              
              let status = 'LIVE 예정';
              if (now >= liveStart && now <= liveEnd) {
                status = 'LIVE';
              } else if (now > liveEnd) {
                status = '종료';
              }
              
              return {
                ...item,
                status
              };
            });
            
            setScheduleData(schedulesWithStatus);
          } else {
            console.log('❌ API 응답에 schedules가 없음');
            console.log('❌ response:', response);
            console.log('❌ response.data:', response?.data);
            console.log('❌ response.data.schedules:', response?.data?.schedules);
            setScheduleData([]);
          }
        }
        
      } catch (error) {
        if (isMounted) {
          console.error('스케줄 데이터 가져오기 실패:', error);
          setError('스케줄 데이터를 가져올 수 없습니다.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    
    fetchData();
    
    // 컴포넌트 언마운트 시 정리 함수
    return () => {
      isMounted = false;
    };
  }, []); // selectedDate 의존성 제거
  
  // 시간대 스크롤 위치 조정 (현재 시간이 두 번째 위치에 오도록)
  useEffect(() => {
    if (timeSlotsRef.current) {
      const currentTimeIndex = getCurrentTimeIndex();
      if (currentTimeIndex !== -1) {
        // 현재 시간이 두 번째 위치에 오도록 스크롤 조정
        const timeSlotWidth = 60; // 각 시간대의 너비
        const scrollPosition = Math.max(0, (currentTimeIndex - 1) * timeSlotWidth);
        timeSlotsRef.current.scrollLeft = scrollPosition;
      }
    }
  }, [timeSlots]);
  


  // 현재 시간 가져오기
  const getCurrentTime = () => {
    const now = new Date();
    return `${now.getHours().toString().padStart(2, '0')}:00`;
  };

  // 현재 시간인지 확인
  const isCurrentTime = (time) => {
    return time === getCurrentTime();
  };

  // 현재 시간이 시간대 배열에서 몇 번째 위치인지 찾기
  const getCurrentTimeIndex = () => {
    const currentTime = getCurrentTime();
    return timeSlots.findIndex(time => time === currentTime);
  };

  // 위시리스트 토글
  const toggleWishlist = async (itemId) => {
    try {
      // TODO: 실제 API 호출로 대체
      // await wishlistApi.toggleWishlist(itemId);
      
      console.log(`위시리스트 토글: ${itemId}`);
      
      // 애니메이션 효과 추가
      const wishlistBtn = document.querySelector(`[data-item-id="${itemId}"]`);
      if (wishlistBtn) {
        const currentItem = scheduleData.find(item => item.live_id === itemId);
        if (currentItem?.wishlist) {
          // 찜 해제 애니메이션
          wishlistBtn.classList.add('unliked');
          setTimeout(() => wishlistBtn.classList.remove('unliked'), 400);
        } else {
          // 찜 추가 애니메이션
          wishlistBtn.classList.add('liked');
          setTimeout(() => wishlistBtn.classList.remove('liked'), 600);
        }
      }
      
    } catch (err) {
      console.error('위시리스트 토글 실패:', err);
      alert('위시리스트 처리에 실패했습니다. 다시 시도해주세요.');
    }
  };

  // 찜 토글 함수 (홈쇼핑 상품용)
  const handleHeartToggle = async (productId) => {
    try {
      // 토큰 확인
      const token = localStorage.getItem('access_token');
      if (!token) {
        console.log('토큰이 없어서 로그인 페이지로 이동');
        window.location.href = '/';
        return;
      }

      console.log('찜 토글 시도 - productId:', productId);
      console.log('사용 중인 토큰:', token.substring(0, 20) + '...');
      console.log('전달할 데이터:', { product_id: productId });
      console.log('productId 타입:', typeof productId);

      // 홈쇼핑 상품 찜 토글 API 호출
      const response = await api.post('/api/homeshopping/likes/toggle', {
        product_id: productId
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('찜 토글 응답:', response.data);

      // 찜 토글 성공 후 하트 아이콘만 즉시 변경
      if (response.data) {
        console.log('찜 토글 성공! 하트 아이콘 상태만 변경합니다.');
        
        // 하트 아이콘 상태만 토글 (즉시 피드백)
        setUnlikedProducts(prev => {
          const newSet = new Set(prev);
          if (newSet.has(productId)) {
            // 찜 해제된 상태에서 찜 추가
            newSet.delete(productId);
            console.log('찜이 추가되었습니다. 채워진 하트로 변경됩니다.');
          } else {
            // 찜된 상태에서 찜 해제
            newSet.add(productId);
            console.log('찜이 해제되었습니다. 빈 하트로 변경됩니다.');
          }
          return newSet;
        });
        
        // 애니메이션 효과 추가
        const heartButton = document.querySelector(`[data-product-id="${productId}"]`);
        if (heartButton) {
          heartButton.style.transform = 'scale(1.2)';
          setTimeout(() => {
            heartButton.style.transform = 'scale(1)';
          }, 150);
        }
      }
      
    } catch (err) {
      console.error('찜 토글 실패:', err);
      console.error('에러 상세 정보:', {
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
        message: err.message
      });
      
      // 401 에러 (인증 실패) 시 로그인 페이지로 이동
      if (err.response?.status === 401) {
        alert('로그인이 필요합니다.');
        window.location.href = '/';
        return;
      }
      
      // 다른 에러의 경우 사용자에게 알림
      alert('찜 상태 변경에 실패했습니다. 다시 시도해주세요.');
    }
  };

  // 알림 핸들러
  const handleNotification = () => {
    navigate('/notifications');
  };

  // 방송 상태 표시 함수
  const renderStatusBadge = (status) => {
    let statusText = '';
    let statusClass = '';
    
    switch (status) {
      case 'live':
        statusText = 'LIVE';
        statusClass = 'status-live';
        break;
      case 'live 예정':
        statusText = 'LIVE 예정';
        statusClass = 'status-upcoming';
        break;
      case '종료':
        statusText = '종료';
        statusClass = 'status-ended';
        break;
      default:
        statusText = '알 수 없음';
        statusClass = 'status-unknown';
    }
    
    return (
      <div className={`status-badge ${statusClass}`}>
        {statusText}
      </div>
    );
  };

  // 왼쪽 탭 렌더링
  const renderLeftSidebar = () => {
    const handleChannelClick = (channel) => {
      console.log('채널 클릭:', {
        id: channel.id,
        name: channel.name,
        channel: channel.channel
      });
    };

    return (
      <div className="left-sidebar">
        <div className="channel-list">
          {homeshoppingChannels.map((channel) => (
            <div key={channel.id} className="channel-item">
              <div 
                className="schedule-channel-logo"
                onClick={() => handleChannelClick(channel)}
                style={{ cursor: 'pointer' }}
              >
                <img src={channel.logo} alt={channel.name} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // 에러 메시지 렌더링
  const renderErrorMessage = () => {
    if (error) {
      return (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>새로고침</button>
        </div>
      );
    }
    return null;
  };

  // 로딩 상태 렌더링
  const renderLoading = () => {
    if (isLoading) {
      return (
        <div className="loading-message">
          <p>편성표를 불러오는 중...</p>
        </div>
      );
    }
    return null;
  };

    // 편성표 목록 렌더링
  const renderScheduleList = () => {
    const filteredData = getFilteredScheduleData();
    
    if (!filteredData || filteredData.length === 0) {
      if (selectedDate || selectedTime) {
        return <div className="no-schedule">선택한 날짜/시간에 방송 일정이 없습니다.</div>;
      }
      return <div className="no-schedule">방송 일정이 없습니다.</div>;
    }

    // 전체 방송 시간 범위 계산
    const startTime = filteredData[0]?.live_start_time?.substring(0, 5) || '';
    const endTime = filteredData[filteredData.length - 1]?.live_end_time?.substring(0, 5) || '';

    return (
      <div className="schedule-timeline">
        {filteredData.map((item) => {
          console.log('스케줄 아이템 product_id:', item.product_id, typeof item.product_id);
          
          // 각 아이템의 방송 시간 계산
          const itemStartTime = item.live_start_time?.substring(0, 5) || '';
          const itemEndTime = item.live_end_time?.substring(0, 5) || '';
          
          return (
            <div key={item.live_id} className="schedule-item-wrapper">
              {/* 각 홈쇼핑마다 시간 범위를 흰색 박스 밖에 표시 */}
              <div className="schedule-time-header">
                <span className="time-range">
                  {itemStartTime} ~ {itemEndTime}
                </span>
              </div>
              
              <div className="schedule-item">
                <div className="schedule-content">
                <div className="schedule-image">
                  <img src={item.thumb_img_url} alt={item.product_name} />
                  {renderStatusBadge(item.status)}
                </div>
                <div className="schedule-info">
                  <div className="channel-info">
                    <span className="schedule-channel-name">{item.homeshopping_name}</span>
                  </div>
                  <div className="schedule-product-meta">
                    <div className="schedule-product-name">{item.product_name}</div>
                  </div>
                  <div className="schedule-price-info">
                    <div className="schedule-original-price">{item.original_price?.toLocaleString() || '0'}원</div>
                    <div className="schedule-price-row">
                      <div className="schedule-discount-display">
                        <span className="schedule-discount-rate">{item.discount_rate || '0'}%</span>
                        <span className="schedule-discount-price">{item.discounted_price?.toLocaleString() || '0'}원</span>
                      </div>
                      <div className="schedule-wishlist-btn">
                        <button 
                          className="heart-button"
                          data-product-id={item.product_id}
                          onClick={(e) => {
                            e.stopPropagation(); // 카드 클릭 이벤트 전파 방지
                            handleHeartToggle(item.product_id);
                          }}>
                          <img 
                            src={unlikedProducts.has(item.product_id) ? emptyHeartIcon : filledHeartIcon} 
                            alt="찜 토글" 
                            className="heart-icon"
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

  return (
    <div className="schedule-page">
      {/* 편성표 헤더 네비게이션 */}
      <HeaderNavSchedule 
        onBackClick={() => navigate(-1)}
        onSearchClick={(searchTerm) => navigate('/homeshopping/search?type=homeshopping')}
        onNotificationClick={handleNotification}
      />

      <div className="schedule-main-container">
        {/* 메인 콘텐츠 */}
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
                          console.log('오늘 날짜 선택 해제');
                        } else {
                          // 선택되지 않은 상태라면 선택
                          setSelectedDate(item.dateKey);
                          console.log('오늘 날짜 선택:', item.dateKey);
                        }
                      } else {
                        // 다른 날짜 클릭 시 해당 날짜 선택
                        setSelectedDate(item.dateKey);
                        console.log('날짜 선택:', item.dateKey);
                      }
                    }}
                  >
                    <div className="date-number">{item.date}</div>
                    <div className="date-day">{item.day}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 시간대와 편성표 영역 */}
          <div className="schedule-main-area">
            {/* 시간대 표시 */}
            <div className="time-slots-container">
              <div className="time-slots" ref={timeSlotsRef}>
                {timeSlots.map((time, index) => (
                  <div 
                    key={index} 
                    className={`time-slot ${isCurrentTime(time) ? 'current-time' : ''} ${selectedTime === time ? 'selected-time' : ''}`}
                    onClick={() => handleTimeClick(time)}
                  >
                    {time}
                  </div>
                ))}
              </div>
            </div>

            {/* 편성표 메인 영역 */}
            <div className="schedule-main-content">
              {/* 왼쪽 사이드바 */}
              {renderLeftSidebar()}
              {/* 편성표 콘텐츠 */}
              <div className="schedule-content-main">
                
                
                {/* 에러 메시지 */}
                {renderErrorMessage()}
                
                {/* 로딩 상태 */}
                {renderLoading()}
                
                {/* 편성표 목록 */}
                {renderScheduleList()}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <BottomNav />
    </div>
  );
};

export default Schedule;