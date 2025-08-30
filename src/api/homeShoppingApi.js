// 홈쇼핑 관련 API 엔드포인트 관리
import api from '../pages/api';

export const homeShoppingApi = {
  // ===== 편성표 관련 =====
  
  // 편성표 조회
  getSchedule: async (liveDate = null) => {
    try {
      // liveDate가 없으면 오늘 날짜로 설정
      const today = new Date();
      const formattedDate = liveDate || today.toISOString().split('T')[0]; // yyyy-mm-dd 형식
      
      console.log('📺 편성표 조회 API 요청:', { live_date: formattedDate });
      
      // API 요청 시 날짜 파라미터만 전달 (limit 파라미터 제거)
      const params = {};
      if (liveDate) {
        params.live_date = formattedDate;
      }
      
      // limit 파라미터 제거 - 백엔드에서 지원하지 않을 수 있음
      // params.limit = 10000; // 백엔드에서 limit을 지원한다면 이 줄을 활성화
      
      const response = await api.get('/api/homeshopping/schedule', { params });
      console.log('✅ 편성표 조회 API 응답:', response); // response.data가 아닌 response 전체 반환
      return response;
    } catch (error) {
      console.error('❌ 편성표 조회 실패:', error);
      throw error;
    }
  },

  // 편성표 전체 데이터 조회 (페이지네이션을 통한 모든 데이터 수집)
  getScheduleAll: async (liveDate = null) => {
    try {
      // liveDate가 없으면 오늘 날짜로 설정
      const today = new Date();
      const formattedDate = liveDate || today.toISOString().split('T')[0]; // yyyy-mm-dd 형식
      
      console.log('📺 편성표 전체 데이터 조회 시작:', { live_date: formattedDate });
      
      let allSchedules = [];
      let page = 1;
      let hasMore = true;
      const pageSize = 100; // 한 번에 가져올 데이터 개수
      let lastResponse = null; // 마지막 응답을 저장할 변수
      
      // 페이지네이션을 통해 모든 데이터 수집
      while (hasMore) {
        const params = {
          page: page,
          size: pageSize
        };
        
        if (liveDate) {
          params.live_date = formattedDate;
        }
        
        console.log(`📺 편성표 페이지 ${page} 조회:`, params);
        
        const response = await api.get('/api/homeshopping/schedule', { params });
        lastResponse = response; // 마지막 응답 저장
        
        if (response && response.data && response.data.schedules) {
          const schedules = response.data.schedules;
          allSchedules = [...allSchedules, ...schedules];
          
          console.log(`📺 페이지 ${page} 데이터 수:`, schedules.length);
          
          // 더 이상 데이터가 없거나 페이지 크기보다 적으면 종료
          if (schedules.length === 0 || schedules.length < pageSize) {
            hasMore = false;
          } else {
            page++;
          }
        } else {
          console.log(`📺 페이지 ${page}에 데이터 없음`);
          hasMore = false;
        }
      }
      
      console.log('✅ 편성표 전체 데이터 조회 완료:', {
        totalPages: page - 1,
        totalSchedules: allSchedules.length,
        live_date: formattedDate
      });
      
      // 마지막 응답이 있으면 그 구조를 사용하고, 없으면 기본 구조 생성
      if (lastResponse) {
        const finalResponse = {
          ...lastResponse,
          data: {
            ...lastResponse.data,
            schedules: allSchedules
          }
        };
        return finalResponse;
      } else {
        // 응답이 없는 경우 기본 구조 반환
        return {
          data: {
            schedules: allSchedules
          }
        };
      }
      
    } catch (error) {
      console.error('❌ 편성표 전체 데이터 조회 실패:', error);
      throw error;
    }
  },

  // ===== 상품 관련 =====
  
  // 홈쇼핑 상품 상세 조회
  getProductDetail: async (liveId) => {
    try {
      console.log('🛍️ 홈쇼핑 상품 상세 API 요청:', { liveId });
      const response = await api.get(`/api/homeshopping/product/${liveId}`);
      console.log('✅ 홈쇼핑 상품 상세 API 응답:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ 홈쇼핑 상품 상세 조회 실패:', error);
      throw error;
    }
  },

  // 상품 기반 콕 상품 및 레시피 추천
  getKokRecommendations: async (productId) => {
    try {
      console.log('💡 콕 상품 추천 API 요청:', { productId });
      const response = await api.get(`/api/homeshopping/product/${productId}/kok-recommend`);
      console.log('✅ 콕 상품 추천 API 응답:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ 콕 상품 추천 실패:', error);
      throw error;
    }
  },

  // 상품 분류 확인 (식재료/완제품)
  checkProductClassification: async (productId) => {
    try {
      console.log('🏷️ 상품 분류 확인 API 요청:', { productId });
      const response = await api.get(`/api/homeshopping/product/${productId}/check`);
      console.log('✅ 상품 분류 확인 API 응답:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ 상품 분류 확인 실패:', error);
      throw error;
    }
  },

  // 레시피 추천 (식재료인 경우)
  getRecipeRecommendations: async (productId) => {
    try {
      console.log('👨‍🍳 레시피 추천 API 요청:', { productId });
      const response = await api.get(`/api/homeshopping/product/${productId}/recipe-recommend`);
      console.log('✅ 레시피 추천 API 응답:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ 레시피 추천 실패:', error);
      throw error;
    }
  },

  // 홈쇼핑 라이브 영상 URL 조회 (homeshopping_id 또는 src 사용) - API 명세서와 일치
  getLiveStreamUrl: async (homeshoppingId, src = null) => {
    try {
      console.log('📹 라이브 스트림 URL API 요청:', { homeshoppingId, src });
      
      // API 명세서에 맞게 homeshopping_id 또는 src 중 하나를 사용
      const params = {};
      if (homeshoppingId) params.homeshopping_id = homeshoppingId;
      if (src) params.src = src;
      
      const response = await api.get('/api/homeshopping/schedule/live-stream', { params });
      
      console.log('✅ 라이브 스트림 URL API 응답 전체:', response);
      console.log('✅ 응답 데이터 타입:', typeof response.data);
      console.log('✅ 응답 데이터 길이:', response.data ? response.data.length : 'undefined');
      console.log('✅ 응답 데이터 샘플:', response.data ? response.data.substring(0, 200) + '...' : 'undefined');
      
      // HTML 템플릿에서 m3u8 URL 추출 (API 명세서와 일치: window.__LIVE_SRC__)
      if (response.data && typeof response.data === 'string') {
        console.log('🔍 HTML에서 m3u8 URL 추출 시도...');
        
        // API 명세서에 맞게 window.__LIVE_SRC__ 사용
        const match = response.data.match(/window\.__LIVE_SRC__\s*=\s*"([^"]+)"/);
        console.log('🔍 정규식 매치 결과:', match);
        
        if (match && match[1]) {
          console.log('✅ m3u8 URL 추출 성공:', match[1]);
          return {
            stream_url: match[1],
            html_template: response.data
          };
        } else {
          console.log('⚠️ m3u8 URL 추출 실패 - 정규식 매치 없음');
        }
      } else {
        console.log('⚠️ 응답 데이터가 문자열이 아님');
      }
      
      console.log('📤 최종 반환 데이터:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ 라이브 스트림 URL 조회 실패:', error);
      throw error;
    }
  },

  // 홈쇼핑 라이브 스트림 HTML 템플릿 조회 (API 명세서와 일치)
  getLiveStreamTemplate: async (homeshoppingId = null, src = null) => {
    try {
      console.log('📺 라이브 스트림 HTML 템플릿 API 요청:', { homeshoppingId, src });
      
      // API 명세서에 맞게 homeshopping_id 또는 src 중 하나를 사용
      const params = {};
      if (homeshoppingId) params.homeshopping_id = homeshoppingId;
      if (src) params.src = src;
      
      const response = await api.get('/api/homeshopping/schedule/live-stream', { params });
      console.log('✅ 라이브 스트림 HTML 템플릿 API 응답:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ 라이브 스트림 HTML 템플릿 조회 실패:', error);
      throw error;
    }
  },

  // ===== 검색 관련 =====
  
  // 상품 검색
  searchProducts: async (keyword, page = 1, size = 20) => {
    try {
      console.log('🔍 홈쇼핑 상품 검색 API 요청:', { keyword, page, size });
      const response = await api.get('/api/homeshopping/search', {
        params: { keyword, page, size }
      });
      console.log('✅ 홈쇼핑 상품 검색 API 응답:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ 홈쇼핑 상품 검색 실패:', error);
      throw error;
    }
  },

  // 검색어 저장
  saveSearchHistory: async (keyword) => {
    try {
      console.log('💾 검색어 저장 API 요청:', { keyword });
      const response = await api.post('/api/homeshopping/search/history', { keyword });
      console.log('✅ 검색어 저장 API 응답:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ 검색어 저장 실패:', error);
      throw error;
    }
  },

  // 검색어 조회
  getSearchHistory: async (limit = 5) => {
    try {
      console.log('📋 검색어 조회 API 요청:', { limit });
      const response = await api.get('/api/homeshopping/search/history', {
        params: { limit }
      });
      console.log('✅ 검색어 조회 API 응답:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ 검색어 조회 실패:', error);
      throw error;
    }
  },

  // 검색어 삭제
  deleteSearchHistory: async (historyId) => {
    try {
      console.log('🗑️ 검색어 삭제 API 요청:', { historyId });
      const response = await api.delete('/api/homeshopping/search/history', {
        data: { homeshopping_history_id: historyId }
      });
      console.log('✅ 검색어 삭제 API 응답:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ 검색어 삭제 실패:', error);
      throw error;
    }
  },

  // ===== 찜 기능 =====
  
  // 상품 찜 등록/해제
  toggleProductLike: async (productId) => {
    try {
      console.log('❤️ 상품 찜 토글 API 요청:', { productId });
      const response = await api.post('/api/homeshopping/likes/toggle', {
        product_id: productId
      });
      console.log('✅ 상품 찜 토글 API 응답:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ 상품 찜 토글 실패:', error);
      throw error;
    }
  },

  // 찜한 상품 목록 조회
  getLikedProducts: async (limit = 50) => {
    try {
      console.log('❤️ 찜한 상품 목록 API 요청:', { limit });
      const response = await api.get('/api/homeshopping/likes', {
        params: { limit }
      });
      console.log('✅ 찜한 상품 목록 API 응답:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ 찜한 상품 목록 조회 실패:', error);
      throw error;
    }
  },

  // ===== 알림 관련 =====
  
  // 주문 알림 조회
  getOrderNotifications: async (limit = 20, offset = 0) => {
    try {
      console.log('📦 주문 알림 조회 API 요청:', { limit, offset });
      const response = await api.get('/api/homeshopping/notifications/orders', {
        params: { limit, offset }
      });
      console.log('✅ 주문 알림 조회 API 응답:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ 주문 알림 조회 실패:', error);
      throw error;
    }
  },

  // 방송 알림 조회
  getBroadcastNotifications: async (limit = 20, offset = 0) => {
    try {
      console.log('📺 방송 알림 조회 API 요청:', { limit, offset });
      const response = await api.get('/api/homeshopping/notifications/broadcasts', {
        params: { limit, offset }
      });
      console.log('✅ 방송 알림 조회 API 응답:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ 방송 알림 조회 실패:', error);
      throw error;
    }
  },

  // 알림 내역 통합 조회 (주문 + 방송)
  getAllNotifications: async (limit = 100, offset = 0) => {
    try {
      console.log('🔔 모든 알림 내역 API 요청:', { limit, offset });
      const response = await api.get('/api/homeshopping/notifications/all', {
        params: { limit, offset }
      });
      console.log('✅ 모든 알림 내역 API 응답:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ 모든 알림 내역 조회 실패:', error);
      throw error;
    }
  }
};

