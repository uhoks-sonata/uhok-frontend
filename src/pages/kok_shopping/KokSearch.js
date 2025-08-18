// React와 필요한 훅들을 가져옵니다
import React, { useState, useEffect, useCallback, useRef } from 'react';
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
// 콕 API를 가져옵니다
import { kokApi } from '../../api/kokApi';
// 사용자 Context import
import { useUser } from '../../contexts/UserContext';

// 콕 검색 페이지 컴포넌트를 정의합니다
const KokSearch = () => {
  // 페이지 이동을 위한 navigate 훅
  const navigate = useNavigate();
  // URL 정보를 가져오는 location 훅
  const location = useLocation();
  // 사용자 정보 가져오기
  const { user, isLoggedIn, isLoading: userLoading } = useUser();
  
  // 검색 관련 상태 관리 (콕 전용)
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchHistory, setSearchHistory] = useState([]);
  
  // 중복 실행 방지를 위한 ref
  const currentQueryRef = useRef('');

  // 사용자 정보가 변경될 때마다 콘솔에 출력 (디버깅용)
  useEffect(() => {
    console.log('KokSearch - 사용자 정보 상태:', {
      user: user,
      isLoggedIn: isLoggedIn,
      hasUser: !!user,
      userEmail: user?.email,
      hasToken: !!user?.token,
      userLoading: userLoading
    });
  }, [user, isLoggedIn, userLoading]);

  // 콕 검색 히스토리 로드 (API 사용)
  const loadSearchHistory = useCallback(async () => {
    console.log('🔍 콕 검색 히스토리 로드 시작:', { isLoggedIn });
    
    // 컴포넌트가 언마운트되었는지 확인하는 플래그
    let isMounted = true;
    
    try {
      if (isLoggedIn && user?.token) {
        // 로그인된 사용자는 서버에서 콕 검색 히스토리 가져오기 (더 큰 limit으로 호출)
        const response = await kokApi.getSearchHistory(50, user.token);
        
        // 컴포넌트가 언마운트되었으면 상태 업데이트하지 않음
        if (!isMounted) return;
        
        const history = response.history || [];
        
        console.log('🔍 백엔드에서 받은 원본 히스토리:', {
          전체개수: history.length,
          원본데이터: history.map(item => ({
            id: item.kok_history_id,
            keyword: item.kok_keyword,
            createdAt: item.created_at
          }))
        });
        
        // 중복 제거 후 설정
        const uniqueHistory = history
          .map(item => item.kok_keyword)
          .filter((keyword, index, self) => self.indexOf(keyword) === index);
        
        console.log('🔍 중복 제거 후 히스토리:', {
          중복제거후개수: uniqueHistory.length,
          최종키워드: uniqueHistory
        });
        
        if (isMounted) {
          setSearchHistory(uniqueHistory);
        }
      } else {
        // 비로그인 사용자는 로컬스토리지에서 가져오기
        const history = JSON.parse(localStorage.getItem('kok_searchHistory') || '[]');
        // 중복 제거 후 설정
        const uniqueHistory = history.filter((keyword, index, self) => self.indexOf(keyword) === index);
        if (isMounted) {
          setSearchHistory(uniqueHistory.slice(0, 10));
        }
      }
    } catch (error) {
      console.error('콕 검색 히스토리 로드 실패:', error);
      // API 실패 시 로컬스토리지에서 가져오기
      try {
        const history = JSON.parse(localStorage.getItem('kok_searchHistory') || '[]');
        const uniqueHistory = history.filter((keyword, index, self) => self.indexOf(keyword) === index);
        if (isMounted) {
          setSearchHistory(uniqueHistory.slice(0, 10));
        }
      } catch (localError) {
        console.error('로컬스토리지 콕 검색 히스토리 로드 실패:', localError);
        if (isMounted) {
          setSearchHistory([]);
        }
      }
    }
    
    // cleanup 함수 반환
    return () => {
      isMounted = false;
    };
  }, [isLoggedIn, user?.token]);

  // URL 쿼리 파라미터에서 초기 검색어 가져오기 (콕 전용)
  useEffect(() => {
    console.log('=== 콕 Search 페이지 URL 파라미터 읽기 ===');
    console.log('현재 URL:', window.location.href);
    console.log('location.search:', location.search);
    
    const urlParams = new URLSearchParams(location.search);
    const query = urlParams.get('q');
    
    console.log('URL에서 읽은 파라미터:', { query });
    
    if (query) {
      setSearchQuery(query);
      currentQueryRef.current = query;
      
      // sessionStorage를 사용하여 뒤로가기인지 확인
      const searchStateKey = `kok_search_${query}`;
      const savedSearchState = sessionStorage.getItem(searchStateKey);
      
      if (savedSearchState) {
        try {
          const parsedState = JSON.parse(savedSearchState);
          
          // pending 상태인지 확인
          if (parsedState.pending) {
            console.log('검색이 진행 중입니다. 새로운 검색 실행:', query);
            // pending 상태를 제거하고 새로운 검색 실행
            sessionStorage.removeItem(searchStateKey);
            // handleSearch 대신 직접 검색 로직 실행
            executeSearch(query);
          } else {
            // 이미 검색한 결과가 있다면 복원 (뒤로가기로 돌아온 경우)
            console.log('저장된 콕 검색 결과 복원:', query);
            const results = parsedState.results || [];
            
            // 복원된 결과에서도 중복 제거
            const uniqueResults = results.filter((product, index, self) => 
              index === self.findIndex(p => p.id === product.id)
            );
            
            console.log('복원된 콕 검색 결과:', uniqueResults.length, '개 상품 (중복 제거 후)');
            setSearchResults(uniqueResults);
            setLoading(false);
            
            // 복원된 검색어는 이미 저장되어 있으므로 히스토리 저장 생략
            console.log('🔍 복원된 검색어는 이미 히스토리에 저장되어 있음:', query);
          }
        } catch (error) {
          console.error('콕 검색 상태 복원 실패:', error);
          // handleSearch 대신 직접 검색 로직 실행
          executeSearch(query);
        }
      } else {
        // 새로운 검색 실행
        console.log('새로운 콕 검색 실행:', query);
        // handleSearch 대신 직접 검색 로직 실행
        executeSearch(query);
      }
    }
  }, [location.search]); // handleSearch 의존성 제거

  // 컴포넌트 마운트 시 콕 검색 히스토리 로드
  useEffect(() => {
    let cleanup;
    
    const loadHistory = async () => {
      cleanup = await loadSearchHistory();
    };
    
    loadHistory();
    
    // cleanup 함수 반환
    return () => {
      if (cleanup) cleanup();
    };
  }, [loadSearchHistory]); // loadSearchHistory 의존성 추가

  // 실제 검색 실행 함수 (useEffect에서 사용)
  const executeSearch = useCallback(async (query) => {
    if (!query || loading) {
      console.log('🔍 검색 조건 불충족 또는 중복 실행 방지');
      return;
    }

    // 중복 실행 방지: 같은 검색어로 이미 실행 중인지 확인
    if (currentQueryRef.current === query && searchResults.length > 0) {
      console.log('🔍 이미 실행된 검색어입니다. 중복 실행 방지:', query);
      return;
    }
    
    // 현재 검색어를 ref에 설정하여 중복 실행 방지
    currentQueryRef.current = query;

    console.log('🔍 콕 실제 검색 시작:', { query });
    
    // 컴포넌트가 언마운트되었는지 확인하는 플래그
    let isMounted = true;
    
    setLoading(true);
    setError(null);

    try {
      console.log('콕 검색 실행:', query);
      
      // 검색 히스토리에 저장 (함수 내부에서 직접 처리)
      try {
        if (isLoggedIn && user?.token) {
          // 백엔드에서 현재 히스토리를 가져와서 중복 체크
                     try {
             const response = await kokApi.getSearchHistory(50, user.token);
             const currentHistory = response.history || [];
             const existingKeywords = currentHistory.map(item => item.kok_keyword);
            
            const isDuplicate = existingKeywords.includes(query);
            
            if (isDuplicate) {
              console.log('🔍 이미 백엔드에 존재하는 검색어입니다. 저장 생략:', query);
                             // 중복된 검색어는 백엔드에 저장하지 않고, 순서만 최신으로 변경
               if (isMounted) {
                 setSearchHistory(prevHistory => {
                   const currentHistory = prevHistory.filter(item => item !== query);
                   const updatedHistory = [query, ...currentHistory];
                   // 중복 제거 후 최대 10개만 유지
                   return updatedHistory.filter((keyword, index, self) => self.indexOf(keyword) === index).slice(0, 10);
                 });
               }
            } else {
              // 새로운 검색어만 백엔드에 저장
              console.log('🔍 새로운 검색어를 백엔드에 저장:', query);
              await kokApi.addSearchHistory(query, user.token);
              
              // 백엔드 DB 정리: 중복 제거 및 최신 순서로 업데이트
              try {
                console.log('🔍 백엔드 DB 정리 시작 (새로운 검색어)');
                const allHistoryResponse = await kokApi.getSearchHistory(50, user.token);
                const allHistory = allHistoryResponse.history || [];
                
                // 중복 제거 및 최신 순서로 정렬
                const uniqueKeywords = [];
                const seenKeywords = new Set();
                
                // 현재 검색어를 맨 앞에 추가
                uniqueKeywords.push(query);
                seenKeywords.add(query);
                
                // 기존 히스토리에서 중복 제거하며 추가
                allHistory.forEach(item => {
                  if (!seenKeywords.has(item.kok_keyword)) {
                    uniqueKeywords.push(item.kok_keyword);
                    seenKeywords.add(item.kok_keyword);
                  }
                });
                
                // 최대 10개만 유지
                const finalKeywords = uniqueKeywords.slice(0, 10);
                
                console.log('🔍 백엔드 DB 정리 결과 (새로운 검색어):', {
                  원본개수: allHistory.length,
                  중복제거후: uniqueKeywords.length,
                  최종개수: finalKeywords.length,
                  최종키워드: finalKeywords
                });
                
                // 기존 히스토리 모두 삭제
                const deletePromises = allHistory.map(item => 
                  kokApi.deleteSearchHistory(item.kok_history_id, user.token)
                );
                await Promise.allSettled(deletePromises);
                
                // 정리된 키워드들 다시 저장
                const savePromises = finalKeywords.map(keyword => 
                  kokApi.addSearchHistory(keyword, user.token)
                );
                await Promise.allSettled(savePromises);
                
                                 console.log('🔍 백엔드 DB 정리 완료 (새로운 검색어)');
                 
                 // UI 상태 업데이트
                 if (isMounted) {
                   setSearchHistory(finalKeywords);
                 }
                
              } catch (cleanupError) {
                console.error('🔍 백엔드 DB 정리 실패 (새로운 검색어):', cleanupError);
                                 // 정리 실패 시 기본 로직으로 fallback
                 if (isMounted) {
                   setSearchHistory(prevHistory => {
                     const currentHistory = prevHistory.filter(item => item !== query);
                     const updatedHistory = [query, ...currentHistory];
                     return updatedHistory.filter((keyword, index, self) => self.indexOf(keyword) === index).slice(0, 10);
                   });
                 }
              }
            }
            
            // 백엔드 DB 정리: 중복 제거 및 최신 순서로 업데이트
            try {
              console.log('🔍 백엔드 DB 정리 시작');
              const allHistoryResponse = await kokApi.getSearchHistory(50, user.token);
              const allHistory = allHistoryResponse.history || [];
              
              // 중복 제거 및 최신 순서로 정렬
              const uniqueKeywords = [];
              const seenKeywords = new Set();
              
              // 현재 검색어를 맨 앞에 추가
              if (!seenKeywords.has(query)) {
                uniqueKeywords.push(query);
                seenKeywords.add(query);
              }
              
              // 기존 히스토리에서 중복 제거하며 추가
              allHistory.forEach(item => {
                if (!seenKeywords.has(item.kok_keyword)) {
                  uniqueKeywords.push(item.kok_keyword);
                  seenKeywords.add(item.kok_keyword);
                }
              });
              
              // 최대 10개만 유지
              const finalKeywords = uniqueKeywords.slice(0, 10);
              
              console.log('🔍 백엔드 DB 정리 결과:', {
                원본개수: allHistory.length,
                중복제거후: uniqueKeywords.length,
                최종개수: finalKeywords.length,
                최종키워드: finalKeywords
              });
              
              // 기존 히스토리 모두 삭제
              const deletePromises = allHistory.map(item => 
                kokApi.deleteSearchHistory(item.kok_history_id, user.token)
              );
              await Promise.allSettled(deletePromises);
              
              // 정리된 키워드들 다시 저장
              const savePromises = finalKeywords.map(keyword => 
                kokApi.addSearchHistory(keyword, user.token)
              );
              await Promise.allSettled(savePromises);
              
              console.log('🔍 백엔드 DB 정리 완료');
              
                             // UI 상태 업데이트
               if (isMounted) {
                 setSearchHistory(finalKeywords);
               }
              
            } catch (cleanupError) {
              console.error('🔍 백엔드 DB 정리 실패:', cleanupError);
              // 정리 실패 시 기본 로직으로 fallback
            }
          } catch (historyError) {
            console.error('히스토리 중복 체크 실패, 기본 저장 로직 실행:', historyError);
                         // 히스토리 가져오기 실패 시 기본 저장 로직 실행
             await kokApi.addSearchHistory(query, user.token);
             if (isMounted) {
               setSearchHistory(prevHistory => {
                 const currentHistory = prevHistory.filter(item => item !== query);
                 const updatedHistory = [query, ...currentHistory];
                 // 중복 제거 후 최대 10개만 유지
                 return updatedHistory.filter((keyword, index, self) => self.indexOf(keyword) === index).slice(0, 10);
               });
             }
          }
                 } else {
           // 비로그인 사용자는 로컬스토리지에 저장
           const history = JSON.parse(localStorage.getItem('kok_searchHistory') || '[]');
           const updatedHistory = [query, ...history.filter(item => item !== query)];
           // 중복 제거 후 최대 20개만 유지
           const uniqueHistory = updatedHistory.filter((keyword, index, self) => self.indexOf(keyword) === index).slice(0, 20);
           localStorage.setItem('kok_searchHistory', JSON.stringify(uniqueHistory));
           if (isMounted) {
             setSearchHistory(uniqueHistory.slice(0, 10));
           }
         }
      } catch (error) {
        console.error('콕 검색 히스토리 저장 실패:', error);
                 // API 실패 시 로컬스토리지에 저장
         try {
           const history = JSON.parse(localStorage.getItem('kok_searchHistory') || '[]');
           const updatedHistory = [query, ...history.filter(item => item !== query)];
           // 중복 제거 후 최대 20개만 유지
           const uniqueHistory = updatedHistory.filter((keyword, index, self) => self.indexOf(keyword) === index).slice(0, 20);
           localStorage.setItem('kok_searchHistory', JSON.stringify(uniqueHistory));
           if (isMounted) {
             setSearchHistory(uniqueHistory.slice(0, 10));
           }
         } catch (localError) {
          console.error('로컬스토리지 콕 검색 히스토리 저장 실패:', localError);
        }
      }
      
      // URL 업데이트
      navigate(`/kok/search?q=${encodeURIComponent(query)}`, { replace: true });
      
      // 콕 실제 API 검색
      try {
        console.log('콕 상품 검색 시작:', query);
        const accessToken = isLoggedIn && user?.token ? user.token : null;
        const response = await kokApi.searchProducts(query, 1, 20, accessToken);
        
        console.log('콕 API 응답 전체:', response);
        console.log('콕 상품 데이터 샘플:', response.products?.[0]);
        
        // API 응답 데이터를 검색 결과 형식으로 변환
        const kokResults = (response.products || []).map(product => {
          console.log('콕 상품 원본 데이터:', product);
          console.log('콕 상품 이미지:', product.kok_thumbnail);
          
          return {
            id: product.kok_product_id,
            title: product.kok_product_name,
            description: `콕 쇼핑몰에서 판매 중인 상품`,
            price: `${product.kok_discounted_price?.toLocaleString() || '0'}원`,
            originalPrice: `${product.kok_product_price?.toLocaleString() || '0'}원`,
            discount: `${product.kok_discount_rate || 0}%`,
            image: product.kok_thumbnail || 'https://via.placeholder.com/300x300/CCCCCC/666666?text=No+Image',
            category: '콕 상품',
            rating: product.kok_review_score || 4.5,
            reviewCount: product.kok_review_cnt || 128,
            storeName: product.kok_store_name || 'COK 스토어',
            shipping: '무료배송'
          };
        });
        
        // 중복 제거 (id 기준)
        const uniqueKokResults = kokResults.filter((product, index, self) => 
          index === self.findIndex(p => p.id === product.id)
        );
        
                 console.log('콕 검색 결과:', uniqueKokResults.length, '개 상품 (중복 제거 후)');
         if (isMounted) {
           setSearchResults(uniqueKokResults);
         }
        
        // 검색 결과를 sessionStorage에 저장
        const searchStateKey = `kok_search_${query}`;
        sessionStorage.setItem(searchStateKey, JSON.stringify({
          results: uniqueKokResults,
          timestamp: Date.now()
        }));
      } catch (error) {
        console.error('콕 상품 검색 실패:', error);
        
        if (error.response?.status === 500) {
          setError('서버에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요.');
        } else if (error.response?.status === 404) {
          setError('검색 서비스를 찾을 수 없습니다.');
        } else {
          setError('콕 상품 검색 중 오류가 발생했습니다.');
        }
      }
      
             if (isMounted) {
         setLoading(false);
       }
       
     } catch (err) {
       console.error('콕 검색 실패:', err);
       if (isMounted) {
         setError('콕 검색 중 오류가 발생했습니다.');
         setLoading(false);
       }
     }
  }, [loading, navigate, isLoggedIn, user?.token]);



  // 콕 검색 실행 함수
  const handleSearch = useCallback(async (e = null, queryOverride = null) => {
    console.log('🔍 콕 검색 실행 함수 호출:', { e, queryOverride, searchQuery });
    
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
      console.log('🔍 검색어가 없어서 콕 검색 중단');
      return;
    }

    // 새로운 검색어인 경우 로그 출력
    if (currentQueryRef.current !== query) {
      console.log('🔍 새로운 검색어로 검색 시작:', query);
    }

    // executeSearch 함수 호출
    executeSearch(query);
  }, [searchQuery, executeSearch]);

  // 뒤로가기 핸들러
  const handleBack = () => {
    navigate(-1);
  };

  // 콕 상품 클릭 핸들러
  const handleProductClick = (product) => {
    console.log('콕 상품 클릭:', product);
    // 콕 상품 상세 페이지로 이동 (검색 정보를 state로 전달)
    navigate(`/kok/product/${product.id}`, {
      state: {
        from: 'search',
        searchQuery: searchQuery,
        backUrl: `/kok/search?q=${encodeURIComponent(searchQuery)}`
      }
    });
  };

  // 검색 히스토리 클릭 핸들러
  const handleHistoryClick = (query) => {
    // 이미 같은 검색어로 검색 중이거나 결과가 있는 경우 중복 실행 방지
    if (currentQueryRef.current === query && searchResults.length > 0) {
      console.log('🔍 이미 실행된 검색어입니다. 히스토리 클릭 중복 실행 방지:', query);
      return;
    }
    
    setSearchQuery(query);
    handleSearch(null, query);
  };

  // 콕 검색 히스토리 삭제 핸들러 (API 사용)
  const handleDeleteHistory = async (queryToDelete) => {
    try {
      if (isLoggedIn && user?.token) {
                 // 로그인된 사용자는 서버에서 콕 검색어 삭제
         const response = await kokApi.getSearchHistory(50, user.token);
        const history = response.history || [];
        const targetHistory = history.find(item => item.kok_keyword === queryToDelete);
        
        if (targetHistory) {
          await kokApi.deleteSearchHistory(targetHistory.kok_history_id, user.token);
        }
        // 삭제 후 히스토리 다시 로드
        await loadSearchHistory();
      } else {
        // 비로그인 사용자는 로컬스토리지에서 삭제
        const history = JSON.parse(localStorage.getItem('kok_searchHistory') || '[]');
        const updatedHistory = history.filter(item => item !== queryToDelete);
        localStorage.setItem('kok_searchHistory', JSON.stringify(updatedHistory));
        setSearchHistory(updatedHistory.slice(0, 10));
      }
    } catch (error) {
      console.error('콕 검색 히스토리 삭제 실패:', error);
      // API 실패 시 로컬스토리지에서 삭제
      try {
        const history = JSON.parse(localStorage.getItem('kok_searchHistory') || '[]');
        const updatedHistory = history.filter(item => item !== queryToDelete);
        localStorage.setItem('kok_searchHistory', JSON.stringify(updatedHistory));
        setSearchHistory(updatedHistory.slice(0, 10));
      } catch (localError) {
        console.error('로컬스토리지 콕 검색 히스토리 삭제 실패:', localError);
      }
    }
  };

  // 콕 검색 히스토리 전체 삭제 핸들러 (API 사용)
  const handleClearAllHistory = async () => {
    try {
      if (isLoggedIn && user?.token) {
        // 로그인된 사용자는 서버에서 모든 콕 검색어 삭제
                 // 백엔드 제한을 고려하여 더 큰 숫자로 히스토리를 가져옴
         const response = await kokApi.getSearchHistory(50, user.token);
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
            await kokApi.deleteSearchHistory(item.kok_history_id, user.token);
            console.log(`✅ 검색어 삭제 성공: ${item.kok_keyword} (ID: ${item.kok_history_id})`);
            return { success: true, id: item.kok_history_id };
          } catch (error) {
            console.error(`❌ 검색어 삭제 실패 (ID: ${item.kok_history_id}):`, error);
            return { success: false, id: item.kok_history_id, error };
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
        const history = JSON.parse(localStorage.getItem('kok_searchHistory') || '[]');
        localStorage.removeItem('kok_searchHistory');
        setSearchHistory([]);
        console.log(`로컬 검색 히스토리 ${history.length}개 삭제 완료`);
        alert(`검색 히스토리 ${history.length}개가 삭제되었습니다.`);
      }
    } catch (error) {
      console.error('콕 검색 히스토리 전체 삭제 실패:', error);
      // API 실패 시 로컬스토리지에서 삭제
      const history = JSON.parse(localStorage.getItem('kok_searchHistory') || '[]');
      localStorage.removeItem('kok_searchHistory');
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
                navigate(`/kok/search?q=${encodeURIComponent(query.trim())}`);
              }
            }}
            placeholder="콕 상품 검색"
          />
        </div>
        <div className="search-content">
          <Loading message="콕 검색 페이지를 불러오는 중..." />
        </div>
        <BottomNav />
      </div>
    );
  }

  // 콕 검색 페이지 렌더링
  return (
    <div className="search-page">
             {/* 콕 검색 헤더 */}
       <div className="search-header">
         <HeaderNavBackBtn onClick={handleBack} />
         
         <HeaderSearchBar 
           onSearch={(query) => {
             console.log('🔍 HeaderSearchBar에서 콕 검색:', query);
             if (query && query.trim()) {
               navigate(`/kok/search?q=${encodeURIComponent(query.trim())}`);
             }
           }}
           placeholder="콕 상품 검색"
         />
       </div>

             {/* 메인 콘텐츠 */}
       <div className="search-content">
         {/* 검색 타입 전환 버튼 */}
         <div className="search-type-switch">
           <button 
             className="switch-btn"
             onClick={() => {
               console.log('🔍 홈쇼핑 검색으로 전환');
               navigate('/homeshopping/search');
             }}
           >
             홈쇼핑
           </button>
           <button 
             className="switch-btn active"
             onClick={() => {
               console.log('🔍 콕 검색 유지');
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
            <Loading message={`"${searchQuery}" 콕 검색 중...`} />
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
                  key={`kok-${result.id}-${index}`} 
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
                    
                    {/* 콕 추가 정보 표시 */}
                    <div className="kok-info">
                      {result.storeName && <span className="store-name">🏪 {result.storeName}</span>}
                      {result.shipping && <span className="shipping">🚚 {result.shipping}</span>}
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
            <p>"{searchQuery}"에 대한 콕 검색 결과를 찾을 수 없습니다.</p>
          </div>
        )}
      </div>

      {/* 하단 네비게이션 */}
      <BottomNav />
    </div>
  );
};

// KokSearch 컴포넌트를 기본 내보내기로 설정합니다
export default KokSearch;
