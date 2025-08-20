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
  
  // 라이브 스트림 관련 상태
  const [liveStreamData, setLiveStreamData] = useState({});
  const [isStreamLoading, setIsStreamLoading] = useState(false);
  
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
            
            setScheduleData(response.data.schedules);
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
  
  // 시간대 스크롤 위치 조정 (현재 시간이 적절한 위치에 보이도록)
  useEffect(() => {
    if (timeSlotsRef.current) {
      const currentTimeIndex = getCurrentTimeIndex();
      if (currentTimeIndex !== -1) {
        // 현재 시간이 중앙에 오도록 스크롤 조정
        const timeSlotWidth = 60; // 각 시간대의 너비
        const scrollPosition = Math.max(0, (currentTimeIndex - 2) * timeSlotWidth);
        timeSlotsRef.current.scrollLeft = scrollPosition;
      }
    }
  }, [timeSlots]);
  
  // 시간 클릭 핸들러
  const handleTimeClick = (time) => {
    setSelectedTime(time);
    console.log('선택된 시간:', time);
    
    // TODO: 선택된 시간에 해당하는 편성표 데이터 로드
    // fetchScheduleDataByTime(time);
  };

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

  // 상품 클릭 핸들러 - 상품 상세 페이지로 이동
  const handleProductClick = async (productId) => {
    try {
      console.log('상품 클릭:', productId);
      
      // 상품 분류 확인 (식재료/완제품)
      const classificationResponse = await homeShoppingApi.checkProductClassification(productId);
      console.log('상품 분류:', classificationResponse);
      
      // 상품 상세 정보 가져오기
      const productDetail = await homeShoppingApi.getProductDetail(productId);
      console.log('상품 상세:', productDetail);
      
      // 상품 상세 페이지로 이동 (상품 ID와 분류 정보 전달)
      navigate(`/homeshopping/product/${productId}`, {
        state: {
          productDetail,
          isIngredient: classificationResponse.is_ingredient,
          fromSchedule: true
        }
      });
      
    } catch (error) {
      console.error('상품 상세 정보 가져오기 실패:', error);
      // 에러가 발생해도 상품 상세 페이지로 이동 (기본 정보만으로)
      navigate(`/homeshopping/product/${productId}`, {
        state: {
          fromSchedule: true
        }
      });
    }
  };

  // 라이브 스트림 URL 가져오기
  const getLiveStreamUrl = async (productId) => {
    try {
      setIsStreamLoading(true);
      const streamData = await homeShoppingApi.getLiveStreamUrl(productId);
      setLiveStreamData(prev => ({
        ...prev,
        [productId]: streamData
      }));
      return streamData;
    } catch (error) {
      console.error('라이브 스트림 URL 가져오기 실패:', error);
      return null;
    } finally {
      setIsStreamLoading(false);
    }
  };

  // 라이브 스트림 재생
  const handleLiveStream = async (productId) => {
    try {
      const streamData = await getLiveStreamUrl(productId);
      if (streamData && streamData.stream_url) {
        // 새 창에서 라이브 스트림 열기
        window.open(streamData.stream_url, '_blank', 'width=800,height=600');
      } else {
        alert('현재 라이브 스트림을 사용할 수 없습니다.');
      }
    } catch (error) {
      console.error('라이브 스트림 재생 실패:', error);
      alert('라이브 스트림을 재생할 수 없습니다.');
    }
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

  // 로그인 상태 확인 함수
  const checkLoginStatus = () => {
    const token = localStorage.getItem('access_token');
    return !!token;
  };

  // 찜 토글 함수 (홈쇼핑 상품용)
  const handleHeartToggle = async (productId) => {
    // 로그인하지 않은 경우 API 호출 건너뜀
    if (!checkLoginStatus()) {
      alert('로그인이 필요한 서비스입니다.');
      return;
    }

    try {
      // 토큰 확인
      const token = localStorage.getItem('access_token');
      if (!token) {
        alert('로그인이 필요한 서비스입니다.');
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
  const renderStatusBadge = (item) => {
    const now = new Date();
    const liveStart = new Date(`${item.live_date} ${item.live_start_time}`);
    const liveEnd = new Date(`${item.live_date} ${item.live_end_time}`);
    
    let statusText = '';
    let statusClass = '';
    
    // 현재 시간이 방송 시작 시간보다 이전이면 "방송 예정"
    if (now < liveStart) {
      statusText = '방송 예정';
      statusClass = 'status-upcoming';
    }
    // 현재 시간이 방송 시작과 종료 시간 사이에 있으면 "LIVE"
    else if (now >= liveStart && now <= liveEnd) {
      statusText = 'LIVE';
      statusClass = 'status-live';
    }
    // 현재 시간이 방송 종료 시간보다 이후면 "방송 종료"
    else if (now > liveEnd) {
      statusText = '방송 종료';
      statusClass = 'status-ended';
    }
    // 기본값
    else {
      statusText = '알 수 없음';
      statusClass = 'status-unknown';
    }
    
    return (
      <div className={`status-badge ${statusClass}`}>
        {statusText}
      </div>
    );
  };

  // 라이브 스트림 버튼 렌더링
  const renderLiveStreamButton = (item) => {
    const now = new Date();
    const liveStart = new Date(`${item.live_date} ${item.live_start_time}`);
    const liveEnd = new Date(`${item.live_date} ${item.live_end_time}`);
    
    // 현재 방송 중인지 확인
    const isCurrentlyLive = now >= liveStart && now <= liveEnd;
    
    if (isCurrentlyLive) {
      return (
        <button 
          className="live-stream-btn"
          onClick={(e) => {
            e.stopPropagation();
            handleLiveStream(item.product_id);
          }}
          disabled={isStreamLoading}
        >
          {isStreamLoading ? '로딩 중...' : '라이브 시청'}
        </button>
      );
    }
    
    return null;
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
    if (!scheduleData || scheduleData.length === 0) {
      return <div className="no-schedule">방송 일정이 없습니다.</div>;
    }

    // 선택된 날짜와 시간에 따라 편성표 필터링
    let filteredScheduleData = scheduleData;

    // 1. 날짜 필터링
    if (selectedDate) {
      filteredScheduleData = filteredScheduleData.filter(item => {
        const itemDate = new Date(item.live_date);
        const selectedDateObj = new Date(selectedDate);
        return itemDate.toDateString() === selectedDateObj.toDateString();
      });
    }

    // 2. 시간 필터링
    if (selectedTime) {
      const selectedHour = parseInt(selectedTime.split(':')[0]);
      filteredScheduleData = filteredScheduleData.filter(item => {
        const startHour = parseInt(item.live_start_time.split(':')[0]);
        const endHour = parseInt(item.live_end_time.split(':')[0]);
        
        // 선택된 시간이 방송 시간 범위에 포함되는지 확인
        return selectedHour >= startHour && selectedHour <= endHour;
      });
    }

    // 필터링된 데이터가 없으면 메시지 표시
    if (filteredScheduleData.length === 0) {
      let message = '방송 일정이 없습니다.';
      if (selectedDate && selectedTime) {
        message = `${selectedDate} ${selectedTime}에 해당하는 방송 일정이 없습니다.`;
      } else if (selectedDate) {
        message = `${selectedDate}에 해당하는 방송 일정이 없습니다.`;
      } else if (selectedTime) {
        message = `${selectedTime}에 해당하는 방송 일정이 없습니다.`;
      }
      return <div className="no-schedule">{message}</div>;
    }

    // 전체 방송 시간 범위 계산 (필터링된 데이터 기준)
    const startTime = filteredScheduleData[0]?.live_start_time?.substring(0, 5) || '';
    const endTime = filteredScheduleData[filteredScheduleData.length - 1]?.live_end_time?.substring(0, 5) || '';

    return (
      <div className="schedule-timeline">
        {/* 필터링 정보 표시 */}
        {(selectedDate || selectedTime) && (
          <div className="schedule-filter-info">
            <span className="filter-label">필터링:</span>
            {selectedDate && (
              <span className="filter-date">
                {new Date(selectedDate).toLocaleDateString('ko-KR', { 
                  month: 'long', 
                  day: 'numeric',
                  weekday: 'long'
                })}
              </span>
            )}
            {selectedTime && (
              <span className="filter-time">
                {selectedTime}
              </span>
            )}
            <button 
              className="clear-filter-btn"
              onClick={() => {
                setSelectedDate(null);
                setSelectedTime(null);
              }}
            >
              필터 초기화
            </button>
          </div>
        )}

        {/* 전체 방송 시간 범위를 위에 표시 */}
        <div className="schedule-time-header">
          <span className="time-range">
            {filteredScheduleData.length > 0 ? 
              `${filteredScheduleData[0]?.live_start_time?.substring(0, 5) || '--:--'} ~ ${filteredScheduleData[0]?.live_end_time?.substring(0, 5) || '--:--'}` : 
              '--:-- ~ --:--'
            }
          </span>
          <span className="schedule-count">
            총 {filteredScheduleData.length}개 방송
          </span>
        </div>
        
        {filteredScheduleData.map((item) => {
          console.log('스케줄 아이템 product_id:', item.product_id, typeof item.product_id);
          return (
            <div 
              key={item.live_id} 
              className="schedule-item"
              onClick={() => handleProductClick(item.product_id)}
              style={{ cursor: 'pointer' }}
            >
              {/* 방송 시간 표시 */}
              <div className="schedule-time-range">
                <span className="time-range">
                  {item.live_start_time?.substring(0, 5) || '--:--'} ~ {item.live_end_time?.substring(0, 5) || '--:--'}
                </span>
              </div>
              
              <div className="schedule-content">
                <div className="schedule-image">
                  <img src={item.thumb_img_url} alt={item.product_name} />
                  {renderStatusBadge(item)}
                  {renderLiveStreamButton(item)}
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