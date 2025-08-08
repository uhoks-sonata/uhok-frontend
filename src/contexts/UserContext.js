import React, { createContext, useContext, useState, useEffect } from 'react';

// 사용자 Context 생성
const UserContext = createContext();

// 토큰 유효성 검사 함수
const validateToken = (token) => {
  if (!token) return false;
  
  // 개발용 토큰인지 먼저 확인
  if (token.includes('dev_signature_') || token.startsWith('temp_token_')) {
    console.log('개발용 토큰 감지, 검증 성공');
    return true;
  }
  
  try {
    // JWT 형식 검사 (header.payload.signature)
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.log('토큰 형식이 올바르지 않습니다 (3개 부분이 아님)');
      return false;
    }
    
    // payload 디코딩 시도
    const payload = JSON.parse(atob(parts[1]));
    
    // 만료 시간 검사
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      console.log('토큰이 만료되었습니다.');
      return false;
    }
    
    console.log('토큰 검증 성공:', { sub: payload.sub, exp: payload.exp });
    return true;
  } catch (error) {
    console.log('토큰 형식이 올바르지 않습니다:', error.message);
    return false;
  }
};

// 사용자 정보 Provider 컴포넌트
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // 컴포넌트 마운트 시 로컬 스토리지에서 사용자 정보 복원
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const tokenType = localStorage.getItem('token_type');
    
    console.log('UserContext - 초기화 중:', { 
      hasToken: !!token, 
      tokenType,
      tokenLength: token?.length 
    });
    
    if (token) {
      // 토큰이 있으면 검증 시도
      const isValid = validateToken(token);
      
      if (isValid) {
        // 토큰이 유효하면 사용자 정보 설정
        setUser({
          token,
          tokenType,
          isLoggedIn: true,
          email: 'dev_user@example.com' // 기본 이메일 설정
        });
        console.log('UserContext - 로컬 스토리지에서 사용자 정보 복원 성공');
      } else {
        console.log('UserContext - 유효하지 않은 토큰 제거');
        localStorage.removeItem('access_token');
        localStorage.removeItem('token_type');
      }
    } else {
      console.log('UserContext - 로컬 스토리지에 토큰이 없습니다.');
    }
    
    setIsLoading(false);
  }, []);

  // 로그인 함수
  const login = (userData) => {
    console.log('UserContext - 로그인 함수 호출:', userData);
    
    // 토큰을 로컬 스토리지에 저장
    if (userData.token) {
      localStorage.setItem('access_token', userData.token);
      localStorage.setItem('token_type', userData.tokenType || 'bearer');
    }
    
    setUser({
      ...userData,
      isLoggedIn: true
    });
    
    console.log('UserContext - 사용자 정보 설정 완료:', {
      hasToken: !!userData.token,
      email: userData.email,
      isLoggedIn: true
    });
  };

  // 로그아웃 함수
  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('token_type');
    setUser(null);
    console.log('UserContext - 로그아웃 완료');
  };

  // 토큰 업데이트 함수
  const updateToken = (token, tokenType) => {
    if (token) {
      localStorage.setItem('access_token', token);
      localStorage.setItem('token_type', tokenType || 'bearer');
    }
    
    setUser(prev => ({
      ...prev,
      token,
      tokenType: tokenType || 'bearer'
    }));
  };

  const value = {
    user,
    isLoading,
    login,
    logout,
    updateToken,
    isLoggedIn: !!user && !!user.isLoggedIn
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

// 사용자 Context 사용을 위한 Hook
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export default UserContext;
