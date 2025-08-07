// React와 필요한 훅들을 가져옵니다
import React, { useState, useEffect } from 'react';
// 편성표 헤더 컴포넌트를 가져옵니다
import { ScheduleHeader } from '../../layout/HeaderNav';
// 하단 네비게이션 컴포넌트를 가져옵니다
import BottomNav from '../../layout/BottomNav';
// 편성표 페이지 스타일을 가져옵니다
import '../../styles/schedule.css';
// API 설정을 가져옵니다
import api from '../api';

// 홈쇼핑 로고 이미지들을 가져옵니다
import homeshopping_logo_publicshopping from '../../assets/homeshopping_logo_publicshopping.png'; // 공영홈쇼핑 로고
import homeshoppingLogoPlusshop from '../../assets/homeshopping_logo_plusshop.png'; // 플러스샵 로고
import homeshoppingLogoNsplus from '../../assets/homeshopping_logo_nsplus.png'; // NS플러스 로고
import homeshoppingLogoNs from '../../assets/homeshopping_logo_ns.png'; // NS홈쇼핑 로고
import homeshoppingLogoHyundai from '../../assets/homeshopping_logo_hyundai.png'; // 현대홈쇼핑 로고
import homeshoppingLogoHomeandshopping from '../../assets/homeshopping_logo_homeandshopping.png'; // 홈앤쇼핑 로고

