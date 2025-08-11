// React와 필요한 훅들을 가져옵니다
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
// 검색 헤더 컴포넌트를 가져옵니다
import HeaderNavMain from '../../layout/HeaderNavKokMain';
// 하단 네비게이션 컴포넌트를 가져옵니다
import BottomNav from '../../layout/BottomNav';
// 로딩 컴포넌트를 가져옵니다
import Loading from '../../components/Loading';
// 검색 페이지 스타일을 가져옵니다
import '../../styles/search.css';
// API 설정을 가져옵니다
import api from '../api';
// 콕 API를 가져옵니다
import { kokApi } from '../../api/kokApi';
// 사용자 Context import
import { useUser } from '../../contexts/UserContext';

// 검색 페이지 컴포넌트를 정의합니다
const Search = () => {
  // 페이지 이동을 위한 navigate 훅
  const navigate = useNavigate();
  // URL 정보를 가져오는 location 훅
  const location = useLocation();
  // 사용자 정보 가져오기
  const { user, isLoggedIn, isLoading: userLoading } = useUser();
  
  // 검색 관련 상태 관리
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchHistory, setSearchHistory] = useState([]);
  const [searchType, setSearchType] = useState('homeshopping'); // 기본값: 홈쇼핑
  const [popularKeywords, setPopularKeywords] = useState([]);

  // URL 쿼리 파라미터에서 초기 검색어와 타입 가져오기
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const query = urlParams.get('q');
    const type = urlParams.get('type') || 'homeshopping'; // 기본값: homeshopping
    
    setSearchType(type);
    
    // 검색 타입에 따라 인기 검색어 설정
    if (type === 'kok') {
      setPopularKeywords([
        '할인특가', '신상품', '베스트셀러', '프리미엄', '한정판매', '무료배송', '당일배송', '리뷰좋은상품'
      ]);
    } else {
      setPopularKeywords([
        '건강식품', '패션', '뷰티', '가전제품', '생활용품', '주방용품', '식품', '화장품'
      ]);
    }
    
    if (query) {
      setSearchQuery(query);
      
      // sessionStorage를 사용하여 뒤로가기인지 확인
      const searchStateKey = `search_${query}_${type}`;
      const savedSearchState = sessionStorage.getItem(searchStateKey);
      
      if (savedSearchState) {
        // 이미 검색한 결과가 있다면 복원 (뒤로가기로 돌아온 경우)
        console.log('저장된 검색 결과 복원:', query);
        try {
          const parsedState = JSON.parse(savedSearchState);
          setSearchResults(parsedState.results || []);
          setLoading(false);
        } catch (error) {
          console.error('검색 상태 복원 실패:', error);
          handleSearch(null, query);
        }
      } else {
        // 새로운 검색 실행
        console.log('새로운 검색 실행:', query);
        handleSearch(null, query);
      }
    }
  }, [location.search]);

  // 컴포넌트 마운트 시 검색 히스토리 로드
  useEffect(() => {
    loadSearchHistory();
  }, []);

  // 사용자 정보가 변경될 때마다 콘솔에 출력 (디버깅용)
  useEffect(() => {
    console.log('Search - 사용자 정보 상태:', {
      user: user,
      isLoggedIn: isLoggedIn,
      hasUser: !!user,
      userEmail: user?.email,
      hasToken: !!user?.token,
      userLoading: userLoading
    });
  }, [user, isLoggedIn, userLoading]);

  // 검색 히스토리 로드
  const loadSearchHistory = () => {
    try {
      const history = JSON.parse(localStorage.getItem('searchHistory') || '[]');
      setSearchHistory(history.slice(0, 10)); // 최근 10개만 표시
    } catch (error) {
      console.error('검색 히스토리 로드 실패:', error);
      setSearchHistory([]);
    }
  };

  // 검색 히스토리 저장
  const saveSearchHistory = (query) => {
    try {
      const history = JSON.parse(localStorage.getItem('searchHistory') || '[]');
      const updatedHistory = [query, ...history.filter(item => item !== query)].slice(0, 20);
      localStorage.setItem('searchHistory', JSON.stringify(updatedHistory));
      setSearchHistory(updatedHistory.slice(0, 10));
    } catch (error) {
      console.error('검색 히스토리 저장 실패:', error);
    }
  };

  // 검색 실행 함수
  const handleSearch = async (e = null, queryOverride = null) => {
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
    if (!query) return;

    setLoading(true);
    setError(null);

    try {
      console.log('검색 실행:', query);
      
      // 검색 히스토리에 저장
      saveSearchHistory(query);
      
      // URL 업데이트 (쿼리 파라미터 추가)
      navigate(`/search?q=${encodeURIComponent(query)}&type=${searchType}`, { replace: true });
      
      // 검색 타입에 따라 다른 검색 실행
      if (searchType === 'kok') {
        // 콕 쇼핑몰 실제 상품 검색
        try {
          console.log('콕 상품 검색 시작:', query);
          const kokProducts = await kokApi.searchProducts(query);
          
          // 콕 상품 데이터를 검색 결과 형식으로 변환
          const kokResults = kokProducts.map(product => ({
            id: product.id,
            title: `[콕] ${product.name}`,
            description: `콕 쇼핑몰에서 판매 중인 ${product.category} 상품`,
            price: `${product.discountPrice?.toLocaleString() || '0'}원`,
            originalPrice: `${product.originalPrice?.toLocaleString() || '0'}원`,
            discount: `${product.discountRate || 0}%`,
            image: product.image || '/test1.png',
            category: product.category || '콕 상품',
            rating: product.rating || 4.5,
            reviewCount: product.reviewCount || 128,
            storeName: product.storeName || 'COK 스토어',
            shipping: '무료배송',
            // 홈쇼핑 관련 필드는 undefined로 설정하여 충돌 방지
            channel: undefined,
            broadcastTime: undefined
          }));
          
          console.log('콕 검색 결과:', kokResults.length, '개 상품');
          setSearchResults(kokResults);
          
          // 검색 결과를 sessionStorage에 저장
          const searchStateKey = `search_${query}_${searchType}`;
          sessionStorage.setItem(searchStateKey, JSON.stringify({
            results: kokResults,
            timestamp: Date.now()
          }));
        } catch (error) {
          console.error('콕 상품 검색 실패:', error);
          setError('콕 상품 검색 중 오류가 발생했습니다.');
        }
      } else {
        // 홈쇼핑 검색 결과 (기존 목 데이터 사용)
        setTimeout(() => {
          const mockResults = [
            {
              id: 1,
              title: `[홈쇼핑] ${query} 방송상품`,
              description: 'TV 홈쇼핑에서 방송 중인 인기 상품입니다',
              price: '29,900원',
              originalPrice: '49,900원',
              discount: '40%',
              image: '/test1.png',
              category: '방송중',
              rating: 4.5,
              reviewCount: 128,
              channel: 'NS플러스',
              broadcastTime: '14:00 방송',
              // 콕 관련 필드는 undefined로 설정하여 충돌 방지
              storeName: undefined,
              shipping: undefined
            },
            {
              id: 2,
              title: `[홈쇼핑] ${query} 특가방송`,
              description: '홈쇼핑 특가 방송! 놓치면 후회하는 가격',
              price: '19,900원',
              originalPrice: '39,900원',
              discount: '50%',
              image: '/test2.png',
              category: '특가방송',
              rating: 4.8,
              reviewCount: 256,
              channel: '현대홈쇼핑',
              broadcastTime: '16:30 방송예정',
              // 콕 관련 필드는 undefined로 설정하여 충돌 방지
              storeName: undefined,
              shipping: undefined
            },
            {
              id: 3,
              title: `[홈쇼핑] ${query} 인기상품`,
              description: '홈쇼핑에서 가장 많이 판매되는 인기 상품',
              price: '39,900원',
              originalPrice: '59,900원',
              discount: '33%',
              image: '/test3.png',
              category: '인기상품',
              rating: 4.3,
              reviewCount: 89,
              channel: '공영홈쇼핑',
              broadcastTime: '18:00 방송',
              // 콕 관련 필드는 undefined로 설정하여 충돌 방지
              storeName: undefined,
              shipping: undefined
            }
          ];
          
          setSearchResults(mockResults);
          
          // 검색 결과를 sessionStorage에 저장
          const searchStateKey = `search_${query}_${searchType}`;
          sessionStorage.setItem(searchStateKey, JSON.stringify({
            results: mockResults,
            timestamp: Date.now()
          }));
        }, 500);
      }
      
      setLoading(false);
      
    } catch (err) {
      console.error('검색 실패:', err);
      setError('검색 중 오류가 발생했습니다.');
      setLoading(false);
    }
  };

  // 뒤로가기 핸들러
  const handleBack = () => {
    navigate(-1);
  };

  // 인기 키워드 클릭 핸들러
  const handlePopularKeywordClick = (keyword) => {
    setSearchQuery(keyword);
    handleSearch(null, keyword);
  };

  // 상품 클릭 핸들러
  const handleProductClick = (product) => {
    console.log('상품 클릭:', product);
    
    if (searchType === 'kok') {
      // 콕 상품 상세 페이지로 이동 (검색 정보를 state로 전달)
      navigate(`/kok/product/${product.id}`, {
        state: {
          from: 'search',
          searchQuery: searchQuery,
          searchType: searchType,
          backUrl: `/search?q=${encodeURIComponent(searchQuery)}&type=${searchType}`
        }
      });
    } else {
      // 홈쇼핑 상품의 경우 (현재는 더미 데이터이므로 알림만)
      alert('홈쇼핑 상품 상세 페이지는 준비 중입니다.');
      console.log('홈쇼핑 상품 클릭:', product);
    }
  };

  // 검색 히스토리 클릭 핸들러
  const handleHistoryClick = (query) => {
    setSearchQuery(query);
    handleSearch(null, query);
  };

  // 검색 히스토리 삭제 핸들러
  const handleDeleteHistory = (queryToDelete) => {
    try {
      const history = JSON.parse(localStorage.getItem('searchHistory') || '[]');
      const updatedHistory = history.filter(item => item !== queryToDelete);
      localStorage.setItem('searchHistory', JSON.stringify(updatedHistory));
      setSearchHistory(updatedHistory.slice(0, 10));
    } catch (error) {
      console.error('검색 히스토리 삭제 실패:', error);
    }
  };

  // 검색 히스토리 전체 삭제 핸들러
  const handleClearAllHistory = () => {
    localStorage.removeItem('searchHistory');
    setSearchHistory([]);
  };

  // 로딩 중일 때 표시할 UI
  if (userLoading) {
    return (
      <div className="search-page">
        <HeaderNavMain 
          onBackClick={handleBack} 
          onSearch={handleSearch}
        />
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

      
      {/* 검색 헤더 */}
      <HeaderNavMain 
        onBackClick={handleBack} 
        onSearch={handleSearch}
      />

      {/* 메인 콘텐츠 */}
      <div className="search-content">
        {/* 검색 결과가 없고 로딩 중이 아닐 때 */}
        {!loading && searchResults.length === 0 && !searchQuery && (
          <div className="search-empty-state">
            {/* 인기 검색어 섹션 */}
            <div className="popular-keywords-section">
              <h3>{searchType === 'kok' ? '콕 쇼핑몰 인기 검색어' : '홈쇼핑 인기 검색어'}</h3>
              <div className="popular-keywords">
                {popularKeywords.map((keyword, index) => (
                  <button
                    key={index}
                    className="keyword-button"
                    onClick={() => handlePopularKeywordClick(keyword)}
                  >
                    <span className="keyword-rank">{index + 1}</span>
                    {keyword}
                  </button>
                ))}
              </div>
            </div>

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
              {searchResults.map((result) => (
                <div 
                  key={result.id} 
                  className="result-item clickable"
                  onClick={() => handleProductClick(result)}
                >
                  <div className="result-image">
                    <img src={result.image} alt={result.title} />
                  </div>
                  <div className="result-info">
                    <div className="result-category">{result.category}</div>
                    <h4 className="result-title">{result.title}</h4>
                    <p className="result-description">{result.description}</p>
                    
                    {/* 검색 타입에 따라 다른 추가 정보 표시 */}
                    {searchType === 'kok' ? (
                      <div className="kok-info">
                        {result.storeName && <span className="store-name">🏪 {result.storeName}</span>}
                        {result.shipping && <span className="shipping">🚚 {result.shipping}</span>}
                      </div>
                    ) : (
                      <div className="homeshopping-info">
                        {result.channel && <span className="channel">📺 {result.channel}</span>}
                        {result.broadcastTime && <span className="broadcast-time">⏰ {result.broadcastTime}</span>}
                      </div>
                    )}
                    
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
            <div className="search-suggestions">
              <p>다른 검색어를 시도해보세요:</p>
              <div className="suggestion-keywords">
                {popularKeywords.slice(0, 4).map((keyword, index) => (
                  <button
                    key={index}
                    className="suggestion-keyword"
                    onClick={() => handlePopularKeywordClick(keyword)}
                  >
                    {keyword}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 하단 네비게이션 */}
      <BottomNav />
    </div>
  );
};

// Search 컴포넌트를 기본 내보내기로 설정합니다
export default Search;