export default homeShoppingApi;

// ===== 라이브 스트림 관련 API 함수 =====

// live_id를 homeshopping_id로 변환하는 함수
export function convertLiveIdToHomeshoppingId(liveId) {
  // live_id의 패턴을 분석하여 homeshopping_id 추출
  // 예: 17981 -> 1, 27982 -> 2, 37983 -> 3 등
  
  if (!liveId) return null;
  
  // live_id를 문자열로 변환
  const liveIdStr = liveId.toString();
  
  // 첫 번째 자리수가 homeshopping_id인 경우 (1xxxx -> 1, 2xxxx -> 2)
  if (liveIdStr.length >= 1) {
    const firstDigit = parseInt(liveIdStr.charAt(0));
    if (firstDigit >= 1 && firstDigit <= 6) {
      return firstDigit;
    }
  }
  
  // 다른 패턴이 있다면 여기에 추가 로직 구현
  // console.log('⚠️ live_id를 homeshopping_id로 변환할 수 없음:', liveId);
  return null;
}

export async function fetchLiveStreamInfo(apiBase, homeshoppingUrl) {
  const u = new URL(`${apiBase}/schedule/live-stream/info`);
  u.searchParams.set("homeshopping_url", homeshoppingUrl);
  const res = await fetch(u.toString(), {
    credentials: "include", // 쿠키 기반 인증 시 필요
    headers: { "Accept": "application/json" },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`(${res.status}) ${text || "정보 조회 실패"}`);
  }
  const json = await res.json();
  // 키 유연 매핑 (백엔드 응답 키가 달라도 동작하도록)
  const m3u8 =
    json.stream_url ||
    json.playlist_url ||
    json.m3u8_url ||
    json.hls ||
    json.url ||
    null;

  return {
    channel: json.channel || json.channel_name || json.homeshopping_channel || "-",
    title: json.title || json.live_title || json.program_title || "-",
    source: json.source || json.homeshopping_url || json.original_url || "-",
    m3u8,
    raw: json,
  };
} 