// 편성표 메인 컴포넌트를 정의합니다
const Schedule = () => {
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

  // 브랜드명에 따른 로고 이미지를 반환하는 함수를 정의합니다
  const getBrandLogo = (brandName) => {
    // 브랜드명과 로고 이미지를 매핑하는 객체를 정의합니다
    const brandLogos = {
      'publicshopping': homeshopping_logo_publicshopping, // 공영홈쇼핑
      'plusshop': homeshoppingLogoPlusshop, // 플러스샵
      'nsplus': homeshoppingLogoNsplus, // NS플러스
      'ns': homeshoppingLogoNs, // NS홈쇼핑
      'hyundai': homeshoppingLogoHyundai, // 현대홈쇼핑
      'homeandshopping': homeshoppingLogoHomeandshopping, // 홈앤쇼핑
    };
    
    // 브랜드명을 소문자로 변환하여 매칭합니다 (대소문자 구분 없이)
    const brandKey = brandName.toLowerCase();
    // 매칭되는 로고가 있으면 반환하고, 없으면 공영홈쇼핑 로고를 기본값으로 반환합니다
    return brandLogos[brandKey] || brandLogos['publicshopping'];
  };

  // 백엔드 API에서 편성표 데이터를 가져오는 useEffect를 정의합니다 (API 명세서에 맞춰 수정)
  useEffect(() => {
    // 비동기 함수로 편성표 데이터를 가져옵니다
    const fetchScheduleData = async () => {
      try {
        // 로딩 상태를 true로 설정합니다
        setLoading(true);
        
        // API 명세서에 맞춰 쿼리 파라미터를 설정합니다
        const today = new Date();
        const date = today.toISOString().split('T')[0]; // YYYY-MM-DD 형식
        const hour = today.getHours(); // 현재 시간
        
        // FastAPI 서버의 편성표 엔드포인트에 GET 요청을 보냅니다 (API 명세서에 맞춰 수정)
        const response = await api.get(`/api/home-shopping/schedule?date=${date}&hour=${hour}`);
        
        // 응답 데이터를 가져옵니다
        const data = response.data;
        // 파싱된 데이터를 상태에 저장합니다
        setScheduleData(data);
      } catch (err) {
        // 에러가 발생하면 콘솔에 에러를 출력합니다
        console.error('편성표 데이터 로딩 실패:', err);
        // API 연결 실패 시 에러 대신 임시 데이터를 사용한다는 로그를 출력합니다
        console.log('임시 데이터를 사용합니다.');
        
        // 임시 데이터를 상태에 설정합니다 (API 연결 전까지 사용) - API 명세서 구조에 맞춰 수정
        const today = new Date();
        const date = today.toISOString().split('T')[0]; // YYYY-MM-DD 형식
        const time = `${today.getHours()}:${String(today.getMinutes()).padStart(2, '0')}`; // HH:MM 형식
        
        setScheduleData({
          date: date, // 날짜 정보 (API에서 받아옴)
          time: time, // 시간 정보 (API에서 받아옴)
          channel_id: null, // 채널 아이디 (API에서 받아옴)
          schedule: [ // 스케줄 목록 (API에서 받아옴)
            {
              홈쇼핑_아이디: 1, // 홈쇼핑 아이디 (API에서 받아옴)
              홈쇼핑명: 'NS플러스', // 홈쇼핑명 (API에서 받아옴)
              채널명: 'NS플러스 홈쇼핑', // 채널명 (API에서 받아옴)
              채널로고: '/test1.png', // 채널로고 (API에서 받아옴)
              원가: '27,800원', // 원가 (API에서 받아옴)
              할인율: '51%', // 할인율 (API에서 받아옴)
              할인된가격: '13,600원', // 할인된가격 (API에서 받아옴)
              시작시간: '16:30', // 시작시간 (API에서 받아옴)
              썸네일: '/test1.png', // 썸네일 (API에서 받아옴)
              알림여부: true, // 알림여부 (API에서 받아옴)
              상품명: '농팜 | [농팜] (1+1) 당일제조 전라도식 김치 파김치 500g' // 상품명 (API에서 받아옴)
            },
            {
              홈쇼핑_아이디: 2, // 홈쇼핑 아이디 (API에서 받아옴)
              홈쇼핑명: '현대홈쇼핑', // 홈쇼핑명 (API에서 받아옴)
              채널명: '현대홈쇼핑', // 채널명 (API에서 받아옴)
              채널로고: '/test2.png', // 채널로고 (API에서 받아옴)
              원가: '27,800원', // 원가 (API에서 받아옴)
              할인율: '51%', // 할인율 (API에서 받아옴)
              할인된가격: '13,600원', // 할인된가격 (API에서 받아옴)
              시작시간: '16:41', // 시작시간 (API에서 받아옴)
              썸네일: '/test2.png', // 썸네일 (API에서 받아옴)
              알림여부: false, // 알림여부 (API에서 받아옴)
              상품명: '농팜 | [농팜] (1+1) 당일제조 전라도식 김치 파김치 500g' // 상품명 (API에서 받아옴)
            },
            {
              홈쇼핑_아이디: 3, // 홈쇼핑 아이디 (API에서 받아옴)
              홈쇼핑명: '플러스샵', // 홈쇼핑명 (API에서 받아옴)
              채널명: '플러스샵', // 채널명 (API에서 받아옴)
              채널로고: '/test3.png', // 채널로고 (API에서 받아옴)
              원가: '27,800원', // 원가 (API에서 받아옴)
              할인율: '51%', // 할인율 (API에서 받아옴)
              할인된가격: '13,600원', // 할인된가격 (API에서 받아옴)
              시작시간: '18:40', // 시작시간 (API에서 받아옴)
              썸네일: '/test3.png', // 썸네일 (API에서 받아옴)
              알림여부: true, // 알림여부 (API에서 받아옴)
              상품명: '농팜 | [농팜] (1+1) 당일제조 전라도식 김치 파김치 500g' // 상품명 (API에서 받아옴)
            },
            {
              홈쇼핑_아이디: 4, // 홈쇼핑 아이디 (API에서 받아옴)
              홈쇼핑명: '공영홈쇼핑', // 홈쇼핑명 (API에서 받아옴)
              채널명: '공영홈쇼핑', // 채널명 (API에서 받아옴)
              채널로고: '/test1.png', // 채널로고 (API에서 받아옴)
              원가: '27,800원', // 원가 (API에서 받아옴)
              할인율: '51%', // 할인율 (API에서 받아옴)
              할인된가격: '13,600원', // 할인된가격 (API에서 받아옴)
              시작시간: '20:00', // 시작시간 (API에서 받아옴)
              썸네일: '/test1.png', // 썸네일 (API에서 받아옴)
              알림여부: false, // 알림여부 (API에서 받아옴)
              상품명: '농팜 | [농팜] (1+1) 당일제조 전라도식 김치 파김치 500g' // 상품명 (API에서 받아옴)
            }
          ]
        });
      } finally {
        // try-catch 블록이 끝나면 항상 로딩 상태를 false로 설정합니다
        setLoading(false);
      }
    };

    // 컴포넌트가 마운트될 때 데이터를 가져오는 함수를 실행합니다
    fetchScheduleData();
  }, []); // 빈 배열을 의존성으로 설정하여 컴포넌트 마운트 시에만 실행됩니다

  // 편성표 버튼 클릭 시 실행되는 핸들러 함수를 정의합니다
  const handleScheduleClick = () => {
    // 콘솔에 클릭 로그를 출력합니다
    console.log('편성표 버튼 클릭');
    // 편성표 관련 기능을 구현할 예정입니다
  };

  // 알림 버튼 클릭 시 실행되는 핸들러 함수를 정의합니다
  const handleNotificationClick = () => {
    // 콘솔에 클릭 로그를 출력합니다
    console.log('알림 버튼 클릭');
    // 알림 관련 기능을 구현할 예정입니다
  };

  // 상품 카드 클릭 시 실행되는 핸들러 함수를 정의합니다
  const handleProductClick = (productId) => {
    // 콘솔에 클릭된 상품 ID를 출력합니다
    console.log('상품 클릭:', productId);
    // 상품 상세 페이지로 이동하는 기능을 구현할 예정입니다
  };

  // 현재 시간과 비교하여 방송 중/방송예정을 구분하는 함수를 정의합니다
  const getBroadcastStatus = (startTime) => {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes(); // 현재 시간을 분으로 변환
    
    const [hours, minutes] = startTime.split(':').map(Number);
    const startTimeInMinutes = hours * 60 + minutes; // 시작 시간을 분으로 변환
    
    // 시작 시간이 현재 시간보다 이전이면 방송 중, 이후면 방송예정
    return startTimeInMinutes <= currentTime ? '방송 중' : '방송예정';
  };

  // 스케줄 데이터를 방송 중과 방송예정으로 분류합니다
  const onAirItems = scheduleData.schedule.filter(item => getBroadcastStatus(item.시작시간) === '방송 중');
  const scheduledItems = scheduleData.schedule.filter(item => getBroadcastStatus(item.시작시간) === '방송예정');

  // 로딩 중일 때 표시할 UI를 렌더링합니다
  if (loading) {
    return (
      <div className="schedule-page">
        {/* 편성표 헤더 컴포넌트를 렌더링합니다 */}
        <ScheduleHeader
          onScheduleClick={handleScheduleClick}
          onNotificationClick={handleNotificationClick}
        />
        {/* 메인 콘텐츠 영역 */}
        <div className="schedule-content">
          {/* 로딩 메시지를 표시합니다 */}
          <div className="loading">편성표를 불러오는 중...</div>
        </div>
        {/* 하단 네비게이션을 렌더링합니다 */}
        <BottomNav />
      </div>
    );
  }

  // 에러가 발생했을 때 표시할 UI를 렌더링합니다
  if (error) {
    return (
      <div className="schedule-page">
        {/* 편성표 헤더 컴포넌트를 렌더링합니다 */}
        <ScheduleHeader
          onScheduleClick={handleScheduleClick}
          onNotificationClick={handleNotificationClick}
        />
        {/* 메인 콘텐츠 영역 */}
        <div className="schedule-content">
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
    <div className="schedule-page">
      {/* 편성표 헤더 */}
      <ScheduleHeader
        onScheduleClick={handleScheduleClick}
        onNotificationClick={handleNotificationClick}
      />

      {/* 메인 콘텐츠 */}
      <div className="schedule-content">
        {/* 날짜 및 방송 상태 */}
        <div className="schedule-header-info">
          {/* 날짜를 표시합니다 (API에서 받아옴) */}
          <div className="date">{scheduleData.date}</div>
          {/* 방송 상태를 표시합니다 */}
          <div className="broadcast-status">방송 중</div>
        </div>

        {/* 방송 중 섹션 */}
        <div 
          className="schedule-section on-air"
          style={{
            '--on-air-image': onAirItems.length > 0 ? `url(${onAirItems[0].썸네일})` : 'none'
          }}
        >
          {/* 섹션 제목
          <h3 className="section-title">방송 중</h3> */}
          {/* 상품 카드들을 담는 컨테이너 */}
          <div className="product-cards">
            {/* 방송 중인 상품들을 map으로 순회하며 렌더링합니다 (API에서 받아옴) */}
            {onAirItems.map((item) => (
              <div
                key={item.홈쇼핑_아이디} // 홈쇼핑 아이디 (API에서 받아옴)
                className="product-card"
                onClick={() => handleProductClick(item.홈쇼핑_아이디)}
              >
                {/* 카드 내부 레이아웃 컨테이너 */}
                <div className="card-layout">
                  {/* 왼쪽: 날짜/방송 상태 */}
                  <div className="status-info">
                    {/* 방송 상태 텍스트 */}
                    <div className="broadcast-status">방송 중</div>
                  </div>
                  
                  {/* 중앙: 상품 정보 */}
                  <div className="product-info">
                    {/* 상품 상세 정보 컨테이너 */}
                    <div className="product-details">
                      {/* 가격 정보 컨테이너 */}
                      <div className="price-info">
                        {/* 할인율을 표시합니다 (API에서 받아옴) */}
                        <span className="discount">{item.할인율}</span>
                        {/* 할인된 가격을 표시합니다 (API에서 받아옴) */}
                        <span className="price">{item.할인된가격}</span>
                      </div>
                      {/* 브랜드 정보 컨테이너 */}
                      <div className="brand-info">
                        {/* 브랜드 로고 컨테이너 */}
                        <div className="brand-logo">
                          {/* 브랜드 로고 이미지 (API에서 받아온 홈쇼핑명으로 매핑) */}
                          <img
                            src={getBrandLogo(item.홈쇼핑명)}
                            alt={item.홈쇼핑명}
                            className="brand-image"
                          />
                        </div>
                        {/* 채널명을 표시합니다 (API에서 받아옴) */}
                        <span className="channel">{item.채널명}</span>
                      </div>
                      {/* 상품명을 표시합니다 (API에서 받아옴) */}
                      <div className="product-name">{item.상품명}</div>
                    </div>
                  </div>
                  
                  {/* 오른쪽: 상품 이미지 (시간 표시 포함) */}
                  <div className="product-image-container">
                    {/* 시간 오버레이를 표시합니다 (API에서 받아옴) */}
                    <div className="time-overlay">{item.시작시간}</div>
                    {/* 상품 이미지 컨테이너 */}
                    <div className="product-image">
                      {/* 상품 이미지를 표시합니다 (API에서 받아옴) */}
                      <img src={item.썸네일} alt={item.상품명} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 방송예정 섹션 */}
        <div 
          className="schedule-section on-air"
          style={{
            '--on-air-image': scheduledItems.length > 0 ? `url(${scheduledItems[0].썸네일})` : 'none'
          }}
        >
          {/* 섹션 제목
          <h3 className="section-title">방송예정</h3> */}
          {/* 상품 카드들을 담는 컨테이너 */}
          <div className="product-cards">
            {/* 방송 예정인 상품들을 map으로 순회하며 렌더링합니다 (API에서 받아옴) */}
            {scheduledItems.map((item) => (
              <div
                key={item.홈쇼핑_아이디} // 홈쇼핑 아이디 (API에서 받아옴)
                className="product-card"
                onClick={() => handleProductClick(item.홈쇼핑_아이디)}
              >
                {/* 카드 내부 레이아웃 컨테이너 */}
                <div className="card-layout">
                  {/* 왼쪽: 날짜/방송 상태 */}
                  <div className="status-info">
                    {/* 방송 상태 텍스트 */}
                    <div className="broadcast-status scheduled">방송예정</div>
                  </div>
                  
                  {/* 중앙: 상품 정보 */}
                  <div className="product-info">
                    {/* 상품 상세 정보 컨테이너 */}
                    <div className="product-details">
                      {/* 가격 정보 컨테이너 */}
                      <div className="price-info">
                        {/* 할인율을 표시합니다 (API에서 받아옴) */}
                        <span className="discount">{item.할인율}</span>
                        {/* 할인된 가격을 표시합니다 (API에서 받아옴) */}
                        <span className="price">{item.할인된가격}</span>
                      </div>
                      {/* 브랜드 정보 컨테이너 */}
                      <div className="brand-info">
                        {/* 브랜드 로고 컨테이너 */}
                        <div className="brand-logo">
                          {/* 브랜드 로고 이미지 (API에서 받아온 홈쇼핑명으로 매핑) */}
                          <img
                            src={getBrandLogo(item.홈쇼핑명)}
                            alt={item.홈쇼핑명}
                            className="brand-image"
                          />
                        </div>
                        {/* 채널명을 표시합니다 (API에서 받아옴) */}
                        <span className="channel">{item.채널명}</span>
                      </div>
                      {/* 상품명을 표시합니다 (API에서 받아옴) */}
                      <div className="product-name">{item.상품명}</div>
                    </div>
                  </div>
                  
                  {/* 오른쪽: 상품 이미지 (시간 표시 포함) */}
                  <div className="product-image-container">
                    {/* 시간 오버레이를 표시합니다 (API에서 받아옴) */}
                    <div className="time-overlay">{item.시작시간}</div>
                    {/* 상품 이미지 컨테이너 */}
                    <div className="product-image">
                      {/* 상품 이미지를 표시합니다 (API에서 받아옴) */}
                      <img src={item.썸네일} alt={item.상품명} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 하단 네비게이션 */}
      <BottomNav />
    </div>
  );
};

// Schedule 컴포넌트를 기본 내보내기로 설정합니다
export default Schedule; 