// React와 필요한 훅들을 가져옵니다
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
// 검색 헤더 컴포넌트를 가져옵니다
import HeaderSearchBar from '../../components/HeaderSearchBar';
// 하단 네비게이션 컴포넌트를 가져옵니다
import BottomNav from '../../layout/BottomNav';
// 로딩 컴포넌트를 가져옵니다
import Loading from '../../components/Loading';
// 뒤로가기 버튼 컴포넌트를 가져옵니다
import HeaderNavBackBtn from '../../components/HeaderNavBackBtn';
// 검색 페이지 스타일을 가져옵니다
import '../../styles/search.css';
// 홈쇼핑 API를 가져옵니다
import { homeShoppingApi } from '../../api/homeShoppingApi';
// 사용자 Context import
import { useUser } from '../../contexts/UserContext';

// 홈쇼핑 검색 페이지 컴포넌트를 정의합니다
const HomeShoppingSearch = () => {
  // 페이지 이동을 위한 navigate 훅
  const navigate = useNavigate();
  // URL 정보를 가져오는 location 훅
  const location = useLocation();
  // 사용자 정보 가져오기
  const { user, isLoggedIn, isLoading: userLoading } = useUser();
  
  // 검색 관련 상태 관리 (홈쇼핑 전용)
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchHistory, setSearchHistory] = useState([]);
  const searchType = 'home'; // 홈쇼핑 검색 타입 (상수로 변경)

  // 홈쇼핑 검색 히스토리 로드 (API 사용)
  const loadSearchHistory = useCallback(async () => {
    console.log('🔍 홈쇼핑 검색 히스토리 로드 시작:', { isLoggedIn });
    try {
      if (isLoggedIn && user?.token) {
        // 로그인된 사용자는 서버에서 홈쇼핑 검색 히스토리 가져오기
        const response = await homeShoppingApi.getSearchHistory(10);
        const history = response.history || [];
        setSearchHistory(history.map(item => item.homeshopping_keyword));
      } else {
        // 비로그인 사용자는 로컬스토리지에서 가져오기
        const history = JSON.parse(localStorage.getItem('homeshopping_searchHistory') || '[]');
        setSearchHistory(history.slice(0, 10));
      }
    } catch (error) {
      console.error('홈쇼핑 검색 히스토리 로드 실패:', error);
      // API 실패 시 로컬스토리지에서 가져오기
      try {
        const history = JSON.parse(localStorage.getItem('homeshopping_searchHistory') || '[]');
        setSearchHistory(history.slice(0, 10));
      } catch (localError) {
        console.error('로컬스토리지 홈쇼핑 검색 히스토리 로드 실패:', localError);
        setSearchHistory([]);
      }
    }
  }, [isLoggedIn, user?.token]);



  // 홈쇼핑 검색 실행 함수
  const handleSearch = useCallback(async (e = null, queryOverride = null) => {
    console.log('🔍 홈쇼핑 검색 실행 함수 호출:', { e, queryOverride, searchQuery });
    
    // SearchHeader에서 (e, searchQuery) 순서로 전달됨
    // 두 번째 파라미터가 문자열이면 검색어로 사용
    if (typeof queryOverride === 'string') {
      // SearchHeader에서 온 경우: e = 이벤트, queryOverride = searchQuery
    } else if (typeof e === 'string') {
      // 다른 곳에서 검색어만 전달한 경우
      queryOverride = e;
      e = null;
    }
    
    if (e && e.preventDefault) {
      e.preventDefault();
    }
    
    const query = queryOverride || searchQuery.trim();
    if (!query) {
      console.log('🔍 검색어가 없어서 홈쇼핑 검색 중단');
      return;
    }

    console.log('🔍 홈쇼핑 실제 검색 시작:', { query });
    setLoading(true);
    setError(null);

    try {
      console.log('홈쇼핑 검색 실행:', query);
      
      // 검색 히스토리에 저장 (함수 내부에서 직접 처리)
      try {
        if (isLoggedIn && user?.token) {
          // 로그인된 사용자는 서버에 홈쇼핑 검색어 저장
          await homeShoppingApi.saveSearchHistory(query);
          // 저장 후 히스토리 상태 업데이트 (로컬 상태만 업데이트)
          setSearchHistory(prevHistory => {
            const currentHistory = prevHistory.filter(item => item !== query);
            return [query, ...currentHistory].slice(0, 10);
          });
        } else {
          // 비로그인 사용자는 로컬스토리지에 저장
          const history = JSON.parse(localStorage.getItem('homeshopping_searchHistory') || '[]');
          const updatedHistory = [query, ...history.filter(item => item !== query)].slice(0, 20);
          localStorage.setItem('homeshopping_searchHistory', JSON.stringify(updatedHistory));
          setSearchHistory(updatedHistory.slice(0, 10));
        }
      } catch (error) {
        console.error('홈쇼핑 검색 히스토리 저장 실패:', error);
        // API 실패 시 로컬스토리지에 저장
        try {
          const history = JSON.parse(localStorage.getItem('homeshopping_searchHistory') || '[]');
          const updatedHistory = [query, ...history.filter(item => item !== query)].slice(0, 20);
          localStorage.setItem('homeshopping_searchHistory', JSON.stringify(updatedHistory));
          setSearchHistory(updatedHistory.slice(0, 10));
        } catch (localError) {
          console.error('로컬스토리지 홈쇼핑 검색 히스토리 저장 실패:', localError);
        }
      }
      
      // URL 업데이트 (쿼리 파라미터 추가)
      navigate(`/homeshopping/search?q=${encodeURIComponent(query)}`, { replace: true });
      
      // 홈쇼핑 실제 API 검색
      try {
        console.log('홈쇼핑 상품 검색 시작:', query);
        const response = await homeShoppingApi.searchProducts(query, 1, 20);
        
        console.log('홈쇼핑 API 응답 전체:', response);
        console.log('홈쇼핑 상품 데이터 샘플:', response.products?.[0]);
        
        // API 응답 데이터를 검색 결과 형식으로 변환
        const homeshoppingResults = (response.products || []).map(product => ({
          id: product.product_id,
          title: product.product_name,
          description: `${product.store_name}에서 판매 중인 홈쇼핑 상품`,
          price: `${product.dc_price?.toLocaleString() || '0'}원`,
          originalPrice: `${product.sale_price?.toLocaleString() || '0'}원`,
          discount: `${product.dc_rate || 0}%`,
          image: product.thumb_img_url || '/test1.png',
          category: '홈쇼핑',
          rating: 4.5, // 기본값
          reviewCount: 128, // 기본값
          channel: product.store_name || '홈쇼핑',
          broadcastTime: product.live_date ? 
            `${product.live_date} ${product.live_start_time}~${product.live_end_time}` : 
            '방송 일정 없음'
        }));
        
        // 중복 제거 (id 기준)
        const uniqueHomeshoppingResults = homeshoppingResults.filter((product, index, self) => 
          index === self.findIndex(p => p.id === product.id)
        );
        
        console.log('홈쇼핑 검색 결과:', uniqueHomeshoppingResults.length, '개 상품 (중복 제거 후)');
        setSearchResults(uniqueHomeshoppingResults);
        
        // 검색 결과를 sessionStorage에 저장
        const searchStateKey = `homeshopping_search_${query}`;
        sessionStorage.setItem(searchStateKey, JSON.stringify({
          results: uniqueHomeshoppingResults,
          timestamp: Date.now()
        }));
      } catch (error) {
        console.error('홈쇼핑 상품 검색 실패:', error);
        setError('홈쇼핑 상품 검색 중 오류가 발생했습니다.');
      }
      
      setLoading(false);
      
    } catch (err) {
      console.error('홈쇼핑 검색 실패:', err);
      setError('홈쇼핑 검색 중 오류가 발생했습니다.');
      setLoading(false);
    }
  }, [searchQuery, navigate, isLoggedIn, user?.token]);

  // URL 쿼리 파라미터에서 초기 검색어 가져오기 (홈쇼핑 전용)
  useEffect(() => {
    console.log('=== 홈쇼핑 Search 페이지 URL 파라미터 읽기 ===');
    console.log('현재 URL:', window.location.href);
    console.log('location.search:', location.search);
    
    const urlParams = new URLSearchParams(location.search);
    const query = urlParams.get('q');
    
    console.log('URL에서 읽은 파라미터:', { query });
    
    if (query) {
      setSearchQuery(query);
      
      // sessionStorage를 사용하여 뒤로가기인지 확인
      const searchStateKey = `homeshopping_search_${query}`;
      const savedSearchState = sessionStorage.getItem(searchStateKey);
      
      if (savedSearchState) {
        // 이미 검색한 결과가 있다면 복원 (뒤로가기로 돌아온 경우)
        console.log('저장된 홈쇼핑 검색 결과 복원:', query);
        try {
          const parsedState = JSON.parse(savedSearchState);
          const results = parsedState.results || [];
          
          // 복원된 결과에서도 중복 제거
          const uniqueResults = results.filter((product, index, self) => 
            index === self.findIndex(p => p.id === product.id)
          );
          
          console.log('복원된 홈쇼핑 검색 결과:', uniqueResults.length, '개 상품 (중복 제거 후)');
          setSearchResults(uniqueResults);
          setLoading(false);
        } catch (error) {
          console.error('홈쇼핑 검색 상태 복원 실패:', error);
          handleSearch(null, query);
        }
      } else {
        // 새로운 검색 실행
        console.log('새로운 홈쇼핑 검색 실행:', query);
        handleSearch(null, query);
      }
    }
  }, [location.search]); // handleSearch 의존성 제거

  // 컴포넌트 마운트 시 홈쇼핑 검색 히스토리 로드
  useEffect(() => {
    loadSearchHistory();
  }, [loadSearchHistory]); // loadSearchHistory 의존성 추가

  // 사용자 정보가 변경될 때마다 콘솔에 출력 (디버깅용)
  useEffect(() => {
    console.log('HomeShoppingSearch - 사용자 정보 상태:', {
      user: user,
      isLoggedIn: isLoggedIn,
      hasUser: !!user,
      userEmail: user?.email,
      hasToken: !!user?.token,
      userLoading: userLoading
    });
  }, [user, isLoggedIn, userLoading]);

  // 뒤로가기 핸들러
  const handleBack = () => {
    navigate(-1);
  };

  // 홈쇼핑 상품 클릭 핸들러
  const handleProductClick = (product) => {
    console.log('홈쇼핑 상품 클릭:', product);
    // 홈쇼핑 상품의 경우 (현재는 더미 데이터이므로 알림만)
    alert('홈쇼핑 상품 상세 페이지는 준비 중입니다.');
  };

  // 검색 히스토리 클릭 핸들러
  const handleHistoryClick = (query) => {
    setSearchQuery(query);
    handleSearch(null, query);
  };

  // 홈쇼핑 검색 히스토리 삭제 핸들러 (API 사용)
  const handleDeleteHistory = async (queryToDelete) => {
    try {
      if (isLoggedIn && user?.token) {
        // 로그인된 사용자는 서버에서 홈쇼핑 검색어 삭제
        const response = await homeShoppingApi.getSearchHistory(20);
        const history = response.history || [];
        const targetHistory = history.find(item => item.homeshopping_keyword === queryToDelete);
        
        if (targetHistory) {
          await homeShoppingApi.deleteSearchHistory(targetHistory.homeshopping_history_id);
        }
        // 삭제 후 히스토리 다시 로드
        await loadSearchHistory();
      } else {
        // 비로그인 사용자는 로컬스토리지에서 삭제
        const history = JSON.parse(localStorage.getItem('homeshopping_searchHistory') || '[]');
        const updatedHistory = history.filter(item => item !== queryToDelete);
        localStorage.setItem('homeshopping_searchHistory', JSON.stringify(updatedHistory));
        setSearchHistory(updatedHistory.slice(0, 10));
      }
    } catch (error) {
      console.error('홈쇼핑 검색 히스토리 삭제 실패:', error);
      // API 실패 시 로컬스토리지에서 삭제
      try {
        const history = JSON.parse(localStorage.getItem('homeshopping_searchHistory') || '[]');
        const updatedHistory = history.filter(item => item !== queryToDelete);
        localStorage.setItem('homeshopping_searchHistory', JSON.stringify(updatedHistory));
        setSearchHistory(updatedHistory.slice(0, 10));
      } catch (localError) {
        console.error('로컬스토리지 홈쇼핑 검색 히스토리 삭제 실패:', localError);
      }
    }
  };

  // 홈쇼핑 검색 히스토리 전체 삭제 핸들러 (API 사용)
  const handleClearAllHistory = async () => {
    try {
      if (isLoggedIn) {
        // 로그인된 사용자는 서버에서 모든 홈쇼핑 검색어 삭제
        // 백엔드 제한을 고려하여 작은 숫자로 히스토리를 가져옴
        const response = await homeShoppingApi.getSearchHistory(20);
        const history = response.history || [];
        
        if (history.length === 0) {
          console.log('삭제할 검색 히스토리가 없습니다.');
          alert('삭제할 검색 히스토리가 없습니다.');
          return;
        }
        
        console.log(`총 ${history.length}개의 검색 히스토리를 삭제합니다...`);
        
        // 모든 검색어를 병렬로 삭제 (더 빠름)
        const deletePromises = history.map(async (item) => {
          try {
            await homeShoppingApi.deleteSearchHistory(item.homeshopping_history_id);
            console.log(`✅ 검색어 삭제 성공: ${item.homeshopping_keyword} (ID: ${item.homeshopping_history_id})`);
            return { success: true, id: item.homeshopping_history_id };
          } catch (error) {
            console.error(`❌ 검색어 삭제 실패 (ID: ${item.homeshopping_history_id}):`, error);
            return { success: false, id: item.homeshopping_history_id, error };
          }
        });
        
        // 모든 삭제 작업 완료 대기
        const results = await Promise.allSettled(deletePromises);
        
        // 결과 확인
        const successCount = results.filter(result => 
          result.status === 'fulfilled' && result.value.success
        ).length;
        
        console.log(`전체 삭제 완료: ${successCount}/${history.length}개 성공`);
        
        // 삭제 후 히스토리 다시 로드
        await loadSearchHistory();
        
        // 성공 메시지 표시
        if (successCount > 0) {
          alert(`검색 히스토리 ${successCount}개가 삭제되었습니다.`);
        }
      } else {
        // 비로그인 사용자는 로컬스토리지에서 삭제
        const history = JSON.parse(localStorage.getItem('homeshopping_searchHistory') || '[]');
        localStorage.removeItem('homeshopping_searchHistory');
        setSearchHistory([]);
        console.log(`로컬 검색 히스토리 ${history.length}개 삭제 완료`);
        alert(`검색 히스토리 ${history.length}개가 삭제되었습니다.`);
      }
    } catch (error) {
      console.error('홈쇼핑 검색 히스토리 전체 삭제 실패:', error);
      // API 실패 시 로컬스토리지에서 삭제
      const history = JSON.parse(localStorage.getItem('homeshopping_searchHistory') || '[]');
      localStorage.removeItem('homeshopping_searchHistory');
      setSearchHistory([]);
      alert(`검색 히스토리 ${history.length}개가 삭제되었습니다. (로컬 저장소)`);
    }
  };

  // 로딩 중일 때 표시할 UI
  if (userLoading) {
    return (
      <div className="search-page">
        <div className="search-header">
          <HeaderNavBackBtn onClick={handleBack} />
          <HeaderSearchBar 
            onSearch={(query) => {
              if (query && query.trim()) {
                navigate(`/homeshopping/search?q=${encodeURIComponent(query.trim())}&type=${searchType}`);
              }
            }}
            placeholder={`${searchType === 'kok' ? '콕' : '홈쇼핑'} 상품 검색`}
          />
        </div>
        <div className="search-content">
          <Loading message="검색 페이지를 불러오는 중..." />
        </div>
        <BottomNav />
      </div>
    );
  }

  // 검색 페이지 렌더링
  return (
    <div className="search-page">

      
                     {/* 홈쇼핑 검색 헤더 */}
        <div className="search-header">
          <HeaderNavBackBtn onClick={handleBack} />
          
          <HeaderSearchBar 
            onSearch={(query) => {
              console.log('🔍 HeaderSearchBar에서 홈쇼핑 검색:', query);
              if (query && query.trim()) {
                navigate(`/homeshopping/search?q=${encodeURIComponent(query.trim())}`);
              }
            }}
            placeholder="홈쇼핑 상품 검색"
          />
        </div>

             {/* 메인 콘텐츠 */}
       <div className="search-content">
         {/* 검색 타입 전환 버튼 */}
         <div className="search-type-switch">
           <button 
             className="switch-btn active"
             onClick={() => {
               console.log('🔍 홈쇼핑 검색 유지');
             }}
           >
             홈쇼핑
           </button>
           <button 
             className="switch-btn"
             onClick={() => {
               console.log('🔍 콕 검색으로 전환');
               navigate('/kok/search');
             }}
           >
             콕 쇼핑
           </button>
         </div>
         
         {/* 검색 결과가 없고 로딩 중이 아닐 때 */}
         {!loading && searchResults.length === 0 && !searchQuery && (
          <div className="search-empty-state">
            {/* 최근 검색어 섹션 */}
            {searchHistory.length > 0 && (
              <div className="search-history-section">
                <div className="section-header">
                  <h3>최근 검색어</h3>
                  <button 
                    className="clear-all-btn"
                    onClick={handleClearAllHistory}
                  >
                    전체 삭제
                  </button>
                </div>
                <div className="search-history">
                  {searchHistory.map((query, index) => (
                    <div key={index} className="history-item">
                      <button
                        className="history-query"
                        onClick={() => handleHistoryClick(query)}
                      >
                        {query}
                      </button>
                      <button
                        className="delete-history-btn"
                        onClick={() => handleDeleteHistory(query)}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 로딩 중일 때 */}
        {loading && (
          <div className="search-loading">
            <Loading message={`"${searchQuery}" 검색 중...`} />
          </div>
        )}

        {/* 에러 발생 시 */}
        {error && (
          <div className="search-error">
            <div className="error-message">{error}</div>
            <button 
              className="retry-btn"
              onClick={() => handleSearch(null, searchQuery)}
            >
              다시 시도
            </button>
          </div>
        )}

        {/* 검색 결과 */}
        {!loading && searchResults.length > 0 && (
          <div className="search-results">
            <div className="results-header">
              <h3>검색 결과 ({searchResults.length}개)</h3>
              <span className="search-query">"{searchQuery}"</span>
            </div>
            
            <div className="results-list">
              {searchResults.map((result, index) => (
                <div 
                  key={`homeshopping-${result.id}-${index}`} 
                  className="result-item clickable"
                  onClick={() => handleProductClick(result)}
                >
                  <div className="result-image">
                    <img 
                      src={result.image} 
                      alt={result.title}
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/300x300/CCCCCC/666666?text=No+Image'; // 기본 이미지로 대체
                        e.target.onerror = null; // 무한 루프 방지
                      }}
                    />
                  </div>
                  <div className="result-info">
                    <div className="result-category">{result.category}</div>
                    <h4 className="result-title">{result.title}</h4>
                    <p className="result-description">{result.description}</p>
                    
                    {/* 홈쇼핑 추가 정보 표시 */}
                    <div className="homeshopping-info">
                      {result.channel && <span className="channel">📺 {result.channel}</span>}
                      {result.broadcastTime && <span className="broadcast-time">⏰ {result.broadcastTime}</span>}
                    </div>
                    
                    <div className="result-rating">
                      <span className="rating">⭐ {result.rating}</span>
                      <span className="review-count">리뷰 {result.reviewCount}</span>
                    </div>
                    <div className="result-price">
                      <span className="discount">{result.discount}</span>
                      <span className="price">{result.price}</span>
                      <span className="original-price">{result.originalPrice}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 검색 결과가 없을 때 */}
        {!loading && searchQuery && searchResults.length === 0 && !error && (
          <div className="no-results">
            <div className="no-results-icon">🔍</div>
            <h3>검색 결과가 없습니다</h3>
            <p>"{searchQuery}"에 대한 검색 결과를 찾을 수 없습니다.</p>
          </div>
        )}
      </div>

      {/* 하단 네비게이션 */}
      <BottomNav />
    </div>
  );
};

// HomeShoppingSearch 컴포넌트를 기본 내보내기로 설정합니다
export default HomeShoppingSearch;
